/**
 * Canonical exercise audit for the Muscle Growth Tracker private beta.
 * Pure/deterministic: source data and history are never mutated.
 * equipment is CNF: every outer clause must be satisfied, any inner item suffices.
 * All original spellings are retained in aliases for history/media matching.
 */
import {appendAccessibleExercises} from './accessible-exercises.mjs?v=8.2.0';

export const normalizeExerciseName = value => String(value ?? '')
  .normalize('NFKC').replace(/[’‘]/g, "'").toLowerCase()
  .replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');

const ALIAS_GROUPS = [
  ['Barbell Bench Press', 'Flat barbell bench', 'Barbell bench'],
  ['Incline Barbell Bench Press', 'Incline barbell press'],
  ['Decline Barbell Bench Press', 'Decline press'],
  ['Dumbbell Bench Press', 'Flat DB press'],
  ['Incline Dumbbell Press', 'Incline DB press'],
  ['Decline Dumbbell Press', 'Decline DB press'],
  ['Dumbbell Squeeze Press', 'DB squeeze press'],
  ['Low-to-High Cable Fly', 'Low-to-high cable fly'],
  ['High-to-Low Cable Fly', 'High-to-low cable crossover'],
  ['Incline Cable Fly', 'Incline cable fly'],
  ['Smith Machine Incline Press', 'Smith incline press'],
  ['Smith Machine Squat', 'Smith squat'],
  ['Hammer Strength Incline Press', 'Hammer Strength incline'],
  ['Pec Deck Fly', 'Pec deck'],
  ['Converging Plate-Loaded Chest Press', 'Converging chest press'],
  ['Plate-Loaded Decline Press', 'Decline machine press'],
  ['Wide-Grip Lat Pulldown', 'Wide-grip pulldown', 'Wide-grip lat pulldown'],
  ['Neutral-Grip Lat Pulldown', 'Neutral-grip pulldown'],
  ['Close-Neutral Lat Pulldown', 'Close-neutral pulldown'],
  ['Underhand Lat Pulldown', 'Underhand pulldown'],
  ['Single-Arm Kneeling Lat Pulldown', 'Single-arm kneeling lat pulldown'],
  ['Chest-Supported Dumbbell Row', 'Chest-supported DB row'],
  ['Chest-Supported Machine Row', 'Chest-supported row'],
  ['Wide Chest-Supported Machine Row', 'Wide chest-supported row'],
  ['Hammer Strength Iso-Lateral Row', 'Chest-supported Hammer row'],
  ['Hammer Strength High Row', 'Wide/high row'],
  ['Wide-Grip Cable Row', 'Wide cable row'],
  ['Single-Arm High-to-Low Cable Row', 'Single-arm high-to-low cable row'],
  ['Single-Arm Machine Row', 'Single-arm machine row'],
  ['Meadows Row', 'Landmine Meadows row'],
  ['Single-Arm Landmine Row', 'Landmine single-arm row'],
  ['Seated Dumbbell Shoulder Press', 'Seated DB shoulder press', 'Seated DB press'],
  ['Landmine Press', 'Standing landmine press'],
  ['Dumbbell Lateral Raise', 'DB lateral raise', 'DB lateral'],
  ['Cable Lateral Raise', 'Single-arm cable lateral', 'Cable lateral'],
  ['Behind-Body Cable Lateral Raise', 'Cable lateral raise behind body'],
  ['Lean-Away Cable Lateral Raise', 'Lean-away cable lateral'],
  ['Machine Lateral Raise', 'Lateral-raise machine'],
  ['Rear-Delt Dumbbell Fly', 'Bent-over DB rear-delt fly'],
  ['Cable Rear-Delt Fly', 'Cable rear-delt crossover'],
  ['Rear-Delt Cable Row', 'Rear-Delt Row', 'Rear-delt row'],
  ['Wide-Grip EZ-Bar Curl', 'EZ-bar wide-grip curl', 'Wide-grip EZ curl'],
  ['Incline Dumbbell Curl', 'Incline DB curl'],
  ['Alternating Dumbbell Curl', 'Alternating supinating DB curl'],
  ['EZ-Bar Preacher Curl', 'Preacher EZ curl'],
  ['Cross-Body Dumbbell Preacher Curl', 'Cross-body preacher curl'],
  ['EZ-Bar Spider Curl', 'Spider Curl', 'Spider curl'],
  ['Reverse EZ-Bar Curl', 'Reverse Curl', 'Reverse EZ curl'],
  ['Reverse Cable Curl', 'Reverse cable curl'],
  ['Overhead Cable Triceps Extension', 'Overhead cable extension', 'Overhead cable triceps extension'],
  ['Rope Overhead Extension', 'Overhead rope extension'],
  ['Single-Arm Pressdown', 'Single-arm cable pressdown'],
  ['Single-Arm Reverse-Grip Pressdown', 'Single-arm reverse pressdown'],
  ['Incline Cable Skull Crusher', 'Incline cable skull crusher'],
  ['EZ-Bar Skull Crusher', 'EZ-bar lying extension'],
  ['Dip', 'Dips'],
  ['45° Leg Press', 'Leg press'],
  ['High-Foot Leg Press', 'Leg press - high feet'],
  ['Romanian Deadlift', 'Barbell RDL'],
  ['Dumbbell Romanian Deadlift', 'DB Romanian deadlift'],
  ['Walking Lunge', 'Walking DB lunge'],
  ['Barbell Hip Thrust', 'Hip thrust'],
  ['Hip Adductor Machine', 'Adductor machine', 'Adductor'],
  ['Hip Abductor Machine', 'Abductor machine', 'Hip abductor'],
  ['Standing Calf Raise', 'Standing calf'],
  ['Seated Calf Raise', 'Seated calf'],
  ['Leg Press Calf Raise', 'Calf press'],
  ['Pallof Press', 'Cable Pallof press'],
  ['Assisted / Weighted Pull-Up', 'Assisted / weighted pull-up'],
  ['Weighted / Assisted Dips', 'Weighted / assisted dips'],
  ['Pendulum Squat / Smith Squat', 'Pendulum squat / Smith squat'],
  ['Hip Thrust / Glute Drive', 'Hip thrust / glute drive'],
  ['Wrist Curl + Reverse Wrist Curl', 'Wrist curl + reverse wrist curl']
];

