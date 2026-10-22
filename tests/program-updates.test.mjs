import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../core.mjs';
import * as W from '../workouts.mjs';
const date='2027-01-04';
function workspace(){const s=C.defaultState();s.training={...s.training,mode:'automatic',startDate:date};const d=C.generateProgram(s,{start:date,days:1}).days[0];s.plan[date]=C.packPlanDay(d);return s}
test('program eligibility allows an unstarted current-day log but protects every kind of entered gym set, including zero',()=>{
 const s=workspace();s.logs[date]=C.clone(C.expandPlanDay(s.plan[date]));s.logs[date].status='in-progress';assert.equal(W.programDayProtection(s,date),'');
 for(const [key,value]of [['w',0],['r',1],['rir',0],['done',true]]){const next=C.clone(s);next.logs[date].exercises[0].sets[0][key]=value;assert.match(W.programDayProtection(next,date),/Gym entries/);assert.deepEqual(s.logs[date].exercises[0].sets[0].w,'')}
 for(const flags of [{status:'completed'},{status:'skipped'},{run:{done:true,minutes:20}},{sauna:{done:true,minutes:10}}]){const next=C.clone(s);Object.assign(next.logs[date],flags);assert.ok(W.programDayProtection(next,date))}
});
test('preview protects entered plan rows without changing logs, plans, unknown fields or retained history',()=>{
 const s=workspace(),d=C.expandPlanDay(s.plan[date]);d.exercises[0].sets[0].rir=0;d.unknown={keep:true};s.plan[date]=C.packPlanDay(d);s.logs[date]={...C.clone(d),exercises:[],status:'in-progress'};s.logs[date+'~copy']={...C.clone(d),id:date+'~copy'};const before=C.clone(s);
 assert.match(W.programDayProtection(s,date),/Gym entries/);const scratch=W.programGenerationState(s);assert.equal(scratch.logs[date].exercises[0].sets[0].rir,0);assert.ok(!C.generateProgram(scratch,{start:date,days:7}).days.some(d=>d.date===date));assert.deepEqual(s,before);
 s.plan[date].deleted=true;assert.equal(W.programDayProtection(s,date),'');
});
