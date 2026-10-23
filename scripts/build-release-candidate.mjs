// Produces a local, unpublished frontend candidate from tracked Git objects.
// It never pushes, deploys, changes a backend, or copies device/account data.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createHash} from 'node:crypto';
const exec=promisify(execFile),repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const LIVE='https://412doubleb.github.io/Muscle-Growth-Tracker/';
export const CANDIDATE_VERSION='8.2.0';
export const PRESERVATION_BASE='fa142c3fc7c96c498b73b5943eac12ca49152dfb';
const sha256=b=>createHash('sha256').update(b).digest('hex');
const rootFile=n=>!n.includes('/')&&n!=='beta-report.html'&&(/\.(?:mjs|js|css|svg|png|jpe?g|webmanifest|html)$/.test(n)||['config.json','release.json','media-manifest.json','.nojekyll'].includes(n));
const runtimeFile=n=>rootFile(n)||/^(?:media|artwork|fonts|vendor)\//.test(n);
async function git(args){return (await exec('git',args,{cwd:repo,encoding:'buffer',maxBuffer:256*1024*1024})).stdout}
export async function buildReleaseCandidate(output,{revision='HEAD'}={}){
 output=path.resolve(output);
 if(output===repo||output.startsWith(repo+path.sep)||repo.startsWith(output+path.sep))throw Error('Use a separate directory outside the source checkout.');
 await fs.mkdir(output,{recursive:true});
 if((await fs.readdir(output)).length)throw Error('Choose a new empty candidate directory; existing artifacts are never overwritten.');
 const commit=(await git(['rev-parse','--verify',revision+'^{commit}'])).toString().trim();
 const names=(await git(['ls-tree','-rz','--name-only',commit])).toString().split('\0').filter(runtimeFile).filter(Boolean).sort();
 const source=new Map();for(const name of names)source.set(name,await git(['show',commit+':'+name]));
 const originalVersion=source.get('core.mjs').toString().match(/export const VERSION='([^']+)';/)?.[1];
 if(originalVersion!=='8.1.1')throw Error('Review the version conversion before packaging a different source release.');
 if(!source.get('workout-voice.mjs').includes(Buffer.from('WORKOUT_VOICE_ENABLED=false')))throw Error('Keep deferred speech disabled.');
 const config=JSON.parse(source.get('config.json'));if(config.supabase?.url!=='https://tdmwpcueqxtnqyonucam.supabase.co')throw Error('Keep the existing live account backend.');
 if(!/^sb_publishable_[A-Za-z0-9_-]+$/.test(config.supabase?.key||'')||Object.keys(config).some(k=>/private|password|secret/i.test(k)))throw Error('Only existing public client configuration belongs in the frontend.');
 const manifest=JSON.parse(source.get('manifest.webmanifest'));for(const k of ['id','start_url','scope'])if(manifest[k]!=='./')throw Error('Preserve the existing PWA identity/scope.');
 const site=path.join(output,'site');await fs.mkdir(site);
 const files=[];let protectedAssets=0;
 for(const [name,bytes]of source){
  let rendered=bytes;
  if(!name.includes('/')&&/\.(?:mjs|js|html|css)$/.test(name)){
   let text=bytes.toString().replaceAll('?v=8.1.1','?v='+CANDIDATE_VERSION);
   if(name==='core.mjs')text=text.replace("export const VERSION='8.1.1';",`export const VERSION='${CANDIDATE_VERSION}';`);
   if(name==='sw.js')text=text.replace("const CACHE='mgt-private-beta-8.1.1';",`const CACHE='mgt-private-beta-${CANDIDATE_VERSION}';`);
   if(name==='update-client.mjs')text=text.replace("set('release','8.1.1')",`set('release','${CANDIDATE_VERSION}')`);
   if(name==='app.mjs')text=text.replace("'Cloud account'","'MENEI account &amp; cloud sync'");
   if(name==='setup.html')text=text.replace('Settings → Cloud account','Settings → MENEI account &amp; cloud sync');
   if(name==='index.html')text=text.replace('<span>8.1</span>','<span>8.2</span>');
   if(name==='update.html')text=text.replaceAll('8.1.1',CANDIDATE_VERSION).replace('PRIVATE BETA ·','RELEASE CANDIDATE ·').replace('The latest version includes 100 detailed recipes, recipe uploads and your ongoing workout program.','This candidate includes updated workout guidance, superset pairing, rest timers, nutrition units and storage recovery.');
   rendered=Buffer.from(text);
  }
  if(name==='release.json')rendered=Buffer.from(JSON.stringify({version:CANDIDATE_VERSION,brand:'MENEI',originalRecipes:100,app:`./app.mjs?v=${CANDIDATE_VERSION}`,refresh:'./update.html',channel:'release-candidate',target:'github-pages',app_url:LIVE,source_release:originalVersion,source_commit:commit,deploymentReady:false},null,2)+'\n');
  if(/\.(?:svg|png|jpe?g|webp|ttf|woff2?)$/i.test(name)){if(!rendered.equals(bytes))throw Error('Protected asset changed: '+name);protectedAssets++}
  const target=path.join(site,name);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,rendered);
  files.push({path:name,bytes:rendered.length,sha256:sha256(rendered),sourceSha256:sha256(bytes),changed:!rendered.equals(bytes)});
 }
 if(protectedAssets!==124)throw Error('Unexpected protected asset inventory; review before packaging.');
 const receipt={format:1,version:CANDIDATE_VERSION,status:'unpublished-candidate',deploymentReady:false,sourceCommit:commit,appUrl:LIVE,schemaVersion:8,protectedAssets,files,blockers:['Production AI service/auth integration at the existing live URL','Production one-hour workout push configuration and acceptance','Final release/terms scope review and explicit live publication authorization'],rollback:{priorLiveSource:PRESERVATION_BASE,automaticDowngradeAllowed:false,reason:'Original recovery readers do not support compressed recovery/sync copies. Keep current preservation readers in any emergency frontend.'}};
 await fs.writeFile(path.join(output,'RELEASE_MANIFEST.json'),JSON.stringify(receipt,null,2)+'\n');
 const archive=path.join(output,'menei-8.2.0-candidate.tar.gz');await exec('tar',['--sort=name','--mtime=@0','--owner=0','--group=0','--numeric-owner','-czf',archive,'-C',site,'.'],{cwd:repo});
 const archived=await fs.readFile(archive),archiveReceipt={path:archive,bytes:archived.length,sha256:sha256(archived)};
 await fs.writeFile(path.join(output,'ARCHIVE.json'),JSON.stringify(archiveReceipt,null,2)+'\n');
 return {output,site,sourceCommit:commit,version:CANDIDATE_VERSION,files:files.length,protectedAssets,deploymentReady:false,archive:archiveReceipt};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(process.argv.length!==3)throw Error('Usage: node scripts/build-release-candidate.mjs <new external directory>');
 console.log(JSON.stringify(await buildReleaseCandidate(process.argv[2]),null,2));
}