const idFor = name => normalizeExerciseName(name).replace(/ /g, '-');
const CABLE = ['Single Cable Column', 'Dual Cable / Functional Trainer', 'Cable Crossover'];
const DUAL = ['Dual Cable / Functional Trainer', 'Cable Crossover'];
const FLAT = ['Bench', 'Adjustable Bench'];
const INCLINE = ['Adjustable Bench'];
const RACK = ['Squat Rack / Power Rack', 'Half Rack', 'Bench-Press Rack'];
const SQUAT_RACK = ['Squat Rack / Power Rack', 'Half Rack'];
const PLATES = ['Olympic Plates'];
const BAR = [['Barbell'], PLATES];
const required = (...requirements) => requirements.map(r => Array.isArray(r) ? r.slice() : [r]);
const barbell = (...extra) => [...required('Barbell', 'Olympic Plates'), ...extra];
const dumbbells = (...extra) => [...required('Dumbbells'), ...extra];
const cable = (...extra) => [CABLE.slice(), ...extra];
const dualCable = (...extra) => [DUAL.slice(), ...extra];
// (A & B) OR (C & D) -> (A|C)&(A|D)&(B|C)&(B|D).
const anySetup = (...setups) => setups.reduce((a, b) =>
  a.flatMap(c1 => b.map(c2 => [...new Set([...c1, ...c2])])), [[]]);

