import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveLoadSetup,normalizeLoadSetup,loadChangeOptions,reachableLoadOptions,recommendedLoadOptions,describeLoadChange} from '../equipment-loads.mjs';
import * as C from '../core.mjs';

function fixture(name='Machine Chest Press',unit='lb'){
 const state=C.defaultState();state.profile.units=unit;const meta=C.exerciseFor(name);assert.ok(meta,name);
 const exercise=C.makeExercise(meta),gym={id:'synthetic',increment:5,incrementKg:2.5};
 return {state,exercise,gym,meta};
}
const resolve=({state,exercise,gym,meta})=>resolveLoadSetup(state,exercise,gym,meta);

test('machine steps are saved per gym, exercise and unit without changing input records',()=>{
 const sample=fixture(),before=C.clone(sample),suggested=resolve(sample);
 assert.equal(suggested.kind,'stack');assert.equal(suggested.step,5);assert.equal(suggested.configured,false);assert.match(suggested.description,/Suggested/);assert.deepEqual(sample,before);
 sample.gym.loadProfiles={[sample.exercise.exerciseId]:{lb:{kind:'stack',step:10},kg:{kind:'stack',step:5}}};
 const savedBefore=C.clone(sample),saved=resolve(sample);assert.equal(saved.step,10);assert.equal(saved.configured,true);assert.match(saved.description,/Saved/);
 assert.deepEqual(loadChangeOptions(saved,25),[{delta:10},{delta:20}]);assert.match(describeLoadChange(saved,20),/20 lb \(2 stack steps\)/);
 assert.deepEqual(sample,savedBefore);sample.state.profile.units='kg';assert.equal(resolve(sample).step,5);
 sample.gym.loadProfiles={};assert.equal(resolve(sample).step,2.5,'lb gym increments are not converted into kg');
});

test('plate choices represent equal per-side changes and never double an existing logged total',()=>{
 const sample=fixture('Hammer Strength Incline Press');sample.exercise.sets[0].w=180;
 sample.gym.loadProfiles={[sample.exercise.exerciseId]:{lb:{kind:'plates',plates:[10,25,35,45],sides:2,minimum:0}}};
 const before=C.clone(sample),setup=resolve(sample),choices=loadChangeOptions(setup,90);
 assert.equal(setup.kind,'plates');assert.equal(setup.sides,2);
 for(const value of [20,50,70,90])assert.ok(choices.some(option=>option.delta===value),String(value));
 assert.deepEqual(choices.find(option=>option.delta===70).plates,[{weight:35,count:1}],'one plate is preferred over a multi-plate combination');
 assert.match(describeLoadChange(setup,20),/one 10 lb plate to each side: \+20 lb total \(10 lb per side\)/);
 assert.equal(sample.exercise.sets[0].w,180);assert.deepEqual(sample,before);
 assert.deepEqual(loadChangeOptions(setup,19),[],'the first available pair is not rounded upward without a budget');
});

test('multiple plates can be selected symmetrically and decreases do not claim current plates are removable',()=>{
 const setup={unit:'lb',kind:'plates',plates:[10,25],sides:2,step:5};
 const choice=loadChangeOptions(setup,70).find(option=>option.delta===70);
 assert.deepEqual(choice.plates,[{weight:25,count:1},{weight:10,count:1}]);
 assert.match(describeLoadChange(setup,70),/one 25 lb plate \+ one 10 lb plate to each side/);
 assert.match(describeLoadChange(setup,70,{decrease:true}),/Rebalance.*70 lb less total \(35 lb less per side\)/);
 assert.doesNotMatch(describeLoadChange(setup,70,{decrease:true}),/remove/i);
});

test('audited one-end and central-post plate exercises are not doubled like two-sided bars',()=>{
 for(const name of ['Landmine Press','Meadows Row','Single-Arm Landmine Row','Sled Push','Belt Squat','Seated Calf Raise']){
  const sample=fixture(name),before=C.clone(sample),setup=resolve(sample);assert.equal(setup.kind,'plates',name);assert.equal(setup.sides,1,name);assert.deepEqual(sample,before);
  setup.plates=[10];assert.equal(loadChangeOptions(setup,10)[0].delta,10,name);assert.match(describeLoadChange(setup,10),/loading point.*\+10 lb total/);
 }
 for(const name of ['Barbell Bench Press','EZ-Bar Curl','Romanian Deadlift','Smith Machine Squat','Hammer Strength Shoulder Press']){
  const setup=resolve(fixture(name));assert.equal(setup.kind,'plates',name);assert.equal(setup.sides,2,name);
 }
});

