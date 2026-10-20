import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {DatabaseSync} from 'node:sqlite';
import {createPreviewWorker} from '../scripts/preview-config-worker.mjs';
import {readBetaStatus,readBetaQuota} from '../server/beta-membership-budget.mjs';

const origin='https://synthetic.example';
const query={name:'Synthetic Fitness',location:'Example City',address:''};
const headers=id=>id?{'oai-authenticated-user-id':id}:{};
function req(path='/',{id='owner',method='GET',body,extra={}}={}){
 return new Request(origin+path,{method,headers:{...headers(id),...(method==='POST'?{origin,'sec-fetch-site':'same-origin','content-type':'application/json'}:{}),...extra},...(body===undefined?{}:{body})});
}
async function setup(){
 const db=new DatabaseSync(':memory:');
 const journal=JSON.parse(await fs.readFile(new URL('../drizzle/meta/_journal.json',import.meta.url),'utf8'));
 for(const entry of journal.entries)db.exec(await fs.readFile(new URL('../drizzle/'+entry.tag+'.sql',import.meta.url),'utf8'));
 const binding={prepare(sql){const make=(values=[])=>({bind(...args){return make(args)},async first(){return db.prepare(sql).get(...values)||null},async all(){return {success:true,results:db.prepare(sql).all(...values)}},async run(){const result=db.prepare(sql).run(...values);return {success:true,meta:{changes:Number(result.changes)}}}});return make()}};
 let assets=0,outbound=0,clock=1_800_000_000_000;
 const worker=createPreviewWorker({now:()=>new Date(clock),research:async()=>{outbound++;return {locations:[],checked:'2026-10-20',notice:'Synthetic response'}}});
 const env={MENEI_BETA_PHASE:'bootstrap',MENEI_BETA_OWNER_PRIVATE:'true',MENEI_TEST_PUBLISHABLE_KEY:'sb_publishable_synthetic',GYM_AI_LIMITS:binding,MENEI_GYM_AI_ENABLED:'true',OPENAI_API_KEY:'sk-syntheticpreviewkey',ASSETS:{fetch:async()=>{assets++;return new Response('synthetic protected bytes',{headers:{'Cache-Control':'public, max-age=3600'}})}}};
 return {db,binding,worker,env,get assets(){return assets},get outbound(){return outbound},advance(){clock+=10_001},close(){db.close()}};
}
const join=(t,id='owner',extra={})=>t.worker.fetch(req('/api/beta-join',{id,method:'POST',body:'{}',extra}),t.env);

test('all protected routes fail closed without an explicit safe phase, identity or membership',async()=>{
 const t=await setup();try{
  for(const phase of [undefined,'off','opne','OPEN','bootstrap']){
   const result=await t.worker.fetch(req('/media/original.webp'),{...t.env,MENEI_BETA_PHASE:phase,MENEI_BETA_OWNER_PRIVATE:'false'});
   assert.equal(result.status,503);
  }
  for(const path of ['/','/index.html','/app.mjs','/sw.js','/media/original.webp','/api/preview-config','/api/gym-research-status','/api/unknown']){
   assert.equal((await t.worker.fetch(req(path,{id:null}),t.env)).status,401,path);
   assert.equal((await t.worker.fetch(req(path),t.env)).status,403,path);
  }
  assert.equal(t.assets,0);assert.equal(t.outbound,0);assert.equal((await readBetaStatus(t.binding)).enrolled,0);
 }finally{t.close()}
});

test('landing and health GETs claim no seats; enrollment rejects CSRF, caller identities and large bodies',async()=>{
 const t=await setup();try{
  const anonymous=await t.worker.fetch(req('/beta',{id:null}),t.env),html=await anonymous.text();
  assert.equal(anonymous.status,200);assert.match(html,/signin-with-chatgpt\?return_to=%2Fbeta/);assert.match(html,/target="_top"/);assert.doesNotMatch(html,/<form/);
  const ownerPage=await t.worker.fetch(req('/beta'),t.env);assert.match(await ownerPage.text(),/Reserve owner beta place/);
  const serviceStatus=await t.worker.fetch(req('/api/beta-status',{id:null}),t.env);assert.equal(serviceStatus.status,200);assert.equal((await serviceStatus.json()).storageReady,true);
  assert.equal((await readBetaStatus(t.binding)).enrolled,0);
  for(const extra of [{origin:'https://other.example'},{origin:''},{'sec-fetch-site':'cross-site'}])assert.equal((await join(t,'owner',extra)).status,403);
  for(const body of ['{"siteUserId":"chosen-owner"}','[]','x'.repeat(129)])assert.equal((await t.worker.fetch(req('/api/beta-join',{method:'POST',body}),t.env)).status,400);
  assert.equal((await join(t,null)).status,401);
  assert.equal((await t.worker.fetch(req('/api/beta-join'),t.env)).status,405);
  assert.equal((await readBetaStatus(t.binding)).enrolled,0);assert.equal(t.outbound,0);
 }finally{t.close()}
});

