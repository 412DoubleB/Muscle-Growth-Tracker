import test from 'node:test';
import assert from 'node:assert/strict';
import {EQUIPMENT} from '../core.mjs';
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
});

test('existing published directory records validate without input mutation and preserve evidence fields',()=>{
 const original=structuredClone(location),input={...structuredClone(location),unknownEvidence:{retain:['original','metadata']}};
 const validated=validateGymResearch(input,options);
 assert.deepEqual(location,original);assert.equal(validated.complete,false);assert.deepEqual(validated.unknownEvidence,input.unknownEvidence);
 assert.equal(validated.equipment[0].sourceUrl,location.url);assert.equal(validated.equipment[0].checked,location.checked);assert.equal(validated.equipment[0].status,'published');
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
