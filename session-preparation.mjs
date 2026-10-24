// Original MENEI examples informed by general guidance, not copied trainer plans.
// Pure view model: never creates workout rows, IDs, completion state or history.
const SOURCES=[
 {title:'American Heart Association · warm-up and cool-down',url:'https://www.heart.org/en/healthy-living/exercise-and-physical-activity/fitness-basics/warm-up-cool-down',scope:'Gradual easy activity and comfortable, unbounced stretching.'},
 {title:'ACSM · 2026 resistance training guidance',url:'https://acsm.org/resistance-training-guidelines-update-2026/',scope:'Individualized resistance training; bands and bodyweight are valid tools.'}
];
const ACCESSIBLE_PREP_SOURCES=[
 {title:'NHS · strength exercises with supported variations',url:'https://www.nhs.uk/live-well/exercise/strength-exercises/'},
 {title:'NHS · comfortable seated movement',url:'https://www.nhs.uk/live-well/exercise/sitting-exercises/'},
 {title:'NHS · warming up before exercise',url:'https://www.nhs.uk/live-well/exercise/how-to-warm-up-before-exercising/'},
 {title:'CDC · strength and balance activity for older adults',url:'https://www.cdc.gov/physical-activity-basics/adding-older-adults/what-counts.html'}
];
const LABELS={chest:'Chest',back:'Back',shoulders:'Shoulders',biceps:'Biceps',triceps:'Triceps',forearms:'Forearms',quads:'Quadriceps',hamstrings:'Hamstrings',glutes:'Glutes',adductors:'Inner thighs',abductors:'Outer hips',calves:'Calves',tibialis:'Shins',core:'Core',legs:'Legs'};
const TAGS={...Object.fromEntries(Object.keys(LABELS).map(key=>[key,key])),lats:'back',upper_back:'back',lower_traps:'back',anterior_delts:'shoulders',lateral_delts:'shoulders',rear_delts:'shoulders',obliques:'core'};
const normal=value=>String(value??'').toLowerCase().replace(/[^a-z0-9]/g,'');
const positive=value=>(typeof value==='number'||typeof value==='string'&&value.trim()!=='')&&Number.isFinite(+value)&&+value>0;
const safeMinutes=(value,fallback)=>positive(value)?+value:fallback;
const words=value=>String(value??'').toLowerCase();
function muscleKeys(meta){
 const keys=new Set();
 for(const tag of Array.isArray(meta.muscleTags)?meta.muscleTags:[])if(Object.hasOwn(TAGS,tag))keys.add(TAGS[tag]);
 const subgroup=words(meta.subgroup),group=words(meta.group);
 if(Object.hasOwn(TAGS,subgroup))keys.add(TAGS[subgroup]);
 if(Object.hasOwn(TAGS,group)&&group!=='legs')keys.add(TAGS[group]);
 const primary=words(meta.primary);
 for(const [key,pattern] of [
  ['chest',/pector|\bchest\b/],['back',/latissimus|rhomboid|trapezius|\bback\b/],['shoulders',/deltoid|rotator cuff|shoulder/],
  ['biceps',/biceps|brachialis/],['triceps',/triceps/],['forearms',/forearm|wrist|finger|grip|brachioradialis/],
  ['quads',/quadriceps|\bquads\b/],['hamstrings',/hamstring/],['glutes',/glute/],['adductors',/adductor/],['abductors',/abductor/],
  ['calves',/gastrocnemius|soleus|calves|calf/],['tibialis',/tibialis/],['core',/abdominis|oblique|\bcore\b|\btrunk\b/]
 ])if(pattern.test(primary))keys.add(key);
 // Include concrete assistance muscles for familiar compound movements, rather
 // than turning generic grip/trunk stabilizer text into a full-body prescription.
 if(meta.compound){
  const secondary=words(meta.secondary);
  if(/triceps/.test(secondary))keys.add('triceps');
  if(/biceps|brachialis/.test(secondary))keys.add('biceps');
  if(/deltoid|rotator cuff/.test(secondary))keys.add('shoulders');
 }
 if(group==='legs'&&!['quads','hamstrings','glutes','adductors','abductors','calves','tibialis'].some(key=>keys.has(key)))keys.add('legs');
 return keys;
}
function targets(day,catalog){
 const keys=new Set();
 for(const exercise of Array.isArray(day.exercises)?day.exercises:[]){
  if(!exercise||exercise.deleted)continue;
  const meta=catalog.find(item=>item&&!item.deleted&&exercise.exerciseId&&item.id===exercise.exerciseId)||catalog.find(item=>item&&!item.deleted&&[item.name,...(Array.isArray(item.aliases)?item.aliases:[])].some(name=>normal(name)&&normal(name)===normal(exercise.name)))||exercise;
  for(const key of muscleKeys(meta))keys.add(key);
 }
 if(day.run&&positive(day.run.minutes))for(const key of ['quads','hamstrings','glutes','calves'])keys.add(key);
 return keys;
}
const item=(id,name,dose,cue,keys,seconds,equipment='None')=>({id,name,dose,cue,equipment,muscles:keys.map(key=>LABELS[key]),seconds});
const has=(keys,...choices)=>choices.some(key=>keys.has(key));
function focusedWarmup(keys,bands,loopBandAvailable){
 const out=[];
 if(has(keys,'chest','shoulders'))out.push(item('arm-circles','Small arm circles and reaches','5 slow circles each way, then 5 easy reaches','Start below shoulder height. Increase the arc only while comfortable.',['shoulders','chest'],35));
 if(has(keys,'back','shoulders'))out.push(bands
  ?item('band-pull-apart','Light band pull-apart','6–8 easy repetitions','Hold a light band below shoulder height and separate the hands a short distance. Keep soft elbows; do not aim or anchor the band toward your face.',['back','shoulders'],35,'Light resistance band')
  :item('shoulder-blade-reaches','Shoulder-blade reaches','6–8 slow repetitions','Reach both arms forward, then gently draw the elbows back. Keep the neck relaxed and use a small, controlled range.',['back','shoulders'],35));
 if(has(keys,'biceps','triceps','forearms'))out.push(item('elbow-wrist-mobility','Easy elbow and wrist movement','6 bends, then 5 wrist circles each way','Open and close the hands while moving the elbows and wrists gently. Keep this unloaded.',['biceps','triceps','forearms'],35));
 if(has(keys,'quads','glutes','legs'))out.push(item('shallow-squat','Shallow bodyweight squat','5–6 easy repetitions','Use a short, comfortable range and stand smoothly. Keep a stable support nearby if balance needs it.',['quads','glutes'],40));
 if(has(keys,'hamstrings'))out.push(item('unloaded-hip-hinge','Unloaded hip hinge','5–6 easy repetitions','Soften the knees and move the hips back a little while keeping a long, comfortable spine. Stand without snapping the knees straight.',['hamstrings','glutes'],35));
 if(has(keys,'adductors','abductors'))out.push(bands&&loopBandAvailable===true&&has(keys,'abductors')
  ?item('band-side-steps','Easy band side steps','4 small steps each way','Place a light loop above the knees. Use small controlled steps with knees following the toes; stop before the muscles tire.',['glutes','abductors'],35,'Light loop resistance band')
  :item('side-weight-shifts','Small side-to-side weight shifts','5 gentle shifts each way','Keep both feet on the floor and shift only as far as comfortable. Use a steady support if needed.',['adductors','abductors'],35));
 if(has(keys,'calves','tibialis','legs'))out.push(item('ankle-rocks','Gentle ankle rocks','6 slow repetitions each side','With both feet on the floor, gently let one knee move forward over its toes while its heel stays down. Keep the range small.',['calves','tibialis'],35));
 if(has(keys,'core'))out.push(item('standing-brace','Easy standing brace and breathing','4 slow breaths','Stand comfortably, exhale and lightly brace the abdomen. Continue breathing; do not hold your breath or strain.',['core'],30));
 return out;
}
function focusedCooldown(keys){
 const out=[];
 if(has(keys,'chest'))out.push(item('chest-opener','Low chest opener','Hold 15–20 seconds','Open the arms gently below shoulder height, palms facing forward. Keep the ribs relaxed and stop short of shoulder discomfort.',['chest'],20));
 if(has(keys,'back'))out.push(item('upper-back-hug','Gentle upper-back hug','Hold 15–20 seconds','Give yourself a loose hug and allow the shoulder blades to move apart. Keep the neck relaxed.',['back'],20));
 if(has(keys,'shoulders'))out.push(item('cross-body-shoulder','Cross-body shoulder stretch','Hold 15–20 seconds each side','Bring one arm gently across the chest and support it above the elbow. Keep the shoulder low and do not force the arm across.',['shoulders'],40));
 if(has(keys,'biceps'))out.push(item('biceps-opener','Gentle biceps opener','Hold 15–20 seconds each side','Let one arm reach slightly behind the hip with the palm facing forward. Keep the elbow soft and use only a mild stretch.',['biceps'],40));
 if(has(keys,'triceps'))out.push(item('triceps-stretch','Comfortable triceps stretch','Hold 15–20 seconds each side','If overhead movement is comfortable, bend one elbow with the hand toward the same shoulder blade. Support the arm lightly without pulling on the elbow or neck.',['triceps'],40));
 if(has(keys,'forearms'))out.push(item('forearm-stretch','Gentle forearm stretch','Hold 15–20 seconds each side','Reach one arm forward with a soft elbow. Use the other hand for a small, comfortable wrist extension; do not pull hard on the fingers.',['forearms'],40));
 if(has(keys,'quads','legs'))out.push(item('supported-thigh-stretch','Supported front-thigh stretch','Hold 15–20 seconds each side','Use a stable support before bending one knee and gently bringing the heel toward the buttock. Skip this variation if balance or the position is uncomfortable.',['quads'],40,'Stable support'));
 if(has(keys,'hamstrings'))out.push(item('hamstring-stretch','Short-stance hamstring stretch','Hold 15–20 seconds each side','Place one heel a short distance ahead with a soft knee. Tip forward slightly from the hips without rounding or reaching for the toes.',['hamstrings'],40));
 if(has(keys,'glutes','abductors'))out.push(item('glute-stretch','Seated glute stretch','Hold 15–20 seconds each side','On a stable chair, cross an ankle over the other lower leg only if comfortable. Sit tall and make a small forward hinge; skip if it stresses the knee or hip.',['glutes','abductors'],40,'Stable chair'));
 if(has(keys,'adductors'))out.push(item('inner-thigh-stretch','Gentle inner-thigh stretch','Hold 15–20 seconds each side','Use a comfortably wide stance and shift slightly toward one bent knee. Keep both feet grounded and avoid forcing a deep side lunge.',['adductors'],40));
 if(has(keys,'calves','tibialis','legs'))out.push(item('calf-stretch','Easy split-stance calf stretch','Hold 15–20 seconds each side','Take a short split stance and keep the back heel down as the front knee bends gently. Use a stable support if needed.',['calves'],40));
 if(has(keys,'core'))out.push(item('easy-side-reach','Gentle standing side reach','Hold 10–15 seconds each side','Reach one hand comfortably overhead, or keep it at the hip, and lean a small distance sideways. Keep breathing and avoid twisting.',['core'],30));
 return out;
}