test('owner bootstrap is durable; first twenty accounts join and the next gets a full message without protected assets',async()=>{
 const t=await setup();try{
  assert.equal((await join(t)).status,200);assert.equal((await join(t)).status,200);
  assert.equal((await readBetaStatus(t.binding)).enrolled,1);
  assert.equal((await join(t,'not-the-owner')).status,503);
  t.env.MENEI_BETA_PHASE='open';t.env.MENEI_BETA_OWNER_PRIVATE='false';
  const joined=await Promise.all(Array.from({length:20},(_,i)=>join(t,'tester-'+i)));
  assert.equal(joined.filter(r=>r.status===200).length,19);assert.equal(joined.filter(r=>r.status===403).length,1);
  assert.equal((await readBetaStatus(t.binding)).enrolled,20);
  const full=await t.worker.fetch(req('/beta',{id:'tester-20'}),t.env);assert.match(await full.text(),/The beta is full/);
  assert.equal((await t.worker.fetch(req('/api/beta-status',{id:null}),t.env)).status,401);
  assert.equal((await t.worker.fetch(req('/media/original.webp',{id:'tester-20'}),t.env)).status,403);
  assert.equal(t.assets,0);assert.equal((await join(t,'tester-0')).status,200);assert.equal((await readBetaStatus(t.binding)).enrolled,20);
  const asset=await t.worker.fetch(req('/media/original.webp',{id:'tester-0'}),t.env);assert.equal(await asset.text(),'synthetic protected bytes');assert.equal(asset.headers.get('cache-control'),'private, no-store');
 }finally{t.close()}
});

test('configuration exposes only the fixed test backend and a stable member context; each account gets five attempts',async()=>{
 const t=await setup();try{
  await join(t);t.env.MENEI_BETA_PHASE='open';t.env.MENEI_BETA_OWNER_PRIVATE='false';await join(t,'tester-a');
  const configA=await (await t.worker.fetch(req('/api/preview-config',{id:'tester-a'}),t.env)).json();
  const configB=await (await t.worker.fetch(req('/api/preview-config'),t.env)).json();
  assert.equal(configA.supabase.url,'https://bhyrrxrpqaxiwpfxnwpa.supabase.co');assert.equal(configA.pushServiceReady,false);assert.equal(configA.gymResearchReady,true);
  assert.match(configA.betaAccountContext,/^[a-f0-9]{64}$/);assert.notEqual(configA.betaAccountContext,configB.betaAccountContext);assert.equal(configA.betaMemberRole,'member');assert.equal(configB.betaMemberRole,'owner');
  assert.doesNotMatch(JSON.stringify(configA),/tester-a|sk-syntheticpreviewkey|OPENAI_API_KEY|GYM_AI_LIMITS/);
  for(let n=1;n<=6;n++){
   const result=await t.worker.fetch(req('/api/gym-research',{id:'tester-a',method:'POST',body:JSON.stringify(query)}),t.env);
   assert.equal(result.status,n<=5?200:429);t.advance();
  }
  assert.equal(t.outbound,5);assert.equal((await readBetaQuota(t.binding,'tester-a')).used,5);assert.equal((await readBetaQuota(t.binding,'owner')).used,0);
  assert.equal((await t.worker.fetch(req('/api/gym-research',{id:'not-enrolled',method:'POST',body:JSON.stringify(query)}),t.env)).status,403);assert.equal(t.outbound,5);
 }finally{t.close()}
});

test('missing or partially migrated hosted storage cannot admit people or serve protected bytes',async()=>{
 const t=await setup();try{
  const env={...t.env,GYM_AI_LIMITS:{prepare(){throw Error('internal binding details')}}};
  for(const path of ['/beta','/api/beta-status','/api/beta-join','/','/app.mjs','/api/preview-config']){
   const result=await t.worker.fetch(req(path,{method:path==='/api/beta-join'?'POST':'GET',body:path==='/api/beta-join'?'{}':undefined}),env);
   assert.equal(result.status,503,path);assert.doesNotMatch(await result.text(),/internal binding details|sk-syntheticpreviewkey/);
  }
  assert.equal(t.assets,0);assert.equal(t.outbound,0);
 }finally{t.close()}
});
