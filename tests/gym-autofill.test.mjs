import test from 'node:test';
import assert from 'node:assert/strict';
import {EQUIPMENT} from '../core.mjs';
import {ESTIMATED_EQUIPMENT} from '../gym-profiles.mjs';
import {GYM_DIRECTORY,GYM_TYPES,gymLocationSignature,sourceInfoMatchesGym,validateGymResearch,buildGymAutofillPreview,applyGymAutofillPreview} from '../gyms.mjs';

const options={allowedEquipment:EQUIPMENT};
const location=GYM_DIRECTORY[0],query={name:location.name,location:location.city,address:location.address};
const manual=()=>({id:'synthetic-gym',name:query.name,location:query.location,address:query.address,inventory:['Bench','Owner-entered apparatus'],dbMax:85,increment:2.5,notes:'Keep my exact notes',equipmentConfirmedAt:'2026-09-01T00:00:00.000Z',unknownPreference:{retain:0}});
const preview=(existing=manual(),extra={})=>buildGymAutofillPreview(existing,{query,gymType:'commercial',research:location,...options,...extra});

test('six gym-type profiles offer conservative estimates without claiming precise equipment or limits',()=>{
 assert.deepEqual(Object.keys(GYM_TYPES),['commercial','strength','hotel','home','workplace','custom']);
 for(const [gymType,profile]of Object.entries(GYM_TYPES)){
  const result=buildGymAutofillPreview(manual(),{query,gymType,...options});
  assert.deepEqual(result.items.map(item=>item.name),[...profile.estimates]);assert.ok(result.items.every(item=>item.status==='estimated'));assert.equal(result.dbMaxProposal,null);
  assert.ok(result.items.every(item=>!/(dual cable|cable crossover|attachment|handle)/i.test(item.name)));assert.equal(result.sourceInfo.complete,false);
 }
 assert.equal(Object.isFrozen(GYM_TYPES.commercial.estimates),true);
 assert.equal(GYM_TYPES.commercial.estimates.length,58);
 for(const name of ['Smith Machine','Kettlebells','Pec Deck / Chest Fly','Selectorized Shoulder Press','Biceps Curl Machine','Triceps Extension Machine','Treadmill','Stationary Bike','Elliptical','Rower','Stair Climber'])assert.ok(GYM_TYPES.commercial.estimates.includes(name));
 assert.ok(ESTIMATED_EQUIPMENT.every(name=>EQUIPMENT.includes(name)));assert.equal(new Set(ESTIMATED_EQUIPMENT).size,ESTIMATED_EQUIPMENT.length);assert.equal(Object.isFrozen(ESTIMATED_EQUIPMENT),true);
});

test('the fuller optional commercial proposal covers distinct generic machine groups without brand or alias inflation',()=>{
 const names=GYM_TYPES.commercial.estimates;
 const original23=['Dumbbells','Adjustable Bench','Barbell','Olympic Plates','Squat Rack','Single Cable Column','Lat Pulldown','Leg Press 45°','Leg Extension','Seated Leg Curl','Selectorized Chest Press','Seated Cable Row','Smith Machine','Kettlebells','Pec Deck / Chest Fly','Selectorized Shoulder Press','Biceps Curl Machine','Triceps Extension Machine','Treadmill','Stationary Bike','Elliptical','Rower','Stair Climber'];
 for(const name of original23)assert.ok(names.includes(name),'Keep existing common suggestion '+name);
 for(const group of [
  ['Plate-Loaded Chest Press','Plate-Loaded Incline Press','Plate-Loaded Decline Press','Plate-Loaded Shoulder Press'],
  ['Plate-Loaded Pulldown','Plate-Loaded Row','Chest-Supported Row Machine','Reverse Pec Deck'],
  ['Biceps Curl Machine','Preacher Curl Machine','Preacher Bench','Triceps Extension Machine'],
  ['Hip Abductor','Hip Adductor','Glute Drive / Hip Thrust','Glute Kickback Machine','Standing Calf Raise','Seated Calf Raise'],
  ['Horizontal / Seated Leg Press','Hack Squat','Lying Leg Curl','Ab Crunch Machine','Back Extension Machine','45° Back Extension'],
  ['Medicine Balls','Resistance Bands','Step / Plyo Box','Air Bike','Spin Bike']
 ])for(const name of group)assert.ok(names.includes(name),'Offer the editable common type '+name);
 assert.equal(new Set(names).size,58);assert.ok(names.every(name=>EQUIPMENT.includes(name)));
 for(const excluded of ['Bench','Flat Bench','Curl Bar','Half Rack','Squat Rack / Power Rack','Cable Station','Cable Attachments','Dual Cable / Functional Trainer','Cable Crossover','D-Handles','Rope Attachment','Pendulum Squat','Jacobs Ladder'])assert.equal(names.includes(excluded),false,'Do not inflate or infer '+excluded);
 assert.ok(names.every(name=>!/^Hammer Strength /.test(name)));
 assert.match(GYM_TYPES.commercial.note,/optional|estimated/i);assert.match(GYM_TYPES.commercial.note,/Review every item/);
});