const EQUIPMENT_BY_NAME = {
  'Barbell Bench Press': barbell(FLAT, RACK),
  'Incline Barbell Bench Press': barbell(INCLINE, RACK),
  'Decline Barbell Bench Press': barbell(['Decline Bench'], RACK),
  'Dumbbell Bench Press': dumbbells(FLAT),
  'Incline Dumbbell Press': dumbbells(INCLINE),
  'Decline Dumbbell Press': dumbbells(['Decline Bench']),
  'Dumbbell Squeeze Press': dumbbells(FLAT),
  'Dumbbell Fly': dumbbells(FLAT),
  'Incline Dumbbell Fly': dumbbells(INCLINE),
  'Cable Fly': dualCable(['D-Handles']),
  'Low-to-High Cable Fly': dualCable(['D-Handles']),
  'High-to-Low Cable Fly': dualCable(['D-Handles']),
  'Cable Crossover': dualCable(['D-Handles']),
  'Incline Cable Fly': dualCable(['D-Handles'], INCLINE),
  'Smith Machine Bench Press': required('Smith Machine', 'Olympic Plates', FLAT),
  'Smith Machine Incline Press': required('Smith Machine', 'Olympic Plates', INCLINE),
  'Smith Machine Decline Press': required('Smith Machine', 'Olympic Plates', 'Decline Bench'),
  'Hammer Strength Incline Press': required('Hammer Strength Incline Press', 'Olympic Plates'),
  'Hammer Strength Flat Press': required('Hammer Strength Flat / Horizontal Press', 'Olympic Plates'),
  'Hammer Strength Decline Press': required('Hammer Strength Decline Press', 'Olympic Plates'),
  'Converging Plate-Loaded Chest Press': required('Plate-Loaded Chest Press', 'Olympic Plates'),
  'Plate-Loaded Chest Press': required('Plate-Loaded Chest Press', 'Olympic Plates'),
  'Plate-Loaded Incline Press': required('Plate-Loaded Incline Press', 'Olympic Plates'),
  'Plate-Loaded Decline Press': required('Plate-Loaded Decline Press', 'Olympic Plates'),
  'Machine Chest Press': required('Selectorized Chest Press'),
  'Machine Incline Press': required('Selectorized Incline Press'),
  'Pec Deck Fly': required('Pec Deck / Chest Fly'),
  'Push-Up': [],
  'Weighted Dip - Chest': required('Dip Station', 'Dip Belt / Weighted Vest'),
  'Dip': required('Dip Station'),
  'Weighted Dip': required('Dip Station', 'Dip Belt / Weighted Vest'),
  'Assisted Dip': required('Assisted Pull-up / Dip'),
  'Dip Machine': required('Dip Machine'),
  'Pull-Up': required('Pull-up Bar'),
  'Chin-Up': required('Pull-up Bar'),
  'Weighted Pull-Up': required('Pull-up Bar', 'Dip Belt / Weighted Vest'),
  'Assisted Pull-Up': required('Assisted Pull-up / Dip'),
  'Wide-Grip Lat Pulldown': required(['Lat Pulldown', 'Dual Cable / Functional Trainer', 'Single Cable Column'], 'Wide Lat Bar'),
  'Neutral-Grip Lat Pulldown': required(['Lat Pulldown', 'Dual Cable / Functional Trainer', 'Single Cable Column'], 'Neutral Pulldown Handle'),
  'Close-Grip Lat Pulldown': required(['Lat Pulldown', 'Dual Cable / Functional Trainer', 'Single Cable Column'], 'Close-Grip Pulldown Handle'),
  'Close-Neutral Lat Pulldown': required(['Lat Pulldown', 'Dual Cable / Functional Trainer', 'Single Cable Column'], 'Close Neutral Row Handle'),
  'Underhand Lat Pulldown': required(['Lat Pulldown', 'Dual Cable / Functional Trainer', 'Single Cable Column'], 'Straight Lat Bar'),
  'Single-Arm Lat Pulldown': required(['Lat Pulldown', ...CABLE], 'D-Handles'),
  'Single-Arm Kneeling Lat Pulldown': required(['Lat Pulldown', ...CABLE], 'D-Handles'),
  'Straight-Arm Pulldown': cable(['Straight Bar Attachment']),
  'Cable Pullover': cable(['Straight Bar Attachment']),
  'Kneeling Cable Pullover': cable(['Rope Attachment']),
  'Single-Arm Cable Pullover': cable(['D-Handles']),
  'Seated Cable Row': required(['Seated Cable Row', ...CABLE], 'Close Neutral Row Handle'),
  'Wide-Grip Cable Row': required(['Seated Cable Row', ...CABLE], 'Wide Row Bar'),
  'Single-Arm Cable Row': cable(['D-Handles']),
  'Single-Arm High-to-Low Cable Row': cable(['D-Handles']),
  'High Cable Row': cable(['Wide Row Bar']),
  'Barbell Row': BAR,
  'Pendlay Row': BAR,
  'Dumbbell Row': dumbbells(FLAT),
  'Chest-Supported Dumbbell Row': dumbbells(['Adjustable Bench', 'Chest-Supported Row Bench']),
  'Chest-Supported Machine Row': required('Chest-Supported Row Machine', 'Olympic Plates'),
  'Wide Chest-Supported Machine Row': required('Chest-Supported Row Machine', 'Olympic Plates'),
  'T-Bar Row': anySetup(required('T-Bar Row', 'Olympic Plates'), barbell(['Landmine'], ['Close Neutral Row Handle'])),
  'Landmine Row': barbell(['Landmine'], ['Close Neutral Row Handle']),
  'Single-Arm Landmine Row': barbell(['Landmine']),
  'Meadows Row': barbell(['Landmine']),
  'Hammer Strength High Row': required('Hammer Strength High Row', 'Olympic Plates'),
  'Hammer Strength Low Row': required('Hammer Strength Low Row', 'Olympic Plates'),
  'Hammer Strength Iso-Lateral Row': required('Hammer Strength Iso-Lateral Row', 'Olympic Plates'),
  'Hammer Strength Pulldown': required('Hammer Strength Pulldown', 'Olympic Plates'),
  'Plate-Loaded Row': required('Plate-Loaded Row', 'Olympic Plates'),
  'Plate-Loaded Pulldown': required('Plate-Loaded Pulldown', 'Olympic Plates'),
  'Machine Row': required('Plate-Loaded Row', 'Olympic Plates'),
  'Single-Arm Machine Row': required('Plate-Loaded Row', 'Olympic Plates'),
  'Back Extension': required('45° Back Extension'),
  'Seated Dumbbell Shoulder Press': dumbbells(INCLINE),
  'Standing Dumbbell Shoulder Press': dumbbells(),
  'Barbell Overhead Press': barbell(SQUAT_RACK),
  'Smith Machine Shoulder Press': required('Smith Machine', 'Olympic Plates', INCLINE),
  'Machine Shoulder Press': required('Selectorized Shoulder Press'),
  'Hammer Strength Shoulder Press': required('Hammer Strength Shoulder Press', 'Olympic Plates'),
  'Landmine Press': barbell(['Landmine']),
  'Dumbbell Lateral Raise': dumbbells(),
  'Dumbbell Front Raise': dumbbells(),
  'Cable Lateral Raise': cable(['D-Handles']),
  'Behind-Body Cable Lateral Raise': cable(['D-Handles']),
  'Lean-Away Cable Lateral Raise': cable(['D-Handles']),
  'Cable Front Raise': cable(['D-Handles']),
  'Machine Lateral Raise': required('Lateral Raise Machine'),
  'Reverse Pec Deck': required('Reverse Pec Deck'),
  'Rear-Delt Dumbbell Fly': dumbbells(),
  'Cable Rear-Delt Fly': dualCable(['D-Handles']),
  'Rear-Delt Cable Row': required(['Seated Cable Row', ...CABLE], 'Wide Row Bar'),
  'Chest-Supported Rear-Delt Dumbbell Row': dumbbells(INCLINE),
  'Face Pull': cable(['Rope Attachment']),
  'Cable Y-Raise': dualCable(['D-Handles']),
  'Cable High Curls': dualCable(['D-Handles']),
  'Barbell Curl': BAR,
  'EZ-Bar Curl': required('EZ Bar', 'Olympic Plates'),
  'Wide-Grip EZ-Bar Curl': required('EZ Bar', 'Olympic Plates'),
  'Close-Grip EZ-Bar Curl': required('EZ Bar', 'Olympic Plates'),
  'Dumbbell Curl': dumbbells(),
  'Alternating Dumbbell Curl': dumbbells(),
  'Incline Dumbbell Curl': dumbbells(INCLINE),
  'Hammer Curl': dumbbells(),
  'Cross-Body Hammer Curl': dumbbells(),
  'Incline Hammer Curl': dumbbells(INCLINE),
  'Preacher Curl': required('Preacher Bench', 'EZ Bar', 'Olympic Plates'),
  'EZ-Bar Preacher Curl': required('Preacher Bench', 'EZ Bar', 'Olympic Plates'),
  'Dumbbell Preacher Curl': dumbbells(['Preacher Bench']),
  'Cross-Body Dumbbell Preacher Curl': dumbbells(['Preacher Bench']),
  'Machine Preacher Curl': required('Preacher Curl Machine'),
  'Machine Biceps Curl': required('Biceps Curl Machine'),
  'Cable Curl': cable(['Straight Bar Attachment']),
  'Bayesian Cable Curl': cable(['D-Handles']),
  'Rope Hammer Curl': cable(['Rope Attachment']),
  'EZ-Bar Spider Curl': required('EZ Bar', 'Olympic Plates', INCLINE),
  'Dumbbell Spider Curl': dumbbells(INCLINE),
  'Reverse EZ-Bar Curl': required('EZ Bar', 'Olympic Plates'),
  'Reverse Cable Curl': cable(['Straight Bar Attachment']),
  'Wrist Curl': dumbbells(FLAT),
  'Reverse Wrist Curl': dumbbells(FLAT),
  'Cable Pressdown': cable(['Straight Bar Attachment']),
  'Rope Pressdown': cable(['Rope Attachment']),
  'Straight-Bar Pressdown': cable(['Straight Bar Attachment']),
  'V-Bar Pressdown': cable(['V-Bar Attachment']),
  'Reverse-Grip Pressdown': cable(['Straight Bar Attachment']),
  'Single-Arm Pressdown': cable(['D-Handles']),
  'Single-Arm Reverse-Grip Pressdown': cable(['D-Handles']),
  'Overhead Cable Triceps Extension': cable(['Rope Attachment']),
  'Rope Overhead Extension': cable(['Rope Attachment']),
  'EZ-Bar Skull Crusher': required('EZ Bar', 'Olympic Plates', FLAT),
  'Dumbbell Skull Crusher': dumbbells(FLAT),
  'Incline Skull Crusher': required('EZ Bar', 'Olympic Plates', INCLINE),
  'Incline Cable Skull Crusher': cable(['EZ Cable Bar'], INCLINE),
  'Close-Grip Bench Press': barbell(FLAT, RACK),
  'Machine Triceps Extension': required('Triceps Extension Machine'),
  'Back Squat': barbell(SQUAT_RACK),
  'Front Squat': barbell(SQUAT_RACK),
  'Safety Bar Squat': required('Safety Squat Bar', 'Olympic Plates', SQUAT_RACK),
  'Smith Machine Squat': required('Smith Machine', 'Olympic Plates'),
  'Hack Squat': required('Hack Squat', 'Olympic Plates'),
  'Pendulum Squat': required('Pendulum Squat', 'Olympic Plates'),
  'V-Squat': required('V-Squat / Power Squat', 'Olympic Plates'),
  'Belt Squat': required('Belt Squat', 'Olympic Plates'),
  'Goblet Squat': dumbbells(),
  'Bulgarian Split Squat': dumbbells(FLAT),
  'Walking Lunge': dumbbells(),
  'Reverse Lunge': dumbbells(),
  'Step-Up': dumbbells(['Step / Plyo Box']),
  '45° Leg Press': required('Leg Press 45°', 'Olympic Plates'),
  'High-Foot Leg Press': required('Leg Press 45°', 'Olympic Plates'),
  'Horizontal Leg Press': required('Horizontal / Seated Leg Press'),
  'Vertical Leg Press': required('Vertical Leg Press', 'Olympic Plates'),
  'Single-Leg Press': required(['Leg Press 45°', 'Single-Leg Press'], 'Olympic Plates'),
  'Leg Extension': required('Leg Extension'),
  'Romanian Deadlift': BAR,
  'Dumbbell Romanian Deadlift': dumbbells(),
  'Stiff-Leg Deadlift': BAR,
  'Conventional Deadlift': BAR,
  'Trap-Bar Deadlift': required('Trap Bar / Hex Bar', 'Olympic Plates'),
  'Seated Leg Curl': required('Seated Leg Curl'),
  'Lying Leg Curl': required('Lying Leg Curl'),
  'Standing Leg Curl': required('Standing Leg Curl'),
  'Nordic Hamstring Curl': required('Nordic Bench'),
  'Glute-Ham Raise': required('GHD / Glute-Ham Developer'),
  'Barbell Hip Thrust': barbell(FLAT, ['Hip Thrust Pad']),
  'Machine Hip Thrust / Glute Drive': required('Glute Drive / Hip Thrust', 'Olympic Plates'),
  'Cable Glute Kickback': cable(['Ankle Strap']),
  'Glute Kickback Machine': required('Glute Kickback Machine'),
  'Hip Adductor Machine': required('Hip Adductor'),
  'Hip Abductor Machine': required('Hip Abductor'),
  'Standing Calf Raise': required('Standing Calf Raise'),
  'Seated Calf Raise': required('Seated Calf Raise', 'Olympic Plates'),
  'Standing Dumbbell Calf Raise': dumbbells(),
  'Seated Dumbbell Calf Raise': dumbbells(FLAT),
  'Leg Press Calf Raise': required('Leg Press 45°', 'Olympic Plates'),
  'Calf Press Machine': required('Calf Press'),
  'Tibialis Raise': required('Tibialis Raise'),
  'Sled Push': required('Sled / Prowler', 'Olympic Plates'),
  'Sled Drag': required('Sled / Prowler', 'Olympic Plates'),
  'Cable Crunch': cable(['Rope Attachment']),
  'Hanging Knee Raise': required('Pull-up Bar'),
  'Captain’s Chair Knee Raise': required('Captain’s Chair'),
  'Hanging Leg Raise': required('Pull-up Bar'),
  'Decline Crunch': required('Decline Bench'),
  'Pallof Press': cable(['D-Handles']),
  'Ab Wheel Rollout': required('Ab Wheel'),
  'Machine Ab Crunch': required('Ab Crunch Machine'),
  'Rotary Torso': required('Rotary Torso Machine'),
  'Plank': [], 'Side Plank': [],
  'Farmer Carry': dumbbells(),
  'Kettlebell Swing': required('Kettlebells'),
  'Battle Rope': required('Battle Ropes')
};

