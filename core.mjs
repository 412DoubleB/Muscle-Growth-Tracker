import {resolveLoadSetup,loadChangeOptions,reachableLoadOptions,recommendedLoadOptions,describeLoadChange} from './equipment-loads.mjs?v=8.2.0';
import {withoutCompletionTiming} from './session-order.mjs?v=8.2.0';
import {encodeRecoverySnapshots,readRecoverySnapshots,isStorageQuotaError} from './recovery.mjs?v=8.2.0';
export {readRecoverySnapshots} from './recovery.mjs?v=8.2.0';
import {splitSession,trainingStyle,runningSession} from './training.mjs?v=8.2.0';
import {autoSupersets,progressionContext} from './supersets.mjs?v=8.2.0';
import { LEGACY_PLAN, LEGACY_MASTERS, LEGACY_EQUIPMENT, detailedGuide } from './legacy.mjs?v=8.2.0';
import { buildCatalog } from './catalog.mjs?v=8.2.0';

export const VERSION='8.2.0';
export const CATALOG=buildCatalog(LEGACY_MASTERS,LEGACY_PLAN);
export const EQUIPMENT=[...new Set([...LEGACY_EQUIPMENT,...CATALOG.flatMap(e=>e.equipmentRequirements.flat()),'Flat Bench','Cable Station','Squat Rack','Dip / Pull-up Station','Bench','Preacher Bench','Olympic Plates'])].sort();
export const clone=v=>structuredClone(v);
// Compare the JSON sent to cloud storage without treating object key order as
// data. Arrays retain their order; optional properties follow JSON wire rules.
export const canonicalJson=value=>JSON.stringify(value,(_key,item)=>item&&typeof item==='object'&&!Array.isArray(item)?Object.fromEntries(Object.keys(item).sort().map(key=>[key,item[key]])):item);
export const jsonEqual=(a,b)=>canonicalJson(a)===canonicalJson(b);
export function orderReviewedSnapshots(entries){const originals=entries.filter(entry=>entry?.kind!=='reviewed-conflict'),reviews=entries.filter(entry=>entry?.kind==='reviewed-conflict').sort((a,b)=>String(a.id)<String(b.id)?-1:String(a.id)>String(b.id)?1:0);return [...originals,...reviews]}
export const uid=()=>globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const iso=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export const dateOf=s=>new Date(`${s}T12:00:00`);
export const addDays=(s,n)=>{const d=dateOf(s);d.setDate(d.getDate()+n);return iso(d)};
export const daysBetween=(a,b)=>Math.round((Date.UTC(...a.split('-').map((v,i)=>i===1?+v-1:+v))-Date.UTC(...b.split('-').map((v,i)=>i===1?+v-1:+v)))/86400000);
export const norm=s=>String(s??'').toLowerCase().replace(/[^a-z0-9]/g,'');
export const now=()=>new Date().toISOString();
export const touch=v=>({...v,updatedAt:now()});
export function exerciseFor(name){return CATALOG.find(e=>e.id===name||norm(e.name)===norm(name)||e.aliases?.some(a=>norm(a)===norm(name)))}
export function guideFor(e){const g=detailedGuide(e.name,e.equipmentLabel||'',e.group);const special=/lean.away|cable rear.delt|dumbbell calf raise/i.test(e.name);return {...g,setup:!special&&g.setup.length>(e.setup?.length||0)?g.setup:e.setup||g.setup,cues:!special&&g.cues.length>(e.cues?.length||0)?g.cues:e.cues||g.cues,mistakes:!special&&g.mistakes.length>(e.mistakes?.length||0)?g.mistakes:e.mistakes||g.mistakes}}
const stationInventory=['Dumbbells','Barbell','Olympic Plates','EZ Bar','Bench','Adjustable Bench','Decline Bench','Dual Cable / Functional Trainer','Single Cable Column','Cable Station','Lat Pulldown','Landmine','T-Bar Row','Preacher Bench','Dip Station','Rope Attachment','Straight Bar Attachment','V-Bar Attachment','D-Handles','Row Handles'];
export function defaultState(){const t=now();return {schemaVersion:8,id:uid(),createdAt:t,updatedAt:t,ownerId:null,profile:{name:'',gender:'Male',skinTone:'medium',age:'',weight:'',heightFt:'',heightIn:'',goalWeight:'',units:'lb',updatedAt:t},training:{mode:'original',frequency:4,experience:'Intermediate',split:'seven',supersetMode:'off',trainingStyle:'hypertrophy',restSeconds:120,runningQuality:false,sets:3,range:'8-10',targetRir:2,minRepeatDays:14,excludePullups:true,runEvery:2,saunaMinutes:20,restWeekdays:[0],startDate:iso(),defaultGym:'crunch',updatedAt:t},nutrition:{calories:2400,protein:200,carbs:220,fat:75,servings:1,horizon:1,goal:'muscle',mealRepeatDays:2,mealCategories:[],breakfastCategories:[],snackCategories:[],allergens:[],exclude:'',diet:'Any',notes:'',updatedAt:t},gyms:[{id:'crunch',name:'Crunch Pleasant Hills',inventory:LEGACY_EQUIPMENT.slice(),dbMax:120,increment:5,notes:'Equipment estimate: review against your gym.',updatedAt:t},{id:'station',name:'Fire Station',inventory:stationInventory,dbMax:100,increment:5,notes:'Station equipment from the project: dumbbells to 100 lb, bar/plates, benches, dual cables, pulldown, landmine, T-bar, EZ bar, preacher bench, dips.',updatedAt:t}],gymSchedules:[{id:'fire-shift',gymId:'station',type:'interval',every:4,start:'2026-10-04',durationDays:1,priority:10,weekdays:[],updatedAt:t}],plan:{},logs:{},recipes:[],meals:{},pantry:[],leftovers:[],shoppingChecks:{},reminders:{enabled:false,time:'12:00',timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,workout:true,meals:false,updatedAt:t},avoided:[],customExercises:[],routines:[],legacySnapshots:[],conflicts:[],resolvedConflicts:[]}}

// Explicit display-unit conversion. Imported raw snapshots and gym pound limits stay intact.
export function convertLoadUnits(current,units){
 if(!['lb','kg'].includes(units))throw Error('Choose lb or kg.');const state=clone(current),old=state.profile.units||'lb';if(old===units)return state;
 const factor=units==='kg'?.45359237:1/.45359237;
 for(const day of [...Object.values(state.logs),...Object.values(state.plan),...(state.routines||[]).map(r=>({exercises:r.exercises}))]){
  for(const e of day.exercises||[]){for(const set of [...(e.sets||[]),...(e.setTemplates||[])])if(usableNumber(set.w))set.w=Math.round(+set.w*factor*100)/100;
   if(usableNumber(e.increment)&&+e.increment>0){e.incrementsByUnit={...e.incrementsByUnit,[old]:+e.increment};e.increment=+e.incrementsByUnit[units]>0?+e.incrementsByUnit[units]:units==='kg'?2.5:5}}
  day.updatedAt=now();
 }
 for(const key of ['weight','goalWeight'])if(usableNumber(state.profile[key]))state.profile[key]=Math.round(+state.profile[key]*factor*10)/10;
 state.profile.units=units;return state;
}

