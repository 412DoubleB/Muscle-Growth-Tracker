import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {DatabaseSync} from 'node:sqlite';
import {createPreviewWorker} from '../scripts/preview-config-worker.mjs';
import {readBetaStatus,readBetaQuota,enrollBetaMember} from '../server/beta-membership-budget.mjs';
import {AuthError} from '../server/menei-beta-auth.mjs';
const origin='https://synthetic.example',query={name:'Synthetic Fitness',location:'Example City',address:''};
function req(path='/',{id='owner',method='GET',body,extra={}}={}){return new Request(origin+path,{method,headers:{...(id?{authorization:'Bearer '+id}:{}),...(method==='POST'?{origin,'sec-fetch-site':'same-origin','content-type':'application/json'}:{}),...extra},...(body===undefined?{}:{body})})}
async function setup(){
 const db=new DatabaseSync(':memory:'),journal=JSON.parse(await fs.readFile(new URL('../drizzle/meta/_journal.json',import.meta.url),'utf8'));
 for(const entry of journal.entries)db.exec(await fs.readFile(new URL('../drizzle/'+entry.tag+'.sql',import.meta.url),'utf8'));
 const binding={prepare(sql){const make=(values=[])=>({bind(...args){return make(args)},async first(){return db.prepare(sql).get(...values)||null},async run(){const r=db.prepare(sql).run(...values);return {success:true,meta:{changes:Number(r.changes)}}}});return make()}};
 let assets=0,outbound=0,authCalls=0,clock=1_800_000_000_000;
 const worker=createPreviewWorker({now:()=>new Date(clock),authenticate:async request=>{authCalls++;const match=/^Bearer (owner|tester-\d+)$/.exec(request.headers.get('authorization')||'');if(!match)throw new AuthError('invalid_menei_account',401);return{id:match[1]}},research:async()=>{outbound++;return {locations:[],checked:'2026-10-20',notice:'Synthetic response'}}});
 const env={MENEI_BETA_PHASE:'bootstrap',MENEI_BETA_OWNER_PRIVATE:'true',MENEI_TEST_PUBLISHABLE_KEY:'sb_publishable_synthetic',GYM_AI_LIMITS:binding,MENEI_GYM_AI_ENABLED:'true',OPENAI_API_KEY:'sk-syntheticpreviewkey',ASSETS:{fetch:async request=>{assets++;return new Response(new URL(request.url).pathname==='/'||new URL(request.url).pathname==='/index.html'?'public MENEI sign-in shell':'public code bytes')}}};
 return {db,binding,worker,env,get assets(){return assets},get outbound(){return outbound},get authCalls(){return authCalls},advance(){clock+=10_001},close(){db.close()}};
}
const join=(t,id='owner',extra={})=>t.worker.fetch(req('/api/beta-join',{id,method:'POST',body:'{}',extra}),t.env);

