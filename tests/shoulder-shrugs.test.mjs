import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import * as C from '../core.mjs';
import {buildPersonalizedProgram} from '../personalized-plan.mjs';
import {resolveLoadSetup} from '../equipment-loads.mjs';

const start='2027-01-04';
const shrugIds=['dumbbell-shrug','barbell-shrug'];
const isShrug=exercise=>shrugIds.includes(exercise.exerciseId||exercise.id);
const shoulders=days=>days.filter(day=>day.kind==='strength'&&/^Shoulders(?:\b|\s)/.test(day.title));
const meta=exercise=>C.exerciseFor(exercise.exerciseId||exercise.id);
function workspace(split='split',inventory=C.EQUIPMENT){
 const state=C.defaultState();
 state.gymSchedules=[];
 state.gyms=[{id:'synthetic-shrug-gym',name:'Synthetic shrug test gym',inventory:inventory.slice(),increment:5,incrementKg:2.5,dbMax:120}];
 Object.assign(state.training,{mode:'automatic',startDate:start,frequency:7,restWeekdays:[],split,defaultGym:state.gyms[0].id,sets:3,range:'10-15',runEvery:0,saunaMinutes:0,minRepeatDays:0,supersetMode:'off'});
 return state;
}
const generate=state=>C.generateProgram(state,{start,days:28}).days;
function assertShoulderCoverage(day,expected,{shrug=true}={}){
 assert.equal(day.exercises.length,expected,day.title);
 assert.equal(day.plannedExerciseCount,expected,day.title);
 assert.equal(day.exercises.filter(isShrug).length,shrug?1:0,day.title);
 const definitions=day.exercises.map(meta);
 for(const group of ['anterior','lateral','rear'])assert.ok(definitions.some(exercise=>exercise.group==='Shoulders'&&exercise.subgroup===group),`${day.title}: ${group} deltoid work remains`);
 if(day.title==='Shoulders + Abs')assert.equal(definitions.filter(exercise=>exercise.group==='Core').length,2,'Both core slots remain');
 assert.equal(new Set(day.exercises.map(exercise=>exercise.exerciseId)).size,day.exercises.length,'No duplicate exercises');
}

test('shrugs add independent library entries while preserving every field of all 240 existing exercises',()=>{
 const previous=C.CATALOG.filter(exercise=>exercise.newFamily!=='shrugs');
 assert.equal(previous.length,240);
 assert.equal(createHash('sha256').update(JSON.stringify(previous)).digest('hex'),'11e0717e9a5ef0c3a0ce66572f347e33159b3a1ac5516216b77455fac41aa2be');
 for(const [id,name,mode] of [['dumbbell-shrug','Dumbbell Shrug','perHand'],['barbell-shrug','Barbell Shrug','total']]){
  const exercise=C.exerciseFor(id);
  assert.ok(exercise,id);assert.equal(exercise.name,name);assert.equal(C.exerciseFor(name).id,id);
  assert.equal(exercise.newFamily,'shrugs');assert.equal(exercise.group,'Shoulders');assert.equal(exercise.subgroup,'upper-traps');
  assert.match(exercise.primary,/trapezius/i);assert.equal(exercise.compound,false);assert.equal(exercise.loadMode,mode);assert.equal(exercise.purpose,'strength');
  assert.equal(exercise.independentGuide,true);assert.equal(exercise.mediaNeedsVariantReview,true);
  const guide=C.guideFor(exercise);assert.deepEqual(guide.cues,exercise.cues);assert.ok(guide.setup.length>=2&&guide.cues.length>=2&&guide.mistakes.length>=2);
  for(const key of ['mediaId','image','imageId','startImage','finishImage'])assert.equal(Object.hasOwn(exercise,key),false,'Do not borrow another exercise photo');
 }
});

