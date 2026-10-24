import test from 'node:test';
import assert from 'node:assert/strict';
import {sessionPreparation} from '../session-preparation.mjs';
import {CATALOG,defaultState,makeExercise,exerciseFor,packPlanDay} from '../core.mjs';

const prepare=(day,options={})=>sessionPreparation(day,{catalog:CATALOG,...options});
const day=(...names)=>({date:'2027-01-04',kind:'strength',exercises:names.map(name=>makeExercise(exerciseFor(name)))});

test('upper-body guidance matches audited muscles, includes compound assistance and stays separate from sets',()=>{
 const workout=day('Dumbbell Bench Press'),before=structuredClone(workout),result=prepare(workout);
 assert.deepEqual(workout,before);assert.equal(result.kind,'strength');assert.equal(result.optional,true);
 for(const muscle of ['Chest','Shoulders','Triceps'])assert.ok(result.targetMuscles.includes(muscle),muscle);
 assert.ok(!result.targetMuscles.includes('Quadriceps'));
 assert.ok(result.warmup.some(step=>step.id==='arm-circles'));assert.ok(result.cooldown.some(step=>step.id==='chest-opener'));
 assert.ok(result.warmup.some(step=>step.id==='light-rehearsal'));assert.equal(workout.exercises[0].sets.length,3);assert.ok(workout.exercises[0].sets.every(set=>!set.done));
 for(const step of result.warmup)assert.doesNotMatch(step.cue+' '+step.dose,/one.rep.max|1RM|\b\d+(?:\.\d+)?\s*(?:lb|kg)\b/i);
});

test('leg preparation distinguishes quads from hamstrings and covers actual mixed sessions without duplicates',()=>{
 const quad=prepare(day('Leg Extension'));assert.ok(quad.targetMuscles.includes('Quadriceps'));assert.ok(!quad.targetMuscles.includes('Hamstrings'));assert.ok(quad.warmup.some(step=>step.id==='shallow-squat'));
 const ham=prepare(day('Romanian Deadlift'));assert.ok(ham.targetMuscles.includes('Hamstrings'));assert.ok(ham.targetMuscles.includes('Glutes'));assert.ok(ham.warmup.some(step=>step.id==='unloaded-hip-hinge'));
 const mixed=prepare(day('Dumbbell Bench Press','Romanian Deadlift','Leg Extension','Dumbbell Bench Press'));
 assert.equal(new Set(mixed.targetMuscles).size,mixed.targetMuscles.length);
 for(const list of [mixed.warmup,mixed.cooldown])assert.equal(new Set(list.map(step=>step.id)).size,list.length);
});

test('bands require explicit opt-in, need no face or door anchor and have equipment-free alternatives',()=>{
 const workout=day('Face Pull'),plain=prepare(workout),bands=prepare(workout,{bands:true});
 assert.ok(plain.warmup.every(step=>!step.equipment.includes('band')));assert.ok(plain.warmup.some(step=>step.id==='shoulder-blade-reaches'));
 assert.ok(bands.warmup.some(step=>step.id==='band-pull-apart'));assert.ok(!bands.warmup.some(step=>step.id==='shoulder-blade-reaches'));
 assert.ok(bands.notes.some(note=>/no door or face-level anchor/.test(note)));
 assert.ok(prepare(workout,{bands:'true'}).warmup.every(step=>!step.equipment.includes('band')));
 const hips=sessionPreparation({kind:'strength',exercises:[{name:'Synthetic hip exercise',group:'Legs',subgroup:'abductors',sets:[]}]},{bands:true});assert.ok(hips.warmup.some(step=>step.id==='band-side-steps'));
});

test('unknown custom names receive general preparation rather than fabricated anatomy or equipment',()=>{
 const workout={kind:'strength',exercises:[{name:'Unknown custom press curl thing',sets:[{w:0,r:0,rir:0,done:false}],unknown:{retain:0}}]},before=structuredClone(workout);
 const result=prepare(workout);assert.deepEqual(result.targetMuscles,[]);assert.ok(result.notes.some(note=>/No muscle metadata/.test(note)));assert.deepEqual(result.warmup.map(step=>step.id),['gradual-easy-start','light-rehearsal']);assert.deepEqual(workout,before);
 const custom=sessionPreparation({kind:'strength',exercises:[{exerciseId:'custom-1',name:'Custom movement',sets:[]}]},{catalog:[{id:'custom-1',name:'Custom movement',group:'Legs',primary:'Hamstrings',subgroup:'hamstrings'}]});assert.deepEqual(custom.targetMuscles,['Hamstrings']);
 const names=sessionPreparation({exercises:[{name:'Saved alias',sets:[]}]},{catalog:[{id:'custom-1',name:'Named custom movement',aliases:['Saved alias'],group:'Biceps',primary:'Biceps brachii'}]});assert.deepEqual(names.targetMuscles,['Biceps']);
 const malformed=sessionPreparation({exercises:[{name:'Unknown metadata',muscleTags:['constructor','__proto__','not-a-muscle'],group:'constructor',sets:[]}]});assert.deepEqual(malformed.targetMuscles,[]);
});

