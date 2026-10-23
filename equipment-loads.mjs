// Equipment settings describe changes to the logged load. A logged barbell or
// machine total is never multiplied by its number of loading sides.
const DEFAULT_PLATES={lb:[10,25,35,45],kg:[1.25,2.5,5,10,15,20,25]};
const numeric=value=>(typeof value==='number'||typeof value==='string'&&value.trim()!=='')&&Number.isFinite(+value);
const round=value=>Math.round(value*100)/100;
const fmt=value=>String(round(value));
const normalized=value=>String(value??'').toLowerCase().replace(/[^a-z0-9]/g,'');
const positive=value=>numeric(value)&&+value>=.01&&+value<=1000;
const amount=(value,label,{zero=false,max=1000}={})=>{
 if(!numeric(value)||+value<(zero?0:.01)||+value>max||Math.abs(+value*100-Math.round(+value*100))>1e-6)throw Error(`${label} must be ${zero?'a non-negative':'a positive'} weight with at most two decimal places${max===1000?' (up to 1000)':''}.`);
 return round(+value);
};

export function normalizeLoadSetup(input,unit='lb'){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Choose a loading setup.');
 if(!['lb','kg'].includes(unit))throw Error('Choose lb or kg for the loading setup.');
 const kind=input.kind;if(!['stack','plates','free'].includes(kind))throw Error('Choose machine stack, plates or free weights.');
 const step=amount(input.step??(unit==='kg'?2.5:5),'Load increment');
 const minimum=amount(input.minimum??0,'Minimum load',{zero:true,max:100000});
 let plates=DEFAULT_PLATES[unit].slice(),sides=kind==='plates'?2:1;
 if(kind==='plates'){
  const raw=Array.isArray(input.plates)?input.plates:typeof input.plates==='string'?input.plates.trim().split(/[\s,;]+/).filter(Boolean):null;
  if(!raw?.length||raw.length>12)throw Error('Enter between 1 and 12 available plate sizes.');
  plates=[...new Set(raw.map(value=>amount(value,'Each plate size')))].sort((a,b)=>a-b);
  if(unit==='lb'&&plates.some(value=>!DEFAULT_PLATES.lb.includes(value)))throw Error('Plate-loaded lb recommendations use only 10, 25, 35 or 45 lb plates at each loading point.');
  if(!numeric(input.sides)||![1,2].includes(+input.sides))throw Error('Choose one loading point or two matching sides.');
  sides=+input.sides;
 }
 return {kind,step,plates,sides,minimum};
}

function inferredSetup(meta,exercise){
 const raw=meta?.equipmentRequirements??meta?.equipment;
 const clauses=Array.isArray(raw)?raw.map(clause=>(Array.isArray(clause)?clause:[clause]).filter(item=>typeof item==='string')):[];
 // An optional plate in an alternative setup cannot establish plate loading.
 const requiredPlates=clauses.some(clause=>clause.length&&clause.every(item=>/^(?:olympic )?plates?$/i.test(item)));
 const equipment=clauses.flat(),name=String(meta?.name||exercise?.name||'');
 if(requiredPlates){
  // These use one loaded end/post. A two-sided barbell rule would double their
  // intended changes incorrectly, even though their requirements include plates.
  const single=/landmine|meadows|t-bar|sled|belt squat|seated calf|glute drive|hip thrust machine/i.test(name+' '+equipment.join(' '));
  return {kind:'plates',sides:single?1:2};
 }
 const perHand=meta?.loadMode==='perHand'||exercise?.loadMode==='perHand';
 const free=perHand||meta?.loadMode==='bodyweight'||exercise?.loadMode==='bodyweight'||equipment.length&&equipment.every(item=>/^(?:dumbbells|kettlebells|bodyweight|.*bench|.*rack|dip belt \/ weighted vest)$/i.test(item));
 return {kind:free?'free':'stack',sides:1};
}

