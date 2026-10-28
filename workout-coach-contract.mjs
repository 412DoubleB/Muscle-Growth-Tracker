// Shared, bounded data contract. Workout text is data, never model instructions.
import {COACH_SOURCES} from './coach-evidence.mjs?v=8.2.0';

export const COACH_FACTS_VERSION=1;
export const COACH_FACTS_MAX_BYTES=32768;
export const COACH_REPORT_MAX_BYTES=14000;
export const COACH_SECTIONS=Object.freeze(['pros','cons','fatigue','nextSession']);
const WORKOUT_KEYS=new Set(['id','date','title','kind','status','units','goal','trainingStyle','experience','ageBand','run']);
const FACT_KEYS=new Set(['version','workout','timing','order','events','exercises','findings','limitations','completion','context','binding','nutrition','nextMuscleSessions','nextMuscleDays','evidenceVersion','truncated','upcoming']);
const SENSITIVE_KEYS=new Set(['email','password','accesstoken','refreshtoken','authorization','apikey','openaiapikey','photo','ownerid','userid','session','medicalnotes']);
const CONTROL=/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;
const SECRET=/sk-(?:proj-)?[A-Za-z0-9_-]{12,}|sb_secret_[A-Za-z0-9_-]{12,}|\bBearer\s+[A-Za-z0-9._-]{12,}|\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{16,}\b/;
const EMAIL=/\b[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const ID=/^[A-Za-z][A-Za-z0-9_-]{0,79}$/;
const ROLES=new Set(['working','top','warmup','ramp','backoff','drop']);
const MODES=new Set(['total','perHand','assistance','bodyweight','band','unknown']);
const encoder=new TextEncoder();
const record=value=>!!value&&typeof value==='object'&&!Array.isArray(value)&&(Object.getPrototypeOf(value)===Object.prototype||Object.getPrototypeOf(value)===null);
const REPORT_RULES=new Set(['shape','prose_number','prose_markup','prose_private','prose_medical','fatigue_uncertainty','finding_coverage','source_ids','size']);

export class CoachContractError extends Error{
 constructor(code='invalid_coach_facts',_status,validationRule='shape'){
  const safe=['invalid_coach_facts','invalid_coach_report','coach_fingerprint_unavailable'].includes(code)?code:'invalid_coach_facts';
  super(safe==='invalid_coach_report'?'The coach report could not be verified.':'The workout review data could not be verified.');this.name='CoachContractError';this.code=safe;this.status=safe==='invalid_coach_report'?502:safe==='coach_fingerprint_unavailable'?503:400;
  if(safe==='invalid_coach_report')this.validationRule=REPORT_RULES.has(validationRule)?validationRule:'shape';
 }
}
const badFacts=()=>{throw new CoachContractError()};
const badReport=(rule='shape')=>{throw new CoachContractError('invalid_coach_report',502,rule)};
function exact(value,keys,fail){if(!record(value)||Object.keys(value).length!==keys.length||keys.some(key=>!Object.hasOwn(value,key)))fail();}
function cleanText(value,max,{empty=false,fail=badFacts}={}){
 if(typeof value!=='string'||value.length>max||CONTROL.test(value)||SECRET.test(value)||EMAIL.test(value)||!empty&&!value.trim())fail();return value.trim();
}
const integer=(value,max=10000)=>Number.isInteger(value)&&value>=0&&value<=max;
function date(value){return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T12:00:00Z'))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;}
function timestamp(value){
 if(value===null)return true;
 if(typeof value!=='string')return false;
 const m=value.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|[+-]\d{2}:\d{2})$/);
 if(!m||!date(m[1])||+m[2]>23||+m[3]>59||+m[4]>59)return false;
 const zone=m[6],hours=zone==='Z'?0:+zone.slice(1,3),minutes=zone==='Z'?0:+zone.slice(4);
 if(hours>14||minutes>59||hours===14&&minutes!==0)return false;
 const ms=Date.parse(value),offset=(hours*60+minutes)*(zone.startsWith('-')?-1:1);
 return Number.isFinite(ms)&&new Date(ms+offset*60000).toISOString().slice(0,23)===`${m[1]}T${m[2]}:${m[3]}:${m[4]}.${(m[5]||'').padEnd(3,'0')}`;
}
function cloneJson(value,depth=0,count={nodes:0}){
 if(depth>12||++count.nodes>6000)badFacts();
 if(value===null||typeof value==='boolean')return value;
 if(typeof value==='number'){if(!Number.isFinite(value)||Math.abs(value)>1e15)badFacts();return value;}
 if(typeof value==='string')return cleanText(value,1200,{empty:true});
 if(Array.isArray(value)){if(value.length>200)badFacts();return value.map(item=>cloneJson(item,depth+1,count));}
 if(!record(value)||Object.keys(value).length>64)badFacts();
 const out={};
 for(const key of Object.keys(value)){
  if(!/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(key)||['constructor','prototype'].includes(key)||SENSITIVE_KEYS.has(key.toLowerCase().replace(/[^a-z]/g,'')))badFacts();
  const descriptor=Object.getOwnPropertyDescriptor(value,key);if(!descriptor||!Object.hasOwn(descriptor,'value'))badFacts();
  out[key]=cloneJson(descriptor.value,depth+1,count);
 }
 return out;
}
function checkTiming(timing){
 if(!record(timing))badFacts();
 for(const key of ['firstCheckAt','lastCheckAt','completedAt'])if(!Object.hasOwn(timing,key)||!timestamp(timing[key]))badFacts();
 for(const key of ['knownChecks','unknownChecks','knownWorkingChecks','unknownWorkingChecks'])if(!integer(timing[key],2400))badFacts();
 if(!Array.isArray(timing.notes)||timing.notes.length>20||timing.notes.some(item=>typeof item!=='string'))badFacts();
 if(timing.elapsedMinutes!==null){
  if(typeof timing.elapsedMinutes!=='number'||timing.elapsedMinutes<0||timing.elapsedMinutes>1440||!timing.firstCheckAt||!timing.completedAt)badFacts();
  const elapsed=Date.parse(timing.completedAt)-Date.parse(timing.firstCheckAt);
  if(elapsed<0||elapsed>86400000||timing.lastCheckAt&&Date.parse(timing.lastCheckAt)>Date.parse(timing.completedAt)||Math.abs(timing.elapsedMinutes-elapsed/60000)>1)badFacts();
 }
}
function checkExercise(exercise,keys){
 if(!record(exercise)||!ID.test(exercise.exerciseKey)||keys.has(exercise.exerciseKey))badFacts();keys.add(exercise.exerciseKey);
 cleanText(exercise.name,150);if(exercise.exerciseId!==null)cleanText(exercise.exerciseId,240);
 if(!MODES.has(exercise.loadMode)||!['reps','seconds','metres'].includes(exercise.repUnit)||!Array.isArray(exercise.sets)||exercise.sets.length>40)badFacts();
 const indices=new Set();
 for(const set of exercise.sets){
  if(!record(set)||!integer(set.setIndex,1000)||!ROLES.has(set.role)||typeof set.done!=='boolean'||typeof set.valid!=='boolean')badFacts();
  if(indices.has(set.setIndex)||set.valid&&!set.done)badFacts();indices.add(set.setIndex);
  for(const key of ['weight','reps'])if(set[key]!==null&&(typeof set[key]!=='number'||set[key]<0||set[key]>1e7))badFacts();
  if(set.rir!==null&&(typeof set.rir!=='number'||set.rir<0||set.rir>10)||set.checkedAt!==undefined&&!timestamp(set.checkedAt))badFacts();
  if(set.valid&&(set.reps===null||set.reps<=0||exercise.repUnit==='reps'&&!Number.isInteger(set.reps)||!['band','bodyweight'].includes(exercise.loadMode)&&exercise.repUnit==='reps'&&set.weight===null))badFacts();
 }
 if(exercise.loadResponses!==undefined){
  if(!Array.isArray(exercise.loadResponses)||exercise.loadResponses.length>3)badFacts();
  const point=value=>{
   exact(value,['setIndex','weight','reps','rir','date','checkedAt'],badFacts);
   if(!integer(value.setIndex,1000)||!date(value.date)||!timestamp(value.checkedAt))badFacts();
   for(const key of ['weight','reps','rir'])if(value[key]!==null&&(typeof value[key]!=='number'||value[key]<0||value[key]>(key==='rir'?10:1e7)))badFacts();
  };
  for(const response of exercise.loadResponses){
   exact(response,['kind','basis','from','to','harderLoadDelta','repDelta','rirDelta','text'],badFacts);
   if(!['harder-load-overshot-target','harder-load-in-range','spare-capacity','lower-load-response'].includes(response.kind)||!['within-workout','previous-workout','current-set'].includes(response.basis))badFacts();
   if(response.from!==null)point(response.from);point(response.to);cleanText(response.text,600);
   for(const key of ['harderLoadDelta','repDelta','rirDelta'])if(response[key]!==null&&(typeof response[key]!=='number'||Math.abs(response[key])>1e7))badFacts();
  }
 }
 if(!record(exercise.nextSession)||!['numeric','manual','unavailable'].includes(exercise.nextSession.mode))badFacts();
 if(exercise.nextSession.mode==='numeric'){
  const n=exercise.nextSession;
  if(exercise.repUnit!=='reps'||['band','bodyweight','unknown'].includes(exercise.loadMode)||typeof n.weight!=='number'||n.weight<0||n.weight>1e7||typeof n.reps!=='number'||n.reps<=0||n.reps>1000||!['lb','kg'].includes(n.unit))badFacts();
 }
}
function findingMap(value,fail=badFacts){
 let findings;try{findings=cloneJson(value)}catch{fail()}
 exact(findings,COACH_SECTIONS,fail);const ids=new Set();
 for(const section of COACH_SECTIONS){
  const list=findings[section];if(!Array.isArray(list)||list.length>4)fail();
  for(const finding of list){if(!record(finding)||!ID.test(finding.id)||ids.has(finding.id))fail();ids.add(finding.id);cleanText(finding.text,700,{fail});}
 }
 return findings;
}
export function normalizeCoachFacts(value){
 if(!record(value)||Object.keys(value).some(key=>!FACT_KEYS.has(key)))badFacts();
 const facts=cloneJson(value);
 if(encoder.encode(JSON.stringify(facts)).length>COACH_FACTS_MAX_BYTES||facts.version!==COACH_FACTS_VERSION)badFacts();
 if(!record(facts.workout)||Object.keys(facts.workout).some(key=>!WORKOUT_KEYS.has(key)))badFacts();
 const w=facts.workout;
 if(!date(w.date)||w.id!==w.date||w.status!=='completed'||!['strength','run','rest'].includes(w.kind)||!['lb','kg'].includes(w.units))badFacts();
 for(const key of ['title','goal','trainingStyle','experience'])cleanText(w[key],150,{empty:key==='goal'});
 if(w.run!==undefined&&w.run!==null){
  exact(w.run,['markedDone','plannedMinutes','type'],badFacts);
  if(typeof w.run.markedDone!=='boolean'||w.run.plannedMinutes!==null&&(typeof w.run.plannedMinutes!=='number'||w.run.plannedMinutes<=0||w.run.plannedMinutes>1440))badFacts();
  cleanText(w.run.type,100);
 }
 checkTiming(facts.timing);
 if(!Array.isArray(facts.order)||!Array.isArray(facts.events)||!Array.isArray(facts.exercises)||facts.exercises.length>30||!Array.isArray(facts.limitations)||facts.limitations.length>30)badFacts();
 const exerciseKeys=new Set();for(const exercise of facts.exercises)checkExercise(exercise,exerciseKeys);
 for(const event of [...facts.order,...facts.events]){
  if(!record(event)||!exerciseKeys.has(event.exerciseKey)||!integer(event.rank,2400)||typeof event.tied!=='boolean')badFacts();
  const stamp=Object.hasOwn(event,'checkedAt')?event.checkedAt:event.firstCheckAt;if(!stamp||!timestamp(stamp))badFacts();
  if(stamp.slice(0,10)!==w.date)badFacts();
 }
 const eventKeys=new Set();
 for(const event of facts.events){
  const exercise=facts.exercises.find(e=>e.exerciseKey===event.exerciseKey),set=exercise.sets.find(s=>s.setIndex===event.setIndex),key=event.exerciseKey+':'+event.setIndex;
  if(eventKeys.has(key)||!set?.valid||!set.done||event.role!==set.role||event.checkedAt!==set.checkedAt)badFacts();eventKeys.add(key);
 }
 findingMap(facts.findings);
 return facts;
}
const canonical=value=>JSON.stringify(value,(_key,item)=>record(item)?Object.fromEntries(Object.keys(item).sort().map(key=>[key,item[key]])):item);
export async function coachFactsFingerprint(value){
 const facts=normalizeCoachFacts(value);if(!globalThis.crypto?.subtle)throw new CoachContractError('coach_fingerprint_unavailable',503);
 const digest=await globalThis.crypto.subtle.digest('SHA-256',encoder.encode(canonical(facts)));return Array.from(new Uint8Array(digest),n=>n.toString(16).padStart(2,'0')).join('');
}
function coachProse(value,max){
 if(typeof value!=='string')badReport('shape');
 if(value.length>max)badReport('size');
 if(CONTROL.test(value)||SECRET.test(value)||EMAIL.test(value))badReport('prose_private');
 const text=cleanText(value,max,{fail:badReport});
 // Numerical prescriptions come only from MENEI's deterministic facts table.
 const words='(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|dozen|half|quarter)';
 const units='(?:pounds?|kilograms?|lbs?|kg|reps?|repetitions?|sets?|rounds?|minutes?|seconds?|hours?|rir|percent|percentage|plates?|increments?)';
 // Ordinary wording such as "one useful baseline" is not a load prescription.
 const numberedUnit=new RegExp('\\b'+words+'(?:[-\\s]+[a-z]+){0,2}[-\\s]+'+units+'\\b','i');
 const changeBy=new RegExp('\\bby\\s+(?:a\\s+)?'+words+'\\b','i');
 const barePrescription=new RegExp('\\b(?:increase|decrease|add|subtract|reduce|raise|lower|use|perform|do|complete|aim|target|rest|wait|go up|go down)\\b[^.!?]{0,50}\\b'+words+'\\s*[.!?]?(?:$|\\n)','i');
 const fractionalLoad=/\b(?:half|quarter)\b[^.!?]{0,24}\b(?:load|weight|resistance|volume)\b/i;
 // Keep spelled-out quantities blocked even when a prescription omits its
 // unit. Only a narrow reference to a data artifact can use the article one.
 const quantities=text.replace(/\bone(?:\s+(?:useful|helpful|recorded|initial|current|logged)){0,2}\s+(?:baseline|snapshot|observation|comparison|example|reference|record)\b/gi,'a recorded comparison');
 if(/\p{N}/u.test(text)||new RegExp('\\b'+words+'\\b','i').test(quantities)||numberedUnit.test(text)||changeBy.test(text)||barePrescription.test(text)||fractionalLoad.test(text))badReport('prose_number');
 if(/https?:\/\/|www\.|[<>`\[\]]|\*\*|__|(?:^|\n)\s*#/i.test(text))badReport('prose_markup');
 // A statement about the limits of a review is not a diagnosis. Assertions
 // about an injury or condition still fail, including unsupported exclusions.
 const claims=text.replace(/\bnot\s+(?:a|an)\s+(?:(?:medical|injury)\s+)?diagnosis\b/gi,'')
  .replace(/\b(?:cannot|can['’]t|does not|do not)\s+diagnose(?:\s+(?:an?|any))?(?:\s+(?:injury|injuries|medical condition))?\b/gi,'');
 if(/\b(?:overtraining syndrome|central nervous system fatigue|CNS fatigue|tendinitis|tendonitis|diagnos\w*|injur\w*)\b/i.test(claims))badReport('prose_medical');
 return text;
}
export function validateCoachReport(value,input){
 // A saved report may carry a compact immutable findings snapshot, rather than
 // duplicate all raw workout sets. Validate against that original map directly.
 if(!record(input))badReport();const findings=findingMap(input.findings,badReport);
 try{value=cloneJson(value)}catch{badReport()}
 exact(value,['version','headline','overview',...COACH_SECTIONS],badReport);
 if(value.version!==1)badReport();
 const report={version:1,headline:coachProse(value.headline,120),overview:coachProse(value.overview,700)},sources=new Set(COACH_SOURCES.map(source=>source.id));
 for(const section of COACH_SECTIONS){
  const expected=findings[section],allowed=new Set(expected.map(finding=>finding.id)),seen=new Set(),list=value[section];
  if(!Array.isArray(list)||list.length!==expected.length||list.length>4)badReport('finding_coverage');
  const items=new Map();
  for(const item of list){
   exact(item,['findingId','comment','sourceIds'],badReport);
   if(!allowed.has(item.findingId)||seen.has(item.findingId))badReport('finding_coverage');
   if(!Array.isArray(item.sourceIds)||item.sourceIds.length>3||new Set(item.sourceIds).size!==item.sourceIds.length||item.sourceIds.some(id=>!sources.has(id)))badReport('source_ids');
   seen.add(item.findingId);const comment=coachProse(item.comment,450);
   if(section==='fatigue'&&!/\b(?:possible|may|might|could|uncertain|unknown|insufficient)\b|\b(?:cannot|can['’]t)\s+(?:be\s+)?(?:measure|locate|determine|establish|identify)|\b(?:does|do|did)\s+not\s+(?:measure|locate|determine|establish|identify)|\bnot\s+(?:measured|established|known|enough|certain)\b/i.test(comment))badReport('fatigue_uncertainty');
   items.set(item.findingId,{findingId:item.findingId,comment,sourceIds:item.sourceIds.slice()});
  }
  report[section]=expected.map(finding=>items.get(finding.id));
 }
 if(encoder.encode(JSON.stringify(report)).length>COACH_REPORT_MAX_BYTES)badReport('size');return report;
}
export function coachReportSchema(value){
 const facts=normalizeCoachFacts(value),sourceIds=COACH_SOURCES.map(source=>source.id),prose=max=>({type:'string',minLength:1,maxLength:max});
 const properties={version:{type:'integer',enum:[1]},headline:prose(120),overview:prose(700)};
 for(const section of COACH_SECTIONS){
  const ids=facts.findings[section].map(finding=>finding.id);
  properties[section]={type:'array',minItems:ids.length,maxItems:ids.length,items:{type:'object',additionalProperties:false,required:['findingId','comment','sourceIds'],properties:{findingId:ids.length?{type:'string',enum:ids}:{type:'string',enum:['no_findings']},comment:prose(450),sourceIds:{type:'array',maxItems:3,items:{type:'string',enum:sourceIds}}}}};
 }
 return {type:'object',additionalProperties:false,required:['version','headline','overview',...COACH_SECTIONS],properties};
}
