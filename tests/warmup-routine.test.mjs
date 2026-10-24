import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../core.mjs';
import * as W from '../workouts.mjs';
import {trainingStreak} from '../motivation.mjs';
import {restAfterCompletion} from '../rest-timers.mjs';

const date='2027-01-04',gymId='synthetic-gym';
const routine=extra=>({enabled:true,bands:true,addedAt:'2027-01-04T12:00:00Z',unknown:{retain:0},...extra});
function day(at=date,extra={}){return {id:at,date:at,title:'Synthetic unstarted workout',kind:'strength',status:'in-progress',gymId,exercises:[C.makeExercise(C.exerciseFor('Dumbbell Curl'),{count:2})],...extra}}
function fixture(){
 const state=C.defaultState();state.training={...state.training,mode:'automatic',frequency:3,split:'full',startDate:date,defaultGym:gymId,runEvery:0,saunaMinutes:0,restWeekdays:[]};state.gymSchedules=[];state.gyms=[{id:gymId,name:'Synthetic complete gym',inventory:C.EQUIPMENT.slice()}];state.logs={};state.plan={};return state;
}

test('carrying a warm-up copies only independent preparation intent and leaves replacement exercises intact',()=>{
 const previous=day(date,{warmupRoutine:routine(),customMetadata:{old:true}}),next=day(date,{title:'Replacement',unknown:{new:0}}),before=C.clone({previous,next});next.exercises=[C.makeExercise(C.exerciseFor('Wall Push-Up'))];before.next=C.clone(next);
 const result=W.carryWarmupRoutine(previous,next);assert.deepEqual(result,{...next,warmupRoutine:previous.warmupRoutine});assert.deepEqual(result.exercises,next.exercises);assert.equal(Object.hasOwn(result,'customMetadata'),false);assert.notEqual(result,next);assert.notEqual(result.exercises,next.exercises);assert.notEqual(result.warmupRoutine,previous.warmupRoutine);
 result.warmupRoutine.unknown.retain=99;assert.deepEqual({previous,next},before);
 for(const value of [undefined,null,false,[],{}, {enabled:'false'}])assert.deepEqual(W.carryWarmupRoutine({...previous,warmupRoutine:value},next),next);
 assert.deepEqual(W.carryWarmupRoutine({...previous,deleted:true},next),next,'A deleted day must not revive preparation choices');
});

test('warm-up metadata survives plan packing, JSON backup and existing cloud merging without creating sets or activity',()=>{
 const state=fixture(),planned=day(date,{warmupRoutine:routine()}),before=C.clone(planned);state.plan[date]=C.packPlanDay(planned);
 assert.equal(state.plan[date].compactPlan,true);const expanded=C.expandPlanDay(JSON.parse(JSON.stringify(state.plan[date])));assert.deepEqual(expanded.warmupRoutine,planned.warmupRoutine);assert.equal(expanded.exercises.length,planned.exercises.length);assert.ok(expanded.exercises.every(exercise=>exercise.sets.every(set=>!set.done&&set.w===''&&set.r==='')));assert.deepEqual(planned,before);
 const base=C.clone(state),local=C.clone(base),remote=C.clone(base);local.logs[date]=C.ensureLog(local,date);local.logs[date].warmupRoutine.bands=false;const merged=C.mergeStates(local,remote,base);C.validateState(merged.state);assert.equal(merged.conflicts.length,0);assert.equal(merged.state.logs[date].warmupRoutine.bands,false);assert.deepEqual(merged.state.logs[date].warmupRoutine.unknown,{retain:0});
 assert.equal(W.hasEntries(merged.state.logs[date]),false);assert.equal(W.programDayProtection(merged.state,date),'');assert.equal(C.completedSets(merged.state.logs[date].exercises[0]).length,0);assert.equal(trainingStreak(merged.state,date).total,0);assert.equal(restAfterCompletion(planned,merged.state.logs[date],0,0),null);
});

