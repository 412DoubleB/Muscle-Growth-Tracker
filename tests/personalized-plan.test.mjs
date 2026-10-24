import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../core.mjs';
import {SPLITS} from '../training.mjs';
import {PLAN_APPROACHES,PLAN_SOURCES,buildPersonalizedProgram} from '../personalized-plan.mjs';

const start='2027-01-04';
function workspace(){const state=C.defaultState();state.gymSchedules=[];state.gyms[0].inventory=C.EQUIPMENT.slice();return state}
const options=(extra={})=>({start,days:7,age:35,experience:'Intermediate',goal:'general',approach:'auto',frequency:'auto',split:'auto',sets:'auto',range:'auto',equipmentPreference:'any',runEvery:0,supersetMode:'off',restWeekdays:[0],defaultGym:'crunch',minRepeatDays:0,excludePullups:true,...extra});
function normalized(value,ignored=['id','updatedAt']){return JSON.parse(JSON.stringify(value,(_key,item)=>item&&typeof item==='object'&&!Array.isArray(item)?Object.fromEntries(Object.entries(item).filter(([key])=>!ignored.includes(key))):item))}
const lifts=result=>result.days.filter(day=>day.kind==='strength');

test('automatic approaches use adult age and experience as suggestions, while explicit approaches stay available',()=>{
 const state=workspace();
 for(const [age,experience,approachId]of [[18,'Beginner','foundation'],[35,'Advanced','build'],[49,'Intermediate','build'],[50,'Intermediate','active50'],[64,'Beginner','foundation'],[65,'Advanced','balance65'],[90,'Returning','balance65']]){
  const plan=buildPersonalizedProgram(state,options({age,experience}));assert.equal(plan.summary.approachId,approachId);assert.equal(plan.training.planAge,age);assert.ok(plan.summary.sources.length);assert.equal(plan.invalid,false);
 }
 const selected=buildPersonalizedProgram(state,options({age:78,experience:'Advanced',approach:'build',goal:'strength'}));assert.equal(selected.summary.approachId,'build');assert.equal(selected.training.trainingStyle,'strength');assert.equal(selected.training.range,'3-5');assert.equal(selected.training.sets,3);
 for(const approach of PLAN_APPROACHES.filter(p=>p.id!=='auto'))assert.equal(buildPersonalizedProgram(state,options({age:20,approach:approach.id})).summary.approachId,approach.id);
});

test('foundation and returning defaults are manageable and do not assign heavy starting loads',()=>{
 const state=workspace();const foundation=buildPersonalizedProgram(state,options({age:30,experience:'Beginner',goal:'strength'}));assert.equal(foundation.training.frequency,2);assert.equal(foundation.training.split,'full');assert.equal(foundation.training.sets,2);assert.equal(foundation.training.range,'8-12');assert.equal(foundation.training.trainingStyle,'hypertrophy');assert.match(foundation.summary.reasons.join(' '),/moderate-rep/);
 const returning=buildPersonalizedProgram(state,options({experience:'Returning'}));assert.equal(returning.training.experience,'Beginner');assert.equal(returning.training.planExperience,'Returning');assert.equal(returning.summary.experience,'Returning');
 for(const exercise of lifts(returning).flatMap(day=>day.exercises)){assert.equal(exercise.sets.length,2);assert.equal(exercise.targetRir,3);for(const row of exercise.sets){assert.equal(row.w,'');assert.equal(row.r,'');assert.equal(row.done,false);assert.equal(row.rest,60)}}
});

test('adult goals and user overrides retain the selected schedule, split, sets, range, gym and equipment preference',()=>{
 const state=workspace(),plan=buildPersonalizedProgram(state,options({age:76,experience:'Advanced',goal:'muscle',frequency:4,split:'ppl',sets:4,range:'6-10',equipmentPreference:'free',defaultGym:'station',minRepeatDays:3,excludePullups:false,supersetMode:'supersets',runEvery:3}));
 assert.equal(plan.training.frequency,4);assert.equal(plan.training.split,'ppl');assert.equal(plan.training.sets,4);assert.equal(plan.training.range,'6-10');assert.equal(plan.training.defaultGym,'station');assert.equal(plan.training.minRepeatDays,3);assert.equal(plan.training.excludePullups,false);assert.equal(plan.training.equipmentPreference,'free');assert.equal(plan.training.supersetMode,'supersets');assert.equal(plan.training.runEvery,3);assert.equal(plan.training.restSeconds,60);assert.equal(plan.training.saunaMinutes,state.training.saunaMinutes);
 for(const day of lifts(plan)){assert.equal(day.gymId,'station');for(const e of day.exercises){assert.equal(e.sets.length,4);assert.equal(e.range,'6-10')}}
 assert.equal(buildPersonalizedProgram(state,options({sets:1,range:'10'})).training.sets,1);
 const endurance=buildPersonalizedProgram(state,options({goal:'endurance'}));assert.equal(endurance.training.trainingStyle,'endurance');assert.equal(endurance.training.sets,2);assert.equal(endurance.training.range,'15-20');
 state.training.runningQuality=true;const easy=buildPersonalizedProgram(state,options({goal:'endurance',experience:'Advanced',runEvery:2,days:14}));assert.equal(easy.training.runningQuality,false);assert.ok(easy.days.every(day=>!day.run?.blocks?.length));assert.equal(state.training.runningQuality,true);
 for(const experience of ['Beginner','Returning'])assert.throws(()=>buildPersonalizedProgram(state,options({experience,sets:4})),/up to 3 working sets/);
});

