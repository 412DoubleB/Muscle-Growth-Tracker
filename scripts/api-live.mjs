import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const config=JSON.parse(await fs.readFile(new URL('../config.json',import.meta.url),'utf8'));
const url=config.supabase.url,headers={apikey:config.supabase.key,'Content-Type':'application/json'};
const checks=[];
for(const [name,path,method,body]of [
 ['Anonymous snapshot read denied','/rest/v1/mgt_beta_states?select=user_id','GET',undefined],
 ['Anonymous commit denied','/rest/v1/rpc/mgt_beta_commit','POST',{expected_version:0,payload:{}}],
 ['Unauthorized reminder call denied','/functions/v1/mgt-beta-send-reminders','POST',{}]
]){const r=await fetch(url+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});assert.ok([401,403].includes(r.status),name+' returned '+r.status);checks.push({name,status:r.status,passed:true})}
const settings=await fetch(url+'/auth/v1/settings',{headers});assert.equal(settings.status,200);const auth=await settings.json();checks.push({name:'Auth API reachable',status:settings.status,passed:true,emailEnabled:auth.external?.email,emailConfirmationRequired:!auth.mailer_autoconfirm});
await fs.writeFile(new URL('../docs/API_LIVE_RESULTS.json',import.meta.url),JSON.stringify({at:new Date().toISOString(),checks},null,2)+'\n');
console.log(JSON.stringify({passed:true,checks},null,2));
