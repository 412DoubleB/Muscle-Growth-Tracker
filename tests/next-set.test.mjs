import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../core.mjs';

function fixture({name='Machine Chest Press',units='lb',weight=160,reps=11,rir=3}={}){
 const state=C.defaultState();state.profile.units=units;
 const gym={id:'synthetic',increment:5,incrementKg:2.5,dbMax:200};
 const exercise=C.makeExercise(C.exerciseFor(name),{count:4,range:'6-10'});
 Object.assign(exercise.sets[0],{w:weight,r:reps,rir,done:true});
 return {state,gym,exercise};
}
const next=sample=>C.nextSetRecommendation(sample.state,sample.exercise,sample.gym);

test('a checked current set above the rep range with more than two RIR suggests one increment for only the next set',()=>{
 const sample=fixture(),before=C.clone(sample),result=next(sample);
 assert.equal(result.sourceIndex,0);assert.equal(result.targetIndex,1);assert.equal(result.weight,165);assert.equal(result.reps,10);assert.equal(result.change,'increase');assert.deepEqual(sample,before);
});

test('rep and effort thresholds are strict; missing the lower rep bound suggests one easier increment',()=>{
 for(const [reps,rir,weight,change]of [[10,3,160,'hold'],[11,2,160,'hold'],[11,3,165,'increase'],[5,2,155,'decrease'],[6,3,160,'hold'],[8,0,160,'hold']]){
  const sample=fixture({reps,rir}),before=C.clone(sample),result=next(sample);assert.equal(result.weight,weight);assert.equal(result.change,change);assert.ok(result.reps>=6&&result.reps<=10);assert.deepEqual(sample,before);
 }
});

test('unchecked, incomplete and invalid source sets cannot drive a next-set suggestion, while real zero loads can',()=>{
 for(const change of [{done:false},{w:''},{w:null},{w:Infinity},{w:-1},{r:''},{r:0},{r:Infinity},{rir:''},{rir:null},{rir:Infinity},{rir:-1},{rir:11}]){
  const sample=fixture();Object.assign(sample.exercise.sets[0],change);const before=C.clone(sample);assert.equal(next(sample),null,JSON.stringify(change));assert.deepEqual(sample,before);
 }
 assert.equal(next(fixture({weight:0})).weight,5);assert.equal(next(fixture({weight:0,reps:5})).weight,0);
});

test('the most recently checked working set in set order determines the immediately following working set',()=>{
 const sample=fixture();Object.assign(sample.exercise.sets[1],{w:165,r:5,rir:1,done:true});const before=C.clone(sample),result=next(sample);
 assert.equal(result.sourceIndex,1);assert.equal(result.targetIndex,2);assert.equal(result.weight,155);assert.deepEqual(sample,before);
 sample.exercise.sets[1].rir='';assert.equal(next(sample),null,'do not fall back to an older checked set when the latest lacks effort data');
});

test('auxiliary sets, completed exercises and a non-working next row do not receive automatic in-session guidance',()=>{
 for(const role of ['warmup','ramp','backoff','drop']){
  const source=fixture();source.exercise.sets[0].role=role;assert.equal(next(source),null);
  const target=fixture();target.exercise.sets[1].role=role;assert.equal(next(target),null);
 }
 const finished=fixture();for(const set of finished.exercise.sets)Object.assign(set,{w:160,r:11,rir:3,done:true});assert.equal(next(finished),null);
});

test('assistance reverses difficulty changes and never produces negative counterweight',()=>{
 for(const [weight,reps,expected,change]of [[60,11,55,'increase'],[60,5,65,'decrease'],[0,11,0,'hold']]){
  const sample=fixture({name:'Assisted Dip',weight,reps}),before=C.clone(sample),result=next(sample);
  assert.equal(result.weight,expected);assert.equal(result.change,change);assert.equal(result.assistance,true);assert.match(result.reason,/assistance/i);assert.deepEqual(sample,before);
 }
});

test('unit-specific increments, exercise overrides and dumbbell limits constrain next-set loads',()=>{
 const kg=fixture({units:'kg',weight:60});assert.equal(next(kg).weight,62.5);kg.exercise.increment=1.25;assert.equal(next(kg).weight,62.5,'the capacity estimate may use two available 1.25 kg steps');
 kg.exercise.increment=-5;assert.equal(next(kg).weight,62.5);
 const db=fixture({name:'Dumbbell Bench Press',weight:100});db.gym.dbMax=100;const result=next(db);assert.equal(result.weight,100);assert.equal(result.change,'hold');assert.match(result.reason,/limit/i);
});

test('an entered next-set load remains untouched; independent exercises and previous-workout progression remain separate',()=>{
 const sample=fixture();Object.assign(sample.exercise.sets[1],{w:170,r:7,rir:0,unknownField:'retain'});sample.exercise.supersetId='pair';
 const other=fixture({weight:40,reps:5}),before=C.clone(sample),otherBefore=C.clone(other),historical=C.progression(sample.state,sample.exercise,'2027-01-04',sample.gym);
 assert.equal(next(sample).weight,165);assert.equal(next(other).weight,35);assert.deepEqual(sample,before);assert.deepEqual(other,otherBefore);
 assert.deepEqual(C.progression(sample.state,sample.exercise,'2027-01-04',sample.gym),historical);
});

test('time and distance counts are not interpreted as repetitions for same-workout load changes',()=>{
 for(const unit of ['seconds','metres']){const definition=C.CATALOG.find(e=>e.repUnit===unit);assert.ok(definition);const sample=fixture({name:definition.name}),before=C.clone(sample);assert.equal(next(sample),null);assert.deepEqual(sample,before)}
});
