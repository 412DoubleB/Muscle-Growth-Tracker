import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../core.mjs';
import {buildProgress} from '../progress.mjs';
import {editSession} from '../workouts.mjs';
import {TRAINING_STYLES} from '../training.mjs';

const previousDate='2027-01-04',nextDate='2027-01-11';
const assisted=C.CATALOG.find(exercise=>exercise.loadMode==='assistance'&&!exercise.needsVariantSelection);
const cable=C.exerciseFor('Cable Curl');
const checked=(w=60,r=10,extra={})=>({id:'synthetic-set',role:'working',w,r,rir:2,done:true,...extra});
function fixture({definition=assisted,units='lb',count=1,sets=[checked()]}={}){
 const state=C.defaultState();state.profile.units=units;state.gymSchedules=[];
 const gym=state.gyms[0];gym.increment=5;gym.incrementKg=2.5;
 const exercise=C.makeExercise(definition,{count,range:'8-10'});
 state.logs[previousDate]={id:previousDate,date:previousDate,title:'Synthetic workout',kind:'strength',gymId:gym.id,status:'completed',updatedAt:'2027-01-04T18:00:00.000Z',exercises:[{...C.clone(exercise),sets:C.clone(sets)}]};
 return {state,gym,exercise};
}
const recommend=({state,gym,exercise})=>C.progression(state,exercise,nextDate,gym);

test('missing the assisted rep range adds exactly one configured increment of assistance in lb and kg, including zero',()=>{
 for(const [units,weight,expected]of [['lb',60,65],['kg',27.5,30],['lb',0,5],['kg',0,2.5]]){
  const sample=fixture({units,sets:[checked(weight,6)]}),before=C.clone(sample),result=recommend(sample);
  assert.equal(result.weight,expected,`${units}: ${weight} assistance must become easier after missing reps`);
  assert.deepEqual(result.rows,[{w:expected,r:8,role:'working'}]);
  assert.match(result.reason,/more.*assistance/i);assert.equal(result.reps,8);
  assert.deepEqual(sample,before,'recommendations must not change current inputs or prior sets');
 }
});

test('earned assisted progress still reduces assistance by its configured increment and stops at zero',()=>{
 for(const [units,weight,expected]of [['lb',60,55],['kg',27.5,25],['lb',0,0],['kg',0,0]]){
  const sample=fixture({units,sets:[checked(weight)]}),before=C.clone(sample),result=recommend(sample);
  assert.equal(result.weight,expected);assert.match(result.reason,/reduce assistance/i);
  assert.equal(result.rows[0].w,expected);assert.deepEqual(sample,before);
 }
});

test('ordinary loads retain their existing earned increases and five-percent rounded deloads',()=>{
 for(const [units,weight,reps,expected]of [['lb',60,10,65],['lb',60,6,55],['kg',30,10,32.5],['kg',30,6,27.5]]){
  const sample=fixture({definition:cable,units,sets:[checked(weight,reps)]}),before=C.clone(sample);
  assert.equal(recommend(sample).weight,expected);assert.deepEqual(sample,before);
 }
});

test('strength, hypertrophy and endurance recommendations build reps before adding load and restarting the range',()=>{
 for(const [focus,preset]of Object.entries(TRAINING_STYLES)){
  const sample=fixture({definition:cable,count:preset.sets}),[lo,hi]=C.rangeOf(preset.range);
  Object.assign(sample.state.training,{trainingStyle:focus,sets:preset.sets,range:preset.range,restSeconds:preset.rest});
  Object.assign(sample.exercise,{range:preset.range,trainingStyle:focus,targetRir:preset.rir});
  const previous=sample.state.logs[previousDate].exercises[0];
  for(const [reps,rir,expectedWeight,expectedReps]of [[lo,preset.rir,60,lo+1],[hi-1,preset.rir,60,hi],[hi,0,60,hi],[hi,'',60,hi],[hi,preset.rir,65,lo]]){
   previous.sets=Array.from({length:preset.sets},(_,index)=>checked(60,reps,{id:'style-set-'+index,rir}));
   const before=C.clone(sample),result=recommend(sample);
   assert.equal(result.weight,expectedWeight,`${focus}: ${reps} reps at ${rir} RIR`);
   assert.equal(result.reps,expectedReps,focus);assert.deepEqual(result.range,[lo,hi]);assert.deepEqual(sample,before);
  }
 }
});

