import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../core.mjs';
import {addOriginalRecipes} from '../nutrition.mjs';

const reordered=value=>Array.isArray(value)?value.map(reordered):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().reverse().map(key=>[key,reordered(value[key])])):value;
const active=state=>{const value=C.clone(state);delete value.conflicts;delete value.resolvedConflicts;delete value.legacySnapshots;return value};
const copyConflict=(collection,key,local,remote,id='saved-'+collection+'-'+key)=>({id,collection,key,local:C.clone(local),remote:C.clone(remote),reason:'Synthetic saved conflict',createdAt:'2026-10-01T00:00:00.000Z',unknownEvidence:{retain:['both','copies'],originalDecision:false}});
const nutritionConflict=state=>copyConflict('nutrition','nutrition',{...state.nutrition,diet:'Any',horizon:1,mealRepeatDays:2,notes:'Old version A'},{...state.nutrition,diet:'Any',horizon:1,mealRepeatDays:2,notes:'Old version B'},'old-nutrition-conflict');
function example(){
 const state=C.defaultState();addOriginalRecipes(state);
 state.nutrition={...state.nutrition,diet:'High Protein',horizon:14,mealRepeatDays:4,notes:'Current settings to keep'};
 const day=C.originalDay(state,'2026-10-01');day.status='completed';Object.assign(day.exercises[0].sets[0],{w:0,r:12,rir:0,done:true,futureAnnotation:{retain:true}});state.logs[day.date]=day;
 state.meals['2026-10-01']={id:'2026-10-01',date:'2026-10-01',items:[{id:'synthetic-meal',eaten:true}]};
 state.legacySnapshots=[{id:'original-legacy-copy',importedAt:'2026-09-01',data:{source:'Synthetic older backup',unknown:{keep:0}}}];
 const same=(collection,key,value)=>copyConflict(collection,key,value,reordered({...value,updatedAt:'2020-01-01T00:00:00.000Z'}));
 state.conflicts=[...state.recipes.map(recipe=>same('recipes',recipe.id,recipe)),...state.gyms.map(gym=>same('gyms',gym.id,gym)),...state.gymSchedules.map(schedule=>same('gymSchedules',schedule.id,schedule)),...['profile','training','reminders'].map(field=>same(field,field,state[field])),nutritionConflict(state)];
 return state;
}
function onlyNutrition(){const state=C.defaultState();state.nutrition={...state.nutrition,diet:'High Protein',horizon:14,mealRepeatDays:4};state.conflicts=[nutritionConflict(state)];return state}
const unchangedOnThrow=(state,run)=>{const before=C.clone(state);assert.throws(run);assert.deepEqual(state,before)};

test('keeping current then acknowledging matching copies reviews 107 conflicts without rewriting active data',()=>{
 const state=example(),before=active(state),oldLegacy=C.clone(state.legacySnapshots),pending=C.clone(state.conflicts),oldNutrition=C.clone(state.nutrition);
 assert.equal(state.conflicts.length,107);assert.equal(state.conflicts.filter(C.conflictCopiesMatch).length,106);
 assert.equal(C.keepCurrentConflict(state,'old-nutrition-conflict'),state);assert.equal(state.conflicts.length,106);assert.deepEqual(active(state),before);
 const first=C.reviewedConflicts(state)[0];assert.equal(first.decision,'keep-current');assert.deepEqual(first.data.conflict,pending.at(-1));assert.deepEqual(first.data.current,{exists:true,value:oldNutrition});
 const repeated=C.clone(state);C.keepCurrentConflict(state,'old-nutrition-conflict');assert.deepEqual(state,repeated);
 assert.equal(C.acknowledgeMatchingConflicts(state),state);assert.equal(state.conflicts.length,0);assert.deepEqual(active(state),before);
 const archives=C.reviewedConflicts(state);assert.equal(archives.length,107);assert.equal(new Set(archives.map(entry=>entry.id)).size,107);
 assert.deepEqual(state.legacySnapshots.slice(0,oldLegacy.length),oldLegacy);
 for(const original of pending){const archive=archives.find(entry=>entry.data.conflict.id===original.id);assert.deepEqual(archive.data.conflict,original);assert.match(archive.id,/^reviewed-conflict-/);assert.equal(typeof archive.reviewedAt,'string');assert.equal(archive.data.current.exists,true);assert.ok(state.resolvedConflicts.includes(original.id))}
 const batchRepeated=C.clone(state);C.acknowledgeMatchingConflicts(state);assert.deepEqual(state,batchRepeated);
});

