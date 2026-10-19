// Build a device-local preview without changing the GitHub Pages configuration.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const source=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export async function buildPreview(output){
 output=path.resolve(output);
 if(output===source||source.startsWith(output+path.sep))throw Error('Choose a separate preview output directory.');
 await fs.mkdir(output,{recursive:true});
 const revision=(await promisify(execFile)('git',['rev-parse','HEAD'],{cwd:source,encoding:'utf8'})).stdout.trim();
 const files=(await fs.readdir(source)).filter(n=>/\.(mjs|css|svg|png|jpg|webmanifest|html)$/.test(n)||['sw.js','media-manifest.json'].includes(n));
 for(const name of files)await fs.copyFile(path.join(source,name),path.join(output,name));
 for(const dir of ['media','artwork','fonts'])await fs.cp(path.join(source,dir),path.join(output,dir),{recursive:true});
 let html=await fs.readFile(path.join(source,'index.html'),'utf8');
 html=html.replace('<html lang="en">','<html lang="en" data-preview="local">').replace('<meta charset="utf-8">','<meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="connect-src \'self\'; object-src \'none\'; base-uri \'self\'; form-action \'self\'">');
 html=html.replace('<main id="app">','<aside class="callout" style="margin:16px 18px" aria-label="Private preview"><b>Private preview · Device-only test workspace</b><p>Your live app stays separate. Cloud sync and scheduled push are disabled here. <a href="./preview-guide.html">Testing checklist</a></p></aside><main id="app">');
 await fs.writeFile(path.join(output,'index.html'),html);
 await fs.writeFile(path.join(output,'config.json'),JSON.stringify({preview:{localOnly:true},pushServiceReady:false}));
 const manifest=JSON.parse(await fs.readFile(path.join(source,'manifest.webmanifest'),'utf8'));
 manifest.name='MENEI Private Preview';manifest.short_name='MENEI Preview';
 await fs.writeFile(path.join(output,'manifest.webmanifest'),JSON.stringify(manifest,null,2));
 const release=JSON.parse(await fs.readFile(path.join(source,'release.json'),'utf8'));
 await fs.writeFile(path.join(output,'release.json'),JSON.stringify({...release,channel:'private-preview',target:'owner-private-sites',source_commit:revision,app_url:'./'},null,2));
 let sw=await fs.readFile(path.join(source,'sw.js'),'utf8');
 sw=sw.replace(/const CACHE='[^']+';/,`const CACHE='menei-owner-preview-${revision.slice(0,12)}';`).replace("'./setup.html'];","'./setup.html','./preview-guide.html'];");
 await fs.writeFile(path.join(output,'sw.js'),sw);
 const guide=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MENEI preview checklist</title><link rel="stylesheet" href="./styles.css?v=8.1.1"></head><body><main style="max-width:760px;margin:auto"><div class="card"><div class="eyebrow">Owner testing</div><h1>MENEI private preview</h1><p>This is a separate, device-only workspace. It does not read or write the live app’s accounts or workout history. Nothing is shared between devices in this preview.</p><p><a class="btn primary" href="./">Open the preview</a></p><ol><li>Start with sample entries. Review your profile, nutrition preferences and gym inventory.</li><li>Generate a program for your split, focus and gym. Confirm 6–9 compatible exercises on lifting days and inspect equipment warnings.</li><li>Enter a sample set including load, reps and RIR. Complete the workout, then regenerate: the entered session must stay unchanged.</li><li>Try exercise swaps, routines, supersets, progress filters, recipes, meal plans, pantry and shopping.</li><li>In Settings → Your data, export a backup. Keep it privately. Import a test copy and verify sessions, zero loads, units, meals and conflict copies remain intact.</li><li>After the first online load, reload offline. Confirm your saved entries and artwork are available.</li><li>Record the screen, action, expected result and actual result for any issue. Avoid sending passwords or private account exports in feedback.</li></ol><h2>What still needs separate testing</h2><p>Cloud sign-in, recovery emails, two-device sync and scheduled push are disabled here. Those require a separately authorized test backend/account and device acceptance. Gym lookup remains a curated directory plus a research handoff. Image approval reconciliation remains pending; existing images are preserved.</p><p>Do not uninstall or clear the live app to test this preview. Export preview entries before changing devices or clearing its browser storage. Only import a copy of a real backup after retaining the untouched original privately.</p><p class="sub">Source revision: ${revision.slice(0,12)} · separate origin and storage</p></div></main></body></html>`;
 await fs.writeFile(path.join(output,'preview-guide.html'),guide);
 await fs.writeFile(path.join(output,'setup.html'),guide);
 await fs.writeFile(path.join(output,'preview-build.json'),JSON.stringify({source_commit:revision,localOnly:true},null,2));
 return {output,source_commit:revision};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(!process.argv[2])throw Error('Usage: node scripts/build-preview.mjs <separate output directory>');
 console.log(JSON.stringify(await buildPreview(process.argv[2])));
}
