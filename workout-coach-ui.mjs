import {buildWorkoutCoachFacts} from './workout-coach-facts.mjs?v=8.2.0';
import {coachFactsFingerprint,validateCoachReport,COACH_SECTIONS} from './workout-coach-contract.mjs?v=8.2.0';
import {COACH_SOURCES,COACH_EVIDENCE_VERSION} from './coach-evidence.mjs?v=8.2.0';

const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const bytes=value=>new TextEncoder().encode(JSON.stringify(value)).length;
const finite=value=>typeof value==='number'&&Number.isFinite(value);
const text=(value,max=1200)=>typeof value==='string'&&value.length<=max;
const working=set=>!!set&&set.done!==false&&set.valid!==false&&['working','top'].includes(set.role);
const labels={pros:'What went well',cons:'Watch points',fatigue:'Possible fatigue',nextSession:'Next session for these muscles'};
const button=(label,action,date)=>`<button type="button" class="btn small" data-action="${action}" data-date="${escape(date)}">${label}</button>`;
const amount=value=>finite(value)?String(Math.round(value*100)/100):'Unknown';
function loadText(exercise,set,unit){
 if(exercise.loadMode==='band')return set.band||'Band resistance not recorded';
 if(exercise.loadMode==='bodyweight')return 'Bodyweight';
 return `${amount(set.weight)} ${unit}${exercise.loadMode==='perHand'?' per hand':exercise.loadMode==='assistance'?' assistance':''}`;
}
export function compactCoachSnapshot(facts){
 return JSON.parse(JSON.stringify({workout:facts.workout,timing:facts.timing,order:facts.order,findings:facts.findings,limitations:facts.limitations,
  exercises:facts.exercises.map(e=>({exerciseKey:e.exerciseKey,name:e.name,loadMode:e.loadMode,repUnit:e.repUnit,range:e.range,
   loadResponses:(e.loadResponses||[]).map(r=>({text:r.text})),sets:e.sets.filter(s=>s.done&&s.valid&&['working','top'].includes(s.role)).map(s=>({setIndex:s.setIndex,role:s.role,weight:s.weight,reps:s.reps,rir:s.rir,band:s.band||null})),nextSession:e.nextSession}))}));
}
export function readSavedCoachReview(value,date){
 try{
  if(!value||bytes(value)>32768)return null;
  const saved=JSON.parse(JSON.stringify(value)),s=saved.snapshot;
  if(saved.version!==1||!/^[a-f0-9]{64}$/.test(saved.fingerprint)||!Number.isFinite(Date.parse(saved.generatedAt))||saved.model!=='gpt-6-luna'||typeof saved.evidenceVersion!=='string'||saved.evidenceVersion.length>100||!s||s.workout?.date!==date||s.workout?.id!==date||!['lb','kg'].includes(s.workout.units))return null;
  if(!text(s.workout.title,150)||s.workout.status!=='completed'||!s.timing||!Array.isArray(s.timing.notes)||s.timing.notes.length>20||s.timing.notes.some(n=>!text(n))||!Array.isArray(s.order)||s.order.length>12||s.order.some(e=>!e||!text(e.name,150)||!text(e.exerciseKey,80)||!Number.isInteger(e.rank)||typeof e.tied!=='boolean')||!Array.isArray(s.exercises)||s.exercises.length>12||!Array.isArray(s.limitations)||s.limitations.length>30||s.limitations.some(n=>!text(n)))return null;
  if(s.timing.elapsedMinutes!==null&&(!finite(s.timing.elapsedMinutes)||s.timing.elapsedMinutes<0||s.timing.elapsedMinutes>1440))return null;
  for(const e of s.exercises){
   if(!e||!text(e.name,150)||!text(e.exerciseKey,80)||!text(e.range,32)||!['total','perHand','assistance','bodyweight','band','unknown'].includes(e.loadMode)||!['reps','seconds','metres'].includes(e.repUnit)||!Array.isArray(e.sets)||e.sets.length>12||!e.nextSession)return null;
   for(const set of e.sets)if(!set||!Number.isInteger(set.setIndex)||set.setIndex<0||set.setIndex>1000||!['working','top'].includes(set.role)||['weight','reps','rir'].some(k=>set[k]!==null&&(!finite(set[k])||set[k]<0||set[k]>1e7))||set.band!==null&&!text(set.band,80))return null;
   if(e.loadResponses!==undefined&&(!Array.isArray(e.loadResponses)||e.loadResponses.length>3||e.loadResponses.some(r=>!r||!text(r.text,600))))return null;
   const n=e.nextSession;if(!['numeric','manual','unavailable'].includes(n.mode)||!text(n.reason))return null;
   if(n.mode==='numeric'&&(!finite(n.weight)||n.weight<0||!finite(n.reps)||n.reps<=0||!['lb','kg'].includes(n.unit)))return null;
  }
  saved.report=validateCoachReport(saved.report,s);return saved;
 }catch{return null}
}
export function makeSavedCoachReview(facts,envelope){
 const report=validateCoachReport(envelope.report,facts);
 if(envelope.version!==1||!/^[a-f0-9]{64}$/.test(envelope.fingerprint)||!Number.isFinite(Date.parse(envelope.generatedAt))||envelope.model!=='gpt-6-luna'||envelope.evidenceVersion!==COACH_EVIDENCE_VERSION)throw Error('The coach response could not be verified.');
 const saved={version:1,fingerprint:envelope.fingerprint,generatedAt:envelope.generatedAt,completedAt:facts.timing.completedAt,model:envelope.model,evidenceVersion:envelope.evidenceVersion,report,snapshot:compactCoachSnapshot(facts)};
 if(bytes(saved)>32768)throw Error('This review is too large to save. Your workout is still saved.');
 return saved;
}
export function workoutCoachHtml({facts,saved=null,stale=false,busy=false,message='',canGenerate=false,retry=false,celebration=''}={}){
 const snapshot=saved?.snapshot||facts,date=snapshot.workout.date,report=saved?.report;
 const timing=snapshot.timing,order=snapshot.order||[],sources=new Set();
 const sections=COACH_SECTIONS.map(section=>{
  const comments=new Map((report?.[section]||[]).map(item=>[item.findingId,item]));
  const findings=snapshot.findings[section]||[];
  return findings.length?`<section><h3>${labels[section]}</h3>${findings.map(f=>{const comment=comments.get(f.id);for(const id of comment?.sourceIds||[])sources.add(id);return `<div class="callout"><p>${escape(f.text)}</p>${comment?`<p class="sub">${escape(comment.comment)}</p>`:''}</div>`}).join('')}</section>`:'';
 }).join('');
 const measurements=snapshot.exercises.map(e=>`<details><summary>${escape(e.name)} · ${e.sets.filter(working).length} logged working/top sets</summary><div class="tableScroll"><table><thead><tr><th>Set</th><th>Load</th><th>${escape(e.repUnit)}</th><th>RIR</th></tr></thead><tbody>${e.sets.filter(working).map(s=>`<tr><td>${escape(s.setIndex+1)}</td><td>${escape(loadText(e,s,snapshot.workout.units))}</td><td>${escape(amount(s.reps))}</td><td>${escape(amount(s.rir))}</td></tr>`).join('')}</tbody></table></div><p class="tiny">Chosen range: ${escape(e.range)}. Working and top sets only; warm-ups, ramps, backoffs and drops stay separate.</p>${e.nextSession?.mode==='numeric'?`<p><b>Next-session starting target:</b> ${escape(loadText(e,{weight:e.nextSession.weight},e.nextSession.unit))} × ${escape(e.nextSession.reps)} reps.</p>`:''}<p class="sub">${escape(e.nextSession?.reason||'No load target is available.')}</p>${(e.loadResponses||[]).length?`<h4>Load and effort response</h4>${e.loadResponses.map(r=>`<p class="sub">${escape(r.text)}</p>`).join('')}`:''}</details>`).join('');
 return `<div class="eyebrow">${saved?'Saved AI workout review':'Your workout record'}</div><h2>${escape(report?.headline||'Workout complete')}</h2><p class="sub">${escape(snapshot.workout.title)} · ${escape(date)}</p>${celebration}${stale?'<div class="callout">Earlier workout snapshot. Your entries or progression context have changed since this report was saved. The original review remains available.</div>':''}${report?`<p>${escape(report.overview)}</p>`:'<p>Your completed workout is saved. The measurements below come from your logged entries.</p>'}${busy?'<p role="status">Preparing your AI coach review… You can close this screen while it finishes.</p>':''}${message?`<p class="sub" role="status">${escape(message)}</p>`:''}<section><h3>Recorded workout window</h3><p>${finite(timing.elapsedMinutes)?`${escape(amount(timing.elapsedMinutes))} minutes from the first valid Done check to completion.`:'A reliable workout window is not available.'}</p><p class="tiny">This is a logging-window estimate. It excludes time before the first check and can include pauses; active exercise time and rest are not measured.</p>${timing.notes.map(n=>`<p class="tiny">${escape(n)}</p>`).join('')}<h3>Recorded exercise order</h3>${order.length?`<ol>${order.map(e=>`<li>${escape(e.name)}${e.tied?' · tied check time':''}</li>`).join('')}</ol>`:'<p class="sub">No reliable chronological order is available.</p>'}<p class="tiny">Ordered by the first valid working/top Done check, including exercises performed out of plan order. Supersets can interleave; unknown checks cannot be ordered.</p></section>${sections}<section><h3>Actual sets and next-session targets</h3>${measurements||'<p>No valid checked working/top sets were available.</p>'}</section><details><summary>What this review can tell you</summary>${snapshot.limitations.map(n=>`<p class="tiny">${escape(n)}</p>`).join('')}<p class="tiny">Advice is based on your record and selected published training guidance. It does not change your plan or measure technique, pain or physiological fatigue.</p></details>${sources.size?`<details><summary>Published guidance used</summary><ul>${COACH_SOURCES.filter(s=>sources.has(s.id)).map(s=>`<li><a href="${escape(s.url)}" target="_blank" rel="noopener noreferrer">${escape(s.title)}</a></li>`).join('')}</ul></details>`:''}<div class="row wrap" style="margin-top:20px">${!busy&&canGenerate?button(saved?'Update AI review':retry?'Try AI review again':'Generate AI review',saved||retry?'coach-regenerate':'coach-generate',date):''}${button('Close','close-modal',date)}</div><p class="tiny">Saved AI reviews are free to reopen. Updating uses a separate coach allowance and never uses a gym-search attempt.</p>`;
}