test('matching batch leaves genuinely differing old copies pending and keeps newer current settings',()=>{
 const state=example(),before=active(state),nutrition=C.clone(state.conflicts.at(-1));
 C.acknowledgeMatchingConflicts(state);
 assert.equal(state.conflicts.length,1);assert.deepEqual(state.conflicts[0],nutrition);assert.deepEqual(active(state),before);
 assert.equal(C.reviewedConflicts(state).length,106);assert.equal(state.resolvedConflicts.includes(nutrition.id),false);
 assert.equal(C.conflictCopiesMatch({...nutrition,local:{n:0},remote:{n:'0'}}),false);
 assert.equal(C.conflictCopiesMatch({...nutrition,local:{rows:[1,2]},remote:{rows:[2,1]}}),false);
 assert.equal(C.conflictCopiesMatch({...nutrition,local:{nested:{updatedAt:'A'}},remote:{nested:{updatedAt:'B'}}}),false);
 assert.equal(C.conflictCopiesMatch({id:'broken'}),false);
});

test('historical choices archive both untouched copies and the pre-action current value',()=>{
 const state=onlyNutrition(),conflict=C.clone(state.conflicts[0]),current=C.clone(state.nutrition);
 C.resolveConflict(state,conflict.id,'remote');
 assert.equal(state.nutrition.notes,'Old version B');assert.equal(state.nutrition.diet,'Any');assert.equal(state.nutrition.horizon,1);
 assert.equal(state.conflicts.length,0);const archive=C.reviewedConflicts(state)[0];
 assert.equal(archive.decision,'remote');assert.deepEqual(archive.data.conflict,conflict);assert.deepEqual(archive.data.current,{exists:true,value:current});
 const before=C.clone(state);C.resolveConflict(state,conflict.id,'remote');assert.deepEqual(state,before);
});

test('explicit restore retains old recovery entries and archives each pre-restore current value',()=>{
 const state=onlyNutrition(),original=C.clone(state.nutrition),saved=C.clone(state.conflicts[0]);C.keepCurrentConflict(state,saved.id);
 const archive=C.clone(C.reviewedConflicts(state)[0]);
 for(const [choice,expected]of [['local',saved.local],['remote',saved.remote],['current',original]]){
  const before=C.clone(state.nutrition),previous=C.clone(state.legacySnapshots);
  assert.equal(C.restoreReviewedConflict(state,archive.id,choice),state);
  assert.equal(C.jsonEqual({...state.nutrition,updatedAt:null},{...expected,updatedAt:null}),true);
  assert.deepEqual(state.legacySnapshots.slice(0,previous.length),previous);
  const latest=state.legacySnapshots.at(-1);assert.deepEqual(latest.data.current,{exists:true,value:before});assert.deepEqual(latest.data.conflict,saved);assert.equal(latest.decision,'restore-'+choice);assert.equal(latest.sourceArchiveId,archive.id);
 }
 assert.equal(C.reviewedConflicts(state).length,4);assert.deepEqual(state.legacySnapshots[0],archive);assert.deepEqual(state.resolvedConflicts,[saved.id]);
});

