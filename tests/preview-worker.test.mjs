import test from 'node:test';
import assert from 'node:assert/strict';
import worker,{TEST_PROJECT} from '../scripts/preview-config-worker.mjs';
const key='sb_publishable_synthetic_preview';
const privateSetup={MENEI_BETA_PHASE:'off',MENEI_BETA_OWNER_PRIVATE:'true'};
const ownerRequest=(path='/api/preview-config',method='GET')=>new Request('https://private.example'+path,{method,headers:{'oai-authenticated-user-id':'synthetic-owner'}});
test('shared public client config uses the private platform boundary and fixed test backend',async()=>{
 // Private Sites dispatch authenticates browser/service access before this Worker.
 // Shared public settings do not require per-user identity and contain no records.
 assert.equal((await worker.fetch(new Request('https://private.example/api/preview-config'),{...privateSetup,MENEI_TEST_PUBLISHABLE_KEY:key})).status,200);
 assert.equal((await worker.fetch(ownerRequest('/api/preview-config','POST'),{...privateSetup,MENEI_TEST_PUBLISHABLE_KEY:key})).status,405);
 const response=await worker.fetch(ownerRequest(),{...privateSetup,MENEI_TEST_PUBLISHABLE_KEY:key,SUPABASE_SERVICE_ROLE_KEY:'must-not-expose',SUPABASE_URL:'https://live.example'});
 const config=await response.json();
 assert.equal(config.supabase.url,`https://${TEST_PROJECT}.supabase.co`);assert.equal(config.supabase.key,key);assert.equal(config.pushServiceReady,false);
 assert.doesNotMatch(JSON.stringify(config),/must-not-expose|live.example/);assert.match(response.headers.get('Cache-Control'),/no-store/);
});
test('secret keys or missing runtime config fail closed; static bytes are preserved',async()=>{
 for(const candidate of [undefined,'sb_secret_server_only','eyJhbGciOiJIUzI1NiJ9.invalid.jwt'])assert.equal((await worker.fetch(ownerRequest(),{...privateSetup,MENEI_TEST_PUBLISHABLE_KEY:candidate})).status,503);
 const bytes=new Uint8Array([1,2,3,4]);let path;
 const result=await worker.fetch(ownerRequest('/media/original.webp'),{...privateSetup,ASSETS:{fetch:async request=>{path=new URL(request.url).pathname;return new Response(bytes)}}});
 assert.equal(path,'/media/original.webp');assert.deepEqual(new Uint8Array(await result.arrayBuffer()),bytes);
});
