import test from 'node:test';
import assert from 'node:assert/strict';
import {CloudSync} from '../cloud.mjs';

const memory=()=>{const rows=new Map();return {getItem:key=>rows.get(key)??null,setItem:(key,value)=>rows.set(key,value),removeItem:key=>rows.delete(key)}};

test('default cloud transport preserves the browser fetch receiver and authentication payload',async t=>{
 const calls=[];
 t.mock.method(globalThis,'fetch',function(url,options){
  // Browser fetch rejects a CloudSync instance as its receiver; Node fetch does not.
  assert.ok(this===globalThis,'Browser fetch must receive its global object, not the CloudSync instance.');
  calls.push({url,options});
  return Promise.resolve(new Response(JSON.stringify({user:{id:'test-account'}}),{status:200}));
 });
 const cloud=new CloudSync({storage:memory()});
 cloud.configure('https://receiver-test.supabase.co','sb_publishable_test');
 const body={email:'tester@example.invalid',password:'test-only-password'};
 const result=await cloud.request('/auth/v1/token?grant_type=password',{method:'POST',auth:false,body});
 assert.deepEqual(result,{user:{id:'test-account'}});
 assert.equal(calls.length,1);
 assert.equal(calls[0].url,'https://receiver-test.supabase.co/auth/v1/token?grant_type=password');
 assert.equal(calls[0].options.method,'POST');
 assert.deepEqual(JSON.parse(calls[0].options.body),body);
 assert.equal(calls[0].options.headers.apikey,'sb_publishable_test');
 assert.equal(calls[0].options.headers.Authorization,undefined);
});

test('cloud transport still accepts an explicitly supplied fetch implementation',async t=>{
 t.mock.method(globalThis,'fetch',()=>{throw Error('The injected transport must be used.');});
 const calls=[];
 const cloud=new CloudSync({storage:memory(),fetcher:async(url,options)=>{
  calls.push({url,options});
  return new Response(JSON.stringify({message:'Invalid login credentials'}),{status:400});
 }});
 cloud.configure('https://receiver-test.supabase.co','sb_publishable_test');
 await assert.rejects(cloud.request('/auth/v1/token?grant_type=password',{auth:false}),error=>error.message==='Invalid login credentials'&&error.status===400);
 assert.equal(calls.length,1);
});
