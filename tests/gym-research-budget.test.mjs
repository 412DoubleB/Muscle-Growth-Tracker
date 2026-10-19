import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {GYM_AI_TRIAL_ID,GYM_AI_TRIAL_LIMIT,readGymResearchQuota,reserveGymResearch,releaseGymResearch} from '../server/gym-research-budget.mjs';

// Only synthetic tests create the schema. Every production statement is executed
// by SQLite through the same prepare/bind/first/run shape used by D1.
const SCHEMA=`CREATE TABLE menei_gym_ai_trials (
 id TEXT PRIMARY KEY,
 used INTEGER NOT NULL DEFAULT 0,
 lease_id TEXT,
 lease_until INTEGER NOT NULL DEFAULT 0,
 next_allowed_at INTEGER NOT NULL DEFAULT 0
)`;
function d1(connection,statements=[]){return {prepare(sql){statements.push(sql);return {bind(...values){return {async first(){return connection.prepare(sql).get(...values)||null},async run(){const result=connection.prepare(sql).run(...values);return {success:true,meta:{changes:Number(result.changes)}}}}}}}}}
function fixture(t){
 const directory=mkdtempSync(join(tmpdir(),'menei-gym-budget-')),path=join(directory,'synthetic.sqlite'),connections=[];
 const connect=()=>{const connection=new DatabaseSync(path);connection.exec('PRAGMA busy_timeout=5000');connections.push(connection);return connection};
 const connection=connect();connection.exec(SCHEMA);
 t.after(()=>{for(const item of connections)item.close();rmSync(directory,{recursive:true,force:true})});
 return {connection,connect,db:d1(connection),row:()=>connection.prepare('SELECT * FROM menei_gym_ai_trials WHERE id=?').get(GYM_AI_TRIAL_ID)};
}
const start=1_000_000;

test('quota health reads a migrated empty table without initializing or reserving a trial',async t=>{
 const f=fixture(t),statements=[],db=d1(f.connection,statements);
 assert.deepEqual(await readGymResearchQuota(db),{used:0,remaining:5});
 assert.deepEqual(await readGymResearchQuota(db),{used:0,remaining:5});
 assert.equal(f.connection.prepare('SELECT count(*) AS count FROM menei_gym_ai_trials').get().count,0);
 assert.equal(statements.length,2);assert.ok(statements.every(sql=>/^SELECT used FROM menei_gym_ai_trials WHERE id=\?$/.test(sql)));
});

test('quota reports only the fixed global trial without changing its lease or usage',async t=>{
 const f=fixture(t);
 f.connection.prepare('INSERT INTO menei_gym_ai_trials(id,used) VALUES (?,?)').run('synthetic-unrelated-trial',5);
 assert.deepEqual(await readGymResearchQuota(f.db),{used:0,remaining:5});
 await reserveGymResearch(f.db,{now:start,leaseId:'synthetic-quota'});const active={...f.row()};
 assert.deepEqual(await readGymResearchQuota(f.db),{used:1,remaining:4});assert.deepEqual({...f.row()},active);
 for(const used of [0,5]){
  f.connection.prepare('UPDATE menei_gym_ai_trials SET used=? WHERE id=?').run(used,GYM_AI_TRIAL_ID);const before={...f.row()};
  assert.deepEqual(await readGymResearchQuota(f.db),{used,remaining:5-used});assert.deepEqual({...f.row()},before);
 }
});

test('quota health fails closed for missing bindings, schema, read errors and corrupt counters',async t=>{
 const f=fixture(t),message={message:'Gym research budget is unavailable.'};
 for(const db of [undefined,{}, {prepare(){throw Error('synthetic read error')}}])await assert.rejects(readGymResearchQuota(db),message);
 const missing=new DatabaseSync(':memory:');t.after(()=>missing.close());await assert.rejects(readGymResearchQuota(d1(missing)),message);
 f.connection.prepare('INSERT INTO menei_gym_ai_trials(id,used) VALUES (?,?)').run(GYM_AI_TRIAL_ID,-1);
 for(const used of [-1,6,1.25,'synthetic-corrupt']){
  f.connection.prepare('UPDATE menei_gym_ai_trials SET used=? WHERE id=?').run(used,GYM_AI_TRIAL_ID);const before={...f.row()};
  await assert.rejects(readGymResearchQuota(f.db),message);assert.deepEqual({...f.row()},before);
 }
 for(const row of [{},{used:null},{used:'1'}])await assert.rejects(readGymResearchQuota({prepare(){return {bind(){return {async first(){return row}}}}}}),message);
});

