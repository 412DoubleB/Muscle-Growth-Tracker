// An enrolled ChatGPT account may use its retained device workspace. Switching
// ChatGPT accounts on one browser must not restore the previous account's data.
// This is an app guard, not encryption or revocation of downloaded offline data.
export const BETA_BROWSER_CONTEXT_KEY='MENEI_BETA_BROWSER_CONTEXT';
export class BetaBrowserContextError extends Error{}
export function requireBetaBrowserContext(storage,context){
 if(typeof context!=='string'||!/^[a-f0-9]{64}$/.test(context))throw new BetaBrowserContextError('The beta account could not be verified. Reopen Beta admission while signed in. Saved device data is preserved.');
 let saved;
 try{
  saved=storage.getItem(BETA_BROWSER_CONTEXT_KEY);
  if(saved!==null&&saved!==context)throw new BetaBrowserContextError('Use your own browser profile or return to the ChatGPT account used here. Saved device data is preserved.');
  if(saved===null)storage.setItem(BETA_BROWSER_CONTEXT_KEY,context);
 }catch(error){
  if(error instanceof BetaBrowserContextError)throw error;
  throw new BetaBrowserContextError('The beta browser account could not be saved. Use your own browser profile with device storage available. Saved device data is preserved.');
 }
 return context;
}

// Another tab's logout/account change invalidates this tab's in-memory session.
// Never remove the shared auth row: it may now belong to the other account.
export function invalidateChangedTabSession(cloud,event){
 if(!cloud.allowedProject||event.key!==cloud.authKey||!cloud.session)return false;
 let other;
 try{other=JSON.parse(event.newValue||'null')}catch{}
 if(other?.user?.id&&other.user.id===cloud.session.user?.id)return false;
 cloud.accountVersion++;cloud.session=null;clearTimeout(cloud.timer);
 cloud.preferRemoteOnFirstSync=false;
 return true;
}