test('exercise-specific increments override the gym increment in either unit system for earned and easier assisted recommendations',()=>{
 for(const [units,weight,increment]of [['lb',60,10],['kg',30,1.25]]){
  const sample=fixture({units,sets:[checked(weight,6)]});sample.exercise.increment=increment;
  const before=C.clone(sample);assert.equal(recommend(sample).weight,weight+increment);assert.deepEqual(sample,before);
  sample.state.logs[previousDate].exercises[0].sets[0].r=10;
  const earnedBefore=C.clone(sample);assert.equal(recommend(sample).weight,weight-increment);assert.deepEqual(sample,earnedBefore);
 }
});

test('missing RIR, failed effort and incomplete checked working sets still cannot earn assisted progress',()=>{
 const missingRir=checked();delete missingRir.rir;
 for(const sets of [[checked(60,10,{rir:''})],[checked(60,10,{rir:null})],[missingRir],[checked(60,10,{rir:0})],[checked(),checked(60,10,{done:false})]]){
  const sample=fixture({count:sets.length,sets}),before=C.clone(sample),result=recommend(sample);
  assert.equal(result.weight,60);assert.deepEqual(sample,before);
 }
 for(const sets of [[checked(60,10,{done:false})],[checked(60,10,{role:'warmup'})],[checked(60,10,{role:'backoff'})],[checked(60,10,{role:'drop'})],[checked(60,10,{role:'ramp'})]]){
  const sample=fixture({sets}),before=C.clone(sample),result=recommend(sample);
  assert.equal(result.weight,null);assert.equal(result.previous,null);assert.deepEqual(sample,before);
 }
});

test('preserved edit, restore, legacy and conflict copies cannot supersede canonical recommendation history',()=>{
 for(const suffix of ['~edit-preserved','~restore-preserved','~legacy-synthetic','~conflict-preserved']){
  const sample=fixture({definition:cable,sets:[checked(40)]}),archive=C.clone(sample.state.logs[previousDate]);
  archive.id=previousDate+suffix;archive.updatedAt='2027-01-09T18:00:00.000Z';archive.exercises[0].sets[0].w=100;
  archive.unknownEvidence={retain:['complete','prior','record'],zero:0};sample.state.logs[archive.id]=archive;
  const before=C.clone(sample),result=recommend(sample),progress=buildProgress(sample.state,C.CATALOG,{exercise:cable.id,gym:sample.gym.id,period:'all',metric:'weight'},nextDate);
  assert.equal(result.weight,45,suffix);assert.equal(result.previous.sets[0].w,40,suffix);
  assert.equal(progress.latest.value,40);assert.deepEqual(sample,before,'all preserved copies must remain exact');
 }
});

test('a newer archived date cannot displace older active history, and archive-only history remains first exposure',()=>{
 const sample=fixture({definition:cable,sets:[checked(40)]}),archive=C.clone(sample.state.logs[previousDate]);
 archive.date='2027-01-08';archive.id=archive.date+'~edit-only';archive.exercises[0].sets[0].w=100;
 sample.state.logs[archive.id]=archive;let before=C.clone(sample);
 assert.equal(recommend(sample).weight,45);assert.deepEqual(sample,before);
 delete sample.state.logs[previousDate];before=C.clone(sample);
 const result=recommend(sample);assert.equal(result.weight,null);assert.equal(result.previous,null);
 assert.equal(C.lastHistory(sample.state,sample.exercise,nextDate,sample.gym.id),undefined);
 assert.equal(result.rows[0].w,null);assert.match(result.reason,/first working load/i);assert.deepEqual(sample,before);
});

test('an actual session replacement preserves its entered archive without reusing it as active history',()=>{
 const sample=fixture({definition:cable,sets:[checked(40)]});
 sample.state.logs[previousDate].status='in-progress';
 const edited=editSession(sample.state,previousDate,{choice:'legacy:0',date:previousDate,gymId:sample.gym.id});
 const archived=Object.entries(edited.state.logs).find(([key])=>key.startsWith(previousDate+'~edit-'));
 assert.ok(archived);assert.deepEqual(archived[1].exercises,sample.state.logs[previousDate].exercises);
 const before=C.clone(edited.state),result=C.progression(edited.state,sample.exercise,nextDate,sample.gym);
 assert.equal(result.weight,null);assert.equal(result.previous,null);assert.deepEqual(edited.state,before);
});

test('active imported legacy aliases remain recommendation history after canonical selection',()=>{
 const state=C.defaultState(),raw={profile:{units:'lb'},gyms:[],logs:{'0-0':{actualDate:previousDate,gym:state.gyms[0].name,ex:[{name:'Flat DB press',range:'8-10',sets:[{w:40,r:10,i:2}]}]}}};
 const imported=C.importSnapshot(state,raw).state,exercise=C.makeExercise(C.exerciseFor('Flat DB press'),{count:1,range:'8-10'}),before=C.clone(imported),original=C.clone(raw);
 assert.equal(imported.logs[previousDate].legacyKey,'0-0');
 assert.equal(C.progression(imported,exercise,nextDate,imported.gyms[0]).weight,45);
 assert.deepEqual(imported,before);assert.deepEqual(raw,original);
});