test('reservation atomically creates only the fixed global trial row and spends an attempt before outbound work',async t=>{
 const f=fixture(t),statements=[],db=d1(f.connection,statements);
 const result=await reserveGymResearch(db,{now:start,leaseId:'synthetic-first',trialId:'caller-cannot-reset',accountId:'synthetic-account-a'});
 assert.deepEqual(result,{allowed:true,leaseId:'synthetic-first',used:1});
 assert.deepEqual({...f.row()},{id:GYM_AI_TRIAL_ID,used:1,lease_id:'synthetic-first',lease_until:start+90_000,next_allowed_at:start+100_000});
 assert.equal(f.connection.prepare('SELECT count(*) AS count FROM menei_gym_ai_trials').get().count,1);
 assert.equal(statements.length,1);assert.match(statements[0],/^INSERT INTO/);assert.match(statements[0],/ON CONFLICT\(id\) DO UPDATE/);assert.match(statements[0],/RETURNING used/);
 assert.ok(statements.every(sql=>!/^\s*(CREATE|ALTER|DROP|DELETE)\b/i.test(sql)));
});

test('independent connections racing for one lease admit one caller and spend one attempt',async t=>{
 const f=fixture(t),other=d1(f.connect());
 const results=await Promise.all([reserveGymResearch(f.db,{now:start,leaseId:'synthetic-a'}),reserveGymResearch(other,{now:start,leaseId:'synthetic-b'})]);
 assert.equal(results.filter(item=>item.allowed).length,1);assert.equal(results.filter(item=>item.reason==='busy').length,1);assert.equal(f.row().used,1);
 assert.equal(f.row().lease_id,results.find(item=>item.allowed).leaseId);
});

test('provider failures and timeouts consume attempts; release only starts the completion cooldown',async t=>{
 const f=fixture(t);
 for(const [offset,failure]of [[0,new Error('synthetic provider failure')],[12_000,new Error('synthetic timeout')]]){
  const reserved=await reserveGymResearch(f.db,{now:start+offset,leaseId:'synthetic-'+offset});
  assert.equal(reserved.allowed,true);
  try{throw failure}catch(error){assert.equal(error,failure)}finally{await releaseGymResearch(f.db,reserved.leaseId,{now:start+offset+2_000})}
  assert.equal(f.row().used,offset===0?1:2);assert.equal(f.row().lease_id,null);assert.equal(f.row().next_allowed_at,start+offset+12_000);
 }
});

test('completion cooldown blocks until its exact boundary even after a slow completed request',async t=>{
 const f=fixture(t),reserved=await reserveGymResearch(f.db,{now:start,leaseId:'synthetic-slow'});
 await releaseGymResearch(f.db,reserved.leaseId,{now:start+35_000});
 assert.deepEqual(await reserveGymResearch(f.db,{now:start+44_999,leaseId:'synthetic-too-soon'}),{allowed:false,reason:'busy',used:1});
 assert.deepEqual(await reserveGymResearch(f.db,{now:start+45_000,leaseId:'synthetic-ready'}),{allowed:true,leaseId:'synthetic-ready',used:2});
});

test('a lost release holds the 90-second lease plus 10-second cooldown without refunding',async t=>{
 const f=fixture(t);await reserveGymResearch(f.db,{now:start,leaseId:'synthetic-lost'});
 for(const offset of [89_999,90_000,99_999])assert.deepEqual(await reserveGymResearch(f.db,{now:start+offset,leaseId:'synthetic-blocked-'+offset}),{allowed:false,reason:'busy',used:1});
 assert.deepEqual(await reserveGymResearch(f.db,{now:start+100_000,leaseId:'synthetic-after-expiry'}),{allowed:true,leaseId:'synthetic-after-expiry',used:2});
});

