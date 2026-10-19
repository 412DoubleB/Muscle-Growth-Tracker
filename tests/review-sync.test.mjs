import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../core.mjs';
import {addOriginalRecipes} from '../nutrition.mjs';
import {CloudSync} from '../cloud.mjs';

const project='bhyrrxrpqaxiwpfxnwpa',origin='https://'+project+'.supabase.co',account='synthetic-review-account';
const stamp='2026-11-02T12:00:00.000Z';
const memory=()=>{const rows=new Map();return {rows,getItem:key=>rows.get(key)??null,setItem:(key,value)=>rows.set(key,String(value)),removeItem:key=>rows.delete(key)}};
// JSONB changes object key order, while preserving array order and JSON values.
function jsonb(value){
 const reorder=item=>Array.isArray(item)?item.map(reorder):item&&typeof item==='object'?Object.fromEntries(Object.keys(item).sort((a,b)=>a.length-b.length||(a<b?-1:a>b?1:0)).map(key=>[key,reorder(item[key])])):item;
 return reorder(JSON.parse(JSON.stringify(value)));
}
const active=state=>{const value=C.clone(state);for(const key of ['updatedAt','conflicts','resolvedConflicts','legacySnapshots'])delete value[key];return value};
function workspace(){
 const state=C.defaultState();state.ownerId=account;state.createdAt=stamp;state.training.startDate='2026-11-02';
 state.nutrition={...state.nutrition,diet:'Vegetarian',servings:3,mealRepeatDays:9,notes:'Synthetic current preferences',updatedAt:stamp};
 addOriginalRecipes(state);
 const exercise=C.makeExercise(C.CATALOG[0]);Object.assign(exercise.sets[0],{w:0,r:12,rir:0,done:true,unknownDetail:{retain:['ordered','evidence']}});
 state.logs['2026-11-02']={id:'2026-11-02',date:'2026-11-02',title:'Synthetic completed workout',kind:'strength',gymId:'station',status:'completed',exercises:[exercise],updatedAt:stamp};
 state.legacySnapshots=[{id:'source-z',data:{retained:['second alphabetically','listed first']}},{id:'source-a',data:{retained:['first alphabetically','listed second']}}];
 const records=[...state.recipes.map(record=>['recipes',record.id,record]),...state.gyms.map(record=>['gyms',record.id,record]),...state.gymSchedules.map(record=>['gymSchedules',record.id,record]),...['profile','training','reminders'].map(key=>[key,key,state[key]])];
 state.conflicts=records.map(([collection,key,record],index)=>({id:'matching-'+index,collection,key,local:C.clone(record),remote:jsonb(record),reason:'Synthetic saved copies',createdAt:stamp}));
 state.conflicts.push({id:'nutrition-review',collection:'nutrition',key:'nutrition',local:{...C.clone(state.nutrition),diet:'Any',notes:'Synthetic older A'},remote:{...C.clone(state.nutrition),diet:'Mediterranean',notes:'Synthetic older B'},reason:'Synthetic differing older preferences',createdAt:stamp});
 assert.equal(state.conflicts.length,107);return state;
}
function database(initial){
 const db={state:jsonb(initial),version:1,commits:0,attempts:0,requests:[]};
 db.fetcher=async(url,options)=>{
  assert.ok(url.startsWith(origin+'/'),'Only the isolated synthetic target is allowed');assert.equal(options.credentials,'omit');assert.equal(options.redirect,'error');db.requests.push(url);
  const response=(data,status=200)=>({ok:status<400,status,text:async()=>JSON.stringify(data)});
  if(url.includes('/rest/v1/mgt_beta_states?'))return response([{app_data:C.clone(db.state),version:db.version}]);
  assert.ok(url.endsWith('/rest/v1/rpc/mgt_beta_commit'),'Unexpected synthetic transport request');
  db.attempts++;const body=JSON.parse(options.body);
  if(body.expected_version!==db.version)return response({code:'40001',message:'Revision changed'},409);
  assert.equal(body.payload.ownerId,account);db.state=jsonb(body.payload);db.version++;db.commits++;return response({version:db.version});
 };
 return db;
}
function device(initial,db){
 const storage=memory(),store=new C.LocalStore(storage);let state=store.load(account);Object.assign(state,C.clone(initial));store.save(state);
 storage.setItem('MGT_BETA_CLOUD_CONFIG:'+project,JSON.stringify({url:origin,key:'sb_publishable_synthetic'}));
 storage.setItem('MGT_BETA_AUTH:'+project,JSON.stringify({access_token:'synthetic-access',refresh_token:'synthetic-refresh',expires_at:Date.now()/1000+3600,user:{id:account}}));
 storage.setItem('MGT_BETA_SYNC_BASE:'+project+':'+account,JSON.stringify({state:C.clone(initial),version:db.version,at:stamp}));
 const cloud=new CloudSync({storage,allowedProject:project,fetcher:db.fetcher,getState:()=>state,applyState:next=>{state=next;store.save(state)}});
 return {cloud,storage,store,get state(){return state},persist(){store.save(state)}};
}
const reviewedById=state=>new Map(C.reviewedConflicts(state).map(entry=>[entry.id,entry]));