test('dumbbell and barbell shrugs require their actual equipment and retain different logged-load bases',()=>{
 const db=C.exerciseFor('dumbbell-shrug'),bar=C.exerciseFor('barbell-shrug');
 assert.ok(db&&bar);
 assert.equal(C.supports(db,{inventory:['Dumbbells']}),true);
 assert.equal(C.supports(db,{inventory:['Barbell','Olympic Plates']}),false);
 assert.equal(C.supports(bar,{inventory:['Barbell','Olympic Plates']}),true);
 for(const inventory of [[],['Barbell'],['Olympic Plates'],['Dumbbells']])assert.equal(C.supports(bar,{inventory}),false,inventory.join(', '));
 const state=workspace(),dbSetup=resolveLoadSetup(state,C.makeExercise(db),state.gyms[0],db),barSetup=resolveLoadSetup(state,C.makeExercise(bar),state.gyms[0],bar);
 assert.equal(dbSetup.kind,'free');assert.equal(dbSetup.perHand,true);
 assert.equal(barSetup.kind,'plates');assert.equal(barSetup.perHand,false);assert.equal(barSetup.sides,2);assert.deepEqual(barSetup.plates,[10,25,35,45]);
});

test('dedicated shoulder days include exactly one late shrug without losing deltoid/core coverage or increasing session size',()=>{
 for(const [split,count] of [['bro',6],['split',8]]){
  const state=workspace(split),before=C.clone(state),days=generate(state),target=shoulders(days);
  assert.ok(target.length>2,split);
  for(const day of target){assertShoulderCoverage(day,count);assert.ok(day.exercises.findIndex(isShrug)>=4,'Shrug follows the priority deltoid exercises');}
  assert.ok(days.filter(day=>!/^Shoulders\b/.test(day.title)).every(day=>!day.exercises.some(isShrug)),'Other muscle-group days retain their slots');
  assert.deepEqual(state,before);
 }
});

test('full body, upper/lower, seven-group and PPL programs retain their deltoid slots rather than substituting shrugs',()=>{
 for(const split of ['full','upper-lower','seven','ppl']){
  const days=generate(workspace(split));assert.ok(days.some(day=>day.exercises.length));
  assert.ok(days.every(day=>!day.exercises.some(isShrug)),split);
 }
});

test('shoulder-day selection uses the available shrug variant and falls back when equipment or exclusions leave none',()=>{
 const without=(...equipment)=>C.EQUIPMENT.filter(value=>!equipment.includes(value));
 for(const [inventory,expected] of [[without('Barbell','Olympic Plates'),'dumbbell-shrug'],[without('Dumbbells'),'barbell-shrug']]){
  const state=workspace('split',inventory),target=shoulders(generate(state));assert.ok(target.length);
  for(const day of target){assertShoulderCoverage(day,8);assert.equal(day.exercises.find(isShrug).exerciseId,expected);assert.ok(day.exercises.every(exercise=>C.supports(meta(exercise),state.gyms[0])));}
 }
 for(const split of ['bro','split'])for(const unavailable of ['equipment','avoided']){
  const state=workspace(split,unavailable==='equipment'?without('Dumbbells','Barbell','Olympic Plates'):C.EQUIPMENT);
  if(unavailable==='avoided')state.avoided=shrugIds.slice();
  const before=C.clone(state),target=shoulders(generate(state));assert.ok(target.length);
  for(const day of target)assertShoulderCoverage(day,split==='bro'?6:8,{shrug:false});
  assert.deepEqual(state,before);
 }
});

test('smart plans respect chosen support level and allow the same experienced shrug choices regardless of adult age',()=>{
 const state=workspace(),options={start,days:14,age:25,experience:'Advanced',approach:'build',goal:'muscle',frequency:7,restWeekdays:[],split:'split',movementLevel:'standard',floorWork:'allow',equipmentPreference:'any',defaultGym:state.gyms[0].id,minRepeatDays:0,runEvery:0,supersetMode:'off',sets:3,range:'10-15'};
 const younger=buildPersonalizedProgram(state,options),older=buildPersonalizedProgram(state,{...options,age:80});
 assert.equal(younger.invalid,false);assert.equal(older.invalid,false);
 for(const day of shoulders(younger.days))assertShoulderCoverage(day,8);
 assert.deepEqual(younger.days.map(day=>day.exercises.map(exercise=>exercise.exerciseId)),older.days.map(day=>day.exercises.map(exercise=>exercise.exerciseId)));
 const supported=buildPersonalizedProgram(state,{...options,age:80,experience:'Returning',movementLevel:'supported',floorWork:'avoid',sets:2});
 assert.equal(supported.invalid,false);assert.ok(shoulders(supported.days).length);
 for(const day of shoulders(supported.days))assertShoulderCoverage(day,8,{shrug:false});
});