export function resolveLoadSetup(state,exercise={},gym={},meta=exercise){
 const unit=state?.profile?.units==='kg'?'kg':'lb';
 const key=String(exercise.exerciseId||meta?.id||normalized(exercise.name||meta?.name)||'unclassified-exercise');
 const perHand=meta?.loadMode==='perHand'||exercise.loadMode==='perHand',compound=meta?.compound===true;
 const fallback=unit==='kg'?2.5:5,gymStep=unit==='kg'?gym?.incrementKg:gym?.increment;
 const step=positive(gymStep)?+gymStep:fallback;
 let configured=false,legacy=false,profile;
 const saved=Object.hasOwn(gym?.loadProfiles||{},key)?gym.loadProfiles[key]?.[unit]:null;
 if(saved)try{
  if(unit==='lb'&&saved.kind==='plates'){
   // Older previews allowed small plates. Apply the owner's corrected policy
   // read-only, preserving the stored original profile and its loading basis.
   const raw=Array.isArray(saved.plates)?saved.plates:typeof saved.plates==='string'?saved.plates.trim().split(/[\s,;]+/).filter(Boolean):[];
   const supported=raw.filter(value=>numeric(value)&&DEFAULT_PLATES.lb.includes(+value)).map(Number);
   profile=normalizeLoadSetup({...saved,plates:supported.length?supported:DEFAULT_PLATES.lb},unit);
   configured=supported.length>0;
  }else{profile=normalizeLoadSetup(saved,unit);configured=true}
 }catch{/* Imported invalid settings cannot break workout rendering. */}
 if(!profile){
  // A former blanket increment cannot turn audited plate equipment into a free
  // 5 lb adjustment. Keep it only for stack/free setups, where it is already a
  // TOTAL/per-hand increment and must not be doubled.
  const audited=inferredSetup(meta,exercise);
  legacy=(unit==='kg'||audited.kind!=='plates')&&positive(exercise.increment);
  const inferred=legacy?{kind:'free',sides:1}:audited;
  profile={...inferred,step:legacy?+exercise.increment:step,plates:DEFAULT_PLATES[unit].slice(),minimum:0};
 }
 const basis=profile.kind==='plates'?`${profile.sides===2?'two matching sides':'one loading point'}; plate sizes ${profile.plates.map(fmt).join(', ')} ${unit}`:`${fmt(profile.step)} ${unit}${perHand?' per hand':''} ${profile.kind==='stack'?'stack':'load'} steps`;
 const description=`${configured?'Saved equipment setup':legacy?'Exercise increment override':'Suggested equipment setup'}: ${basis}.${configured?'':' Confirm the actual equipment in Load setup.'}`;
 return {key,unit,...profile,compound,perHand,configured,description};
}

export function loadChangeOptions(setup,maxDelta){
 if(!numeric(maxDelta)||+maxDelta<=0||!setup||!['stack','plates','free'].includes(setup.kind))return [];
 const budget=Math.min(1000000,+maxDelta),limit=Math.floor((budget+1e-8)*100);
 if(setup.kind!=='plates'){
  if(!positive(setup.step))return [];
  const step=Math.round(+setup.step*100);if(step<1)return [];
  const count=Math.min(4096,Math.floor(limit/step));
  return Array.from({length:count},(_,index)=>({delta:(index+1)*step/100}));
 }
 if(!Array.isArray(setup.plates)||!setup.plates.length||setup.plates.length>12||![1,2].includes(setup.sides)||setup.plates.some(value=>!positive(value)))return [];
 const sizes=[...new Set(setup.plates.map(value=>Math.round(+value*100)))].sort((a,b)=>b-a),sides=setup.sides,choices=new Map();
 // Four changed plates per side covers ordinary adjustments without unbounded
 // coin-change work on an imported or maliciously large setting.
 function visit(start,sum,counts,count){
  if(count){
   const total=sum*sides,existing=choices.get(total);
   if(!existing||count<existing.count)choices.set(total,{count,plates:counts.map(([weight,n])=>({weight:weight/100,count:n}))});
  }
  if(count===4)return;
  for(let index=start;index<sizes.length;index++){
   const weight=sizes[index],next=sum+weight;if(next*sides>limit)continue;
   const copy=counts.map(pair=>pair.slice());
   if(copy.at(-1)?.[0]===weight)copy.at(-1)[1]++;else copy.push([weight,1]);
   visit(index,next,copy,count+1);
  }
 }
 visit(0,0,[],0);
 return [...choices].sort(([a],[b])=>a-b).map(([value,choice])=>({delta:value/100,plates:choice.plates}));
}

