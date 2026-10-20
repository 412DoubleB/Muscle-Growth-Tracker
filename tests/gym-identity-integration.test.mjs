import test from 'node:test';
import assert from 'node:assert/strict';
import {parseGymResearchResponse} from '../server/gym-research-provider.mjs';
import {buildGymAutofillPreview,applyGymAutofillPreview,gymLocationSignature} from '../gyms.mjs';
import {EQUIPMENT} from '../core.mjs';

// Fictional location and upstream response: these tests never use a provider or
// a saved account. Both server filtering and editable preview must agree.
const query={name:'synthetic fitness',location:'Riverton, Pa',address:'120 E Example St, Riverton, PA 15100'};
const source='https://fitness.example.com/riverton';
const checked='2026-10-20';
const candidate=()=>({name:'Synthetic Fitness Riverton',city:'Riverton, Pennsylvania',address:'120 East Example Street, Riverton, Pennsylvania 15100',operatingStatus:'open',url:source,equipment:[{name:'Dumbbells',detail:'This synthetic location source lists dumbbells; its maximum is unknown.',sourceUrl:source,max:null,unit:null}],unknown:['Exact models and weight limits']});
const raw=location=>({status:'completed',output:[{type:'web_search_call',status:'completed',action:{type:'search',sources:[{type:'url',url:source,title:'Synthetic location'}]}},{type:'message',role:'assistant',status:'completed',content:[{type:'output_text',text:JSON.stringify({locations:[location]}),annotations:[]}]}]});
const parse=(input=query,location=candidate())=>parseGymResearchResponse(raw(location),{query:input,allowedEquipment:EQUIPMENT,now:()=>new Date(checked)});

test('equivalent address formatting survives server filtering and review without changing saved signatures or records',()=>{
 const saved={inventory:['Bench','Manual item'],dbMax:75,notes:'Keep my notes'},before=structuredClone(saved);
 const signature=gymLocationSignature(query);
 assert.equal(signature,JSON.stringify(['synthetic fitness','riverton pa','120 e example st riverton pa 15100']));
 for(const input of [query,{...query,location:'Riverton Pennsylvania',address:'120 East Example Street, Riverton PA 15100-1234'}]){
  const response=parse(input);assert.equal(response.locations.length,1);
  const preview=buildGymAutofillPreview(saved,{query:input,gymType:'custom',research:response.locations[0],allowedEquipment:EQUIPMENT});
  assert.equal(preview.canApply,true,preview.reason);assert.equal(preview.dbMaxProposal,null);
  const draft=applyGymAutofillPreview(saved,preview,{query:input});
  assert.deepEqual(draft.inventory,['Bench','Manual item','Dumbbells']);assert.equal(draft.dbMax,75);assert.equal(draft.notes,saved.notes);
  assert.equal(preview.signature,gymLocationSignature(input));assert.equal(response.locations[0].complete,false);
 }
 assert.equal(gymLocationSignature(query),signature);assert.deepEqual(saved,before);
});

test('wrong street numbers, directions, cities and named branches remain rejected by both callers',()=>{
 for(const change of [item=>item.address='320 East Example Street, Riverton PA 15100',item=>item.address='120 West Example Street, Riverton PA 15100',item=>{item.city='Oakwood PA';item.address='120 East Example Street, Oakwood PA 15100'},item=>item.name='Another Fitness Riverton']){
  const location=candidate();change(location);assert.deepEqual(parse(query,location).locations,[]);
  const research={...location,checked,equipment:location.equipment.map(({max,unit,...item})=>({...item,status:'published',checked}))};
  assert.equal(buildGymAutofillPreview({inventory:[]},{query,gymType:'commercial',research,allowedEquipment:EQUIPMENT}).canApply,false);
 }
 const input={...query,name:'Synthetic Fitness North'};assert.deepEqual(parse(input).locations,[]);
});