function supportedPreparation(warmup,cooldown,keys,{supportAvailable,chairAvailable}){
 const replacement=new Map();
 if(chairAvailable){
  replacement.set('gradual-easy-start',item('seated-easy-start','Gradual seated warm-up','5–10 minutes at an easy pace','Sit on a stable chair with both feet supported. Alternate small, comfortable marches with gentle heel and toe movements. Build the pace gradually while breathing easily.',[],300,'Stable chair'));
  replacement.set('shallow-squat',item('seated-knee-rehearsal','Gentle seated knee movement','4–6 comfortable repetitions each side','On a stable chair, slowly straighten one knee a little and lower the foot. Keep this easy; these are preparation movements, not working sets.',['quads'],40,'Stable chair'));
  replacement.set('standing-brace',item('seated-brace','Easy seated brace and breathing','4 slow breaths','Sit comfortably on a stable chair. Exhale and lightly brace the abdomen while continuing to breathe normally.',['core'],30,'Stable chair'));
  replacement.set('easy-side-reach',item('seated-side-reach','Gentle seated side reach','Hold 10–15 seconds each side','Keep both feet planted on a stable chair. Reach only a small comfortable distance sideways without twisting or holding the breath.',['core'],30,'Stable chair'));
 }else if(supportAvailable){
  replacement.set('shallow-squat',item('supported-small-knee-bend','Supported small knee bend','4–6 easy repetitions','Use a secure hand support for balance and bend the knees only a little. Keep both feet planted and stand smoothly.',['quads','glutes'],40,'Stable support'));
 }else{
  replacement.set('shallow-squat',item('easy-knee-softening','Small knee softening','4–6 easy repetitions','Keep both feet firmly planted. Soften and straighten the knees through a very small comfortable range; omit if unsteady.',['quads'],40));
 }
 if(has(keys,'back','shoulders','chest'))warmup.push(item('gentle-shoulder-roll','Gentle shoulder rolls','5 small circles each way','Keep the arms relaxed and circle the shoulders gently without forcing a large range.',['shoulders','back'],30));
 if(supportAvailable)warmup.push(item('supported-balance-practice','Optional supported balance practice','10–15 seconds each side','Stand beside a secure support and keep a hand on it. Place one foot slightly ahead of the other, keeping enough space between the feet to feel steady. Skip if uncomfortable.',['core','calves'],30,'Stable support'));
 return {warmup:warmup.map(step=>replacement.get(step.id)||step),cooldown:cooldown.map(step=>replacement.get(step.id)||step)};
}