test('shopping-check primitive and array copies remain exact values during choice and recovery',()=>{
 for(const value of [false,0,null,[],['first','second']]){
  const state=C.defaultState(),conflict=copyConflict('shoppingChecks','synthetic-check',value,true);
  state.shoppingChecks[conflict.key]='current';state.conflicts=[conflict];C.resolveConflict(state,conflict.id,'local');
  assert.deepEqual(state.shoppingChecks[conflict.key],value);const archive=C.reviewedConflicts(state)[0];assert.deepEqual(archive.data.conflict.local,value);assert.deepEqual(archive.data.current,{exists:true,value:'current'});
  C.restoreReviewedConflict(state,archive.id,'remote');assert.equal(state.shoppingChecks[conflict.key],true);
  C.restoreReviewedConflict(state,archive.id,'local');assert.deepEqual(state.shoppingChecks[conflict.key],value);
  C.restoreReviewedConflict(state,archive.id,'current');assert.equal(state.shoppingChecks[conflict.key],'current');
 }
});

test('an absent current record is recorded as absent and cannot silently delete a later active value',()=>{
 const state=C.defaultState(),conflict=copyConflict('shoppingChecks','missing-check',false,true);state.conflicts=[conflict];
 C.keepCurrentConflict(state,conflict.id);const archive=C.reviewedConflicts(state)[0];assert.deepEqual(archive.data.current,{exists:false});assert.equal(Object.hasOwn(state.shoppingChecks,conflict.key),false);
 state.shoppingChecks[conflict.key]=true;unchangedOnThrow(state,()=>C.restoreReviewedConflict(state,archive.id,'current'));
 C.restoreReviewedConflict(state,archive.id,'local');assert.equal(state.shoppingChecks[conflict.key],false);assert.deepEqual(state.legacySnapshots.at(-1).data.current,{exists:true,value:true});
});

test('invalid identities, choices, copied targets and ambiguous IDs fail without partial changes',()=>{
 const state=onlyNutrition(),id=state.conflicts[0].id;
 for(const run of [()=>C.keepCurrentConflict(state,''),()=>C.keepCurrentConflict(state,'missing'),()=>C.resolveConflict(state,id,'current'),()=>C.resolveConflict(state,id,'constructor')])unchangedOnThrow(state,run);
 const duplicate=onlyNutrition();duplicate.conflicts.push({...C.clone(duplicate.conflicts[0]),remote:{diet:'Different saved copy'}});
 for(const run of [()=>C.keepCurrentConflict(duplicate,id),()=>C.acknowledgeMatchingConflicts(duplicate),()=>C.resolveConflict(duplicate,id,'local')])unchangedOnThrow(duplicate,run);
 for(const change of [conflict=>delete conflict.remote,conflict=>conflict.key='constructor',conflict=>conflict.collection='ownerId',conflict=>conflict.key='wrong-settings-key']){
  const malformed=onlyNutrition();change(malformed.conflicts[0]);unchangedOnThrow(malformed,()=>C.keepCurrentConflict(malformed,id));unchangedOnThrow(malformed,()=>C.acknowledgeMatchingConflicts(malformed));
 }
 const unserializable=onlyNutrition();unserializable.conflicts[0].unknownEvidence.unsupported=1n;unchangedOnThrow(unserializable,()=>C.keepCurrentConflict(unserializable,id));
 const recovery=onlyNutrition();C.keepCurrentConflict(recovery,id);const archive=recovery.legacySnapshots[0];
 unchangedOnThrow(recovery,()=>C.restoreReviewedConflict(recovery,archive.id,'invalid'));
 archive.data.conflict.remote=null;unchangedOnThrow(recovery,()=>C.restoreReviewedConflict(recovery,archive.id,'remote'));
 archive.data.current.exists='yes';unchangedOnThrow(recovery,()=>C.restoreReviewedConflict(recovery,archive.id,'current'));
 const ambiguous=onlyNutrition();C.keepCurrentConflict(ambiguous,id);ambiguous.legacySnapshots.push({...C.clone(ambiguous.legacySnapshots[0]),decision:'Different archive sharing ID'});unchangedOnThrow(ambiguous,()=>C.restoreReviewedConflict(ambiguous,ambiguous.legacySnapshots[0].id,'local'));
});

