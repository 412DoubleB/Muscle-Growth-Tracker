import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../core.mjs';
import * as S from '../supersets.mjs';
import {LEGACY_PLAN} from '../legacy.mjs';
import {splitSession} from '../training.mjs';
import {workoutFromChoice} from '../workouts.mjs';

function state(split='split',format='off'){
 const s=C.defaultState();s.gymSchedules=[];s.training={...s.training,mode:'automatic',split,startDate:'2026-10-19',supersetMode:format};return s;
}
const meta=e=>C.exerciseFor(e.exerciseId);
function pairDay(){const s=state();return {date:'2026-10-19',gymId:'crunch',kind:'strength',exercises:[C.makeExercise(C.exerciseFor('Dumbbell Bench Press'),{range:'8-10'}),C.makeExercise(C.exerciseFor('Hammer Curl'),{range:'8-10'})]}}
function finish(e,w,r){for(const set of e.sets)Object.assign(set,{w,r,rir:2,done:true})}

test('paired sessions retain nine/eight/eight/eight exercises and all generated split defaults fit six to nine',()=>{
 for(const split of ['full','upper-lower','ppl','bro','split','seven']){
  const s=state(split),lifts=C.generateProgram(s,{days:84}).days.filter(d=>d.kind==='strength');
  for(let i=0;i<lifts.length;i++){const day=lifts[i];assert.equal(day.exercises.length,splitSession(split,i)[1].length,day.title);assert.ok(day.exercises.length>=6&&day.exercises.length<=9);assert.equal(new Set(day.exercises.map(e=>e.exerciseId)).size,day.exercises.length)}
  if(split==='split')assert.deepEqual(lifts.slice(0,4).map(d=>d.exercises.length),[9,8,8,8]);
 }
});
test('original v6 workouts keep every original exercise and their exact six-to-nine counts',()=>{
 const s=C.defaultState();LEGACY_PLAN.forEach((p,i)=>{const day=C.originalDay(s,C.addDays('2026-10-01',i));assert.equal(day.exercises.length,p[2]?p[2].split(';').length:0)});
});
test('every built-in split reaches six to nine exercises at Crunch and the fire station',()=>{
 for(const split of ['full','upper-lower','ppl','bro','split','seven','legacy']){
  const s=state(split);s.gymSchedules=C.defaultState().gymSchedules;const days=C.generateProgram(s,{days:84}).days.filter(d=>d.kind==='strength');assert.ok(days.some(d=>d.gymId==='station'));
  for(const day of days){assert.ok(day.exercises.length>=6&&day.exercises.length<=9,day.date+' '+day.title+' at '+day.gymId);assert.ok(!day.needsEquipmentReview)}
 }
 for(const name of ['Standing Dumbbell Calf Raise','Seated Dumbbell Calf Raise']){const e=C.exerciseFor(name);assert.ok(C.supports(e,C.defaultState().gyms[1]));assert.equal(e.loadMode,'perHand');assert.ok(!C.guideFor(e).setup.some(s=>/machine|platform/i.test(s)))}
});
test('equipment shortfalls identify both the actual and intended exercise count',()=>{
 const s=state('split','supersets');s.gyms[0].inventory=['Dumbbells'];const day=C.generateProgram(s,{days:1}).days[0];assert.ok(day.exercises.length<9);assert.equal(day.plannedExerciseCount,9);assert.ok(day.notes.some(n=>n.includes('of 9 planned exercises')));if(day.exercises.length<6)assert.equal(day.needsEquipmentReview,true);
});
test('repair updates only old untouched future generated plan rows, and is idempotent',()=>{
 const s=state(),days=C.generateProgram(s,{days:28}).days.filter(d=>d.kind==='strength');
 for(const day of days.slice(0,5)){const old=C.clone(day);old.generatorVersion='8.0.0-beta.6';old.exercises=old.exercises.slice(0,3);s.plan[old.date]=C.packPlanDay(old)}
 const enteredDate=days[1].date;s.logs[enteredDate]=C.clone(days[1]);s.logs[enteredDate].exercises[0].sets[0].rir=0;
 const customDate=days[2].date;s.plan[customDate].customNote='My intentional session';
 const pastDate=days[0].date,before=C.clone(s);
 assert.equal(C.restoreGeneratedSessionSizes(s,{from:C.addDays(pastDate,1)}),2);
 assert.deepEqual(s.logs,before.logs);assert.deepEqual(s.plan[pastDate],before.plan[pastDate]);assert.deepEqual(s.plan[enteredDate],before.plan[enteredDate]);assert.deepEqual(s.plan[customDate],before.plan[customDate]);
 for(const day of days.slice(3,5))assert.equal(C.expandPlanDay(s.plan[day.date]).exercises.length,day.exercises.length);
 assert.equal(C.restoreGeneratedSessionSizes(s,{from:C.addDays(pastDate,1)}),0);assert.deepEqual(s.training,before.training);
});
test('restoring a saved short session only appends exercises and preserves every entered set and original workout',()=>{
 const s=state(),day=C.generateProgram(s,{days:1}).days[0];day.generatorVersion='8.0.0-beta.6';day.exercises=[...day.exercises.slice(0,2),...day.exercises.slice(5,7)];day.exercises[0].sets[0]={...day.exercises[0].sets[0],w:50,r:9,rir:2,done:true};s.logs[day.date]=day;
 const before=C.clone(s);assert.equal(C.shortSessionTarget(day,s.training),9);const restored=C.restoreSessionExercises(s,day.date);assert.equal(restored.exercises.length,9);assert.deepEqual(restored.exercises.slice(0,4),day.exercises);assert.deepEqual(s,before);assert.equal(restored.run?.minutes,day.run?.minutes);
 assert.equal(C.shortSessionTarget(C.originalDay(s,'2026-10-01'),s.training),0);day.status='completed';assert.throws(()=>C.restoreSessionExercises(s,day.date),/Unlock/);
});
test('automatic supersets are optional and retain exercise order, count, sets and independent identities',()=>{
 const s=state('seven'),plain=C.generateProgram(s,{days:28}).days;s.training.supersetMode='supersets';const paired=C.generateProgram(s,{days:28}).days;
 assert.ok(paired.some(d=>S.supersetGroups(d).length));
 for(let i=0;i<plain.length;i++){
  assert.equal(S.supersetGroups(plain[i]).length,0);assert.deepEqual(paired[i].exercises.map(e=>e.exerciseId),plain[i].exercises.map(e=>e.exerciseId));assert.deepEqual(paired[i].exercises.map(e=>e.sets.map(s=>s.role)),plain[i].exercises.map(e=>e.sets.map(s=>s.role)));
  for(const group of S.supersetGroups(paired[i])){assert.equal(group.members.length,2);assert.equal(group.restSeconds,120);assert.ok(!group.members.some(m=>S.demandingStraightLift(m.exercise,meta)))}
 }
});
test('manual pairs respect the chosen first/second order and invalid changes are atomic',()=>{
 const day=pairDay(),before=C.clone(day),paired=S.pairExercises(day,1,0,180),group=S.supersetGroups(paired)[0];assert.deepEqual(day,before);assert.deepEqual(group.members.map(m=>m.index),[1,0]);assert.equal(group.restSeconds,180);
 for(const args of [[0,0,120],[-1,1,120],[0,1,0],[0,1,301]])assert.throws(()=>S.pairExercises(day,...args));
 const started=C.clone(paired);started.exercises[0].sets[0].w=0;assert.throws(()=>S.removeSuperset(started,group.id),/entered sets/);assert.throws(()=>S.pairExercises(started,0,1),/entered sets/);assert.equal(started.exercises[0].sets[0].w,0);
 started.status='completed';assert.throws(()=>S.autoSupersets(started,meta),/Unlock/);
 const shifted=S.pairExercises({...pairDay(),exercises:[...pairDay().exercises,...pairDay().exercises]},2,3);shifted.exercises.splice(0,2);shifted.exercises.push(...pairDay().exercises);const secondPair=S.pairExercises(shifted,2,3);assert.equal(S.supersetGroups(secondPair).length,2,'pair IDs stay unique when removing earlier exercises shifts their indices');
});
test('superset overload treats each exercise independently and uses superset history separately from straight sets',()=>{
 const s=state(),plain=pairDay();finish(plain.exercises[0],75,10);s.logs[plain.date]=plain;
 const paired=S.pairExercises(pairDay(),0,1,120);const first=C.progression(s,paired.exercises[0],'2026-10-26',s.gyms[0]);assert.equal(first.weight,null);assert.match(first.reason,/First superset exposure/);
 paired.date='2026-10-20';finish(paired.exercises[0],50,10);finish(paired.exercises[1],15,8);s.logs[paired.date]=paired;
 assert.equal(C.progression(s,paired.exercises[0],'2026-10-26',s.gyms[0]).weight,55);assert.equal(C.progression(s,paired.exercises[1],'2026-10-26',s.gyms[0]).weight,15);assert.equal(C.progression(s,paired.exercises[1],'2026-10-26',s.gyms[0]).reps,9);
 assert.equal(C.progression(s,plain.exercises[0],'2026-10-26',s.gyms[0]).weight,80);
});
test('round completion requires both exercises, excludes preparation/drop sets and explains unmatched sets',()=>{
 const day=S.pairExercises(pairDay(),0,1,120);day.exercises[0].sets.unshift({...C.setsFor({},'straight',1)[0],role:'warmup',done:true});day.exercises[0].sets.push({...C.setsFor({},'straight',1)[0],done:true});day.exercises[1].sets.push({...C.setsFor({},'straight',1)[0],role:'drop',done:true});
 day.exercises[0].sets[1].done=true;let status=S.roundStatus(S.supersetGroups(day)[0]);assert.equal(status.completed,0);assert.equal(status.next,1);assert.deepEqual(status.extraSets,[1,0]);
 day.exercises[1].sets[0].done=true;status=S.roundStatus(S.supersetGroups(day)[0]);assert.equal(status.completed,1);assert.equal(status.next,2);
});
test('pairing survives compact plans, routine copies, backup merge and offline account storage',()=>{
 const s=state(),day=S.pairExercises(pairDay(),0,1,180);s.plan[day.date]=C.packPlanDay(day);const expanded=C.expandPlanDay(s.plan[day.date]);assert.equal(S.supersetGroups(expanded)[0].restSeconds,180);
 s.logs[day.date]=day;finish(s.logs[day.date].exercises[0],40,10);const merged=C.importSnapshot(C.defaultState(),C.clone(s)).state;assert.equal(S.supersetGroups(merged.logs[day.date]).length,1);assert.equal(merged.logs[day.date].exercises[0].sets[0].w,40);
 s.routines=[{id:'paired',name:'My superset routine',exercises:day.exercises}];const routine=workoutFromChoice(s,'routine:paired','2027-01-04','crunch');assert.equal(S.supersetGroups(routine).length,1);assert.equal(routine.exercises[0].sets[0].w,'');assert.equal(S.progressionContext(routine.exercises[0]),'superset');
 const map=new Map(),store=new C.LocalStore({getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)});store.save(s);assert.equal(S.supersetGroups(store.load().logs[day.date]).length,1);
});
test('removing a pair member clears invalid pairing but keeps entered progression context',()=>{
 const paired=S.pairExercises(pairDay(),0,1,120);paired.exercises[1].sets[0].r=8;paired.exercises.splice(0,1);const cleaned=S.cleanSupersets(paired);assert.equal(S.supersetGroups(cleaned).length,0);assert.equal(cleaned.exercises[0].supersetId,undefined);assert.equal(S.progressionContext(cleaned.exercises[0]),'superset');assert.equal(cleaned.exercises[0].sets[0].r,8);
});

