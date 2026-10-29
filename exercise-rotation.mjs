// Stable exercise choices support learning and comparable progression logs.
// Six weeks is a MENEI review cadence, not a universal exercise expiry date.
export const EXERCISE_VARIATIONS=[['progression','Progression first · stable exercises'],['variety','Variety · avoid recent repeats']];
export const DEFAULT_REVIEW_WEEKS=6;
export const variationReviewWeeks=t=>[4,6,8].includes(+t?.variationReviewWeeks)?+t.variationReviewWeeks:DEFAULT_REVIEW_WEEKS;
export function variationSettings(options={},current={}){
 const supplied=options.minRepeatDays,mode=options.variationMode??(supplied!=null?+supplied>0?'variety':'progression':current.variationMode??'progression');
 if(!EXERCISE_VARIATIONS.some(([id])=>id===mode))throw Error('Choose a valid exercise variation policy.');
 const raw=supplied??current.minRepeatDays??0,days=Number(raw),weeks=Number(options.variationReviewWeeks??current.variationReviewWeeks??6);
 if(raw===''||!Number.isInteger(days)||days<0||days>42)throw Error('Minimum days before repeating must be an integer from 0 to 42.');
 if(![4,6,8].includes(weeks))throw Error('Choose an exercise review interval of 4, 6 or 8 weeks.');
 return {variationMode:mode,variationReviewWeeks:weeks,minRepeatDays:mode==='progression'?0:days};
}
const ordinal=date=>{if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date))return NaN;const stamp=Date.parse(date+'T00:00:00Z');return Number.isFinite(stamp)&&new Date(stamp).toISOString().slice(0,10)===date?stamp/86400000:NaN;};
const iso=day=>new Date(day*86400000).toISOString().slice(0,10);
function unchangedExposures(logs,exercise,gymId,from,to){
 if(!['total','perHand'].includes(exercise.loadMode))return false;
 const contexts=new Map();
 for(const log of Object.values(logs||{}).filter(d=>!d.deleted&&d.status==='completed'&&d.gymId===gymId&&d.date>=from&&d.date<to).sort((a,b)=>a.date.localeCompare(b.date))){
  const e=log.exercises?.find(e=>e.exerciseId===exercise.id);if(!e)continue;
  const sets=(e.sets||[]).filter(s=>['working','top'].includes(s.role||'working'));
  const invalid=!sets.length||sets.some(s=>!s.done||['w','r','rir'].some(k=>s[k]===''||s[k]==null||!Number.isFinite(+s[k])||+s[k]<0)||+s.r<=0||+s.rir>10);
  const context=JSON.stringify([e.progressionContext||(e.supersetId?'superset':'straight'),e.range,e.loadMode||exercise.loadMode,e.loadSetup||null]);
  if(!contexts.has(context))contexts.set(context,[]);
  contexts.get(context).push({date:log.date,value:invalid?null:JSON.stringify(sets.map(s=>[s.role||'working',+s.w,+s.r,+s.rir]))});
 }
 return contexts.size>0&&[...contexts.values()].every(rows=>{
  const latest=rows.at(-1);if(!latest||latest.value===null||ordinal(to)-ordinal(latest.date)>14)return false;
  let first=rows.length-1;while(first>0&&rows[first-1].value===latest.value)first--;
  const run=rows.slice(first);return new Set(run.map(r=>r.date)).size>=3&&ordinal(latest.date)-ordinal(run[0].date)>=14;
 });
}
export function stableExerciseTemplate({groups,candidatesFor,rank,priority=()=>0,anchor,date,gymId,logs={},reviewWeeks=6}){
 const start=ordinal(anchor),day=ordinal(date),reviewDays=([4,6,8].includes(+reviewWeeks)?+reviewWeeks:6)*7;
 if(!Number.isFinite(start)||!Number.isFinite(day))throw Error('Choose valid dates for the exercise review cycle.');
 const block=Math.max(0,Math.floor((day-start)/reviewDays)),used=new Set(),seen=new Set(),slots=[];
 const priorIds=[...new Set(Object.values(logs).filter(d=>!d.deleted&&d.status==='completed'&&d.gymId===gymId&&Number.isFinite(ordinal(d.date))&&ordinal(d.date)<start&&ordinal(d.date)>=start-42).sort((a,b)=>b.date.localeCompare(a.date)).flatMap(d=>(d.exercises||[]).filter(e=>e.sets?.some(s=>s.done)).map(e=>e.exerciseId)).filter(Boolean))];
 groups.forEach((group,index)=>{
  const options=candidatesFor(group).filter(e=>!used.has(e.id)).sort((a,b)=>{const ai=priorIds.indexOf(a.id),bi=priorIds.indexOf(b.id);return priority(a)-priority(b)||(ai<0?9999:ai)-(bi<0?9999:bi)||rank(a,index)-rank(b,index)||a.id.localeCompare(b.id)});
  const exercise=options[0]||null,anchorLift=!!exercise&&!seen.has(group);seen.add(group);
  slots.push({group,index,exercise,anchorLift});if(exercise)used.add(exercise.id);
 });
 // Replay only review windows that contain logged work. Empty future years
 // cannot trigger substitutions or an unbounded loop, and partial previews
 // use the same anchor and review history as a full calendar.
 const checkpoints=[...new Set(Object.values(logs).filter(d=>!d.deleted&&d.status==='completed'&&d.gymId===gymId).map(d=>Math.floor((ordinal(d.date)-start)/reviewDays)+1).filter(n=>Number.isInteger(n)&&n>0&&n<=block))].sort((a,b)=>a-b),changes=[];
 for(const checkpoint of checkpoints){
  const from=iso(start+(checkpoint-1)*reviewDays),to=iso(start+checkpoint*reviewDays);
  for(const slot of slots){
   if(!slot.exercise||slot.anchorLift||!unchangedExposures(logs,slot.exercise,gymId,from,to))continue;
   const replacement=candidatesFor(slot.group).filter(e=>!used.has(e.id)).sort((a,b)=>rank(a,slot.index)-rank(b,slot.index)||a.id.localeCompare(b.id))[0];
   if(!replacement)continue;
   changes.push({block:checkpoint,date:to,from:slot.exercise.id,to:replacement.id,reason:'Load, reps and RIR were unchanged across at least three comparable completed workouts spanning two weeks. Trying one accessory alternative; this is not proof of a physiological plateau.'});
   used.delete(slot.exercise.id);slot.exercise=replacement;used.add(replacement.id);break;
  }
 }
 return {ids:slots.map(s=>s.exercise?.id||null),anchors:slots.filter(s=>s.anchorLift).map(s=>s.exercise.id),policy:'progression',reviewWeeks:reviewDays/7,block:block+1,reviewDate:iso(start+block*reviewDays),nextReviewDate:iso(start+(block+1)*reviewDays),changes:changes.filter(c=>c.block===block)};
}
