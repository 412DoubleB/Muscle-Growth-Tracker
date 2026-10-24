import test from 'node:test';
import assert from 'node:assert/strict';
import {trainingStreak,dailyMotivation,streakMilestone} from '../motivation.mjs';
import {defaultState} from '../core.mjs';
const complete=(date,extra={})=>({date,status:'completed',kind:'strength',exercises:[{sets:[{w:0,r:30.5,role:'working',done:true}]}],...extra});
const ongoing=()=>{
 const state=defaultState();state.training={...state.training,mode:'automatic',startDate:'2027-01-04',updatedAt:'2027-01-04T00:00:00Z',frequency:1,restWeekdays:[],runEvery:0};state.logs={'2027-01-04':complete('2027-01-04')};return state;
};
test('scheduled rest adds a streak day without completion, keeps genuine totals and grants today grace without writing history',()=>{
 const state={logs:{'2027-01-01':complete('2027-01-01'),'2027-01-03':complete('2027-01-03'),'2027-01-04':complete('2027-01-04',{status:'in-progress'})},plan:{'2027-01-02':{kind:'rest',exercises:[]}}},before=structuredClone(state);
 assert.deepEqual(trainingStreak(state,'2027-01-04'),{current:3,best:3,total:2,lastCompleted:'2027-01-03',todayCompleted:false,recoveryDay:false});assert.deepEqual(state,before);
 state.logs['2027-01-04'].status='completed';const after=trainingStreak(state,'2027-01-04');assert.equal(after.current,4);assert.equal(after.total,3);assert.equal(after.todayCompleted,true);
 state.plan['2027-01-05']={kind:'rest'};const rest=trainingStreak(state,'2027-01-05');assert.equal(rest.current,5);assert.equal(rest.recoveryDay,true);assert.equal(rest.total,3);assert.equal(rest.lastCompleted,'2027-01-04');assert.equal(rest.todayCompleted,false);assert.equal(streakMilestone(after,rest),false);
});
test('ongoing calendar recovery counts on unvisited dates without logs, completion or programme generation',()=>{
 const state=ongoing(),before=structuredClone(state);
 assert.deepEqual(trainingStreak(state,'2027-01-05'),{current:2,best:2,total:1,lastCompleted:'2027-01-04',todayCompleted:false,recoveryDay:true});
 state.logs['2027-01-07']=complete('2027-01-07');const withWorkout=structuredClone(state);
 const result=trainingStreak(state,'2027-01-08');assert.equal(result.current,5);assert.equal(result.best,5);assert.equal(result.total,2);assert.equal(result.recoveryDay,true);assert.deepEqual(state,withWorkout);
 delete state.logs['2027-01-07'];assert.deepEqual(state,before);
 // The next Monday was a lifting day, not an automatic recovery credit.
 assert.equal(trainingStreak(state,'2027-01-12').current,0);assert.deepEqual(state,before);
});
test('rest-only history never starts a training streak and completing a rest log is unnecessary',()=>{
 const state=ongoing();state.logs={};state.plan={'2027-01-04':{kind:'rest'},'2027-01-05':{kind:'rest'}};
 assert.equal(trainingStreak(state,'2027-01-06').current,0);assert.equal(trainingStreak(state,'2027-01-06').total,0);
 state.logs['2027-01-04']=complete('2027-01-04');state.logs['2027-01-05']={date:'2027-01-05',kind:'rest',status:'in-progress',exercises:[]};const before=structuredClone(state);
 assert.equal(trainingStreak(state,'2027-01-06').current,3);assert.deepEqual(state,before);assert.equal(state.logs['2027-01-05'].status,'in-progress');
});
test('a no-lifting weekday with a scheduled run still requires a completed workout',()=>{
 const state=ongoing();state.training.runEvery=2;
 assert.equal(trainingStreak(state,'2027-01-05').current,2);
 assert.equal(trainingStreak(state,'2027-01-06').recoveryDay,false);assert.equal(trainingStreak(state,'2027-01-06').current,2);
 assert.equal(trainingStreak(state,'2027-01-07').current,0);
 state.logs['2027-01-06']=complete('2027-01-06',{kind:'run',exercises:[],run:{done:true,minutes:20}});
 const result=trainingStreak(state,'2027-01-07');assert.equal(result.current,4);assert.equal(result.total,2);
});
test('explicit workouts and invalid or deleted date-keyed records block inferred rest',()=>{
 for(const record of [null,{date:'2027-01-06',kind:'rest'},{date:'2027-01-05',kind:'rest',deleted:true},{date:'2027-01-05',kind:'strength',status:'skipped',exercises:[]},{date:'2027-01-05',kind:'strength',status:'in-progress',exercises:[]}]){
  const state=ongoing();state.logs['2027-01-05']=record;const before=structuredClone(state);assert.equal(trainingStreak(state,'2027-01-06').current,0);assert.deepEqual(state,before);
 }
 const state=ongoing();state.plan['2027-01-05']={date:'2027-01-05',kind:'rest'};state.logs['2027-01-05']={date:'2027-01-05',kind:'strength',status:'skipped'};assert.equal(trainingStreak(state,'2027-01-06').current,0);
 // Deleting a log does not erase independent, explicitly saved schedule evidence.
 state.logs['2027-01-05'].deleted=true;const before=structuredClone(state),result=trainingStreak(state,'2027-01-06');assert.equal(result.current,3);assert.equal(result.total,1);assert.deepEqual(state,before);
});
test('later programme changes cannot reclassify unknown history or fallback unplanned dates as rest',()=>{
 for(const training of [{updatedAt:'2027-01-06T00:00:00Z'},{updatedAt:'invalid'},{updatedAt:null},{startDate:'2027-01-06'},{mode:'unknown'}]){
  const state=ongoing();Object.assign(state.training,training);state.logs['2027-01-06']=complete('2027-01-06');assert.equal(trainingStreak(state,'2027-01-06').current,1);
 }
 const state=ongoing();state.gyms=[];assert.equal(trainingStreak(state,'2027-01-06').current,0);
});
test('switching to Original Program uses its current calendar while preserving older saved schedule evidence',()=>{
 const state=ongoing();state.training={...state.training,mode:'original',startDate:'2026-10-01',updatedAt:'2026-10-01T00:00:00Z'};
 state.logs={'2026-10-01':complete('2026-10-01'),'2026-10-03':complete('2026-10-03')};state.plan={'2026-10-02':{date:'2026-10-02',kind:'rest'}};let before=structuredClone(state);
 assert.equal(trainingStreak(state,'2026-10-03').current,1);assert.deepEqual(state,before);
 state.logs={'2026-10-06':complete('2026-10-06'),'2026-10-08':complete('2026-10-08')};state.plan={'2026-10-07':{date:'2026-10-07',kind:'strength'}};before=structuredClone(state);
 assert.equal(trainingStreak(state,'2026-10-08').current,3);assert.deepEqual(state,before);
 // Original Program ignores the old automatic program's future start date.
 state.training.startDate='2027-01-04';assert.equal(trainingStreak(state,'2026-10-08').current,3);
 state.logs['2026-10-07']={date:'2026-10-07',kind:'strength',status:'skipped'};assert.equal(trainingStreak(state,'2026-10-08').current,1);
 delete state.logs['2026-10-07'];state.plan['2026-10-07'].kind='rest';state.training.updatedAt='2026-10-08T00:00:00Z';
 assert.equal(trainingStreak(state,'2026-10-08').current,3);
});
test('recovery and programme effective dates follow local calendar days across DST',()=>{
 const original=process.env.TZ;process.env.TZ='America/New_York';try{
  const state=ongoing();state.training.startDate='2027-03-07';state.training.updatedAt='2027-03-09T02:00:00Z';state.logs={'2027-03-07':complete('2027-03-07')};
  // The update occurred on March 8 locally, allowing that known recovery day.
  assert.equal(trainingStreak(state,'2027-03-08').current,2);
  state.training.startDate='2027-03-13';state.training.updatedAt='2027-03-13T12:00:00Z';state.logs={'2027-03-13':complete('2027-03-13')};const before=structuredClone(state);
  assert.equal(trainingStreak(state,'2027-03-15').current,3);assert.deepEqual(state,before);
 }finally{if(original===undefined)delete process.env.TZ;else process.env.TZ=original}
});
test('missed known workout days and unknown gaps break streaks; future, archived, invalid and deleted dates never count',()=>{
 const state={logs:{'2027-01-01':complete('2027-01-01'),'2027-01-03':complete('2027-01-03'),'2027-01-03~copy':complete('2027-01-03'),'2027-01-05':complete('2027-01-05'),'2027-02-30':complete('2027-02-30')},plan:{}};
 assert.equal(trainingStreak(state,'2027-01-04').current,1);assert.equal(trainingStreak(state,'2027-01-04').total,2);
 state.plan['2027-01-02']={kind:'strength',exercises:[{setTemplates:[{role:'working'}]}]};assert.equal(trainingStreak(state,'2027-01-04').current,1);
 state.logs['2027-01-03'].deleted=true;assert.equal(trainingStreak(state,'2027-01-04').current,0);assert.equal(trainingStreak(state,'2027-01-04').total,1);
});
test('empty completions, unchecked rows, invalid/blank values and sauna alone do not earn a day; completed runs and zero loads do',()=>{
 for(const extra of [{exercises:[]},{exercises:[],sauna:{done:true,minutes:20}},{exercises:[{sets:[{done:true,w:'',r:10}]}]},{exercises:[{sets:[{done:true,w:0,r:0}]}]},{exercises:[{sets:[{done:false,w:0,r:10}]}]},{exercises:[{sets:[{done:true,w:-1,r:10}]}]}]){
  assert.equal(trainingStreak({logs:{'2027-01-04':complete('2027-01-04',extra)}},'2027-01-04').total,0);
 }
 const run=complete('2027-01-04',{kind:'run',exercises:[],run:{done:true,minutes:20}});assert.equal(trainingStreak({logs:{'2027-01-04':run}},'2027-01-04').current,1);assert.equal(trainingStreak({logs:{'2027-01-04':complete('2027-01-04')}},'2027-01-04').current,1);
});
test('daily text is stable by date and milestone celebrations require a newly completed milestone',()=>{
 assert.equal(dailyMotivation('2027-01-04'),dailyMotivation('2027-01-04'));assert.notEqual(dailyMotivation('2027-01-04'),dailyMotivation('2027-01-05'));
 assert.equal(streakMilestone({current:2},{current:3,todayCompleted:true}),true);assert.equal(streakMilestone({current:3},{current:3,todayCompleted:true}),false);assert.equal(streakMilestone({current:1},{current:2,todayCompleted:true}),false);assert.equal(streakMilestone({current:6},{current:7,todayCompleted:false}),false);
});
