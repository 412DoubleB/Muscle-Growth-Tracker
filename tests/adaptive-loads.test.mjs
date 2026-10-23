import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../core.mjs';

function sample({name='Cable Curl',weight=100,reps=13,rir=3,range='8-12',unit='lb',profile={kind:'stack',step:5}}={}){
 const state=C.defaultState();state.profile.units=unit;
 const exercise=C.makeExercise(C.exerciseFor(name),{count:3,range});
 const gym={id:'synthetic',increment:5,incrementKg:2.5,dbMax:200,loadProfiles:{[exercise.exerciseId]:{[unit]:{...profile,minimum:profile.minimum||0}}}};
 Object.assign(exercise.sets[0],{w:weight,r:reps,rir,done:true,unknown:'preserve'});
 return {state,exercise,gym};
}
function next(input){const before=C.clone(input),result=C.nextSetRecommendation(input.state,input.exercise,input.gym);assert.deepEqual(input,before);return result}

test('both excess repetitions and extra RIR independently scale the next-set load and its specific rep target',()=>{
 const ordinary=next(sample()),moreReps=next(sample({reps:16})),moreRir=next(sample({rir:6}));
 assert.equal(ordinary.weight,105);assert.equal(ordinary.reps,11);
 assert.equal(moreReps.weight,110);assert.equal(moreRir.weight,110);
 assert.equal(ordinary.repSurplus,1);assert.equal(ordinary.rirSurplus,1);assert.equal(ordinary.targetRir,2);
 assert.match(ordinary.reason,/1 rep above.*1 extra RIR/);assert.match(moreReps.loadDetail,/10 lb.*2 stack steps/);
 assert.equal(next(sample({reps:12,rir:6})).change,'hold');assert.equal(next(sample({reps:16,rir:2})).change,'hold');
});

test('isolation movements have smaller bounded changes than compound presses for the same logged performance',()=>{
 const curl=next(sample({weight:200,reps:18,rir:6})),press=next(sample({name:'Machine Chest Press',weight:200,reps:18,rir:6}));
 assert.equal(curl.weight,220);assert.equal(press.weight,230);
 const extreme=next(sample({weight:200,reps:100,rir:10}));assert.equal(extreme.weight,220);
 assert.ok(extreme.reps>=8&&extreme.reps<=12);
});

test('machine-specific 5 and 10 pound stack settings determine achievable recommendations',()=>{
 assert.equal(next(sample({profile:{kind:'stack',step:5}})).weight,105);
 const ten=next(sample({profile:{kind:'stack',step:10}}));assert.equal(ten.weight,110);assert.match(ten.loadDetail,/10 lb.*1 stack step/);
});

test('matched plate changes are doubled once and explain the exact addition to each side',()=>{
 for(const [weight,plates,expectedDelta]of [[200,[10,25,35,45],20],[500,[25],50],[700,[35],70],[900,[45],90]]){
  const result=next(sample({name:'Hammer Strength Incline Press',weight,reps:16,rir:5,profile:{kind:'plates',plates,sides:2}}));
  assert.equal(result.weight,weight+expectedDelta);assert.match(result.loadDetail,/to each side/);assert.match(result.loadDetail,new RegExp(`\\+${expectedDelta} lb total`));
 }
 const two=next(sample({name:'Hammer Strength Incline Press',weight:300,reps:22,rir:6,profile:{kind:'plates',plates:[10],sides:2}}));
 assert.equal(two.weight,320);assert.match(two.loadDetail,/one 10 lb plate to each side/);
});

test('a large available plate pair is held when it would drop the predicted next set below the rep range',()=>{
 const result=next(sample({name:'Hammer Strength Incline Press',weight:100,reps:13,rir:3,profile:{kind:'plates',plates:[10],sides:2}}));
 assert.equal(result.weight,100);assert.equal(result.change,'hold');assert.match(result.reason,/increment is too large/);
});

test('landmine changes use one loading point and never double a previously logged total',()=>{
 const input=sample({name:'Landmine Press',weight:100,reps:16,rir:5,profile:{kind:'plates',plates:[10],sides:1}});
 const result=next(input);assert.equal(result.weight,110);assert.match(result.loadDetail,/one 10 lb plate at the loading point.*10 lb total/);
});

test('a larger rep and effort shortfall yields a larger back-off while respecting the minimum logged load',()=>{
 const small=next(sample({reps:7,rir:2})),large=next(sample({reps:5,rir:0}));
 assert.equal(small.weight,95);assert.equal(large.weight,85);assert.equal(large.reps,9);
 const min=next(sample({name:'Barbell Bench Press',weight:65,reps:2,rir:0,profile:{kind:'plates',plates:[10],sides:2,minimum:45}}));
 assert.equal(min.weight,45);assert.match(min.loadDetail,/20 lb less total.*10 lb less per side/);
 const empty=next(sample({name:'Barbell Bench Press',weight:45,reps:2,rir:0,profile:{kind:'plates',plates:[10],sides:2,minimum:45}}));
 assert.equal(empty.weight,45);assert.match(empty.reason,/minimum/);
});