test('backup recovery on independent storage and stale JSONB sync retain archives and reviewed IDs',()=>{
 const state=example(),stale=C.clone(state);C.keepCurrentConflict(state,'old-nutrition-conflict');C.acknowledgeMatchingConflicts(state);
 const exported=JSON.parse(JSON.stringify(state)),rows=new Map(),storage={getItem:key=>rows.get(key)??null,setItem:(key,value)=>rows.set(key,String(value)),removeItem:key=>rows.delete(key)};
 const independent=new C.LocalStore(storage),empty=independent.load();const restored=C.importSnapshot(empty,exported).state;independent.save(restored);
 const loaded=independent.load();assert.equal(C.reviewedConflicts(loaded).length,107);assert.deepEqual(loaded.logs,state.logs);assert.deepEqual(loaded.meals,state.meals);
 for(const id of state.resolvedConflicts){assert.ok(loaded.resolvedConflicts.includes(id));assert.equal(loaded.conflicts.some(conflict=>conflict.id===id),false)}
 const merged=C.mergeStates(loaded,reordered(stale),{}).state;
 assert.equal(C.reviewedConflicts(merged).length,107);
 for(const archive of C.reviewedConflicts(state))assert.equal(C.jsonEqual(C.reviewedConflicts(merged).find(entry=>entry.id===archive.id),archive),true);
 for(const id of state.resolvedConflicts){assert.ok(merged.resolvedConflicts.includes(id));assert.equal(merged.conflicts.some(conflict=>conflict.id===id),false)}
 assert.deepEqual(merged.logs,state.logs);assert.deepEqual(exported,state);
});

test('independent device reviews retain both distinct current values through the existing archive union',()=>{
 const a=onlyNutrition(),b=C.clone(a);a.nutrition.notes='Current device A';b.nutrition.notes='Current device B';
 const originalId=a.conflicts[0].id;C.keepCurrentConflict(a,originalId);C.keepCurrentConflict(b,originalId);
 assert.notEqual(a.legacySnapshots[0].id,b.legacySnapshots[0].id);
 const merged=C.mergeStates(a,reordered(b),{}).state,reverse=C.mergeStates(b,reordered(a),{}).state,archives=C.reviewedConflicts(merged);
 assert.equal(archives.length,2);assert.deepEqual(new Set(archives.map(entry=>entry.data.current.value.notes)),new Set(['Current device A','Current device B']));
 assert.equal(C.jsonEqual(merged.legacySnapshots,reverse.legacySnapshots),true);
 assert.ok(merged.resolvedConflicts.includes(originalId));assert.equal(merged.conflicts.some(conflict=>conflict.id===originalId),false);
 const currentDifference=merged.conflicts.find(conflict=>conflict.collection==='nutrition');assert.ok(currentDifference);assert.equal(currentDifference.local.notes,'Current device A');assert.equal(currentDifference.remote.notes,'Current device B');
});

test('review archive ordering is deterministic and leaves original source records in their original relative order',()=>{
 const originalA={id:'source-A',data:{retain:['old','order']}},originalB={id:'source-B',unknownMetadata:{retain:true}},reviewZ={id:'reviewed-conflict-z',kind:'reviewed-conflict',data:{raw:1}},reviewA={id:'reviewed-conflict-a',kind:'reviewed-conflict',data:{raw:2}};
 const entries=[originalA,reviewZ,originalB,reviewA],before=C.clone(entries),ordered=C.orderReviewedSnapshots(entries);
 assert.deepEqual(ordered,[originalA,originalB,reviewA,reviewZ]);assert.deepEqual(entries,before);assert.equal(ordered[0],originalA);assert.equal(ordered[1],originalB);
 const a=C.defaultState(),b=C.clone(a);a.legacySnapshots=[originalA,reviewZ,originalB];b.legacySnapshots=[originalA,reviewA];
 assert.equal(C.jsonEqual(C.mergeStates(a,b,{}).state.legacySnapshots,C.mergeStates(b,a,{}).state.legacySnapshots),true);
});
