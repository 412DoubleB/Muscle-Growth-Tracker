import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../core.mjs';
import {prepareDeviceUpgrade,commitDeviceUpgrade,originalDeviceBackup} from '../upgrade.mjs';

function memory(values={}){const rows=new Map(Object.entries(values));return {getItem:key=>rows.get(key)??null,setItem:(key,value)=>rows.set(key,String(value)),removeItem:()=>{throw Error('Migration must never remove data')},rows}}
function original(){return {logs:{'0-0':{planIndex:0,actualDate:'2026-10-01',gym:'Crunch Pleasant Hills',completed:true,customNote:'Keep this record',ex:[{name:'Flat DB press',range:'8-10',sets:[{w:0,r:10,i:2},{w:50,r:9,i:1},{w:'',r:'',i:''}]}]}},gyms:[{name:'Crunch Pleasant Hills',inventory:['Dumbbells','Bench'],dbMax:120}],profile:{name:'Test member',units:'lb',skinTone:'tan'},training:{mode:'Current Program',frequency:4},nutrition:{calories:2400,protein:200},recipes:[{id:'family',name:'Family meal',servings:3,steps:['Keep all directions']}],meals:{'2026-10-01':[{id:'lunch',recipeId:'family',servings:1}]},pantry:[{name:'Rice',qty:2,unit:'kg'}],unknown:{notes:'Preserve unknown fields in original snapshot'}}}

