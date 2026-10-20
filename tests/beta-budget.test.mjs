import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {GYM_AI_TRIAL_ID,reserveGymResearch,releaseGymResearch} from '../server/gym-research-budget.mjs';
import {BETA_CAMPAIGN_ID,BETA_CAPACITY,BETA_GLOBAL_LIMIT,readBetaStatus,readBetaMembership,enrollBetaMember,readBetaQuota,reserveBetaGymResearch,releaseBetaGymResearch} from '../server/beta-membership-budget.mjs';

const migrations=['0000_menei_gym_ai_trial.sql','0001_menei_beta_membership.sql'].map(file=>readFileSync(new URL('../drizzle/'+file,import.meta.url),'utf8'));
const start=1_000_000,owner='synthetic-owner',unavailable=/Beta membership and budget are unavailable/;
function d1(connection,statements=[]){return {prepare(sql){statements.push(sql);return {bind(...values){return {async first(){return connection.prepare(sql).get(...values)||null},async run(){const result=connection.prepare(sql).run(...values);return {success:true,meta:{changes:Number(result.changes)}}}}}}}}}
function fixture(t,{legacyUsed}={}){
 const directory=mkdtempSync(join(tmpdir(),'menei-beta-budget-')),path=join(directory,'synthetic.sqlite'),connections=[];
 const connect=()=>{const connection=new DatabaseSync(path);connection.exec('PRAGMA busy_timeout=5000');connections.push(connection);return connection};
 const connection=connect();for(const migration of migrations)connection.exec(migration);
 if(legacyUsed!==undefined)connection.prepare('INSERT INTO menei_gym_ai_trials(id,used) VALUES (?,?)').run(GYM_AI_TRIAL_ID,legacyUsed);
 t.after(()=>{for(const item of connections)item.close();rmSync(directory,{recursive:true,force:true})});
 return {connection,connect,db:d1(connection),rows:table=>connection.prepare('SELECT * FROM '+table).all().map(row=>({...row})),legacy:()=>({...connection.prepare('SELECT * FROM menei_gym_ai_trials WHERE id=?').get(GYM_AI_TRIAL_ID)})};
}
const bootstrap=f=>enrollBetaMember(f.db,owner,{bootstrap:true,now:start});
const snapshot=f=>Object.fromEntries(['menei_gym_ai_trials','menei_beta_campaigns','menei_beta_members','menei_beta_attempts'].map(table=>[table,f.rows(table)]));

test('schema-only migration and repeated GETs never enroll, bootstrap or initialize usage',async t=>{
 const f=fixture(t),statements=[],db=d1(f.connection,statements);
 assert.deepEqual(await readBetaStatus(db),{enrolled:0,capacity:20,remainingSlots:20,bootstrapClosed:false});
 for(let i=0;i<3;i++)assert.deepEqual(await readBetaMembership(db,'synthetic-visitor'),{member:false,role:null,enrolled:0,capacity:20,remainingSlots:20,bootstrapClosed:false});
 assert.ok(Object.values(snapshot(f)).every(rows=>rows.length===0));
 assert.ok(statements.every(sql=>/^SELECT\b/.test(sql)));
 assert.equal((await enrollBetaMember(db,'synthetic-visitor',{now:start})).reason,'bootstrap_required');
 assert.ok(Object.values(snapshot(f)).every(rows=>rows.length===0));
});