test('canonical selection preserves straight versus superset histories and machine gym boundaries',()=>{
 const sample=fixture({definition:cable,sets:[checked(40)]}),paired=C.clone(sample.state.logs[previousDate]),otherGym=C.clone(paired);
 paired.id=paired.date='2027-01-06';paired.exercises[0].supersetId='saved-pair';paired.exercises[0].sets[0].w=60;
 otherGym.id=otherGym.date='2027-01-07';otherGym.gymId=sample.state.gyms[1].id;otherGym.exercises[0].sets[0].w=100;
 sample.state.logs[paired.date]=paired;sample.state.logs[otherGym.date]=otherGym;const before=C.clone(sample);
 assert.equal(recommend(sample).weight,45);
 const pairedExercise={...sample.exercise,progressionContext:'superset'};
 assert.equal(C.progression(sample.state,pairedExercise,nextDate,sample.gym).weight,65);
 assert.equal(C.progression(sample.state,sample.exercise,nextDate,sample.state.gyms[1]).weight,105);
 assert.deepEqual(sample,before);
});

test('deleted, skipped, same-day and future active records stay outside prior recommendations',()=>{
 const sample=fixture({definition:cable,sets:[checked(40)]});
 for(const [date,flags]of [['2027-01-06',{deleted:true}],['2027-01-07',{status:'skipped'}],[nextDate,{}],['2027-01-12',{}]]){
  const copy=C.clone(sample.state.logs[previousDate]);Object.assign(copy,{id:date,date,...flags});copy.exercises[0].sets[0].w=100;sample.state.logs[date]=copy;
 }
 const before=C.clone(sample);assert.equal(recommend(sample).weight,45);assert.deepEqual(sample,before);
});

test('mixed assistance sets use the lowest completed counterweight while ordinary loads use the highest',()=>{
 const assistedSample=fixture({sets:[checked(60),checked(40,8)]}),assistedBefore=C.clone(assistedSample),assistedResult=recommend(assistedSample);
 assert.equal(assistedResult.weight,40);assert.equal(assistedResult.reps,9);assert.deepEqual(assistedSample,assistedBefore);
 const earned=fixture({sets:[checked(60),checked(40)]});assert.equal(recommend(earned).weight,35);
 const ordinary=fixture({definition:cable,sets:[checked(60),checked(40,8)]}),ordinaryBefore=C.clone(ordinary);
 assert.equal(recommend(ordinary).weight,65);assert.deepEqual(ordinary,ordinaryBefore);
});

test('increments must be positive finite values, with the matching gym unit then existing unit defaults as fallbacks',()=>{
 for(const units of ['lb','kg'])for(const invalid of [-5,Infinity,-Infinity,NaN,'invalid',0,null,undefined,'']){
  const sample=fixture({definition:cable,units});sample.exercise.increment=invalid;
  sample.gym.increment=7.5;sample.gym.incrementKg=1;
  const before=C.clone(sample);assert.equal(recommend(sample).weight,60+(units==='kg'?1:7.5),`${units}: invalid exercise increment ${invalid}`);assert.deepEqual(sample,before);
  sample.gym[units==='kg'?'incrementKg':'increment']=invalid;const fallbackBefore=C.clone(sample);
  assert.equal(recommend(sample).weight,60+(units==='kg'?2.5:5),`${units}: invalid gym increment ${invalid}`);assert.deepEqual(sample,fallbackBefore);
 }
 const kilograms=fixture({definition:cable,units:'kg'});kilograms.gym.increment=10;delete kilograms.gym.incrementKg;
 assert.equal(recommend(kilograms).weight,62.5,'a pounds increment is not silently converted or reused for kilograms');
 const numericString=fixture({definition:cable});numericString.exercise.increment='2.5';assert.equal(recommend(numericString).weight,62.5);
});

