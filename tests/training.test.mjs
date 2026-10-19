import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../core.mjs';
import {TRAINING_STYLES,splitSession,runningSession} from '../training.mjs';
function state(split='ppl',focus='hypertrophy'){const s=C.defaultState(),p=TRAINING_STYLES[focus];s.training={...s.training,mode:'automatic',startDate:'2026-10-19',split,trainingStyle:focus,frequency:4,sets:p.sets,range:p.range,restSeconds:p.rest,restWeekdays:[0],runEvery:3};return s}
test('all four splits rotate in sequence across block boundaries and use only matching equipment',()=>{
 for(const split of ['full','upper-lower','ppl','bro']){const s=state(split);const a=C.generateProgram(s,{start:s.training.startDate,days:84});const lifts=a.days.filter(d=>d.kind==='strength');assert.equal(lifts.length,48);for(let i=0;i<lifts.length;i++){const d=lifts[i];assert.equal(d.title,splitSession(split,i)[0]);for(const e of d.exercises)assert.ok(C.supports(C.exerciseFor(e.exerciseId),s.gyms.find(g=>g.id===d.gymId)));}const b=C.generateProgram(s,{start:C.addDays(s.training.startDate,28),days:28});assert.equal(b.days.find(d=>d.kind==='strength').title,splitSession(split,16)[0]);}
});
test('strength, hypertrophy and endurance prescribe the selected set, rep and rest values',()=>{
 for(const focus of Object.keys(TRAINING_STYLES)){const s=state('full',focus),p=TRAINING_STYLES[focus],days=C.generateProgram(s,{start:s.training.startDate,days:7}).days;for(const d of days)for(const e of d.exercises){assert.equal(e.sets.length,p.sets);assert.equal(e.range,p.range);assert.ok(e.sets.every(r=>r.rest===p.rest));assert.equal(e.trainingStyle,focus);assert.equal(e.targetRir,p.rir);}}
});
test('both original continuation and automatic schedules generate far beyond day 28 without replaying exercise blocks',()=>{
 for(const original of [false,true]){const s=state('ppl');if(original)s.training.mode='original';const early=Array.from({length:28},(_,i)=>C.dayFor(s,C.addDays('2026-10-29',i)));const later=Array.from({length:28},(_,i)=>C.dayFor(s,C.addDays('2026-11-26',i)));assert.ok(early.some(d=>d.exercises.length));assert.ok(later.some(d=>d.exercises.length));assert.notDeepEqual(early.map(d=>d.exercises.map(e=>e.exerciseId)),later.map(d=>d.exercises.map(e=>e.exerciseId)));const future=C.dayFor(s,'2028-06-15');assert.notEqual(future.title,'Unplanned day');assert.equal(future.date,'2028-06-15');const entered=C.ensureLog(s,'2028-06-15');entered.customNote='Keep future workout';assert.equal(C.dayFor(s,'2028-06-15').customNote,'Keep future workout');}
});
test('rolling generation is stable during meal/profile edits and protects a future entered session',()=>{
 const s=state();const d=C.dayFor(s,'2027-03-01');s.updatedAt=C.now();s.nutrition.notes='changed food preference';assert.equal(C.dayFor(s,'2027-03-01'),d);const logged=C.ensureLog(s,'2027-03-02');logged.exercises[0].sets[0].w=45;const before=C.clone(logged);assert.deepEqual(C.dayFor(s,'2027-03-02'),before);const next=C.generateProgram(s,{start:'2027-03-01',days:28});assert.ok(!next.days.some(d=>d.date==='2027-03-02'));assert.deepEqual(s.logs['2027-03-02'],before);
});
test('running adjusts duration and quality to focus, experience and adjacent lower-body recovery',()=>{
 const context={date:'2026-10-27',dayIndex:8,legDay:false,legsTomorrow:false,recentLegs:false,week:1};let t={runEvery:2,trainingStyle:'strength',experience:'Advanced',runningQuality:true};let run=runningSession(t,context);assert.equal(run.minutes,25);assert.equal(run.blocks.length,0);assert.match(run.guidance,/3 hours/);t.trainingStyle='endurance';run=runningSession(t,context);assert.equal(run.blocks[0].repeat,4);assert.equal(run.minutes,run.warmup+run.cooldown+run.blocks[0].repeat*(run.blocks[0].workMinutes+run.blocks[0].recoveryMinutes));run=runningSession(t,{...context,legsTomorrow:true});assert.equal(run.blocks.length,0);assert.equal(run.minutes,20);assert.match(run.type,/Recovery/);t.experience='Beginner';run=runningSession(t,context);assert.equal(run.blocks.length,0);assert.match(run.type,/walk/);
});
test('endurance preview schedules at most one quality run per week and none adjacent to legs',()=>{
 const s=state('bro','endurance');s.training.frequency=3;s.training.runEvery=2;s.training.runningQuality=true;const days=C.generateProgram(s,{start:s.training.startDate,days:84}).days,quality=new Map();for(let i=0;i<days.length;i++){const d=days[i];if(!d.run?.blocks.length)continue;const week=Math.floor(i/7);quality.set(week,(quality.get(week)||0)+1);for(const adjacent of days.slice(Math.max(0,i-1),i+2))assert.ok(!adjacent.exercises.some(e=>C.exerciseFor(e.exerciseId)?.group==='Legs'));}assert.ok(quality.size>0);assert.ok([...quality.values()].every(n=>n===1));
});
test('a 52-week preview stores compact untouched plans and expands them into full editable sets without losing logged data',()=>{const s=state('ppl','strength'),all=C.generateProgram(s,{start:s.training.startDate,days:364}).days;for(const d of all)s.plan[d.date]=C.packPlanDay(d);assert.equal(Object.keys(s.plan).length,364);const date=all.find(d=>d.kind==='strength').date,day=C.dayFor(s,date);assert.equal(day.exercises[0].sets.length,4);assert.equal(day.exercises[0].sets[0].w,'');assert.equal(day.exercises[0].sets[0].rest,240);const log=C.ensureLog(s,date);log.exercises[0].sets[0].w=75;log.exercises[0].sets[0].r=5;const packed=C.packPlanDay(log);assert.equal(packed.exercises[0].sets[0].w,75);assert.notEqual(packed.compactPlan,true);C.validateState(s);assert.ok(JSON.stringify(s).length<1500000);});
test('PPL puts rear delts on pull days and front/side delts on push days',()=>{const s=state('ppl');const days=C.generateProgram(s,{start:s.training.startDate,days:42}).days;for(const d of days){const shoulders=d.exercises.map(e=>C.exerciseFor(e.exerciseId)).filter(e=>e.group==='Shoulders');if(d.title==='Push')assert.ok(shoulders.every(e=>['anterior','lateral'].includes(e.subgroup)));if(d.title==='Pull')assert.ok(shoulders.every(e=>e.subgroup==='rear'));}});
test('custom routine calendars continue beyond a saved block in the chosen rotation',()=>{const s=state();s.training.mode='custom';s.routines=[{id:'a',name:'My A',exercises:[C.makeExercise(C.CATALOG[0])]},{id:'b',name:'My B',exercises:[C.makeExercise(C.CATALOG[1])]}];s.training.routineOrder=['a','b'];const d=C.dayFor(s,'2027-04-01');assert.ok(['My A','My B','Recovery','Easy aerobic run','Recovery aerobic run'].includes(d.title));const lifts=Array.from({length:14},(_,i)=>C.dayFor(s,C.addDays('2027-04-01',i))).filter(d=>d.kind==='strength');assert.ok(lifts.length>0);assert.ok(lifts.every(d=>['My A','My B'].includes(d.title)));assert.ok(lifts.every(d=>d.exercises[0].sets.every(r=>r.w===''&&!r.done)));});