test('owner bootstrap is one-time, idempotent, includes the owner seat and preserves original records',async t=>{
 const f=fixture(t,{legacyUsed:3});
 f.connection.exec("CREATE TABLE synthetic_original_records(id TEXT PRIMARY KEY,payload TEXT); INSERT INTO synthetic_original_records VALUES ('existing','unchanged history');");
 f.connection.prepare('INSERT INTO menei_gym_ai_trials(id,used) VALUES (?,?)').run('synthetic-unrelated-trial',4);
 const old=f.rows('menei_gym_ai_trials'),original=f.rows('synthetic_original_records');
 const enrolled=await bootstrap(f);assert.equal(enrolled.admitted,true);assert.equal(enrolled.role,'owner');assert.equal(enrolled.enrolled,1);
 assert.equal((await bootstrap(f)).existing,true);
 assert.equal((await enrollBetaMember(f.db,'synthetic-second-owner',{bootstrap:true,now:start})).reason,'bootstrap_closed');
 assert.equal((await enrollBetaMember(f.db,'synthetic-regular',{now:start})).role,'member');
 assert.deepEqual(f.rows('menei_gym_ai_trials'),old);assert.deepEqual(f.rows('synthetic_original_records'),original);
 assert.deepEqual(await readBetaQuota(f.db,owner),{used:3,remaining:2,globalUsed:3,globalRemaining:97,limit:5,globalLimit:100});
 assert.equal((await readBetaQuota(f.db,'synthetic-regular')).used,0);
 for(const statement of ["DELETE FROM menei_beta_campaigns","UPDATE menei_beta_campaigns SET bootstrap_closed=0","DELETE FROM menei_beta_members","UPDATE menei_beta_members SET role='owner'"]){assert.throws(()=>f.connection.exec(statement))}
});

test('twenty-one concurrent visitors across independent connections leave exactly twenty durable members including owner',async t=>{
 const f=fixture(t);await bootstrap(f);
 const users=[owner,...Array.from({length:20},(_,i)=>'synthetic-visitor-'+i)];
 const results=await Promise.all(users.map(id=>enrollBetaMember(d1(f.connect()),id,{now:start+1})));
 assert.equal(results.filter(result=>result.admitted).length,BETA_CAPACITY);
 assert.equal(results.filter(result=>result.reason==='full').length,1);
 assert.equal(f.rows('menei_beta_members').length,BETA_CAPACITY);
 const admitted=users[results.findIndex(result=>result.role==='member')];
 const reserved=await reserveBetaGymResearch(f.db,admitted,{now:start+10,leaseId:'synthetic-persistent'});
 assert.equal(reserved.allowed,true);
 const restarted=await import('../server/beta-membership-budget.mjs?synthetic-restart'),db=d1(f.connect());
 assert.equal((await restarted.enrollBetaMember(db,admitted,{now:start+1_000_000})).existing,true);
 assert.equal((await restarted.readBetaQuota(db,admitted)).used,1);
 assert.equal((await restarted.readBetaMembership(db,admitted)).enrolled,20);
 assert.equal((await restarted.enrollBetaMember(db,'synthetic-overflow',{now:start+1_000_000})).reason,'full');
});

test('racing owner bootstrap calls create precisely one permanent owner and cannot race open enrollment',async t=>{
 const f=fixture(t);
 const results=await Promise.all(['synthetic-owner-a','synthetic-owner-b'].map(id=>enrollBetaMember(d1(f.connect()),id,{bootstrap:true,now:start})));
 assert.equal(results.filter(result=>result.admitted).length,1);assert.equal(results.filter(result=>result.reason==='bootstrap_closed').length,1);
 assert.equal(f.rows('menei_beta_campaigns').length,1);assert.equal(f.rows('menei_beta_members').length,1);
 const winner=f.rows('menei_beta_members')[0];assert.equal(winner.role,'owner');assert.equal(winner.site_user_id,f.rows('menei_beta_campaigns')[0].owner_user_id);
});