const inventoryAliases={'Squat Rack':['Squat Rack / Power Rack'],'Bench':['Flat Bench'],'Cable Station':['Single Cable Column'],'Seated Row':['Seated Cable Row'],'Leg Press':['Leg Press 45°'],'Pec Deck / Reverse Pec Deck':['Pec Deck / Chest Fly','Reverse Pec Deck'],'Calf Machine':['Standing Calf Raise','Seated Calf Raise'],'Dip / Pull-up Station':['Dip Station','Pull-up Bar'],'Chest Press Machine':['Selectorized Chest Press'],'Shoulder Press Machine':['Selectorized Shoulder Press'],'Hammer Strength / Plate Loaded':['Hammer Strength Incline Press','Hammer Strength Flat / Horizontal Press','Hammer Strength Decline Press','Hammer Strength Shoulder Press','Hammer Strength High Row','Hammer Strength Low Row','Hammer Strength Iso-Lateral Row','Plate-Loaded Row']};
export function normalizedInventory(g){const s=new Set(g.inventory||[]);for(const x of [...s])for(const a of inventoryAliases[x]||[])s.add(a);if(s.has('Dual Cable / Functional Trainer')||s.has('Cable Crossover'))s.add('Single Cable Column');if(s.has('Adjustable Bench')){s.add('Bench');s.add('Flat Bench')}return s}
export function missingEquipment(e,g){const inv=normalizedInventory(g||{inventory:[]});return (e?.equipmentRequirements||e?.equipment||[]).filter(options=>!(Array.isArray(options)?options:[options]).some(x=>x==='Bodyweight'||inv.has(x))).map(x=>Array.isArray(x)?x.join(' or '):x)}
export const supports=(e,g)=>!!e&&missingEquipment(e,g).length===0;
export function scheduledGym(state,date){let rules=state.gymSchedules.filter(r=>!r.deleted&&(!r.start||date>=r.start)&&(!r.end||date<=r.end)).sort((a,b)=>(b.priority||0)-(a.priority||0));for(const r of rules){const delta=daysBetween(date,r.start||date);const every=Math.max(1,+r.every||1)*(r.type==='weeks'?7:1);const matches=['interval','weeks'].includes(r.type)?delta>=0&&delta%every<(+r.durationDays||1):r.type==='weekly'&&(r.weekdays||[]).map(Number).includes(dateOf(date).getDay());if(matches){const gym=state.gyms.find(g=>g.id===r.gymId&&!g.deleted);if(gym)return gym}}return state.gyms.find(g=>g.id===state.training.defaultGym&&!g.deleted)||state.gyms.find(g=>!g.deleted)}
export function setsFor(e,type='straight',count=e.sets||3){return Array.from({length:count},(_,i)=>({id:uid(),role:type==='top'?(i===0?'top':'backoff'):type==='drop'?(i===0?'working':'drop'):type==='ramp'?(i===count-1?'working':'ramp'):'working',w:'',r:'',rir:'',done:false,rest:type==='drop'&&i>0?15:120}))}
export function makeExercise(e,{type='straight',count=e.sets||3,range=e.range||'8-12'}={}){return {id:uid(),exerciseId:e.id,name:e.name,range,setType:type,loadMode:e.loadMode||'total',sets:setsFor(e,type,count),notes:''}}
export function rangeOf(s){let [lo,hi]=String(s).split('-').map(Number);if(!Number.isFinite(lo)||lo<1)return[8,12];return[lo,Number.isFinite(hi)?hi:lo]}
const usableNumber=value=>(typeof value==='number'||typeof value==='string'&&value.trim()!=='')&&Number.isFinite(+value);
const usableRir=set=>usableNumber(set.rir)&&+set.rir>=0&&+set.rir<=10;
function loadIncrement(state,exercise,gym){const setup=resolveLoadSetup(state,exercise,gym,recommendationMeta(state,exercise));return setup.kind==='plates'?Math.min(...setup.plates)*setup.sides:setup.step}
const portableEquipment=new Set(['Bodyweight','Dumbbells','Barbell','Olympic Plates','EZ Bar','Kettlebells','Trap Bar / Hex Bar','Safety Squat Bar','Bench','Flat Bench','Adjustable Bench','Decline Bench','Preacher Bench','Chest-Supported Row Bench','Squat Rack','Squat Rack / Power Rack','Half Rack','Bench-Press Rack','Step / Plyo Box','Hip Thrust Pad','Dip Station','Pull-up Bar','Dip Belt / Weighted Vest','Ab Wheel']);
function recommendationMeta(state,exercise){return exerciseFor(exercise.exerciseId||exercise.name)||state.customExercises?.find(e=>e.id===exercise.exerciseId||!exercise.exerciseId&&norm(e.name)===norm(exercise.name))||exercise}
function portableHistory(state,exercise){
 const meta=recommendationMeta(state,exercise);
 if(meta.loadMode==='assistance'||exercise.loadMode==='assistance')return false;
 const equipment=meta.equipmentRequirements||meta.equipment;
 // Every possible audited setup must be comparable. Unknown apparatus, mixed
 // machine/freeweight alternatives and all resistance machines stay gym-local.
 if(Array.isArray(equipment))return equipment.every(clause=>(Array.isArray(clause)?clause:[clause]).every(item=>portableEquipment.has(item)));
 if(equipment!==undefined)return portableEquipment.has(equipment);
 // Old/custom entries can lack audited requirements; retain their name fallback.
 return !/machine|cable|pressdown|pulldown|leg press|hack squat/i.test(exercise.name);
}
export function completedSets(e){return (e.sets||[]).filter(s=>s.done&&usableNumber(s.r)&&+s.r>0&&usableNumber(s.w)&&+s.w>=0&&!['warmup','drop','backoff','ramp'].includes(s.role))}
export function lastHistory(state,exercise,date,gymId){
 const id=exercise.exerciseId||exerciseFor(exercise.name)?.id;
 // As in Progress, preserved edit/import/conflict copies stay recoverable but
 // only the active date-keyed workout can inform a recommendation.
 const active=Object.entries(state.logs).filter(([key,l])=>l&&key===l.date&&/^\d{4}-\d{2}-\d{2}$/.test(l.date)&&Number.isFinite(Date.parse(l.date+'T12:00:00Z'))&&!l.deleted&&l.date<date&&l.status!=='skipped').map(([,l])=>l);
 return active.sort((a,b)=>b.date.localeCompare(a.date)||String(b.updatedAt).localeCompare(String(a.updatedAt))).flatMap(l=>(l.exercises||[]).filter(e=>(e.exerciseId===id||(!id&&norm(e.name)===norm(exercise.name)))&&progressionContext(e)===progressionContext(exercise)&&(l.gymId===gymId||portableHistory(state,exercise)&&portableHistory(state,e))).map(e=>({log:l,exercise:e,sets:completedSets(e)}))).find(x=>x.sets.length)
}
export function progression(state,exercise,date,gym){
 const [lo,hi]=rangeOf(exercise.range),h=lastHistory(state,exercise,date,gym?.id),meta=recommendationMeta(state,exercise),assistance=meta.loadMode==='assistance';
 const setup=resolveLoadSetup(state,exercise,gym,meta),step=loadIncrement(state,exercise,gym);
 const snap=w=>{const options=reachableLoadOptions(setup,setup.minimum,Math.max(setup.minimum,w+step));return options.reduce((best,value)=>best===null||Math.abs(value-w)<Math.abs(best-w)-1e-8?value:best,null)};
 let weight=null,target=lo,reason=progressionContext(exercise)==='superset'?'First superset exposure: choose a comfortable working load for this format; track each exercise separately.':'Choose a comfortable first working load; keep about 2 reps in reserve.';
 if(h){
  const s=h.sets,weights=s.map(x=>+x.w);weight=assistance?Math.min(...weights):Math.max(...weights);
  const historyLoad=weight,atSame=s.filter(x=>+x.w===weight),top=exercise.setType==='top'||exercise.setType==='ramp';
  const expected=top?1:exercise.sets.filter(x=>!['warmup','drop','backoff','ramp'].includes(x.role)).length;
  const allTop=atSame.length>=expected&&atSame.every(x=>+x.r>=hi&&usableRir(x)&&+x.rir>=1),below=atSame.some(x=>+x.r<lo),failed=atSame.some(x=>usableRir(x)&&+x.rir===0);
  target=Math.min(hi,Math.min(...atSame.map(x=>+x.r))+1);
  if(below){weight=assistance?(recommendedLoadOptions(setup,weight,weight+.001,weight+step)[0]??weight):setup.kind==='plates'&&setup.unit==='lb'?(recommendedLoadOptions(setup,weight,Math.max(setup.minimum,weight-Math.max(step,weight*.20)),weight-.001).at(-1)??weight):Math.min(weight,snap(weight*.95)??weight);target=lo;reason=assistance?'A working set fell below the range. Use one more increment of assistance to rebuild reps.':'A working set fell below the range. Rebuild reps with a slightly lighter load.'}
  else if(failed){target=Math.min(hi,Math.min(...atSame.map(x=>+x.r)));reason=assistance?'Keep the same assistance; finish clean reps with 1–2 RIR before reducing assistance.':'Hold the load; finish clean reps with 1–2 RIR before adding weight.'}
  else if(allTop){const prior=weight;let budget=assistance?step:weight===0?Math.min(step,setup.unit==='kg'?2.5:5):step<=weight*(setup.compound?.25:.20)+1e-8?step:0;if(!assistance&&setup.kind==='plates'&&setup.unit==='lb'&&weight>0)budget=Math.min(budget,Math.max(0,weight*((30+Math.min(...atSame.map(x=>+x.r+ +x.rir)))/(30+lo+2)-1)));weight=assistance?(recommendedLoadOptions(setup,weight,setup.minimum,weight-.001).at(-1)??weight):(recommendedLoadOptions(setup,weight,weight+.001,weight+budget).at(-1)??weight);target=lo;reason=assistance?'Top of range earned: reduce assistance by one increment.':weight===prior?'Top of range earned, but no suitably small equipment increment fits. Hold the load or adjust Load setup.':'Top of range earned across the required working sets: add one increment.'}
  else reason=assistance?'Keep the same assistance and build reps. Incomplete sets or missing RIR do not earn less assistance.':'Hold the load and build reps. Incomplete sets or missing RIR do not earn a load increase.';
  const dbLimit=+(gym?.dbMax||0)*(state.profile.units==='kg'?.45359237:1);if(meta.loadMode==='perHand'&&dbLimit&&weight>dbLimit){weight=historyLoad<=dbLimit?historyLoad:recommendedLoadOptions(setup,historyLoad,setup.minimum,dbLimit).at(-1)??historyLoad;target=hi;reason='At this gym’s dumbbell limit. Build reps or swap the movement.'}
 }
 const manualRoles=['warmup','ramp','backoff','drop'];
 if(assistance&&exercise.sets.some(s=>manualRoles.includes(s.role)))reason+=' Enter assistance manually for warm-up, ramp, back-off and drop sets; more assistance is easier.';
 const anchor=exercise.sets.find(s=>['working','top'].includes(s.role)&&usableNumber(s.w)&&+s.w>=0),setWeight=anchor?+anchor.w:weight;
 const rows=exercise.sets.map((s,i)=>{
  let w=assistance&&manualRoles.includes(s.role)?null:setWeight;
  if(w!==null){if(s.role==='warmup')w=snap(w*.5);else if(s.role==='ramp')w=snap(w*(.6+.4*i/Math.max(1,exercise.sets.length-1)));else if(s.role==='backoff')w=snap(w*(1-(exercise.backoffPercent||10)/100));else if(s.role==='drop')w=snap(w*Math.pow(1-(exercise.dropPercent||20)/100,i))}
  return {w,r:s.role==='drop'?Math.max(lo,target):target,role:s.role};
 });
 return {weight,reps:target,range:[lo,hi],reason,rows,previous:h?{date:h.log.date,sets:h.sets.map(s=>({w:+s.w,r:+s.r,rir:s.rir}))}:null};
}

