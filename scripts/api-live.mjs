import assert from 'node:assert/strict';
import {isolatedTestConfig} from './isolated-backend.mjs';
const target=await isolatedTestConfig();
if(!target){console.log('SKIPPED: isolated test project is not configured.');process.exit(0)}
const url=target.url,headers={apikey:target.key,'Content-Type':'application/json'};
const checks=[];
for(const [name,path,method,body]of [
 ['Anonymous snapshot read denied','/rest/v1/mgt_beta_states?select=user_id','GET',undefined],
 ['Anonymous commit denied','/rest/v1/rpc/mgt_beta_commit','POST',{expected_version:0,payload:{}}],
 ...(process.env.MENEI_TEST_REMINDER_FUNCTION?[['Unauthorized reminder call denied','/functions/v1/'+encodeURIComponent(process.env.MENEI_TEST_REMINDER_FUNCTION),'POST',{}]]:[])
]){const r=await fetch(url+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});assert.ok([401,403].includes(r.status),name+' returned '+r.status);checks.push({name,status:r.status,passed:true})}
const settings=await fetch(url+'/auth/v1/settings',{headers});assert.equal(settings.status,200);const auth=await settings.json();checks.push({name:'Auth API reachable',status:settings.status,passed:true,emailEnabled:auth.external?.email,emailConfirmationRequired:!auth.mailer_autoconfirm});
console.log(JSON.stringify({passed:true,projectRef:target.projectRef,checks,reminderAuthorizationCheckPerformed:!!process.env.MENEI_TEST_REMINDER_FUNCTION},null,2));