test('pairing advice flags shared muscles, compounds and missing metadata without blocking custom choices',()=>{
 const make=name=>C.makeExercise(C.exerciseFor(name),{range:'8-10'});
 const day={status:'planned',exercises:['Barbell Bench Press','Dumbbell Bench Press','Hammer Curl','Romanian Deadlift'].map(make)},before=C.clone(day);
 const advice=S.pairingAdvice(day,0,1,meta);assert.equal(advice.allowed,true);assert.match(advice.notes.join(' '),/share a main muscle/);assert.match(advice.notes.join(' '),/Both are compound/);assert.ok(advice.alternatives.some(e=>e.index===2));assert.ok(!advice.alternatives.some(e=>e.index===3));
 assert.match(S.pairingAdvice(day,0,3,meta).notes.join(' '),/lower-body compound/);
 assert.equal(S.pairingAdvice(day,0,0,meta).allowed,false);
 const custom={...day,exercises:[day.exercises[0],{name:'Unknown custom',sets:[]}]};assert.match(S.pairingAdvice(custom,0,1,()=>undefined).notes.join(' '),/information is incomplete/);
 assert.deepEqual(day,before);const paired=S.pairExercises(day,0,1,60);assert.equal(S.supersetGroups(paired).length,1,'overlap caution is advisory');assert.deepEqual(day,before);
});
test('pairing choices exclude entered exercises and unentered partners of a recorded pair',()=>{
 let day={...pairDay(),exercises:[...pairDay().exercises,...pairDay().exercises,...pairDay().exercises]};day=S.pairExercises(day,2,3,60);day.exercises[3].sets[0].w=0;
 const before=C.clone(day);assert.match(S.pairingUnavailableReason(day,2),/partner contains entered sets/);assert.equal(S.pairingAdvice(day,0,2,meta).allowed,false);assert.throws(()=>S.pairExercises(day,0,2,60),/entered sets/);assert.deepEqual(day,before);
 day=S.pairExercises(day,4,5,60);const advice=S.pairingAdvice(day,0,1,()=>({group:'Chest',primary:'Pectoralis major',compound:true}));assert.ok(advice.alternatives.every(e=>![2,3,4,5].includes(e.index)));
 day.status='completed';assert.match(S.pairingUnavailableReason(day,0),/Unlock/);assert.equal(S.pairingAdvice(day,0,1,meta).allowed,false);
});
test('re-pairing is explicit, keeps every set/order/unknown field and releases only unstarted former partners',()=>{
 let day={...pairDay(),exercises:[...pairDay().exercises,...pairDay().exercises]},n=0;for(const e of day.exercises){e.ownerNote='retain-'+n++;for(const s of e.sets)s.unknown={retain:true}}
 day=S.pairExercises(S.pairExercises(day,0,1,60),2,3,60);const before=C.clone(day);assert.match(S.pairingAdvice(day,1,3,meta).notes.join(' '),/replaces their existing unstarted pairs/);assert.deepEqual(day,before);
 const after=S.pairExercises(day,1,3,60);assert.deepEqual(after.exercises.map(e=>e.sets),before.exercises.map(e=>e.sets));assert.deepEqual(after.exercises.map(e=>e.ownerNote),before.exercises.map(e=>e.ownerNote));assert.deepEqual(after.exercises.map(e=>e.exerciseId),before.exercises.map(e=>e.exerciseId));assert.equal(after.exercises[0].supersetId,undefined);assert.equal(after.exercises[2].supersetId,undefined);assert.deepEqual(S.supersetGroups(after)[0].members.map(m=>m.index),[1,3]);assert.deepEqual(day,before);
});