test('one atomic reservation spends a ledger entry before work and admits only one concurrent caller',async t=>{
 const f=fixture(t,{legacyUsed:2});await bootstrap(f);await enrollBetaMember(f.db,'synthetic-member',{now:start});
 const results=await Promise.all([owner,'synthetic-member'].map((id,i)=>reserveBetaGymResearch(d1(f.connect()),id,{now:start+1,leaseId:'synthetic-race-'+i})));
 assert.equal(results.filter(result=>result.allowed).length,1);assert.equal(results.filter(result=>result.reason==='busy').length,1);
 assert.equal(f.rows('menei_beta_attempts').length,1);assert.equal(f.legacy().used,2);
 const attempt=f.rows('menei_beta_attempts')[0],campaign=f.rows('menei_beta_campaigns')[0];
 assert.equal(campaign.lease_id,attempt.lease_id);assert.equal(f.legacy().lease_id,attempt.lease_id);
 assert.equal(campaign.lease_until,start+90_001);assert.equal(campaign.next_allowed_at,start+100_001);
 assert.equal((await readBetaQuota(f.db,owner)).globalUsed,3);
 for(const statement of ["DELETE FROM menei_beta_attempts","UPDATE menei_beta_attempts SET reserved_at=0","UPDATE menei_gym_ai_trials SET used=0 WHERE id='menei-gym-ai-trial-1'","DELETE FROM menei_gym_ai_trials WHERE id='menei-gym-ai-trial-1'"]){assert.throws(()=>f.connection.exec(statement))}
});

test('failures, timeouts and lost releases stay spent; cooldown boundaries and stale release are enforced',async t=>{
 const f=fixture(t);await bootstrap(f);
 const first=await reserveBetaGymResearch(f.db,owner,{now:start,leaseId:'synthetic-provider-failure'});assert.equal(first.allowed,true);
 // The simulated provider fails; release never deletes/refunds its ledger row.
 await releaseBetaGymResearch(f.db,first.leaseId,{now:start+2_000});
 assert.equal((await reserveBetaGymResearch(f.db,owner,{now:start+11_999,leaseId:'synthetic-cooldown'})).reason,'busy');
 const second=await reserveBetaGymResearch(f.db,owner,{now:start+12_000,leaseId:'synthetic-timeout'});assert.equal(second.allowed,true);
 for(const offset of [101_999,102_000,111_999])assert.equal((await reserveBetaGymResearch(f.db,owner,{now:start+offset,leaseId:'synthetic-blocked-'+offset})).reason,'busy');
 const third=await reserveBetaGymResearch(f.db,owner,{now:start+112_000,leaseId:'synthetic-newer'});assert.equal(third.used,3);
 const before=snapshot(f);assert.deepEqual(await releaseBetaGymResearch(f.db,second.leaseId,{now:start+112_001}),{released:false});assert.deepEqual(snapshot(f),before);
 assert.deepEqual(await releaseBetaGymResearch(f.db,third.leaseId,{now:start+112_002}),{released:true});
 const after=snapshot(f);assert.deepEqual(await releaseBetaGymResearch(f.db,third.leaseId,{now:start+500_000}),{released:false});assert.deepEqual(snapshot(f),after);
 assert.equal((await readBetaQuota(f.db,owner)).used,3);
});

test('legacy owner worker and beta worker share a lease without resetting or double-counting legacy spend',async t=>{
 const f=fixture(t);
 await reserveGymResearch(f.db,{now:start,leaseId:'synthetic-old-worker'});const original=f.legacy();await bootstrap(f);assert.deepEqual(f.legacy(),original);
 assert.equal((await reserveBetaGymResearch(f.db,owner,{now:start+1,leaseId:'synthetic-overlap'})).reason,'busy');
 await releaseGymResearch(f.db,'synthetic-old-worker',{now:start+2_000});
 const beta=await reserveBetaGymResearch(f.db,owner,{now:start+12_000,leaseId:'synthetic-beta-worker'});assert.equal(beta.used,2);assert.equal(f.legacy().used,1);
 assert.equal((await reserveGymResearch(f.db,{now:start+12_001,leaseId:'synthetic-old-overlap'})).reason,'busy');
 await releaseGymResearch(f.db,'synthetic-old-worker',{now:start+12_002});assert.equal(f.legacy().lease_id,beta.leaseId);
 await releaseBetaGymResearch(f.db,beta.leaseId,{now:start+13_000});
 for(let i=0;i<3;i++){const now=start+23_000+i*11_000,leaseId='synthetic-owner-'+i;assert.equal((await reserveBetaGymResearch(f.db,owner,{now,leaseId})).allowed,true);await releaseBetaGymResearch(f.db,leaseId,{now:now+1_000})}
 assert.equal((await readBetaQuota(f.db,owner)).used,5);assert.equal(f.legacy().used,1);
 await assert.rejects(reserveGymResearch(f.db,{now:start+1_000_000,leaseId:'synthetic-legacy-sixth'}),/unavailable/);
 assert.equal(f.legacy().used,1);
});