test('the fuller commercial proposal leaves smaller gym-type suggestions unchanged',()=>{
 const smaller={strength:['Barbell','Olympic Plates','Adjustable Bench','Squat Rack','Dumbbells'],hotel:['Dumbbells'],home:[],workplace:['Dumbbells','Bench'],custom:[]};
 for(const [gymType,expected]of Object.entries(smaller)){
  assert.deepEqual(GYM_TYPES[gymType].estimates,expected);
  const proposal=buildGymAutofillPreview(manual(),{query,gymType,...options});assert.deepEqual(proposal.items.map(item=>item.name),expected);assert.equal(proposal.dbMaxProposal,null);
 }
});

test('existing published directory records validate without input mutation and preserve evidence fields',()=>{
 const original=structuredClone(location),input={...structuredClone(location),unknownEvidence:{retain:['original','metadata']}};
 const validated=validateGymResearch(input,options);
 assert.deepEqual(location,original);assert.equal(validated.complete,false);assert.deepEqual(validated.unknownEvidence,input.unknownEvidence);
 assert.equal(validated.equipment[0].sourceUrl,location.url);assert.equal(validated.equipment[0].checked,location.checked);assert.equal(validated.equipment[0].status,'published');
 assert.equal(Object.hasOwn(validated,'setup'),false);assert.equal(Object.hasOwn(validated,'estimatedEquipment'),false);
 validated.unknownEvidence.retain.push('new');assert.deepEqual(input.unknownEvidence,{retain:['original','metadata']});
});

test('published facts override profile estimates while current equipment and manual limits remain unchanged',()=>{
 const current=manual(),before=structuredClone(current),sourceBefore=structuredClone(location),result=preview(current);
 assert.equal(result.canApply,true);assert.equal(result.items.find(item=>item.name==='Dumbbells').status,'published');assert.equal(result.items.find(item=>item.name==='Adjustable Bench').status,'estimated');
 assert.equal(result.additions.includes('Dumbbells'),true);assert.equal(result.additions.includes('Kettlebells'),true);assert.equal(result.additions.includes('Lat Pulldown'),true);assert.equal(result.dbMaxProposal.value,120);assert.equal(result.dbMaxProposal.sourceUrl,location.url);
 const draft=applyGymAutofillPreview(current,result,{query,selectedEquipment:['Dumbbells']});
 assert.deepEqual(draft.inventory,['Bench','Owner-entered apparatus','Dumbbells']);assert.equal(draft.dbMax,85);assert.equal(draft.increment,2.5);assert.equal(draft.notes,current.notes);assert.deepEqual(draft.unknownPreference,current.unknownPreference);assert.equal(draft.equipmentConfirmedAt,null);
 assert.equal(draft.sourceInfo.equipment.length,2,'unchecked Kettlebells remain in the source evidence');assert.equal(draft.sourceInfo.equipment.some(item=>item.name==='Kettlebells'),true);assert.equal(draft.inventory.includes('Kettlebells'),false);
 assert.equal(draft.sourceInfo.estimates.some(item=>item.name==='Dumbbells'),false);assert.equal(draft.sourceInfo.estimates.some(item=>item.name==='Adjustable Bench'),true);assert.equal(sourceInfoMatchesGym(draft.sourceInfo,query),true);
 assert.deepEqual(draft.sourceInfo.identity,{name:'crunch pleasant hills',location:'pleasant hills pa',address:'601 clairton blvd suite 38 pleasant hills pa 15236'});
 assert.deepEqual(current,before);assert.deepEqual(location,sourceBefore);
});

