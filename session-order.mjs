import {muscleFamilies} from './supersets.mjs?v=8.2.0';

const pad=(n,width=2)=>String(n).padStart(width,'0');
const primary=s=>['working','top'].includes(s.role);
const valid=s=>s?.done&&s.w!==''&&s.w!=null&&Number.isFinite(+s.w)&&+s.w>=0&&s.r!==''&&s.r!=null&&Number.isFinite(+s.r)&&+s.r>0;
const localDay=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
function localTimestamp(d){
 const offset=-d.getTimezoneOffset(),zone=`${offset<0?'-':'+'}${pad(Math.floor(Math.abs(offset)/60))}:${pad(Math.abs(offset)%60)}`;
 return `${localDay(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(),3)}${zone}`;
}
// A Done gesture records a logging time, not a measured exercise start/finish.
// Duplicate Done and edits to loads/reps must not manufacture fresh timing.
export function completionCheck(set,checked,date,at=new Date()){
 const out={...set,done:checked};
 if(checked&&!set.done&&valid(out)&&Number.isFinite(at.getTime())&&date===localDay(at))out.checkedAt=localTimestamp(at);
 return out;
}
// Use only when making a NEW routine/session; never strip saved history.
export function withoutCompletionTiming(set){const {checkedAt,...rest}=set;return rest}
function timestamp(set,date){
 const raw=set.checkedAt;
 if(typeof raw!=='string'||raw.slice(0,10)!==date||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2}$/.test(raw))return null;
 const ms=Date.parse(raw),offset=(+raw.slice(-5,-3)*60+ +raw.slice(-2))*(raw.at(-6)==='-'?-1:1);
 if(!Number.isFinite(ms)||new Date(ms+offset*60000).toISOString().slice(0,23)!==raw.slice(0,23))return null;
 return {raw,ms,label:raw.slice(11,19),zone:'UTC'+raw.slice(-6)};
}
export function sessionTimeline(log){
 const sets=[],unknown=[];
 if(!log||log.deleted||log.status==='skipped'||log.id!==log.date)return {sets,exercises:[],unknown:0,unknownWorking:0};
 for(const [index,exercise] of (log.exercises||[]).entries())for(const [setIndex,set]of(exercise.sets||[]).entries()){
  if(!valid(set))continue;
  const time=timestamp(set,log.date);
  if(time)sets.push({index,setIndex,name:exercise.name,role:set.role,working:primary(set),...time});else unknown.push(set);
 }
 sets.sort((a,b)=>a.ms-b.ms||a.index-b.index||a.setIndex-b.setIndex);
 const exercises=[];
 for(const item of sets.filter(s=>s.working))if(!exercises.some(e=>e.index===item.index))exercises.push({index:item.index,name:item.name,first:item});
 for(const e of exercises){
  e.position=1+exercises.filter(other=>other.first.ms<e.first.ms).length;
  e.tied=exercises.some(other=>other.index!==e.index&&other.first.ms===e.first.ms);
  e.earlierSets=sets.filter(s=>s.working&&s.index!==e.index&&s.ms<e.first.ms);
 }
 return {sets,exercises,unknown:unknown.length,unknownWorking:unknown.filter(primary).length};
}
export function orderContext(log,index,previous,metaFor=e=>e){
 const timeline=sessionTimeline(log),current=timeline.exercises.find(e=>e.index===index),notes=[];
 if(current){
  notes.push(`Recorded working-set order: ${current.position}${current.tied?' (same check time as another exercise)':''}${timeline.unknownWorking?' among timed exercises; other set times are unknown':''}. ${current.earlierSets.length} timed working ${current.earlierSets.length===1?'set':'sets'} from other exercises came before it.`);
  const exercise=log.exercises[index],meta=metaFor(exercise)||exercise,muscles=muscleFamilies((meta.primary||'')+' '+(meta.secondary||''));
  const earlier=[...new Set(current.earlierSets.map(s=>s.index))].filter(i=>{const other=metaFor(log.exercises[i])||log.exercises[i];return [...muscleFamilies((other.primary||'')+' '+(other.secondary||''))].some(m=>muscles.has(m))});
  if(earlier.length)notes.push(`Possible fatigue overlap: ${earlier.map(i=>log.exercises[i].name).join(', ')}. Consider placing priority lifts earlier; use your reps and RIR to judge the next load.`);
 }
 if(previous){
  const past=sessionTimeline(previous.log),entry=past.exercises.find(e=>e.index===previous.log.exercises.indexOf(previous.exercise));
  if(entry){
   notes.push(`Last ${previous.log.date}: recorded working-set order ${entry.position}${entry.tied?' (tied check time)':''}${past.unknownWorking?' among timed exercises':''}; ${entry.earlierSets.length} earlier timed working ${entry.earlierSets.length===1?'set':'sets'} from other exercises.`);
   if(current&&!current.tied&&!entry.tied&&!timeline.unknownWorking&&!past.unknownWorking&&(current.position!==entry.position||current.earlierSets.length!==entry.earlierSets.length))notes.push('Exercise placement differs from that session. Earlier work can affect performance; compare the loads with that context.');
  }
 }
 return notes;
}
