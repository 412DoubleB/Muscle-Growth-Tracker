import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {VERSION} from '../core.mjs';

test('GitHub Pages manifest identity, offline shell and reminder links stay under the existing project path',async()=>{
 const app='https://412doubleb.github.io/Muscle-Growth-Tracker/',manifest=JSON.parse(await fs.readFile(new URL('../manifest.webmanifest',import.meta.url),'utf8'));assert.equal(new URL(manifest.id,app).href,app);assert.equal(new URL(manifest.start_url,app).href,app);assert.equal(new URL(manifest.scope,app).href,app);assert.equal(manifest.name,'MENEI');
 const handlers=new Map(),added=[];let opened;const self={location:{origin:new URL(app).origin,href:app+'sw.js'},registration:{scope:app},addEventListener:(k,f)=>handlers.set(k,f),clients:{matchAll:async()=>[],openWindow:async url=>opened=typeof url==='string'?url:url.href,claim:async()=>{}},skipWaiting(){}};
 vm.runInNewContext(await fs.readFile(new URL('../sw.js',import.meta.url),'utf8'),{self,caches:{open:async()=>({addAll:async values=>added.push(...values)}),keys:async()=>[],delete:async()=>{}},URL,Request,fetch});let installed;handlers.get('install')({waitUntil:p=>installed=p});await installed;assert.ok(added.length>=32);assert.ok(added.every(r=>r.url.startsWith(app)));assert.ok(added.find(r=>r.url===app+'upgrade.mjs?v='+VERSION));let clicked;handlers.get('notificationclick')({notification:{data:{url:'./'},close(){}},waitUntil:p=>clicked=p});await clicked;assert.equal(opened,app);
});
