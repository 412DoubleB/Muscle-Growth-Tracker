import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../core.mjs';
import * as W from '../workouts.mjs';
import {GYM_TYPES} from '../gym-profiles.mjs';

const start='2027-01-04',gymId='synthetic-gym';
function fixture({full=false}={}){
 const state=C.defaultState();
 state.gyms=[{id:gymId,name:'Synthetic gym',inventory:full?[...GYM_TYPES.commercial.estimates]:['Dumbbells'],dbMax:80,increment:5,notes:'Keep the gym notes',updatedAt:'2026-10-20T12:00:00.000Z'}];
 state.gymSchedules=[];state.training={...state.training,mode:'automatic',split:'split',startDate:start,defaultGym:gymId,frequency:4,restWeekdays:[0]};
 state.plan={};state.logs={};return state;
}
function manualDay(date=start){return {id:date,date,title:'My intentionally short workout',kind:'strength',gymId,notes:['Keep my note'],exercises:[C.makeExercise(C.exerciseFor('Dumbbell Curl'))],updatedAt:'2026-10-20T12:00:00.000Z'}}
function reviewError(fn){
 let caught;assert.throws(fn,error=>{caught=error;return error.code==='AUTOMATIC_WORKOUT_REVIEW'});
 assert.ok(Array.isArray(caught.issues)&&caught.issues.length);assert.match(caught.message,/6–9/);assert.match(caught.message,/inventory|exclusions/i);
 for(const issue of caught.issues){
  assert.deepEqual(Object.keys(issue).sort(),['count','date','gymId','notes','plannedExerciseCount','title']);
  assert.match(issue.date,/^\d{4}-\d{2}-\d{2}$/);assert.equal(issue.gymId,gymId);assert.ok(issue.count<6||issue.count>9);assert.equal(typeof issue.title,'string');assert.equal(typeof issue.plannedExerciseCount,'number');assert.ok(Array.isArray(issue.notes));
 }
 assert.ok(caught.message.includes(caught.issues[0].date));assert.ok(caught.message.includes(String(caught.issues[0].count)));return caught;
}

test('automatic session choice remains a diagnostic 5/9 preview but rejects saving it without changing entered work',()=>{
 const state=fixture(),old=manualDay();Object.assign(old.exercises[0].sets[0],{w:0,r:10,rir:0,done:true});old.customMetadata={keep:['zero-load','history']};state.logs[start]=old;
 state.logs[start+'~edit-existing']={...C.clone(old),id:start+'~edit-existing',customNote:'Keep prior history'};
 const before=C.clone(state),preview=W.workoutFromChoice(state,'auto',start,gymId);
 assert.equal(preview.exercises.length,5);assert.equal(preview.plannedExerciseCount,9);assert.equal(preview.needsEquipmentReview,true);
 const error=reviewError(()=>W.editSession(state,start,{choice:'auto',date:start,gymId}));
 assert.deepEqual(error.issues,[{date:start,gymId,title:preview.title,count:5,plannedExerciseCount:9,notes:preview.notes}]);
 assert.ok(error.issues[0].notes.some(note=>/required|inventory|equipment/.test(note)));assert.deepEqual(state,before);
 error.issues[0].notes.push('Caller-owned diagnostic');assert.deepEqual(state,before);
});

test('a zero-exercise automatic lifting day is rejected before it can be reclassified as a rest day',()=>{
 const state=fixture(),date='2027-01-06';state.training.split='bro';state.gyms[0].inventory=[];
 state.logs[date]=manualDay(date);state.logs[date].exercises[0].sets[0].w=0;
 const before=C.clone(state),preview=W.workoutFromChoice(state,'auto',date,gymId);
 assert.equal(preview.kind,'strength');assert.equal(preview.title,'Legs');assert.equal(preview.exercises.length,0);assert.equal(preview.plannedExerciseCount,7);
 const error=reviewError(()=>W.editSession(state,date,{choice:'auto',date,gymId,runMinutes:0,saunaMinutes:0}));
 assert.deepEqual(error.issues,[{date,gymId,title:'Legs',count:0,plannedExerciseCount:7,notes:preview.notes}]);assert.deepEqual(state,before);
});

test('regeneration rejects the whole edit when future automatic days are incomplete and preserves completed, zero-load and historical records',()=>{
 const state=fixture();state.logs[start]=manualDay();
 const completed=manualDay('2027-01-06');completed.status='completed';completed.completedAt='2027-01-06T12:00:00.000Z';state.logs[completed.date]=completed;
 const entered=manualDay('2027-01-08');entered.exercises[0].sets[0].w=0;state.logs[entered.date]=entered;
 state.logs[start+'~edit-existing']={...C.clone(entered),id:start+'~edit-existing',customNote:'Keep archive'};
 state.plan['2027-01-11']=C.packPlanDay(manualDay('2027-01-11'));
 const before=C.clone(state),error=reviewError(()=>W.editSession(state,start,{choice:'keep',date:start,gymId,adjust:'regenerate',runMinutes:15}));
 assert.ok(error.issues.length>1);assert.ok(error.issues.some(issue=>issue.count===3));assert.ok(error.issues.every(issue=>issue.date>start));
 assert.equal(error.issues.some(issue=>[completed.date,entered.date].includes(issue.date)),false);
 assert.deepEqual(state,before);
});