test('concurrent device reviews preserve 107 recoveries and converge without repeated cloud writes',async()=>{
 const initial=workspace(),expectedActive=active(initial),pending=C.clone(initial.conflicts),db=database(initial),a=device(initial,db),b=device(initial,db);
 try{
  // Both people act against the same saved revision before either device syncs.
  C.keepCurrentConflict(a.state,'nutrition-review');a.persist();
  C.acknowledgeMatchingConflicts(b.state);b.persist();
  const expectedArchives=new Map([...reviewedById(a.state),...reviewedById(b.state)]);
  assert.equal(expectedArchives.size,107);
  await Promise.all([a.cloud.sync(),b.cloud.sync()]);
  await a.cloud.sync();await b.cloud.sync();
  for(const state of [a.state,b.state,db.state]){
   assert.ok(C.jsonEqual(active(state),expectedActive));assert.deepEqual(state.conflicts,[]);
   assert.equal(C.reviewedConflicts(state).length,107);assert.equal(new Set(state.resolvedConflicts).size,107);
   for(const original of pending)assert.ok(state.resolvedConflicts.includes(original.id));
   for(const [id,archive]of expectedArchives)assert.ok(C.jsonEqual(reviewedById(state).get(id),archive),'Both devices must retain the full recovery entry '+id);
   assert.ok(C.jsonEqual(state.legacySnapshots.filter(entry=>entry.kind!=='reviewed-conflict'),initial.legacySnapshots));
  }
  const committed=db.commits;assert.equal(committed,2,'Each explicit independent review should publish once');
  for(let cycle=0;cycle<3;cycle++){await a.cloud.sync();await b.cloud.sync()}
  assert.equal(db.commits,committed,'Stable copies must not keep writing because review or marker order differs');
  assert.deepEqual(a.state.conflicts,[]);assert.deepEqual(b.state.conflicts,[]);
  assert.ok(C.jsonEqual(active(a.state),expectedActive));assert.ok(C.jsonEqual(active(b.state),expectedActive));
 }finally{a.cloud.stop();b.cloud.stop()}
});

test('older-client review ordering does not trigger a counter-write or reorder original source records',async()=>{
 const initial=workspace();C.keepCurrentConflict(initial,'nutrition-review');C.acknowledgeMatchingConflicts(initial);
 initial.legacySnapshots=C.orderReviewedSnapshots(initial.legacySnapshots);
 const originals=initial.legacySnapshots.filter(entry=>entry.kind!=='reviewed-conflict'),reviews=C.reviewedConflicts(initial).slice().reverse();
 const remote=C.clone(initial);remote.legacySnapshots=[reviews[0],originals[0],...reviews.slice(1,5),originals[1],...reviews.slice(5)];remote.resolvedConflicts=remote.resolvedConflicts.slice().reverse();
 const remoteBefore=C.clone(remote),db=database(remote),client=device(initial,db);
 try{
  for(let cycle=0;cycle<3;cycle++)await client.cloud.sync();
  assert.equal(db.commits,0,'An older client’s review placement and marker ordering do not alter saved content');
  assert.ok(C.jsonEqual(db.state,remoteBefore),'Read-only synchronization must leave the older cloud representation alone');
  assert.ok(C.jsonEqual(client.state.legacySnapshots.filter(entry=>entry.kind!=='reviewed-conflict'),originals));
  for(const entry of reviews)assert.ok(C.jsonEqual(reviewedById(client.state).get(entry.id),entry));
  assert.deepEqual(client.state.conflicts,[]);

  // A real update to an archived value must still reach this device, including
  // the order of an array inside the saved evidence.
  const changed=db.state.legacySnapshots.find(entry=>entry.kind==='reviewed-conflict');
  changed.data.current.value.syntheticEvidence=['later','earlier'];db.version++;
  const expected=C.clone(changed);await client.cloud.sync();
  assert.ok(C.jsonEqual(reviewedById(client.state).get(changed.id),expected));
  assert.deepEqual(reviewedById(client.state).get(changed.id).data.current.value.syntheticEvidence,['later','earlier']);
  assert.equal(db.commits,0);assert.ok(C.jsonEqual(active(client.state),active(initial)));
 }finally{client.cloud.stop()}
});

test('review ordering preserves authored arrays and actual recovery values as meaningful content',()=>{
 const initial=workspace();C.keepCurrentConflict(initial,'nutrition-review');C.acknowledgeMatchingConflicts(initial);
 const ordered=C.orderReviewedSnapshots(initial.legacySnapshots),changed=C.clone(ordered);
 changed.find(entry=>entry.kind==='reviewed-conflict').data.current.value.syntheticEvidence=['one','two'];
 assert.equal(C.jsonEqual(ordered,C.orderReviewedSnapshots(changed)),false);
 const reversed=C.clone(changed);reversed.find(entry=>entry.kind==='reviewed-conflict').data.current.value.syntheticEvidence.reverse();
 assert.equal(C.jsonEqual(C.orderReviewedSnapshots(changed),C.orderReviewedSnapshots(reversed)),false);
 const differentSourceOrder=C.clone(ordered),first=differentSourceOrder.shift(),second=differentSourceOrder.shift();differentSourceOrder.unshift(second,first);
 assert.equal(C.jsonEqual(ordered,C.orderReviewedSnapshots(differentSourceOrder)),false,'Original source order is preserved, not normalized away');
 assert.deepEqual(ordered.slice(0,2),initial.legacySnapshots.slice(0,2));
});