test('MENEI sign-in shell and publishable config need no ChatGPT identity and never claim seats',async()=>{
 const t=await setup();try{
  for(const path of ['/','/beta']){const response=await t.worker.fetch(req(path,{id:null}),t.env);assert.equal(response.status,200);assert.equal(await response.text(),'public MENEI sign-in shell')}
  const config=await (await t.worker.fetch(req('/api/preview-config',{id:null}),t.env)).json();assert.equal(config.betaAdmissionRequired,true);assert.equal(config.betaStorageReady,true);assert.equal(config.betaPhase,'bootstrap');assert.equal(config.supabase.url,'https://bhyrrxrpqaxiwpfxnwpa.supabase.co');assert.equal(config.pushServiceReady,false);assert.equal(config.betaAccountContext,undefined);
  assert.doesNotMatch(JSON.stringify(config),/sk-syntheticpreviewkey|OPENAI_API_KEY|GYM_AI_LIMITS|owner/);assert.equal(t.authCalls,0);assert.equal((await readBetaStatus(t.binding)).enrolled,0);
 }finally{t.close()}
});
test('native Auth validation admits the owner using Worker-compatible fetch and real membership storage',async()=>{
 const t=await setup(),id='10000000-0000-4000-8000-000000000001',instant=1_800_000_000_000,issuer='https://bhyrrxrpqaxiwpfxnwpa.supabase.co/auth/v1';
 try{
  const claims={iss:issuer,sub:id,aud:'authenticated',role:'authenticated',is_anonymous:false,exp:Math.floor(instant/1000)+3600};
  const token=[Buffer.from('{"alg":"HS256"}').toString('base64url'),Buffer.from(JSON.stringify(claims)).toString('base64url'),'synthetic_signature'].join('.');
  let requests=0;const worker=createPreviewWorker({now:()=>new Date(instant),authFetcher:async(url,options)=>{
   if(options.redirect==='error')throw new TypeError('Workers does not implement redirect:error');
   assert.equal(options.redirect,'manual');assert.equal(url,issuer+'/user');assert.equal(options.headers.Authorization,'Bearer '+token);requests++;
   return Response.json({id,aud:'authenticated',role:'authenticated',is_anonymous:false,email_confirmed_at:'2026-10-19T00:00:00Z',identities:[{id:'synthetic-identity',user_id:id,provider:'email'}]});
  }});
  const response=await worker.fetch(req('/api/beta-join',{id:token,method:'POST',body:'{}'}),{...t.env,MENEI_TEST_PUBLISHABLE_KEY:'sb_publishable_synthetic_not_a_real_key',MENEI_GYM_AI_ENABLED:'false'});
  assert.equal(response.status,200);assert.deepEqual(await response.json(),{joined:true,role:'owner'});assert.equal(requests,1);assert.equal((await readBetaStatus(t.binding)).enrolled,1);assert.equal(t.outbound,0);
 }finally{t.close()}
});
test('protected services require a MENEI bearer token; forged Sites headers grant nothing; invalid phases fail closed',async()=>{
 const t=await setup();try{
  for(const path of ['/api/beta-status','/api/gym-research-status','/api/gym-research']){const options={id:null,extra:{'oai-authenticated-user-id':'owner'},...(path==='/api/gym-research'?{method:'POST',body:JSON.stringify(query)}:{})};assert.equal((await t.worker.fetch(req(path,options),t.env)).status,401)}
  for(const phase of [undefined,'off','opne','OPEN','bootstrap'])assert.equal((await t.worker.fetch(req('/api/beta-status'),{...t.env,MENEI_BETA_PHASE:phase,MENEI_BETA_OWNER_PRIVATE:'false'})).status,503);
  const status=await (await t.worker.fetch(req('/api/beta-status'),t.env)).json();assert.equal(status.member,false);assert.equal(status.enrolled,0);assert.equal(t.outbound,0);
 }finally{t.close()}
});
test('enrollment rejects CSRF, caller-selected identities and large bodies before admission',async()=>{
 const t=await setup();try{
  for(const extra of [{origin:'https://other.example'},{origin:''},{'sec-fetch-site':'cross-site'}])assert.equal((await join(t,'owner',extra)).status,403);
  for(const body of ['{"siteUserId":"chosen-owner"}','{"role":"owner"}','[]','x'.repeat(129)])assert.equal((await t.worker.fetch(req('/api/beta-join',{method:'POST',body}),t.env)).status,400);
  assert.equal((await join(t,null)).status,401);assert.equal((await t.worker.fetch(req('/api/beta-join'),t.env)).status,405);assert.equal((await readBetaStatus(t.binding)).enrolled,0);assert.equal(t.outbound,0);
 }finally{t.close()}
});
test('first twenty MENEI accounts retain admission; the next is full and cannot call research',async()=>{
 const t=await setup();try{
  assert.equal((await join(t)).status,200);assert.equal((await join(t)).status,200);assert.equal((await join(t,'tester-0')).status,503);
  t.env.MENEI_BETA_PHASE='open';t.env.MENEI_BETA_OWNER_PRIVATE='false';
  const joined=await Promise.all(Array.from({length:20},(_,i)=>join(t,'tester-'+i)));assert.equal(joined.filter(r=>r.status===200).length,19);assert.equal(joined.filter(r=>r.status===403).length,1);assert.equal((await readBetaStatus(t.binding)).enrolled,20);
  const status=await (await t.worker.fetch(req('/api/beta-status',{id:'tester-21'}),t.env)).json();assert.equal(status.member,false);assert.equal(status.remainingSlots,0);
  assert.equal((await t.worker.fetch(req('/api/gym-research',{id:'tester-21',method:'POST',body:JSON.stringify(query)}),t.env)).status,403);assert.equal(t.outbound,0);
  assert.equal((await join(t,'tester-0')).status,200);assert.equal((await readBetaStatus(t.binding)).enrolled,20);assert.equal((await t.worker.fetch(req('/api/beta-readiness',{id:null}),t.env)).status,403);
 }finally{t.close()}
});
test('each admitted MENEI account gets five attempts; changing ChatGPT headers does not change allowance',async()=>{
 const t=await setup();try{
  await join(t);t.env.MENEI_BETA_PHASE='open';t.env.MENEI_BETA_OWNER_PRIVATE='false';await join(t,'tester-1');
  for(let n=1;n<=6;n++){const result=await t.worker.fetch(req('/api/gym-research',{id:'tester-1',method:'POST',body:JSON.stringify(query),extra:{'oai-authenticated-user-id':'different-every-time-'+n}}),t.env);assert.equal(result.status,n<=5?200:429);t.advance()}
  assert.equal(t.outbound,5);assert.equal((await readBetaQuota(t.binding,'menei:tester-1')).used,5);assert.equal((await readBetaQuota(t.binding,'menei:owner')).used,0);
 }finally{t.close()}
});
test('missing hosted storage prevents admission and research while sign-in config reports setup unavailable',async()=>{
 const t=await setup();try{
  const env={...t.env,GYM_AI_LIMITS:{prepare(){throw Error('private storage detail')}}};
  const config=await (await t.worker.fetch(req('/api/preview-config',{id:null}),env)).json();assert.equal(config.betaAdmissionRequired,true);assert.equal(config.betaStorageReady,false);assert.equal(config.gymResearchReady,false);
  for(const path of ['/api/beta-status','/api/beta-join','/api/gym-research']){const post=path!=='/api/beta-status',result=await t.worker.fetch(req(path,{method:post?'POST':'GET',body:post?'{}':undefined}),env);assert.equal(result.status,503);assert.doesNotMatch(await result.text(),/private storage detail|sk-syntheticpreviewkey/)}
  assert.equal(t.outbound,0);
 }finally{t.close()}
});