test('manual edits made since preview survive applying its additions and explicit limit choices are separate',()=>{
 const current=manual();current.inventory.push('Dumbbells');const result=preview(current);
 const edited={...structuredClone(current),inventory:['Owner-entered apparatus','New manual item'],dbMax:92,notes:'Edited after research'};
 const draft=applyGymAutofillPreview(edited,result,{query});
 assert.deepEqual(draft.inventory,['Owner-entered apparatus','New manual item',...result.additions]);assert.equal(draft.dbMax,92);assert.equal(draft.notes,'Edited after research');
 assert.equal(draft.inventory.includes('Dumbbells'),false,'a manually unchecked item was already present at preview and is not silently re-added');
 const accepted=applyGymAutofillPreview(edited,result,{query,selectedEquipment:[],usePublishedDbMax:true});assert.equal(accepted.dbMax,120);assert.deepEqual(accepted.inventory,edited.inventory);assert.equal(accepted.equipmentConfirmedAt,null);
 const unchanged=applyGymAutofillPreview(current,result,{query,selectedEquipment:[]});assert.deepEqual(unchanged.inventory,current.inventory);assert.equal(unchanged.equipmentConfirmedAt,current.equipmentConfirmedAt);
 assert.throws(()=>applyGymAutofillPreview(edited,result,{query,selectedEquipment:['Unreviewed mystery machine']}));
});

test('nonmatching names, locations or street addresses never permit applying research',()=>{
 for(const mismatch of [{...query,name:'Another Gym'},{...query,location:'Monroeville, PA'},{...query,address:'3700 William Penn Hwy'}]){
  const result=preview(manual(),{query:mismatch});assert.equal(result.canApply,false);assert.match(result.reason,/does not match/);assert.throws(()=>applyGymAutofillPreview(manual(),result,{query:mismatch}));
 }
 const unspecified=preview(manual(),{query:{name:query.name}});assert.equal(unspecified.canApply,false);
});

test('closed and not-yet-open locations cannot apply even when a gym type offers estimates',()=>{
 const closed=GYM_DIRECTORY[1],closedQuery={name:closed.name,location:closed.city,address:closed.address};
 const result=preview(manual(),{query:closedQuery,research:closed});assert.equal(result.canApply,false);assert.ok(result.items.length>0);assert.match(result.reason,/closed or not yet open/);assert.throws(()=>applyGymAutofillPreview(manual(),result,{query:closedQuery}));
 const alternate=preview(manual(),{research:{...structuredClone(location),status:'Published location',operatingStatus:'temporarily_closed'}});assert.equal(alternate.canApply,false);
});

test('source signatures detect changed queries without treating spelling case and punctuation as a new location',()=>{
 const result=preview();assert.equal(gymLocationSignature(query),gymLocationSignature({...query,name:' CRUNCH Pleasant Hills ',location:'Pleasant Hills PA'}));
 for(const changed of [{...query,name:'Crunch Monroeville'},{...query,location:'Another City, PA'},{...query,address:'602 Clairton Blvd'}]){
  assert.equal(sourceInfoMatchesGym(result.sourceInfo,changed),false);assert.throws(()=>applyGymAutofillPreview(manual(),result,{query:changed}),/changed/);
 }
 assert.equal(sourceInfoMatchesGym({name:query.name,url:location.url},query),false,'older evidence without a request identity is not certified for a newly supplied location');
});

test('unknown equipment and inferred specific cable/attachment setups are rejected',()=>{
 for(const equipment of [[{name:'Mystery machine',status:'published',detail:'Unrecognized item'}],[{name:'Dual Cable / Functional Trainer',status:'estimated',detail:'Inferred from generic strength facilities'}],[{name:'D-Handles',status:'estimated',detail:'Inferred from a gym type'}]])assert.throws(()=>validateGymResearch({...structuredClone(location),equipment},options));
 assert.throws(()=>validateGymResearch({...structuredClone(location),equipment:[{name:'Dumbbells',detail:'Missing provenance'}]},options));
 assert.throws(()=>validateGymResearch(location,{allowedEquipment:['Bench']}));
});