test('regenerating counts new strength days separately from preserved workouts',()=>{
 for(const [date,expected] of [['2026-10-19',15],['2026-10-25',16],['2026-10-18',16]]){
  const s=state('seven');
  assert.equal(C.generateProgram(s,{start:s.training.startDate,days:28}).days.filter(d=>d.kind==='strength').length,16);
  const log=C.originalDay(s,date);log.status='completed';s.logs[date]=log;
  const before=C.clone(s.logs),result=C.generateProgram(s,{start:s.training.startDate,days:28});
  assert.equal(result.days.filter(d=>d.kind==='strength').length,expected,date);
  assert.ok(!result.days.some(d=>d.date===date));
  assert.deepEqual(s.logs,before);
 }
});

test('preserved quality runs reserve their training week before any replacement is generated',()=>{
 for(const date of ['2026-10-26','2026-10-30']){
  const s=state('bro','endurance');s.training.frequency=1;s.training.runEvery=1;s.training.runningQuality=true;
  // A recorded interval run can precede or follow the first eligible new run,
  // or fall before the requested preview while still sharing its training week.
  s.logs[date]={id:date,date,status:'completed',kind:'run',exercises:[],run:{done:true,blocks:[{repeat:4,workMinutes:2,recoveryMinutes:2}]}};
  const before=C.clone(s.logs);
  for(const start of ['2026-10-26','2026-10-28']){
   const days=C.generateProgram(s,{start,days:7}).days;
   const sameWeek=days.filter(d=>C.daysBetween(d.date,s.training.startDate)>=7&&C.daysBetween(d.date,s.training.startDate)<14);
   assert.ok(sameWeek.some(d=>d.run),'easy runs remain available');
   assert.equal(sameWeek.filter(d=>d.run?.blocks?.length).length,0,`${date}, preview ${start}`);
  }
  assert.deepEqual(s.logs,before);
 }
});

test('skipped and deleted interval records do not consume the quality-run allowance',()=>{
 for(const flags of [{status:'skipped'},{status:'completed',deleted:true}]){
  const s=state('bro','endurance');s.training.frequency=1;s.training.runEvery=1;s.training.runningQuality=true;
  s.logs['2026-10-26']={id:'2026-10-26',date:'2026-10-26',exercises:[],kind:'run',run:{blocks:[{repeat:4}]},...flags};
  const before=C.clone(s.logs),result=C.generateProgram(s,{start:'2026-10-26',days:7});
  assert.equal(result.days.filter(d=>d.run?.blocks?.length).length,1);
  assert.deepEqual(s.logs,before);
 }
});
