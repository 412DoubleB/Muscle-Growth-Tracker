import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../core.mjs';
import * as W from '../workouts.mjs';
import * as S from '../supersets.mjs';
const date='2027-01-04';
function fixture(){
 const state=C.defaultState();state.training={...state.training,mode:'automatic',frequency:7,startDate:date,split:'bro',restWeekdays:[],runEvery:0};state.gymSchedules=[];
 const exercise=C.makeExercise(C.exerciseFor('Band Biceps Curl'));
 exercise.sets[0].band='Saved brand / light / short stance';exercise.sets[0].unknown={retain:0};
 const day={id:date,date,title:'Band draft',kind:'strength',status:'in-progress',gymId:'crunch',exercises:[exercise]};return {state,exercise,day};
}

test('a band setting alone protects its workout from program changes and plan compaction',()=>{
 const {state,day,exercise}=fixture();state.logs[date]=day;const before=C.clone(state);
 assert.equal(W.hasEntries(day),true);assert.match(W.programDayProtection(state,date),/Gym entries/);assert.equal(S.entered(exercise),true);
 const packed=C.packPlanDay(day);assert.deepEqual(packed,day);assert.equal(packed.exercises[0].sets[0].band,exercise.sets[0].band);assert.notEqual(packed,day);
 const result=C.generateProgram(state,{start:date,days:1});assert.equal(result.days.length,0);assert.match(result.warnings.join(' '),/existing workout preserved/);assert.deepEqual(state,before);
});

test('band-only entered plan records are carried into the generation scratch state without losing the original',()=>{
 const {state,day}=fixture();state.plan[date]=day;const before=C.clone(state),scratch=W.programGenerationState(state);
 assert.deepEqual(scratch.logs[date],day);assert.deepEqual(scratch.plan[date],day);assert.match(W.programDayProtection(state,date),/Gym entries/);assert.deepEqual(state,before);
});

test('band-only entries protect superset structure while blank or nonstring settings preserve the old unstarted behavior',()=>{
 const {exercise,day}=fixture();day.exercises.push(C.makeExercise(C.exerciseFor('Wall Push-Up')));const before=C.clone(day);
 assert.match(S.pairingUnavailableReason(day,0),/entered sets/);assert.throws(()=>S.pairExercises(day,0,1,60),/entered sets/);assert.deepEqual(day,before);
 for(const value of ['', '   ',null,undefined,0,{}]){const unstarted=C.clone(exercise);unstarted.sets[0].band=value;assert.equal(S.entered(unstarted),false);assert.equal(W.hasEntries({exercises:[unstarted]}),false)}
 for(const [key,value] of [['w',0],['r',1],['rir',0],['done',true]]){const old=C.clone(exercise);delete old.sets[0].band;old.sets[0][key]=value;assert.equal(S.entered(old),true);assert.equal(W.hasEntries({exercises:[old]}),true)}
});

test('automatic repair cannot replace an older generated plan with a saved band setting',()=>{
 const {state}=fixture(),day=C.generateProgram(state,{start:date,days:1}).days[0];day.exercises=day.exercises.slice(0,1);day.generatorVersion='8.0.0-beta.6';state.plan[date]=day;
 const blank=C.clone(state);assert.equal(C.restoreGeneratedSessionSizes(blank,{from:date}),1,'The fixture must otherwise qualify for the old generated-size repair');
 day.exercises[0].sets[0].band='Saved band context';const before=C.clone(state);assert.equal(C.restoreGeneratedSessionSizes(state,{from:date}),0);assert.deepEqual(state,before);
});