test('first launch copies original history, completion, zero loads, settings and food data without mutating the old app',()=>{
 const raw=original(),text=JSON.stringify(raw),storage=memory({MGT28v6:text,'unrelated-app':'keep'}),current=C.defaultState(),before=C.clone(current);
 const result=prepareDeviceUpgrade(current,storage);assert.equal(result.count,1);assert.equal(result.changed,true);assert.deepEqual(current,before);assert.equal(storage.getItem('MGT28v6'),text);assert.equal(storage.getItem('unrelated-app'),'keep');assert.equal(storage.rows.size,2);
 const log=result.state.logs['2026-10-01'];assert.equal(log.status,'completed');assert.equal(log.exercises[0].sets[0].w,0);assert.equal(log.exercises[0].sets[0].done,true);assert.equal(log.exercises[0].sets[1].rir,1);assert.equal(log.customNote,'Keep this record');assert.deepEqual(result.state.legacySnapshots[0].data.unknown,raw.unknown);assert.equal(result.state.profile.name,'Test member');assert.equal(result.state.recipes[0].servings,3);assert.equal(result.state.meals['2026-10-01'].items.length,1);assert.equal(result.state.pantry.length,1);C.validateState(result.state);
});
test('migration prefers v6, falls back to v5 only when v6 is absent, and reads no auth values',()=>{
 const v6=original(),v5=original();v5.logs['0-0'].ex[0].sets[0].w=999;const storage=memory({MGT28v6:JSON.stringify(v6),MGT28v5:JSON.stringify(v5)}),seen=[],read=storage.getItem;storage.getItem=key=>{seen.push(key);return read(key)};
 assert.equal(prepareDeviceUpgrade(C.defaultState(),storage).state.logs['2026-10-01'].exercises[0].sets[0].w,0);assert.ok(seen.every(key=>['MGT28v6','MGT28v5'].includes(key)));
 const fallback=memory({MGT28v5:JSON.stringify(v5)});assert.equal(prepareDeviceUpgrade(C.defaultState(),fallback).state.logs['2026-10-01'].exercises[0].sets[0].w,999);assert.equal(originalDeviceBackup(memory()),null);
});
test('migration commits to one new V8 value and reopening never duplicates history',()=>{
 const raw=JSON.stringify(original()),storage=memory({MGT28v6:raw}),store=new C.LocalStore(storage);store.load();const first=commitDeviceUpgrade(store,storage);assert.equal(first.count,1);assert.ok(storage.getItem('MGT_BETA_V8:guest'));assert.equal(storage.getItem('MGT28v6'),raw);
 store.load();const second=commitDeviceUpgrade(store,storage);assert.equal(second.changed,false);assert.equal(Object.keys(second.state.logs).length,1);assert.equal(second.state.recipes.length,1);assert.equal(second.state.pantry.length,1);
});
test('existing V8 history/settings win while conflicting original workouts are retained',()=>{
 const raw=original(),current=C.defaultState();current.profile.name='New V8 profile';current.training.split='ppl';current.gyms[0].inventory=['Dumbbells'];current.logs['2026-10-01']={id:'2026-10-01',date:'2026-10-01',gymId:'crunch',exercises:[C.makeExercise(C.exerciseFor('Incline DB press'))]};current.logs['2026-10-01'].exercises[0].sets[0].w=75;
 const result=prepareDeviceUpgrade(current,memory({MGT28v6:JSON.stringify(raw)}),{hasCurrentState:true});assert.equal(result.state.profile.name,'New V8 profile');assert.equal(result.state.training.split,'ppl');assert.deepEqual(result.state.gyms,current.gyms);assert.deepEqual(result.state.logs['2026-10-01'],current.logs['2026-10-01']);assert.equal(Object.keys(result.state.logs).length,2);assert.equal(result.state.conflicts.length,1);assert.equal(result.state.ownerId,current.ownerId);
});
test('a first upgrade keeps kilograms while an existing V8 workspace keeps its chosen display units',()=>{
 const raw=original();raw.profile.units='kg';raw.profile.weight=90;raw.logs['0-0'].ex[0].sets[0].w=60;const storage=memory({MGT28v6:JSON.stringify(raw)});
 const first=prepareDeviceUpgrade(C.defaultState(),storage).state;assert.equal(first.profile.units,'kg');assert.equal(first.profile.weight,90);assert.equal(first.logs['2026-10-01'].exercises[0].sets[0].w,60);
 const current=C.defaultState(),merged=prepareDeviceUpgrade(current,storage,{hasCurrentState:true}).state;assert.equal(merged.profile.units,'lb');assert.equal(merged.logs['2026-10-01'].exercises[0].sets[0].w,132.28);
});
test('an already manually imported original snapshot is not imported again during startup',()=>{
 const raw=original(),state=C.importSnapshot(C.defaultState(),raw).state,result=prepareDeviceUpgrade(state,memory({MGT28v6:JSON.stringify(raw)}),{hasCurrentState:true});assert.equal(result.changed,false);assert.equal(Object.keys(result.state.logs).length,1);
});
test('parse or validation failure stops the upgrade and preserves exact original bytes',()=>{
 for(const text of ['{broken',JSON.stringify({logs:{}})]){const storage=memory({MGT28v6:text}),store=new C.LocalStore(storage);store.load();assert.throws(()=>commitDeviceUpgrade(store,storage),/original records are still intact/);assert.equal(storage.getItem('MGT28v6'),text);assert.equal(storage.getItem('MGT_BETA_V8:guest'),null);assert.equal(originalDeviceBackup(storage).text,text)}
});
test('quota failure cannot erase the old data or replace an existing V8 workspace',()=>{
 const current=C.defaultState();current.profile.name='Keep this V8 workspace';const saved=JSON.stringify(current),legacy=JSON.stringify(original()),storage=memory({MGT28v6:legacy,'MGT_BETA_V8:guest':saved});storage.setItem=()=>{throw Error('quota exceeded')};const store=new C.LocalStore(storage);store.load();const before=C.clone(store.state);assert.throws(()=>commitDeviceUpgrade(store,storage),/quota exceeded/);assert.equal(storage.getItem('MGT28v6'),legacy);assert.equal(storage.getItem('MGT_BETA_V8:guest'),saved);assert.deepEqual(store.state,before);
});
test('signed-in accounts stay isolated: shared legacy history is staged in guest until explicitly imported',()=>{
 const storage=memory({MGT28v6:JSON.stringify(original()),'MGT_BETA_V8:other':JSON.stringify(C.defaultState())}),other=storage.getItem('MGT_BETA_V8:other'),store=new C.LocalStore(storage);store.load('my-account');const current=C.clone(store.state),result=commitDeviceUpgrade(store,storage);assert.equal(storage.getItem('MGT_BETA_V8:other'),other);assert.equal(storage.getItem('MGT_BETA_V8:my-account'),null);assert.ok(storage.getItem('MGT_BETA_V8:guest'));assert.deepEqual(result.state,current);assert.equal(result.status,'staged-in-guest');
});
