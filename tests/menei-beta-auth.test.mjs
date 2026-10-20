import test from 'node:test';
import assert from 'node:assert/strict';
import {AuthError,authenticateMeneiAccount} from '../server/menei-beta-auth.mjs';

// Synthetic fixtures only: no test performs network requests or uses an account.
const id='10000000-0000-4000-8000-000000000001',otherId='10000000-0000-4000-8000-000000000002';
const issuer='https://bhyrrxrpqaxiwpfxnwpa.supabase.co/auth/v1';
const instant=Date.parse('2026-10-20T10:00:00.000Z'),now=()=>instant;
const env={MENEI_TEST_PUBLISHABLE_KEY:'sb_publishable_synthetic_not_a_real_key'};
const baseClaims=()=>({iss:issuer,sub:id,aud:'authenticated',role:'authenticated',is_anonymous:false,exp:Math.floor(instant/1000)+3600});
const token=(changes={})=>[Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url'),Buffer.from(JSON.stringify({...baseClaims(),...changes})).toString('base64url'),'synthetic_signature'].join('.');
const request=(accessToken=token(),headers={})=>new Request('https://menei.example/api/beta/status',{headers:{Authorization:'Bearer '+accessToken,...headers}});
const user=()=>({id,aud:'authenticated',role:'authenticated',is_anonymous:false,email:'synthetic@example.invalid',email_confirmed_at:'2026-10-19T00:00:00Z',confirmed_at:'2026-10-19T00:00:00Z',identities:[{id:'synthetic-identity',user_id:id,provider:'email'}],user_metadata:{id:otherId,betaOwner:true}});
const response=raw=>new Response(JSON.stringify(raw),{headers:{'content-type':'application/json'}});
const rejects=(action,code='invalid_menei_account',status=401)=>assert.rejects(action,error=>error instanceof AuthError&&error.code===code&&error.status===status&&error.message==='MENEI account verification could not be completed.'&&!error.message.includes('synthetic'));

test('only the fixed test Auth user endpoint grants the trusted id, without forwarding caller identity headers',async()=>{
 const calls=[],input=request(token(),{'x-sites-user-id':otherId,'x-user-email':'claimed@example.invalid'});
 const result=await authenticateMeneiAccount(input,{...env,MENEI_TEST_URL:'https://attacker.invalid'},{now,fetcher:async(url,options)=>{if(options.redirect==='error')throw new TypeError('Workers does not implement redirect:error');calls.push({url,options});return response(user())}});
 assert.deepEqual(result,{id});assert.equal(Object.isFrozen(result),true);assert.equal(calls.length,1);
 const call=calls[0];assert.equal(call.url,issuer+'/user');assert.equal(call.options.method,'GET');assert.equal(call.options.redirect,'manual');assert.equal(call.options.cache,'no-store');
 assert.deepEqual(call.options.headers,{apikey:env.MENEI_TEST_PUBLISHABLE_KEY,Authorization:'Bearer '+token(),Accept:'application/json'});assert.ok(call.options.signal instanceof AbortSignal);
 assert.equal(Object.hasOwn(call.options,'body'),false);assert.deepEqual(Object.keys(result),['id']);
});

test('missing bearer and caller identities cannot authenticate or reach the provider',async()=>{
 let calls=0;const fetcher=async()=>{calls++;return response(user())};
 for(const authorization of ['', 'Basic synthetic', 'Bearer not-a-jwt','Bearer '+token()+', Bearer '+token(),'Bearer '+'a'.repeat(17000)]){
  await rejects(()=>authenticateMeneiAccount(new Request('https://menei.example',{headers:{Authorization:authorization,'x-sites-user-id':id}}),env,{now,fetcher}));
 }
 await rejects(()=>authenticateMeneiAccount(new Request('https://menei.example',{headers:{'x-sites-user-id':id,'x-user-email':'owner@example.invalid'}}),env,{now,fetcher}));assert.equal(calls,0);
});

test('unverified claims may reject the request but never grant it, including forged signatures',async()=>{
 let calls=0;const fetcher=async()=>{calls++;return new Response('private upstream token details',{status:401})};
 await rejects(()=>authenticateMeneiAccount(request(),env,{now,fetcher}));assert.equal(calls,1);
 for(const claims of [{iss:'https://other-project.supabase.co/auth/v1'},{iss:issuer+'/'},{exp:Math.floor(instant/1000)},{exp:'99999999999'},{sub:otherId,role:'service_role'},{aud:'anon'},{is_anonymous:true},{is_anonymous:null},{nbf:Math.floor(instant/1000)+1},{sub:'claimed-owner'}]){
  await rejects(()=>authenticateMeneiAccount(request(token(claims)),env,{now,fetcher}));
 }
 assert.equal(calls,1);
});

test('missing, anonymous, unconfirmed and mismatched upstream identities fail closed',async()=>{
 for(const mutate of [raw=>raw.id=otherId,raw=>delete raw.id,raw=>delete raw.is_anonymous,raw=>raw.is_anonymous=true,raw=>raw.role='service_role',raw=>raw.aud='anon',raw=>raw.identities=[],raw=>delete raw.identities,raw=>raw.identities[0].user_id=otherId,raw=>raw.identities[0].provider='anonymous',raw=>raw.email_confirmed_at=null,raw=>raw.email_confirmed_at='tomorrow',raw=>raw.email_confirmed_at='2027-01-01T00:00:00Z',raw=>raw.identities[0].id='']){
  const raw=user();mutate(raw);await rejects(()=>authenticateMeneiAccount(request(),env,{now,fetcher:async()=>response(raw)}));
 }
 const raw=user();raw.email_confirmed_at=null;raw.user_metadata.email_confirmed_at='2026-10-19T00:00:00Z';await rejects(()=>authenticateMeneiAccount(request(),env,{now,fetcher:async()=>response(raw)}));
});

test('confirmed phone and provider accounts can authenticate with only a MENEI account',async()=>{
 for(const provider of ['phone','google']){
  const raw=user();raw.identities[0].provider=provider;raw.email_confirmed_at=null;raw.phone_confirmed_at=provider==='phone'?'2026-10-19T00:00:00Z':null;
  assert.deepEqual(await authenticateMeneiAccount(request(),env,{now,fetcher:async()=>response(raw)}),{id});
 }
});

test('only publishable key configuration is accepted and no key or token is exposed by errors',async()=>{
 let calls=0;const fetcher=async()=>{calls++;return response(user())};
 for(const key of [undefined,'sb_secret_synthetic_not_a_real_key',token(),'service_role'])await rejects(()=>authenticateMeneiAccount(request(),{MENEI_TEST_PUBLISHABLE_KEY:key},{now,fetcher}),'menei_auth_unavailable',503);
 assert.equal(calls,0);
});

test('provider failures and redirects produce generic errors with one request and unread error bodies',async()=>{
 for(const status of [401,403,429,500,503,301,302,303,307,308]){
  let calls=0,read=false;
  const fetcher=async(_url,options)=>{assert.equal(options.redirect,'manual');calls++;return {ok:false,status,body:{cancel:async()=>{}},text:()=>{read=true;throw Error(token())}}};
  await rejects(()=>authenticateMeneiAccount(request(),env,{now,fetcher}),status===401||status===403?'invalid_menei_account':'menei_auth_unavailable',status===401||status===403?401:503);
  assert.equal(calls,1);assert.equal(read,false);
 }
 await rejects(()=>authenticateMeneiAccount(request(),env,{now,fetcher:async()=>{throw Error(env.MENEI_TEST_PUBLISHABLE_KEY+token())}}),'menei_auth_unavailable',503);
});

test('bounded response rejects oversize headers and streamed bodies, malformed JSON, and invalid UTF-8',async()=>{
 for(const makeResponse of [()=>new Response('{}',{headers:{'content-length':'65537'}}),()=>new Response(' '.repeat(65537)),()=>new Response('{broken JSON'),()=>new Response(Uint8Array.of(0xff))])
  await rejects(()=>authenticateMeneiAccount(request(),env,{now,fetcher:async()=>makeResponse()}),'menei_auth_unavailable',503);
 await rejects(()=>authenticateMeneiAccount(request(),env,{now,fetcher:async()=>new Response('null')}));
});

test('timeout bounds a provider that ignores abort and does not retry',async()=>{
 let calls=0,signal;
 await rejects(()=>authenticateMeneiAccount(request(),env,{now,timeoutMs:5,fetcher:async(_url,options)=>{calls++;signal=options.signal;return new Promise(()=>{})}}),'menei_auth_unavailable',503);
 assert.equal(calls,1);assert.equal(signal.aborted,true);
});

test('timeout bounds a stalled response body and tokens are revalidated on every call',async()=>{
 let cancelled=false;
 const body=new ReadableStream({start(controller){controller.enqueue(new TextEncoder().encode('{'))},cancel(){cancelled=true}});
 await rejects(()=>authenticateMeneiAccount(request(),env,{now,timeoutMs:5,fetcher:async()=>new Response(body)}),'menei_auth_unavailable',503);assert.equal(cancelled,true);
 let calls=0;const input=request(),fetcher=async()=>{calls++;return response(user())};
 assert.deepEqual(await authenticateMeneiAccount(input,env,{now,fetcher}),{id});
 assert.deepEqual(await authenticateMeneiAccount(input,env,{now,fetcher}),{id});assert.equal(calls,2);
 await rejects(()=>authenticateMeneiAccount(input,env,{now:()=>instant+3600000,fetcher}));assert.equal(calls,2);
});

test('a token that expires while Auth is responding is rejected',async()=>{
 let clock=instant;
 await rejects(()=>authenticateMeneiAccount(request(),env,{now:()=>clock,fetcher:async()=>{clock+=3600000;return response(user())}}));
});
