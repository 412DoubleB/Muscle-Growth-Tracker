import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {validateIsolatedTarget,isolatedTestConfig} from '../scripts/isolated-backend.mjs';
const live=JSON.parse(await fs.readFile(new URL('../config.json',import.meta.url),'utf8')).supabase.url;
const ref='abcdefghijklmnopqrst',url=`https://${ref}.supabase.co`;
test('isolated acceptance never defaults to the configured live backend',async()=>{
 assert.equal(await isolatedTestConfig({}),null);
 const liveRef=new URL(live).hostname.split('.')[0];
 await assert.rejects(isolatedTestConfig({SUPABASE_URL:live,MENEI_TEST_PROJECT_REF:liveRef,SUPABASE_PUBLISHABLE_KEY:'sb_publishable_test'}),/live MENEI/);
 for(const bad of [url+'.attacker.invalid',url+'/rest/v1',url+'?redirect=bad',url+'#bad',url.replace('https','http'),url.replace('https://','https://user:password@')])assert.throws(()=>validateIsolatedTarget(bad,ref,live));
 assert.throws(()=>validateIsolatedTarget(url,'differentprojectnamex',live));
 assert.equal(validateIsolatedTarget(url,ref,live),url);
});
test('isolated writes need explicit consent and a client publishable key',async()=>{
 const env={SUPABASE_URL:url,MENEI_TEST_PROJECT_REF:ref,SUPABASE_PUBLISHABLE_KEY:'sb_publishable_synthetic'};
 await assert.rejects(isolatedTestConfig({...env,SUPABASE_PUBLISHABLE_KEY:'sb_secret_not_for_clients'}),/publishable/);
 await assert.rejects(isolatedTestConfig(env,{writes:true}),/ALLOW_TEST_WRITES/);
 assert.equal((await isolatedTestConfig({...env,MENEI_ALLOW_TEST_WRITES:'1'},{writes:true})).url,url);
});
