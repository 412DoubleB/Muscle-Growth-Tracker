// Opt-in live acceptance check. Supply two dedicated confirmed beta accounts through env.
// The script creates an empty beta snapshot only if that test account has no existing one.
import assert from 'node:assert/strict';
import {defaultState} from '../core.mjs';
const required=['SUPABASE_URL','SUPABASE_PUBLISHABLE_KEY','MGT_TEST_EMAIL_A','MGT_TEST_PASSWORD_A','MGT_TEST_EMAIL_B','MGT_TEST_PASSWORD_B'];
if(required.some(k=>!process.env[k])){console.log('SKIPPED: live Supabase credentials and two test accounts are not configured.');process.exit(0)}
const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_PUBLISHABLE_KEY;
async function request(path,{token,method='GET',body}={}){const res=await fetch(url+path,{method,headers:{apikey:key,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body===undefined?undefined:JSON.stringify(body)});return {status:res.status,data:await res.json().catch(()=>null)}}
async function login(letter){const r=await request('/auth/v1/token?grant_type=password',{method:'POST',body:{email:process.env['MGT_TEST_EMAIL_'+letter],password:process.env['MGT_TEST_PASSWORD_'+letter]}});assert.equal(r.status,200,'Sign-in failed for test account '+letter);return r.data}
const a=await login('A'),b=await login('B');assert.notEqual(a.user.id,b.user.id,'Use two separate accounts.');
for(const session of [a,b]){const own=await request('/rest/v1/mgt_beta_states?select=user_id&user_id=eq.'+session.user.id,{token:session.access_token});assert.equal(own.status,200,'Install the beta migration first.');if(!own.data.length){const state=defaultState();state.ownerId=session.user.id;const created=await request('/rest/v1/rpc/mgt_beta_commit',{token:session.access_token,method:'POST',body:{expected_version:0,payload:state}});assert.equal(created.status,200,'Could not create the dedicated test snapshot.')}}
for(const [reader,owner] of [[a,b],[b,a]]){const result=await request('/rest/v1/mgt_beta_states?select=user_id&user_id=eq.'+owner.user.id,{token:reader.access_token});assert.equal(result.status,200);assert.deepEqual(result.data,[],'RLS exposed a different account.');const payload=defaultState();payload.ownerId=owner.user.id;const write=await request('/rest/v1/rpc/mgt_beta_commit',{method:'POST',token:reader.access_token,body:{expected_version:0,payload}});assert.ok(write.status>=400,'RPC accepted a different owner identity.');}
const direct=await request('/rest/v1/mgt_beta_states',{method:'POST',token:b.access_token,body:{user_id:a.user.id,app_data:{},version:1}});assert.ok(direct.status>=400,'Direct table writes must be denied.');
const anon=await request('/rest/v1/mgt_beta_states?select=user_id');assert.ok(anon.status>=400||Array.isArray(anon.data)&&anon.data.length===0,'Anonymous account read data.');
console.log('PASSED: two-account own-row reads, cross-account isolation, RPC owner checks, direct-write denial, and anonymous read restriction.');