test('run guidance preserves already-budgeted warm-up and cool-down phases, including interval sessions',()=>{
 const workout={kind:'run',exercises:[],run:{minutes:34,warmup:10,cooldown:8,done:false,blocks:[{repeat:4}]}},before=structuredClone(workout),result=prepare(workout);
 assert.equal(result.kind,'run');assert.deepEqual(result.includedRunPreparation,{warmupMinutes:10,cooldownMinutes:8});assert.match(result.warmup[0].dose,/already included/);assert.match(result.cooldown[0].dose,/already included/);
 assert.ok(result.notes.some(note=>/already included in its listed minutes/.test(note)));assert.ok(result.targetMuscles.includes('Calves'));assert.deepEqual(workout,before);
 const mixed=day('Dumbbell Bench Press');mixed.run={minutes:20,warmup:5,cooldown:5};const both=prepare(mixed);assert.equal(both.kind,'strength');assert.ok(both.targetMuscles.includes('Chest'));assert.ok(both.targetMuscles.includes('Calves'));assert.deepEqual(both.includedRunPreparation,{warmupMinutes:5,cooldownMinutes:5});
 const manual=prepare({kind:'run',exercises:[],run:{minutes:20}});assert.deepEqual(manual.includedRunPreparation,{warmupMinutes:0,cooldownMinutes:0});assert.doesNotMatch(manual.warmup[0].dose,/already included/);assert.ok(manual.notes.some(note=>/no recorded/.test(note)));
});

test('rest mobility is optional, gives no workout completion state and does not create a fake session',()=>{
 const rest={date:'2027-01-05',kind:'rest',exercises:[],status:'in-progress'},before=structuredClone(rest),result=prepare(rest);
 assert.equal(result.kind,'recovery');assert.deepEqual(result.targetMuscles,[]);assert.deepEqual(result.cooldown,[]);assert.ok(result.notes.some(note=>/not a logged workout/.test(note)));assert.deepEqual(rest,before);assert.equal(Object.hasOwn(result,'done'),false);assert.equal(Object.hasOwn(result,'status'),false);
 assert.deepEqual(prepare(undefined).targetMuscles,[]);assert.deepEqual(prepare({...day('Leg Extension'),deleted:true}).targetMuscles,[]);
});

test('compact plan templates, zero-valued entries and completed historical sessions remain unchanged',()=>{
 const state=defaultState(),workout=day('Romanian Deadlift');workout.status='completed';workout.completedAt='2027-01-04T12:00:00Z';workout.exercises[0].sets[0]={...workout.exercises[0].sets[0],w:0,r:0,rir:0,done:true,completedAt:'2027-01-04T12:00:00Z'};
 state.logs[workout.date]=workout;const compact=packPlanDay(day('Leg Extension'));state.plan['2027-01-05']=compact;const before=structuredClone(state);
 prepare(state.logs[workout.date],{bands:true});const result=prepare(compact);assert.ok(result.targetMuscles.includes('Quadriceps'));assert.deepEqual(state,before);
});

test('all instruction rows have safe display fields and sources are fresh per call',()=>{
 const result=prepare(day('Dumbbell Bench Press','Romanian Deadlift','Leg Extension'),{bands:true});
 for(const step of [...result.warmup,...result.cooldown]){for(const key of ['id','name','dose','cue','equipment'])assert.equal(typeof step[key],'string');assert.ok(Array.isArray(step.muscles));assert.ok(step.seconds>0&&Number.isFinite(step.seconds));}
 assert.ok(result.warmupMinutes>0);assert.ok(result.cooldownMinutes>0);assert.match(result.safetyCue,/pain/);assert.ok(result.sources.every(source=>/^https:\/\//.test(source.url)));
 result.sources[0].title='Changed copy';assert.notEqual(prepare(day('Leg Extension')).sources[0].title,'Changed copy');
});