test('replacing a warm-up-only workout remains allowed and preserves its preparation choice without archiving empty work',()=>{
 const state=fixture();state.logs[date]=day(date,{warmupRoutine:routine()});state.meals[date]={id:date,items:[],unknown:{retain:false}};state.pantry=[{id:'stock',qty:0,unknown:true}];const before=C.clone(state),streak=trainingStreak(state,date);
 assert.equal(W.hasEntries(state.logs[date]),false);assert.equal(W.programDayProtection(state,date),'');const result=W.editSession(state,date,{choice:'legacy:0',date,gymId});
 assert.deepEqual(result.state.logs[date].warmupRoutine,before.logs[date].warmupRoutine);assert.notEqual(result.state.logs[date].title,before.logs[date].title);assert.equal(Object.keys(result.state.logs).filter(key=>key.includes('~edit-')).length,0);assert.deepEqual(trainingStreak(result.state,date),streak);assert.deepEqual(result.state.meals,before.meals);assert.deepEqual(result.state.pantry,before.pantry);assert.deepEqual(state,before);
});

test('future regeneration carries per-date warm-up choices from unstarted logs and plans while preserving real entered work',()=>{
 const state=fixture();state.logs[date]=day(date,{warmupRoutine:routine()});const logged='2027-01-06',planned='2027-01-08',entered='2027-01-07';state.logs[logged]=day(logged,{warmupRoutine:routine({bands:false,label:'log choice'})});state.plan[planned]=C.packPlanDay(day(planned,{warmupRoutine:routine({label:'plan choice'})}));state.logs[planned]={...day(planned),deleted:true,warmupRoutine:routine({label:'deleted choice'})};state.logs[entered]=day(entered,{warmupRoutine:routine({label:'entered choice'})});Object.assign(state.logs[entered].exercises[0].sets[0],{w:0,r:8,rir:2,done:true});const before=C.clone(state);
 const result=W.editSession(state,date,{choice:'keep',date,gymId,adjust:'regenerate'});
 assert.deepEqual(result.state.logs[logged].warmupRoutine,before.logs[logged].warmupRoutine);assert.deepEqual(result.state.logs[planned].warmupRoutine,before.plan[planned].warmupRoutine);assert.deepEqual(result.state.logs[entered],before.logs[entered]);assert.ok(result.state.logs[logged].exercises.length>=6);assert.ok(result.state.logs[planned].exercises.length>=6);assert.deepEqual(state,before);
});

test('date swaps retain each workout warm-up intent and unknown preparation metadata',()=>{
 const state=fixture(),target='2027-01-05';state.logs[date]=day(date,{warmupRoutine:routine({label:'selected'})});state.plan[target]=C.packPlanDay(day(target,{title:'Displaced workout',warmupRoutine:routine({bands:false,label:'displaced',custom:{preserve:['detail']}})}));const before=C.clone(state);
 const result=W.editSession(state,date,{choice:'keep',date:target,gymId});assert.equal(result.date,target);assert.deepEqual(result.state.logs[target].warmupRoutine,before.logs[date].warmupRoutine);assert.deepEqual(result.state.logs[date].warmupRoutine,before.plan[target].warmupRoutine);assert.equal(result.state.logs[date].title,'Displaced workout');assert.deepEqual(state,before);
});

test('an explicitly removed warm-up stays removed through prepared-plan replacement and future regeneration',()=>{
 const state=fixture(),other='2027-01-05',logged='2027-01-06',planned='2027-01-08';
 state.logs[date]=day(date,{warmupRoutine:routine({enabled:false,label:'removed today'})});
 state.plan[other]=C.packPlanDay(day(other,{title:'Previously prepared plan',warmupRoutine:routine({enabled:true,label:'source plan'})}));
 state.logs[logged]=day(logged,{warmupRoutine:routine({enabled:false,label:'removed from log',custom:{retain:false}})});
 state.plan[planned]=C.packPlanDay(day(planned,{warmupRoutine:routine({enabled:false,label:'removed from plan',custom:{retain:['detail']}})}));
 const before=C.clone(state),replacement=W.editSession(state,date,{choice:'plan:'+other,date,gymId});
 assert.deepEqual(replacement.state.logs[date].warmupRoutine,before.logs[date].warmupRoutine);assert.equal(replacement.state.logs[date].warmupRoutine.enabled,false);assert.equal(replacement.state.logs[date].title,'Previously prepared plan');
 const regenerated=W.editSession(state,date,{choice:'keep',date,gymId,adjust:'regenerate'});
 assert.deepEqual(regenerated.state.logs[logged].warmupRoutine,before.logs[logged].warmupRoutine);assert.deepEqual(regenerated.state.logs[planned].warmupRoutine,before.plan[planned].warmupRoutine);assert.equal(regenerated.state.logs[logged].warmupRoutine.enabled,false);assert.equal(regenerated.state.logs[planned].warmupRoutine.enabled,false);assert.deepEqual(state,before);
});