test('automatic matching crosses the exercise list to pair presses with curls and retains independent overload context',()=>{
 const names=['Barbell Bench Press','Dumbbell Bench Press','Hammer Curl','Incline Hammer Curl'],day={date:'2026-10-19',exercises:names.map(name=>C.makeExercise(C.exerciseFor(name)))};const before=C.clone(day),paired=S.autoSupersets(day,meta,60),groups=S.supersetGroups(paired);assert.equal(groups.length,2);
 for(const g of groups){assert.deepEqual(g.members.map(m=>meta(m.exercise).group).sort(),['Biceps','Chest']);assert.equal(g.restSeconds,60);for(const m of g.members)assert.equal(S.progressionContext(m.exercise),'superset')}
 assert.ok(groups.some(g=>g.members.some(m=>m.index===0)),'the first exercise can be paired');assert.deepEqual(paired.exercises.map(e=>e.sets),before.exercises.map(e=>e.sets));assert.deepEqual(paired.exercises.map(e=>e.exerciseId),before.exercises.map(e=>e.exerciseId));assert.deepEqual(day,before);assert.equal(S.supersetGroups(C.expandPlanDay(C.packPlanDay(paired))).length,2);
 const again=S.autoSupersets(paired,meta,60);assert.deepEqual(again,paired,'existing pairs are left intact');
});
test('single-muscle generated days receive explicit pairs rather than silently remaining entirely straight',()=>{
 for(const split of ['bro','ppl','split','seven','full','upper-lower']){const s=state(split,'supersets'),lifts=C.generateProgram(s,{days:14}).days.filter(d=>d.kind==='strength');for(const day of lifts){const eligible=day.exercises.filter(e=>!S.demandingStraightLift(e,meta));assert.equal(S.supersetGroups(day).length,Math.floor(eligible.length/2),split+' '+day.title);for(const g of S.supersetGroups(day))assert.ok(g.members.every(m=>!S.demandingStraightLift(m.exercise,meta)))}}
});
test('automatic pairing keeps recorded members and their partners intact and handles odd or unusually large sessions',()=>{
 let day={date:'2026-10-19',exercises:['Barbell Bench Press','Dumbbell Bench Press','Hammer Curl','Incline Hammer Curl','Plank'].map(name=>C.makeExercise(C.exerciseFor(name)))};day=S.pairExercises(day,0,1,60);day.exercises[0].sets[0].rir=0;const before=C.clone(day),paired=S.autoSupersets(day,meta,60);assert.deepEqual(paired.exercises.slice(0,2),before.exercises.slice(0,2));assert.equal(S.supersetGroups(paired).length,2);assert.deepEqual(day,before);
 const large={exercises:Array.from({length:35},(_,i)=>C.makeExercise(C.exerciseFor(i%2?'Hammer Curl':'Dumbbell Bench Press')))};const all=S.autoSupersets(large,meta,60);assert.equal(S.supersetGroups(all).length,17);assert.equal(all.exercises.length,35);assert.equal(new Set(S.supersetGroups(all).flatMap(g=>g.members.map(m=>m.index))).size,34);
});
test('saved routine choices and custom calendar continuation apply supersets after loading the actual routine',()=>{
 const s=state('ppl','supersets');s.routines=[{id:'new',name:'Custom presses and curls',exercises:['Barbell Bench Press','Dumbbell Bench Press','Hammer Curl','Incline Hammer Curl'].map(name=>C.makeExercise(C.exerciseFor(name)))}];s.training.mode='custom';s.training.routineOrder=['new'];const before=C.clone(s.routines);const chosen=workoutFromChoice(s,'routine:new','2027-01-04','crunch');assert.equal(S.supersetGroups(chosen).length,2);
 const day=Array.from({length:7},(_,i)=>C.dayFor(s,C.addDays('2027-01-04',i))).find(d=>d.kind==='strength');assert.ok(day);assert.equal(day.title,'Custom presses and curls');assert.equal(S.supersetGroups(day).length,2);assert.deepEqual(day.exercises.map(e=>e.exerciseId),before[0].exercises.map(e=>e.exerciseId));assert.deepEqual(s.routines,before);
});