test('explicit equipment settings win while old blanket increments cannot bypass audited plate loading',()=>{
 const sample=fixture('EZ-Bar Curl');sample.exercise.increment=2.5;
 assert.equal(resolve(sample).kind,'plates');assert.deepEqual(resolve(sample).plates,[10,25,35,45]);assert.match(resolve(sample).description,/Suggested/);
 sample.exercise.increment=5;assert.equal(resolve(sample).kind,'plates');
 sample.gym.loadProfiles={[sample.exercise.exerciseId]:{lb:{kind:'plates',plates:'10, 25',sides:2,minimum:15}}};
 const setup=resolve(sample);assert.equal(setup.kind,'plates');assert.equal(setup.minimum,15);assert.equal(loadChangeOptions(setup,20)[0].delta,20);
 const machine=fixture();machine.exercise.increment=7.5;assert.equal(resolve(machine).step,7.5);assert.match(resolve(machine).description,/override/);
 const dumbbell=fixture('Dumbbell Bench Press');dumbbell.exercise.increment=2.5;assert.equal(resolve(dumbbell).step,2.5);assert.match(resolve(dumbbell).description,/override/);
 const unknown={state:sample.state,exercise:{exerciseId:'synthetic-unknown',name:'Custom station'},meta:{id:'synthetic-unknown',name:'Custom station'},gym:{loadProfiles:{'synthetic-unknown':{lb:{kind:'stack',step:10}}}}};
 assert.equal(resolve(unknown).step,10);assert.equal(resolve(unknown).configured,true);
});

test('kg plates, dumbbells and independent unit defaults retain exact usable increments',()=>{
 const setup=resolve(fixture('Barbell Bench Press','kg'));assert.equal(setup.sides,2);assert.deepEqual(setup.plates,[1.25,2.5,5,10,15,20,25]);
 assert.ok(loadChangeOptions(setup,2.5).some(option=>option.delta===2.5));assert.match(describeLoadChange(setup,2.5),/one 1.25 kg plate to each side: \+2.5 kg total/);
 const dumbbell=resolve(fixture('Dumbbell Bench Press'));assert.equal(dumbbell.kind,'free');assert.equal(dumbbell.perHand,true);assert.match(describeLoadChange(dumbbell,5),/5 lb per hand/);
});

test('optional equipment alternatives and unknown names do not prove a plate setup',()=>{
 const state={profile:{units:'lb'}},exercise={name:'Plate-loaded custom gym',sets:[]};
 const meta={name:exercise.name,equipmentRequirements:[['Olympic Plates','Selectorized Chest Press']]};
 assert.equal(resolveLoadSetup(state,exercise,{},meta).kind,'stack');
 assert.equal(resolveLoadSetup(state,exercise,{},{}).kind,'stack');
});

test('setup validation rejects invalid, nonfinite and unsupported plate data and leaves defaults independent',()=>{
 for(const bad of [null,[],{}, {kind:'unknown'}, {kind:'stack',step:0},{kind:'stack',step:Infinity},{kind:'stack',step:true},{kind:'stack',step:'.001'},{kind:'stack',minimum:-1},{kind:'plates',plates:[],sides:2},{kind:'plates',plates:[10],sides:3},{kind:'plates',plates:'10, invalid',sides:2},{kind:'plates',plates:[1001],sides:2},{kind:'plates',plates:Array(13).fill(10),sides:2}])assert.throws(()=>normalizeLoadSetup(bad));
 const raw={kind:'plates',step:'5',plates:'45, 10 25; 10',sides:'2',minimum:'45'},before=C.clone(raw),valid=normalizeLoadSetup(raw,'lb');
 assert.deepEqual(valid,{kind:'plates',step:5,plates:[10,25,45],sides:2,minimum:45});assert.deepEqual(raw,before);
 const a=normalizeLoadSetup({kind:'stack',step:5}),b=normalizeLoadSetup({kind:'stack',step:5});a.plates.push(99);assert.equal(b.plates.includes(99),false);
 const sample=fixture();sample.exercise.increment=Infinity;sample.gym.increment=-5;sample.gym.loadProfiles={[sample.exercise.exerciseId]:{lb:{kind:'plates',plates:[-10],sides:2}}};assert.equal(resolve(sample).step,5);assert.equal(resolve(sample).configured,false);
});