test('shrugs use existing adaptive progression with per-hand dumbbells and matching plate changes, without changing entered sets',()=>{
 for(const [id,weight,expected] of [['dumbbell-shrug',50,55],['barbell-shrug',200,220]]){
  const state=workspace(),gym=state.gyms[0],exercise=C.makeExercise(C.exerciseFor(id),{count:3,range:'10-15'});
  Object.assign(exercise.sets[0],{w:weight,r:18,rir:4,done:true});
  const before=C.clone({state,exercise}),result=C.nextSetRecommendation(state,exercise,gym);
  assert.ok(result);assert.equal(result.change,'increase');assert.equal(result.weight,expected);assert.equal(result.reps,15);assert.equal(result.sourceIndex,0);assert.equal(result.targetIndex,1);
  assert.deepEqual({state,exercise},before);
  if(id==='barbell-shrug'){assert.equal(result.setup.sides,2);assert.equal(result.weight-weight,20,'One10lb plate per side adds20lb total');}
  else{gym.dbMax=weight;assert.equal(C.nextSetRecommendation(state,exercise,gym).weight,weight,'Do not exceed the confirmed dumbbell limit');}
 }
});

test('completed shrug history informs a later exposure without merging dumbbell and barbell logs',()=>{
 const state=workspace(),gym=state.gyms[0],db=C.makeExercise(C.exerciseFor('dumbbell-shrug'),{count:3,range:'10-15'});
 for(const set of db.sets)Object.assign(set,{w:50,r:15,rir:2,done:true});
 state.logs[start]={id:start,date:start,gymId:gym.id,kind:'strength',status:'completed',exercises:[db],updatedAt:C.now()};
 const before=C.clone(state),future=C.addDays(start,7),nextDb=C.makeExercise(C.exerciseFor('dumbbell-shrug'),{count:3,range:'10-15'}),bar=C.makeExercise(C.exerciseFor('barbell-shrug'),{count:3,range:'10-15'});
 assert.equal(C.progression(state,nextDb,future,gym).weight,55);
 assert.equal(C.progression(state,bar,future,gym).weight,null);
 assert.deepEqual(state,before);
});

test('legacy continuation gains a single shrug while the original28days, saved plans, custom routines and partial entries stay intact',()=>{
 const state=workspace();state.training.mode='original';
 const original=C.originalDay(state,'2026-10-06');assert.match(original.title,/Shoulders/);assert.equal(original.exercises.some(isShrug),false);
 const future=Array.from({length:56},(_,index)=>C.dayFor(state,C.addDays('2026-10-29',index))),target=shoulders(future);assert.ok(target.length>4);
 for(const day of target){assert.equal(day.exercises.filter(isShrug).length,1);assert.equal(day.exercises.length,C.originalDay(state,day.date).exercises.length);}
 const automatic=workspace(),enteredDate=C.addDays(start,3),entered=C.ensureLog(automatic,enteredDate);
 entered.exercises[0].sets[0].w=45;entered.unknown={keep:'partial entry'};
 automatic.plan[C.addDays(start,4)]={id:C.addDays(start,4),date:C.addDays(start,4),kind:'strength',title:'My saved shoulder workout',gymId:automatic.gyms[0].id,exercises:[C.makeExercise(C.exerciseFor('Dumbbell Lateral Raise'))],unknown:{keep:'saved plan'}};
 automatic.routines=[{id:'custom-shoulders',name:'My shoulder routine',exercises:[C.makeExercise(C.exerciseFor('Dumbbell Lateral Raise'))],unknown:{keep:'routine'}}];
 const before=C.clone(automatic),result=C.generateProgram(automatic,{start,days:14});
 assert.equal(result.days.some(day=>day.date===enteredDate),false);assert.deepEqual(C.dayFor(automatic,enteredDate),entered);assert.deepEqual(automatic,before);
 const saved=C.dayFor(automatic,C.addDays(start,4));assert.equal(saved.title,'My saved shoulder workout');assert.equal(saved.exercises.some(isShrug),false);
 const custom=C.clone(automatic);custom.training.mode='custom';custom.training.routineOrder=['custom-shoulders'];
 const customBefore=C.clone(custom),customFuture=C.dayFor(custom,C.addDays(start,60));assert.equal(customFuture.title,'My shoulder routine');assert.equal(customFuture.exercises.some(isShrug),false);assert.deepEqual(custom,customBefore);
});
