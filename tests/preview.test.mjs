import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import * as C from '../core.mjs';
import {CloudSync} from '../cloud.mjs';
import {buildPreview} from '../scripts/build-preview.mjs';
const memory=()=>{const rows=new Map();return {rows,getItem:k=>rows.get(k)??null,setItem:(k,v)=>rows.set(k,String(v)),removeItem:k=>rows.delete(k)}};

test('private preview ignores saved cloud credentials and cannot send cloud requests',async()=>{
 const storage=memory();storage.setItem('MGT_BETA_CLOUD_CONFIG',JSON.stringify({url:'https://example.supabase.co',key:'sb_publishable_test'}));storage.setItem('MGT_BETA_AUTH',JSON.stringify({access_token:'synthetic',user:{id:'test-account'}}));
 const before=[...storage.rows];let calls=0;
 const cloud=new CloudSync({storage,disabled:true,fetcher:async()=>{calls++;throw Error('must not request')},getState:()=>C.defaultState()});
 assert.equal(cloud.session,null);assert.equal(cloud.config,null);
 assert.throws(()=>cloud.configure('https://example.supabase.co','sb_publishable_test'),/disabled/);
 await assert.rejects(cloud.request('/auth/v1/token',{method:'POST',auth:false}),/disabled/);
 await assert.rejects(cloud.signIn('test@example.invalid','synthetic-password'),/disabled/);
 await assert.rejects(cloud.savePush({},{}),/disabled/);
 assert.equal(await cloud.acceptCallback(),false);cloud.start();cloud.schedule();await cloud.sync();
 assert.equal(cloud.interval,undefined);assert.equal(calls,0);assert.deepEqual([...storage.rows],before);
});

test('preview package excludes live configuration and retains exact image bindings',async()=>{
 const output=await fs.mkdtemp(path.join(os.tmpdir(),'menei-preview-test-'));
 try{
  await buildPreview(output);
  const html=await fs.readFile(path.join(output,'index.html'),'utf8');
  assert.match(html,/data-preview="local"/);assert.match(html,/connect-src 'self'/);
  assert.match(html,/Private preview/);
  const config=JSON.parse(await fs.readFile(path.join(output,'config.json'),'utf8'));
  assert.equal(config.supabase,undefined);assert.equal(config.vapidPublicKey,undefined);assert.equal(config.pushServiceReady,false);
  assert.deepEqual(await fs.readFile(path.join(output,'media-manifest.json')),await fs.readFile(new URL('../media-manifest.json',import.meta.url)));
  const manifest=JSON.parse(await fs.readFile(path.join(output,'manifest.webmanifest'),'utf8'));
  assert.equal(manifest.id,'./');assert.equal(manifest.scope,'./');assert.equal(manifest.name,'MENEI Private Preview');
  for(const n of ['.git','.env','supabase','docs','tests','AGENTS.md'])await assert.rejects(fs.access(path.join(output,n)));
  const sw=await fs.readFile(path.join(output,'sw.js'),'utf8');assert.match(sw,/menei-owner-preview-/);assert.match(sw,/preview-guide.html/);
 }finally{await fs.rm(output,{recursive:true,force:true})}
});

test('synthetic backup round trip retains zero loads, unknown set fields, meals and recovery copies',()=>{
 const storage=memory(),store=new C.LocalStore(storage);const original=store.load();
 const log=C.originalDay(original,'2026-10-01');log.status='completed';
 Object.assign(log.exercises[0].sets[0],{w:0,r:12,rir:0,done:true,futureAnnotation:{note:'retain this'}});
 original.logs[log.date]=log;original.meals['2026-10-01']={id:'2026-10-01',date:'2026-10-01',items:[{id:'meal-test',recipeSnapshot:{name:'Private synthetic meal',servings:1},eaten:true}]};
 store.save(original);store.snapshot();const exported=JSON.parse(JSON.stringify(store.state));
 const guest=C.defaultState();guest.ownerId=null;
 const result=C.importSnapshot(guest,{...exported,ownerId:'different-synthetic-account'}).state;
 assert.equal(result.ownerId,null);assert.deepEqual(result.logs,exported.logs);assert.deepEqual(result.meals,exported.meals);
 assert.deepEqual(JSON.parse(storage.getItem('MGT_BETA_SNAPSHOTS:guest'))[0].state.logs,exported.logs);
 assert.deepEqual(C.importSnapshot(result,exported).state.logs,result.logs);
});

test('test-cloud package pins its network policy and contains no runtime credentials',async()=>{
 const output=await fs.mkdtemp(path.join(os.tmpdir(),'menei-test-cloud-package-'));
 try{
  await buildPreview(output,{mode:'test-cloud'});
  const html=await fs.readFile(path.join(output,'index.html'),'utf8');
  assert.match(html,/data-preview="test-cloud" data-test-project="bhyrrxrpqaxiwpfxnwpa"/);
  assert.match(html,/connect-src 'self' https:\/\/bhyrrxrpqaxiwpfxnwpa\.supabase\.co;/);
  assert.doesNotMatch(html,/tdmwpcueqxtnqyonucam/);
  const config=JSON.parse(await fs.readFile(path.join(output,'config.json'),'utf8'));
  assert.deepEqual(config,{preview:{localOnly:false,projectRef:'bhyrrxrpqaxiwpfxnwpa'},pushServiceReady:false});
  assert.deepEqual(await fs.readFile(path.join(output,'media-manifest.json')),await fs.readFile(new URL('../media-manifest.json',import.meta.url)));
  assert.deepEqual(await fs.readFile(path.join(output,'setup.html')),await fs.readFile(path.join(output,'preview-guide.html')));
  const guide=await fs.readFile(path.join(output,'preview-guide.html'),'utf8');
  assert.match(guide,/Settings → Private beta cloud account/);assert.match(guide,/Scheduled push is disabled/);
 }finally{await fs.rm(output,{recursive:true,force:true})}
});