test('option generation is bounded, deterministic and non-mutating for fractional and large input',()=>{
 const setup={unit:'lb',kind:'plates',plates:[.25,.5,1,1.25,2.5,5,10,15,20,25,35,45],sides:2},before=C.clone(setup),options=loadChangeOptions(setup,10000);
 assert.ok(options.length<2000);assert.deepEqual(options,loadChangeOptions(setup,10000));assert.deepEqual(setup,before);
 assert.ok(options.every((option,index)=>option.delta>0&&(!index||option.delta>options[index-1].delta)&&option.plates.reduce((sum,plate)=>sum+plate.count,0)<=4));
 assert.equal(loadChangeOptions({kind:'stack',step:.01},1000000).length,4096);
 for(const bad of [NaN,Infinity,-1,0,'',null])assert.deepEqual(loadChangeOptions(setup,bad),[]);
 assert.deepEqual(loadChangeOptions({...setup,plates:[0]},10),[]);assert.deepEqual(loadChangeOptions({kind:'stack',step:0},100),[]);
});

test('absolute plate loads include the configured base and only achievable symmetric combinations',()=>{
 const setup={kind:'plates',plates:[10],sides:2,minimum:45},before=C.clone(setup);
 assert.deepEqual(reachableLoadOptions(setup,0,100),[45,65,85]);
 assert.deepEqual(reachableLoadOptions(setup,53,90),[65,85]);
 assert.deepEqual(reachableLoadOptions({...setup,plates:[10,25]},45,115),[45,65,85,95,105,115]);
 assert.deepEqual(reachableLoadOptions({...setup,sides:1},45,85),[45,55,65,75,85]);
 assert.deepEqual(setup,before);
});

test('lb plate settings allow only the owner-selected sizes, while kg sizes remain unchanged',()=>{
 assert.deepEqual(resolve(fixture('Barbell Bench Press')).plates,[10,25,35,45]);
 for(const plates of [[2.5],[5],[10,5],[15],[20],[50]])assert.throws(()=>normalizeLoadSetup({kind:'plates',plates,sides:2},'lb'),/only 10, 25, 35 or 45 lb/);
 assert.deepEqual(normalizeLoadSetup({kind:'plates',plates:'45, 10',sides:2},'lb').plates,[10,45]);
 assert.deepEqual(normalizeLoadSetup({kind:'plates',plates:[1.25,2.5,5,10,15,20,25],sides:2},'kg').plates,[1.25,2.5,5,10,15,20,25]);
});

test('imported old lb plate profiles are filtered read-only and preserve their base and sides',()=>{
 const sample=fixture('EZ-Bar Curl');sample.exercise.increment=5;
 sample.gym.loadProfiles={[sample.exercise.exerciseId]:{lb:{kind:'plates',plates:[2.5,5,10,25],sides:2,minimum:15,unknown:'retain'},kg:{kind:'plates',plates:[1.25,2.5,5],sides:2,minimum:10}}};
 const before=C.clone(sample),filtered=resolve(sample);
 assert.equal(filtered.kind,'plates');assert.deepEqual(filtered.plates,[10,25]);assert.equal(filtered.minimum,15);assert.equal(filtered.sides,2);assert.equal(filtered.configured,true);assert.deepEqual(sample,before);
 sample.gym.loadProfiles[sample.exercise.exerciseId].lb.plates='2.5, 5';sample.gym.loadProfiles[sample.exercise.exerciseId].lb.sides=1;
 const fallbackBefore=C.clone(sample),fallback=resolve(sample);
 assert.deepEqual(fallback.plates,[10,25,35,45]);assert.equal(fallback.minimum,15);assert.equal(fallback.sides,1);assert.equal(fallback.configured,false);assert.match(fallback.description,/Suggested/);assert.deepEqual(sample,fallbackBefore);
 sample.state.profile.units='kg';const kgBefore=C.clone(sample),kg=resolve(sample);assert.deepEqual(kg.plates,[1.25,2.5,5]);assert.equal(kg.minimum,10);assert.equal(kg.configured,true);assert.deepEqual(sample,kgBefore);
});