const COMPOSITES = {
  'Assisted / Weighted Pull-Up': ['Assisted Pull-Up', 'Weighted Pull-Up', 'Pull-Up'],
  'Weighted / Assisted Dips': ['Assisted Dip', 'Weighted Dip', 'Dip'],
  'Pendulum Squat / Smith Squat': ['Pendulum Squat', 'Smith Machine Squat'],
  'Hip Thrust / Glute Drive': ['Barbell Hip Thrust', 'Machine Hip Thrust / Glute Drive'],
  'Wrist Curl + Reverse Wrist Curl': ['Wrist Curl', 'Reverse Wrist Curl']
};
const ASSET_VARIANT_REVIEW = {
  'EZ-Bar Spider Curl': {
    mediaNeedsVariantReview: true,
    variantOptions: ['ez-bar-spider-curl', 'dumbbell-spider-curl'],
    auditNote: 'The r7 master specifies EZ bar; the proposed asset mapping specifies dumbbells. Preserve the old asset, but verify its equipment before linking it to a named variation.'
  },
  'Rear-Delt Cable Row': {
    mediaNeedsVariantReview: true,
    variantOptions: ['rear-delt-cable-row', 'chest-supported-rear-delt-dumbbell-row'],
    auditNote: 'The r7 master specifies cable row equipment; the proposed asset mapping specifies chest-supported dumbbells. Keep both variants and review the old asset before associating it.'
  }
};