// Absolute loads must fit the equipment grid even when the latest logged load
// came from an import or a unit conversion. Relative changes alone would keep an
// off-grid source off-grid forever (for example, 53 + a 10 lb step = 63).
export function reachableLoadOptions(setup,lower,upper){
 if(!setup||!['stack','plates','free'].includes(setup.kind)||!numeric(lower)||!numeric(upper)||+upper<+lower||+upper<0||Math.max(Math.abs(+lower),Math.abs(+upper))>Number.MAX_SAFE_INTEGER/100)return [];
 const minimum=setup.minimum??0;
 if(!numeric(minimum)||+minimum<0||+minimum>100000||Math.abs(+minimum*100-Math.round(+minimum*100))>1e-6)return [];
 const base=Math.round(+minimum*100),lo=Math.max(base,Math.ceil((+lower-1e-8)*100)),hi=Math.floor((+upper+1e-8)*100);
 if(hi<lo)return [];
 if(setup.kind!=='plates'){
  if(!positive(setup.step)||Math.abs(+setup.step*100-Math.round(+setup.step*100))>1e-6)return [];
  const step=Math.round(+setup.step*100),start=Math.max(0,Math.ceil((lo-base)/step)),end=Math.floor((hi-base)/step),count=end-start+1;
  // Empty/manual guidance is safer than silently sampling a dense grid and
  // missing the closest usable load on imported extreme settings.
  if(!Number.isSafeInteger(count)||count<1||count>4096)return [];
  return Array.from({length:count},(_,index)=>(base+(start+index)*step)/100);
 }
 if(!Array.isArray(setup.plates)||!setup.plates.length||setup.plates.length>12||![1,2].includes(setup.sides)||setup.plates.some(value=>!positive(value)||Math.abs(+value*100-Math.round(+value*100))>1e-6))return [];
 const coins=[...new Set(setup.plates.map(value=>Math.round(+value*100)*setup.sides))].sort((a,b)=>a-b);
 const gcd=(a,b)=>b?gcd(b,a%b):a,unit=coins.reduce(gcd);
 // A maximum of 32 plates at each loading point bounds physical inventory and
 // computation. DP tracks the fewest plates needed for each total, so repeated
 // sizes are allowed without inventing a need for more than 32 plates per side.
 const max=Math.min(hi-base,coins.at(-1)*32),cells=Math.floor(max/unit)+1;
 if(cells>200000||cells<1)return [];
 const dp=new Uint8Array(cells);dp.fill(255);dp[0]=0;
 const scaled=coins.map(coin=>coin/unit);
 for(let total=1;total<cells;total++)for(const coin of scaled){
  if(coin>total)break;
  const previous=dp[total-coin];if(previous<32&&previous+1<dp[total])dp[total]=previous+1;
 }
 const loads=[];
 for(let total=Math.max(0,Math.ceil((lo-base)/unit));total<cells;total++)if(dp[total]<=32)loads.push((base+total*unit)/100);
 return loads;
}

// Working-set recommendations use a single allowed plate change at each
// loading point. The broader absolute grid remains available for advanced-set
// calculations; being physically loadable does not make a combination an
// approved working-set increment (for example, +40 lb from two 10 lb pairs).
export function recommendedLoadOptions(setup,reference,lower,upper){
 const options=reachableLoadOptions(setup,lower,upper);
 if(setup?.kind!=='plates'||setup.unit==='kg')return options;
 if(!numeric(reference)||+reference<0||!Array.isArray(setup.plates)||![1,2].includes(setup.sides))return [];
 const changes=new Set(setup.plates.filter(value=>numeric(value)&&DEFAULT_PLATES.lb.includes(+value)).map(value=>+value*setup.sides));
 return options.filter(weight=>[...changes].some(change=>Math.abs(Math.abs(weight-+reference)-change)<1e-6));
}

export function describeLoadChange(setup,delta,{decrease=false}={}){
 if(!numeric(delta)||+delta<=0)return 'Keep the same load.';
 const unit=setup?.unit==='kg'?'kg':'lb',amount=round(+delta);
 if(setup?.kind==='plates'&&[1,2].includes(setup.sides)){
  const perSide=fmt(amount/setup.sides);
  if(decrease)return `Rebalance the plates for ${fmt(amount)} ${unit} less total (${perSide} ${unit} less ${setup.sides===2?'per side':'at the loading point'}).`;
  const option=loadChangeOptions(setup,amount+.000001).find(option=>Math.abs(option.delta-amount)<.001);
  if(option){
   const pieces=option.plates.map(({weight,count})=>`${count===1?'one':count===2?'two':count===3?'three':'four'} ${fmt(weight)} ${unit} plate${count===1?'':'s'}`).join(' + ');
   return `Add ${pieces} ${setup.sides===2?'to each side':'at the loading point'}: +${fmt(amount)} ${unit} total${setup.sides===2?` (${perSide} ${unit} per side)`:''}.`;
  }
  return `Increase the logged total by ${fmt(amount)} ${unit} (${perSide} ${unit} ${setup.sides===2?'per side':'at the loading point'}).`;
 }
 const verb=decrease?'Reduce':'Increase';
 if(setup?.kind==='stack'&&positive(setup.step)){
  const count=amount/setup.step,steps=Math.abs(count-Math.round(count))<1e-6?` (${Math.round(count)} stack step${Math.round(count)===1?'':'s'})`:'';
  return `${verb} by ${fmt(amount)} ${unit}${steps}.`;
 }
 return `${verb} by ${fmt(amount)} ${unit}${setup?.perHand?' per hand':''}.`;
}