// Current-workout guidance is separate from next-workout progression. It reads
// checked working/top sets and never changes recorded or future set values.
// This is a bounded coaching estimate, not a measured maximum. Both completed
// reps and RIR affect it, and an equipment option must fit before load is added.
function nextLoadAdjustment(setup,load,reps,rir,lo,hi,{assistance=false,perHandLimit=null}={}){
 const repSurplus=Math.max(0,reps-hi),rirSurplus=Math.max(0,rir-2),increase=repSurplus>0&&rirSurplus>0,below=reps<lo;
 const minimum=setup.minimum,step=setup.kind==='plates'?Math.min(...setup.plates)*setup.sides:setup.step;
 let weight=load,detail='',reason=assistance?'Keep the same assistance for the next set.':'Keep the same load for the next set.';
 const pick=(lower,upper,desired,roundDown=false)=>{
  const options=recommendedLoadOptions(setup,load,Math.max(minimum,lower),upper);
  return roundDown?options.at(-1):options.filter(value=>value<=desired+1e-8).at(-1)??options[0];
 };
 if(increase||below){
  const direction=assistance?(increase?-1:1):(increase?1:-1);
  let chosen;
  if(assistance){
   // Counterweight is not lifted resistance. Without bodyweight and machine
   // leverage, scale by effort/reps rather than applying a strength formula.
   const severity=increase?repSurplus+rirSurplus:lo-reps+Math.max(0,2-rir),budget=step*Math.min(2,Math.max(1,Math.ceil(severity/3)));
   chosen=direction>0?pick(load+.001,load+budget,load+budget,true):pick(load-budget,load-.001,load-budget);
  }else if(increase){
   const budget=Math.min(Math.max(step,load*(reps+rir-hi-2)/(30+hi+2)),Math.max(step,load*(setup.compound?.15:.10)));
   const limitRoom=perHandLimit===null?budget:Math.max(0,perHandLimit-load),repRoom=load===0?Math.min(step,setup.unit==='kg'?2.5:5):Math.max(0,load*((30+reps+rir)/(30+lo+2)-1));
   if(load>=minimum){
    const room=Math.min(budget,limitRoom,repRoom);chosen=pick(load+.001,load+room,load+budget,true);
    if(setup.kind==='plates'){const simple=loadChangeOptions(setup,room).map(option=>Math.round((load+option.delta)*100)/100).filter(value=>recommendedLoadOptions(setup,load,value,value).length);if(simple.length)chosen=simple.at(-1)}
   }
   if(chosen!==undefined&&load>0&&chosen-load>load*(setup.compound?.25:.20)+1e-8)chosen=undefined;
   if(chosen===undefined)reason=perHandLimit!==null&&perHandLimit-load<step?'At this gym’s dumbbell limit or between available dumbbell sizes. Keep the available load.':setup.kind==='plates'&&setup.unit==='lb'?'The next allowed plate increment is too large for this set. Keep the load and build controlled reps.':'The next available jump is too large for this set. Keep the load; use smaller plates or steps before increasing.';
  }else{
   const desired=Math.max(step,load*(1-(30+reps+rir)/(30+lo+2))),budget=Math.max(step,load*(setup.compound?.20:.15));
   chosen=pick(load-budget,load-.001,load-desired);
   if(chosen===undefined)reason='At the minimum available load, or no matching equipment size is available. Check Load setup before changing the movement or reps.';
  }
  if(chosen!==undefined){
   weight=chosen;
   reason=increase?`${repSurplus} rep${repSurplus===1?'':'s'} above the range and ${rirSurplus} extra RIR above 2: ${assistance?'reduce assistance':'increase the load'} for the next set.`:`${lo-reps} rep${lo-reps===1?'':'s'} below the range${rir<2?` and ${2-rir} RIR below target`:''}: ${assistance?'add assistance':'back off the load'} for the next set.`;
  }
 }
 if(perHandLimit!==null&&weight>perHandLimit){
  const available=recommendedLoadOptions(setup,load,minimum,perHandLimit).at(-1);if(available!==undefined)weight=available;
  reason='The logged load is above this gym’s dumbbell limit. Check the available dumbbell size before the next set.';
 }
 if(assistance&&load===0&&weight===0&&increase)reason='At zero assistance. Keep the load and finish controlled reps.';
 const change=weight===load?'hold':(assistance?weight<load:weight>load)?'increase':'decrease';
 if(change!=='hold'){
  const delta=Math.round(Math.abs(weight-load)*100)/100;
  const simpleAddition=setup.kind!=='plates'||weight<load||loadChangeOptions(setup,delta+.000001).some(option=>Math.abs(option.delta-delta)<1e-8);
  detail=simpleAddition?describeLoadChange(setup,delta,{decrease:weight<load}):`Rebalance plates to ${weight} ${setup.unit} total (${delta} ${setup.unit} more total).`;
  if(!reachableLoadOptions(setup,load,load).length)detail+=' Adjusted to a configured equipment weight; the logged load was between its available sizes.';
 }
 let targetReps=Math.min(hi,Math.max(lo,reps));
 if(change!=='hold'){
  // Estimate reps at 2 RIR for the actual achievable load. Never infer lifted
  // resistance from an assistance counterweight or an explicit zero load.
  targetReps=assistance||load===0||weight===0?lo:Math.min(hi,Math.max(lo,Math.floor(load/weight*(30+reps+rir)-32+1e-8)));
 }
 return {weight,reps:targetReps,change,reason,loadDetail:detail,repSurplus,rirSurplus,targetRir:2,setup};
}