test('a failed future regeneration cannot commit a date swap, replacement archive or conditioning edit',()=>{
 const state=fixture({full:true}),sparseId='sparse-scheduled-gym';
 state.gyms.push({...C.clone(state.gyms[0]),id:sparseId,inventory:['Dumbbells']});
 state.gymSchedules=[{id:'sparse-weekday',gymId:sparseId,type:'weekly',weekdays:[2],priority:10}];
 const old=manualDay();old.exercises[0].sets[0].w=0;state.logs[start]=old;const target='2027-01-07';state.plan[target]=C.packPlanDay(manualDay(target));
 const before=C.clone(state);let error;
 assert.throws(()=>W.editSession(state,start,{choice:'auto',date:target,gymId,adjust:'regenerate',runMinutes:25,saunaMinutes:10}),caught=>{error=caught;return caught.code==='AUTOMATIC_WORKOUT_REVIEW'});
 assert.ok(error.issues.length);assert.ok(error.issues.every(issue=>issue.gymId===sparseId));assert.deepEqual(state,before);
});

test('full commercial inventory permits compatible automatic replacement and future regeneration while retaining recorded copies',()=>{
 const state=fixture({full:true}),old=manualDay();Object.assign(old.exercises[0].sets[0],{w:0,r:8,rir:0,done:true});state.logs[start]=old;
 const completed=manualDay('2027-01-06');completed.status='completed';state.logs[completed.date]=completed;
 const entered=manualDay('2027-01-08');entered.exercises[0].sets[0].w=0;state.logs[entered.date]=entered;
 const before=C.clone(state),result=W.editSession(state,start,{choice:'auto',date:start,gymId,adjust:'regenerate'});
 const archive=Object.entries(result.state.logs).find(([key])=>key.startsWith(start+'~edit-'));
 assert.ok(archive);assert.deepEqual(archive[1],{...old,id:archive[0]});
 assert.deepEqual(result.state.logs[completed.date],completed);assert.deepEqual(result.state.logs[entered.date],entered);
 const generated=Object.entries(result.state.logs).filter(([key])=>/^\d{4}-\d{2}-\d{2}$/.test(key)&&![completed.date,entered.date].includes(key)).map(([,day])=>day);
 assert.ok(generated.length>20);
 for(const day of generated.filter(day=>day.kind==='strength')){
  assert.ok(day.exercises.length>=6&&day.exercises.length<=9,day.date);
  assert.ok(day.exercises.every(exercise=>C.supports(C.exerciseFor(exercise.exerciseId),state.gyms[0])),day.date);
 }
 assert.deepEqual(state,before);assert.deepEqual(result.state.gyms,before.gyms);assert.deepEqual(result.state.training,before.training);
});

test('existing manual, routine, legacy and saved short sessions remain editable without the automatic minimum',()=>{
 const state=fixture();state.logs[start]=manualDay();state.logs[start].exercises[0].sets[0].w=0;
 state.routines=[{id:'short-routine',name:'My single exercise',exercises:C.clone(state.logs[start].exercises),unknownPreference:{keep:true}}];
 const savedDate='2027-01-11';state.plan[savedDate]=C.packPlanDay({...manualDay(savedDate),title:'My saved short plan',generatorVersion:C.VERSION,plannedExerciseCount:9});
 const before=C.clone(state);
 for(const choice of ['keep','routine:short-routine','legacy:0','plan:'+savedDate]){
  const diagnostic=W.workoutFromChoice(state,choice,start,gymId),result=W.editSession(state,start,{choice,date:start,gymId});
  assert.equal(result.state.logs[start].exercises.length,diagnostic.exercises.length);if(!choice.startsWith('legacy:'))assert.ok(diagnostic.exercises.length<6,choice+' is intentionally shorter than the automatic minimum');
  assert.deepEqual(state,before);assert.deepEqual(result.state.routines,before.routines);assert.deepEqual(result.state.plan,before.plan);
  if(choice==='keep')assert.deepEqual(result.state.logs[start].exercises,before.logs[start].exercises);
  else assert.ok(Object.keys(result.state.logs).some(key=>key.startsWith(start+'~edit-')));
 }
 const historical=C.clone(state);historical.logs[start].title='Chest + Biceps #1';historical.logs[start].generatorVersion='8.0.0-beta.6';
 const restored=W.editSession(historical,start,{choice:'keep',date:start,gymId});assert.deepEqual(restored.state.logs[start].exercises,historical.logs[start].exercises);assert.equal(restored.state.logs[start].exercises.length,1);assert.equal(restored.state.logs[start].title,'Chest + Biceps #1');
});
