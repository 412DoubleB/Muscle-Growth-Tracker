import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../core.mjs';
import {CloudSync} from '../cloud.mjs';
import {encodeSyncBase,readSyncBase,encodeRecoverySnapshots} from '../recovery.mjs';
const owner='quota-owner',project='bhyrrxrpqaxiwpfxnwpa',baseKey='MGT_BETA_SYNC_BASE:'+project+':'+owner,limit=5*1024*1024;
function memory(){const rows=new Map(),reads=[],writes=[];return {rows,reads,writes,get used(){return [...rows].reduce((n,[k,v])=>n+2*(k.length+v.length),0)},getItem(k){reads.push(k);return rows.get(k)??null},setItem(k,v){v=String(v);const next=new Map(rows);next.set(k,v);if([...next].reduce((n,[k,v])=>n+2*(k.length+v.length),0)>limit)throw new DOMException('Quota exceeded','QuotaExceededError');rows.set(k,v);writes.push(k)},removeItem(){assert.fail('Never clear a workspace or cache to make room')}}}
function setup(){
 const storage=memory(),state=C.defaultState();state.ownerId=owner;state.training={...state.training,mode:'automatic',startDate:'2026-10-22',supersetMode:'supersets'};state.legacySnapshots=[{id:'retained',data:{unknown:'every original field retained 🏛️\n'.repeat(22000)}}];state.logs['2026-10-21']={id:'2026-10-21',date:'2026-10-21',kind:'strength',status:'completed',exercises:[{...C.makeExercise(C.CATALOG[0]),sets:[{id:'checked',w:0,r:8,rir:0,done:true,unknown:{retain:true}}]}]};
 const store=new C.LocalStore(storage);store.load(owner);store.save(state);const base={state:C.clone(store.state),version:7,at:'synthetic',unknown:{retained:0}};storage.setItem(baseKey,JSON.stringify(base));storage.setItem('MGT_BETA_SNAPSHOTS:'+owner,encodeRecoverySnapshots([{at:'earlier',state:C.defaultState()}]));storage.setItem('MGT28v6','retain original bytes');storage.setItem('MGT_BETA_AUTH:'+project,'retain auth bytes');
 const otherKey='MGT_BETA_V8:another-account',free=limit-storage.used-2*otherKey.length-2048;storage.setItem(otherKey,'x'.repeat(Math.floor(free/2)));assert.ok(limit-storage.used<=2050);
 const cloud=new CloudSync({storage,disabled:true,allowedProject:project,getState:()=>store.state,applyState:s=>store.save(s)});cloud.disabled=false;cloud.session={user:{id:owner}};store.onQuota=()=>cloud.compactLocalSyncBase(store.scope);
 return {storage,store,cloud,base,otherKey};
}
test('the main 84-day Supersets workspace can save after compacting only its active account/project sync copy',()=>{
 const f=setup(),before=C.clone(f.store.state),oldMain=f.storage.getItem('MGT_BETA_V8:'+owner),other=f.storage.getItem(f.otherKey),auth=f.storage.getItem('MGT_BETA_AUTH:'+project);const next=C.clone(before);for(const d of C.generateProgram(next,{days:84}).days)next.plan[d.date]=C.packPlanDay(d);
 assert.throws(()=>f.storage.setItem('MGT_BETA_V8:'+owner,JSON.stringify(next)),{name:'QuotaExceededError'});f.storage.reads.length=0;f.storage.writes.length=0;f.store.save(next);
 assert.notEqual(f.storage.getItem('MGT_BETA_V8:'+owner),oldMain);const main=JSON.parse(f.storage.getItem('MGT_BETA_V8:'+owner));assert.equal(main.schemaVersion,8);assert.ok(main.plan['2027-01-13']);assert.deepEqual(main.logs,before.logs);assert.deepEqual(main.legacySnapshots,before.legacySnapshots);assert.deepEqual(readSyncBase(f.storage.getItem(baseKey)),f.base);assert.ok(f.storage.getItem(baseKey).length<JSON.stringify(f.base).length/4);assert.equal(f.storage.getItem(f.otherKey),other);assert.equal(f.storage.getItem('MGT28v6'),'retain original bytes');assert.equal(f.storage.getItem('MGT_BETA_AUTH:'+project),auth);assert.ok(f.storage.writes.every(k=>[baseKey,'MGT_BETA_V8:'+owner].includes(k)));assert.equal(f.storage.reads.includes('MGT_BETA_SYNC_BASE:another-account'),false);
});
test('snapshot quota can compact the same sync copy while retaining a full recovery snapshot',()=>{
 const f=setup(),before=C.clone(f.store.state);f.store.snapshot();assert.deepEqual(f.store.recoverySnapshots()[0].state,before);assert.deepEqual(readSyncBase(f.storage.getItem(baseKey)),f.base);assert.deepEqual(f.store.state,before);
});
test('wrong accounts, owner mismatch and disabled clients cannot compact another workspace',()=>{
 const f=setup(),before=[...f.storage.rows];assert.equal(f.cloud.compactLocalSyncBase('another-account'),false);f.cloud.session.user.id='another-account';assert.equal(f.cloud.compactLocalSyncBase(owner),false);f.cloud.session.user.id=owner;f.store.state.ownerId='another-account';assert.equal(f.cloud.compactLocalSyncBase(owner),false);f.store.state.ownerId=owner;f.cloud.disabled=true;assert.equal(f.cloud.compactLocalSyncBase(owner),false);assert.deepEqual([...f.storage.rows],before);
});
test('baseline compression retains revision, unknown data and Unicode, and corrupted copies fail closed',()=>{
 const base={state:{unknown:'value 🏛️'.repeat(2000),zero:0},version:13,at:'retain',unknown:{retain:true}},encoded=encodeSyncBase(base);assert.deepEqual(readSyncBase(encoded),base);assert.deepEqual(readSyncBase(JSON.stringify(base)),base);const damaged=JSON.parse(encoded);damaged.checksum='wrong';assert.throws(()=>readSyncBase(JSON.stringify(damaged)),/not cleared/);
 const f=setup();f.storage.setItem(baseKey,'{retain corrupt cache');const raw=f.storage.getItem(baseKey);assert.equal(f.cloud.compactLocalSyncBase(owner),false);assert.equal(f.storage.getItem(baseKey),raw);
});
