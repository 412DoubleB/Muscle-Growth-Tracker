import test from 'node:test';
import assert from 'node:assert/strict';
import {CloudSync} from '../cloud.mjs';
import {clone,defaultState} from '../core.mjs';

const deferred=()=>{let resolve;const promise=new Promise(done=>resolve=done);return {promise,resolve}};
const response=(data,status=200)=>({ok:status<400,status,text:async()=>JSON.stringify(data)});
const session=(id,expired=false)=>({access_token:'synthetic-'+id,refresh_token:'refresh-'+id,expires_at:Date.now()/1000+(expired?-60:3600),user:{id}});
const workspace=id=>{const state=defaultState();state.ownerId=id;state.profile.name='Synthetic '+id;return state};
function fixture(fetcher){
 const values=new Map(),storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key)};
 storage.setItem('MGT_BETA_CLOUD_CONFIG',JSON.stringify({url:'https://synthetic.supabase.co',key:'sb_publishable_synthetic'}));
 storage.setItem('MGT_BETA_AUTH',JSON.stringify(session('account-a')));
 let state=workspace('account-a');const applied=[],requests=[];
 const cloud=new CloudSync({storage,getState:()=>state,applyState:value=>{applied.push(clone(value));state=value},onAccount:user=>{state=workspace(user?.id||null)},fetcher:async(url,options)=>{requests.push({url,options});return fetcher(url,options)}});
 return {cloud,storage,applied,requests,get state(){return state},switchTo(id){cloud.saveSession(session(id));state=workspace(id)}};
}

test('a snapshot arriving after an account switch cannot alter the new workspace or upload it',async()=>{
 const read=deferred(),started=deferred();
 const f=fixture(async url=>{assert.match(url,/mgt_beta_states/);started.resolve();return read.promise});
 f.cloud.preferRemoteOnFirstSync=true;
 const syncing=f.cloud.sync();await started.promise;f.switchTo('account-b');
 const before=clone(f.state),auth=f.storage.getItem('MGT_BETA_AUTH');
 read.resolve(response([{app_data:workspace('account-a'),version:3}]));await syncing;
 assert.deepEqual(f.state,before);assert.deepEqual(f.applied,[]);assert.equal(f.requests.length,1);
 assert.equal(f.storage.getItem('MGT_BETA_AUTH'),auth);assert.equal(f.storage.getItem('MGT_BETA_SYNC_BASE:account-a'),null);assert.equal(f.storage.getItem('MGT_BETA_SYNC_BASE:account-b'),null);
 f.cloud.stop();
});

test('signing out cancels a pending read even when the same account signs in again',async()=>{
 const read=deferred(),started=deferred();
 const f=fixture(async url=>{if(url.includes('/auth/v1/logout'))return response(null);started.resolve();return read.promise});
 const syncing=f.cloud.sync();await started.promise;await f.cloud.signOut();f.switchTo('account-a');
 const before=clone(f.state),status=f.cloud.lastStatus;
 const remote=workspace('account-a');remote.profile.name='Old in-flight snapshot';
 read.resolve(response([{app_data:remote,version:3}]));await syncing;
 assert.deepEqual(f.state,before);assert.deepEqual(f.applied,[]);assert.equal(f.cloud.lastStatus,status);
 assert.equal(f.requests.filter(r=>r.url.includes('mgt_beta_commit')).length,0);assert.equal(f.storage.getItem('MGT_BETA_SYNC_BASE:account-a'),null);
 f.cloud.stop();
});

test('a late refresh cannot restore a session after sign-out or replace a new account',async t=>{
 for(const replacement of [null,'account-b'])await t.test(String(replacement),async()=>{
  const refresh=deferred(),started=deferred();
  const f=fixture(async url=>{if(url.includes('/auth/v1/logout'))return response(null);assert.match(url,/grant_type=refresh_token/);started.resolve();return refresh.promise});
  f.cloud.saveSession(session('account-a',true));
  const syncing=f.cloud.sync();await started.promise;await f.cloud.signOut();if(replacement)f.switchTo(replacement);
  const before=clone(f.state),auth=f.storage.getItem('MGT_BETA_AUTH');
  refresh.resolve(response(session('account-a')));await syncing;
  assert.equal(f.cloud.session?.user?.id||null,replacement);assert.equal(f.storage.getItem('MGT_BETA_AUTH'),auth);
  assert.deepEqual(f.state,before);assert.deepEqual(f.applied,[]);assert.equal(f.requests.filter(r=>r.url.includes('mgt_beta_')).length,0);
  f.cloud.stop();
 });
});