test('published sources need safe HTTPS references and real checked dates',()=>{
 for(const url of ['javascript:alert(1)','http://example.com/equipment','https://name:password@example.com','https://localhost/source','https://127.0.0.1/source','https://internal.local/source'])assert.throws(()=>validateGymResearch({...structuredClone(location),url},options));
 for(const checked of ['2026-02-30','2026-13-01','not a date'])assert.throws(()=>validateGymResearch({...structuredClone(location),checked},options));
 assert.throws(()=>validateGymResearch({...structuredClone(location),url:'',checked:''},options));
 assert.throws(()=>validateGymResearch({...structuredClone(location),sources:[{url:'data:text/plain,source'}]},options));
});

test('structured research keeps extra source metadata and converts only an explicitly accepted published kilogram maximum',()=>{
 const research={...structuredClone(location),extraEvidence:{sourceNote:'Preserve this field'},equipment:[{name:'Dumbbells',status:'estimated',detail:'Generic strength profile suggestion'},{name:'Dumbbells',status:'published',detail:'Published as 40 kg each',max:40,unit:'kg',sourceUrl:'https://example.com/exact-location-equipment',checked:'2026-10-18',quoteReference:{section:'Free weights'}}]};
 const result=preview(manual(),{gymType:'strength',research});assert.equal(result.items.find(item=>item.name==='Dumbbells').status,'published');assert.equal(result.dbMaxProposal.value,88.18);assert.deepEqual(result.sourceInfo.extraEvidence,research.extraEvidence);assert.equal(result.sourceInfo.equipment.length,2);assert.deepEqual(result.sourceInfo.equipment[1].quoteReference,{section:'Free weights'});
 const draft=applyGymAutofillPreview(manual(),result,{query,selectedEquipment:[]});assert.equal(draft.dbMax,85);assert.equal(draft.sourceInfo.equipment.length,2);
 const accepted=applyGymAutofillPreview(manual(),result,{query,selectedEquipment:[],usePublishedDbMax:true});assert.equal(accepted.dbMax,88.18);
});

test('profile and location changes retain flat historical evidence without applying old claims to the new location',()=>{
 const current=applyGymAutofillPreview(manual(),preview(),{query,selectedEquipment:[]});
 current.sourceInfo.unknownEvidence={retain:['raw','source fields']};const oldSource=structuredClone(current.sourceInfo);
 const strength=buildGymAutofillPreview(current,{query,gymType:'strength',...options});
 const changed=applyGymAutofillPreview(current,strength,{query,selectedEquipment:[]});
 assert.deepEqual(changed.sourceInfo.priorEvidence,[oldSource]);assert.deepEqual(changed.sourceInfo.equipment,[]);assert.ok(changed.sourceInfo.estimates.every(item=>item.status==='estimated'));assert.equal(strength.dbMaxProposal,null);
 const repeated=applyGymAutofillPreview(changed,strength,{query,selectedEquipment:[]});assert.deepEqual(repeated.sourceInfo,changed.sourceInfo);assert.equal(repeated.sourceInfo.priorEvidence.length,1);
 const nextQuery={name:'Another Fitness',location:'Elsewhere, PA',address:'1 New Road, Elsewhere, PA 12345'},edited={...structuredClone(changed),...nextQuery};
 const hotel=buildGymAutofillPreview(edited,{query:nextQuery,gymType:'hotel',...options}),moved=applyGymAutofillPreview(edited,hotel,{query:nextQuery,selectedEquipment:[]});
 assert.equal(moved.sourceInfo.name,'Another Fitness');assert.equal(sourceInfoMatchesGym(moved.sourceInfo,nextQuery),true);assert.deepEqual(moved.sourceInfo.equipment,[]);
 assert.equal(moved.sourceInfo.priorEvidence.length,2);assert.deepEqual(moved.sourceInfo.priorEvidence[0],oldSource);assert.equal(moved.sourceInfo.priorEvidence.some(entry=>entry.name===location.name&&entry.equipment.length===2),true);assert.ok(moved.sourceInfo.priorEvidence.every(entry=>!Object.hasOwn(entry,'priorEvidence')));
 const repeatedMove=applyGymAutofillPreview(moved,hotel,{query:nextQuery,selectedEquipment:[]});assert.deepEqual(repeatedMove.sourceInfo,moved.sourceInfo);
 assert.deepEqual(current.sourceInfo,oldSource);
});

