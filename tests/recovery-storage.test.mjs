import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../core.mjs';
import {encodeRecoverySnapshots,readRecoverySnapshots} from '../recovery.mjs';
function memory(limit=Infinity){const rows=new Map();return {rows,getItem:k=>rows.get(k)??null,setItem(k,v){v=String(v);const next=new Map(rows);next.set(k,v);if([...next].reduce((n,[k,v])=>n+2*(k.length+v.length),0)>limit)throw new DOMException('Quota exceeded','QuotaExceededError');rows.set(k,v)},removeItem(){assert.fail('Recovery must never clear stored records')}}}
test('lossless recovery encoding retains legacy arrays, Unicode, unknown fields, zero loads and integrity checks',()=>{
 const list=[{at:'synthetic',state:{unknown:{'🏛️':'École / \u0000 😀',unpaired:'\ud800'},sets:[{w:0,r:8,rir:0,done:true}],missing:null}},{privateUnknown:['keep',false,0]}],plain=JSON.stringify(list),encoded=encodeRecoverySnapshots(list);assert.deepEqual(readRecoverySnapshots(plain),list);assert.deepEqual(readRecoverySnapshots(encoded),list);
 const damaged=JSON.parse(encoded);damaged.checksum='wrong';assert.throws(()=>readRecoverySnapshots(JSON.stringify(damaged)),/not been overwritten/);assert.throws(()=>readRecoverySnapshots('{bad'),/not been overwritten/);assert.deepEqual(readRecoverySnapshots(null),[]);
});
test('large full-workspace recovery fits when an uncompressed copy exceeds 5 MiB, without clearing other keys or histories',()=>{
 const storage=memory(5*1024*1024),store=new C.LocalStore(storage);store.load('account-a');const state=C.defaultState();state.legacySnapshots=[{id:'keep original',data:{unknown:'all original fields and photos stay retained 🏛️\n'.repeat(32000)}}];state.logs.synthetic={unknown:{w:0,rir:0,retained:true}};store.save(state);const before=C.clone(store.state);
 const old=JSON.stringify([{at:'old',state:C.defaultState(),unknown:'old copy retained'}]);storage.setItem('MGT_BETA_SNAPSHOTS:account-a',old);storage.setItem('MGT28v6','original untouched');storage.setItem('MGT_BETA_V8:account-b','other account untouched');const raw=storage.getItem('MGT_BETA_V8:account-a');assert.throws(()=>storage.setItem('MGT_BETA_SNAPSHOTS:account-a',JSON.stringify([{at:'new',state:before}])),{name:'QuotaExceededError'});
 store.snapshot();const list=store.recoverySnapshots();assert.deepEqual(list[0].state,before);assert.deepEqual(list[1],JSON.parse(old)[0]);assert.equal(storage.getItem('MGT_BETA_V8:account-a'),raw);assert.equal(storage.getItem('MGT28v6'),'original untouched');assert.equal(storage.getItem('MGT_BETA_V8:account-b'),'other account untouched');
 const next=C.clone(before);next.training.frequency=5;store.save(next);assert.equal(store.state.training.frequency,5);assert.deepEqual(store.recoverySnapshots()[0].state,before);
});
test('failed or unreadable recovery writes retain the old snapshot value and primary workspace',()=>{
 const storage=memory(),store=new C.LocalStore(storage);store.load();store.save(C.defaultState());storage.setItem('MGT_BETA_SNAPSHOTS:guest','[]');const before=[...storage.rows];storage.setItem=()=>{throw new DOMException('Quota exceeded','QuotaExceededError')};assert.throws(()=>store.snapshot(),/recovery copy could not be saved/);assert.deepEqual([...storage.rows],before);
 const corrupt=memory();corrupt.setItem('MGT_BETA_SNAPSHOTS:guest','{retain unreadable copy');const other=new C.LocalStore(corrupt);other.load();assert.throws(()=>other.snapshot(),/not been overwritten/);assert.equal(corrupt.getItem('MGT_BETA_SNAPSHOTS:guest'),'{retain unreadable copy');
});
