// Private Sites dispatch supplies identity and protects all preview assets.
// No backend key is stored in this source or in the published static archive.
export const TEST_PROJECT='bhyrrxrpqaxiwpfxnwpa';
export default {
 async fetch(request,env){
  const url=new URL(request.url);
  if(url.pathname==='/config.json'){
   const headers={'Content-Type':'application/json','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'};
   if(!request.headers.get('oai-authenticated-user-id'))return new Response(JSON.stringify({error:'Owner sign-in required'}),{status:401,headers});
   if(request.method!=='GET')return new Response(JSON.stringify({error:'GET required'}),{status:405,headers:{...headers,Allow:'GET'}});
   const key=env.MENEI_TEST_PUBLISHABLE_KEY;
   if(!/^sb_publishable_[A-Za-z0-9_-]+$/.test(key||''))return new Response(JSON.stringify({error:'Test cloud configuration unavailable'}),{status:503,headers});
   return new Response(JSON.stringify({preview:{localOnly:false,projectRef:TEST_PROJECT},supabase:{url:`https://${TEST_PROJECT}.supabase.co`,key},pushServiceReady:false,authRedirectConfigured:true}),{headers});
  }
  if(!env.ASSETS?.fetch)return new Response('Preview assets unavailable',{status:503});
  return env.ASSETS.fetch(request);
 }
};
