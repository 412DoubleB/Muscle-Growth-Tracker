// Prepare the private Sites Worker; this command never creates a hosted resource.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {EQUIPMENT} from '../core.mjs';
const source=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');

export async function buildPreviewServer(checkout,{budget=false}={}){
 checkout=path.resolve(checkout);
 if(checkout===source||source.startsWith(checkout+path.sep))throw Error('Choose a separate preview checkout.');
 const manifestPath=path.join(checkout,'.openai/hosting.json');
 const hosting=JSON.parse(await fs.readFile(manifestPath,'utf8'));
 if(typeof hosting.project_id!=='string'||!hosting.project_id)throw Error('Keep the existing Sites project identity.');
 if(hosting.static)throw Error('The existing private preview must already use its Worker configuration.');
 if(hosting.d1&&hosting.d1!=='GYM_AI_LIMITS')throw Error('Do not repurpose an existing database binding.');
 if(budget)hosting.d1='GYM_AI_LIMITS';
 const output=path.join(checkout,'dist/server'),metadata=path.join(checkout,'dist/.openai');
 await fs.mkdir(output,{recursive:true});await fs.mkdir(metadata,{recursive:true});
 let worker=await fs.readFile(path.join(source,'scripts/preview-config-worker.mjs'),'utf8');
 const imports=[['../core.mjs','./gym-equipment.mjs'],['../server/gym-research-provider.mjs','./gym-research-provider.mjs'],['../server/menei-beta-auth.mjs','./menei-beta-auth.mjs'],['../server/beta-membership-budget.mjs','./beta-membership-budget.mjs']];
 for(const [from,to]of imports){if(!worker.includes("from '"+from+"'"))throw Error('The Worker module imports changed; review the preview builder.');worker=worker.replace("from '"+from+"'","from '"+to+"'")}
 await fs.writeFile(path.join(output,'index.js'),worker);
 await fs.writeFile(path.join(output,'gym-equipment.mjs'),'export const EQUIPMENT='+JSON.stringify(EQUIPMENT)+';\n');
 for(const name of ['gym-research-budget.mjs','beta-membership-budget.mjs','menei-beta-auth.mjs'])await fs.copyFile(path.join(source,'server',name),path.join(output,name));
 let provider=await fs.readFile(path.join(source,'server/gym-research-provider.mjs'),'utf8');
 if(!provider.includes("from '../gym-identity.mjs'"))throw Error('Review the provider identity-helper import before building.');
 provider=provider.replace("from '../gym-identity.mjs'","from './gym-identity.mjs'");
 await fs.writeFile(path.join(output,'gym-research-provider.mjs'),provider);
 await fs.copyFile(path.join(source,'gym-identity.mjs'),path.join(output,'gym-identity.mjs'));
 // Sites resolves logical resources from the hosting manifest. No hosted database
 // IDs are invented or embedded. Missing injected bindings keep research disabled.
 await fs.writeFile(path.join(output,'wrangler.json'),JSON.stringify({name:'menei-private-beta',main:'index.js',compatibility_date:'2026-10-19',assets:{directory:'../client',binding:'ASSETS',run_worker_first:true}},null,2)+'\n');
 if(hosting.d1)await fs.cp(path.join(source,'drizzle'),path.join(metadata,'drizzle'),{recursive:true});
 await fs.writeFile(manifestPath,JSON.stringify(hosting,null,2)+'\n');
 await fs.writeFile(path.join(metadata,'hosting.json'),JSON.stringify(hosting,null,2)+'\n');
 return {project_id:hosting.project_id,output,budgetBinding:hosting.d1||null};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(!process.argv[2])throw Error('Usage: node scripts/build-preview-server.mjs <existing preview checkout> [--budget]');
 if(process.argv.slice(3).some(arg=>arg!=='--budget'))throw Error('Unknown preview server option.');
 console.log(JSON.stringify(await buildPreviewServer(process.argv[2],{budget:process.argv.includes('--budget')})));
}
