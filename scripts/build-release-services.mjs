// Packages reviewed, UNDEPLOYED production inputs. Never changes an account,
// hosting audience, service setting, database or live deployment.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createHash} from 'node:crypto';
const exec=promisify(execFile),repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const project='appgprj_6ad593d6f15481918ded32373b877b03';
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
export async function buildReleaseServices(frontend,output){
 frontend=path.resolve(frontend);output=path.resolve(output);
 if(output===repo||output.startsWith(repo+path.sep)||repo.startsWith(output+path.sep)||output===frontend||output.startsWith(frontend+path.sep))throw Error('Choose a separate new services directory.');
 await fs.mkdir(output,{recursive:true});if((await fs.readdir(output)).length)throw Error('Services directory must be new and empty.');
 const manifest=JSON.parse(await fs.readFile(path.join(frontend,'RELEASE_MANIFEST.json'))),commit=manifest.sourceCommit;
 if(manifest.version!=='8.2.0'||manifest.appUrl!=='https://412doubleb.github.io/Muscle-Growth-Tracker/'||!/^[a-f0-9]{40}$/.test(commit))throw Error('Expected the reviewed frontend candidate.');
 for(const file of manifest.files){const p=path.resolve(frontend,'site',file.path);if(!p.startsWith(path.join(frontend,'site')+path.sep))throw Error('Invalid candidate path.');const b=await fs.readFile(p);if(sha256(b)!==file.sha256||b.length!==file.bytes)throw Error('Candidate changed: '+file.path)}
 const git=async name=>(await exec('git',['show',commit+':'+name],{cwd:repo,encoding:'utf8',maxBuffer:4*1024*1024})).stdout;
 const files=[];
 async function write(name,content){const bytes=Buffer.from(content);if(/sk-(?:proj-)?[A-Za-z0-9_-]{12,}|sb_secret_[A-Za-z0-9_-]+/.test(bytes.toString()))throw Error('Credential-shaped content in '+name);const p=path.join(output,name);await fs.mkdir(path.dirname(p),{recursive:true});await fs.writeFile(p,bytes);files.push({path:name,bytes:bytes.length,sha256:sha256(bytes)})}
 const server='gateway/dist/server/';
 for(const name of ['live-gateway','menei-beta-auth','beta-membership-budget','gym-research-budget','gym-research-provider']){
  let code=await git('server/'+name+'.mjs');code=code.replaceAll("'../scripts/preview-config-worker.mjs'","'./preview-config-worker.mjs'").replaceAll("'../gym-identity.mjs'","'./gym-identity.mjs'").replaceAll("'../gym-profiles.mjs'","'./gym-profiles.mjs'");await write(server+name+'.mjs',code);
 }
 let worker=await git('scripts/preview-config-worker.mjs');worker=worker.replaceAll("'../core.mjs'","'./gym-equipment.mjs'").replaceAll("'../server/","'./");await write(server+'preview-config-worker.mjs',worker);
 for(const name of ['gym-identity.mjs','gym-profiles.mjs'])await write(server+name,await git(name));
 const {EQUIPMENT}=await import(pathToFileURL(path.join(frontend,'site/core.mjs')));await write(server+'gym-equipment.mjs','export const EQUIPMENT='+JSON.stringify(EQUIPMENT)+';\n');
 await write(server+'index.js',"export {default} from './live-gateway.mjs';\n");
 await write(server+'wrangler.json',JSON.stringify({name:'menei-live-gateway',main:'index.js',compatibility_date:'2026-10-23',assets:{directory:'../client',binding:'ASSETS',run_worker_first:true}},null,2)+'\n');
 const hosting=JSON.stringify({project_id:project,d1:'GYM_AI_LIMITS'},null,2)+'\n';await write('gateway/.openai/hosting.json',hosting);await write('gateway/dist/.openai/hosting.json',hosting);
 // Retain the exact current private preview client. Its account/config/assets
 // remain owner-gated by the release multiplexer even when API transport opens.
 const previewRepo='/workspace/sites/menei-private-beta',previewCommit='f40d0debcaab3abaff0fba113c8ae23b3eb37abb';
 const readPreview=async args=>(await exec('git',args,{cwd:previewRepo,encoding:'buffer',maxBuffer:256*1024*1024})).stdout;
 const bound=JSON.parse((await readPreview(['show',previewCommit+':.openai/hosting.json'])).toString());
 if(bound.project_id!==project||bound.d1!=='GYM_AI_LIMITS')throw Error('Private preview identity changed; review before packaging.');
 const previewFiles=(await readPreview(['ls-tree','-rz','--name-only',previewCommit])).toString().split('\0').filter(n=>n.startsWith('dist/client/')&&n.length>12);
 for(const name of previewFiles)await write('gateway/'+name,await readPreview(['show',previewCommit+':'+name]));
 await write('reminders/index.ts',await git('supabase/production/index.ts'));
 await write('reminders/reminder-handler.mjs',(await git('supabase/production/reminder-handler.mjs')).replace("'../functions/menei-push-reminders/logic.mjs'","'./logic.mjs'"));
 for(const name of ['logic.mjs','schedule.mjs','legacy.mjs'])await write('reminders/'+name,await git('supabase/functions/menei-push-reminders/'+name));
 await write('reminders/deno.json',await git('supabase/functions/menei-push-reminders/deno.json'));
 await write('push-delivery.sql',await git('supabase/production/push-delivery.sql'));
 await write('ACTIVATION_PLAN.md',await git('docs/codex/PRODUCTION_ACTIVATION.md'));
 const receipt={version:'8.2.0',sourceCommit:commit,status:'prepared-not-deployed',projectId:project,retainedPreviewSource:previewCommit,requiresLiveOwnerBinding:true,existingD1Preserved:true,files};await fs.writeFile(path.join(output,'SERVICES_MANIFEST.json'),JSON.stringify(receipt,null,2)+'\n');
 await exec('tar',['--sort=name','--mtime=@0','--owner=0','--group=0','--numeric-owner','-czf',path.join(output,'menei-8.2.0-services.tar.gz'),'-C',output,'gateway','reminders','push-delivery.sql','ACTIVATION_PLAN.md','SERVICES_MANIFEST.json'],{cwd:repo});
 const archive=await fs.readFile(path.join(output,'menei-8.2.0-services.tar.gz'));const result={...receipt,files:files.length,archiveBytes:archive.length,archiveSha256:sha256(archive)};await fs.writeFile(path.join(output,'ARCHIVE.json'),JSON.stringify(result,null,2)+'\n');return result;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){if(process.argv.length!==4)throw Error('Usage: node scripts/build-release-services.mjs <frontend candidate directory> <new services directory>');console.log(JSON.stringify(await buildReleaseServices(process.argv[2],process.argv[3]),null,2))}
