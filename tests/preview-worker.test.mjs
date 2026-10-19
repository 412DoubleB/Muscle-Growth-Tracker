import test from 'node:test';
import assert from 'node:assert/strict';
import worker,{TEST_PROJECT} from '../scripts/preview-config-worker.mjs';
const key='sb_publishable_synthetic_preview';
const ownerRequest=(path='/config.json',method='GET')=>new Request('https://private.example'+path,{method,headers:{'oai-authenticated-user-id':'synthetic-owner'}});
test('preview config requires signed-in owner dispatch identity and uses only the fixed test backend',async()=>{
 assert.equal((await worker.fetch(new Request('https://private.example/config.json'),{MENEI_TEST_PUBLISHABLE_KEY:key})).status,401);
 assert.equal((await worker.fetch(ownerRequest('/config.json','POST'),{MENEI_TEST_PUBLISHABLE_KEY:key})).status,405);
 const response=await worker.fetch(ownerRequest(),{MENEI_TEST_PUBLISHABLE_KEY:key,SUPABASE_SERVICE_ROLE_KEY:'must-not-expose',SUPABASE_URL:'https://live.example'});
 const config=await response.json();
 assert.equal(config.supabase.url,`https://${TEST_PROJECT}.supabase.co`);assert.equal(config.supabase.key,key);assert.equal(config.pushServiceReady,false);
 assert.doesNotMatch(JSON.stringify(config),/must-not-expose|live.example/);assert.match(response.headers.get('Cache-Control'),/no-store/);
});
test('secret keys or missing runtime config fail closed; static bytes are preserved',async()=>{
 for(const candidate of [undefined,'sb_secret_server_only','eyJhbGciOiJIUzI1NiJ9.invalid.jwt'])assert.equal((await worker.fetch(ownerRequest(),{MENEI_TEST_PUBLISHABLE_KEY:candidate})).status,503);
 const bytes=new Uint8Array([1,2,3,4]);let path;
 const result=await worker.fetch(ownerRequest('/media/original.webp'),{ASSETS:{fetch:async request=>{path=new URL(request.url).pathname;return new Response(bytes)}}});
 assert.equal(path,'/media/original.webp');assert.deepEqual(new Uint8Array(await result.arrayBuffer()),bytes);
});