test('invalid or missing adult ages, unsupported settings and malformed custom ranges are rejected before generation',()=>{
 const state=workspace();
 const invalid=[{age:''},{age:undefined},{age:17},{age:121},{age:65.5},{age:NaN},{start:'2027-02-30'},{start:'invalid'},{days:0},{days:367},{days:7.5},{experience:'Expert'},{goal:'rehab'},{approach:'secret'},{frequency:0},{frequency:8},{frequency:2.5},{split:'unknown'},{sets:0},{sets:5},{range:'12-8'},{range:'0-8'},{range:'8-31'},{range:'8.5-12'},{range:'8 to 12'},{range:8},{equipmentPreference:'unavailable'},{runEvery:1},{runEvery:5},{supersetMode:'triples'},{restWeekdays:[0,0]},{restWeekdays:[7]},{restWeekdays:'0,1'},{defaultGym:'missing'},{minRepeatDays:-1},{minRepeatDays:43},{excludePullups:'false'}];
 for(const values of invalid)assert.throws(()=>buildPersonalizedProgram(state,options(values)),undefined,JSON.stringify(values));
 assert.throws(()=>buildPersonalizedProgram(null,options()),/workspace/);assert.throws(()=>buildPersonalizedProgram(state,[]),/workspace/);
 state.profile.age=67;const withProfile=options();delete withProfile.age;assert.equal(buildPersonalizedProgram(state,withProfile).summary.age,67);
});

test('suggested frequencies fit available weekdays and explicit impossible schedules produce a clear error',()=>{
 const state=workspace(),restWeekdays=[0,2,3,4,5,6];const plan=buildPersonalizedProgram(state,options({restWeekdays}));assert.equal(plan.training.frequency,1);assert.match(plan.summary.reasons.join(' '),/weekdays you left available/);
 assert.throws(()=>buildPersonalizedProgram(state,options({restWeekdays,frequency:2})),/exceed the available weekdays/);
 assert.throws(()=>buildPersonalizedProgram(state,options({restWeekdays:[0,1,2,3,4,5,6]})),/at least one weekday/);
});

test('all existing splits preserve their 6–9 exercise session sizes and saved equipment constraints',()=>{
 const state=workspace();for(const [split]of SPLITS){
  const plan=buildPersonalizedProgram(state,options({age:70,experience:'Intermediate',split,frequency:5,days:14}));assert.equal(plan.invalid,false,split);
  for(const day of lifts(plan)){assert.ok(day.exercises.length>=6&&day.exercises.length<=9,`${split}: ${day.exercises.length}`);assert.equal(day.plannedExerciseCount,day.exercises.length);const gym=state.gyms.find(g=>g.id===day.gymId);for(const e of day.exercises)assert.ok(C.supports(C.exerciseFor(e.exerciseId),gym),e.name)}
 }
});

