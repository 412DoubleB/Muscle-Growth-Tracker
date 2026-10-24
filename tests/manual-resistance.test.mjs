import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../core.mjs';
import {buildProgress,progressPanel,progressRecords} from '../progress.mjs';

const bandMeta={id:'synthetic-band-row',name:'Synthetic band row',loadMode:'band',manualProgression:true,repUnit:'reps',range:'8-12',equipmentRequirements:[['Resistance Bands']]};
const holdMeta={id:'synthetic-wall-hold',name:'Synthetic wall hold',loadMode:'bodyweight',manualProgression:true,repUnit:'seconds',range:'10-20',equipmentRequirements:[['Wall']]};
const row=(r,extra={})=>({w:0,r,rir:3,done:true,role:'working',band:'Acme light · short stance',...extra});
const exercise=(meta,sets=[row(10)])=>({...C.makeExercise(meta,{count:sets.length,range:meta.range}),sets});
function fixture(meta=bandMeta){
 const state=C.defaultState(),gym=state.gyms[0];state.customExercises=[meta];state.logs={};
 return {state,gym,exercise:exercise(meta,[row(14),row('',{done:false})])};
}
function history(meta=bandMeta){
 const state=C.defaultState();state.logs={
  '2027-01-04':{date:'2027-01-04',gymId:'crunch',status:'completed',exercises:[exercise(meta,[row(8),row(10),row(90,{role:'warmup'}),row(80,{done:false})])]},
  '2027-01-11':{date:'2027-01-11',gymId:'crunch',status:'completed',exercises:[exercise(meta,[row(10),row(12)])]}
 };return state;
}
const progress=(state,meta=bandMeta,filters={})=>buildProgress(state,[meta],{period:'all',...filters},'2027-01-12');

test('band progression returns a manual path before reading history, equipment increments or machine profiles',()=>{
 const current=exercise(bandMeta,[row(15),row('',{done:false})]);
 const state={customExercises:[bandMeta],get logs(){assert.fail('Manual guidance must not calculate a historical weight.')}};
 const gym=new Proxy({},{get(){assert.fail('Manual guidance must not read numeric equipment profiles.')}});
 const before=structuredClone(current),result=C.progression(state,current,'2027-01-12',gym);
 assert.equal(result.manual,true);assert.equal(result.loadMode,'band');assert.equal(result.weight,null);assert.deepEqual(result.range,[8,12]);assert.equal(result.reps,8);assert.equal(result.rows.length,2);assert.ok(result.rows.every(set=>set.w===null));assert.equal(result.previous,null);assert.match(result.reason,/brand, level and setup/);assert.match(result.reason,/not converted/);assert.deepEqual(current,before);
 assert.equal(C.nextSetRecommendation(state,current,gym),null);
});

test('manual bodyweight holds retain seconds and never recommend added weight after an easy checked set',()=>{
 const sample=fixture(holdMeta),before=structuredClone(sample),result=C.progression(sample.state,sample.exercise,'2027-01-12',sample.gym);
 assert.equal(C.usesManualProgression(sample.exercise,holdMeta),true);assert.equal(result.manual,true);assert.deepEqual(result.range,[10,20]);assert.match(result.reason,/seconds/);assert.equal(result.weight,null);assert.ok(result.rows.every(set=>set.w===null));assert.equal(C.nextSetRecommendation(sample.state,sample.exercise,sample.gym),null);assert.deepEqual(sample,before);
});

test('manual current-set guidance does not inspect numeric fields and recognizes band mode without an optional flag',()=>{
 const meta={...bandMeta,id:'unflagged-band',manualProgression:undefined},state={customExercises:[meta]};
 const current={exerciseId:meta.id,name:meta.name,loadMode:'band',get sets(){assert.fail('Bands do not enter the numerical next-load path.')}};
 assert.equal(C.usesManualProgression(current,meta),true);assert.equal(C.nextSetRecommendation(state,current,{}),null);
 const distance={...holdMeta,id:'synthetic-distance',repUnit:'metres',range:'10-20'},sample=fixture(distance);
 assert.match(C.progression(sample.state,sample.exercise,'2027-01-12',sample.gym).reason,/distance.*metres/);
});

test('independent band and supported-movement guides keep their own setup instead of borrowing machine instructions',()=>{
 const sample={name:'Band Chest Press',equipmentLabel:'Resistance Bands',group:'Chest',independentGuide:true,setup:['Wrap the band across the upper back, below the neck.'],cues:['Press forward under control.'],mistakes:['Letting the band snap back.']};
 const before=structuredClone(sample),guide=C.guideFor(sample);
 assert.deepEqual(guide,{setup:sample.setup,cues:sample.cues,mistakes:sample.mistakes});
 guide.setup.push('Synthetic edit');assert.deepEqual(sample,before);
 const old=C.exerciseFor('Machine Chest Press');assert.ok(C.guideFor(old).setup.some(line=>/seat|pad/i.test(line)));
});