test('five per account and one hundred total include legacy owner attempts and persist across redeploys',async t=>{
 const f=fixture(t,{legacyUsed:3});await bootstrap(f);
 const users=[owner,...Array.from({length:19},(_,i)=>'synthetic-quota-'+i)];
 for(const id of users.slice(1))assert.equal((await enrollBetaMember(f.db,id,{now:start})).admitted,true);
 let sequence=0;
 for(const id of users){
  const allowance=id===owner?2:5;
  for(let i=0;i<allowance;i++){
   const now=start+(sequence++)*11_000,leaseId='synthetic-attempt-'+sequence;
   assert.equal((await reserveBetaGymResearch(d1(f.connect()),id,{now,leaseId})).allowed,true);
   await releaseBetaGymResearch(f.db,leaseId,{now:now+1_000});
  }
  assert.equal((await reserveBetaGymResearch(f.db,id,{now:start+sequence*11_000,leaseId:'synthetic-sixth-'+sequence})).reason,'limit');
 }
 assert.equal(f.rows('menei_beta_attempts').length,97);assert.equal(f.legacy().used,3);
 const before=snapshot(f),restarted=await import('../server/beta-membership-budget.mjs?synthetic-exhausted');
 for(const id of users){const q=await restarted.readBetaQuota(d1(f.connect()),id);assert.equal(q.used,5);assert.equal(q.globalUsed,BETA_GLOBAL_LIMIT);assert.equal(q.globalRemaining,0)}
 assert.equal((await restarted.reserveBetaGymResearch(d1(f.connect()),owner,{now:start+10_000_000,leaseId:'synthetic-extra'})).allowed,false);
 assert.deepEqual(snapshot(f),before);
});

test('an exhausted legacy owner keeps their seat while another member retains five attempts',async t=>{
 const f=fixture(t,{legacyUsed:5});await bootstrap(f);
 await enrollBetaMember(f.db,'synthetic-fresh-member',{now:start});
 assert.equal((await readBetaQuota(f.db,owner)).remaining,0);
 assert.equal((await reserveBetaGymResearch(f.db,owner,{now:start,leaseId:'synthetic-owner-exhausted'})).reason,'limit');
 const fresh=await reserveBetaGymResearch(f.db,'synthetic-fresh-member',{now:start,leaseId:'synthetic-fresh-member-attempt'});
 assert.equal(fresh.allowed,true);assert.equal(fresh.used,1);assert.equal(fresh.globalUsed,6);assert.equal(f.legacy().used,5);
});

test('a stale beta completion cannot release a newer legacy-worker lock after lease expiry',async t=>{
 const f=fixture(t);await bootstrap(f);
 await reserveBetaGymResearch(f.db,owner,{now:start,leaseId:'synthetic-beta-expired'});
 assert.equal((await reserveGymResearch(f.db,{now:start+100_000,leaseId:'synthetic-legacy-newer'})).allowed,true);
 assert.equal((await releaseBetaGymResearch(f.db,'synthetic-beta-expired',{now:start+100_001})).released,true);
 assert.equal(f.legacy().lease_id,'synthetic-legacy-newer');
 assert.equal((await reserveBetaGymResearch(f.db,owner,{now:start+110_001,leaseId:'synthetic-still-busy'})).reason,'busy');
 assert.equal((await readBetaQuota(f.db,owner)).used,2);
});

