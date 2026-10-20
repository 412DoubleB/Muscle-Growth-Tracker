import test from 'node:test';
import assert from 'node:assert/strict';
import {createPreviewWorker,gymResearchConfigured} from '../scripts/preview-config-worker.mjs';
import {ProviderError} from '../server/gym-research-provider.mjs';
import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs/promises';
import {AuthError} from '../server/menei-beta-auth.mjs';
import {enrollBetaMember} from '../server/beta-membership-budget.mjs';
const authFixture=async request=>{if(request.headers.get('authorization')!=='Bearer synthetic-owner')throw new AuthError('invalid_menei_account',401);return {id:'synthetic-owner'}};

const origin='https://private.example';
const query={name:'Synthetic Fitness',location:'Example City',address:''};
const config={MENEI_BETA_PHASE:'bootstrap',MENEI_BETA_OWNER_PRIVATE:'true',MENEI_TEST_PUBLISHABLE_KEY:'sb_publishable_synthetic',MENEI_GYM_AI_ENABLED:'true',OPENAI_API_KEY:'sk-syntheticpreviewkey',GYM_AI_LIMITS:{prepare(){throw Error('Use the injected budget')}}};
function request({method='POST',headers={},body=JSON.stringify(query),...options}={}){
 return new Request(origin+'/api/gym-research',{method,headers:{origin,authorization:'Bearer synthetic-owner','sec-fetch-site':'same-origin','content-type':'application/json',...headers},...(method==='GET'?{}:{body}),...options});
}
function setup({result={locations:[],checked:'2026-10-19',notice:'Review location sources.'},reserveResult={allowed:true,used:1,leaseId:'synthetic-lease'},reserveError=false,releaseError=false,providerError,report,useDefaultReport=false}={}){
 const calls={reserve:[],research:[],release:[],reports:[]};
 const worker=createPreviewWorker({now:()=>new Date('2026-10-19T12:00:00Z'),authenticate:authFixture,ownerReady:async()=>true,membership:async()=>({member:true,role:'owner'}),betaStatus:async()=>({enrolled:1,capacity:20,remainingSlots:19,bootstrapClosed:true}),betaQuota:async()=>({used:0,remaining:5}),
  betaReserve:async(...args)=>{calls.reserve.push(args);if(reserveError)throw Error('private database details');return reserveResult},
  betaRelease:async(...args)=>{calls.release.push(args);if(releaseError)throw Error('private database details')},
  research:async(...args)=>{calls.research.push(args);if(providerError)throw providerError;return result},
  ...(useDefaultReport?{}:{report:diagnostic=>{calls.reports.push(diagnostic);return report?.(diagnostic)}})
 });return {worker,calls,result};
}
test('feature readiness needs explicit enablement, a private key and durable binding; config never returns credentials',async()=>{
 for(const disabled of [{},{...config,MENEI_GYM_AI_ENABLED:'false'},{...config,OPENAI_API_KEY:''},{...config,GYM_AI_LIMITS:undefined}])assert.equal(gymResearchConfigured(disabled),false);
 assert.equal(gymResearchConfigured(config),true);
 const {worker}=setup();
 for(const identity of [null,'synthetic-owner']){
  const response=await worker.fetch(new Request(origin+'/api/preview-config',{headers:identity?{'oai-authenticated-user-id':identity}:{}}),config);
  const value=await response.json();assert.equal(value.gymResearchReady,true);assert.equal(value.betaAdmissionRequired,true);assert.equal(value.betaAccountContext,undefined);assert.equal(value.pushServiceReady,false);
  assert.doesNotMatch(JSON.stringify(value),/sk-synthetic|OPENAI_API_KEY|GYM_AI_LIMITS/);
 }
});
test('method, identity and same-origin checks reject before quota or provider work',async()=>{
 const variants=[
  [{method:'GET'},405],
  [{headers:{authorization:''}},401],
  [{headers:{origin:''}},403],
  [{headers:{origin:'https://other.example'}},403],
  [{headers:{'sec-fetch-site':'cross-site'}},403]
 ];
 for(const [options,status]of variants){const {worker,calls}=setup();const response=await worker.fetch(request(options),config);assert.equal(response.status,status);assert.equal(calls.reserve.length,0);assert.equal(calls.research.length,0);assert.equal(response.headers.get('access-control-allow-origin'),null)}
 const {worker,calls}=setup();assert.equal((await worker.fetch(request(),{...config,MENEI_GYM_AI_ENABLED:'false'})).status,503);assert.equal(calls.reserve.length,0);
});

