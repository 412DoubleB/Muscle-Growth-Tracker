// Selection rules are based on the user's chosen movement support and experience,
// never an age cutoff. Legacy catalog records remain unchanged.
const SUPPORTED_LEGACY=new Set([
 'horizontal-leg-press','leg-extension','seated-leg-curl','lying-leg-curl','glute-kickback-machine','hip-abductor-machine','hip-adductor-machine','calf-press-machine','seated-calf-raise','standing-calf-raise-machine',
 'machine-chest-press','machine-incline-press','pec-deck-fly','converging-plate-loaded-chest-press','plate-loaded-chest-press','plate-loaded-incline-press','plate-loaded-decline-press','hammer-strength-flat-press','hammer-strength-incline-press','hammer-strength-decline-press',
 'chest-supported-machine-row','machine-row','plate-loaded-row','plate-loaded-pulldown','hammer-strength-high-row','hammer-strength-low-row','hammer-strength-iso-lateral-row','hammer-strength-pulldown','seated-cable-row','lat-pulldown','wide-grip-lat-pulldown','neutral-grip-lat-pulldown','close-grip-lat-pulldown','close-neutral-lat-pulldown',
 'machine-shoulder-press','machine-lateral-raise','reverse-pec-deck','seated-dumbbell-shoulder-press','dumbbell-lateral-raise','dumbbell-front-raise','cable-lateral-raise','cable-rear-delt-fly',
 'machine-biceps-curl','machine-preacher-curl','dumbbell-curl','alternating-dumbbell-curl','hammer-curl','cross-body-hammer-curl','dumbbell-preacher-curl','cross-body-dumbbell-preacher-curl','cable-curl','rope-hammer-curl','barbell-curl','ez-bar-curl','preacher-curl','ez-bar-preacher-curl',
 'machine-triceps-extension','cable-pressdown','rope-pressdown','straight-bar-pressdown','reverse-grip-pressdown','dip-machine','machine-ab-crunch','pallof-press'
]);
const ADVANCED_LEGACY=new Set(['ab-wheel-rollout','hanging-leg-raise','nordic-hamstring-curl','glute-ham-raise','kettlebell-swing','pendlay-row','meadows-row','bulgarian-split-squat']);
const FLOOR_LEGACY=new Set(['ab-wheel-rollout','plank','side-plank','push-up','dumbbell-floor-press']);
export function resolveMovementOptions({movementLevel='auto',floorWork='auto',experience='Beginner'}={}){
 if(!['auto','supported','standard','advanced'].includes(movementLevel))throw Error('Choose a valid movement support level.');
 if(!['auto','allow','avoid'].includes(floorWork))throw Error('Choose whether floor exercises are comfortable.');
 const resolved=movementLevel==='auto'?['Beginner','Returning'].includes(experience)?'supported':'standard':movementLevel;
 return {movementLevel:resolved,movementLevelChoice:movementLevel,floorWork,allowFloorWork:floorWork==='allow'||floorWork==='auto'&&resolved!=='supported'};
}
export function isFloorExercise(exercise){return exercise?.floorRequired===true||FLOOR_LEGACY.has(exercise?.id)}
export function eligibleForProgramming(exercise,training={}){
 const active=training.accessibleProgramming===true;
 if(!active)return exercise?.newFamily!=='accessible';
 if(exercise?.purpose&&exercise.purpose!=='strength')return false;
 if(training.allowFloorWork===false&&isFloorExercise(exercise))return false;
 const level=training.movementLevel||(['Beginner','Returning'].includes(training.planExperience||training.experience)?'supported':'standard');
 if(exercise.newFamily==='accessible')return ({supported:0,standard:1,advanced:2}[exercise.programmingTier||'standard']??2)<=({supported:0,standard:1,advanced:2}[level]??1);
 if(level==='supported')return SUPPORTED_LEGACY.has(exercise.id);
 return level==='advanced'||!ADVANCED_LEGACY.has(exercise.id);
}
export function accessiblePriority(exercise,training={}){
 // Within the same equipment preference, a supported starting plan favors a
 // supported variation before rotating through other compatible strength work.
 return training.accessibleProgramming===true&&training.movementLevel==='supported'&&exercise.newFamily==='accessible'? -100:0;
}
