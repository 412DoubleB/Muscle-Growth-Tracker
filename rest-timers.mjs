import {supersetFor} from './supersets.mjs?v=8.2.0';

const seconds=value=>Number.isFinite(+value)&&+value>0?Math.min(1800,Math.round(+value)):120;
export const isCompletionRest=rest=>['pair','exercise'].includes(rest?.kind);

// Only a newly checked local set can start rest. Viewing, syncing and unchecking
// history never create timers. This function does not modify either workout.
export function restAfterCompletion(before,after,exerciseIndex,setIndex){
 const exercise=after.exercises?.[exerciseIndex],set=exercise?.sets?.[setIndex];
 if(!set?.done||before.exercises?.[exerciseIndex]?.sets?.[setIndex]?.done||after.status==='completed')return null;
 const pair=supersetFor(after,exerciseIndex);
 if(!pair){
  const complete=exercise.sets.length>0&&exercise.sets.every(s=>s.done);
  return {kind:complete?'exercise':'set',seconds:complete?180:60,label:exercise.name||'Exercise rest'};
 }
 const allFinished=pair.members.every(m=>m.exercise.sets.length>0&&m.exercise.sets.every(s=>s.done));
 if(allFinished)return {kind:'pair',seconds:180,label:pair.members.map(m=>m.exercise.name).join(' + ')};
 return {kind:'set',seconds:60,label:exercise.name||'Set rest'};
}

export function restPreferences(storage,scope){
 // Policy 2 makes sound automatic, including previous default-off preferences.
 // An explicit mute saved under this policy remains muted across reloads.
 try{const saved=JSON.parse(storage.getItem('MGT_BETA_REST_SETTINGS:'+scope)||'null');return {auto:saved?.auto!==false,sound:saved?.audioPolicy===2?saved.sound!==false:true}}catch{return {auto:true,sound:true}}
}
export function saveRestPreferences(storage,scope,preferences){
 const result={auto:preferences.auto!==false,sound:preferences.sound!==false};
 storage.setItem('MGT_BETA_REST_SETTINGS:'+scope,JSON.stringify({...result,audioPolicy:2}));return result;
}

// Device-session state stays outside workout history and cloud synchronization.
// A scoped key prevents one account from resuming another account's rest screen.
export class RestTimer{
 constructor({storage,scope,now=()=>Date.now(),legacyCompatibility=false}){
  this.storage=storage;this.scope=scope;this.now=now;this.key='MGT_BETA_REST_TIMER:'+scope;this.record=null;this.legacyCompatibility=legacyCompatibility;this.lastEnd=null;
  try{
   const saved=JSON.parse(storage.getItem(this.key)||'null');
   if(saved?.scope===scope&&['set','round','pair','exercise','manual'].includes(saved.kind)&&Number.isFinite(saved.end)&&saved.end>0&&saved.end<=now()+1800000&&typeof saved.label==='string'&&saved.label.length<=300){
    this.record={...saved,completed:saved.completed===true};this.lastEnd=saved.end;
    // Reload never revives an expired popup or plays a stale sound.
    if(saved.end<=now()||saved.completed){this.record=null;this.persist()}
   }else if(!saved&&legacyCompatibility&&scope==='guest'){
    const end=+storage.getItem('MGT_BETA_TIMER');
    if(Number.isFinite(end)&&end>now()&&end<=now()+1800000){this.record={scope,kind:'manual',end,label:'Rest timer',date:'',completed:false};this.persist()}
   }
  }catch{} // Storage denial must never prevent logging a workout.
 }
 get blocking(){return isCompletionRest(this.record)}
 get remaining(){return this.record?Math.max(0,Math.ceil((this.record.end-this.now())/1000)):0}
 persist(){try{
  if(this.record){this.storage.setItem(this.key,JSON.stringify(this.record));if(this.legacyCompatibility)this.storage.setItem('MGT_BETA_TIMER',String(this.record.end));this.lastEnd=this.record.end}
  else{this.storage.removeItem(this.key);if(this.legacyCompatibility&&this.lastEnd!==null&&+this.storage.getItem('MGT_BETA_TIMER')===this.lastEnd)this.storage.removeItem('MGT_BETA_TIMER');this.lastEnd=null}
 }catch{}}
 start({kind='manual',seconds:duration=60,label='Rest timer',date=''}){
  if(this.blocking)return false;
  this.record={scope:this.scope,kind,seconds:seconds(duration),end:this.now()+seconds(duration)*1000,label:String(label).slice(0,300),date,completed:false};this.persist();return true;
 }
 stop(){this.record=null;this.persist()}
 tick(){
  if(!this.record||this.record.completed||this.remaining>0)return null;
  const finished={...this.record,completed:true};
  this.record=null;this.persist();return finished;
 }
}

// AudioContext is created/resumed only by a user's sound/timer/set gesture.
// No request, downloaded sound or notification permission is needed.
export class RestAudio{
 constructor({contextFactory=()=>{const Context=globalThis.AudioContext||globalThis.webkitAudioContext;return Context?new Context():null}}={}){this.contextFactory=contextFactory;this.context=null;this.voices=new Set()}
 async arm(){try{this.context??=this.contextFactory();if(this.context?.state==='suspended')await this.context.resume();return this.context?.state==='running'}catch{return false}}
 cue(){
  const context=this.context;if(context?.state!=='running')return false;
  try{
   // Four copies of the original chime, one second apart. Schedule all voices
   // together so Mute/Stop cancels both current and upcoming repetitions.
   for(let repeat=0;repeat<4;repeat++)for(const [offset,frequency]of [[0,660],[.22,880]]){
    const oscillator=context.createOscillator(),gain=context.createGain(),start=context.currentTime+repeat+offset;
    oscillator.type='sine';oscillator.frequency.value=frequency;gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.10,start+.02);gain.gain.exponentialRampToValueAtTime(.001,start+.18);
    oscillator.connect(gain);gain.connect(context.destination);this.voices.add(oscillator);oscillator.onended=()=>{this.voices.delete(oscillator);oscillator.disconnect();gain.disconnect()};oscillator.start(start);oscillator.stop(start+.2);
   }
   return true;
  }catch{return false}
 }
 silence(){for(const voice of this.voices){try{voice.stop()}catch{}}this.voices.clear()}
}
