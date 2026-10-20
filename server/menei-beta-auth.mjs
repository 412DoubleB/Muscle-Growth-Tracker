// Server-only MENEI account validation. Claims decoded below can only deny a
// request; the fixed Supabase Auth endpoint must validate every accepted token.
const ISSUER='https://bhyrrxrpqaxiwpfxnwpa.supabase.co/auth/v1';
const MAX_TOKEN_LENGTH=16384,MAX_RESPONSE_BYTES=65536,MAX_TIMEOUT_MS=5000;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const record=value=>!!value&&typeof value==='object'&&!Array.isArray(value);

export class AuthError extends Error{
 constructor(code,status){super('MENEI account verification could not be completed.');this.name='AuthError';this.code=code;this.status=status}
}
const invalid=()=>{throw new AuthError('invalid_menei_account',401)};
const unavailable=()=>{throw new AuthError('menei_auth_unavailable',503)};
function timestamp(now){const value=Number(typeof now==='function'?now():now);if(!Number.isFinite(value))unavailable();return value}
function tokenClaims(request,now){
 const authorization=request?.headers?.get?.('authorization');
 if(typeof authorization!=='string'||authorization.length>MAX_TOKEN_LENGTH+7)invalid();
 const match=/^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/i.exec(authorization);if(!match)invalid();
 const token=match[1];if(token.length>MAX_TOKEN_LENGTH)invalid();let claims;
 try{
  const encoded=token.split('.')[1].replaceAll('-','+').replaceAll('_','/');
  const bytes=Uint8Array.from(atob(encoded),character=>character.charCodeAt(0));
  claims=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
 }catch{invalid()}
 // These are rejection checks, never signature verification. In particular a
 // forged correct-looking token still has to pass GET /auth/v1/user below.
 if(!record(claims)||claims.iss!==ISSUER||!UUID.test(claims.sub)||claims.role!=='authenticated'||claims.is_anonymous!==false||
  !(claims.aud==='authenticated'||Array.isArray(claims.aud)&&claims.aud.includes('authenticated'))||
  !Number.isSafeInteger(claims.exp)||claims.exp*1000<=now||
  claims.nbf!==undefined&&(!Number.isSafeInteger(claims.nbf)||claims.nbf*1000>now))invalid();
 return {token,claims};
}
function cancelBody(response){try{const pending=response?.body?.cancel?.();pending?.catch?.(()=>{})}catch{/* Do not expose upstream details. */}}
async function boundedJson(response,signal){
 const length=Number(response.headers?.get?.('content-length'));
 if(Number.isFinite(length)&&length>MAX_RESPONSE_BYTES){cancelBody(response);unavailable()}
 if(!response.body||typeof response.body.getReader!=='function')unavailable();
 const reader=response.body.getReader(),decoder=new TextDecoder('utf-8',{fatal:true});let bytes=0,body='';
 const cancel=()=>{try{reader.cancel().catch(()=>{})}catch{/* Cancellation is best effort. */}};
 signal.addEventListener('abort',cancel,{once:true});
 try{
  for(;;){const {done,value}=await reader.read();if(done)break;if(!(value instanceof Uint8Array))unavailable();bytes+=value.byteLength;if(bytes>MAX_RESPONSE_BYTES)unavailable();body+=decoder.decode(value,{stream:true})}
  return JSON.parse(body+decoder.decode());
 }catch{cancel();unavailable()}
 finally{signal.removeEventListener('abort',cancel);reader.releaseLock()}
}
function confirmed(value,now){return typeof value==='string'&&value.length<=64&&Number.isFinite(Date.parse(value))&&Date.parse(value)<=now}
function account(raw,claims,now){
 if(!record(raw)||!UUID.test(raw.id)||raw.id!==claims.sub||raw.is_anonymous!==false||raw.aud!=='authenticated'||raw.role!=='authenticated')invalid();
 const emailConfirmed=confirmed(raw.email_confirmed_at,now),phoneConfirmed=confirmed(raw.phone_confirmed_at,now);
 if(!Array.isArray(raw.identities)||!raw.identities.length||raw.identities.length>50||
  !raw.identities.some(identity=>record(identity)&&identity.user_id===raw.id&&typeof identity.id==='string'&&identity.id.length>0&&identity.id.length<=256&&
   typeof identity.provider==='string'&&identity.provider.length>0&&identity.provider.length<=100&&identity.provider!=='anonymous'&&
   (identity.provider==='email'?emailConfirmed:identity.provider==='phone'?phoneConfirmed:confirmed(raw.confirmed_at,now))))invalid();
 return Object.freeze({id:raw.id});
}

export async function authenticateMeneiAccount(request,env,{fetcher=globalThis.fetch,timeoutMs=MAX_TIMEOUT_MS,now=Date.now}={}){
 const started=timestamp(now),{token,claims}=tokenClaims(request,started),key=env?.MENEI_TEST_PUBLISHABLE_KEY;
 // Explicitly exclude legacy JWT and secret/service keys. No privileged key is
 // needed for a user-token Auth lookup, and no caller controls the project URL.
 if(typeof key!=='string'||!/^sb_publishable_[A-Za-z0-9_-]{12,512}$/.test(key)||typeof fetcher!=='function')unavailable();
 const timeout=Number.isFinite(timeoutMs)&&timeoutMs>0?Math.min(timeoutMs,MAX_TIMEOUT_MS):MAX_TIMEOUT_MS;
 const controller=new AbortController();let timer;
 const work=async()=>{
  // Workers rejects redirect:'error' before sending the request. Manual mode
  // never follows a redirect; every non-2xx response is rejected below.
  const response=await fetcher(ISSUER+'/user',{method:'GET',headers:{apikey:key,Authorization:'Bearer '+token,Accept:'application/json'},redirect:'manual',cache:'no-store',signal:controller.signal});
  if(!response?.ok){cancelBody(response);if(response?.status===401||response?.status===403)invalid();unavailable()}
  const raw=await boundedJson(response,controller.signal),checked=timestamp(now);
  if(claims.exp*1000<=checked)invalid();
  return account(raw,claims,checked);
 };
 const expired=new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(new AuthError('menei_auth_unavailable',503))},timeout)});
 try{return await Promise.race([work(),expired])}
 catch(error){if(error instanceof AuthError)throw error;unavailable()}
 finally{clearTimeout(timer)}
}