test('owner setup diagnostics read migrated storage without claiming seats or spending attempts',async()=>{
 const db=new DatabaseSync(':memory:');try{
  const binding={prepare(sql){return {bind(...values){return {async first(){return db.prepare(sql).get(...values)||null}}}}}};
  const worker=createPreviewWorker(),env={...config,GYM_AI_LIMITS:binding};
  let response=await worker.fetch(new Request(origin+'/api/beta-readiness'),env);assert.equal(response.status,503);assert.equal((await response.json()).storageReady,false);
  const journal=JSON.parse(await fs.readFile(new URL('../drizzle/meta/_journal.json',import.meta.url),'utf8'));for(const e of journal.entries)db.exec(await fs.readFile(new URL('../drizzle/'+e.tag+'.sql',import.meta.url),'utf8'));
  response=await worker.fetch(new Request(origin+'/api/beta-readiness'),env);const status=await response.json();assert.equal(status.storageReady,true);assert.equal(status.enrolled,0);assert.equal(status.bootstrapClosed,false);
  assert.equal(db.prepare('SELECT count(*) AS n FROM menei_gym_ai_trials').get().n,0);assert.equal(db.prepare('SELECT count(*) AS n FROM menei_beta_attempts').get().n,0);
  assert.equal((await worker.fetch(new Request(origin+'/api/beta-readiness'),{...env,MENEI_BETA_PHASE:'open',MENEI_BETA_OWNER_PRIVATE:'false'})).status,403);
 }finally{db.close()}
});
test('only bounded gym identity JSON can reach the provider; invalid or oversized bodies never use quota',async()=>{
 const invalid=[
  [{body:'{broken'},400],
  [{body:JSON.stringify({...query,workouts:[{private:true}]})},400],
  [{body:JSON.stringify({...query,model:'other'})},400],
  [{body:JSON.stringify({...query,name:'x'.repeat(301)})},400],
  [{body:JSON.stringify({...query,location:''})},400],
  [{body:JSON.stringify([query])},400],
  [{body:JSON.stringify({...query,name:3})},400],
  [{headers:{'content-type':'text/plain'}},415],
  [{headers:{'content-length':'8193'}},413],
  [{body:' '.repeat(8193)},413],
  [{body:new Uint8Array([0xff])},400]
 ];
 for(const [options,status]of invalid){const {worker,calls}=setup();assert.equal((await worker.fetch(request(options),config)).status,status);assert.equal(calls.reserve.length,0);assert.equal(calls.research.length,0)}
 const {worker,calls,result}=setup();const response=await worker.fetch(request({body:JSON.stringify({name:' Synthetic Fitness ',location:' Example City ',address:' '})}),config);
 assert.equal(response.status,200);assert.deepEqual(await response.json(),result);assert.deepEqual(calls.research[0][0],query);
 assert.equal(calls.reserve[0][2].now,Date.parse('2026-10-19T12:00:00Z'));assert.equal(calls.release.length,1);
 assert.equal(calls.research[0][1].apiKey,config.OPENAI_API_KEY);assert.ok(calls.research[0][1].allowedEquipment.includes('Dumbbells'));
 assert.equal(response.headers.get('cache-control'),'private, no-store');
});
test('durable quota denial or failure prevents all provider requests',async()=>{
 for(const options of [{reserveResult:{allowed:false,reason:'limit'}},{reserveResult:{allowed:false,reason:'busy'}},{reserveError:true}]){
  const {worker,calls}=setup(options),response=await worker.fetch(request(),config);
  assert.equal(response.status,options.reserveError?503:429);assert.equal(calls.research.length,0);assert.equal(calls.release.length,0);
  assert.doesNotMatch(await response.text(),/private database details|sk-synthetic/);
 }
});
test('provider failure consumes the reservation, releases only that lease and never leaks details or retries',async()=>{
 for(const error of [new ProviderError('INVALID_RESEARCH',502),new Error('sk-synthetic private provider response')]){
  const {worker,calls}=setup({providerError:error}),response=await worker.fetch(request(),config);
  assert.equal(response.status,502);assert.equal(calls.reserve.length,1);assert.equal(calls.research.length,1);assert.equal(calls.release.length,1);assert.equal(calls.release[0][1],'synthetic-lease');
  assert.doesNotMatch(await response.text(),/sk-synthetic|private provider response/);
 }
 const {worker,calls}=setup({releaseError:true});assert.equal((await worker.fetch(request(),config)).status,200);assert.equal(calls.reserve.length,1);assert.equal(calls.research.length,1);
});

