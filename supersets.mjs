// Pairing changes session structure only; each exercise keeps its own sets and history.
const copy=value=>structuredClone(value);
export const entered=exercise=>(exercise.sets||[]).some(s=>s.done||['w','r','rir'].some(k=>s[k]!==''&&s[k]!=null)||typeof s.band==='string'&&s.band.trim()!=='');
export const progressionContext=e=>e.progressionContext||(e.supersetId?'superset':'straight');
export function supersetGroups(day){
  const groups=new Map();
  (day.exercises||[]).forEach((e,index)=>{if(e.supersetId){const rows=groups.get(e.supersetId)||[];rows.push({exercise:e,index});groups.set(e.supersetId,rows)}});
  return [...groups].filter(([,rows])=>rows.length===2).map(([id,members],index)=>({id,label:String.fromCharCode(65+index),members:members.sort((a,b)=>(a.exercise.supersetOrder||a.index+1)-(b.exercise.supersetOrder||b.index+1)),restSeconds:+members[0].exercise.supersetRestSeconds||120}));
}
export const supersetFor=(day,index)=>supersetGroups(day).find(g=>g.members.some(m=>m.index===index));
export function pairingUnavailableReason(day,index){
  if(day.status==='completed')return 'Unlock this completed workout before changing supersets.';
  const e=day.exercises?.[index];
  if(!e)return 'Choose an exercise in this workout.';
  if(entered(e))return 'This exercise contains entered sets; its recorded structure stays protected.';
  if(e.supersetId&&(day.exercises||[]).some(other=>other.supersetId===e.supersetId&&entered(other)))return 'Its superset partner contains entered sets; this pair stays protected.';
  return '';
}
export const muscleFamilies=text=>new Set([
  ['chest',/pector|\bchest\b/i],['back',/latissimus|rhomboid|trapezius|\bback\b/i],
  ['shoulder',/deltoid|supraspinatus|\bshoulder/i],['biceps',/biceps(?!\s+femoris)|brachialis|brachioradialis/i],
  ['triceps',/triceps(?!\s+surae)/i],['quads',/quadriceps|\bquad/i],['hamstrings',/hamstring|biceps femoris|semitendinosus|semimembranosus/i],
  ['glutes',/glute/i],['calves',/gastrocnemius|soleus|\bcalf|\bcalves/i],
  ['core',/abdominis|oblique|\bcore\b|trunk stabiliz/i],['erectors',/erector/i],['grip',/\bgrip\b|forearm|carpi|\bwrist/i],
  ['adductors',/adductor|gracilis|pectineus/i],['hip-flexors',/iliopsoas|iliacus|psoas|hip flexor/i]
].filter(([,pattern])=>pattern.test(text||'')).map(([name])=>name));
const overlaps=(a,b)=>[...a].some(x=>b.has(x));
function muscleProfile(exercise,metaFor){
  const meta=metaFor(exercise)||exercise,name=meta.name||exercise.name||'',primary=muscleFamilies(meta.primary),secondary=muscleFamilies(meta.secondary);
  // A few clear movement requirements are absent from older catalog rows.
  // Keep this conservative and local to pairing; exercise metadata is unchanged.
  if((meta.group==='Shoulders'&&meta.compound&&/\bpress\b/i.test(name))||/\b(?:overhead|military|arnold|landmine)\b.*\bpress\b/i.test(name))secondary.add('back');
  const gripSupport=/\bhanging\b|\b(?:pull|chin)[ -]?ups?\b/i.test(name);
  if(gripSupport)secondary.add('grip');
  return {meta,primary,secondary,gripSupport};
}
function assessPair(a,b,metaFor){
  const af=muscleProfile(a,metaFor),bf=muscleProfile(b,metaFor),am=af.meta,bm=bf.meta,notes=[];
  const ap=af.primary,bp=bf.primary,as=af.secondary,bs=bf.secondary;
  const supportKnown=[am,bm].every(meta=>!meta.compound||typeof meta.secondary==='string'&&meta.secondary.trim().length>0);
  let score=0;
  if(!ap.size||!bp.size||!supportKnown){score+=3;notes.push('Muscle information is incomplete. Check this pairing yourself before training.');}
  const primaryOverlap=overlaps(ap,bp)||(!ap.size||!bp.size)&&am.group&&am.group===bm.group&&am.group!=='Other';
  const assistingOverlap=overlaps(ap,bs)||overlaps(bp,as),bothCompound=!!(am.compound&&bm.compound);
  const sharedSupport=[...as].filter(family=>bs.has(family)&&['core','erectors','grip'].includes(family));
  const competingStability=sharedSupport.some(family=>family!=='grip')&&(am.compound||bm.compound);
  const competingGrip=sharedSupport.includes('grip')&&(af.gripSupport||bf.gripSupport);
  const sharedSecondary=overlaps(as,bs);
  if(primaryOverlap){score+=4;notes.push('These exercises share a main muscle group. The second may need a lighter load as fatigue builds.');}
  else if(assistingOverlap){score+=2;notes.push('One exercise uses muscles that assist the other. Watch technique and reduce the load if needed.');}
  if(sharedSupport.length&&(am.compound||bm.compound)){score+=2;notes.push('These exercises share supporting muscles used for stability or grip. Straight sets can help preserve performance.');}
  if(competingGrip){score+=2;notes.push('Hanging or pull-up work depends on grip support also used by its partner. Keep this combination separate when grip limits performance.');}
  if(am.compound&&bm.compound){score+=3;notes.push('Both are compound lifts. Straight sets may make it easier to maintain technique and load.');}
  if(am.group==='Legs'&&am.compound||bm.group==='Legs'&&bm.compound){score+=6;notes.push('A demanding lower-body compound is included. Consider keeping it as straight sets.');}
  return {score,notes,known:ap.size>0&&bp.size>0&&supportKnown,primaryOverlap,assistingOverlap,bothCompound,sharedSecondary,sharedSupport:!!competingStability||competingGrip};
}
// Automatic pairing is deliberately more selective than manual pairing. An
// unmatched exercise keeps straight sets instead of borrowing a competing pair.
export function automaticPairingCompatible(a,b,metaFor=e=>e){
  const result=assessPair(a,b,metaFor);
  return result.known&&!result.primaryOverlap&&!result.assistingOverlap&&!(result.bothCompound&&result.sharedSecondary)&&!result.sharedSupport&&!demandingStraightLift(a,metaFor)&&!demandingStraightLift(b,metaFor);
}
// Advice is read-only and heuristic. A caution never prevents an intentional custom pair.
export function pairingAdvice(day,first,second,metaFor=e=>e){
  first=Number(first);second=Number(second);
  const invalid=!Number.isInteger(first)||!Number.isInteger(second)||first===second?'Choose two different exercises.':pairingUnavailableReason(day,first)||pairingUnavailableReason(day,second);
  if(invalid)return {allowed:false,title:invalid,notes:[],alternatives:[]};
  const a=day.exercises[first],b=day.exercises[second],assessment=assessPair(a,b,metaFor),notes=[...assessment.notes];
  const count=e=>(e.sets||[]).filter(s=>!['warmup','ramp','backoff','drop'].includes(s.role)).length;
  if(count(a)!==count(b))notes.push('Working-set counts differ. Finish unmatched sets individually; final recovery starts after every set of both exercises.');
  if(a.supersetId||b.supersetId)notes.push('Saving replaces their existing unstarted pairs. Unselected partners return to straight sets.');
  notes.push('Check equipment availability and walking distance. Each exercise keeps its own load, reps and RIR.');
  const alternatives=(day.exercises||[]).flatMap((e,index)=>{
    if(index===first||index===second||e.supersetId||pairingUnavailableReason(day,index))return [];
    const result=assessPair(a,e,metaFor);
    return result.known&&result.score<assessment.score?[{index,name:e.name,score:result.score}]:[];
  }).sort((a,b)=>a.score-b.score||a.index-b.index).slice(0,3);
  return {allowed:true,title:!assessment.known?'Review muscle information':assessment.score?'Consider the fatigue overlap':'Lower main-muscle overlap',notes,alternatives};
}
export function cleanSupersets(day){
  const out=copy(day),valid=new Set(supersetGroups(out).map(g=>g.id));
  for(const e of out.exercises||[])if(e.supersetId&&!valid.has(e.supersetId)){delete e.supersetId;delete e.supersetOrder;delete e.supersetRestSeconds;delete e.supersetSource;if(!entered(e))delete e.progressionContext}
  return out;
}
function editable(day){if(day.status==='completed')throw Error('Unlock this completed workout before changing supersets.')}
function clearMember(e){if(entered(e))throw Error('This superset already contains entered sets. Keep its recorded structure and pair other unstarted exercises.');delete e.supersetId;delete e.supersetOrder;delete e.supersetRestSeconds;delete e.supersetSource;delete e.progressionContext}
export function removeSuperset(day,id){
  editable(day);const out=copy(day);for(const e of out.exercises||[])if(!id||e.supersetId===id){if(e.supersetId)clearMember(e)}return out;
}
export function pairExercises(day,first,second,restSeconds=120){
  editable(day);first=+first;second=+second;restSeconds=+restSeconds;
  if(!Number.isInteger(first)||!Number.isInteger(second)||first===second||!day.exercises?.[first]||!day.exercises?.[second])throw Error('Choose two different exercises.');
  if(!Number.isInteger(restSeconds)||restSeconds<45||restSeconds>300)throw Error('Choose 45–300 seconds of rest between rounds.');
  const unavailable=pairingUnavailableReason(day,first)||pairingUnavailableReason(day,second);if(unavailable)throw Error(unavailable);
  let out=copy(day);const ids=new Set([out.exercises[first].supersetId,out.exercises[second].supersetId].filter(Boolean));
  for(const id of ids)out=removeSuperset(out,id);
  const id='pair-'+(globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2));
  for(const [order,index] of [first,second].entries()){const e=out.exercises[index];if(entered(e))throw Error('Choose exercises without entered sets to create a new superset.');e.supersetId=id;e.supersetOrder=order+1;e.supersetRestSeconds=restSeconds;e.supersetSource='manual';e.progressionContext='superset'}
  return out;
}
// Exclude demanding free-weight lower-body compounds from automatic pairs.
// Machines can pair with less competing work; manual pairing remains available.
export function demandingStraightLift(exercise,metaFor=e=>e){
  const meta=metaFor(exercise)||exercise;
  const primary=muscleFamilies(meta.primary),lowerBody=meta.group==='Legs'||['quads','hamstrings','glutes'].some(family=>primary.has(family));
  return !!(lowerBody&&meta.compound&&!/machine|leg press|hack squat|belt squat|smith|pendulum|glute drive|sled/i.test(meta.name||exercise.name||''));
}
export function pairingRationale(a,b,metaFor=e=>e){
  const result=assessPair(a,b,metaFor);
  return result.notes.length?result.notes.join(' '):'Different main muscles limit direct overlap. Keep each exercise’s own reps, load and RIR.';
}
export function autoSupersets(day,metaFor=e=>e,restSeconds=120,options={}){
  editable(day);restSeconds=+restSeconds;
  if(!Number.isInteger(restSeconds)||restSeconds<45||restSeconds>300)throw Error('Choose 45–300 seconds of rest between rounds.');
  let out=copy(day);options=options&&typeof options==='object'&&!Array.isArray(options)?options:{};
  if(options.rebuild===true){
    // Rebuilding is an explicit action. Older pairs have no source marker, so
    // all wholly unentered pairs can be reconsidered; recorded pairs stay put.
    for(const id of new Set(out.exercises.map(e=>e.supersetId).filter(Boolean))){
      if(out.exercises.filter(e=>e.supersetId===id).every(e=>!entered(e)))out=removeSuperset(out,id);
    }
  }
  const workCount=e=>(e.sets||[]).filter(s=>!['warmup','ramp','backoff','drop'].includes(s.role)).length;
  let eligible=out.exercises.map((e,index)=>({e,index})).filter(({e,index})=>!pairingUnavailableReason(out,index)&&!e.supersetId&&workCount(e)>0&&!demandingStraightLift(e,metaFor));
  if((options.trainingStyle||options.goal)==='strength'){
    // Keep the first compound for each trained group as priority straight work.
    // Accessory work can still pair when the muscle requirements are compatible.
    const anchored=new Set();eligible=eligible.filter(({e})=>{const meta=metaFor(e)||e;if(!meta.compound)return true;const group=meta.group||[...muscleFamilies(meta.primary)].sort().join('|');if(anchored.has(group))return true;anchored.add(group);return false});
  }
  const cost=(a,b)=>assessPair(a.e,b.e,metaFor).score*100+(workCount(a.e)===workCount(b.e)?0:40)+Math.abs(a.index-b.index);
  const edges=eligible.flatMap((a,i)=>eligible.slice(i+1).flatMap((b,j)=>automaticPairingCompatible(a.e,b.e,metaFor)?[{a:i,b:i+j+1,cost:cost(a,b)}]:[]));
  let chosen=[];
  if(eligible.length<=16){
    // Exact matching for normal 6–9-exercise sessions. Maximize only compatible
    // pairs, then prefer equal set counts, lower burden and nearby list positions.
    const costs=new Map(edges.map(e=>[e.a+':'+e.b,e.cost])),memo=new Map();
    function solve(mask){
      if(!mask)return {pairs:[],cost:0};if(memo.has(mask))return memo.get(mask);
      let a=0;while(!(mask&(1<<a)))a++;const rest=mask&~(1<<a);let best=solve(rest);
      for(let b=a+1;b<eligible.length;b++)if(rest&(1<<b)&&costs.has(a+':'+b)){
        const tail=solve(rest&~(1<<b)),candidate={pairs:[[a,b],...tail.pairs],cost:costs.get(a+':'+b)+tail.cost};
        if(candidate.pairs.length>best.pairs.length||candidate.pairs.length===best.pairs.length&&candidate.cost<best.cost)best=candidate;
      }
      memo.set(mask,best);return best;
    }
    chosen=solve((1<<eligible.length)-1).pairs;
  }else{
    // Bound work for unusually large manually assembled sessions.
    const used=new Set();for(const edge of edges.sort((a,b)=>a.cost-b.cost||a.a-b.a||a.b-b.b))if(!used.has(edge.a)&&!used.has(edge.b)){chosen.push([edge.a,edge.b]);used.add(edge.a);used.add(edge.b)}
  }
  for(const [a,b] of chosen.sort((a,b)=>eligible[a[0]].index-eligible[b[0]].index)){
    out=pairExercises(out,eligible[a].index,eligible[b].index,restSeconds);
    out.exercises[eligible[a].index].supersetSource='auto';out.exercises[eligible[b].index].supersetSource='auto';
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
