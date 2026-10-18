import {clone,hash,importSnapshot,now,validateState,VERSION,LocalStore} from './core.mjs?v=8.1.1';

export const LEGACY_KEYS=['MGT28v6','MGT28v5'];
export function originalDeviceBackup(storage){
 for(const key of LEGACY_KEYS){const text=storage.getItem(key);if(text!==null)return {key,text}}
 return null;
}

// Preparation has no writes. The caller commits the candidate as one new V8 value.
// The old app's keys remain intact, including when parsing or device storage fails.
export function prepareDeviceUpgrade(current,storage,{hasCurrentState=false}={}){
 const source=originalDeviceBackup(storage);
 if(!source)return {state:current,changed:false,count:0,status:'none'};
 let raw;try{raw=JSON.parse(source.text);validateState(raw)}catch{
  throw Error('Your previous app data could not be copied automatically. Export the original backup below before continuing. The original records are still intact.');
 }
 const sourceHash=String(hash(JSON.stringify(raw)));
 if(current.deviceUpgrade?.sources?.some(s=>s.key===source.key&&s.hash===sourceHash)||current.legacySnapshots?.some(s=>s.id===sourceHash))return {state:current,changed:false,count:0,status:'already-imported'};
 const base=clone(current);
 if(!hasCurrentState&&['lb','kg'].includes(raw.profile?.units))base.profile.units=raw.profile.units;
 const result=importSnapshot(base,raw),next=result.state;
 // A person who has already used V8 keeps their newer settings and inventories.
 if(hasCurrentState)for(const key of ['profile','training','nutrition','gyms','gymSchedules','reminders','routines'])if(current[key]!==undefined)next[key]=clone(current[key]);
 const sources=[...(current.deviceUpgrade?.sources||[]),{key:source.key,hash:sourceHash,at:now(),count:result.count}];
 next.deviceUpgrade={version:VERSION,sources,count:result.count,conflicts:result.conflicts.length,at:now(),acknowledged:false};
 return {state:next,changed:true,count:result.count,status:'imported'};
}

export function commitDeviceUpgrade(store,storage){
 if(store.scope!=='guest'){
  // Old versions had one shared device workspace. Never upload it into a
  // different signed-in account without that person's explicit import action.
  try{const guest=new LocalStore(storage);guest.load('guest');const staged=commitDeviceUpgrade(guest,storage);return {state:store.state,changed:false,count:staged.count,status:staged.changed?'staged-in-guest':staged.status}}
  catch{return {state:store.state,changed:false,count:0,status:'manual-import-needed'}}
 }
 const result=prepareDeviceUpgrade(store.state,storage,{hasCurrentState:storage.getItem('MGT_BETA_V8:'+store.scope)!==null});
 if(result.changed){
  // LocalStorage setItem is atomic. Never clear or overwrite the old app's data.
  store.save(result.state);
 }
 return result;
}