test('missing and nonfinite loads or reps cannot become completed recommendation sets; explicit zero load stays usable',()=>{
 const invalid=[{w:null},{w:undefined},{w:NaN},{w:Infinity},{w:-Infinity},{w:''},{w:'   '},{r:null},{r:undefined},{r:NaN},{r:Infinity},{r:-Infinity},{r:''},{r:'   '}];
 for(const change of invalid){
  const sample=fixture({definition:cable,sets:[{...checked(),...change}]}),before=C.clone(sample),previous=sample.state.logs[previousDate].exercises[0];
  assert.equal(C.completedSets(previous).length,0,JSON.stringify(change));
  assert.equal(recommend(sample).weight,null);assert.equal(recommend(sample).previous,null);assert.deepEqual(sample,before);
 }
 const omitted=fixture({definition:cable});delete omitted.state.logs[previousDate].exercises[0].sets[0].w;assert.equal(recommend(omitted).weight,null);
 const zero=fixture({definition:cable,sets:[checked(0)]}),before=C.clone(zero);
 assert.equal(C.completedSets(zero.state.logs[previousDate].exercises[0]).length,1);assert.equal(recommend(zero).weight,5);assert.deepEqual(zero,before);
});

test('only finite RIR from zero through ten is usable effort and at least one RIR is required to earn load',()=>{
 for(const rir of [Infinity,'Infinity',NaN,-1,11,'invalid',null,undefined,'',true]){
  const sample=fixture({definition:cable,sets:[checked(60,10,{rir})]}),before=C.clone(sample);
  assert.equal(recommend(sample).weight,60,`RIR ${rir} must not earn load`);assert.deepEqual(sample,before);
 }
 for(const rir of [1,2,10,'2'])assert.equal(recommend(fixture({definition:cable,sets:[checked(60,10,{rir})]})).weight,65);
});

test('audited machine, cable and assistance history stays within its gym even under a saved custom display name',()=>{
 for(const name of ['Hammer Strength Incline Press','Pec Deck Fly','Lying Leg Curl','Leg Extension','Standing Calf Raise','Assisted Dip','Cable Curl']){
  const sample=fixture({definition:C.exerciseFor(name)});sample.state.logs[previousDate].exercises[0].name='My saved workout exercise';
  const before=C.clone(sample),otherGym=sample.state.gyms[1];
  assert.equal(C.progression(sample.state,sample.exercise,nextDate,otherGym).weight,null,name);
  assert.ok(recommend(sample).previous,name);assert.deepEqual(sample,before);
 }
});

test('audited portable freeweight requirements may share history across gyms',()=>{
 for(const name of ['Dumbbell Bench Press','Barbell Bench Press','EZ-Bar Preacher Curl']){
  const sample=fixture({definition:C.exerciseFor(name)}),before=C.clone(sample);
  assert.equal(C.progression(sample.state,sample.exercise,nextDate,sample.state.gyms[1]).weight,name==='Dumbbell Bench Press'?65:60,name);
  assert.deepEqual(sample,before);
 }
});

test('custom requirement metadata is conservative while legacy entries without requirements retain the name fallback',()=>{
 for(const [name,loadMode,equipmentRequirements,expected]of [
  ['Custom press','total',[['Selectorized Chest Press']],null],
  ['Custom dumbbell lift','perHand',[['Dumbbells']],65],
  ['Custom mixed setup','total',[['Dumbbells','Selectorized Chest Press']],null],
  ['Custom equipment','total',[['Unreviewed station']],null],
  ['Custom cable hold','total',undefined,null],
  ['Custom freeweight lift','total',undefined,65],
  ['Custom assistance','assistance',undefined,null]
 ]){
  const definition={id:'custom-'+C.norm(name),name,loadMode,...(equipmentRequirements?{equipmentRequirements}:{})};
  const sample=fixture({definition});sample.state.customExercises.push(definition);const before=C.clone(sample);
  assert.equal(C.progression(sample.state,sample.exercise,nextDate,sample.state.gyms[1]).weight,expected,name);
  assert.deepEqual(sample,before);
 }
});

test('advanced assistance rows need manual loads while working and top rows retain usable recommendations',()=>{
 const sample=fixture({sets:[checked(60,8)]});
 sample.exercise.sets=['warmup','ramp','working','top','backoff','drop'].map((role,index)=>({...checked('',8,{done:false,role}),id:'advanced-'+index}));
 sample.exercise.sets[0].w=80;sample.exercise.sets[2].w=60;
 const before=C.clone(sample),result=recommend(sample);
 assert.deepEqual(result.rows.map(row=>row.w),[null,null,60,60,null,null]);
 assert.match(result.reason,/assistance manually/i);assert.match(result.reason,/more assistance is easier/i);
 assert.deepEqual(sample,before,'entered assistance, including advanced roles, stays intact');
 const noHistory=C.clone(sample);noHistory.state.logs={};noHistory.exercise.sets[2].w='';
 assert.deepEqual(recommend(noHistory).rows.map(row=>row.w),[null,null,null,null,null,null]);
});
