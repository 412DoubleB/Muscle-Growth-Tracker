import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {ACCESSIBLE_EXERCISES,ACCESSIBLE_SOURCES,appendAccessibleExercises} from '../accessible-exercises.mjs';
import {buildCatalog,normalizeExerciseName} from '../catalog.mjs';
import {LEGACY_MASTERS,LEGACY_PLAN} from '../legacy.mjs';
import {supports,EQUIPMENT} from '../core.mjs';

const catalog=buildCatalog(LEGACY_MASTERS,LEGACY_PLAN);
const find=name=>{const exercise=catalog.find(item=>item.name===name);assert.ok(exercise,name);return exercise;};
const at=(name,inventory)=>supports(find(name),{inventory});

test('the complete original 197 exercise records remain byte-equivalent, including aliases and guide/media flags',()=>{
 // Generated from buildCatalog in source 8a6d0b7 before this additive extension.
 // This covers every serialized field, rather than checking only familiar IDs.
 const original=catalog.filter(exercise=>exercise.newFamily!=='accessible');
 assert.equal(original.length,197);
 assert.equal(createHash('sha256').update(JSON.stringify(original)).digest('hex'),'c6e32f982dfda496ee5a8587b57bb8125b96542fb48d7cc3f703964f158ea1ed');
 const input=JSON.stringify([LEGACY_MASTERS,LEGACY_PLAN]);buildCatalog(LEGACY_MASTERS,LEGACY_PLAN);assert.equal(JSON.stringify([LEGACY_MASTERS,LEGACY_PLAN]),input);
 assert.equal(new Set(catalog.map(exercise=>exercise.id)).size,catalog.length);
});

test('supported core, bodyweight and band options are real independent records with original guides and no borrowed photos',()=>{
 for(const name of ['Wall Plank','Seated Abdominal Brace','Supine Heel Slide','Dead Bug','Bird Dog','Bent-Knee Side Plank','Chair Sit-to-Stand','Wall Push-Up','Supported Standing Hamstring Curl','Seated Heel Raise','Seated Band Chest Press','Band Biceps Curl','Band Pallof Press'])assert.equal(find(name).newFamily,'accessible');
 for(const exercise of ACCESSIBLE_EXERCISES){
  assert.ok(['supported','standard','advanced'].includes(exercise.programmingTier),exercise.name);
  assert.equal(typeof exercise.floorRequired,'boolean');assert.equal(exercise.manualProgression,true);assert.equal(exercise.independentGuide,true);assert.equal(exercise.mediaNeedsVariantReview,true);
  assert.ok(['strength','mobility','balance'].includes(exercise.purpose));
  assert.ok(['reps','seconds'].includes(exercise.repUnit));assert.match(exercise.range,/^[1-9]\d*-[1-9]\d*$/);
  assert.ok(exercise.primary&&exercise.movement&&exercise.group&&exercise.muscleTags.length);
  for(const key of ['setup','cues','mistakes'])assert.ok(exercise[key].length>=2&&exercise[key].every(line=>typeof line==='string'&&line.length>10),`${exercise.name}: ${key}`);
  for(const key of ['mediaId','image','imageId','startImage','finishImage'])assert.equal(Object.hasOwn(exercise,key),false,`${exercise.name}: ${key}`);
 }
});

test('generic bands do not invent an anchor, ankle attachment, loop band or stable seat',()=>{
 assert.equal(at('Band Biceps Curl',['Resistance Bands']),true);
 assert.equal(at('Seated Band Biceps Curl',['Resistance Bands']),false);
 assert.equal(at('Seated Band Biceps Curl',['Resistance Bands','Stable Chair']),true);
 assert.equal(at('Standing Band Row',['Resistance Bands']),false);
 assert.equal(at('Standing Band Row',['Resistance Bands','Secure Band Anchor']),true);
 assert.equal(at('Seated Band Row',['Resistance Bands','Secure Band Anchor']),false);
 assert.equal(at('Seated Band Row',['Resistance Bands','Secure Band Anchor','Flat Bench']),true);
 assert.equal(at('Standing Band Hamstring Curl',['Resistance Bands','Secure Band Anchor','Wall']),false);
 assert.equal(at('Standing Band Hamstring Curl',['Resistance Bands','Secure Band Anchor','Band Ankle Attachment','Wall']),true);
 assert.equal(at('Seated Loop-Band Hip Abduction',['Resistance Bands','Stable Chair']),false);
 assert.equal(at('Seated Loop-Band Hip Abduction',['Loop Resistance Band','Stable Chair']),true);
 for(const equipment of ['Stable Chair','Stable Support','Wall','Secure Band Anchor','Band Ankle Attachment','Loop Resistance Band'])assert.ok(EQUIPMENT.includes(equipment),equipment);
});

