const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export const BETA_FULL_MESSAGE='This private beta is full. All 20 places have been taken. Your saved data is preserved.';
export const BETA_ADMISSION_CAMPAIGN='menei-beta-20-1';
const admissionKey=(project,userId)=>'MENEI_BETA_OFFLINE_ADMISSION:'+project+':'+encodeURIComponent(userId);
const validMember=member=>typeof member?.userId==='string'&&!!member.userId&&['owner','member'].includes(member.role);
// This device-only receipt permits local records while offline. It is never
// sent as authorization and cannot reserve a beta place or change AI limits.
export function rememberBetaAdmission(storage,project,member){
 if(!project||!validMember(member))return false;
 try{storage.setItem(admissionKey(project,member.userId),JSON.stringify({version:1,campaign:BETA_ADMISSION_CAMPAIGN,project,userId:member.userId,role:member.role}));return true}catch{return false}
}
export function savedBetaAdmission(storage,project,userId){
 if(!project||typeof userId!=='string'||!userId)return null;
 try{const value=JSON.parse(storage.getItem(admissionKey(project,userId))||'null');return value?.version===1&&value.campaign===BETA_ADMISSION_CAMPAIGN&&value.project===project&&value.userId===userId&&validMember(value)?{userId,role:value.role}:null}catch{return null}
}
export function forgetBetaAdmission(storage,project,userId){
 if(project&&typeof userId==='string'&&userId)try{storage.removeItem(admissionKey(project,userId))}catch{}
}
export class BetaAdmissionError extends Error{
 constructor(code,message,status){super(message);this.name='BetaAdmissionError';this.code=code;this.status=status}
}
export function betaAdmissionMessage(code,status){
 if(code==='BETA_FULL')return BETA_FULL_MESSAGE;
 if(status===401)return 'Your MENEI session could not be verified. Sign in again to continue. Your saved data is preserved.';
 if(code==='BETA_OWNER_REQUIRED'||code==='BOOTSTRAP_OWNER_REQUIRED')return 'The private beta is being prepared. Please try again after the owner opens admission.';
 if(status===403)return 'This MENEI account cannot enter the private beta yet. Your saved data is preserved.';
 return 'Beta admission is temporarily unavailable. Retry when the connection is available. Your saved data is preserved.';
}

// Admission is bound to the current MENEI session. A stale response cannot open
// another account's saved workspace after a sign-out or account transition.
export async function joinBetaAccount(cloud,fetcher=globalThis.fetch.bind(globalThis)){
 const context=cloud.accountContext();
 if(!context.userId)throw new BetaAdmissionError('AUTH_REQUIRED',betaAdmissionMessage('AUTH_REQUIRED',401));
 await cloud.refresh();cloud.requireCurrentAccount(context);
 const token=cloud.session?.access_token;
 if(!token)throw new BetaAdmissionError('AUTH_REQUIRED',betaAdmissionMessage('AUTH_REQUIRED',401));
 const response=await fetcher('/api/beta-join',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},credentials:'same-origin',cache:'no-store',redirect:'error',body:'{}'});
 cloud.requireCurrentAccount(context);
 let data;try{data=await response.json()}catch{}
 cloud.requireCurrentAccount(context);
 if(!response.ok)throw new BetaAdmissionError(data?.error,betaAdmissionMessage(data?.error,response.status),response.status);
 if(data?.joined!==true||!['owner','member'].includes(data.role))throw new BetaAdmissionError('INVALID_ADMISSION',betaAdmissionMessage());
 return {userId:context.userId,role:data.role};
}

// A transport/service outage is not an authorization decision. This only
// controls device-local recovery UI; the receipt never authorizes a request.
export function temporaryBetaFailure(error){
 if(['BETA_FULL','INVALID_ADMISSION','AUTH_REQUIRED'].includes(error?.code))return false;
 if(Number.isInteger(error?.status))return [408,429].includes(error.status)||error.status>=500&&error.status<=599;
 return ['TypeError','TimeoutError'].includes(error?.name);
}
export const BETA_TEMPORARY_MESSAGE='The cloud connection is temporarily unavailable. Your saved data remains on this device. Retry the connection.';

export function betaEntryHtml({email='',message='',recovery=false,available=true,signedIn=false,busy=false,temporary=false,localAvailable=false}={}){
 const disabled=busy||!available?' disabled':'';
 const action=(label,name,primary=false)=>`<button type="button" class="btn ${primary?'primary':'small'}" data-action="beta-${name}"${disabled}>${label}</button>`;
 return `<section class="intro"><div class="eyebrow">MENEI private beta</div><h1>${recovery?'Set your new password.':'Your next rep starts here.'}</h1><p class="muted">Training, nutrition and built-in AI gym search. Everything starts with your MENEI account.</p></section><form id="betaEntryForm" class="card" style="max-width:560px"><h2>${recovery?'Recover your MENEI account':signedIn?'Continue to MENEI':'Sign in to MENEI'}</h2>${recovery?'':`<label class="field">Email<input name="email" type="email" value="${escape(email)}" autocomplete="email" required${disabled}></label>`}<label class="field">${recovery?'New password':'Password'}<input name="password" type="password" autocomplete="${recovery?'new-password':'current-password'}" ${recovery?'minlength="12"':''}${disabled}></label><p class="sub">${recovery?'Use at least 12 characters.':signedIn?'Your MENEI account is signed in. Admission must be confirmed before your workspace opens.':'Use your email and password, or create a MENEI account. Confirm your email if prompted, then return here and sign in.'}</p><div class="row wrap">${recovery?action('Save new password','password',true):signedIn?action('Continue to MENEI','retry',true):action('Sign in & join beta','signin',true)+action('Create MENEI account','signup')+action('Reset password','reset')}${signedIn?'<button type="button" class="btn small ghost" data-action="beta-signout">Sign out</button>':''}</div><p class="error" role="status" aria-live="polite">${escape(message)}</p>${!available||temporary?`<button type="button" class="btn small" data-action="beta-retry"${busy?' disabled':''}>Retry connection</button>`:''}${localAvailable?`<button type="button" class="btn primary" data-action="beta-offline"${busy?' disabled':''}>Open saved data on this device</button><p class="tiny">Cloud sync, AI search and push setup stay paused until the connection is verified.</p>`:''}<p class="tiny">Your saved workspaces and backups stay on this device. Beta admission is limited to 20 accounts.</p></form>`;
}