const widerSource='https://fitness.example.com/chain/equipment';
const widerEstimate=(name='Smith Machine')=>({name,detail:'Broader chain information suggests this common equipment; this branch is unconfirmed.',sourceUrl:widerSource,status:'estimated',checked:'2026-10-20',basis:'wider-web'});
const widerResearch=()=>({...structuredClone(location),setup:{gymType:'commercial',basis:'The broader chain source describes a commercial gym setup; individual branches vary.',sourceUrl:widerSource,checked:'2026-10-20'},estimatedEquipment:[widerEstimate()]});

test('cited setup and wider estimates validate without mutating or discarding original evidence',()=>{
 const input=widerResearch();input.sourceMetadata={keep:'Original evidence'};input.setup.originalMetadata={keep:0};input.estimatedEquipment[0].originalMetadata={keep:false};const before=structuredClone(input);
 const result=validateGymResearch(input,options);
 assert.deepEqual(input,before);assert.deepEqual(result.setup,input.setup);assert.deepEqual(result.estimatedEquipment,input.estimatedEquipment);assert.deepEqual(result.sourceMetadata,input.sourceMetadata);assert.equal(result.complete,false);
 result.estimatedEquipment[0].originalMetadata.keep=true;assert.equal(input.estimatedEquipment[0].originalMetadata.keep,false);
 const unknown=validateGymResearch({...structuredClone(location),setup:null,estimatedEquipment:[]},options);assert.equal(unknown.setup,null);assert.deepEqual(unknown.estimatedEquipment,[]);
});

test('wider estimates replace generic suggestions, published facts win and saved gym data stays untouched',()=>{
 const research=widerResearch();research.estimatedEquipment.push(widerEstimate('Dumbbells'));
 research.equipment.push({name:'Smith Machine',status:'estimated',detail:'Older generic suggestion'});
 const current=manual(),before=structuredClone(current),sourceBefore=structuredClone(research),result=preview(current,{research});
 const smith=result.items.find(item=>item.name==='Smith Machine'),dumbbells=result.items.find(item=>item.name==='Dumbbells');
 assert.deepEqual(smith,{...research.estimatedEquipment[0],alreadySelected:false});assert.equal(dumbbells.status,'published');assert.equal(dumbbells.max,120);assert.equal(result.items.filter(item=>item.name==='Dumbbells').length,1);
 assert.equal(result.items.find(item=>item.name==='Treadmill').basis,'commercial');assert.equal(result.dbMaxProposal.value,120);
 assert.deepEqual(result.sourceInfo.setup,research.setup);assert.deepEqual(result.sourceInfo.estimatedEquipment,research.estimatedEquipment);assert.deepEqual(result.sourceInfo.equipment,research.equipment.map(item=>item.status==='published'?{...item,sourceUrl:location.url,checked:location.checked,unit:item.max?'lb':item.unit}:item));
 assert.equal(result.sourceInfo.estimates.some(item=>item.name==='Dumbbells'),false);assert.equal(result.sourceInfo.estimates.find(item=>item.name==='Smith Machine').basis,'wider-web');
 const draft=applyGymAutofillPreview(current,result,{query,selectedEquipment:['Smith Machine']});
 assert.deepEqual(draft.inventory,['Bench','Owner-entered apparatus','Smith Machine']);assert.equal(draft.dbMax,85);assert.equal(draft.increment,2.5);assert.equal(draft.notes,current.notes);assert.deepEqual(draft.unknownPreference,current.unknownPreference);assert.deepEqual(current,before);assert.deepEqual(research,sourceBefore);
 assert.deepEqual(draft.sourceInfo.setup,research.setup);assert.deepEqual(draft.sourceInfo.estimatedEquipment,research.estimatedEquipment);
 const reloaded=buildGymAutofillPreview(draft,{query,gymType:'commercial',research:JSON.parse(JSON.stringify(draft.sourceInfo)),...options});assert.equal(reloaded.items.find(item=>item.name==='Smith Machine').alreadySelected,true);assert.equal(reloaded.items.find(item=>item.name==='Smith Machine').sourceUrl,widerSource);
});