test('equipment preferences bias compatible choices without inventing equipment or deleting required muscle slots',()=>{
 const state=workspace();
 const machine=buildPersonalizedProgram(state,options({equipmentPreference:'machines',days:1}));
 const free=buildPersonalizedProgram(state,options({equipmentPreference:'free',days:1}));
 assert.notDeepEqual(machine.days[0].exercises.map(e=>e.exerciseId),free.days[0].exercises.map(e=>e.exerciseId));
 assert.ok(machine.days[0].exercises.filter(e=>/Machine|Press|Curl|Extension|Squat/.test(e.name)&&!C.exerciseFor(e.exerciseId).equipmentRequirements.flat().some(x=>['Barbell','Dumbbells','EZ Bar','Kettlebells'].includes(x))).length>=4);
 const bodyweight=buildPersonalizedProgram(state,options({equipmentPreference:'bodyweight',days:1}));assert.equal(bodyweight.days[0].exercises.length,6);assert.equal(bodyweight.invalid,false);assert.ok(bodyweight.days[0].exercises.some(e=>e.loadMode==='bodyweight'));assert.match(bodyweight.days[0].notes.join(' '),/mix of compatible saved equipment/);
 state.gyms=[state.gyms[1]];state.training.defaultGym='station';
 const limited=buildPersonalizedProgram(state,options({equipmentPreference:'machines',defaultGym:'station',days:7}));for(const day of lifts(limited))for(const e of day.exercises)assert.ok(C.supports(C.exerciseFor(e.exerciseId),state.gyms[0]));assert.ok(lifts(limited).some(day=>day.notes.some(note=>/equipment preference/.test(note))));
});

test('missing or any equipment preference leaves the existing generator output unchanged',()=>{
 const state=workspace();Object.assign(state.training,{mode:'automatic',startDate:start,frequency:3,split:'full',runEvery:2,minRepeatDays:5});
 const baseline=C.generateProgram(state,{start,days:14}),any=C.generateProgram({...state,training:{...state.training,equipmentPreference:'any'}},{start,days:14});assert.deepEqual(normalized(any),normalized(baseline));
 const invalid=C.generateProgram({...state,training:{...state.training,equipmentPreference:'invalid-import'}},{start,days:14});assert.deepEqual(normalized(invalid),normalized(baseline));
});

test('preview uses no network and preserves existing entered sessions and every saved workspace field',()=>{
 const state=workspace(),exercise=C.makeExercise(C.exerciseFor('Plank'),{count:1});exercise.sets[0]={...exercise.sets[0],w:0,r:30,rir:2,done:true};state.logs[start]={id:start,date:start,title:'Keep this session',kind:'strength',status:'in-progress',exercises:[exercise],unknown:'retain'};state.plan['2027-01-05']={date:'2027-01-05',kind:'rest',unknown:'saved-plan'};state.profile.units='kg';state.recipes=[{id:'private-synthetic',unknown:true}];const before=structuredClone(state),fetchBefore=globalThis.fetch;
 globalThis.fetch=()=>assert.fail('Smart plans must not make paid or network requests');try{
  const plan=buildPersonalizedProgram(state,options({days:14,equipmentPreference:'free'}));assert.equal(plan.days.some(day=>day.date===start),false);assert.match(plan.warnings.join(' '),/existing workout preserved/);assert.deepEqual(state,before);assert.equal(plan.training.mode,'automatic');assert.equal(plan.training.planAge,35);assert.equal(plan.summary.restSeconds,60);
 }finally{globalThis.fetch=fetchBefore}
});

test('age alone does not reduce loads or override the same experienced plan choices',()=>{
 const state=workspace(),young=buildPersonalizedProgram(state,options({age:25,experience:'Advanced',approach:'build',goal:'strength'})),older=buildPersonalizedProgram(state,options({age:75,experience:'Advanced',approach:'build',goal:'strength'}));
 assert.deepEqual(normalized(young.days,['id','updatedAt','planAge']),normalized(older.days,['id','updatedAt','planAge']));
 for(const day of lifts(older))for(const exercise of day.exercises)assert.ok(exercise.sets.every(set=>set.w===''));
 assert.match(older.summary.reasons.join(' '),/Age alone never determines a lifting weight/);
 assert.equal(older.summary.ageBand,'65+');assert.equal(young.summary.ageBand,'18-49');assert.ok(older.summary.sources.every(s=>s.url.startsWith('https://')));
});

test('source credits distinguish original MENEI adaptations from published trainer plans',()=>{
 assert.equal(new Set(PLAN_APPROACHES.map(x=>x.id)).size,PLAN_APPROACHES.length);assert.equal(new Set(PLAN_SOURCES.map(x=>x.id)).size,PLAN_SOURCES.length);
 for(const approach of PLAN_APPROACHES)for(const id of approach.sourceIds)assert.ok(PLAN_SOURCES.some(s=>s.id===id));
 const plan=buildPersonalizedProgram(workspace(),options({age:66,approach:'balance65'}));assert.ok(plan.summary.sources.some(s=>s.id==='cdc-older-adults'));assert.ok(plan.summary.sources.some(s=>s.author.includes('Robert Linkul')));assert.match(plan.summary.reasons.join(' '),/not an exact published trainer program/);assert.match(plan.summary.reasons.join(' '),/not logged working sets/);
});
