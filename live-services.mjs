// Only this reviewed service and the original live Auth project receive tokens.
export const LIVE_SERVICE_BASE='https://menei-private-beta.crispcrown515.chatgpt.site/api/live/';
export const LIVE_AUTH_URL='https://tdmwpcueqxtnqyonucam.supabase.co';
export class LiveServices{
 constructor(cloud,{fetcher=globalThis.fetch.bind(globalThis)}={}){this.cloud=cloud;this.fetcher=fetcher;this.enabled=false;this.admission=null}
 configure(config){this.admission=null;this.enabled=config?.version===1&&config.enabled===true&&config.base===LIVE_SERVICE_BASE;return this.enabled}
 async admit({signal}={}){
  const context=this.cloud.accountContext();this.admission=null;
  if(!this.enabled||!context.userId||this.cloud.config?.url!==LIVE_AUTH_URL)return null;
  const response=await this.request('join',{method:'POST',body:{},signal});
  let data;try{data=await response.json()}catch{}
  this.cloud.requireCurrentAccount(context);
  if(!response.ok){this.admission={userId:context.userId,joined:false,full:data?.error==='BETA_FULL'};return this.admission}
  if(data?.joined!==true||!['owner','member'].includes(data.role))throw Error('MENEI admission could not be verified.');
  return this.admission={userId:context.userId,joined:true,role:data.role};
 }
 async request(route,{method='GET',body,signal}={}){
  if(!this.enabled)throw Error('AI gym search is not connected yet. Manual gym setup remains available.');
  if(!['join','status','research','research-status'].includes(route))throw Error('Invalid MENEI service route.');
  const cloud=this.cloud,context=cloud.accountContext();
  if(cloud.config?.url!==LIVE_AUTH_URL||!context.userId)throw Error('Sign in to your MENEI account in Settings first.');
  await cloud.refresh();cloud.requireCurrentAccount(context);
  const response=await this.fetcher(LIVE_SERVICE_BASE+route,{method,headers:{Authorization:'Bearer '+cloud.session.access_token,...(body===undefined?{}:{'Content-Type':'application/json'})},credentials:'omit',redirect:'error',cache:'no-store',signal,...(body===undefined?{}:{body:JSON.stringify(body)})});
  cloud.requireCurrentAccount(context);return response;
 }
 async research(query,{signal}={}){
  // Admission and research must remain in the very same account context.
  const context=this.cloud.accountContext(),join=await this.request('join',{method:'POST',body:{},signal});
  this.cloud.requireCurrentAccount(context);if(!join.ok)return join;
  const result=await join.json();this.cloud.requireCurrentAccount(context);
  if(result.joined!==true||!['owner','member'].includes(result.role))throw Error('MENEI admission could not be verified. Try again later.');
  return this.request('research',{method:'POST',body:query,signal});
 }
}