// Additive shoulder accessories: existing catalog identities and image bindings
// stay intact. Each variation has its own history and concrete loading basis.
const SHRUGS = [
  {id:'dumbbell-shrug',name:'Dumbbell Shrug',aliases:['Dumbbell Shrug','Dumbbell Shrugs','Dumbbell Shoulder Shrug','DB Shrug','DB Shrugs'],
    equipmentRequirements:[['Dumbbells']],loadMode:'perHand',loadNote:'Log the weight of one dumbbell; do not add the two hands together.',
    setup:['Stand with feet about hip-width apart, knees soft and a dumbbell in each hand at your sides.','Let the palms face the thighs, keep the arms long and choose a load you can hold without leaning.']},
  {id:'barbell-shrug',name:'Barbell Shrug',aliases:['Barbell Shrug','Barbell Shrugs','Barbell Shoulder Shrug','BB Shrug'],
    equipmentRequirements:[['Barbell'],['Olympic Plates']],loadMode:'total',loadNote:'Log the total barbell load once, including both sides and the bar if it is part of your usual logged total.',
    setup:['With a controlled pickup, hold the barbell in front of the thighs using an overhand grip just outside the legs.','Stand with feet about hip-width apart, knees soft, arms long and the bar close to the body. Use matching plates on both sides.']}
].map(exercise=>({...exercise,newFamily:'shrugs',group:'Shoulders',subgroup:'upper-traps',primary:'Upper trapezius',secondary:'Levator scapulae; forearm and grip stabilizers',movement:'scapular_elevation',compound:false,muscleTags:['shoulders','upper_traps','upper_back'],
  equipment:exercise.equipmentRequirements,equipmentLabel:exercise.equipmentRequirements.map(clause=>clause.join(' or ')).join(' + '),
  sets:3,range:'10-15',repUnit:'reps',purpose:'strength',programmingTier:'standard',floorRequired:false,trainingGroups:['shoulders'],defaultExcluded:false,independentGuide:true,mediaNeedsVariantReview:true,
  cues:['Raise the shoulders straight up through a comfortable range while keeping the head and neck neutral.','Pause briefly at the top, then lower slowly. Keep the elbows long and the trunk still.'],
  mistakes:['Rolling the shoulders or jutting the head forward.','Bending the elbows, bouncing with the knees or using a load that shortens the controlled range.']}));

