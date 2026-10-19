import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import * as C from '../core.mjs';
import {CloudSync} from '../cloud.mjs';
import {buildPreview} from '../scripts/build-preview.mjs';
import previewWorker from '../scripts/preview-config-worker.mjs';
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

test('test-cloud runtime config reaches the Worker behind asset-first hosting without archiving credentials',async()=>{
 const output=await fs.mkdtemp(path.join(os.tmpdir(),'menei-test-cloud-package-'));
 try{
  // Reusing an output directory must not preserve the former shadowing asset.
  await fs.writeFile(path.join(output,'config.json'),'{"stale":true}');
  await buildPreview(output,{mode:'test-cloud'});
  const html=await fs.readFile(path.join(output,'index.html'),'utf8');
  assert.match(html,/data-preview="test-cloud" data-test-project="bhyrrxrpqaxiwpfxnwpa"/);
  assert.match(html,/connect-src 'self' https:\/\/bhyrrxrpqaxiwpfxnwpa\.supabase\.co;/);
  assert.doesNotMatch(html,/tdmwpcueqxtnqyonucam/);
  await assert.rejects(fs.access(path.join(output,'config.json')));
  await assert.rejects(fs.access(path.join(output,'api','preview-config')));
  const sw=await fs.readFile(path.join(output,'sw.js'),'utf8'),shell=sw.match(/const SHELL=(\[[\s\S]*?\]);/)?.[1];
  assert.ok(shell);assert.doesNotMatch(shell,/config\.json|api\/preview-config/);
  assert.match(await fs.readFile(path.join(output,'app.mjs'),'utf8'),/api\/preview-config/);
  assert.deepEqual(await fs.readFile(path.join(output,'media-manifest.json')),await fs.readFile(new URL('../media-manifest.json',import.meta.url)));
  assert.deepEqual(await fs.readFile(path.join(output,'setup.html')),await fs.readFile(path.join(output,'preview-guide.html')));
  const guide=await fs.readFile(path.join(output,'preview-guide.html'),'utf8');
  assert.match(guide,/Settings → Private beta cloud account/);assert.match(guide,/Scheduled push is disabled/);

  const runtimeKey='sb_publishable_synthetic_runtime_only';let workerCalls=0;
  const assets={async fetch(request){
   const relative=new URL(request.url).pathname.slice(1)||'index.html',file=path.resolve(output,relative);
   assert.ok(file.startsWith(output+path.sep));
   try{return new Response(await fs.readFile(file))}
   catch(error){if(error.code==='ENOENT')return new Response('Not found',{status:404});throw error}
  }};
  const nativeAssetFirst=async request=>{
   const asset=await assets.fetch(request);
   if(asset.status!==404)return asset;
   workerCalls++;return previewWorker.fetch(request,{ASSETS:assets,MENEI_TEST_PUBLISHABLE_KEY:runtimeKey,SUPABASE_URL:'https://must-not-use-live.invalid'});
  };
  assert.equal(await (await nativeAssetFirst(new Request('https://private.example/'))).text(),html);
  assert.equal(workerCalls,0,'Existing static assets should bypass the Worker in this hosting simulation');
  const response=await nativeAssetFirst(new Request('https://private.example/api/preview-config',{headers:{'oai-authenticated-user-id':'synthetic-owner'}}));
  assert.equal(workerCalls,1,'The runtime endpoint must remain reachable even when static assets take precedence');
  assert.equal(response.status,200);assert.match(response.headers.get('Cache-Control'),/no-store/);
  const config=await response.json();
  assert.equal(config.supabase.url,'https://bhyrrxrpqaxiwpfxnwpa.supabase.co');assert.equal(config.supabase.key,runtimeKey);assert.equal(config.pushServiceReady,false);
  assert.equal(config.preview.projectRef,'bhyrrxrpqaxiwpfxnwpa');assert.doesNotMatch(JSON.stringify(config),/must-not-use-live/);

  async function filesIn(directory){const files=[];for(const entry of await fs.readdir(directory,{withFileTypes:true})){
   const file=path.join(directory,entry.name);files.push(...(entry.isDirectory()?await filesIn(file):[file]));
  }return files}
  let preservedAssets=0;
  for(const file of await filesIn(output)){
   const bytes=await fs.readFile(file),relative=path.relative(output,file);
   assert.equal(bytes.includes(Buffer.from(runtimeKey)),false,relative+' must not archive the runtime key');
   if(/\.(svg|png|jpe?g|webp|ttf|woff2?)$/i.test(relative)){
    assert.deepEqual(bytes,await fs.readFile(new URL('../'+relative,import.meta.url)),relative+' original bytes must be preserved');preservedAssets++;
   }
  }
  assert.ok(preservedAssets>100,'The preservation check must include the original image and font collection');
 }finally{await fs.rm(output,{recursive:true,force:true})}
});
