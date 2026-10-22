import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../session-order.mjs';
import * as C from '../core.mjs';
import * as W from '../workouts.mjs';
const date='2027-01-04',at=(minute,second=0)=>new Date(2027,0,4,12,minute,second),stamp=(minute,second=0)=>T.completionCheck({role:'working',w:40,r:10,done:false},true,date,at(minute,second)).checkedAt;
const checked=(minute,role='working')=>({role,w:40,r:10,rir:2,done:true,checkedAt:stamp(minute)});
const exercise=(name,sets)=>({...C.makeExercise(C.exerciseFor(name)),sets});
function log(exercises){return {id:date,date,title:'Synthetic order',status:'in-progress',gymId:'crunch',exercises}}
const meta=e=>C.exerciseFor(e.exerciseId)||e;

test('new valid Done checks record the device offset only for today, without changing inputs or inventing old timing',()=>{
 const input={id:'keep',role:'working',w:0,r:8,rir:0,done:false,unknown:{keep:0}},before=structuredClone(input),out=T.completionCheck(input,true,date,at(1));
 assert.equal(out.done,true);assert.match(out.checkedAt,/^2027-01-04T12:01:00\.000[+-]\d{2}:\d{2}$/);assert.deepEqual(input,before);assert.deepEqual(T.withoutCompletionTiming({...out,done:false}),input);
 assert.equal(T.completionCheck(out,true,date,at(5)).checkedAt,out.checkedAt,'duplicate Done cannot move the record');
 assert.equal(T.completionCheck(out,false,date,at(5)).checkedAt,out.checkedAt,'unchecked timing stays stored but inactive');
 assert.notEqual(T.completionCheck({...out,done:false},true,date,at(5)).checkedAt,out.checkedAt,'an explicit new check records its logging time');
 for(const d of ['2027-01-03','2027-01-05'])assert.equal(T.completionCheck(input,true,d,at(1)).checkedAt,undefined);
 for(const s of [{...input,w:''},{...input,r:0},{...input,w:Infinity}])assert.equal(T.completionCheck(s,true,date,at(1)).checkedAt,undefined);
});

test('interleaved supersets use check chronology; warm-ups do not manufacture working-set order, and unknown rows remain unknown',()=>{
 const day=log([exercise('Dumbbell Bench Press',[checked(0,'warmup'),checked(4),checked(8)]),exercise('Hammer Curl',[checked(2),checked(6)]),exercise('Cable Curl',[{role:'working',w:30,r:10,done:true}])]),before=structuredClone(day),timeline=T.sessionTimeline(day);
 assert.deepEqual(timeline.exercises.map(e=>e.index),[1,0]);assert.deepEqual(timeline.exercises.map(e=>e.position),[1,2]);assert.equal(timeline.exercises[1].earlierSets.length,1);assert.deepEqual(timeline.sets.map(s=>s.index),[0,1,0,1,0]);assert.equal(timeline.unknown,1);assert.equal(timeline.unknownWorking,1);assert.deepEqual(day,before);
 const tied=log([exercise('Cable Curl',[checked(1)]),exercise('Hammer Curl',[checked(1)])]);assert.ok(T.sessionTimeline(tied).exercises.every(e=>e.tied&&e.position===1));
 for(const status of ['skipped'])assert.equal(T.sessionTimeline({...day,status}).sets.length,0);assert.equal(T.sessionTimeline({...day,id:date+'~copy'}).sets.length,0);
});

test('fatigue advice uses recorded prior work and honest historical placement without changing either workout or progression',()=>{
 const day=log([exercise('Cable Curl',[checked(1)]),exercise('Hammer Curl',[checked(4)])]);const prior=log([exercise('Hammer Curl',[checked(0)]),exercise('Cable Curl',[checked(3)])]);prior.id=prior.date='2027-01-01';for(const e of prior.exercises)for(const s of e.sets)s.checkedAt=s.checkedAt.replace(date,prior.date);
 const before=structuredClone([day,prior]),notes=T.orderContext(day,1,{log:prior,exercise:prior.exercises[0]},meta).join(' ');
 assert.match(notes,/order: 2/);assert.match(notes,/Possible fatigue overlap: Cable Curl/);assert.match(notes,/Last 2027-01-01: recorded working-set order 1/);assert.match(notes,/placement differs/);assert.deepEqual([day,prior],before);
 const unknown=structuredClone(day);delete unknown.exercises[0].sets[0].checkedAt;assert.doesNotMatch(T.orderContext(unknown,1,{log:prior,exercise:prior.exercises[0]},meta).join(' '),/placement differs/);
 const state=C.defaultState(),gym=state.gyms[0],e=structuredClone(day.exercises[1]);e.sets.push({role:'working',w:'',r:'',rir:'',done:false});const withTiming=C.nextSetRecommendation(state,e,gym);assert.ok(withTiming);const untimed=structuredClone(e);for(const s of untimed.sets)delete s.checkedAt;assert.deepEqual(C.nextSetRecommendation(state,untimed,gym),withTiming);
});

test('unreadable, unchecked and other-day timing is ignored rather than used to infer order',()=>{
 for(const checkedAt of ['not a time','2027-01-05T12:01:00.000+00:00','2027-01-04T99:99:00.000+00:00']){
  const day=log([exercise('Hammer Curl',[{...checked(1),checkedAt}])]);assert.equal(T.sessionTimeline(day).sets.length,0);assert.equal(T.sessionTimeline(day).unknown,1);
 }
 assert.equal(T.sessionTimeline(log([exercise('Hammer Curl',[{...checked(1),done:false}])])).sets.length,0);
 const invalid=log([exercise('Hammer Curl',[{...checked(1),checkedAt:'2027-02-30T12:01:00.000+00:00'}])]);invalid.id=invalid.date='2027-02-30';assert.equal(T.sessionTimeline(invalid).sets.length,0);
 const offset=log([exercise('Hammer Curl',[{...checked(1),checkedAt:'2027-01-04T00:01:00.000+05:30'}])]);assert.equal(T.sessionTimeline(offset).sets[0].label,'00:01:00');assert.equal(T.sessionTimeline(offset).sets[0].zone,'UTC+05:30');
});

test('saved routines, fresh routine choices and continuing custom calendars cannot inherit completion timing',()=>{
 const state=C.defaultState(),e=exercise('Hammer Curl',[{...checked(1),unknown:'keep'}]);state.routines=[{id:'timed-template',name:'Synthetic saved routine',exercises:[e]}];const before=structuredClone(state.routines);
 const day=W.workoutFromChoice(state,'routine:timed-template',date,state.gyms[0].id);assert.ok(day.exercises.every(e=>e.sets.every(s=>!s.done&&!s.checkedAt&&s.unknown==='keep')));
 state.training={...state.training,mode:'custom',startDate:date,routineOrder:['timed-template']};const continued=C.rollingDay(state,'2027-01-06');assert.ok(continued.exercises.length);assert.ok(continued.exercises.every(e=>e.sets.every(s=>!s.checkedAt&&!s.done)));assert.deepEqual(state.routines,before);
});
