import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../core.mjs';
import {addOriginalRecipes} from '../nutrition.mjs';
import {CloudSync} from '../cloud.mjs?v=8.2.0';

function syntheticWorkspace(){
 const state=C.defaultState();state.training.startDate='2026-11-02';state.nutrition={...state.nutrition,diet:'Vegetarian',servings:3,mealRepeatDays:9,notes:'Current synthetic preferences',setupPromptSeen:true};
 addOriginalRecipes(state);
 const exercise=C.makeExercise(C.CATALOG[0]);Object.assign(exercise.sets[0],{w:0,r:12,rir:0,done:true,futureAnnotation:{note:'Keep synthetic detail'}});
 state.logs['2026-11-02']={id:'2026-11-02',date:'2026-11-02',title:'Synthetic completed workout',kind:'strength',gymId:'station',status:'completed',exercises:[exercise]};
 state.legacySnapshots=[{id:'synthetic-original-backup',data:{originalRecord:'Keep this source'}}];
 const records=[...state.recipes.map(value=>['recipes',value.id,value]),['profile','profile',state.profile],['training','training',state.training],['reminders','reminders',state.reminders],...state.gyms.map(value=>['gyms',value.id,value]),['gymSchedules',state.gymSchedules[0].id,state.gymSchedules[0]]];
 state.conflicts=records.map(([collection,key,value],i)=>({id:'matching-'+i,collection,key,local:{...C.clone(value),updatedAt:'2026-11-01T00:00:00.000Z'},remote:{updatedAt:'2026-11-02T00:00:00.000Z',...C.clone(value)},reason:'Synthetic saved copies',createdAt:'2026-11-02T00:00:00.000Z'}));
 const historical={...C.clone(state.nutrition),diet:'Any',servings:1,mealRepeatDays:2};
 state.conflicts.unshift({id:'different-nutrition',collection:'nutrition',key:'nutrition',local:{...historical,notes:'Historical saved A'},remote:{...historical,notes:'Historical saved B'},reason:'Both devices edited this item.',createdAt:'2026-11-02T00:00:00.000Z'});
 // Equal historical copies must not replace a newer active recipe during bulk review.
 state.recipes[0].name='Current synthetic recipe name';
 return state;
}
function environment(source){
 const names=['document','localStorage','sessionStorage','window','navigator','location','history','confirm','setInterval','setTimeout','fetch'];
 const previous=new Map(names.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]));
 const rows=new Map([['MGT_BETA_V8:guest',JSON.stringify(source)]]),elements=new Map(),listeners=new Map(),writes=[];let failWorkspaceSave=false;
 class Element{
  constructor(id){Object.assign(this,{id,innerHTML:'',textContent:'',value:'',open:false,dataset:{},elements:{},classList:{add(){},remove(){}}})}
  addEventListener(){}showModal(){this.open=true}close(){this.open=false}focus(){}
 }
 globalThis.document={documentElement:{dataset:{preview:'local'}},getElementById:id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id)},activeElement:{tagName:'BODY'},hidden:false,addEventListener:(name,fn)=>listeners.set(name,[...(listeners.get(name)||[]),fn]),querySelector:selector=>selector==='dialog[open]'&&elements.get('modal')?.open?elements.get('modal'):null,querySelectorAll:()=>[]};
 globalThis.localStorage={getItem:key=>rows.get(key)??null,setItem:(key,value)=>{writes.push(key);if(failWorkspaceSave&&key==='MGT_BETA_V8:guest'){failWorkspaceSave=false;throw Error('Synthetic storage quota reached')}rows.set(key,String(value))},removeItem(){assert.fail('Review must not remove storage keys')}};
 globalThis.sessionStorage={getItem:()=>null,setItem(){},removeItem(){}};globalThis.window={addEventListener(){},scrollTo(){}};
 Object.defineProperty(globalThis,'navigator',{value:{onLine:true,vibrate(){}},configurable:true});
 globalThis.location={origin:'https://synthetic.example.invalid',pathname:'/',href:'https://synthetic.example.invalid/',hash:'',search:''};globalThis.history={replaceState(){}};
 globalThis.confirm=()=>assert.fail('Review does not require a new backup or confirmation gate');globalThis.setInterval=()=>0;globalThis.setTimeout=()=>0;
 globalThis.fetch=async request=>{assert.ok(['./config.json','./media-manifest.json'].includes(request),'Review test makes no backend requests');return {ok:true,json:async()=>request==='./config.json'?{}:{exercises:[],assets:[],lookup:{}}}};
 return {rows,elements,writes,failNextWorkspaceSave(){failWorkspaceSave=true},get state(){return JSON.parse(rows.get('MGT_BETA_V8:guest'))},async click(action,data={}){const button={dataset:{action,...data},disabled:false};for(const listener of listeners.get('click')||[])listener({target:{closest:()=>button},preventDefault(){}});await new Promise(resolve=>setImmediate(resolve))},restore(){for(const [name,descriptor]of previous)if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name]}};
}
const active=state=>Object.fromEntries(['profile','training','nutrition','gyms','gymSchedules','logs','plan','meals','recipes','routines','reminders'].map(key=>[key,C.clone(state[key])]));

