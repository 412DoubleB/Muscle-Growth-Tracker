// Synthetic, local WASM Postgres validation. Pass an installed PGlite module.
// No Supabase connection, credentials, device subscription or push is used.
import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
if(!process.argv[2])throw Error('Pass the absolute path to the installed PGlite module.');
const {PGlite}=await import(pathToFileURL(process.argv[2])),db=new PGlite();
try{
 await db.exec(`create role anon; create role authenticated; create role service_role;
 create table public.mgt_beta_push(id uuid primary key,last_slot text,lease_until timestamptz);
 grant select on public.mgt_beta_push to service_role;
 create function public.mgt_beta_reminder_config(text) returns jsonb language sql as 'select null::jsonb';
 create table public.synthetic_workouts(id integer primary key,payload jsonb);
 insert into public.synthetic_workouts values(1,'{"weight":0,"rir":0,"unknown":{"keep":true}}');
 insert into public.mgt_beta_push values('10000000-0000-4000-8000-000000000001','legacy-completed',null);`);
 const before=await db.query('select * from public.synthetic_workouts');
 await db.exec(await fs.readFile(new URL('../supabase/production/push-delivery.sql',import.meta.url),'utf8'));
 const id='10000000-0000-4000-8000-000000000001';
 const claim=async(kind,slot)=>(await db.query('select public.menei_live_push_claim($1,$2,$3) token',[id,kind,slot])).rows[0].token;
 const finish=async(kind,slot,token,delivered)=>(await db.query('select public.menei_live_push_finish($1,$2,$3,$4,$5) done',[id,kind,slot,token,delivered])).rows[0].done;
 await db.exec('set role service_role');
 const token=await claim('workout','day:18:00:UTC');assert.match(token,/^[a-f0-9-]{36}$/);
 assert.equal(await claim('workout','day:18:00:UTC'),null);
 assert.equal(await claim('workout','different-slot'),null);
 assert.equal(await finish('workout','day:18:00:UTC','20000000-0000-4000-8000-000000000001',true),false);
 assert.equal(await finish('workout','wrong-slot',token,true),false);
 assert.equal(await finish('workout','day:18:00:UTC',token,true),true);
 assert.equal(await claim('workout','day:18:00:UTC'),null);
 const testToken=await claim('test','test-1');assert.ok(testToken);assert.equal(await finish('test','test-1',testToken,true),true);
 assert.equal(await claim('workout','day:18:00:UTC'),null);
 const next=await claim('workout','next-day');assert.ok(next);assert.equal(await finish('workout','next-day',next,false),true);assert.ok(await claim('workout','next-day'));
 assert.equal(await claim('legacy','legacy-completed'),null);
 await assert.rejects(claim('invalid','slot'));
 await assert.rejects(claim('test',''));
 await db.exec('reset role');
 assert.deepEqual(await db.query('select * from public.synthetic_workouts'),before);
 const base=(await db.query('select * from public.mgt_beta_push')).rows;assert.equal(base.length,1);assert.equal(base[0].last_slot,'legacy-completed');assert.equal(base[0].lease_until,null);
 const rls=(await db.query("select relrowsecurity from pg_class where oid='public.menei_live_push_delivery'::regclass")).rows[0];assert.equal(rls.relrowsecurity,true);
 for(const role of ['anon','authenticated']){
  await db.exec('set role '+role);
  await assert.rejects(db.query('select * from public.menei_live_push_delivery'));
  await assert.rejects(claim('test','forbidden'));
  await assert.rejects(finish('test','test-1',testToken,true));
  await db.exec('reset role');
 }
 console.log('PASS: production SQL compiles/runs in local Postgres; service-only RLS, lease ownership, replay suppression, failed retry, independent test/workout slots, original legacy delivery and zero/unknown workout fields preserved. No remote mutation or push.');
}finally{await db.close()}