test('failure reports contain only static diagnostic fields and never change public errors or lease release',async()=>{
 const secret='sk-synthetic-private-provider-detail',privateQuery={name:'Private gym name',location:'Private city',address:'Private street address'};
 const errors=[
  [new ProviderError('invalid_provider_response',502,{category:'source_citation'}),'INVALID_RESEARCH',{category:'source_citation'}],
  [new ProviderError('provider_unavailable',503,{category:'provider_http',upstreamStatus:429}),'UPSTREAM_UNAVAILABLE',{category:'provider_http',upstreamStatus:429}],
  [new ProviderError(secret,502,{category:secret,upstreamStatus:secret}),'UPSTREAM_UNAVAILABLE',{category:'unclassified_failure'}],
  [Object.assign(new Error(secret),{diagnosticCategory:'schema',upstreamStatus:401,headers:{Authorization:secret},body:secret}),'UPSTREAM_UNAVAILABLE',{category:'unclassified_failure'}]
 ];
 for(const [providerError,publicCode,diagnostic]of errors){
  const {worker,calls}=setup({providerError}),response=await worker.fetch(request({body:JSON.stringify(privateQuery)}),config);
  assert.equal(response.status,502);assert.deepEqual(await response.json(),{error:publicCode});
  assert.deepEqual(calls.reports,[{event:'gym_research_failure',...diagnostic}]);
  assert.equal(calls.reserve.length,1);assert.equal(calls.research.length,1);assert.equal(calls.release.length,1);
  assert.doesNotMatch(JSON.stringify(calls.reports),/Private|synthetic-owner|private-provider|Authorization|lease|token|apiKey/);
 }
 for(const report of [()=>{throw Error(secret)},async()=>{throw Error(secret)},()=>new Promise(()=>{})]){
  const {worker,calls}=setup({providerError:new ProviderError('invalid_provider_response',502,{category:'schema'}),report});
  const response=await worker.fetch(request(),config);
  assert.equal(response.status,502);assert.deepEqual(await response.json(),{error:'INVALID_RESEARCH'});
  assert.equal(calls.reports.length,1);assert.equal(calls.research.length,1);assert.equal(calls.release.length,1);
 }
 const denied=setup({reserveResult:{allowed:false,reason:'limit'}});await denied.worker.fetch(request(),config);assert.deepEqual(denied.calls.reports,[]);
 const success=setup();await success.worker.fetch(request(),config);assert.deepEqual(success.calls.reports,[]);
});

test('default failure reporting writes one sanitized structured warning',async t=>{
 const warnings=[];t.mock.method(console,'warn',(...values)=>warnings.push(values));
 const {worker,calls}=setup({providerError:new ProviderError('provider_unavailable',503,{category:'provider_http',upstreamStatus:401}),useDefaultReport:true});
 const response=await worker.fetch(request(),config);
 assert.equal(response.status,502);assert.deepEqual(await response.json(),{error:'UPSTREAM_UNAVAILABLE'});
 assert.deepEqual(warnings,[[{event:'gym_research_failure',category:'provider_http',upstreamStatus:401}]]);
 assert.equal(calls.research.length,1);assert.equal(calls.release.length,1);
});

test('real route, provider parser and migrated durable quota enforce five attempts across Worker instances',async()=>{
 const db=new DatabaseSync(':memory:');
 try{
  const journal=JSON.parse(await fs.readFile(new URL('../drizzle/meta/_journal.json',import.meta.url),'utf8'));for(const e of journal.entries)db.exec(await fs.readFile(new URL('../drizzle/'+e.tag+'.sql',import.meta.url),'utf8'));
  db.exec("CREATE TABLE synthetic_workouts (id TEXT, load REAL); INSERT INTO synthetic_workouts VALUES ('kept',0)");
  const binding={prepare(sql){return {bind(...values){const stmt=db.prepare(sql);return {async first(){return stmt.get(...values)||null},async run(){const info=stmt.run(...values);return {success:true,meta:{changes:Number(info.changes)}}}}}}}};
  let clock=Date.parse('2026-10-19T12:00:00Z'),outbound=0;
  const fetcher=async(url,options)=>{
   // Workers supports manual redirects; a 3xx response never follows with the key.
   assert.equal(url,'https://api.openai.com/v1/responses');assert.equal(options.redirect,'manual');outbound++;
   const body=JSON.parse(options.body);assert.equal(body.max_tool_calls,1);assert.equal(body.store,false);assert.deepEqual(JSON.parse(body.input[0].content[0].text),query);
   if(outbound===2)return new Response('private provider failure',{status:429});
   return Response.json({status:'completed',output:[{type:'web_search_call',status:'completed',action:{type:'search',sources:[]}},{type:'message',role:'assistant',status:'completed',content:[{type:'output_text',text:'{"locations":[]}',annotations:[]}]}]});
  };
  await enrollBetaMember(binding,'menei:synthetic-owner',{bootstrap:true,now:clock});
  const env={...config,GYM_AI_LIMITS:binding};
  for(let n=1;n<=6;n++){
   const worker=createPreviewWorker({fetcher,authenticate:authFixture,now:()=>new Date(clock)}),response=await worker.fetch(request(),env);
   assert.equal(response.status,n===6?429:n===2?502:200);
   if(n===6)assert.deepEqual(await response.json(),{error:'LIMIT_REACHED'});
   clock+=10_001;
  }
  assert.equal(outbound,5);assert.equal(db.prepare('SELECT used FROM menei_gym_ai_trials').get().used,0);assert.equal(db.prepare('SELECT count(*) AS n FROM menei_beta_attempts').get().n,5);
  assert.deepEqual({...db.prepare('SELECT * FROM synthetic_workouts').get()},{id:'kept',load:0});
 }finally{db.close()}
});
