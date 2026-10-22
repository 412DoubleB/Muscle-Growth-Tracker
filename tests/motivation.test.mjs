import test from 'node:test';
import assert from 'node:assert/strict';
import {trainingStreak,dailyMotivation,streakMilestone} from '../motivation.mjs';
const complete=(date,extra={})=>({date,status:'completed',kind:'strength',exercises:[{sets:[{w:0,r:30.5,role:'working',done:true}]}],...extra});
test('training streak counts canonical completed days, preserves explicit rest, grants today grace, and never writes history',()=>{
 const state={logs:{'2027-01-01':complete('2027-01-01'),'2027-01-03':complete('2027-01-03'),'2027-01-04':complete('2027-01-04',{status:'in-progress'})},plan:{'2027-01-02':{kind:'rest',exercises:[]}}},before=structuredClone(state);
 assert.deepEqual(trainingStreak(state,'2027-01-04'),{current:2,best:2,total:2,lastCompleted:'2027-01-03',todayCompleted:false,recoveryDay:false});assert.deepEqual(state,before);
 state.logs['2027-01-04'].status='completed';const after=trainingStreak(state,'2027-01-04');assert.equal(after.current,3);assert.equal(after.total,3);assert.equal(after.todayCompleted,true);assert.equal(streakMilestone({current:2},after),true);
 state.plan['2027-01-05']={kind:'rest'};const rest=trainingStreak(state,'2027-01-05');assert.equal(rest.current,3);assert.equal(rest.recoveryDay,true);assert.equal(rest.total,3);
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
