import test from 'node:test';
import assert from 'node:assert/strict';
import {addDays,defaultState,dayFor,generateProgram,scheduledDayKind} from '../core.mjs';

const stateFor=training=>{const state=defaultState();Object.assign(state.training,{mode:'automatic',startDate:'2026-11-02'},training);return state};
const dates=(start,count)=>Array.from({length:count},(_,i)=>addDays(start,i));

test('scheduled kinds share generated lift and run cadence for automatic, custom and legacy splits',()=>{
 for(const training of [
  {frequency:4,split:'seven',runEvery:0,restWeekdays:[0]},
  {frequency:3,split:'ppl',runEvery:2,restWeekdays:[0,3]},
  {mode:'custom',frequency:6,split:'upper-lower',runEvery:3,restWeekdays:[6]},
  {frequency:1,split:'legacy',runEvery:2,restWeekdays:[0,1,2,3,4,5,6]}
 ]){
  const state=stateFor(training),before=structuredClone(state),generated=generateProgram(state,{start:state.training.startDate,days:35});
  assert.equal(generated.days.length,35);
  for(const day of generated.days)assert.equal(scheduledDayKind(state,day.date),day.kind,`${JSON.stringify(training)} ${day.date}`);
  assert.deepEqual(state,before);
 }
});

test('original fixed block and ongoing original cadence match displayed days without generating in the projection',()=>{
 for(const runEvery of [0,2,3]){
  const state=stateFor({mode:'original',runEvery}),before=structuredClone(state);
  for(const date of dates('2026-10-01',56))assert.equal(scheduledDayKind(state,date),dayFor(state,date).kind,`original runEvery=${runEvery} ${date}`);
  // The original block includes named runs even when later cadence runs are off.
  assert.equal(scheduledDayKind(state,'2026-10-03'),'run');
  assert.equal(scheduledDayKind(state,'2026-10-07'),'rest');
  assert.deepEqual(state,before);
 }
});

test('automatic and custom projections match rolling days and lifting rest weekdays can still be run days',()=>{
 for(const mode of ['automatic','custom']){
  const state=stateFor({mode,frequency:3,restWeekdays:[0,3],runEvery:2}),before=structuredClone(state);
  for(const date of dates(state.training.startDate,28))assert.equal(scheduledDayKind(state,date),dayFor(state,date).kind,`${mode} ${date}`);
  assert.deepEqual(state,before);
 }
 const state=stateFor({frequency:1,restWeekdays:[2],runEvery:1});
 assert.equal(scheduledDayKind(state,'2026-11-03'),'run');
 state.training.runEvery=0;
 assert.equal(scheduledDayKind(state,'2026-11-03'),'rest');
});

test('unknown programs, dates, anchors and unavailable gyms cannot become inferred recovery',()=>{
 const state=stateFor({runEvery:0});
 for(const date of ['2026-02-30','2026-11-2','invalid',null,'2026-11-01'])assert.equal(scheduledDayKind(state,date),null);
 assert.equal(scheduledDayKind({},'2026-11-03'),null);
 for(const mode of [undefined,'manual','unknown'])assert.equal(scheduledDayKind({...state,training:{...state.training,mode}},'2026-11-03'),null);
 for(const startDate of [undefined,'2026-02-30','invalid'])assert.equal(scheduledDayKind({...state,training:{...state.training,startDate}},'2026-11-03'),null);
 assert.equal(scheduledDayKind({...state,training:{...state.training,mode:'original'}},'2026-09-30'),null);
 for(const gyms of [undefined,[],state.gyms.map(g=>({...g,deleted:true})),[{id:''}],[null]])assert.equal(scheduledDayKind({...state,gyms},'2026-11-03'),null);
 assert.equal(scheduledDayKind({...state,gymSchedules:{}},'2026-11-03'),null);
});

test('projection reads cadence only, ignores history overrides, and never creates IDs or alters the workspace',()=>{
 const state=stateFor({frequency:1,restWeekdays:[],runEvery:0}),date='2026-11-03';
 state.logs[date]={date,kind:'strength',status:'skipped'};
 state.plan[date]={date,kind:'run',run:{minutes:30}};
 const before=structuredClone(state),cryptoDescriptor=Object.getOwnPropertyDescriptor(globalThis,'crypto');let ids=0;
 Object.defineProperty(globalThis,'crypto',{configurable:true,value:{randomUUID(){ids++;throw Error('The schedule projection must not create IDs.')}}});
 try{
  assert.equal(scheduledDayKind(state,date),'rest');
  state.training.mode='original';
  assert.equal(scheduledDayKind(state,'2026-10-01'),'strength');
  assert.equal(scheduledDayKind(state,'2026-10-07'),'rest');
  assert.equal(scheduledDayKind(state,'2026-10-29'),'strength');
  state.training.mode=before.training.mode;
  assert.equal(ids,0);
  assert.deepEqual(state,before);
 }finally{
  if(cryptoDescriptor)Object.defineProperty(globalThis,'crypto',cryptoDescriptor);else delete globalThis.crypto;
 }
});