test('a commit acknowledgement arriving after an account switch does not store a stale sync base',async()=>{
 const committed=deferred(),started=deferred();
 const f=fixture(async url=>{if(url.includes('mgt_beta_states'))return response([]);assert.match(url,/mgt_beta_commit/);started.resolve();return committed.promise});
 const syncing=f.cloud.sync();await started.promise;assert.equal(f.applied.length,1);f.switchTo('account-b');
 const before=clone(f.state),applied=f.applied.length;
 committed.resolve(response({version:1}));await syncing;
 assert.deepEqual(f.state,before);assert.equal(f.applied.length,applied);
 assert.equal(f.storage.getItem('MGT_BETA_SYNC_BASE:account-a'),null);assert.equal(f.storage.getItem('MGT_BETA_SYNC_BASE:account-b'),null);
 assert.equal(f.requests.length,2);assert.equal(f.requests[1].options.headers.Authorization,'Bearer synthetic-account-a');
 f.cloud.stop();
});

test('an authenticated request cannot send an old payload using a replacement account token',async()=>{
 const refresh=deferred(),started=deferred();
 const f=fixture(async url=>{assert.match(url,/grant_type=refresh_token/);started.resolve();return refresh.promise});
 f.cloud.saveSession(session('account-a',true));
 const request=f.cloud.request('/rest/v1/rpc/mgt_beta_commit',{method:'POST',body:{expected_version:0,payload:workspace('account-a')}});
 const rejected=assert.rejects(request,{name:'AbortError'});
 await started.promise;f.switchTo('account-b');refresh.resolve(response(session('account-a')));await rejected;
 assert.equal(f.requests.length,1);assert.equal(f.cloud.session.user.id,'account-b');assert.equal(f.storage.getItem('MGT_BETA_SYNC_BASE:account-a'),null);
 f.cloud.stop();
});

test('a sign-in response received after sign-out cannot reopen the account',async()=>{
 const login=deferred(),started=deferred();
 const f=fixture(async url=>{if(url.includes('/auth/v1/logout'))return response(null);assert.match(url,/grant_type=password/);started.resolve();return login.promise});
 const signingIn=f.cloud.signIn('synthetic@example.invalid','synthetic-password');
 const rejected=assert.rejects(signingIn,{name:'AbortError'});
 await started.promise;await f.cloud.signOut();login.resolve(response(session('account-b')));await rejected;
 assert.equal(f.cloud.session,null);assert.equal(f.storage.getItem('MGT_BETA_AUTH'),null);assert.equal(f.state.ownerId,null);assert.deepEqual(f.applied,[]);
 f.cloud.stop();
});

test('a slow logout response cannot clear a replacement session or its workspace',async()=>{
 const logout=deferred(),started=deferred();
 const f=fixture(async url=>{assert.match(url,/auth\/v1\/logout/);started.resolve();return logout.promise});
 const signingOut=f.cloud.signOut();await started.promise;
 assert.equal(f.cloud.session,null);assert.equal(f.state.ownerId,null);
 f.switchTo('account-b');const before=clone(f.state),auth=f.storage.getItem('MGT_BETA_AUTH');
 logout.resolve(response(null));await signingOut;
 assert.equal(f.cloud.session.user.id,'account-b');assert.equal(f.storage.getItem('MGT_BETA_AUTH'),auth);assert.deepEqual(f.state,before);
 assert.equal(f.requests[0].options.headers.Authorization,'Bearer synthetic-account-a');
 f.cloud.stop();
});

test('pending signup and email callback responses cannot restore a signed-out session',async t=>{
 const previousLocation=globalThis.location,previousHistory=globalThis.history;
 globalThis.location={origin:'https://synthetic.example.invalid',pathname:'/',search:'',hash:'#access_token=synthetic&refresh_token=synthetic&type=recovery'};
 globalThis.history={replaceState(){}};
 try{
  for(const method of ['signUp','acceptCallback'])await t.test(method,async()=>{
   const auth=deferred(),started=deferred();
   const f=fixture(async url=>{if(url.includes('/auth/v1/logout'))return response(null);started.resolve();return auth.promise});
   const pending=f.cloud[method]('synthetic@example.invalid','synthetic-password');
   const rejected=assert.rejects(pending,{name:'AbortError'});
   await started.promise;await f.cloud.signOut();auth.resolve(response(method==='signUp'?session('account-b'):{id:'account-b'}));await rejected;
   assert.equal(f.cloud.session,null);assert.equal(f.storage.getItem('MGT_BETA_AUTH'),null);assert.equal(f.state.ownerId,null);assert.deepEqual(f.applied,[]);
   f.cloud.stop();
  });
 }finally{
  if(previousLocation===undefined)delete globalThis.location;else globalThis.location=previousLocation;
  if(previousHistory===undefined)delete globalThis.history;else globalThis.history=previousHistory;
 }
});

test('a successful same-account refresh still allows synchronization and preserves its workspace',async()=>{
 const f=fixture(async url=>url.includes('grant_type=refresh_token')?response(session('account-a')):url.includes('mgt_beta_states')?response([]):response({version:1}));
 f.cloud.saveSession(session('account-a',true));const before=clone(f.state);
 await f.cloud.sync();assert.deepEqual(f.state,before);assert.equal(f.applied.length,1);assert.equal(f.requests.length,3);
 assert.equal(JSON.parse(f.storage.getItem('MGT_BETA_SYNC_BASE:account-a')).version,1);assert.equal(f.cloud.session.user.id,'account-a');
 f.cloud.stop();
});