function anatomy(name, fallbackGroup) {
  const n = normalizeExerciseName(name);
  const m = (group, subgroup, primary, secondary, movement, compound, muscleTags) =>
    ({group, subgroup, primary, secondary, movement, compound, muscleTags});
  // Specific anatomy takes precedence over substring matches and source group errors.
  if (/reverse wrist/.test(n)) return m('Biceps','forearms','Wrist extensors','Brachioradialis; finger extensors','wrist_extension',false,['forearms']);
  if (/wrist curl/.test(n)) return m('Biceps','forearms','Wrist flexors','Finger flexors; forearm stabilizers','wrist_flexion',false,['forearms']);
  if (/leg curl|nordic|glute ham/.test(n)) return m('Legs','hamstrings','Hamstrings','Gastrocnemius; glutes','knee_flexion',false,['hamstrings']);
  if (/calf/.test(n)) return m('Legs','calves', /seated/.test(n) ? 'Soleus' : 'Gastrocnemius; soleus','Foot and ankle stabilizers','plantar_flexion',false,['calves']);
  if (/tibialis/.test(n)) return m('Legs','tibialis','Tibialis anterior','Toe extensors','dorsiflexion',false,['tibialis']);
  if (/hip adductor/.test(n)) return m('Legs','adductors','Hip adductors','Gracilis; pectineus','hip_adduction',false,['adductors']);
  if (/hip abductor/.test(n)) return m('Legs','abductors','Gluteus medius; gluteus minimus','Tensor fasciae latae; upper gluteus maximus','hip_abduction',false,['glutes','abductors']);
  if (/glute kickback/.test(n)) return m('Legs','glutes','Gluteus maximus','Hamstrings; trunk stabilizers','hip_extension',false,['glutes']);
  if (/hip thrust|glute drive/.test(n)) return m('Legs','glutes','Gluteus maximus','Hamstrings; adductor magnus; trunk stabilizers','hip_extension',true,['glutes','hamstrings']);
  if (/romanian|stiff leg|deadlift/.test(n)) return m('Legs','hamstrings','Hamstrings; gluteus maximus','Spinal erectors; adductors; grip','hinge',true,['hamstrings','glutes']);
  if (/leg extension/.test(n)) return m('Legs','quads','Quadriceps','Trunk stabilizers','knee_extension',false,['quads']);
  if (/squat|leg press|lunge|step up/.test(n)) return m('Legs','quads','Quadriceps; gluteus maximus','Adductors; hamstrings; trunk stabilizers','squat',true,['quads','glutes']);
  if (/sled/.test(n)) return m('Legs','quads','Quadriceps; glutes','Calves; trunk; shoulders','sled',true,['quads','glutes','calves']);
  if (/pallof/.test(n)) return m('Core','anti_rotation','Obliques; transverse abdominis','Rectus abdominis; shoulder stabilizers','anti_rotation',false,['core','obliques']);
  if (/side plank/.test(n)) return m('Core','anti_lateral_flexion','Obliques; quadratus lumborum','Gluteus medius; shoulder stabilizers','anti_lateral_flexion',false,['core','obliques']);
  if (/crunch/.test(n)) return m('Core','flexion','Rectus abdominis','Obliques','trunk_flexion',false,['core']);
  if (/hanging.*raise|chair knee raise/.test(n)) return m('Core','flexion','Rectus abdominis','Hip flexors; obliques; grip','trunk_flexion',false,['core']);
  if (/rotary torso/.test(n)) return m('Core','rotation','Obliques','Transverse abdominis','trunk_rotation',false,['core','obliques']);
  if (/plank|ab wheel/.test(n)) return m('Core','anti_extension','Rectus abdominis; transverse abdominis','Obliques; glutes; shoulder stabilizers','anti_extension',false,['core']);
  if (/rear delt|reverse pec|face pull/.test(n)) return m('Shoulders','rear','Posterior deltoids', /face pull/.test(n) ? 'Rotator cuff; middle trapezius; rhomboids' : 'Middle trapezius; rhomboids','rear_delt',false,['shoulders','rear_delts']);
  if (/lateral raise/.test(n)) return m('Shoulders','lateral','Lateral deltoids','Supraspinatus; trapezius','shoulder_abduction',false,['shoulders','lateral_delts']);
  if (/y raise/.test(n)) return m('Shoulders','scapular','Lower trapezius; deltoids','Serratus anterior; rotator cuff','scaption',false,['shoulders','lower_traps']);
  if (/front raise/.test(n)) return m('Shoulders','anterior','Anterior deltoids','Upper pectorals; serratus anterior','shoulder_flexion',false,['shoulders','anterior_delts']);
  if (/shoulder press|overhead press|landmine press/.test(n)) return m('Shoulders','anterior','Anterior deltoids; lateral deltoids','Triceps; serratus anterior; upper chest','vertical_push',true,['shoulders','anterior_delts']);
  if (/close grip bench|pressdown|triceps|skull crusher|overhead extension|^dip$|assisted dip|dip machine|weighted dip$/.test(n)) return m('Triceps','triceps','Triceps brachii', /dip|bench/.test(n) ? 'Pectorals; anterior deltoids' : 'Forearm stabilizers', /dip|bench/.test(n) ? 'compound_elbow_extension' : 'elbow_extension', /dip|bench/.test(n), ['triceps']);
  if (/reverse.*curl/.test(n)) return m('Biceps','brachioradialis','Brachioradialis; brachialis','Biceps brachii; wrist extensors','elbow_flexion',false,['biceps','forearms']);
  if (/curl/.test(n)) return m('Biceps', /hammer/.test(n) ? 'brachialis' : 'biceps', /hammer/.test(n) ? 'Brachialis; brachioradialis; biceps brachii' : 'Biceps brachii','Brachialis; brachioradialis; forearm stabilizers','elbow_flexion',false,['biceps']);
  if (/straight arm pulldown|pullover/.test(n)) return m('Back','lats','Latissimus dorsi; teres major','Pectorals; long head of triceps; trunk stabilizers','shoulder_extension',false,['back','lats']);
  if (/pulldown|pull up|chin up/.test(n)) return m('Back','lats','Latissimus dorsi; teres major','Biceps; brachialis; lower trapezius','vertical_pull',true,['back','lats']);
  if (/row|meadows/.test(n)) return m('Back','upper_back','Latissimus dorsi; rhomboids; middle trapezius','Posterior deltoids; biceps; grip','horizontal_pull',true,['back','lats','upper_back']);
  if (/back extension/.test(n)) return m('Back','erectors','Spinal erectors; gluteus maximus','Hamstrings','hip_extension',true,['back','glutes','hamstrings']);
  if (/fly|crossover|pec deck/.test(n)) return m('Chest','chest', /incline|low to high/.test(n) ? 'Clavicular pectoralis major (upper chest)' : 'Pectoralis major','Anterior deltoids; biceps stabilizers','horizontal_adduction',false,['chest']);
  if (/press|bench|push up|weighted dip/.test(n)) return m('Chest','chest', /incline/.test(n) ? 'Clavicular pectoralis major (upper chest)' : 'Pectoralis major','Triceps; anterior deltoids','horizontal_push',true,['chest']);
  if (/farmer carry/.test(n)) return m('Full Body','carry','Grip; trunk stabilizers; trapezius','Glutes; quadriceps','carry',true,['full_body','core','forearms']);
  if (/kettlebell swing/.test(n)) return m('Full Body','hinge','Glutes; hamstrings','Trunk stabilizers; grip','hinge',true,['full_body','glutes','hamstrings']);
  if (/battle rope/.test(n)) return m('Full Body','conditioning','Shoulders; trunk','Arms; legs','conditioning',true,['full_body']);
  return m(fallbackGroup || 'Full Body','other',fallbackGroup || 'Full body','Trunk stabilizers','other',false,[String(fallbackGroup || 'full_body').toLowerCase()]);
}

function loadMode(name) {
  const n = normalizeExerciseName(name);
  if (/assisted/.test(n) && !/weighted.*assisted|assisted.*weighted/.test(n)) return 'assistance';
  if (/weighted/.test(n)) return 'total';
  if (/pull up|chin up|^dip$|push up|hanging|chair knee raise|plank|nordic|glute ham|ab wheel|back extension/.test(n)) return 'bodyweight';
  if (/goblet/.test(n)) return 'total';
  if (/dumbbell|hammer curl|walking lunge|reverse lunge|bulgarian|step up|farmer carry|wrist curl/.test(n) && !/rope|cable|ez bar/.test(n)) return 'perHand';
  return 'total';
}

