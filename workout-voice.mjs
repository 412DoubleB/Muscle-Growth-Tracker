// Spoken workout cues are deferred until post-launch; rest chimes are separate.
export const WORKOUT_VOICE_ENABLED=false;

const positive=value=>value!==''&&value!=null&&Number.isFinite(+value)&&+value>0;
const checked=day=>(day?.exercises||[]).some(e=>(e.sets||[]).some(s=>s.done&&positive(s.r)&&s.w!==''&&s.w!=null&&Number.isFinite(+s.w)&&+s.w>=0));
const activity=day=>checked(day)||day?.run?.done&&positive(day.run.minutes);

// Call only after an explicit local edit has saved successfully. Viewing,
// importing and syncing records never invoke this transition detector.
export function workoutVoiceCue(before,after,date,today){
 if(date!==today||!/^\d{4}-\d{2}-\d{2}$/.test(date)||before?.date!==date||after?.date!==date||after.deleted||!['strength','run'].includes(after.kind))return null;
 if(before.status!=='completed'&&after.status==='completed'&&activity(after))return {kind:'complete',text:'Workout complete. Your progress is saved. Make time to recover.'};
 if(!['completed','skipped'].includes(after.status)&&!checked(before)&&checked(after))return {kind:'start',text:'First set logged. One set at a time.'};
 return null;
}

export class WorkoutVoice{
 constructor({storage,getScope,api=()=>globalThis.speechSynthesis,utterance=text=>new globalThis.SpeechSynthesisUtterance(text)}={}){Object.assign(this,{storage,getScope,api,utterance});this.seen=new Map();this.active=false}
 get available(){try{return typeof this.api()?.speak==='function'&&typeof globalThis.SpeechSynthesisUtterance==='function'}catch{return false}}
 cancel(){if(!this.active)return;this.active=false;this.current=null;try{this.api()?.cancel()}catch{}}
 speak(text){
  if(!this.available)return false;
  try{
   this.cancel();const api=this.api(),message=this.utterance(String(text).slice(0,240));
   message.lang='en-US';message.rate=1;message.pitch=1;message.volume=1;
   const voices=api.getVoices?.()||[],voice=voices.find(v=>v.localService&&/^en(?:-|$)/i.test(v.lang))||voices.find(v=>/^en(?:-|$)/i.test(v.lang));if(voice)message.voice=voice;
   message.onend=message.onerror=()=>{if(this.current===message){this.active=false;this.current=null}};
   this.current=message;this.active=true;api.speak(message);return true;
  }catch{this.active=false;this.current=null;return false}
 }
 observe(before,after,{date,today,enabled=true}={}){
  const cue=workoutVoiceCue(before,after,date,today);if(!cue)return false;
  const scope=this.getScope(),key='MGT_BETA_WORKOUT_VOICE:'+scope;
  let saved;try{saved=JSON.parse(this.storage.getItem(key)||'null')}catch{}
  const memory=this.seen.get(scope),prior=memory?.date===date?memory:saved?.version===1&&saved.date===date?saved:{version:1,date};
  if(prior[cue.kind])return false;
  const next={version:1,date,start:prior.start===true,complete:prior.complete===true,[cue.kind]:true};
  this.seen.set(scope,next);if(this.seen.size>32)this.seen.delete(this.seen.keys().next().value);
  // Receipt storage can fail without blocking the saved workout. Muted or
  // unavailable cues are consumed, so unmuting cannot replay an old event.
  try{this.storage.setItem(key,JSON.stringify(next))}catch{}
  return enabled?this.speak(cue.text):false;
 }
}