test('wider estimates never supply quantitative limits and cannot replace an explicit selected profile',()=>{
 const research=widerResearch(),result=preview(manual(),{gymType:'hotel',research});
 assert.equal(result.gymType,'hotel');assert.deepEqual(result.items.map(item=>item.name),['Dumbbells','Kettlebells','Smith Machine']);assert.equal(result.items.some(item=>item.name==='Treadmill'),false);
 const estimatesOnly={...research,equipment:[],estimatedEquipment:[widerEstimate('Dumbbells')]},noLimit=preview(manual(),{research:estimatesOnly});assert.equal(noLimit.dbMaxProposal,null);
 const draft=applyGymAutofillPreview(manual(),noLimit,{query,selectedEquipment:['Dumbbells']});assert.equal(draft.dbMax,85);assert.throws(()=>applyGymAutofillPreview(manual(),noLimit,{query,usePublishedDbMax:true}),/published dumbbell maximum/);
 for(const field of ['max','unit'])for(const value of [null,undefined,field==='max'?100:'lb']){
  const wider=widerResearch();wider.estimatedEquipment[0][field]=value;assert.throws(()=>validateGymResearch(wider,options),/Estimated equipment/);
  const legacy={...structuredClone(location),equipment:[{name:'Dumbbells',status:'estimated',detail:'Common estimate',[field]:value}]};assert.throws(()=>validateGymResearch(legacy,options),/Estimated equipment/);
 }
});

test('cited wider sources may suggest canonical specialist equipment without turning it into a branch fact',()=>{
 const input=widerResearch();input.estimatedEquipment=[{...widerEstimate('Dual Cable / Functional Trainer'),detail:'The synthetic chain source describes independent pulleys; this branch is unconfirmed.'},{...widerEstimate('D-Handles'),detail:'The synthetic chain source explicitly lists this attachment; this branch is unconfirmed.'}];
 const validated=validateGymResearch(input,options),result=preview(manual(),{gymType:'custom',research:validated});
 for(const name of ['Dual Cable / Functional Trainer','D-Handles']){
  const item=result.items.find(item=>item.name===name);assert.equal(item.status,'estimated');assert.equal(item.basis,'wider-web');assert.equal(item.sourceUrl,widerSource);assert.equal(item.checked,'2026-10-20');assert.equal(Object.hasOwn(item,'max'),false);assert.equal(result.sourceInfo.estimates.some(estimate=>estimate.name===name),true);assert.equal(result.sourceInfo.equipment.some(equipment=>equipment.name===name),false);
  assert.equal(ESTIMATED_EQUIPMENT.includes(name),false);
  assert.throws(()=>validateGymResearch({...structuredClone(location),equipment:[{name,status:'estimated',detail:'Inferred only from a common gym type.'}]},options),/Specific equipment and attachments/);
 }
 assert.equal(result.sourceInfo.complete,false);
});