function guide(name, info) {
  const n = normalizeExerciseName(name);
  const g = (setup, cues, mistakes) => ({setup, cues, mistakes});
  if (n === 'standing dumbbell calf raise') return g(
    ['Stand on a level floor with feet about hip-width apart and a light dumbbell in each hand.','Keep knees softly extended and choose a load that lets you balance without swaying.'],
    ['Rise through the balls of both feet, pause briefly, and lower the heels under control.','Keep the ankle movement comfortable and the torso steady.'],
    ['Bouncing or leaning to move the load.','Using dumbbells that compromise balance.']);
  if (n === 'seated dumbbell calf raise') return g(
    ['Sit on a stable flat bench with feet flat on the floor and knees near 90 degrees.','Hold a dumbbell securely on each lower thigh, just above the knee; record the load per hand.'],
    ['Keep the balls of the feet down as you raise the heels.','Pause briefly, then lower under control without shifting the dumbbells.'],
    ['Putting the load directly on the kneecaps.','Bouncing or allowing the dumbbells to roll.']);
  if (/reverse wrist/.test(n)) return g(
    ['Sit with the back of the forearm fully supported on a bench, palm down and hand just beyond the edge.','Use a light dumbbell; keep the forearm in contact with the bench.'],
    ['Extend the wrist to lift the knuckles toward the back of the forearm.','Lower slowly through a comfortable wrist range while the elbow stays still.'],
    ['Lifting the forearm from the bench.','Using elbow movement or an oversized load.']);
  if (/wrist curl/.test(n)) return g(
    ['Sit with the forearm fully supported, palm up and hand just beyond the bench edge.','Keep the whole forearm in contact with the pad.'],
    ['Curl the palm toward the forearm using the wrist.','Lower slowly without lifting the elbow or forearm.'],
    ['Leaving a gap between the forearm and bench.','Using arm momentum or painful end ranges.']);
  if (/cable high curls/.test(n)) return g(
    ['Set opposing pulleys at approximately shoulder height with two D-handles.','Stand centered, upper arms out to the sides, trunk braced.'],
    ['Curl the hands toward the temples without moving the upper arms.','Keep wrists neutral and return slowly.'],
    ['Dropping the elbows.','Arching the back or rolling the shoulders forward.']);
  if (/leg curl/.test(n)) return g(
    ['Align the knee joint with the machine pivot.','Set the lower-leg pad just above the heel and secure the thigh or hip pad.'],
    ['Bend the knees while keeping the hips against the pad.','Return slowly without letting the stack slam.'],
    ['Lifting the hips from the pad.','Forcing the ankle pad behind the knee or using momentum.']);
  if (/calf/.test(n)) return g(
    ['Set the balls of the feet securely on the platform with room for controlled heel movement.','Keep knees softly extended for standing/leg-press work; use bent knees on seated calf raises.'],
    ['Raise the heels without rolling the ankles inward or outward.','Lower to a controlled comfortable stretch and pause briefly.'],
    ['Bouncing through the ankle.','Using knee or hip movement to propel the load.']);
  if (/high foot leg press/.test(n)) return g(
    ['Set the backrest so the pelvis can stay supported through the intended range.','Place both feet higher on the sled, keeping the heels fully supported.'],
    ['Lower only while the pelvis and lower back stay in contact with the pad.','Press through the whole foot and let knees track with the toes.'],
    ['Rounding the pelvis off the pad to force depth.','Locking the knees forcefully or lifting the heels.']);
  if (/pallof/.test(n)) return g(
    ['Set one pulley at chest height; stand side-on to the cable.','Hold a D-handle at the chest with both hands and brace.'],
    ['Press straight forward while keeping hips and shoulders square.','Return slowly without turning toward the stack.'],
    ['Rotating the trunk.','Using a load that pulls the pelvis sideways.']);
  if (/cable.*rear delt|rear delt.*cable/.test(n)) return g(
    ['For flies, set opposing pulleys around shoulder height and take opposite handles.','Brace the torso and keep a soft elbow bend.'],
    ['Open the upper arms using the rear delts.','Keep shoulders away from the ears and return under control.'],
    ['Shrugging.','Turning the movement into a heavy swinging row.']);
  if (/lateral raise/.test(n)) return g(
    ['Choose a load you can lift without torso movement.','For cable work, set a low pulley and single handle.'],
    ['Raise the upper arm out to the side in a comfortable slightly forward plane.','Keep the neck relaxed and lower slowly.'],
    ['Swinging or side-bending.','Shrugging to finish the rep.']);
  if (info.movement === 'hinge') return g(
    ['Stand with stable foot pressure, knees softly bent and trunk braced.','Keep the load close to the legs.'],
    ['Push the hips back; stop when hamstring tension or trunk control limits the range.','Stand by extending the hips without leaning back.'],
    ['Rounding the back to reach lower.','Letting the load drift forward or turning the hinge into a squat.']);
  if (/preacher|spider/.test(n)) return g(
    ['Adjust the support so the upper arm or chest stays stable for the named variation.','Choose the specified bar or dumbbells and use a comfortable grip.'],
    ['Curl through the elbow while keeping the shoulder still.','Lower under control without forcefully locking the elbow.'],
    ['Lifting the upper arm off its support.','Swinging, bending the wrist, or bouncing at the bottom.']);
  if (/skull crusher|triceps|pressdown|overhead extension/.test(n)) return g(
    ['Set the named bench or cable attachment before loading.','Brace the trunk and place the upper arms in a comfortable stable position.'],
    ['Extend through the elbows with neutral wrists.','Return slowly through a comfortable pain-free range.'],
    ['Using torso momentum.','Moving the upper arms excessively or forcing a painful elbow range.']);
  if (info.movement === 'horizontal_push' || info.movement === 'vertical_push') return g(
    ['Set the bench, seat or rack for the named angle and align handles with the working path.','Plant both feet and brace; keep wrists stacked above forearms.'],
    ['Press smoothly with both sides moving evenly.','Lower under control while keeping a stable shoulder and trunk position.'],
    ['Using a load that changes the intended path.','Bouncing, excessive elbow flare or lifting the hips from the bench.']);
  if (info.movement === 'horizontal_pull' || info.movement === 'vertical_pull') return g(
    ['Select the named grip and secure the seat, thigh pad or chest support as appropriate.','Begin from a controlled stretch with the trunk braced.'],
    ['Lead with the elbows and keep the trunk stable.','Return under control; avoid pulling behind the neck on pulldowns.'],
    ['Jerking with the lower back.','Shrugging or shortening the controlled range.']);
  if (info.movement === 'squat') return g(
    ['Set the rack, machine pads or dumbbells for the named exercise.','Plant the entire foot and brace the trunk.'],
    ['Let the knees track with the toes through a comfortable controlled depth.','Drive up while maintaining balanced foot pressure.'],
    ['Bouncing or lifting the heels unintentionally.','Using a range or load that loses knee, hip or trunk control.']);
  return g(
    ['Set up the equipment listed for this exact variation.','Choose a load and range you can control with a stable trunk.'],
    ['Move through the intended joints without momentum.','Control the return and stop if pain changes your technique.'],
    ['Rushing or bouncing through repetitions.','Using more load than you can control.']);
}

