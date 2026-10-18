import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),dist=root;
let checked=0;
async function walk(dir){let out=[];for(const entry of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isDirectory())out.push(...await walk(p));else out.push(p)}return out}
for(const file of (await fs.readdir(dist)).filter(p=>/\.(mjs|js)$/.test(p)).map(p=>path.join(dist,p))){const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});assert.equal(result.status,0,result.stderr);const code=await fs.readFile(file,'utf8');for(const m of code.matchAll(/from\s+['"](.\/.+?)['"]/g))await fs.access(path.resolve(path.dirname(file),m[1].split('?')[0]));checked++}
const sw=await fs.readFile(path.join(dist,'sw.js'),'utf8'),shell=JSON.parse(sw.match(/const SHELL=(\[.*?\]);/s)[1].replaceAll("'",'"'));
for(const item of shell)await fs.access(path.join(dist,item==='./'?'index.html':item.split('?')[0]));
const manifest=JSON.parse(await fs.readFile(path.join(dist,'manifest.webmanifest'),'utf8'));assert.equal(manifest.scope,'./');for(const icon of manifest.icons)await fs.access(path.join(dist,icon.src));
const config=JSON.parse(await fs.readFile(path.join(dist,'config.json'),'utf8'));assert.match(config.supabase.url,/^https:\/\/[a-z0-9-]+\.supabase\.co$/);assert.match(config.supabase.key,/^sb_publishable_/);assert.equal(Buffer.from(config.vapidPublicKey,'base64url').length,65);assert.ok(!Object.keys(config).some(k=>/private|password|secret/i.test(k)));assert.equal(config.pushServiceReady,true);
const media=JSON.parse(await fs.readFile(path.join(dist,'media-manifest.json'),'utf8'));
const allAssets=new Set(media.assets.map(x=>x.id));
for(const a of media.assets)if(a.webPath){const bytes=await fs.readFile(path.join(dist,a.webPath));assert.ok(bytes.length>12,a.webPath+': empty image');assert.equal(bytes.toString('ascii',0,4),'RIFF',a.webPath);assert.equal(bytes.toString('ascii',8,12),'WEBP',a.webPath);assert.equal(bytes.length,a.webBytes,a.webPath+': size mismatch');assert.equal(createHash('sha256').update(bytes).digest('hex'),a.webSha256,a.webPath+': hash mismatch');}
for(const e of media.exercises){for(const id of [e.start,e.finish,...e.gallery].filter(Boolean))assert.ok(allAssets.has(id),id);for(const p of [e.startPath,e.finishPath].filter(Boolean))await fs.access(path.join(dist,p));assert.equal(e.approved,false,'No approval hash has been independently recovered.');}
assert.equal(media.assets.length,162);assert.equal(new Set(media.assets.map(x=>x.originalSha256)).size,162);
const release=JSON.parse(await fs.readFile(path.join(root,'release.json'),'utf8'));assert.equal(release.target,'github-pages');assert.equal(release.app_url,'https://412doubleb.github.io/Muscle-Growth-Tracker/');await fs.access(path.join(root,'.nojekyll'));const entry=await fs.readFile(path.join(root,'index.html'),'utf8');assert.ok(!entry.includes('PRIVATE BETA'));assert.ok(!entry.includes('original GitHub app remains separate'));
const result=spawnSync(process.execPath,['--check',path.join(root,'supabase/functions/send-reminders/index.ts')],{encoding:'utf8'});assert.equal(result.status,0,result.stderr);
console.log(JSON.stringify({status:'passed',javascriptFiles:checked,shellFiles:shell.length,imageOriginals:media.assets.length,webImages:media.assets.filter(a=>a.webPath).length,pairedMovements:media.exercises.filter(e=>e.startPath&&e.finishPath).length,edgeFunction:'syntax checked only',browserQA:'unavailable',liveSupabase:'connected; live DB/RLS and HTTP checks passed; real device/account acceptance pending'},null,2));
