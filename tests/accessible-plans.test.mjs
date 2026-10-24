import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../core.mjs';
import {buildPersonalizedProgram} from '../personalized-plan.mjs';
import {smartPlanForm,personalizedProgramPreview} from '../training-options-ui.mjs';
import {sessionPreparation} from '../session-preparation.mjs';
import {eligibleForProgramming,resolveMovementOptions,isFloorExercise} from '../accessible-programming.mjs';

const start='2027-01-04';
function stateFor(inventory=C.EQUIPMENT){const s=C.defaultState();s.gymSchedules=[];s.gyms=[{id:'synthetic-home',name:'Synthetic practice gym',inventory:inventory.slice()}];s.training.defaultGym='synthetic-home';return s}
const opts=extra=>({start,days:14,age:72,experience:'Returning',equipmentPreference:'bands',defaultGym:'synthetic-home',minRepeatDays:0,restWeekdays:[],...extra});
const liftExercises=plan=>plan.days.filter(d=>d.kind==='strength').flatMap(d=>d.exercises);
const normalize=value=>JSON.parse(JSON.stringify(value,(key,item)=>['id','updatedAt','planAge'].includes(key)?undefined:item));

test('supported band plans select genuine strength exercises with only confirmed equipment and preserve the workspace',()=>{
 const state=stateFor(['Resistance Bands','Stable Chair','Secure Band Anchor','Wall']),before=C.clone(state),plan=buildPersonalizedProgram(state,opts());
 assert.equal(plan.invalid,false);assert.equal(plan.training.accessibleProgramming,true);assert.equal(plan.training.movementLevel,'supported');assert.equal(plan.training.allowFloorWork,false);
 const exercises=liftExercises(plan);assert.ok(exercises.some(e=>e.loadMode==='band'));assert.ok(exercises.some(e=>e.exerciseId==='seated-band-row'));
 for(const exercise of exercises){const meta=C.exerciseFor(exercise.exerciseId);assert.ok(C.supports(meta,state.gyms[0]),exercise.name);assert.equal(meta.purpose,'strength');assert.equal(meta.programmingTier,'supported');assert.equal(isFloorExercise(meta),false)}
 for(const day of plan.days.filter(day=>day.kind==='strength')){assert.equal(day.exercises.length,6);assert.equal(day.movementLevel,'supported');assert.equal(day.allowFloorWork,false)}
 assert.deepEqual(state,before);assert.ok(plan.summary.sources.some(source=>source.id==='ace-bands'));
});

test('generic bands never invent anchors, loops, chairs or missing strength slots',()=>{
 const state=stateFor(['Resistance Bands','Wall']),plan=buildPersonalizedProgram(state,opts({days:1})),day=plan.days[0];
 assert.equal(plan.invalid,true);assert.equal(day.exercises.length,5);assert.match(day.notes.join(' '),/No Back exercise matches/);assert.equal(day.needsEquipmentReview,true);
 for(const exercise of day.exercises){const meta=C.exerciseFor(exercise.exerciseId);assert.equal(meta.purpose,'strength');assert.ok(C.supports(meta,state.gyms[0]));assert.ok(meta.equipmentRequirements.every(choices=>choices.some(gear=>['Resistance Bands','Wall'].includes(gear))))}
 const html=personalizedProgramPreview(plan);assert.match(html,/data-action="apply-program" disabled/);
});

test('movement and floor preferences follow ability choices, allow experienced older users and reopen intact',()=>{
 const state=stateFor(),younger=buildPersonalizedProgram(state,opts({age:24,experience:'Advanced',approach:'build',movementLevel:'advanced',floorWork:'allow',equipmentPreference:'bodyweight'})),older=buildPersonalizedProgram(state,opts({age:84,experience:'Advanced',approach:'build',movementLevel:'advanced',floorWork:'allow',equipmentPreference:'bodyweight'}));
 assert.deepEqual(normalize(younger.days),normalize(older.days));assert.equal(older.training.movementLevel,'advanced');assert.equal(older.training.allowFloorWork,true);
 assert.equal(eligibleForProgramming(C.exerciseFor('Nordic Hamstring Curl'),older.training),true);assert.equal(eligibleForProgramming(C.exerciseFor('Nordic Hamstring Curl'),{...older.training,movementLevel:'standard'}),false);
 const noFloor=buildPersonalizedProgram(state,opts({experience:'Intermediate',movementLevel:'standard',floorWork:'avoid',equipmentPreference:'calisthenics'}));
 assert.equal(noFloor.training.movementLevel,'standard');assert.equal(noFloor.training.allowFloorWork,false);assert.ok(liftExercises(noFloor).every(exercise=>!isFloorExercise(C.exerciseFor(exercise.exerciseId))));
 state.training=noFloor.training;const html=smartPlanForm(state,start);for(const [name,value]of [['movementLevel','standard'],['floorWork','avoid'],['equipmentPreference','calisthenics']])assert.match(html,new RegExp(`name="${name}"[\\s\\S]*?<option value="${value}" selected`));
 assert.deepEqual(resolveMovementOptions({experience:'Returning'}),{movementLevel:'supported',movementLevelChoice:'auto',floorWork:'auto',allowFloorWork:false});
 assert.throws(()=>buildPersonalizedProgram(state,opts({movementLevel:'medical'})),/movement support/);assert.throws(()=>buildPersonalizedProgram(state,opts({floorWork:'forced'})),/floor exercises/);
});

