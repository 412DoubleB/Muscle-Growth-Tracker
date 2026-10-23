import test from 'node:test';
import assert from 'node:assert/strict';
import {createLiveReminderHandler} from '../supabase/production/reminder-handler.mjs';
const url='https://tdmwpcueqxtnqyonucam.supabase.co',secret='s'.repeat(40);
function fixture({status='planned',claimed=true,project=url,sendStatus,auth=true}={}){
 const calls=[],sends=[],state={reminders:{enabled:true,workout:true,workoutTime:'18:00',workoutTimezone:'UTC'},plan:{'2026-10-23':{date:'2026-10-23',kind:'strength',title:'Synthetic lifting',status}},logs:{}};
 const sub={id:'synthetic-sub',user_id:'synthetic-member',endpoint:'https://fcm.googleapis.com/synthetic',subscription:{endpoint:'https://fcm.googleapis.com/synthetic'},preferences:{enabled:true}};
 const fetcher=async(target,options)=>{assert.ok(target.startsWith(url+'/rest/v1/'));calls.push({target,options});if(target.endsWith('/rpc/mgt_beta_reminder_config'))return new Response(JSON.stringify({mgt_beta_vapid_subject:'https://synthetic.invalid',mgt_beta_vapid_public:'synthetic-public',mgt_beta_vapid_private:'synthetic-private'}),{status:auth?200:403});if(target.includes('/mgt_beta_states?'))return new Response(JSON.stringify([{app_data:state}]));if(target.endsWith('/rpc/menei_live_push_claim'))return new Response(JSON.stringify(claimed?'synthetic-lease':null));if(target.endsWith('/rpc/menei_live_push_finish'))return new Response('true');if(options.method==='DELETE')return new Response(null,{status:204});if(target.includes('/mgt_beta_push?'))return new Response(JSON.stringify([sub]));assert.fail(target)};
 const handler=createLiveReminderHandler({env:{get:k=>k==='SUPABASE_URL'?project:k==='SUPABASE_SERVICE_ROLE_KEY'?'synthetic-service':undefined},fetcher,now:()=>new Date('2026-10-23T17:00:05Z'),webpush:{setVapidDetails(){},async sendNotification(subscription,payload,options){sends.push({subscription,payload,options});if(sendStatus)throw {statusCode:sendStatus}}}});
 return {calls,sends,invoke:(key=secret)=>handler(new Request('https://synthetic.invalid/job',{method:'POST',headers:{'x-cron-key':key}}))};
}
test('live scheduler uses one-hour logic for ordinary members and existing Vault/VAPID configuration',async()=>{
 const f=fixture(),r=await f.invoke();assert.equal(r.status,200);assert.equal((await r.json()).sent,1);assert.equal(f.sends.length,1);assert.match(JSON.parse(f.sends[0].payload).title,/Workout in 1 hour/);assert.deepEqual(f.sends[0].options,{TTL:900,timeout:10000,urgency:'high'});assert.ok(!f.calls.some(c=>/pilot|store_keys/.test(c.target)));const finish=f.calls.find(c=>c.target.endsWith('/menei_live_push_finish'));assert.equal(JSON.parse(finish.options.body).lease_token,'synthetic-lease');
});
test('completed/skipped work, duplicate claims, invalid cron and other project send nothing',async()=>{
 for(const opts of [{status:'completed'},{status:'skipped'},{claimed:false},{project:'https://other.supabase.co'},{auth:false}]){const f=fixture(opts);await f.invoke();assert.equal(f.sends.length,0)}
 const f=fixture();assert.equal((await f.invoke('bad')).status,401);assert.equal(f.calls.length,0);
});
test('expired subscriptions are removed but failures retain records and finish only their lease',async()=>{
 const expired=fixture({sendStatus:410});assert.equal((await expired.invoke()).status,200);assert.equal(expired.calls.filter(c=>c.options.method==='DELETE').length,1);
 const failed=fixture({sendStatus:503});assert.equal((await failed.invoke()).status,200);assert.equal(failed.calls.filter(c=>c.options.method==='DELETE').length,0);assert.equal(JSON.parse(failed.calls.find(c=>c.target.endsWith('/menei_live_push_finish')).options.body).delivered,false);
});
