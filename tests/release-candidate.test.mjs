import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import {pathToFileURL} from 'node:url';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const exec=promisify(execFile);
import {createHash} from 'node:crypto';
import * as sourceCore from '../core.mjs';
import {buildReleaseCandidate,CANDIDATE_VERSION,PRESERVATION_BASE} from '../scripts/build-release-candidate.mjs';
const root=new URL('../',import.meta.url),app='https://412doubleb.github.io/Muscle-Growth-Tracker/';
const digest=b=>createHash('sha256').update(b).digest('hex');
test('unpublished candidate preserves live identities, protected assets, saved data and coherent update/offline versions',async()=>{
 const output=await fs.mkdtemp(path.join(os.tmpdir(),'menei-release-candidate-'));
 try{
  const built=await buildReleaseCandidate(output),site=built.site,receipt=JSON.parse(await fs.readFile(path.join(output,'RELEASE_MANIFEST.json')));
  assert.equal(built.version,'8.2.0');assert.equal(built.deploymentReady,false);assert.equal(receipt.deploymentReady,false);assert.equal(receipt.appUrl,app);assert.equal(receipt.protectedAssets,124);assert.equal(receipt.rollback.automaticDowngradeAllowed,false);
  assert.equal(digest(await fs.readFile(built.archive.path)),built.archive.sha256);
  for(const file of receipt.files){const bytes=await fs.readFile(path.join(site,file.path));assert.equal(digest(bytes),file.sha256,file.path);assert.doesNotMatch(file.path,/(^|\/)(?:\.env|\.git|docs|tests|scripts|server|supabase|beta-report|preview-guide|preview-build)/);if(/\.(?:svg|png|jpe?g|webp|ttf|woff2?)$/.test(file.path)){assert.equal(file.sha256,file.sourceSha256,file.path);assert.equal(file.changed,false)}}
  for(const file of ['config.json','manifest.webmanifest','media-manifest.json'])assert.deepEqual(await fs.readFile(path.join(site,file)),await fs.readFile(new URL(file,root)));
  const html=await fs.readFile(path.join(site,'index.html'),'utf8'),release=JSON.parse(await fs.readFile(path.join(site,'release.json')));
  assert.doesNotMatch(html,/data-preview|data-test-project|data-beta-admission/);assert.match(html,/app\.mjs\?v=8\.2\.0/);assert.equal(release.channel,'release-candidate');assert.equal(release.source_commit,built.sourceCommit);assert.equal(release.app_url,app);
  const manifest=JSON.parse(await fs.readFile(path.join(site,'manifest.webmanifest')));for(const k of ['id','start_url','scope'])assert.equal(new URL(manifest[k],app).href,app);
  for(const file of receipt.files.filter(f=>/\.(?:js|mjs)$/.test(f.path))){const code=await fs.readFile(path.join(site,file.path),'utf8');for(const m of code.matchAll(/from\s+['"](\.\/[^'"]+)['"]/g)){if(!file.path.startsWith('vendor/'))assert.match(m[1],/\?v=8\.2\.0$/);await fs.access(path.resolve(path.dirname(path.join(site,file.path)),m[1].split('?')[0]))}}
  assert.match(await fs.readFile(path.join(site,'app.mjs'),'utf8'),/MENEI account &amp; cloud sync/);assert.match(await fs.readFile(path.join(site,'setup.html'),'utf8'),/Settings → MENEI account &amp; cloud sync/);
  const C=await import(pathToFileURL(path.join(site,'core.mjs')).href);assert.equal(C.VERSION,CANDIDATE_VERSION);assert.equal((await import(pathToFileURL(path.join(site,'workout-voice.mjs')).href)).WORKOUT_VOICE_ENABLED,false);
  const state=sourceCore.defaultState(),date='2026-10-01';state.ownerId='synthetic-owner';state.logs[date]=sourceCore.originalDay(state,date);Object.assign(state.logs[date].exercises[0].sets[0],{w:0,r:12,rir:0,done:true,checkedAt:'2026-10-01T12:00:00Z',futureField:{retain:true}});
  const legacy='synthetic raw legacy bytes',rows=new Map([['MGT_BETA_V8:synthetic-owner',JSON.stringify(state)],['MGT28v6',legacy]]),storage={getItem:k=>rows.get(k)??null,setItem:(k,v)=>rows.set(k,String(v)),removeItem(){assert.fail('No account/history key may be removed')}};
  const store=new C.LocalStore(storage);assert.deepEqual(store.load('synthetic-owner'),state);store.snapshot();assert.deepEqual(C.readRecoverySnapshots(rows.get('MGT_BETA_SNAPSHOTS:synthetic-owner'))[0].state,state);assert.equal(rows.get('MGT28v6'),legacy);assert.equal(rows.get('MGT_BETA_V8:synthetic-owner'),JSON.stringify(state));
  // Execute the exact old reader to establish the downgrade limitation with
  // synthetic records. Do not run the original application against user data.
  const old=(await exec('git',['show',PRESERVATION_BASE+':core.mjs'],{cwd:new URL('../',import.meta.url),encoding:'utf8'})).stdout.split('\n').find(line=>line.startsWith('export class LocalStore'));
  const OldStore=vm.runInNewContext(old.replace('export class','class')+';LocalStore',{clone:C.clone,now:C.now,validateState:C.validateState,defaultState:C.defaultState});
  const oldStore=new OldStore(storage);oldStore.load('synthetic-owner');const recoveryBefore=rows.get('MGT_BETA_SNAPSHOTS:synthetic-owner');assert.throws(()=>oldStore.snapshot(),/unshift/);assert.equal(rows.get('MGT_BETA_SNAPSHOTS:synthetic-owner'),recoveryBefore);
  const handlers=new Map(),added=[],deleted=[];let claimed=false,opened;
  const self={location:{origin:new URL(app).origin,href:app+'sw.js'},registration:{scope:app},addEventListener:(k,f)=>handlers.set(k,f),clients:{claim:async()=>claimed=true,matchAll:async()=>[],openWindow:async url=>opened=url},skipWaiting(){}};
  vm.runInNewContext(await fs.readFile(path.join(site,'sw.js'),'utf8'),{self,caches:{open:async()=>({addAll:async values=>added.push(...values)}),keys:async()=>['other-app','mgt-private-beta-8.1.1','mgt-private-beta-8.2.0'],delete:async k=>deleted.push(k)},URL,Request});
  let task;handlers.get('install')({waitUntil:p=>task=p});await task;assert.equal(added.length,55);assert.ok(added.every(r=>r.url.startsWith(app)&&r.cache==='reload'));assert.ok(added.some(r=>r.url===app+'core.mjs?v=8.2.0'));
  handlers.get('activate')({waitUntil:p=>task=p});await task;assert.deepEqual(deleted,['mgt-private-beta-8.1.1']);assert.equal(claimed,true);handlers.get('notificationclick')({notification:{data:{url:'./'},close(){}},waitUntil:p=>task=p});await task;assert.equal(opened,app);
  let click,replaced;vm.runInNewContext(await fs.readFile(path.join(site,'update-client.mjs'),'utf8'),{document:{getElementById:id=>id==='loadLatest'?{addEventListener:(n,fn)=>click=fn}:{}},navigator:{},location:{href:app+'update.html',replace:url=>replaced=url},URL});await click();assert.equal(new URL(replaced).searchParams.get('release'),'8.2.0');assert.equal(new URL(replaced).pathname,new URL(app).pathname);
  await assert.rejects(buildReleaseCandidate(output),/new empty/);
 }finally{await fs.rm(output,{recursive:true,force:true})}
});