test('opening the real review dialog is read-only and clearly separates active settings from saved copies',async()=>{
 const env=environment(syntheticWorkspace());
 try{
  await import('../app.mjs?conflict-review=open');const before=env.rows.get('MGT_BETA_V8:guest'),writes=env.writes.length;
  await env.click('conflicts');const html=env.elements.get('modalBody').innerHTML;
  assert.equal(env.rows.get('MGT_BETA_V8:guest'),before);assert.equal(env.writes.length,writes);assert.equal(env.elements.get('modal').open,true);
  assert.match(html,/Current nutrition settings/);assert.match(html,/Diet: Vegetarian · Household cooking: 3× · Meal repeat gap: 9 days/);
  assert.match(html,/Acknowledge 106 matching copies/);assert.match(html,/Keep current settings/);assert.match(html,/Use saved version A/);assert.match(html,/Use saved version B/);
  assert.doesNotMatch(html,/Keep this device version|Use other version/);
  assert.equal(env.state.conflicts.length,107);assert.equal(C.reviewedConflicts(env.state).length,0);
 }finally{env.restore()}
});

test('keep current then acknowledge matching copies archives all 107 without changing active values',async t=>{
 const env=environment(syntheticWorkspace());let scheduled=0;t.mock.method(CloudSync.prototype,'schedule',()=>{scheduled++});
 try{
  await import('../app.mjs?conflict-review=keep');const before=env.state,current=active(before),historical=C.clone(before.conflicts);
  await env.click('conflicts');await env.click('keep-current-conflict',{id:'different-nutrition'});
  assert.deepEqual(active(env.state),current);assert.equal(env.state.conflicts.length,106);assert.equal(C.reviewedConflicts(env.state).length,1);assert.equal(env.elements.get('modal').open,true);assert.equal(scheduled,0);
  const firstSnapshot=C.readRecoverySnapshots(env.rows.get('MGT_BETA_SNAPSHOTS:guest'))[0].state;assert.deepEqual(firstSnapshot.conflicts,historical);assert.deepEqual(firstSnapshot.nutrition,before.nutrition);
  await env.click('acknowledge-matching-conflicts');const reviewed=env.state,archives=C.reviewedConflicts(reviewed);
  assert.deepEqual(active(reviewed),current);assert.deepEqual(reviewed.conflicts,[]);assert.equal(archives.length,107);assert.equal(new Set(reviewed.resolvedConflicts).size,107);
  for(const conflict of historical)assert.deepEqual(archives.find(entry=>entry.data.conflict.id===conflict.id).data.conflict,conflict);
  const nutrition=archives.find(entry=>entry.data.conflict.id==='different-nutrition');assert.deepEqual(nutrition.data.current,{exists:true,value:before.nutrition});
  const recipe=archives.find(entry=>entry.data.conflict.id==='matching-0');assert.deepEqual(recipe.data.current,{exists:true,value:before.recipes[0]});
  const preBulk=C.readRecoverySnapshots(env.rows.get('MGT_BETA_SNAPSHOTS:guest'))[0].state;assert.equal(preBulk.conflicts.length,106);assert.equal(C.reviewedConflicts(preBulk).length,1);
  assert.equal(env.elements.get('modal').open,true);assert.equal(scheduled,0);assert.match(env.elements.get('modalBody').innerHTML,/No pending reviews\. Your current settings are unchanged\. Close to sync\./);assert.match(env.elements.get('modalBody').innerHTML,/Reviewed copies · 107/);
  await env.click('view',{view:'history'});assert.match(env.elements.get('app').innerHTML,/1 original snapshots saved\./);assert.match(env.elements.get('app').innerHTML,/Reviewed copies/);assert.doesNotMatch(env.elements.get('app').innerHTML,/108 original snapshots/);
  const backup=JSON.parse(JSON.stringify(reviewed));assert.equal(C.reviewedConflicts(backup).length,107);assert.deepEqual(backup.logs,current.logs);
  await env.click('close-modal');assert.equal(env.elements.get('modal').open,false);assert.equal(scheduled,1);
 }finally{env.restore()}
});