test('stale and replayed releases cannot unlock a newer lease or extend a completed cooldown',async t=>{
 const f=fixture(t);await reserveGymResearch(f.db,{now:start,leaseId:'synthetic-old'});await reserveGymResearch(f.db,{now:start+100_000,leaseId:'synthetic-new'});
 const active={...f.row()};assert.deepEqual(await releaseGymResearch(f.db,'synthetic-old',{now:start+100_001}),{released:false});assert.deepEqual({...f.row()},active);
 assert.deepEqual(await releaseGymResearch(f.db,'synthetic-new',{now:start+100_002}),{released:true});const released={...f.row()};
 assert.deepEqual(await releaseGymResearch(f.db,'synthetic-new',{now:start+200_000}),{released:false});assert.deepEqual({...f.row()},released);assert.equal(f.row().used,2);
});

test('five lifetime attempts remain exhausted across fresh modules, connections and caller accounts',async t=>{
 const f=fixture(t);
 for(let index=0;index<GYM_AI_TRIAL_LIMIT;index++){
  const now=start+index*20_000,leaseId='synthetic-trial-'+index;
  assert.deepEqual(await reserveGymResearch(d1(f.connect()),{now,leaseId,accountId:'synthetic-account-'+index,trialId:'synthetic-trial-'+index}),{allowed:true,leaseId,used:index+1});
  await releaseGymResearch(f.db,leaseId,{now:now+1_000});
 }
 const saved={...f.row()},restarted=await import('../server/gym-research-budget.mjs?synthetic-restart');
 assert.deepEqual(await restarted.reserveGymResearch(d1(f.connect()),{now:start+10_000_000,leaseId:'synthetic-sixth',accountId:'another-account'}),{allowed:false,reason:'limit',used:5});
 assert.deepEqual({...f.row()},saved);assert.equal(f.connection.prepare('SELECT count(*) AS count FROM menei_gym_ai_trials').get().count,1);
});

test('database absence, failed statements and corrupt counters fail closed',async t=>{
 const f=fixture(t),message={message:'Gym research budget is unavailable.'};
 for(const db of [undefined,{}, {prepare(){throw Error('synthetic SQL error')}},{prepare(){return {bind(){return {async first(){throw Error('synthetic D1 failure')}}}}}}])await assert.rejects(reserveGymResearch(db,{now:start,leaseId:'synthetic-db-error'}),message);
 const missing=new DatabaseSync(':memory:');t.after(()=>missing.close());await assert.rejects(reserveGymResearch(d1(missing),{now:start,leaseId:'synthetic-missing-table'}),message);
 f.connection.prepare('INSERT INTO menei_gym_ai_trials(id,used) VALUES (?,?)').run(GYM_AI_TRIAL_ID,-1);
 await assert.rejects(reserveGymResearch(f.db,{now:start,leaseId:'synthetic-corrupt'}),message);assert.equal(f.row().used,-1);
 await assert.rejects(releaseGymResearch({prepare(){return {bind(){return {async run(){return {success:false}}}}}}},'synthetic-release',{now:start}),message);
});

test('invalid times and lease identifiers never mutate the persistent row',async t=>{
 const f=fixture(t);
 for(const now of [NaN,Infinity,-1,1.5,Number.MAX_SAFE_INTEGER])await assert.rejects(reserveGymResearch(f.db,{now,leaseId:'synthetic-valid'}),/unavailable/);
 for(const leaseId of ['',null,'bad\nnonce','x'.repeat(201)]){
  await assert.rejects(reserveGymResearch(f.db,{now:start,leaseId}),/unavailable/);await assert.rejects(releaseGymResearch(f.db,leaseId,{now:start}),/unavailable/);
 }
 assert.equal(f.row(),undefined);
});
