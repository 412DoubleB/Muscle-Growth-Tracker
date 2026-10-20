import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {DatabaseSync} from 'node:sqlite';
import {buildPreviewServer} from '../scripts/build-preview-server.mjs';
import {EQUIPMENT} from '../core.mjs';

test('Worker artifact preserves Site identity, keeps secrets outside the package and carries generated additive migration',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'menei-ai-build-'));
 try{
  await fs.mkdir(path.join(dir,'.openai'));await fs.writeFile(path.join(dir,'.openai/hosting.json'),JSON.stringify({project_id:'synthetic-site'}));
  await fs.writeFile(path.join(dir,'.env.local'),'OPENAI_API_KEY=sk-synthetic-local-only\n');
  const result=await buildPreviewServer(dir,{budget:true});assert.equal(result.project_id,'synthetic-site');assert.equal(result.budgetBinding,'GYM_AI_LIMITS');
  const built=await import(pathToFileURL(path.join(dir,'dist/server/index.js')));
  const response=await built.default.fetch(new Request('https://private.example/api/gym-research',{method:'POST',headers:{origin:'https://private.example','oai-authenticated-user-id':'synthetic-owner'}}),{MENEI_BETA_PHASE:'off',MENEI_BETA_OWNER_PRIVATE:'true'});
  assert.equal(response.status,503);assert.deepEqual(await response.json(),{error:'DISABLED'});
  const equipment=await import(pathToFileURL(path.join(dir,'dist/server/gym-equipment.mjs')));assert.deepEqual(equipment.EQUIPMENT,EQUIPMENT);
  const manifest=JSON.parse(await fs.readFile(path.join(dir,'dist/.openai/hosting.json'),'utf8'));assert.deepEqual(manifest,{project_id:'synthetic-site',d1:'GYM_AI_LIMITS'});
  const wrangler=JSON.parse(await fs.readFile(path.join(dir,'dist/server/wrangler.json'),'utf8'));assert.equal(wrangler.assets.binding,'ASSETS');assert.equal(wrangler.d1_databases,undefined);
  const migrations=path.join(dir,'dist/.openai/drizzle'),journal=JSON.parse(await fs.readFile(path.join(migrations,'meta/_journal.json'),'utf8'));
  assert.equal(journal.entries.length,2);const sql=await fs.readFile(path.join(migrations,journal.entries[0].tag+'.sql'),'utf8');
  assert.match(sql,/CREATE TABLE `menei_gym_ai_trials`/);assert.doesNotMatch(sql,/DROP|DELETE|TRUNCATE|INSERT/i);
  const db=new DatabaseSync(':memory:');db.exec('CREATE TABLE synthetic_history (id TEXT, load REAL); INSERT INTO synthetic_history VALUES (\'kept\',0)');db.exec(sql);
  assert.equal(db.prepare('SELECT count(*) AS n FROM menei_gym_ai_trials').get().n,0);assert.deepEqual({...db.prepare('SELECT * FROM synthetic_history').get()},{id:'kept',load:0});db.close();
  async function files(root){const out=[];for(const e of await fs.readdir(root,{withFileTypes:true})){const file=path.join(root,e.name);if(e.isDirectory())out.push(...await files(file));else out.push(file)}return out}
  for(const file of await files(path.join(dir,'dist'))){const text=await fs.readFile(file,'utf8');assert.doesNotMatch(text,/sk-synthetic-local-only/);assert.ok(!file.endsWith('.env.local'))}
 }finally{await fs.rm(dir,{recursive:true,force:true})}
});

test('building without budget approval leaves logical resources absent; existing unrelated bindings are protected',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'menei-ai-disabled-'));
 try{
  await fs.mkdir(path.join(dir,'.openai'));const file=path.join(dir,'.openai/hosting.json');await fs.writeFile(file,JSON.stringify({project_id:'synthetic-site'}));
  await buildPreviewServer(dir);assert.equal(JSON.parse(await fs.readFile(file,'utf8')).d1,undefined);
  await assert.rejects(fs.access(path.join(dir,'dist/.openai/drizzle')));
  await fs.writeFile(file,JSON.stringify({project_id:'synthetic-site',d1:'EXISTING_DB'}));await assert.rejects(buildPreviewServer(dir,{budget:true}),/repurpose/);
 }finally{await fs.rm(dir,{recursive:true,force:true})}
});