test('assistance is scaled in the opposite direction without treating counterweight as lifted resistance',()=>{
 const usual=next(sample({name:'Assisted Dip',weight:60})),easy=next(sample({name:'Assisted Dip',weight:60,reps:18,rir:6}));
 assert.equal(usual.weight,55);assert.equal(easy.weight,50);assert.equal(easy.change,'increase');
 assert.equal(next(sample({name:'Assisted Dip',weight:5,reps:18,rir:6})).weight,0);
 assert.equal(next(sample({name:'Assisted Dip',weight:60,reps:5,rir:0})).weight,70);
});

test('kg setups use metric steps and plates independently, without fractional pound conversions',()=>{
 const metric=sample({weight:50,reps:16,rir:5,unit:'kg',profile:{kind:'stack',step:2.5}});
 metric.gym.loadProfiles[metric.exercise.exerciseId].lb={kind:'stack',step:10,minimum:0};
 assert.equal(next(metric).weight,55);
 const plate=next(sample({name:'Barbell Bench Press',weight:100,reps:16,rir:5,unit:'kg',profile:{kind:'plates',plates:[5,10,20],sides:2}}));
 assert.equal(plate.weight,110);assert.match(plate.loadDetail,/one 5 kg plate to each side.*10 kg total/);
});

test('per-hand weights honor the available dumbbell steps and never suggest a size beyond the gym maximum',()=>{
 const input=sample({name:'Incline Dumbbell Curl',weight:95,reps:16,rir:5,profile:{kind:'free',step:5}});input.gym.dbMax=100;
 const result=next(input);assert.equal(result.weight,100);assert.match(result.loadDetail,/5 lb per hand/);
 input.exercise.sets[0].w=100;assert.equal(next(input).weight,100);
 input.gym.dbMax=98;input.exercise.sets[0].w=95;assert.equal(next(input).weight,95,'a 98 lb limit does not invent a 98 lb dumbbell');
});

test('invalid, missing or fractional effort/reps cannot produce earned adaptive load',()=>{
 for(const update of [{rir:''},{rir:null},{rir:Infinity},{rir:11},{r:12.5},{r:Infinity},{w:Infinity},{done:false}]){
  const input=sample();Object.assign(input.exercise.sets[0],update);assert.equal(next(input),null);
 }
});

test('zero load cannot justify a large machine or plate jump without a positive resistance baseline',()=>{
 for(const profile of [{kind:'plates',plates:[45],sides:2},{kind:'stack',step:1000}]){
  const result=next(sample({name:'Hammer Strength Incline Press',weight:0,profile}));
  assert.equal(result.weight,0);assert.equal(result.change,'hold');
 }
 assert.equal(next(sample({weight:0,profile:{kind:'stack',step:5}})).weight,5);
});

test('imported and unit-converted off-grid loads snap to actual machine markings without changing recorded data',()=>{
 const stack=next(sample({weight:53,profile:{kind:'stack',step:10,minimum:5}}));
 assert.equal(stack.weight,55);assert.match(stack.loadDetail,/logged load was between/);
 const kg=next(sample({weight:45.36,unit:'kg',profile:{kind:'stack',step:2.5}}));assert.equal(kg.weight,47.5);
 const dumbbell=next(sample({name:'Incline Dumbbell Curl',weight:52,profile:{kind:'free',step:5}}));assert.equal(dumbbell.weight,55);
});

test('unlisted plate exchanges cannot create a smaller unapproved working-set increment',()=>{
 const result=next(sample({name:'Hammer Strength Incline Press',weight:100,reps:18,rir:6,profile:{kind:'plates',plates:[25,35],sides:2}}));
 assert.equal(result.weight,100);assert.equal(result.change,'hold');assert.match(result.reason,/next allowed plate increment/);
});

test('prior-workout and auxiliary suggestions also honor the configured absolute equipment grid',()=>{
 const input=sample({name:'Barbell Bench Press',weight:125,reps:5,profile:{kind:'plates',plates:[10],sides:2,minimum:45}});
 input.state.logs={'2027-01-01':{id:'2027-01-01',date:'2027-01-01',gymId:input.gym.id,status:'completed',exercises:[C.clone(input.exercise)]}};
 input.exercise.sets=input.exercise.sets.slice(0,1);const past=input.state.logs['2027-01-01'].exercises[0];past.sets=past.sets.slice(0,1);
 const before=C.clone(input),result=C.progression(input.state,input.exercise,'2027-01-04',input.gym);
 assert.equal((result.weight-45)%20,0);assert.deepEqual(input,before);
 input.exercise.sets=[{role:'working',w:145,r:'',rir:'',done:false},{role:'backoff',w:'',r:'',rir:'',done:false}];
 const advanced=C.progression(input.state,input.exercise,'2027-01-04',input.gym);assert.equal((advanced.rows[1].w-45)%20,0);
});

test('a new equipment setup cannot make a historical back-off heavier or earn a large jump from zero',()=>{
 for(const [weight,reps,minimum,expected]of [[0,12,0,0],[45,5,90,45]]){
  const input=sample({name:'Barbell Bench Press',weight,reps,profile:{kind:'plates',plates:[45],sides:2,minimum}});
  input.exercise.sets=input.exercise.sets.slice(0,1);
  input.state.logs={'2027-01-01':{id:'2027-01-01',date:'2027-01-01',gymId:input.gym.id,status:'completed',exercises:[C.clone(input.exercise)]}};
  const result=C.progression(input.state,input.exercise,'2027-01-04',input.gym);assert.equal(result.weight,expected);
 }
});
