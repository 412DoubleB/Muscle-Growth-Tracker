import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../core.mjs';
import {addOriginalRecipes} from '../nutrition.mjs';

// JSONB retains JSON values and array order, but can return every object's keys
// in a different order from the original browser-created payload.
const jsonbOrder=value=>Array.isArray(value)?value.map(jsonbOrder):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort((a,b)=>a.length-b.length||(a<b?-1:a>b?1:0)).map(key=>[key,jsonbOrder(value[key])])):value;
function seeded(){const state=C.defaultState();state.ownerId='synthetic-owner';addOriginalRecipes(state);return state}

test('JSON equality ignores recursive object order without changing arrays, types or values',()=>{
 const original={nested:{z:0,a:'0'},rows:[{y:false,x:null},{y:2,x:1}],optional:undefined};
 const wire=JSON.parse(JSON.stringify(jsonbOrder(original))),before=C.clone(original);
 assert.equal(C.jsonEqual(original,wire),true);assert.equal(C.canonicalJson(original),C.canonicalJson(wire));assert.deepEqual(original,before);
 for(const [left,right]of [[0,'0'],[false,0],[null,{}],[[],{}],[[1,2],[2,1]],[{n:0},{n:1}],[{enabled:false},{}]])assert.equal(C.jsonEqual(left,right),false);
 assert.equal(C.jsonEqual({optional:undefined},{}),true);assert.equal(C.jsonEqual([undefined],[null]),true);
});

test('one hundred seeded recipes and reordered identical records merge without a base or false conflicts',()=>{
 const local=seeded(),day=C.originalDay(local,'2026-10-01');day.status='completed';
 Object.assign(day.exercises[0].sets[0],{w:0,r:12,rir:0,done:true,futureAnnotation:{z:2,a:1}});local.logs[day.date]=day;
 const remote=jsonbOrder(C.clone(local)),beforeLocal=C.clone(local),beforeRemote=C.clone(remote);
 assert.equal(local.recipes.length,100);assert.deepEqual(remote,local);
 const merged=C.mergeStates(local,remote,{});
 assert.equal(merged.conflicts.length,0);assert.equal(merged.state.conflicts.length,0);assert.deepEqual(merged.state.logs,local.logs);assert.deepEqual(merged.state.recipes,local.recipes);
 assert.deepEqual(local,beforeLocal);assert.deepEqual(remote,beforeRemote);
});

test('record timestamp differences do not conflict after JSONB reordering',()=>{
 const local=seeded(),remote=jsonbOrder(C.clone(local));
 for(const field of ['profile','training','nutrition','reminders'])remote[field].updatedAt='2030-01-01T00:00:00.000Z';
 for(const collection of ['recipes','gyms','gymSchedules'])for(const record of remote[collection])record.updatedAt='2030-01-01T00:00:00.000Z';
 const merged=C.mergeStates(local,remote,{});assert.equal(merged.conflicts.length,0);assert.deepEqual(merged.state.recipes,local.recipes);assert.deepEqual(merged.state.profile,local.profile);
});

test('different values, types and array order retain both conflict copies and the existing ID algorithm',()=>{
 const local=seeded(),remote=jsonbOrder(C.clone(local));
 local.profile.name='Synthetic left';remote.profile.name='Synthetic right';local.nutrition.protein=0;remote.nutrition.protein='0';
 [remote.gyms[0].inventory[0],remote.gyms[0].inventory[1]]=[remote.gyms[0].inventory[1],remote.gyms[0].inventory[0]];
 const merged=C.mergeStates(local,remote,{});
 assert.deepEqual(merged.conflicts.map(record=>record.collection).sort(),['gyms','nutrition','profile']);
 for(const conflict of merged.conflicts){
  const left=conflict.collection==='gyms'?local.gyms[0]:local[conflict.collection],right=conflict.collection==='gyms'?remote.gyms[0]:remote[conflict.collection];
  assert.deepEqual(conflict.local,left);assert.deepEqual(conflict.remote,right);
  assert.equal(conflict.id,`conflict-${C.hash(conflict.collection+conflict.key+JSON.stringify(left)+JSON.stringify(right))}`);
 }
});

test('nested timestamp fields remain meaningful data rather than being stripped recursively',()=>{
 const local=seeded(),remote=jsonbOrder(C.clone(local));local.profile.futureAnnotation={updatedAt:'preserve-left'};remote.profile.futureAnnotation={updatedAt:'preserve-right'};
 const merged=C.mergeStates(local,remote,{});assert.equal(merged.conflicts.length,1);assert.equal(merged.conflicts[0].collection,'profile');
 assert.equal(merged.conflicts[0].local.futureAnnotation.updatedAt,'preserve-left');assert.equal(merged.conflicts[0].remote.futureAnnotation.updatedAt,'preserve-right');
});

test('three-way merge recognizes one-sided edits against a reordered base',()=>{
 const base=seeded();base.logs['2026-10-01']=C.originalDay(base,'2026-10-01');
 const reorderedBase=jsonbOrder(C.clone(base)),local=C.clone(base),remote=jsonbOrder(C.clone(base));
 local.logs['2026-10-01'].exercises[0].sets[0].r=13;
 remote.profile.name='Remote-only synthetic edit';
 const merged=C.mergeStates(local,remote,reorderedBase);
 assert.equal(merged.conflicts.length,0);assert.deepEqual(merged.state.logs,local.logs);assert.deepEqual(merged.state.profile,remote.profile);
 assert.deepEqual(merged.state.recipes,base.recipes);
});

test('preexisting false and genuine conflicts and resolution IDs remain intact',()=>{
 const local=seeded(),remote=jsonbOrder(C.clone(local));
 const falseConflict={id:'legacy-order-sensitive-conflict',collection:'recipes',key:local.recipes[0].id,local:C.clone(local.recipes[0]),remote:jsonbOrder(C.clone(local.recipes[0])),reason:'Prior order-sensitive conflict',createdAt:'2026-10-01T00:00:00.000Z'};
 const realConflict={id:'legacy-genuine-conflict',collection:'profile',key:'profile',local:{name:'Keep left'},remote:{name:'Keep right'},reason:'Prior real conflict',createdAt:'2026-10-02T00:00:00.000Z'};
 local.conflicts=[falseConflict];remote.conflicts=[realConflict];
 local.resolvedConflicts=['previously-resolved-local'];remote.resolvedConflicts=['previously-resolved-remote'];
 const merged=C.mergeStates(local,remote,{});
 assert.equal(merged.conflicts.length,0);assert.deepEqual(merged.state.conflicts,[falseConflict,realConflict]);
 assert.deepEqual(merged.state.resolvedConflicts,['previously-resolved-local','previously-resolved-remote']);
 assert.equal(JSON.stringify(merged.state.conflicts),JSON.stringify([falseConflict,realConflict]));
});