test('explicit sourced Hammer Strength variants coexist with the generic commercial proposal without automatic branding or saved-data changes',()=>{
 const current=manual(),before=structuredClone(current),research=widerResearch();
 const publishedName='Hammer Strength Incline Press',estimatedName='Hammer Strength High Row',branchSource='https://fitness.example.com/exact-branch/equipment';
 research.equipment.push({name:publishedName,status:'published',detail:'The synthetic branch source explicitly identifies this branded incline press.',sourceUrl:branchSource,checked:'2026-10-20'});
 research.estimatedEquipment=[{...widerEstimate(estimatedName),detail:'The synthetic broader chain source identifies this branded high row; this branch is unconfirmed.'}];
 const sourceBefore=structuredClone(research),proposal=preview(current,{research});
 assert.equal(proposal.items.length,60);assert.ok(proposal.items.some(item=>item.name==='Plate-Loaded Incline Press'&&item.status==='estimated'));assert.ok(proposal.items.some(item=>item.name==='Plate-Loaded Row'&&item.status==='estimated'));
 const published=proposal.items.find(item=>item.name===publishedName),estimated=proposal.items.find(item=>item.name===estimatedName);
 assert.equal(published.status,'published');assert.equal(published.sourceUrl,branchSource);assert.equal(published.checked,'2026-10-20');
 assert.equal(estimated.status,'estimated');assert.equal(estimated.basis,'wider-web');assert.equal(estimated.sourceUrl,widerSource);assert.equal(estimated.checked,'2026-10-20');assert.equal(Object.hasOwn(estimated,'max'),false);assert.equal(Object.hasOwn(estimated,'unit'),false);
 for(const name of EQUIPMENT.filter(name=>/^Hammer Strength /.test(name))){assert.equal(GYM_TYPES.commercial.estimates.includes(name),false);assert.equal(ESTIMATED_EQUIPMENT.includes(name),false);if(![publishedName,estimatedName].includes(name))assert.equal(proposal.items.some(item=>item.name===name),false)}
 assert.deepEqual(current,before);assert.deepEqual(research,sourceBefore);assert.equal(proposal.sourceInfo.complete,false);
 const draft=applyGymAutofillPreview(current,proposal,{query,selectedEquipment:[publishedName,estimatedName]});
 assert.deepEqual(draft.inventory,['Bench','Owner-entered apparatus',publishedName,estimatedName]);assert.equal(draft.dbMax,85);assert.equal(draft.increment,2.5);assert.equal(draft.notes,before.notes);assert.deepEqual(draft.unknownPreference,before.unknownPreference);assert.deepEqual(current,before);
 assert.equal(draft.sourceInfo.equipment.find(item=>item.name===publishedName).sourceUrl,branchSource);assert.equal(draft.sourceInfo.estimates.find(item=>item.name===estimatedName).sourceUrl,widerSource);assert.equal(draft.sourceInfo.estimates.some(item=>item.name===publishedName),false);
 const withoutResearch=preview(current,{research:null});assert.equal(withoutResearch.items.length,58);assert.ok(withoutResearch.items.every(item=>item.status==='estimated'&&!/^Hammer Strength /.test(item.name)));assert.equal(withoutResearch.dbMaxProposal,null);assert.equal(withoutResearch.sourceInfo.complete,false);
});

test('setup and wider estimate fields reject malformed provenance without changing old records',()=>{
 for(const change of [r=>r.setup=undefined,r=>r.setup=[],r=>r.setup.gymType='unknown',r=>r.setup.basis='',r=>r.setup.basis='x'.repeat(401),r=>r.setup.sourceUrl='http://fitness.example.com/source',r=>r.setup.checked='2026-02-30',r=>delete r.setup.checked,r=>r.estimatedEquipment=null,r=>r.estimatedEquipment=Array(13).fill(widerEstimate()),r=>r.estimatedEquipment.push(widerEstimate()),r=>r.estimatedEquipment[0].status='published',r=>r.estimatedEquipment[0].basis='physical audit',r=>r.estimatedEquipment[0].name='Unknown apparatus',r=>r.estimatedEquipment[0].detail='x'.repeat(401),r=>r.estimatedEquipment[0].sourceUrl='javascript:alert(1)',r=>delete r.estimatedEquipment[0].sourceUrl,r=>r.estimatedEquipment[0].checked='2026-13-01',r=>delete r.estimatedEquipment[0].checked]){
  const input=widerResearch();change(input);const before=structuredClone(input);assert.throws(()=>validateGymResearch(input,options));assert.deepEqual(input,before);
 }
 const closed=widerResearch();closed.operatingStatus='closed';assert.equal(preview(manual(),{research:closed}).canApply,false);
 const changed={...query,address:'999 Another Street, Pleasant Hills PA 15236'};assert.equal(preview(manual(),{research:widerResearch(),query:changed}).canApply,false);
});