test('supported variations require actual support while floor ability remains explicit metadata',()=>{
 assert.equal(at('Wall Push-Up',[]),false);assert.equal(at('Wall Push-Up',['Wall']),true);
 assert.equal(at('Chair Sit-to-Stand',[]),false);assert.equal(at('Chair Sit-to-Stand',['Bench']),true);
 assert.equal(at('Supported Mini Squat',['Resistance Bands']),false);assert.equal(at('Supported Mini Squat',['Stable Support']),true);
 assert.equal(find('Supine Abdominal Brace').floorRequired,true);assert.equal(find('Seated Abdominal Brace').floorRequired,false);
 assert.equal(find('Bird Dog').programmingTier,'standard');assert.equal(find('Quadruped Arm Reach').programmingTier,'supported');
 assert.equal(find('Dead Bug').floorRequired,true);assert.equal(find('Wall Plank').floorRequired,false);
});

test('hamstring curls, calves, core and bands keep correct anatomical and resistance semantics',()=>{
 for(const name of ['Supported Standing Hamstring Curl','Standing Band Hamstring Curl']){const exercise=find(name);assert.equal(exercise.group,'Legs');assert.equal(exercise.subgroup,'hamstrings');assert.equal(exercise.movement,'knee_flexion');assert.doesNotMatch(exercise.primary,/biceps/i);}
 assert.equal(find('Seated Heel Raise').primary,'Soleus');assert.equal(find('Wall Plank').group,'Core');assert.equal(find('Band Pallof Press').movement,'anti_rotation');
 for(const exercise of ACCESSIBLE_EXERCISES.filter(item=>item.loadMode==='band')){assert.ok(exercise.modalities.includes('bands'));assert.match(exercise.loadNote,/not a measured lb\/kg load/);assert.match(exercise.loadNote,/brand, level and setup/);}
 for(const name of ['Chair Sit-to-Stand','Wall Push-Up','Bodyweight Squat'])assert.ok(find(name).modalities.includes('calisthenics'));
});

test('warm-up and balance entries cannot masquerade as strength records',()=>{
 assert.equal(find('Supported March').purpose,'mobility');assert.equal(find('Seated March').purpose,'mobility');assert.equal(find('Wall Slide').purpose,'mobility');assert.equal(find('Supported Tandem Stand').purpose,'balance');
 assert.equal(find('Supported Tandem Stand').repUnit,'seconds');
 assert.equal(find('Wall Plank').repUnit,'seconds');assert.equal(find('Wall Plank').purpose,'strength');
});

test('append rejects collisions with old IDs and all normalized aliases without mutating shared data',()=>{
 const before=structuredClone(ACCESSIBLE_EXERCISES),old=[{id:'existing',name:'Existing',aliases:['Known variation']}];
 assert.throws(()=>appendAccessibleExercises(old,[{...before[0],id:'existing'}]),/duplicates/);
 assert.throws(()=>appendAccessibleExercises(old,[{...before[0],name:'KNOWN—VARIATION'}]),/duplicates/);
 assert.throws(()=>appendAccessibleExercises(old,[{...before[0],aliases:['  known variation  ']}]),/duplicates/);
 assert.throws(()=>appendAccessibleExercises([], [before[0],before[0]]),/duplicates/);
 const result=appendAccessibleExercises(old,[before[0]]);result[1].setup[0]='changed';result[1].equipmentRequirements[0][0]='changed';
 assert.deepEqual(ACCESSIBLE_EXERCISES,before);assert.deepEqual(old,[{id:'existing',name:'Existing',aliases:['Known variation']}]);
 const allNames=catalog.flatMap(exercise=>[exercise.name,...exercise.aliases].map(name=>[normalizeExerciseName(name),exercise.id])),owners=new Map();
 for(const [name,id] of allNames){if(owners.has(name))assert.equal(owners.get(name),id,`${name} cannot steal another exercise's history`);owners.set(name,id);}
});

test('all new exercise source credits resolve to explicit published references without implying copied programs',()=>{
 const sources=new Map(ACCESSIBLE_SOURCES.map(source=>[source.id,source]));assert.equal(sources.size,ACCESSIBLE_SOURCES.length);
 for(const exercise of ACCESSIBLE_EXERCISES){assert.ok(exercise.sourceIds.length>0);for(const id of exercise.sourceIds){assert.ok(sources.has(id),`${exercise.name}: ${id}`);assert.equal(new URL(sources.get(id).url).protocol,'https:');}}
});