test('an earlier Sites owner cannot silently activate MENEI membership or AI even if the runtime phase is opened',async()=>{
 const t=await setup();try{
  await enrollBetaMember(t.binding,'old-sites-owner',{bootstrap:true});
  const diagnostic=await(await t.worker.fetch(req('/api/beta-readiness',{id:null}),t.env)).json();assert.equal(diagnostic.storageReady,true);assert.equal(diagnostic.ownerAccountReady,false);
  t.env.MENEI_BETA_PHASE='open';t.env.MENEI_BETA_OWNER_PRIVATE='false';
  const config=await(await t.worker.fetch(req('/api/preview-config',{id:null}),t.env)).json();assert.equal(config.betaStorageReady,false);assert.equal(config.gymResearchReady,false);
  assert.equal((await join(t)).status,503);assert.equal((await t.worker.fetch(req('/api/beta-status'),t.env)).status,503);assert.equal((await t.worker.fetch(req('/api/gym-research',{method:'POST',body:JSON.stringify(query)}),t.env)).status,503);
  assert.equal(t.outbound,0);assert.equal((await readBetaStatus(t.binding)).enrolled,1);assert.equal(t.db.prepare('SELECT owner_user_id FROM menei_beta_campaigns').get().owner_user_id,'old-sites-owner');assert.equal(t.db.prepare('SELECT count(*) AS n FROM menei_beta_attempts').get().n,0);
 }finally{t.close()}
});

test('push readiness needs explicit private pilot flag and a public key; it never changes beta or AI allowances',async()=>{
 const t=await setup();try{
  const read=async env=>(await t.worker.fetch(req('/api/preview-config',{id:null}),env)).json();
  const pub='B'+'A'.repeat(86),enabled={...t.env,MENEI_PUSH_ENABLED:'true',MENEI_PUSH_PUBLIC_KEY:pub};
  const ready=await read(enabled);assert.equal(ready.pushServiceReady,true);assert.equal(ready.pushPilot,'private-test');assert.equal(ready.vapidPublicKey,pub);
  for(const env of [{...enabled,MENEI_PUSH_ENABLED:'false'},{...enabled,MENEI_PUSH_PUBLIC_KEY:'bad'},{...enabled,MENEI_BETA_PHASE:'open'}])assert.equal((await read(env)).pushServiceReady,false);
  assert.equal((await readBetaStatus(t.binding)).enrolled,0);assert.equal(t.outbound,0);assert.doesNotMatch(JSON.stringify(ready),/OPENAI_API_KEY|sk-syntheticpreviewkey|privateKey/);
 }finally{t.close()}
});