test('new manual metadata is retained in logged rows without changing existing exercise shapes or numeric guidance',()=>{
 const manual=C.makeExercise(holdMeta);assert.equal(manual.manualProgression,true);assert.equal(manual.repUnit,'seconds');
 const state=C.defaultState(),meta=C.exerciseFor('Dumbbell Curl'),current=C.makeExercise(meta,{count:2,range:'8-12'});assert.equal(Object.hasOwn(current,'manualProgression'),false);assert.equal(Object.hasOwn(current,'repUnit'),false);assert.equal(C.usesManualProgression(current,meta),false);
 Object.assign(current.sets[0],{w:40,r:14,rir:4,done:true});const next=C.nextSetRecommendation(state,current,state.gyms[0]);assert.ok(next);assert.equal(next.weight,45);assert.equal(next.change,'increase');
 for(const name of ['Push-Up','Plank','Side Plank'])assert.equal(C.usesManualProgression(C.makeExercise(C.exerciseFor(name)),C.exerciseFor(name)),false);
});

test('band trends expose real reps and working-set counts without strength, load or weight-volume estimates',()=>{
 const state=history(),before=structuredClone(state);
 for(const requested of [undefined,'strength','weight','volume']){
  const model=progress(state,bandMeta,{metric:requested});assert.deepEqual(model.metrics.map(([id])=>id),['reps','sets']);assert.equal(model.selection.metric,'reps');assert.equal(model.unit,'reps');assert.equal(model.latest.value,12);assert.equal(model.points[0].value,10);assert.match(model.loadNote,/not pounds or kilograms/);
 }
 const sets=progress(state,bandMeta,{metric:'sets'});assert.equal(sets.unit,'sets');assert.equal(sets.latest.value,2);assert.equal(sets.points[0].value,2);assert.equal(sets.latest.sets.length,2);
 const html=progressPanel(progress(state));assert.match(html,/Acme light/);assert.doesNotMatch(html,/Estimated strength|Working volume|0 lb|0 kg/);assert.deepEqual(state,before);
});

test('a band record cannot turn an imported numeric field into an estimated maximum or weighted volume',()=>{
 const state=history();for(const log of Object.values(state.logs))for(const set of log.exercises[0].sets)set.w=123;
 const model=progress(state,bandMeta,{metric:'strength'});assert.equal(model.selection.metric,'reps');assert.equal(model.latest.value,12);assert.ok(model.metrics.every(([id])=>!['strength','weight','volume'].includes(id)));assert.doesNotMatch(progressPanel(model),/123 lb|123 kg|123 ×/);
});

test('manual seconds use duration and set counts without treating holds as weighted repetitions',()=>{
 const state=history(holdMeta);state.logs['2027-01-04'].exercises[0].sets=[row(12.5,{w:50})];state.logs['2027-01-11'].exercises[0].sets=[row(18.75,{w:80})];
 const model=progress(state,holdMeta,{metric:'volume'});assert.equal(model.selection.metric,'reps');assert.equal(model.unit,'sec');assert.equal(model.latest.value,18.75);assert.equal(model.change,6.25);assert.deepEqual(model.metrics.map(([id])=>id),['reps','sets']);const html=progressPanel(model);assert.match(html,/18.8 sec/);assert.doesNotMatch(html,/80 lb|80 kg|Estimated strength|Working volume/);
});

test('manual trends preserve archive, skipped and future exclusions and keep band labels escaped',()=>{
 const state=history(),sample=structuredClone(state.logs['2027-01-11']);
 for(const key of ['2027-01-11~copy','2027-01-13']){const log=structuredClone(sample);log.date=key==='2027-01-13'?key:'2027-01-11';state.logs[key]=log}
 state.logs['2027-01-06']={...structuredClone(sample),date:'2027-01-06',status:'skipped'};
 state.logs['2027-01-11'].exercises[0].sets[1].band='<img src=x onerror=alert(1)>';const before=structuredClone(state),model=progress(state);
 assert.equal(model.points.length,2);assert.equal(progressRecords(state,[bandMeta]).length,3);const html=progressPanel(model);assert.doesNotMatch(html,/<img src=x/);assert.match(html,/&lt;img src=x/);assert.deepEqual(state,before);
});

test('unit conversion preserves band brand, level, setup and unknown metadata without interpreting labels as kilograms',()=>{
 const state=history(),before=structuredClone(state),set=state.logs['2027-01-11'].exercises[0].sets[0];set.band='Brand red · printed 5 kg · anchor A';set.bandDetails={length:'short',unknown:'retain'};
 const expected=structuredClone(state),converted=C.convertLoadUnits(state,'kg'),after=converted.logs['2027-01-11'].exercises[0];assert.equal(after.loadMode,'band');assert.equal(after.manualProgression,true);assert.equal(after.sets[0].w,0);assert.equal(after.sets[0].band,set.band);assert.deepEqual(after.sets[0].bandDetails,set.bandDetails);assert.deepEqual(state,expected);assert.equal(before.profile.units,'lb');assert.equal(converted.profile.units,'kg');
});