// UI lifetime is independent from request lifetime: closing a report cannot
// reopen a dialog over a form. Account changes abort and invalidate all work.
export class WorkoutCoachReview{
 constructor({getState,getContext,requireContext,getServices,isOnline=()=>true,present,persist,onSaved=()=>{},canGenerate=()=>false,buildFacts=buildWorkoutCoachFacts,fingerprint=coachFactsFingerprint}){
  Object.assign(this,{getState,getContext,requireContext,getServices,isOnline,present,persist,onSaved,canGenerate,buildFacts,fingerprint});this.view=null;this.pending=null;this.generation=0;this.attempted=new Set();
 }
 dismiss(){this.view=null}
 cancel(){this.attempted.clear();this.generation++;this.view=null;this.pending?.controller.abort();this.pending=null}
 paint(view){if(this.view===view)this.present(workoutCoachHtml(view))}
 async open(date,{autoGenerate=false,regenerate=false,celebration=''}={}){
  const context=this.getContext(),generation=this.generation;
  const saved=readSavedCoachReview(this.getState().logs?.[date]?.workoutCoach,date);
  let facts;try{facts=this.buildFacts(this.getState(),date)}catch(error){
   if(!saved)throw Error(error.message||'Complete this workout before opening its review.');
   const view={date,context,facts:saved.snapshot,saved,stale:true,busy:false,message:'This workout is open for editing. Complete it again before requesting an updated AI review.',canGenerate:false,celebration};this.view=view;this.paint(view);return;
  }
  const view={date,context,facts,saved,stale:false,busy:false,message:'',canGenerate:this.canGenerate(),retry:this.attempted.has(date),celebration};this.view=view;this.paint(view);
  try{view.fingerprint=await this.fingerprint(facts);this.requireContext(context);if(generation!==this.generation)return;
   view.stale=!!saved&&saved.fingerprint!==view.fingerprint;this.paint(view);
   if((regenerate||autoGenerate&&!saved)&&this.pending){view.message='A coach review is already being prepared. Reopen this workout after it finishes.';this.paint(view)}
   else if(autoGenerate&&!saved&&view.retry&&!regenerate){view.message='A review was already requested for this workout. Trying again is a separate allowance attempt.';this.paint(view)}
   else if((regenerate||autoGenerate&&!saved)&&this.canGenerate())await this.generate(view,{regenerate});
  }catch(error){if(this.view===view){view.busy=false;view.message=error.message||'The review could not be prepared. Your workout is saved.';this.paint(view)}}
 }
 async generate(view,{regenerate=false}={}){
  if(this.pending){view.message='A coach review is already being prepared. Reopen this workout after it finishes.';this.paint(view);return}
  if(!this.isOnline()){view.message='You are offline. Your workout is saved; a saved AI review can still be reopened.';this.paint(view);return}
  const services=this.getServices();if(!services?.enabled||!this.canGenerate()){view.message='AI coach reports are not enabled yet. Your workout is saved.';this.paint(view);return}
  const generation=this.generation,controller=new AbortController(),pending={controller};this.pending=pending;view.busy=true;this.paint(view);
  try{
   this.requireContext(view.context);
   this.attempted.add(view.date);view.retry=true;
   const response=await services.coachReport({facts:view.facts,fingerprint:view.fingerprint,regenerate},{signal:controller.signal});
   const data=await response.json();this.requireContext(view.context);if(generation!==this.generation||controller.signal.aborted)return;
   if(!response.ok){
    const reasons={regeneration_required:'A review was already attempted. Trying again uses a separate coach attempt.',day_limit:'This workout has reached its review-attempt limit.',busy:'A coach report is already being prepared. Try reopening it shortly.',cooldown:'Please wait a moment before requesting another review.',limit:'Your coach report allowance is used. Saved reviews remain available.',global_limit:'The beta coach allowance is used. Saved reviews remain available.'};
    const messages={COACH_DISABLED:'AI coach reports are not enabled yet.',DISABLED:'AI coach reports are not enabled yet.',COACH_UNAVAILABLE:'AI coach reports are temporarily unavailable.'};
    throw Error(reasons[data?.reason]||messages[data?.error]||'The AI review could not be completed. Your workout is saved. Trying again may use another coach attempt.');
   }
   const envelope=data.result||data.review||data;
   if(envelope.fingerprint!==view.fingerprint)throw Error('This response belongs to a different workout snapshot. Your workout is saved.');
   const saved=makeSavedCoachReview(view.facts,envelope),current=this.buildFacts(this.getState(),view.date);
   if(await this.fingerprint(current)!==view.fingerprint||JSON.stringify(this.buildFacts(this.getState(),view.date))!==JSON.stringify(current))throw Error('Your workout or progression context changed while the review was prepared. Your newer entries are preserved.');
   this.requireContext(view.context);if(generation!==this.generation||controller.signal.aborted)return;
   await this.persist(view.date,saved,view.context);view.saved=saved;view.stale=false;view.message='Saved with this workout. Reopen it from Workout summary at any time.'+(Number.isSafeInteger(data.quota?.remaining)&&Number.isSafeInteger(data.quota?.limit)?` ${data.quota.remaining} of ${data.quota.limit} coach attempts remaining.`:'');this.onSaved();
  }catch(error){if(generation===this.generation&&!controller.signal.aborted)view.message=error.message||'The AI review could not be saved. Your workout is preserved.'}
  finally{if(this.pending===pending)this.pending=null;view.busy=false;if(generation===this.generation)this.paint(view)}
 }
}