test('bulk review leaves differing nutrition pending and does not auto-select a historical value',async()=>{
 const env=environment(syntheticWorkspace());
 try{
  await import('../app.mjs?conflict-review=bulk');const before=env.state;
  await env.click('conflicts');await env.click('acknowledge-matching-conflicts');
  assert.deepEqual(active(env.state),active(before));assert.deepEqual(env.state.conflicts,[before.conflicts[0]]);assert.equal(C.reviewedConflicts(env.state).length,106);
  await env.click('acknowledge-matching-conflicts');assert.deepEqual(env.state.conflicts,[before.conflicts[0]]);assert.equal(C.reviewedConflicts(env.state).length,106);assert.match(env.elements.get('toast').textContent,/Differing items still need review/);
 }finally{env.restore()}
});

test('ambiguous bulk review fails without changing the stored pending records or active values',async()=>{
 const source=syntheticWorkspace();source.conflicts.push({...C.clone(source.conflicts[1]),local:{malformed:'ambiguous saved version'}});
 const env=environment(source);
 try{
  await import('../app.mjs?conflict-review=ambiguous');const before=env.state;
  await env.click('conflicts');await env.click('acknowledge-matching-conflicts');
  assert.deepEqual(env.state,before);assert.equal(C.reviewedConflicts(env.state).length,0);assert.ok(env.elements.get('toast').textContent);assert.equal(env.elements.get('modal').open,true);
 }finally{env.restore()}
});

test('historical selection is explicit and reviewed copies can restore both an old value and the kept current value',async()=>{
 const env=environment(syntheticWorkspace());
 try{
  await import('../app.mjs?conflict-review=restore');const before=env.state;
  await env.click('conflicts');await env.click('keep-current-conflict',{id:'different-nutrition'});
  const archive=C.reviewedConflicts(env.state)[0];assert.match(env.elements.get('modalBody').innerHTML,/Restore value kept at review/);
  await env.click('restore-reviewed-conflict',{id:archive.id,choice:'local'});
  assert.equal(env.state.nutrition.diet,'Any');assert.equal(env.state.nutrition.servings,1);assert.equal(env.state.nutrition.mealRepeatDays,2);assert.equal(C.reviewedConflicts(env.state).length,2);
  assert.deepEqual(C.reviewedConflicts(env.state).find(entry=>entry.id===archive.id),archive);
  await env.click('restore-reviewed-conflict',{id:archive.id,choice:'current'});
  const current=C.clone(env.state.nutrition),expected=C.clone(before.nutrition);delete current.updatedAt;delete expected.updatedAt;assert.deepEqual(current,expected);assert.equal(C.reviewedConflicts(env.state).length,3);assert.deepEqual(env.state.logs,before.logs);assert.equal(env.elements.get('modal').open,true);
  const snapshot=C.readRecoverySnapshots(env.rows.get('MGT_BETA_SNAPSHOTS:guest'))[0].state;assert.equal(snapshot.nutrition.diet,'Any');assert.equal(C.reviewedConflicts(snapshot).length,2);
 }finally{env.restore()}
});

test('a quota failure keeps the pending review and never displays completion',async()=>{
 const env=environment(syntheticWorkspace());
 try{
  await import('../app.mjs?conflict-review=quota');const before=env.state;
  await env.click('conflicts');env.failNextWorkspaceSave();await env.click('keep-current-conflict',{id:'different-nutrition'});
  assert.deepEqual(env.state,before);assert.equal(C.reviewedConflicts(env.state).length,0);assert.equal(env.elements.get('modal').open,true);assert.doesNotMatch(env.elements.get('modalBody').innerHTML,/No pending reviews/);assert.match(env.elements.get('modalBody').innerHTML,/Acknowledge 106 matching copies/);assert.match(env.elements.get('toast').textContent,/could not be saved to device storage/);
  const snapshot=C.readRecoverySnapshots(env.rows.get('MGT_BETA_SNAPSHOTS:guest'))[0].state;assert.deepEqual(snapshot.conflicts,before.conflicts);assert.deepEqual(snapshot.nutrition,before.nutrition);
 }finally{env.restore()}
});