export function nextSetRecommendation(state,exercise,gym){
 const primary=set=>['working','top'].includes(set.role),sets=exercise.sets||[];
 let sourceIndex=-1;for(let i=0;i<sets.length;i++)if(sets[i].done&&primary(sets[i]))sourceIndex=i;
 if(sourceIndex<0)return null;
 const source=sets[sourceIndex],targetIndex=sourceIndex+1,target=sets[targetIndex];
 if(!target||target.done||!primary(target)||!completedSets({sets:[source]}).length||!usableRir(source)||!Number.isInteger(+source.r))return null;
 const [lo,hi]=rangeOf(exercise.range);if(hi<lo||!Number.isFinite(hi))return null;
 const meta=recommendationMeta(state,exercise);if(meta.repUnit&&meta.repUnit!=='reps')return null;
 const assistance=meta.loadMode==='assistance',setup=resolveLoadSetup(state,exercise,gym,meta),load=+source.w;
 const perHandLimit=meta.loadMode==='perHand'&&usableNumber(gym?.dbMax)&&+gym.dbMax>0?+gym.dbMax*(state.profile.units==='kg'?.45359237:1):null;
 const result=nextLoadAdjustment(setup,load,+source.r,+source.rir,lo,hi,{assistance,perHandLimit});
 if(!Number.isFinite(result.weight))return null;
 return {sourceIndex,targetIndex,...result,assistance,sourceReps:+source.r,sourceRir:+source.rir};
}

