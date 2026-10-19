import test from 'node:test';
import assert from 'node:assert/strict';
import {CloudSync} from '../cloud.mjs';
import {clone,defaultState,makeExercise,CATALOG} from '../core.mjs';
import {addOriginalRecipes} from '../nutrition.mjs';

const owner='synthetic-jsonb-owner',baseKey='MGT_BETA_SYNC_BASE:'+owner;
const response=(data,status=200)=>({ok:status<400,status,text:async()=>JSON.stringify(data)});
// Exercise the database JSON wire behavior independently of the app comparator:
// omit undefined object fields and reorder every object, retaining array order.
function jsonb(value){
 const reorder=value=>Array.isArray(value)?value.map(reorder):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort((a,b)=>a.length-b.length||a.localeCompare(b)).map(key=>[key,reorder(value[key])])):value;
 return reorder(JSON.parse(JSON.stringify(value)));
}
function workspace({existingConflicts=0}={}){
 const state=defaultState();state.ownerId=owner;state.training.startDate='2026-11-02';addOriginalRecipes(state);
 const exercise=makeExercise(CATALOG[0]);Object.assign(exercise.sets[0],{w:40,r:10,rir:2,done:true});
 state.logs['2026-11-02']={id:'2026-11-02',date:'2026-11-02',title:'Synthetic workout',kind:'strength',status:'completed',gymId:'crunch',exercises:[exercise],updatedAt:'2026-11-02T12:00:00.000Z'};
 state.notificationSchedule={'2026-11-03':{kind:'strength',title:'Synthetic upcoming session',status:undefined,details:{unknown:undefined,enabled:false}}};
 state.conflicts=Array.from({length:existingConflicts},(_,i)=>({id:'preserved-conflict-'+i,collection:'recipes',key:'synthetic-recipe-'+i,local:{name:'Synthetic local '+i,notes:'Keep this version'},remote:{name:'Synthetic remote '+i,notes:'Keep this version too'},reason:'Existing unresolved review',createdAt:'2026-11-02T12:00:00.000Z'}));
 return state;
}
function fakeDatabase(initial){
 let row={app_data:jsonb(initial),version:4};const commits=[],requests=[];let beforeReply=null;
 return {commits,requests,get row(){return clone(row)},set beforeReply(fn){beforeReply=fn},async fetcher(url,options){
  requests.push({url,method:options.method});
  if(url.includes('/mgt_beta_states?'))return response([jsonb(row)]);
  assert.ok(url.endsWith('/rpc/mgt_beta_commit'),'Synthetic transport accepts snapshot requests only');
  const body=JSON.parse(options.body);
  if(body.expected_version!==row.version)return response({code:'40001',message:'Synthetic revision changed'},409);
  commits.push(clone(body));row={app_data:jsonb(body.payload),version:row.version+1};
  beforeReply?.();return response({version:row.version});
 }};
}
function device(database,initial,{base=initial,applyTransform=value=>value}={}){
 const rows=new Map(),storage={getItem:key=>rows.get(key)??null,setItem:(key,value)=>rows.set(key,String(value)),removeItem:key=>rows.delete(key)};
 storage.setItem('MGT_BETA_CLOUD_CONFIG',JSON.stringify({url:'https://synthetic-jsonb.supabase.co',key:'sb_publishable_synthetic'}));
 storage.setItem('MGT_BETA_AUTH',JSON.stringify({access_token:'synthetic-jsonb-token',refresh_token:'synthetic-jsonb-refresh',expires_at:Date.now()/1000+3600,user:{id:owner}}));
 if(base)storage.setItem(baseKey,JSON.stringify({state:base,version:database.row.version}));
 let state=clone(initial),scheduled=0;
 const cloud=new CloudSync({storage,fetcher:database.fetcher,getState:()=>state,applyState:value=>{state=applyTransform(clone(value))}});
 cloud.schedule=()=>{scheduled++};
 return {cloud,storage,get state(){return state},set state(value){state=value},get scheduled(){return scheduled}};
}

test('unchanged seeded state survives repeated JSONB round trips without conflicts or commits',async()=>{
 const initial=workspace(),database=fakeDatabase(initial),client=device(database,initial,{base:null});
 assert.equal(initial.recipes.length,100);assert.notEqual(JSON.stringify(initial),JSON.stringify(database.row.app_data));
 assert.equal(Object.hasOwn(initial.notificationSchedule['2026-11-03'],'status'),true);
 assert.equal(Object.hasOwn(database.row.app_data.notificationSchedule['2026-11-03'],'status'),false);
 for(let i=0;i<4;i++)await client.cloud.sync();
 assert.equal(database.commits.length,0);assert.equal(client.scheduled,0);assert.deepEqual(client.state.conflicts,[]);assert.equal(client.cloud.lastStatus,'Up to date');
 assert.deepEqual(client.state.logs,initial.logs);assert.deepEqual(client.state.recipes,initial.recipes);client.cloud.stop();
});

