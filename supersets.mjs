// Pairing changes session structure only; each exercise keeps its own sets and history.
const copy=value=>structuredClone(value);
export const entered=exercise=>(exercise.sets||[]).some(s=>s.done||['w','r','rir'].some(k=>s[k]!==''&&s[k]!=null));
export const progressionContext=e=>e.progressionContext||(e.supersetId?'superset':'straight');
export function supersetGroups(day){
  const groups=new Map();
  (day.exercises||[]).forEach((e,index)=>{if(e.supersetId){const rows=groups.get(e.supersetId)||[];rows.push({exercise:e,index});groups.set(e.supersetId,rows)}});
  return [...groups].filter(([,rows])=>rows.length===2).map(([id,members],index)=>({id,label:String.fromCharCode(65+index),members:members.sort((a,b)=>(a.exercise.supersetOrder||a.index+1)-(b.exercise.supersetOrder||b.index+1)),restSeconds:+members[0].exercise.supersetRestSeconds||120}));
}
export const supersetFor=(day,index)=>supersetGroups(day).find(g=>g.members.some(m=>m.index===index));
export function cleanSupersets(day){
  const out=copy(day),valid=new Set(supersetGroups(out).map(g=>g.id));
  for(const e of out.exercises||[])if(e.supersetId&&!valid.has(e.supersetId)){delete e.supersetId;delete e.supersetOrder;delete e.supersetRestSeconds;if(!entered(e))delete e.progressionContext}
  return out;
}
function editable(day){if(day.status==='completed')throw Error('Unlock this completed workout before changing supersets.')}
function clearMember(e){if(entered(e))throw Error('This superset already contains entered sets. Keep its recorded structure and pair other unstarted exercises.');delete e.supersetId;delete e.supersetOrder;delete e.supersetRestSeconds;delete e.progressionContext}
export function removeSuperset(day,id){
  editable(day);const out=copy(day);for(const e of out.exercises||[])if(!id||e.supersetId===id){if(e.supersetId)clearMember(e)}return out;
}
export function pairExercises(day,first,second,restSeconds=120){
  editable(day);first=+first;second=+second;restSeconds=+restSeconds;
  if(!Number.isInteger(first)||!Number.isInteger(second)||first===second||!day.exercises?.[first]||!day.exercises?.[second])throw Error('Choose two different exercises.');
  if(!Number.isInteger(restSeconds)||restSeconds<45||restSeconds>300)throw Error('Choose 45–300 seconds of rest between rounds.');
  let out=copy(day);const ids=new Set([out.exercises[first].supersetId,out.exercises[second].supersetId].filter(Boolean));
  for(const id of ids)out=removeSuperset(out,id);
  const id='pair-'+(globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2));
  for(const [order,index] of [first,second].entries()){const e=out.exercises[index];if(entered(e))throw Error('Choose exercises without entered sets to create a new superset.');e.supersetId=id;e.supersetOrder=order+1;e.supersetRestSeconds=restSeconds;e.progressionContext='superset'}
  return out;
}
export function autoSupersets(day,metaFor=()=>({}),restSeconds=120){
  editable(day);let out=copy(day);
  // Keep the first exercise and demanding lower-body compounds as straight sets.
  // Adjacent pairs preserve the approved exercise order. Never add or remove exercises.
  for(let i=1;i<out.exercises.length-1;i++){
    const a=out.exercises[i],b=out.exercises[i+1],am=metaFor(a)||{},bm=metaFor(b)||{};
    const plain=e=>!entered(e)&&!e.supersetId&&(!e.setType||e.setType==='straight')&&(e.sets||[]).every(s=>s.role==='working');
    if(!plain(a)||!plain(b)||a.sets.length!==b.sets.length||am.compound&&bm.compound||am.group==='Legs'&&am.compound||bm.group==='Legs'&&bm.compound)continue;
    out=pairExercises(out,i,i+1,restSeconds);i++;
  }
  return out;
}
export function roundStatus(group){
  const working=e=>(e.sets||[]).map((set,index)=>({set,index})).filter(({set})=>!['warmup','drop','backoff','ramp'].includes(set.role));
  const rows=group.members.map(m=>({...m,rows:working(m.exercise)})),rounds=Math.min(...rows.map(m=>m.rows.length));
  const completed=Array.from({length:rounds},(_,i)=>rows.every(m=>m.rows[i].set.done)).filter(Boolean).length;
  const next=Array.from({length:rounds},(_,i)=>i).find(i=>rows.some(m=>!m.rows[i].set.done));
  return {rounds,completed,next:next==null?null:next+1,extraSets:rows.map(m=>Math.max(0,m.rows.length-rounds))};
}