function historyDates(state){const last=new Map();for(const l of Object.values(state.logs)){if(l.deleted)continue;for(const e of l.exercises||[]){const id=e.exerciseId||exerciseFor(e.name)?.id;if(id&&completedSets(e).length&&(!last.has(id)||last.get(id)<l.date))last.set(id,l.date)}}for(const p of Object.values(state.plan)){if(p.deleted)continue;for(const e of p.exercises||[]){const id=e.exerciseId;if(id&&(!last.has(id)||last.get(id)<p.date))last.set(id,p.date)}}return last}
function subgroup(e){if(e.group==='Legs'&&['quads','hamstrings','calves'].includes(e.subgroup))return e.subgroup;const n=(e.name+' '+e.primary+' '+e.movement).toLowerCase();if(e.group!=='Legs')return e.group;if(/calf|tibialis/.test(n))return 'calves';if(/romanian|deadlift|leg curl|hamstring|hip thrust|glute drive|hinge|nordic|glute-ham/.test(n))return 'hamstrings';return 'quads'}
function matchesGroup(e,group){if(['anterior-delt','lateral-delt','rear-delt'].includes(group))return e.group==='Shoulders'&&e.subgroup===group.split('-')[0];return subgroup(e)===group}
export function generateProgram(state,{start=state.training.startDate||iso(),days=28}={}){
 const t=state.training,frequency=Math.max(1,Math.min(7,+t.frequency||4)),last=historyDates({...state,logs:Object.fromEntries(Object.entries(state.logs).filter(([,d])=>d.date<start)),plan:Object.fromEntries(Object.entries(state.plan).filter(([,d])=>d.date<start))}),generated=[],warnings=[],anchor=t.startDate||start;
 const weekSlots=[0,2,4,6,1,3,5].filter(day=>!(t.restWeekdays||[]).includes((dateOf(anchor).getDay()+day)%7)).slice(0,frequency).sort((a,b)=>a-b);
 if(weekSlots.length<frequency)warnings.push(`Only ${weekSlots.length} eligible training days fit the selected weekly rest days.`);
 const protectedDay=d=>d&&!d.deleted&&(d.status==='completed'||d.status==='skipped'||d.run?.done||d.sauna?.done||d.exercises?.some(e=>e.sets?.some(s=>s.done||s.w!==''&&s.w!=null||s.r!==''&&s.r!=null||s.rir!==''&&s.rir!=null)));
 function layout(date){const offset=daysBetween(date,anchor),slot=((offset%7)+7)%7,week=Math.floor(offset/7),index=week*weekSlots.length+weekSlots.filter(x=>x<=slot).length-1;let lift=weekSlots.includes(slot),[title,groups]=splitSession(t.split,index);if(t.split==='legacy'){const p=LEGACY_PLAN[((offset%28)+28)%28];lift=!!p[2];title=p[0].replace(/ #\d+/g,'');groups=p[2]?p[2].split(';').map(x=>subgroup(exerciseFor(x.split('|')[0])||{group:'Core',name:x,primary:'',movement:''})):[]}return {offset,index,week,lift,title,groups:lift?groups:[],legs:lift&&groups.some(g=>['quads','hamstrings'].includes(g))}}
 // Reserve whole training weeks up front, including protected runs after the
 // first replacement date or before a partial preview. Never rewrite those logs.
 const qualityWeeks=new Set(Object.values(state.logs).filter(d=>protectedDay(d)&&d.status!=='skipped'&&d.run?.blocks?.length).map(d=>Math.floor(daysBetween(d.date,anchor)/7)));
 const legsAt=date=>{const d=state.logs[date];return d&&!d.deleted?(d.exercises||[]).some(e=>exerciseFor(e.exerciseId||e.name)?.group==='Legs'):layout(date).legs};
 for(let i=0;i<Math.max(1,Math.min(366,+days||28));i++){
  const date=addDays(start,i),gym=scheduledGym(state,date),l=layout(date),notes=[],selected=[],used=new Set();if(!gym)throw Error('Create at least one gym before generating a plan.');
  if(protectedDay(state.logs[date])){warnings.push(date+': existing workout preserved.');for(const e of state.logs[date].exercises||[])if(e.exerciseId)last.set(e.exerciseId,date);continue}
  for(const group of l.groups){const candidates=[...CATALOG,...(state.customExercises||[])].filter(e=>!e.deleted&&(!e.defaultExcluded||!t.excludePullups&&/pull.up|chin.up/i.test(e.name))&&!e.needsVariantSelection&&!state.avoided.includes(e.id)&&(!t.excludePullups||!/pull.up|chin.up/i.test(e.name))&&matchesGroup(e,group)&&supports(e,gym)&&!used.has(e.id));
   candidates.sort((a,b)=>{const score=e=>{const recent=last.get(e.id),gap=recent?daysBetween(date,recent):9999;return (gap<(+t.minRepeatDays||0)?100000:0)+(recent?1000-Math.max(-1000,gap):0)+(e.compound?-50:0)+(t.experience==='Beginner'&&/pendlay|meadows|nordic|safety bar|kettlebell swing/i.test(e.name)?100:0)+(hash(e.id+date)%97)};return score(a)-score(b)});
   const e=candidates[0];if(!e){notes.push('No '+group+' exercise matches the gym inventory.');continue}
   if(last.has(e.id)&&daysBetween(date,last.get(e.id))<(+t.minRepeatDays||0))notes.push(e.name+': repeated because this gym has limited alternatives.');
   const preset=trainingStyle(t.trainingStyle),count=Math.max(1,Math.min(6,+t.sets||preset.sets)),chosen=makeExercise(e,{count:t.experience==='Beginner'?Math.min(3,count):count,range:t.range||preset.range});chosen.targetRir=t.experience==='Beginner'?3:preset.rir;chosen.sets.forEach(s=>s.rest=+t.restSeconds||preset.rest);chosen.trainingStyle=t.trainingStyle||'hypertrophy';selected.push(chosen);used.add(e.id);last.set(e.id,date);
  }
  const run=runningSession({...t,runningQuality:t.runningQuality&&!qualityWeeks.has(l.week)},{date,dayIndex:l.offset,legDay:l.legs,legsTomorrow:legsAt(addDays(date,1)),recentLegs:legsAt(addDays(date,-1)),week:l.week});if(run?.blocks?.length)qualityWeeks.add(l.week);
  if(run&&l.lift)notes.push(run.guidance);if(t.experience==='Beginner'&&+t.sets>3)notes.push('Beginner volume capped at 3 working sets; adjust after reviewing recovery.');
  let day={id:date,date,title:l.lift?l.title:run?run.type:'Recovery',gymId:gym.id,kind:l.lift?'strength':run?'run':'rest',run,sauna:l.lift&&+t.saunaMinutes>0?{minutes:+t.saunaMinutes,done:false}:null,exercises:selected,plannedExerciseCount:l.groups.length,notes,split:t.split,trainingStyle:t.trainingStyle||'hypertrophy',sessionNumber:l.index+1,updatedAt:now(),generatorVersion:VERSION};if(selected.length<l.groups.length)notes.push('Session has '+selected.length+' of '+l.groups.length+' planned exercises because the confirmed equipment or exclusions do not support every slot.');if(t.supersetMode==='supersets'&&l.lift)day=autoSupersets(day,e=>exerciseFor(e.exerciseId)||state.customExercises?.find(x=>x.id===e.exerciseId),+t.restSeconds||120);if(l.lift&&selected.length<6){day.needsEquipmentReview=true;day.notes.push('At least 6 exercises are required for a generated lifting session. Review the gym inventory or exclusions before using this incomplete workout.')}generated.push(day);warnings.push(...day.notes.map(n=>date+': '+n));
 }
 if(t.runningQuality&&t.trainingStyle==='endurance'&&days>=14&&!generated.some(d=>d.run?.blocks?.length))warnings.push('No interval session fit the lower-body recovery windows in this preview; runs remain easy.');
 return {days:generated,warnings};
}
// Only machine-generated, untouched future plan rows are eligible. Logs and custom routines stay intact.
export function restoreGeneratedSessionSizes(state,{from=iso()}={}){
 if(state.training.mode!=='automatic'||!['split','bro','ppl'].includes(state.training.split))return 0;
 let count=0;
 for(const [date,packed] of Object.entries(state.plan||{}).sort(([a],[b])=>a.localeCompare(b))){
  if(date<from||state.logs[date]&&!state.logs[date].deleted||packed.deleted||!/^8\.0\.0-beta\.[1-6]$/.test(packed.generatorVersion||'')||packed.split!==state.training.split||packed.status||packed.customNote)continue;
  const old=expandPlanDay(packed);
  if(old.exercises.some(e=>e.notes||e.sets.some(s=>s.done||['w','r','rir'].some(k=>s[k]!==''&&s[k]!=null))))continue;
  const replacement=generateProgram(state,{start:date,days:1}).days[0];
  if(!replacement||replacement.title!==old.title||replacement.gymId!==old.gymId||replacement.exercises.length<=old.exercises.length)continue;
  state.plan[date]=packPlanDay({...replacement,run:old.run,sauna:old.sauna});count++;
 }
 if(count)state.sessionSizeRepair={count,at:now(),version:VERSION};
 return count;
}
function sessionGroups(day,training){
 if(training.mode==='custom'||!/^8\.0\.0-beta\.[1-6]$/.test(day.generatorVersion||'')||!['split','bro','ppl'].includes(day.split))return [];
 for(let i=0;i<5;i++){const [title,groups]=splitSession(day.split,i);if(title===day.title)return groups}
 return [];
}
export function shortSessionTarget(day,training){const groups=sessionGroups(day,training);return groups.length>day.exercises.length?groups.length:0}
export function restoreSessionExercises(state,date){
 const old=dayFor(state,date),groups=sessionGroups(old,state.training);
 if(old.status==='completed')throw Error('Unlock this workout before restoring its session size.');
 if(!shortSessionTarget(old,state.training))throw Error('This workout already has its full template or is a custom session.');
 const scratch=clone(state);delete scratch.logs[date];scratch.gymSchedules=[];
 const index=Array.from({length:5},(_,i)=>i).find(i=>splitSession(old.split,i)[0]===old.title);
 scratch.training={...scratch.training,split:old.split,frequency:7,restWeekdays:[],startDate:addDays(date,-index),defaultGym:old.gymId,supersetMode:'off'};
 const generated=generateProgram(scratch,{start:date,days:1}).days[0],day=clone(old),remaining=groups.slice(),used=new Set(day.exercises.map(e=>e.exerciseId));
 // Existing exercises and entered sets are retained exactly, in their existing order.
 for(const e of day.exercises){const meta=exerciseFor(e.exerciseId)||state.customExercises.find(x=>x.id===e.exerciseId),slot=remaining.findIndex(group=>meta&&matchesGroup(meta,group));if(slot>=0)remaining.splice(slot,1)}
 for(const group of remaining){if(day.exercises.length>=groups.length)break;const e=generated.exercises.find(e=>!used.has(e.exerciseId)&&matchesGroup(exerciseFor(e.exerciseId)||e,group));if(e){day.exercises.push(e);used.add(e.exerciseId)}}
 if(day.exercises.length===old.exercises.length)throw Error('No additional exercises match the confirmed gym equipment. Review your gym inventory.');
 day.plannedExerciseCount=groups.length;day.generatorVersion=VERSION;day.updatedAt=now();day.notes=(day.notes||[]).filter(n=>!n.startsWith('Session has '));
 if(day.exercises.length<groups.length)day.notes.push('Session has '+day.exercises.length+' of '+groups.length+' planned exercises; confirmed equipment or exclusions limit the remaining slots.');
 return day;
}
export function hash(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
export function originalDay(state,date){const index=((daysBetween(date,'2026-10-01')%28)+28)%28;const p=LEGACY_PLAN[index],gym=scheduledGym(state,date);return {id:date,date,title:p[0],gymId:gym?.id,kind:p[2]?'strength':/run|zone/i.test(p[0])?'run':'rest',exercises:p[2]?p[2].split(';').map(s=>{const [name,count,range]=s.split('|');const e=exerciseFor(name)||{id:'legacy-'+norm(name),name,sets:+count,range};return makeExercise(e,{count:+count,range})}):[],run:/run|zone/i.test(p[0])?{minutes:30,done:false}:null,sauna:p[2]?{minutes:20,done:false}:null,notes:[],updatedAt:now()}}
const rollingCache=new WeakMap();
export function packPlanDay(day){const d=clone(day);if((d.exercises||[]).some(e=>e.sets?.some(s=>s.done||s.w!==''&&s.w!=null||s.r!==''&&s.r!=null||s.rir!==''&&s.rir!=null)))return d;d.compactPlan=true;for(const e of d.exercises||[]){delete e.id;e.setTemplates=(e.sets||[]).map(({role,rest})=>({role,rest}));delete e.sets;}return d}
export function expandPlanDay(day){if(!day?.compactPlan)return day;const d=clone(day);for(const e of d.exercises||[]){e.id=uid();e.sets=(e.setTemplates||[]).map(s=>({id:uid(),...s,w:'',r:'',rir:'',done:false}));delete e.setTemplates}delete d.compactPlan;return d}
export function rollingDay(state,date){
 const original=state.training.mode==='original',anchor=original?'2026-10-01':state.training.startDate||iso();
 const lastSaved=Object.values(state.plan).filter(d=>!d.deleted&&d.date).map(d=>d.date).sort().at(-1);
 const continuation=original?'2026-10-29':lastSaved?addDays(lastSaved,1):anchor;
 const first=date<continuation?anchor:continuation,bucket=Math.floor(daysBetween(date,first)/84),start=addDays(first,Math.max(0,bucket)*84);
 const key=[iso(),JSON.stringify(state.training),state.gyms.map(g=>g.id+g.updatedAt),state.gymSchedules.map(r=>r.id+r.updatedAt),state.avoided,(state.customExercises||[]).map(e=>e.id+e.updatedAt),(state.routines||[]).map(r=>r.id+r.updatedAt),Object.keys(state.logs).length,Object.values(state.logs).filter(d=>d.status==='completed').map(d=>d.id+d.updatedAt),Object.keys(state.plan).length,lastSaved,start].join('|');
 let cached=rollingCache.get(state);
 if(!cached||cached.key!==key){
  const training={...state.training,startDate:anchor,split:original?'legacy':state.training.split},copy={...state,training,plan:original?{}:state.plan},previousStart=addDays(start,-28);
  const seed=original&&start==='2026-10-29'?Array.from({length:28},(_,i)=>originalDay(state,addDays(previousStart,i))):generateProgram(copy,{start:previousStart,days:28}).days;
  const seeded={...copy,plan:{...Object.fromEntries(seed.map(d=>[d.date,d])),...copy.plan}};
  const result=generateProgram(seeded,{start,days:84});
  if(state.training.mode==='custom'){
   const order=state.training.routineOrder||state.routines.filter(r=>!r.deleted).map(r=>r.id),routines=order.map(id=>state.routines.find(r=>r.id===id&&!r.deleted)).filter(Boolean);
   if(routines.length)for(const d of result.days)if(d.kind==='strength'){
    const r=routines[((d.sessionNumber-1)%routines.length+routines.length)%routines.length];d.title=r.name;
    d.exercises=clone(r.exercises).map(e=>({...e,id:uid(),sets:e.sets.map(s=>({...withoutCompletionTiming(s),id:uid(),w:'',r:'',rir:'',done:false}))}));d.notes=[];
    for(const e of d.exercises){const missing=missingEquipment(exerciseFor(e.exerciseId)||state.customExercises.find(x=>x.id===e.exerciseId),state.gyms.find(g=>g.id===d.gymId));if(missing.length)d.notes.push('Equipment to check: '+e.name+' — '+missing.join(', '))}
    if(training.supersetMode==='supersets')Object.assign(d,autoSupersets(d,e=>exerciseFor(e.exerciseId)||state.customExercises.find(x=>x.id===e.exerciseId),+training.restSeconds||60));
   }
  }
  cached={key,days:new Map(result.days.map(d=>[d.date,d]))};rollingCache.set(state,cached);
 }
 return cached.days.get(date)||{id:date,date,title:'Recovery',kind:'rest',gymId:scheduledGym(state,date)?.id,exercises:[],notes:[]};
}
export function dayFor(state,date){const log=state.logs[date];if(log&&!log.deleted)return log;if(state.training.mode==='original')return date<'2026-10-29'?originalDay(state,date):rollingDay(state,date);const plan=state.plan[date];if(plan&&!plan.deleted)return expandPlanDay(plan);if(['automatic','custom'].includes(state.training.mode)&&date>=(state.training.startDate||iso()))return rollingDay(state,date);return {id:date,date,title:'Unplanned day',kind:'rest',gymId:scheduledGym(state,date)?.id,exercises:[],notes:[]}}
export function daySummary(state,date){const d=dayFor(state,date);return {date,title:d.title,kind:d.kind,status:d.status}}
export function ensureLog(state,date){if(!state.logs[date]||state.logs[date].deleted)state.logs[date]=touch({...clone(dayFor(state,date)),status:'in-progress'});return state.logs[date]}
export function validateState(s){
 if(!s||typeof s!=='object'||Array.isArray(s))throw Error('Backup must contain an app snapshot.');
 const record=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
 if(!record(s.logs)||!Array.isArray(s.gyms))throw Error('This is not a recognized Muscle Growth Tracker backup.');
 const checkKeys=obj=>{for(const key of Object.keys(obj||{}))if(['__proto__','constructor','prototype'].includes(key))throw Error('Backup contains an invalid record key.')};
 checkKeys(s.logs);checkKeys(s.plan);checkKeys(s.meals);
 for(const g of s.gyms)if(!record(g)||typeof g.name!=='string'||g.inventory!=null&&!Array.isArray(g.inventory))throw Error('A saved gym is malformed.');
 for(const l of Object.values(s.logs)){if(!record(l))throw Error('A workout record is malformed.');const exercises=s.schemaVersion===8?l.exercises:l.ex;if(exercises!=null&&!Array.isArray(exercises))throw Error('A workout exercise list is malformed.');for(const e of exercises||[])if(!record(e)||typeof e.name!=='string'||!Array.isArray(e.sets)||e.sets.some(set=>!record(set)))throw Error('A saved exercise is malformed.');if(l.date||l.actualDate){const date=l.date||l.actualDate;if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(dateOf(date).getTime())||iso(dateOf(date))!==date)throw Error('A workout date is invalid.');}}
 if(s.schemaVersion===8){for(const key of ['profile','training','nutrition','reminders','plan','meals'])if(!record(s[key]))throw Error('The beta backup is missing '+key+'.');for(const key of ['recipes','pantry','gymSchedules','customExercises','avoided','legacySnapshots','conflicts'])if(!Array.isArray(s[key]))throw Error('The beta backup is missing '+key+'.');}
 return true;
}
export function importSnapshot(current,raw){validateState(raw);const s=clone(current),stamp=now();if(raw.schemaVersion===8){const merged=mergeStates(s,raw,{});merged.state.ownerId=current.ownerId;return {state:merged.state,count:Object.keys(raw.logs).length,conflicts:merged.conflicts}}
 const identity=String(hash(JSON.stringify(raw)));if(s.legacySnapshots.some(x=>x.id===identity))return {state:s,count:0,conflicts:[]};s.legacySnapshots.push({id:identity,importedAt:stamp,data:clone(raw)});for(const [key,g] of raw.gyms.entries()){let existing=s.gyms.find(x=>norm(x.name)===norm(g.name));const id=existing?.id||`import-gym-${hash(g.name)}`;if(!existing)s.gyms.push(touch({...g,id,inventory:g.inventory||[]}));else Object.assign(existing,touch({...existing,...clone(g),id,inventory:g.inventory||existing.inventory}))}
 const incomingUnits=raw.profile?.units||'lb',currentUnits=s.profile.units||'lb';const unitFactor=incomingUnits===currentUnits?1:currentUnits==='kg'?.45359237:1/.45359237;if(raw.profile){const profile=clone(raw.profile);for(const k of ['weight','goalWeight'])if(profile[k]!==''&&profile[k]!=null)profile[k]=Math.round(+profile[k]*unitFactor*10)/10;s.profile=touch({...s.profile,...profile,units:currentUnits})};if(raw.training)s.training=touch({...s.training,...raw.training,mode:({Automatic:'automatic',Custom:'custom','Current Program':'original'})[raw.training.mode]||s.training.mode});if(raw.nutrition)s.nutrition=touch({...s.nutrition,...raw.nutrition});for(const [name,rule] of Object.entries(raw.gymSchedules||{})){const gym=s.gyms.find(g=>g.name===name);if(gym)s.gymSchedules.push(touch({...rule,id:`import-rule-${hash(name)}`,gymId:gym.id,every:+rule.every||4,weekdays:Array.isArray(rule.weekdays)?rule.weekdays:String(rule.weekdays||'').split(',').filter(Boolean).map(Number)}))}
 let count=0;for(const [key,l] of Object.entries(raw.logs)){if(!l||typeof l!=='object')continue;const [block,slot]=key.split('-').map(Number);const date=l.actualDate||addDays('2026-10-01',(Number.isFinite(block)?block:0)*28+(Number.isFinite(slot)?slot:+key||0));const p=LEGACY_PLAN[l.planIndex??slot]||['Imported workout'];const gym=s.gyms.find(g=>g.name===l.gym)||scheduledGym(s,date);const log=touch({...clone(l),id:date,date,title:p[0],gymId:gym?.id,kind:(l.ex||[]).length?'strength':'rest',status:l.completed?'completed':'in-progress',legacyKey:key,exercises:(l.ex||[]).map((e,i)=>{const cat=exerciseFor(e.name);return {...clone(e),id:`import-${identity}-${key}-${i}`,exerciseId:cat?.id||`legacy-${norm(e.name)}`,loadMode:cat?.loadMode||'total',sets:(e.sets||[]).map((set,j)=>({...clone(set),id:`import-${identity}-${key}-${i}-${j}`,role:e.setType==='top'?(j===0?'top':'backoff'):e.setType==='drop'?(j===0?'working':'drop'):e.setType==='ramp'?(j===e.sets.length-1?'working':'ramp'):'working',w:set.w===''||set.w==null?'':Math.round(+set.w*unitFactor*100)/100,rir:set.i??set.rir??'',done:set.r!==''&&set.r!=null&&+set.r>0&&set.w!==''&&set.w!=null&&Number.isFinite(+set.w)}))}})});if(s.logs[date]&&JSON.stringify(s.logs[date].exercises)!==JSON.stringify(log.exercises)){const altId=`${date}~legacy-${hash(key+identity)}`;s.logs[altId]={...log,id:altId};s.conflicts.push({id:altId,collection:'logs',key:date,local:clone(s.logs[date]),remote:clone(log),reason:'Imported workout shares a date; both copies retained.'})}else s.logs[date]=log;count++}
 for(const r of raw.recipes||[])if(!s.recipes.some(x=>x.id===r.id))s.recipes.push(touch({...clone(r),id:r.id||uid(),servings:Number.isFinite(+r.servings)&&+r.servings>0?+r.servings:1}));for(const [date,meals] of Object.entries(raw.meals||{})){const existing=s.meals[date]?.items||[];s.meals[date]=touch({id:date,date,items:[...existing,...clone(meals).map((m,i)=>({...m,id:`legacy-meal-${hash(identity+date+i)}`,eaten:false}))]})}for(const p of raw.pantry||[])s.pantry.push(touch({...p,id:uid()}));s.avoided=[...new Set([...s.avoided,...(raw.avoid||[]).map(x=>exerciseFor(x)?.id||x)])];s.updatedAt=stamp;return {state:s,count,conflicts:s.conflicts}}

// File review prepares the existing preservation merge in memory; Apply stays explicit.
export function previewSnapshot(current,raw){
 const result=importSnapshot(current,raw),v8=raw.schemaVersion===8;
 const setRows=Object.values(raw.logs).reduce((total,log)=>total+((v8?log.exercises:log.ex)||[]).reduce((n,e)=>n+e.sets.length,0),0);
 const mealItems=Object.values(raw.meals||{}).reduce((n,day)=>n+(Array.isArray(day)?day.length:day?.items?.length||0),0);
 return {source:JSON.stringify(current),result,summary:{format:v8?'Version 8':'Legacy',workoutRecords:Object.keys(raw.logs).length,setRows,mealItems,recipes:raw.recipes?.length||0,gyms:raw.gyms.length,sourceUnits:raw.profile?.units||'lb',currentUnits:current.profile.units||'lb',pendingReviews:result.state.conflicts.length}};
}
export function applySnapshotPreview(current,preview){
 if(!preview?.result||preview.source!==JSON.stringify(current))throw Error('Your saved workspace changed. Select the backup and review it again before merging.');
 return clone(preview.result);
}

const objectCollections=['logs','plan','meals','shoppingChecks'];const arrayCollections=['gyms','gymSchedules','recipes','pantry','leftovers','customExercises','routines'];
const same=jsonEqual;
export function mergeStates(local,remote,base={}){const out=clone(local),conflicts=[];function pick(a,b,c,collection,key){if(b===undefined)return a;if(a===undefined)return b;if(same(a,b))return a;if(same(a,c))return b;if(same(b,c))return a;const comparable=v=>{if(!v||typeof v!=='object')return v;const x=clone(v);delete x.updatedAt;return x};if(same(comparable(a),comparable(b)))return a;const id=`conflict-${hash(collection+key+JSON.stringify(a)+JSON.stringify(b))}`;conflicts.push({id,collection,key,local:clone(a),remote:clone(b),reason:'Both devices edited this item. Choose the version to keep.',createdAt:now()});return a}
 for(const col of objectCollections){out[col]={};for(const key of new Set([...Object.keys(local[col]||{}),...Object.keys(remote[col]||{})]))out[col][key]=pick(local[col]?.[key],remote[col]?.[key],base[col]?.[key],col,key)}for(const col of arrayCollections){const a=new Map((local[col]||[]).map(x=>[x.id,x])),b=new Map((remote[col]||[]).map(x=>[x.id,x])),c=new Map((base[col]||[]).map(x=>[x.id,x]));out[col]=[...new Set([...a.keys(),...b.keys()])].map(k=>pick(a.get(k),b.get(k),c.get(k),col,k))}for(const col of ['profile','training','nutrition','reminders'])out[col]=pick(local[col],remote[col],base[col],col,col);const avoidedIds=new Set([...(local.avoided||[]),...(remote.avoided||[]),...(base.avoided||[])]);out.avoided=[...avoidedIds].filter(id=>{const a=(local.avoided||[]).includes(id),b=(remote.avoided||[]).includes(id),c=(base.avoided||[]).includes(id);return a===c?b:a});out.legacySnapshots=orderReviewedSnapshots([...new Map([...(local.legacySnapshots||[]),...(remote.legacySnapshots||[])].map(x=>[x.id,x])).values()]);out.resolvedConflicts=[...new Set([...(local.resolvedConflicts||[]),...(remote.resolvedConflicts||[])])];out.conflicts=[...new Map([...(local.conflicts||[]),...(remote.conflicts||[]),...conflicts].map(x=>[x.id,x])).values()].filter(c=>!out.resolvedConflicts.includes(c.id));out.updatedAt=now();return {state:out,conflicts}}
const conflictPreferences=['profile','training','nutrition','reminders'];
const reviewRecord=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
const reviewId=value=>typeof value==='string'&&value.trim().length>0;
function checkConflictRecord(conflict){
 if(!reviewRecord(conflict)||!reviewId(conflict.id)||!reviewId(conflict.key)||['__proto__','constructor','prototype'].includes(conflict.key)||![...objectCollections,...arrayCollections,...conflictPreferences].includes(conflict.collection)||conflictPreferences.includes(conflict.collection)&&conflict.key!==conflict.collection)throw Error('The saved conflict has an invalid identity or collection.');
 canonicalJson(conflict);clone(conflict);
 for(const choice of ['local','remote']){if(!Object.hasOwn(conflict,choice)||conflict[choice]===undefined||canonicalJson(conflict[choice])===undefined)throw Error('The saved conflict is missing a recoverable copy.');clone(conflict[choice])}
}
function checkConflictReviewState(state){
 validateState(state);
 if(!Array.isArray(state.conflicts)||!Array.isArray(state.legacySnapshots)||state.resolvedConflicts!==undefined&&(!Array.isArray(state.resolvedConflicts)||state.resolvedConflicts.some(id=>!reviewId(id))))throw Error('Conflict review records are malformed.');
 const ids=new Set();for(const conflict of state.conflicts){checkConflictRecord(conflict);if(ids.has(conflict.id))throw Error('More than one saved conflict has this identity. Keep all copies and review the backup.');ids.add(conflict.id)}
}
function conflictComparable(value){const copy=clone(value);if(reviewRecord(copy))delete copy.updatedAt;return copy}
export function conflictCopiesMatch(conflict){try{checkConflictRecord(conflict);return jsonEqual(conflictComparable(conflict.local),conflictComparable(conflict.remote))}catch{return false}}
function pendingConflict(state,id){
 if(!reviewId(id))throw Error('Choose a valid conflict identity.');
 checkConflictReviewState(state);const conflict=state.conflicts.find(entry=>entry.id===id);
 if(!conflict){if((state.resolvedConflicts||[]).includes(id))return null;throw Error('Conflict not found.')}
 if((state.resolvedConflicts||[]).includes(id))throw Error('This conflict is already marked reviewed. Keep the saved copies for review.');
 return conflict;
}
function conflictCurrent(state,conflict){
 const collection=state[conflict.collection];
 if(arrayCollections.includes(conflict.collection)){
  if(!Array.isArray(collection))throw Error('The current conflict collection is malformed.');
  const matches=collection.filter(entry=>entry?.id===conflict.key);if(matches.length>1)throw Error('The current collection contains duplicate record identities.');
  return matches.length?{exists:true,value:clone(matches[0])}:{exists:false};
 }
 if(objectCollections.includes(conflict.collection)){
  if(!reviewRecord(collection))throw Error('The current conflict collection is malformed.');
  return Object.hasOwn(collection,conflict.key)?{exists:true,value:clone(collection[conflict.key])}:{exists:false};
 }
 return Object.hasOwn(state,conflict.collection)?{exists:true,value:clone(collection)}:{exists:false};
}
function conflictReviewArchive(state,conflict,decision,usedIds,sourceArchiveId){
 const id='reviewed-conflict-'+uid();if(usedIds.has(id))throw Error('A unique recovery identity could not be created. Retry without changing your saved copies.');usedIds.add(id);
 const current=conflictCurrent(state,conflict);if(current.exists&&canonicalJson(current.value)===undefined)throw Error('The current value cannot be saved as a recovery copy.');
 const archive={id,kind:'reviewed-conflict',reviewedAt:now(),decision,data:{conflict:clone(conflict),current}};
 if(sourceArchiveId)archive.sourceArchiveId=sourceArchiveId;
 return archive;
}
function reviewedSelection(state,conflict,value){
 const selected=clone(value);if(selected===undefined||canonicalJson(selected)===undefined)throw Error('The selected saved value cannot be restored.');
 const plain=reviewRecord(selected)&&[Object.prototype,null].includes(Object.getPrototypeOf(selected));const next=plain?touch(selected):selected;
 if(arrayCollections.includes(conflict.collection)){
  if(!reviewRecord(next)||next.id!==conflict.key)throw Error('The selected copy has a different record identity.');
  const collection=state[conflict.collection].slice(),index=collection.findIndex(entry=>entry?.id===conflict.key);if(index<0)collection.push(next);else collection[index]=next;return collection;
 }
 if(objectCollections.includes(conflict.collection)){
  if(conflict.collection!=='shoppingChecks'&&!reviewRecord(next))throw Error('The selected copy is not a saved app record.');
  return {...state[conflict.collection],[conflict.key]:next};
 }
 if(!reviewRecord(next))throw Error('The selected copy is not a settings record.');
 return next;
}
function applyConflictReview(state,conflicts,decision,selection,sourceArchiveId){
 const usedIds=new Set(state.legacySnapshots.map(entry=>entry?.id));const archives=conflicts.map(conflict=>conflictReviewArchive(state,conflict,decision,usedIds,sourceArchiveId));
 const ids=new Set(sourceArchiveId?[]:conflicts.map(conflict=>conflict.id));
 const nextConflicts=state.conflicts.filter(conflict=>!ids.has(conflict.id));
 const nextResolved=[...(state.resolvedConflicts||[]),...[...ids].filter(id=>!(state.resolvedConflicts||[]).includes(id))];
 const nextArchives=[...state.legacySnapshots,...archives];
 const collection=selection?reviewedSelection(state,conflicts[0],selection.value):undefined;
 const draft=clone(state);draft.conflicts=nextConflicts;draft.resolvedConflicts=nextResolved;draft.legacySnapshots=nextArchives;if(selection)draft[conflicts[0].collection]=collection;
 validateState(draft);
 if(selection)state[conflicts[0].collection]=collection;
 state.conflicts=nextConflicts;state.resolvedConflicts=nextResolved;state.legacySnapshots=nextArchives;return state;
}
export function keepCurrentConflict(state,id){const conflict=pendingConflict(state,id);return conflict?applyConflictReview(state,[conflict],'keep-current'):state}
export function acknowledgeMatchingConflicts(state){
 checkConflictReviewState(state);const conflicts=state.conflicts.filter(conflictCopiesMatch);
 if(conflicts.some(conflict=>(state.resolvedConflicts||[]).includes(conflict.id)))throw Error('A saved conflict is already marked reviewed.');
 return conflicts.length?applyConflictReview(state,conflicts,'matching-copies'):state;
}
export function reviewedConflicts(state){return Array.isArray(state?.legacySnapshots)?state.legacySnapshots.filter(entry=>entry?.kind==='reviewed-conflict'):[]}
export function resolveConflict(state,id,choice){
 if(!['local','remote'].includes(choice))throw Error('Choose a saved local or remote version.');
 const conflict=pendingConflict(state,id);return conflict?applyConflictReview(state,[conflict],choice,{value:conflict[choice]}):state;
}
export function restoreReviewedConflict(state,archiveId,choice){
 if(!reviewId(archiveId)||!['local','remote','current'].includes(choice))throw Error('Choose a saved recovery version.');
 checkConflictReviewState(state);const matches=state.legacySnapshots.filter(entry=>entry?.id===archiveId);
 if(matches.length!==1||matches[0].kind!=='reviewed-conflict')throw Error('The reviewed conflict recovery copy was not found or has an ambiguous identity.');
 const archive=matches[0];if(!reviewRecord(archive.data))throw Error('The reviewed conflict recovery copy is malformed.');
 const conflict=archive.data.conflict;checkConflictRecord(conflict);const current=archive.data.current;
 if(!reviewRecord(current)||typeof current.exists!=='boolean'||current.exists&&!Object.hasOwn(current,'value'))throw Error('The saved current value is malformed.');
 if(choice==='current'&&!current.exists)throw Error('There was no current record at review. Choose a saved version instead.');
 return applyConflictReview(state,[conflict],'restore-'+choice,{value:choice==='current'?current.value:conflict[choice]},archiveId);
}
export class LocalStore{
 constructor(storage){this.storage=storage;this.scope='guest';this.state=null;this.onQuota=null}
 load(scope='guest'){this.scope=scope;const text=this.storage.getItem('MGT_BETA_V8:'+scope);this.state=text?JSON.parse(text):defaultState();validateState(this.state);return this.state}
 save(state){
  const data=JSON.stringify({...state,updatedAt:now()}),key='MGT_BETA_V8:'+this.scope;
  try{this.storage.setItem(key,data)}catch(error){
   if(!isStorageQuotaError(error))throw error;
   if(!this.recoverQuota())throw error;
   this.storage.setItem(key,data);
  }
  this.state=JSON.parse(data);return this.state;
 }
 recoverQuota(){try{return this.onQuota?.()===true}catch{return false}}
 recoverySnapshots(){return readRecoverySnapshots(this.storage.getItem('MGT_BETA_SNAPSHOTS:'+this.scope))}
 snapshot(){
  let recovered=false;const key='MGT_BETA_SNAPSHOTS:'+this.scope,list=[{at:now(),state:clone(this.state)},...this.recoverySnapshots()].slice(0,3);
  for(;;){
   const data=encodeRecoverySnapshots(list);
   if(list.length>1&&data.length>700000){list.pop();continue}
   try{this.storage.setItem(key,data);return}
   catch(error){if(!isStorageQuotaError(error))throw error;if(!recovered&&this.recoverQuota()){recovered=true;continue}if(list.length>1){list.pop();continue}throw Error('Device storage is full. This change was not applied because a recovery copy could not be saved. Export a backup before retrying.');}
  }
 }
 legacy(){for(const key of ['MGT28v6','MGT28v5']){const data=this.storage.getItem(key);if(data)return {key,data:JSON.parse(data)}}return null}
}