test('existing 108 conflicts and both versions remain unchanged during a no-edit JSONB round trip',async()=>{
 const initial=workspace({existingConflicts:108}),before=clone(initial.conflicts),database=fakeDatabase(initial),client=device(database,initial);
 for(let i=0;i<3;i++)await client.cloud.sync();
 assert.deepEqual(client.state.conflicts,before);assert.deepEqual(client.state.resolvedConflicts,[]);assert.equal(database.commits.length,0);
 assert.equal(client.cloud.lastStatus,'Synced · 108 conflicts to review');client.cloud.stop();
});

test('one real local set edit commits once and subsequent reordered reads quiesce',async()=>{
 const initial=workspace(),database=fakeDatabase(initial),edited=clone(initial);
 edited.logs['2026-11-02'].exercises[0].sets[0].w=45;edited.logs['2026-11-02'].updatedAt='2026-11-03T12:00:00.000Z';
 const client=device(database,edited,{base:initial});
 await client.cloud.sync();assert.equal(database.commits.length,1);
 for(let i=0;i<4;i++)await client.cloud.sync();
 assert.equal(database.commits.length,1);assert.equal(client.scheduled,0);assert.deepEqual(client.state.conflicts,[]);
 assert.equal(database.row.app_data.logs['2026-11-02'].exercises[0].sets[0].w,45);assert.equal(client.cloud.lastStatus,'Up to date');client.cloud.stop();
});

test('key order and only the root storage timestamp do not schedule a false pending edit',async()=>{
 const initial=workspace(),database=fakeDatabase(initial),edited=clone(initial);edited.profile.name='Synthetic edited name';
 const client=device(database,edited,{base:initial});
 database.beforeReply=()=>{client.state=jsonb(client.state);client.state.updatedAt='2027-01-01T00:00:00.000Z'};
 await client.cloud.sync();assert.equal(database.commits.length,1);assert.equal(client.scheduled,0);
 await client.cloud.sync();assert.equal(database.commits.length,1);assert.equal(client.cloud.lastStatus,'Up to date');client.cloud.stop();
});

test('a real pending nested timestamp or ordered-array edit is still detected and synchronized',async t=>{
 for(const change of ['nested-timestamp','array-order'])await t.test(change,async()=>{
  const initial=workspace();initial.routines=[{id:'synthetic-routine',name:'Ordered routine',exercises:[{id:'first'},{id:'second'}],updatedAt:'2026-11-02T12:00:00.000Z'}];
  const database=fakeDatabase(initial),edited=clone(initial);edited.profile.name='Synthetic edited name';
  const client=device(database,edited,{base:initial});
  database.beforeReply=()=>{database.beforeReply=null;if(change==='nested-timestamp')client.state.profile.updatedAt='2027-01-01T00:00:00.000Z';else client.state.routines[0].exercises.reverse()};
  await client.cloud.sync();assert.equal(client.scheduled,1);assert.equal(database.commits.length,1);
  await client.cloud.sync();assert.equal(database.commits.length,2);
  await client.cloud.sync();assert.equal(database.commits.length,2);assert.deepEqual(client.state.conflicts,[]);
  if(change==='nested-timestamp')assert.equal(database.row.app_data.profile.updatedAt,'2027-01-01T00:00:00.000Z');
  else assert.deepEqual(database.row.app_data.routines[0].exercises.map(exercise=>exercise.id),['second','first']);
  client.cloud.stop();
 });
});

test('two synthetic devices retain concurrent set edits and every existing conflict after JSONB reads',async()=>{
 const initial=workspace({existingConflicts:108}),database=fakeDatabase(initial),a=device(database,initial),b=device(database,initial);
 a.state.logs['2026-11-02'].exercises[0].sets[0].w=45;a.state.logs['2026-11-02'].updatedAt='2026-11-03T12:00:00.000Z';
 b.state.logs['2026-11-02'].exercises[0].sets[0].w=50;b.state.logs['2026-11-02'].updatedAt='2026-11-03T12:01:00.000Z';
 await a.cloud.sync();await b.cloud.sync();await a.cloud.sync();
 assert.equal(database.commits.length,2);
 for(const client of [a,b]){
  assert.equal(client.state.conflicts.length,109);assert.deepEqual(client.state.resolvedConflicts,[]);
  for(const conflict of initial.conflicts)assert.deepEqual(client.state.conflicts.find(value=>value.id===conflict.id),conflict);
  const concurrent=client.state.conflicts.find(conflict=>conflict.collection==='logs');
  assert.equal(concurrent.local.exercises[0].sets[0].w,50);assert.equal(concurrent.remote.exercises[0].sets[0].w,45);
 }
 const ids=a.state.conflicts.map(conflict=>conflict.id);
 for(let i=0;i<3;i++){await a.cloud.sync();await b.cloud.sync()}
 assert.equal(database.commits.length,2);assert.deepEqual(a.state.conflicts.map(conflict=>conflict.id),ids);assert.deepEqual(b.state.conflicts.map(conflict=>conflict.id),ids);a.cloud.stop();b.cloud.stop();
});
