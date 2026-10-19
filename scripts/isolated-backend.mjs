// Shared target guard for opt-in acceptance checks. Never default to the live app.
import fs from 'node:fs/promises';
export function validateIsolatedTarget(url,expectedRef,liveUrl){
 if(!/^[a-z0-9]{20}$/.test(expectedRef||''))throw Error('Set MENEI_TEST_PROJECT_REF to the independently selected test project reference.');
 let target,live;try{target=new URL(url);live=new URL(liveUrl)}catch{throw Error('Use a valid isolated Supabase URL.');}
 if(target.hostname===live.hostname)throw Error('Refusing acceptance checks against the live MENEI backend.');
 if(target.protocol!=='https:'||target.hostname!==expectedRef+'.supabase.co'||target.port||target.username||target.password||target.search||target.hash||!['','/'].includes(target.pathname))throw Error('The URL must exactly match the selected isolated Supabase project.');
 return target.origin;
}
export async function isolatedTestConfig(env=process.env,{writes=false}={}){
 if(!env.SUPABASE_URL&&!env.SUPABASE_PUBLISHABLE_KEY&&!env.MENEI_TEST_PROJECT_REF)return null;
 const live=JSON.parse(await fs.readFile(new URL('../config.json',import.meta.url),'utf8'));
 const url=validateIsolatedTarget(env.SUPABASE_URL,env.MENEI_TEST_PROJECT_REF,live.supabase.url);
 if(!/^sb_publishable_[A-Za-z0-9_-]+$/.test(env.SUPABASE_PUBLISHABLE_KEY||''))throw Error('Supply the test project publishable key, never a server secret.');
 if(writes&&env.MENEI_ALLOW_TEST_WRITES!=='1')throw Error('Set MENEI_ALLOW_TEST_WRITES=1 only for dedicated synthetic test accounts.');
 return {url,key:env.SUPABASE_PUBLISHABLE_KEY,projectRef:env.MENEI_TEST_PROJECT_REF};
}