test('timed core holds retain seconds targets instead of receiving the chosen lifting rep range',()=>{
 const state=stateFor(['Resistance Bands','Wall']),plan=buildPersonalizedProgram(state,opts({days:1,range:'8-12'})),hold=plan.days[0].exercises.find(exercise=>exercise.exerciseId==='wall-plank');
 assert.ok(hold);assert.equal(C.exerciseFor(hold.exerciseId).repUnit,'seconds');assert.equal(hold.range,'10-20');assert.equal(hold.manualProgression,true);assert.ok(hold.sets.every(set=>set.w===''&&set.r===''&&!set.done));
});

test('legacy programs exclude new families while smart-plan calisthenics can use them',()=>{
 const state=stateFor();Object.assign(state.training,{mode:'automatic',frequency:3,split:'full',runEvery:0,startDate:start,minRepeatDays:0});
 const legacy=C.generateProgram(state,{start,days:28});assert.ok(legacy.days.flatMap(day=>day.exercises).every(exercise=>!C.exerciseFor(exercise.exerciseId).newFamily));
 assert.equal(eligibleForProgramming(C.exerciseFor('Seated March'),{accessibleProgramming:true,movementLevel:'advanced',allowFloorWork:true}),false);
 assert.equal(eligibleForProgramming(C.exerciseFor('Supported Tandem Stand'),{accessibleProgramming:true,movementLevel:'advanced',allowFloorWork:true}),false);
 const smart=buildPersonalizedProgram(state,opts({experience:'Intermediate',equipmentPreference:'calisthenics'}));assert.equal(smart.invalid,false);assert.ok(liftExercises(smart).some(exercise=>C.exerciseFor(exercise.exerciseId).newFamily==='accessible'));
 assert.ok(liftExercises(smart).every(exercise=>exercise.loadMode==='bodyweight'));
});

test('supported preparation stays read-only, offers chair/support options only when confirmed and keeps run time intact',()=>{
 const day={kind:'strength',movementLevel:'supported',allowFloorWork:false,exercises:['Wall Push-Up','Supported Mini Squat','Wall Plank'].map(name=>C.makeExercise(C.exerciseFor(name)))},before=C.clone(day);
 const plain=sessionPreparation(day,{catalog:C.CATALOG,bands:true}),supported=sessionPreparation(day,{catalog:C.CATALOG,bands:true,supportAvailable:true,chairAvailable:true});
 assert.ok(plain.warmup.every(step=>!['Stable support','Stable chair'].includes(step.equipment)));assert.ok(!plain.cooldown.some(step=>['Stable support','Stable chair'].includes(step.equipment)));
 assert.ok(supported.warmup.some(step=>step.id==='seated-easy-start'));assert.ok(supported.warmup.some(step=>step.id==='seated-brace'));assert.ok(supported.warmup.some(step=>step.id==='supported-balance-practice'));assert.ok(supported.sources.some(source=>source.url.includes('nhs.uk')));
 for(const model of [plain,supported]){assert.equal(model.optional,true);assert.match(model.notes.join(' '),/separate from working strength sets/);assert.ok([...model.warmup,...model.cooldown].every(step=>!Object.hasOwn(step,'done')))}assert.deepEqual(day,before);
 const run={kind:'run',exercises:[],movementLevel:'supported',run:{minutes:34,warmup:10,cooldown:8,blocks:[{repeat:4}]}},runBefore=C.clone(run),prep=sessionPreparation(run,{supportAvailable:true,chairAvailable:true});assert.deepEqual(prep.includedRunPreparation,{warmupMinutes:10,cooldownMinutes:8});assert.match(prep.warmup[0].dose,/10 minutes.*already included/);assert.match(prep.cooldown[0].dose,/8 minutes.*already included/);assert.deepEqual(run,runBefore);
});