test('SQL statement rollback restores bootstrap and reservation locks without losing existing records',async t=>{
 const f=fixture(t,{legacyUsed:2}),before=snapshot(f);
 f.connection.exec("CREATE TRIGGER synthetic_abort_admission AFTER INSERT ON menei_beta_members BEGIN SELECT RAISE(ABORT,'synthetic rollback'); END");
 await assert.rejects(bootstrap(f),unavailable);assert.deepEqual(snapshot(f),before);
 f.connection.exec('DROP TRIGGER synthetic_abort_admission');await bootstrap(f);
 const ready=snapshot(f);
 f.connection.exec("CREATE TRIGGER synthetic_abort_attempt AFTER INSERT ON menei_beta_attempts BEGIN SELECT RAISE(ABORT,'synthetic rollback'); END");
 await assert.rejects(reserveBetaGymResearch(f.db,owner,{now:start,leaseId:'synthetic-rollback'}),unavailable);
 assert.deepEqual(snapshot(f),ready);
});

test('missing, partial, damaged or failed storage fails closed without spending attempts',async t=>{
 const f=fixture(t),empty=new DatabaseSync(':memory:');t.after(()=>empty.close());
 for(const db of [undefined,{},d1(empty),{prepare(){throw Error('synthetic D1 failure')}}]){
  await assert.rejects(readBetaStatus(db),unavailable);
  await assert.rejects(enrollBetaMember(db,owner,{bootstrap:true,now:start}),unavailable);
  await assert.rejects(reserveBetaGymResearch(db,owner,{now:start,leaseId:'synthetic-no-db'}),unavailable);
 }
 f.connection.prepare('INSERT INTO menei_gym_ai_trials(id,used) VALUES (?,?)').run(GYM_AI_TRIAL_ID,-1);
 const corrupt=snapshot(f);await assert.rejects(bootstrap(f),unavailable);await assert.rejects(readBetaStatus(f.db),unavailable);assert.deepEqual(snapshot(f),corrupt);
 f.connection.prepare('UPDATE menei_gym_ai_trials SET used=0 WHERE id=?').run(GYM_AI_TRIAL_ID);await bootstrap(f);
 f.connection.exec('DROP TRIGGER menei_beta_attempt_reserve');const missing=snapshot(f);
 await assert.rejects(readBetaMembership(f.db,owner),unavailable);await assert.rejects(reserveBetaGymResearch(f.db,owner,{now:start,leaseId:'synthetic-missing-trigger'}),unavailable);assert.deepEqual(snapshot(f),missing);
});

test('invalid identities, times and lease ids cannot enroll or mutate budget state',async t=>{
 const f=fixture(t);
 for(const id of ['',null,'bad\nidentity','x'.repeat(201)]){
  await assert.rejects(readBetaMembership(f.db,id),unavailable);
  await assert.rejects(enrollBetaMember(f.db,id,{bootstrap:true,now:start}),unavailable);
 }
 await bootstrap(f);const before=snapshot(f);
 for(const now of [NaN,Infinity,-1,1.5,Number.MAX_SAFE_INTEGER])await assert.rejects(reserveBetaGymResearch(f.db,owner,{now,leaseId:'synthetic-valid'}),unavailable);
 for(const leaseId of ['',null,'bad\nnonce','x'.repeat(201)]){
  await assert.rejects(reserveBetaGymResearch(f.db,owner,{now:start,leaseId}),unavailable);
  await assert.rejects(releaseBetaGymResearch(f.db,leaseId,{now:start}),unavailable);
 }
 assert.deepEqual(await reserveBetaGymResearch(f.db,'synthetic-outsider',{now:start,leaseId:'synthetic-outsider-lease'}),{allowed:false,reason:'not_member'});
 await assert.rejects(readBetaQuota(f.db,'synthetic-outsider'),unavailable);assert.deepEqual(snapshot(f),before);
 assert.equal(f.rows('menei_beta_campaigns')[0].id,BETA_CAMPAIGN_ID);
});