/**
 * sessionPreparation(day,{catalog=[],bands=false}) is a read-only view model.
 * Items: {id,name,dose,cue,equipment:string,muscles:string[],seconds:number}.
 * Minute totals estimate these optional instructions, not measured activity.
 * Existing run walk/jog phases remain included in run.minutes; consumers must
 * not automatically add these totals to a session or its existing 5-min warmup.
 */
export function sessionPreparation(day={}, {catalog=[],bands=false,movementLevel=day?.movementLevel||'standard',allowFloorWork=day?.allowFloorWork!==false,supportAvailable=false,chairAvailable=false,loopBandAvailable=false}={}){
 const safeDay=day&&typeof day==='object'&&!day.deleted?day:{},safeCatalog=Array.isArray(catalog)?catalog:[],keys=targets(safeDay,safeCatalog);
 const exercises=Array.isArray(safeDay.exercises)?safeDay.exercises.filter(e=>e&&!e.deleted):[],run=safeDay.run&&positive(safeDay.run.minutes)?safeDay.run:null;
 const kind=exercises.length?'strength':run?'run':safeDay.kind==='rest'?'recovery':'general',warmup=[],cooldown=[],notes=[];
 const includedRunPreparation=run?{warmupMinutes:safeMinutes(run.warmup,0),cooldownMinutes:safeMinutes(run.cooldown,0)}:{warmupMinutes:0,cooldownMinutes:0};
 if(kind==='recovery'){
  warmup.push(item('recovery-mobility','Optional easy recovery movement','2–3 minutes at your own pace','Try gentle walking and comfortable joint movements. Rest instead if that feels better; no workout completion is needed.',[],120));
  notes.push('Recovery-day mobility is optional and is not a logged workout.');
 }else{
  const runOnly=kind==='run',recordedWarmup=runOnly&&includedRunPreparation.warmupMinutes>0,recordedCooldown=runOnly&&includedRunPreparation.cooldownMinutes>0;
  warmup.push(item('gradual-easy-start',recordedWarmup?'Use the run’s planned easy start':'Gradual easy warm-up',recordedWarmup?`${includedRunPreparation.warmupMinutes} minutes · already included in run time`:'5–10 minutes at an easy pace',recordedWarmup?'Follow the easy walking or jogging phase already described in your run. Increase the pace gradually.':'Begin with easy walking, marching or another comfortable whole-body activity. Build the pace gradually; take longer when needed.',[],recordedWarmup?includedRunPreparation.warmupMinutes*60:300));
  warmup.push(...focusedWarmup(keys,bands===true,loopBandAvailable===true));
  if(exercises.length)warmup.push(item('light-rehearsal','Rehearse the first lifting movement','A few easy practice repetitions','Use bodyweight or deliberately light resistance, then build up gradually only while technique stays comfortable. These practice repetitions are separate from your logged working sets.',[],60));
  cooldown.push(item('gradual-easy-finish',recordedCooldown?'Use the run’s planned easy finish':'Gradual easy cool-down',recordedCooldown?`${includedRunPreparation.cooldownMinutes} minutes · already included in run time`:'5–10 minutes of gradually easier movement',recordedCooldown?'Follow the easy walking or jogging finish already described in your run, slowing down gradually.':'Walk or keep moving gently as your breathing settles. Reduce the pace gradually before trying the optional stretches.',[],recordedCooldown?includedRunPreparation.cooldownMinutes*60:300));
  cooldown.push(...focusedCooldown(keys));
  if(!keys.size)notes.push('No muscle metadata is available for these movements, so this is general preparation.');
 }
 if(run)notes.push(includedRunPreparation.warmupMinutes||includedRunPreparation.cooldownMinutes?'Your run’s recorded walking/jogging warm-up and cool-down phases are already included in its listed minutes. Optional mobility drills and stretches are extra.':'This run has no recorded warm-up/cool-down phase durations. These optional instructions are not added to its listed minutes automatically.');
 if(exercises.length)notes.push('The existing lifting-time estimate already allows a general warm-up. These optional instructions are not added to session timing automatically.');
 if(bands===true)notes.push('Band options assume you have chosen to use your own suitable light band. Check it for damage; no door or face-level anchor is required. Equipment-free alternatives remain available by turning bands off.');
  if(movementLevel==='supported'){
  // Running's explicit easy-start/finish phases remain exactly as recorded.
  const prepared=supportedPreparation(warmup,cooldown,keys,{supportAvailable:supportAvailable===true,chairAvailable:chairAvailable===true});
  warmup.splice(0,warmup.length,...prepared.warmup.map(step=>run&&step.id==='seated-easy-start'?warmup.find(original=>original.id==='gradual-easy-start')||step:step));
  cooldown.splice(0,cooldown.length,...prepared.cooldown);
  notes.push('Supported preparation uses comfortable standing or seated options. Optional balance practice is included only when a stable support is confirmed; it is separate from working strength sets.');
 }
 // A suggested stretch never assumes a chair, wall or hand support exists.
 for(let i=cooldown.length-1;i>=0;i--)if(cooldown[i].equipment==='Stable chair'&&chairAvailable!==true||cooldown[i].equipment==='Stable support'&&supportAvailable!==true)cooldown.splice(i,1);
 if(allowFloorWork===false)notes.push('Floor exercises are excluded by your movement preference. These preparation options do not require a floor transfer.');
 if(bands===true&&loopBandAvailable!==true)notes.push('A generic resistance band does not confirm a loop band. Hip preparation uses equipment-free alternatives unless a suitable loop is confirmed.');
 const warmupSeconds=warmup.reduce((sum,step)=>sum+step.seconds,0),cooldownSeconds=cooldown.reduce((sum,step)=>sum+step.seconds,0);
 return {kind,optional:true,movementLevel,allowFloorWork:allowFloorWork!==false,targetMuscles:[...keys].map(key=>LABELS[key]),warmup,cooldown,warmupMinutes:Math.ceil(warmupSeconds/60),cooldownMinutes:Math.ceil(cooldownSeconds/60),includedRunPreparation,notes,safetyCue:'Stay within a comfortable range, breathe normally and skip any movement that causes pain. Hold stretches gently without bouncing.',sources:[...SOURCES,...(movementLevel==='supported'?ACCESSIBLE_PREP_SOURCES:[])].map(source=>({...source}))};
}
