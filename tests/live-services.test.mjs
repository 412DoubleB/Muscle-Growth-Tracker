import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {createLiveGateway,createReleaseGateway} from '../server/live-gateway.mjs';
import {AuthError,authenticateLiveMeneiAccount} from '../server/menei-beta-auth.mjs';
import {enrollBetaMember,readBetaQuota} from '../server/beta-membership-budget.mjs';
import {GYM_AI_TRIAL_ID} from '../server/gym-research-budget.mjs';
import {LiveServices,LIVE_AUTH_URL,LIVE_SERVICE_BASE} from '../live-services.mjs';
const origin='https://412doubleb.github.io',api='https://menei-private-beta.crispcrown515.chatgpt.site/api/live/';
const liveOwner='10000000-0000-4000-8000-000000000001',previewOwner='20000000-0000-4000-8000-000000000001';
const member='10000000-0000-4000-8000-000000000002',key='sb_publishable_synthetic_live_key';
test('public API transport does not expose retained owner preview routes or require ChatGPT for API consumers',async()=>{
 let previews=0,apiCalls=0;
 const gateway=createReleaseGateway({live:{fetch:async()=>{apiCalls++;return new Response('api')}},preview:{fetch:async()=>{previews++;return new Response('private')}}}),env={MENEI_PRIVATE_SITE_OWNER_ID:'synthetic-native-owner'};
 for(const path of ['/','/index.html','/api/preview-config','/api/beta-join','/media/original.webp']){
  assert.equal((await gateway.fetch(new Request('https://site.invalid'+path),env)).status,403);
  assert.equal((await gateway.fetch(new Request('https://site.invalid'+path,{headers:{'oai-authenticated-user-id':'other-native-user'}}),env)).status,403);
 }
 assert.equal(previews,0);
 assert.equal(await (await gateway.fetch(new Request('https://site.invalid/',{headers:{'oai-authenticated-user-id':'synthetic-native-owner'}}),env)).text(),'private');assert.equal(previews,1);
 assert.equal(await (await gateway.fetch(new Request(api+'status'),env)).text(),'api');assert.equal(apiCalls,1);
 assert.equal((await gateway.fetch(new Request('https://site.invalid/',{headers:{'oai-authenticated-user-id':'synthetic-native-owner'}}),{})).status,403);
});
async function fixture(t){
 const sql=new DatabaseSync(':memory:');t.after(()=>sql.close());
 for(const name of ['0000_menei_gym_ai_trial.sql','0001_menei_beta_membership.sql'])sql.exec(readFileSync(new URL('../drizzle/'+name,import.meta.url),'utf8'));
 sql.prepare('INSERT INTO menei_gym_ai_trials(id,used) VALUES (?,?)').run(GYM_AI_TRIAL_ID,3);
 const db={prepare(query){return {bind(...values){return {first:async()=>sql.prepare(query).get(...values)||null,run:async()=>({success:true,meta:{changes:Number(sql.prepare(query).run(...values).changes)}})}}}}};
 await enrollBetaMember(db,'menei:'+previewOwner,{bootstrap:true,now:100000});
 let stamp=Date.parse('2026-10-23T12:00:00Z'),calls=0;
 const worker=createLiveGateway({now:()=>new Date(stamp),authenticate:async request=>{const id=request.headers.get('authorization')?.replace('Bearer ','');if(![liveOwner,member].includes(id))throw new AuthError('invalid_menei_account',401);return {id}},research:async()=>{calls++;return {locations:[],checked:'2026-10-23',notice:'Review estimates'}}});
 const env={GYM_AI_LIMITS:db,MENEI_LIVE_API_ENABLED:'true',MENEI_LIVE_PHASE:'open',MENEI_GYM_AI_ENABLED:'true',OPENAI_API_KEY:'sk-synthetic_not_a_real_key',MENEI_LIVE_PUBLISHABLE_KEY:key,MENEI_LIVE_OWNER_ID:liveOwner,MENEI_LINKED_BETA_OWNER_ID:previewOwner};
 const request=(route,{id=liveOwner,method=['join','research'].includes(route)?'POST':'GET',body=route==='join'?{}:{name:'Synthetic Gym',location:'Pittsburgh, PA',address:''},headers={}}={})=>new Request(api+route,{method,headers:{origin,Authorization:'Bearer '+id,'Content-Type':'application/json',...headers},...(['GET','HEAD','OPTIONS'].includes(method)?{}:{body:JSON.stringify(body)})});
 return {sql,db,env,worker,request,advance:()=>stamp+=100000,get calls(){return calls}};
}
test('production gateway retains owner seat, previous attempts and durable caps across live Auth aliases',async t=>{
 const f=await fixture(t);assert.equal((await f.worker.fetch(f.request('join'),f.env)).status,200);
 assert.equal(f.sql.prepare('SELECT count(*) n FROM menei_beta_members').get().n,1);
 for(let i=0;i<2;i++){f.advance();assert.equal((await f.worker.fetch(f.request('research'),f.env)).status,200)}
 f.advance();const denied=await f.worker.fetch(f.request('research'),f.env);assert.equal(denied.status,429);assert.equal((await denied.json()).error,'LIMIT_REACHED');assert.equal(f.calls,2);
 assert.equal((await readBetaQuota(f.db,'menei:'+previewOwner)).used,5);assert.equal((await readBetaQuota(f.db,'menei:'+previewOwner)).globalUsed,5);
 assert.equal((await f.worker.fetch(f.request('join',{id:member}),f.env)).status,200);assert.equal((await readBetaQuota(f.db,'menei:live:'+member)).used,0);
 assert.equal(f.sql.prepare('SELECT used FROM menei_gym_ai_trials').get().used,3);
});
test('production gateway rejects foreign/missing origins, methods and unauthenticated callers before spending',async t=>{
 const f=await fixture(t);
 for(const change of [{headers:{origin:'https://attacker.invalid'}},{headers:{origin:''}},{id:'forged'}])assert.ok([401,403].includes((await f.worker.fetch(f.request('research',change),f.env)).status));
 assert.equal((await f.worker.fetch(f.request('research',{method:'GET'}),f.env)).status,405);
 for(const route of ['../preview-config','../beta-readiness','../beta-join','unknown'])assert.equal((await f.worker.fetch(f.request(route),f.env)).status,404);
 assert.equal(f.calls,0);assert.equal(f.sql.prepare('SELECT count(*) n FROM menei_beta_attempts').get().n,0);
});
test('CORS preflight permits only reviewed origin and headers; missing release/link readiness fails closed',async t=>{
 const f=await fixture(t),pre=f.request('research',{method:'OPTIONS',headers:{'access-control-request-method':'POST','access-control-request-headers':'authorization,content-type'}});
 const accepted=await f.worker.fetch(pre,f.env);assert.equal(accepted.status,204);assert.equal(accepted.headers.get('Access-Control-Allow-Origin'),origin);assert.equal(accepted.headers.get('Access-Control-Allow-Credentials'),null);
 const denied=await f.worker.fetch(f.request('research',{method:'OPTIONS',headers:{'access-control-request-method':'DELETE'}}),f.env);assert.equal(denied.status,403);
 for(const delta of [{MENEI_LIVE_API_ENABLED:'false'},{MENEI_LINKED_BETA_OWNER_ID:member},{MENEI_LIVE_OWNER_ID:''}])assert.equal((await f.worker.fetch(f.request('join'),{...f.env,...delta})).status,503);
 await enrollBetaMember(f.db,'menei:unlinked-preview-account',{now:200000});assert.equal((await f.worker.fetch(f.request('join'),f.env)).status,503);assert.equal(f.calls,0);
});
test('twentieth durable seat is the last seat; retries do not enroll again or reset consumption',async t=>{
 const f=await fixture(t);for(let i=0;i<19;i++)await enrollBetaMember(f.db,'menei:live:synthetic-'+i,{now:200000});
 const full=await f.worker.fetch(f.request('join',{id:member}),f.env);assert.equal(full.status,403);assert.equal((await full.json()).error,'BETA_FULL');assert.equal(f.sql.prepare('SELECT count(*) n FROM menei_beta_members').get().n,20);
 assert.equal((await f.worker.fetch(f.request('join'),f.env)).status,200);
});
test('initial production owner phase cannot admit another account or spend its allowance',async t=>{
 const f=await fixture(t),env={...f.env,MENEI_LIVE_PHASE:'owner'};
 assert.equal((await f.worker.fetch(f.request('join',{id:member}),env)).status,403);assert.equal(f.sql.prepare('SELECT count(*) n FROM menei_beta_members').get().n,1);assert.equal(f.calls,0);
 assert.equal((await f.worker.fetch(f.request('join'),env)).status,200);
 assert.equal((await f.worker.fetch(f.request('join'),{...env,MENEI_LIVE_PHASE:undefined})).status,503);
});
test('live Auth validator contacts only the original project and rejects a preview token without fetching',async()=>{
 const now=()=>Date.parse('2026-10-23T12:00:00Z'),claims={iss:LIVE_AUTH_URL+'/auth/v1',sub:member,aud:'authenticated',role:'authenticated',is_anonymous:false,exp:now()/1000+3600};
 const token=c=>[Buffer.from('{}').toString('base64url'),Buffer.from(JSON.stringify(c)).toString('base64url'),'synthetic'].join('.');
 let calls=0;const fetcher=async(url,options)=>{calls++;assert.equal(url,LIVE_AUTH_URL+'/auth/v1/user');assert.equal(options.headers.apikey,key);return new Response(JSON.stringify({id:member,aud:'authenticated',role:'authenticated',is_anonymous:false,email_confirmed_at:'2026-10-01T00:00:00Z',identities:[{id:'synthetic-email',user_id:member,provider:'email'}]}))};
 const request=c=>new Request(api+'join',{headers:{Authorization:'Bearer '+token(c)}});
 assert.deepEqual(await authenticateLiveMeneiAccount(request(claims),{MENEI_LIVE_PUBLISHABLE_KEY:key},{now,fetcher}),{id:member});
 await assert.rejects(authenticateLiveMeneiAccount(request({...claims,iss:'https://bhyrrxrpqaxiwpfxnwpa.supabase.co/auth/v1'}),{MENEI_LIVE_PUBLISHABLE_KEY:key},{now,fetcher}),error=>error.status===401);assert.equal(calls,1);
});
function clientFixture(fetcher){
 const cloud={config:{url:LIVE_AUTH_URL},session:{user:{id:member},access_token:'synthetic-token'},accountContext(){return {userId:this.session?.user.id}},requireCurrentAccount(c){if(c.userId!==this.session?.user.id)throw Error('Account changed')},async refresh(){}};
 const client=new LiveServices(cloud,{fetcher});client.configure({version:1,enabled:true,base:LIVE_SERVICE_BASE});return {cloud,client};
}
test('live client sends only gym query and account token to the fixed service after verified admission',async()=>{
 const calls=[],f=clientFixture(async(url,options)=>{calls.push({url,options});return new Response(JSON.stringify(url.endsWith('/join')?{joined:true,role:'member'}:{locations:[]}))});
 assert.equal((await f.client.research({name:'Gym',location:'City',address:''})).status,200);assert.equal(calls.length,2);
 assert.ok(calls.every(c=>c.url.startsWith(LIVE_SERVICE_BASE)&&c.options.credentials==='omit'&&c.options.redirect==='error'&&c.options.headers.Authorization==='Bearer synthetic-token'));
 assert.deepEqual(JSON.parse(calls[0].options.body),{});assert.deepEqual(JSON.parse(calls[1].options.body),{name:'Gym',location:'City',address:''});
});
test('sign-in admission is account-bound and full beta produces a waitlist state without research or cloud changes',async()=>{
 let calls=0;const f=clientFixture(async()=>{calls++;return new Response(JSON.stringify({error:'BETA_FULL'}),{status:403})});
 const original=JSON.stringify(f.cloud.session);assert.deepEqual(await f.client.admit(),{userId:member,joined:false,full:true});assert.equal(calls,1);assert.equal(JSON.stringify(f.cloud.session),original);
 f.cloud.session=null;assert.equal(await f.client.admit(),null);assert.equal(f.client.admission,null);assert.equal(calls,1);
});
test('full beta, changed account, missing sign-in and invalid endpoint never proceed to research',async()=>{
 for(const scenario of ['full','changed','guest','other-project','bad-base']){
  let calls=0;const f=clientFixture(async()=>{calls++;if(scenario==='changed')f.cloud.session={user:{id:liveOwner}};return new Response(JSON.stringify(scenario==='full'?{error:'BETA_FULL'}:{joined:true,role:'member'}),{status:scenario==='full'?403:200})});
  if(scenario==='guest')f.cloud.session=null;if(scenario==='other-project')f.cloud.config.url='https://other.supabase.co';if(scenario==='bad-base')f.client.configure({version:1,enabled:true,base:'https://attacker.invalid'});
  if(scenario==='full')assert.equal((await f.client.research({})).status,403);else await assert.rejects(f.client.research({}));
  assert.ok(calls<=1);
 }
});

test('owner hash captured under native private access authorizes only the same platform identity',async()=>{
 const id='synthetic-native-owner';
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(id));
 const hash=Array.from(new Uint8Array(digest),n=>n.toString(16).padStart(2,'0')).join('');
 let privateCalls=0;
 const gateway=createReleaseGateway({preview:{fetch:async()=>{privateCalls++;return new Response('private')}},live:{fetch:async()=>new Response('api')}});
 const env={MENEI_PRIVATE_SITE_OWNER_SHA256:hash};
 for(const identity of [null,'other-owner','',hash]){
  const headers=identity===null?{}:{'oai-authenticated-user-id':identity};
  assert.equal((await gateway.fetch(new Request('https://site.invalid/api/preview-config',{headers}),env)).status,403);
 }
 assert.equal(privateCalls,0);
 assert.equal(await (await gateway.fetch(new Request('https://site.invalid/',{headers:{'oai-authenticated-user-id':id}}),env)).text(),'private');
 assert.equal(privateCalls,1);
});