/**
 * @param {Array<object|Array>} legacyMasters Objects {name,equipment,group,sets,range} or old triples.
 * @param {Array<Array|object>} legacyPlan Old [title,gym,'Name|3|8-12;...'] or object exercise lists.
 * @returns {Array<object>} Canonical searchable/serializable records.
 */
export function buildCatalog(legacyMasters = [], legacyPlan = []) {
  const aliases = new Map();
  for (const group of ALIAS_GROUPS) for (const name of group) aliases.set(normalizeExerciseName(name), group[0]);
  const registry = new Map();
  const add = (raw, from = 'master') => {
    const item = Array.isArray(raw) ? {name: raw[0], equipment: raw[1], group: raw[2]} : raw;
    if (!item?.name || typeof item.name !== 'string') return;
    const sourceName = item.name.trim();
    const canonicalName = aliases.get(normalizeExerciseName(sourceName)) || sourceName;
    const key = normalizeExerciseName(canonicalName);
    const old = registry.get(key);
    if (old) {
      old.aliasSet.add(sourceName);
      if (from === 'master' && !old.master) { Object.assign(old, {source: {...item, name: canonicalName}, master: true}); }
      return;
    }
    registry.set(key, {source: {...item, name: canonicalName}, aliasSet: new Set([canonicalName, sourceName]), master: from === 'master'});
  };
  legacyMasters.forEach(x => add(x, 'master'));
  for (const row of legacyPlan) {
    const value = Array.isArray(row) ? row[2] : row?.exercises ?? row?.ex ?? row?.items ?? '';
    const exercises = typeof value === 'string' ? value.split(';').filter(Boolean).map(part => {
      const [name, sets, range] = part.split('|'); return {name, sets: Number(sets) || 3, range: range || '8-12'};
    }) : Array.isArray(value) ? value : [];
    exercises.forEach(x => add(x, 'plan'));
  }
  // Required variants exist even when absent in a particular legacy export.
  for (const name of ['Cable High Curls','Wrist Curl','Reverse Wrist Curl','Dumbbell Spider Curl','Chest-Supported Rear-Delt Dumbbell Row','Captain’s Chair Knee Raise','Standing Dumbbell Calf Raise','Seated Dumbbell Calf Raise', ...Object.values(COMPOSITES).flat()]) add({name}, 'audit');
  // Include every known spelling for canonical entries present in the input.
  for (const group of ALIAS_GROUPS) {
    const target = registry.get(normalizeExerciseName(group[0]));
    if (target) group.forEach(name => target.aliasSet.add(name));
  }
  const original = [...registry.values()].map(({source, aliasSet}) => {
    const name = source.name;
    const info = anatomy(name, source.group);
    const composite = COMPOSITES[name];
    let requirements = EQUIPMENT_BY_NAME[name];
    if (!requirements) requirements = source.equipment && source.equipment !== 'Bodyweight'
      ? required(source.equipment) : [];
    if (composite) requirements = [];
    const excludedPull = /pull up|chin up/.test(normalizeExerciseName(name));
    const equipment = requirements.map(clause => [...new Set(clause)]);
    const mode = loadMode(name);
    const duration = /plank|battle rope/.test(normalizeExerciseName(name));
    const distance = /farmer carry|sled/.test(normalizeExerciseName(name));
    const range = duration ? '30-60' : distance ? '20-40' : /wrist|calf|lateral raise|rear delt|hip abductor|hip adductor/.test(normalizeExerciseName(name)) ? '12-20'
      : source.range || (info.compound ? '8-12' : '10-15');
    const flag = composite ? {
      needsVariantSelection: true, legacyComposite: true,
      variantOptions: composite.map(idFor), defaultExcluded: true,
      auditNote: 'Legacy label contains different movements or loading modes. Choose a named variation before generating new work.'
    } : excludedPull ? {defaultExcluded: true, auditNote: 'Retained in the library; excluded from default plans at the user’s request.'} : {defaultExcluded: false};
    return {
      id: idFor(name), name,
      aliases: [...aliasSet].sort((a,b) => a < b ? -1 : a > b ? 1 : 0),
      ...info, equipment, equipmentRequirements: equipment,
      equipmentLabel: composite ? 'Choose variation' : equipment.length ? equipment.map(clause => clause.join(' or ')).join(' + ') : 'Bodyweight',
      loadMode: mode,
      // Per-hand means the entered weight is for one dumbbell; machine stacks/barbells are total external load.
      loadNote: mode === 'perHand' ? 'Log the weight of one dumbbell.' : mode === 'assistance' ? 'Log assistance; less assistance is harder.' : mode === 'bodyweight' ? 'Bodyweight movement; record added load separately when supported.' : 'Log total external resistance; exclude bodyweight.',
      sets: Math.min(6, Math.max(1, Number(source.sets) || 3)), range,
      repUnit: duration ? 'seconds' : distance ? 'metres' : 'reps',
      ...guide(name, info), ...flag, ...(ASSET_VARIANT_REVIEW[name] || {}),
      trainingGroups: info.group === 'Legs'
        ? info.subgroup === 'quads' ? ['legs1'] : ['hamstrings','glutes'].includes(info.subgroup) ? ['legs2'] : ['legs_accessory']
        : [info.group.toLowerCase().replace(/ /g,'_')]
    };
  });
  return [...appendAccessibleExercises(original),...structuredClone(SHRUGS)].sort((a,b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
}