test('lb working recommendations use only a single configured plate change per side in either direction',()=>{
 const setup={unit:'lb',kind:'plates',plates:[10,25,35,45],sides:2,minimum:0},before=C.clone(setup),reference=200;
 assert.deepEqual(recommendedLoadOptions(setup,reference,200,300),[220,250,270,290]);
 assert.deepEqual(recommendedLoadOptions(setup,reference,100,200),[110,130,150,180]);
 assert.ok(reachableLoadOptions(setup,200,300).includes(240),'physical grids still allow multi-plate totals');
 for(const delta of [10,30,40,60,80,100])assert.equal(recommendedLoadOptions(setup,reference,0,400).some(weight=>weight===reference+delta||weight===reference-delta),false,String(delta));
 assert.deepEqual(recommendedLoadOptions({...setup,plates:[10,45]},reference,100,300),[110,180,220,290]);
 assert.deepEqual(recommendedLoadOptions({...setup,sides:1},reference,150,250),[155,165,175,190,210,225,235,245]);
 assert.deepEqual(setup,before);
});

test('working recommendation filtering also requires physical reachability and leaves non-lb-plate setups alone',()=>{
 const setup={unit:'lb',kind:'plates',plates:[10,25,35,45],sides:2,minimum:45};
 assert.deepEqual(recommendedLoadOptions(setup,145,140,240),[165,195,215,235]);
 assert.deepEqual(recommendedLoadOptions(setup,153,140,250),[],'off-grid source changes cannot invent unavailable absolute loads');
 const kg={...setup,unit:'kg',plates:[1.25,2.5,5,10,15,20,25],minimum:20};
 assert.deepEqual(recommendedLoadOptions(kg,45.36,40,50),reachableLoadOptions(kg,40,50));
 const stack={kind:'stack',unit:'lb',step:10,minimum:0};assert.deepEqual(recommendedLoadOptions(stack,53,50,80),[50,60,70,80]);
 for(const bad of [NaN,Infinity,-1,null,''])assert.deepEqual(recommendedLoadOptions(setup,bad,0,250),[]);
});

test('absolute machine grids correct imported or converted off-grid weights instead of preserving their offset',()=>{
 const stack={kind:'stack',step:10,minimum:0};
 assert.deepEqual(reachableLoadOptions(stack,53,75),[60,70]);
 assert.deepEqual(reachableLoadOptions({...stack,minimum:5},53,75),[55,65,75]);
 const kg={kind:'free',step:2.5,minimum:0};
 assert.deepEqual(reachableLoadOptions(kg,40,50),[40,42.5,45,47.5,50]);
 assert.deepEqual(reachableLoadOptions(kg,45.36,50),[47.5,50]);
 assert.deepEqual(reachableLoadOptions(stack,-100,0),[0]);
 assert.deepEqual(reachableLoadOptions(stack,51,59),[]);
});

test('absolute plate grids support repeated plates beyond change hints and enforce a bounded inventory',()=>{
 const setup={kind:'plates',plates:[10],sides:2,minimum:45};
 assert.deepEqual(reachableLoadOptions(setup,140,150),[145],'five per side are valid even though change hints cap at four');
 assert.deepEqual(reachableLoadOptions(setup,685,685),[685],'32 matching plates per side are the maximum');
 assert.deepEqual(reachableLoadOptions(setup,705,1000000000),[]);
 assert.deepEqual(reachableLoadOptions({kind:'plates',plates:[.01,1000],sides:2,minimum:0},0,1000000000),[],'oversized DP grids use manual fallback');
 assert.deepEqual(reachableLoadOptions({kind:'stack',step:.01},0,1000000000),[],'dense stack grids use manual fallback rather than skipping usable loads');
});

test('invalid absolute-grid requests are rejected without changing setup values',()=>{
 const setup={kind:'plates',plates:[10,25],sides:2,minimum:45},before=C.clone(setup);
 for(const [low,high]of [[20,10],['',100],[null,100],[0,Infinity],[-Infinity,100],[0,NaN],[0,1e308]])assert.deepEqual(reachableLoadOptions(setup,low,high),[]);
 for(const invalid of [{...setup,sides:3},{...setup,minimum:-1},{...setup,minimum:.001},{...setup,plates:[.019]},{kind:'stack',step:.001},{kind:'free',step:NaN}])assert.deepEqual(reachableLoadOptions(invalid,0,100),[]);
 assert.deepEqual(setup,before);
});
