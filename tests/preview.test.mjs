import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import * as C from '../core.mjs';
import {CloudSync} from '../cloud.mjs';
import {buildPreview} from '../scripts/build-preview.mjs';
import {createPreviewWorker} from '../scripts/preview-config-worker.mjs';
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
  await fs.writeFile(path.join(output,'beta-report.html'),'Superseded owner report must not survive a rebuild.');
  const build=await buildPreview(output);
  const html=await fs.readFile(path.join(output,'index.html'),'utf8');
  assert.match(html,/data-preview="local"/);assert.match(html,/connect-src 'self'/);
  assert.ok(html.includes('data-preview-revision="'+build.source_commit.slice(0,12)+'"'));
  assert.match(html,/Private preview/);
  const config=JSON.parse(await fs.readFile(path.join(output,'config.json'),'utf8'));
  assert.equal(config.supabase,undefined);assert.equal(config.vapidPublicKey,undefined);assert.equal(config.pushServiceReady,false);
  assert.deepEqual(await fs.readFile(path.join(output,'media-manifest.json')),await fs.readFile(new URL('../media-manifest.json',import.meta.url)));
  const manifest=JSON.parse(await fs.readFile(path.join(output,'manifest.webmanifest'),'utf8'));
  assert.equal(manifest.id,'./');assert.equal(manifest.scope,'./');assert.equal(manifest.name,'MENEI Private Preview');
  for(const n of ['.git','.env','supabase','docs','tests','AGENTS.md','beta-report.html'])await assert.rejects(fs.access(path.join(output,n)));
  const guide=await fs.readFile(path.join(output,'preview-guide.html'),'utf8');
  assert.match(guide,/device-only workspace/);assert.doesNotMatch(guide,/first 20|100 attempts|Join the limited beta/);
  const release=JSON.parse(await fs.readFile(path.join(output,'release.json'),'utf8'));
  assert.equal(release.target,'owner-private-sites');assert.equal(release.source_commit,build.source_commit);
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

test('test-cloud package explains capped enrollment and runtime config has no static shadow or archived credentials',async()=>{
 const output=await fs.mkdtemp(path.join(os.tmpdir(),'menei-test-cloud-package-'));
 try{
  // Reusing an output directory must not preserve the former shadowing asset.
  await fs.writeFile(path.join(output,'config.json'),'{"stale":true}');
  await fs.writeFile(path.join(output,'beta-report.html'),'Superseded owner-only report');
  await buildPreview(output,{mode:'test-cloud'});
  const html=await fs.readFile(path.join(output,'index.html'),'utf8');
  assert.match(html,/data-preview="test-cloud" data-test-project="bhyrrxrpqaxiwpfxnwpa"/);
  assert.match(html,/connect-src 'self' https:\/\/bhyrrxrpqaxiwpfxnwpa\.supabase\.co;/);
  assert.doesNotMatch(html,/tdmwpcueqxtnqyonucam/);
  await assert.rejects(fs.access(path.join(output,'config.json')));
  await assert.rejects(fs.access(path.join(output,'beta-report.html')));
  await assert.rejects(fs.access(path.join(output,'api','preview-config')));
  const sw=await fs.readFile(path.join(output,'sw.js'),'utf8'),shell=sw.match(/const SHELL=(\[[\s\S]*?\]);/)?.[1];
  assert.ok(shell);assert.doesNotMatch(shell,/config\.json|api\/preview-config/);
  assert.match(await fs.readFile(path.join(output,'app.mjs'),'utf8'),/api\/preview-config/);
  assert.deepEqual(await fs.readFile(path.join(output,'media-manifest.json')),await fs.readFile(new URL('../media-manifest.json',import.meta.url)));
  assert.deepEqual(await fs.readFile(path.join(output,'setup.html')),await fs.readFile(path.join(output,'preview-guide.html')));
  const guide=await fs.readFile(path.join(output,'preview-guide.html'),'utf8');
  assert.match(guide,/MENEI sign-in screen/);assert.match(guide,/Scheduled push is disabled/);
  assert.match(guide,/first 20 confirmed MENEI test accounts can join, including the owner/);
  assert.match(guide,/href="\/beta"/);assert.doesNotMatch(guide,/href="\/signin-with-chatgpt/);assert.match(guide,/No ChatGPT account, separate AI account, personal API key or extra download is required/);
  assert.match(guide,/your place and AI allowance stay with your MENEI account/);
  assert.match(guide,/no email waitlist and no contact details are collected/);
  assert.match(guide,/Joining never imports another account’s history/);
  assert.match(guide,/your own synthetic test data/);assert.match(guide,/preloaded gyms and repeating gym schedule are templates/);
  assert.match(guide,/up to 5 research attempts/);assert.match(guide,/maximum of 100 attempts across the 20 beta accounts/);
  assert.match(guide,/Failed or timed-out attempts count/);assert.match(guide,/changing devices does not reset/);
  assert.match(guide,/separate browser profiles on shared devices/);assert.match(guide,/offline copy and saved entries can remain/);
  assert.match(guide,/Existing exercise images and their bindings remain preserved/);
  assert.doesNotMatch(guide,/<form\b|type="email"|mailto:/i);
  assert.equal(JSON.parse(await fs.readFile(path.join(output,'release.json'),'utf8')).target,'limited-beta-sites');

  const runtimeKey='sb_publishable_synthetic_runtime_only';let workerCalls=0;
  const previewWorker=createPreviewWorker({membership:async()=>({member:true,role:'member',enrolled:1,capacity:20,remainingSlots:19,bootstrapClosed:true})});
  const assets={async fetch(request){
   const relative=new URL(request.url).pathname.slice(1)||'index.html',file=path.resolve(output,relative);
   assert.ok(file.startsWith(output+path.sep));
   try{return new Response(await fs.readFile(file))}
   catch(error){if(error.code==='ENOENT')return new Response('Not found',{status:404});throw error}
  }};
  const nativeAssetFirst=async request=>{
   const asset=await assets.fetch(request);
   if(asset.status!==404)return asset;
   workerCalls++;return previewWorker.fetch(request,{ASSETS:assets,MENEI_TEST_PUBLISHABLE_KEY:runtimeKey,MENEI_BETA_PHASE:'open',SUPABASE_URL:'https://must-not-use-live.invalid'});
  };
  // This checks endpoint shadowing only. Enrollment protection for the full app
  // requires Worker-first hosting and is exercised by the Worker route tests.
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
