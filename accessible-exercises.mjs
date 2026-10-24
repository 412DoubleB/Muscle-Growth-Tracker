// Additive, original MENEI instructions. Existing exercise IDs, guides and media
// are not changed or reused for these variations. Sources inform broad movement
// principles; no source photographs, tables or complete routines are reproduced.
export const ACCESSIBLE_SOURCES=[
 {id:'nhs-strength',title:'NHS · strength exercises',url:'https://www.nhs.uk/live-well/exercise/strength-exercises/'},
 {id:'nhs-sitting',title:'NHS · sitting exercises',url:'https://www.nhs.uk/live-well/exercise/sitting-exercises/'},
 {id:'nhs-warmup',title:'NHS · warming up before exercise',url:'https://www.nhs.uk/live-well/exercise/how-to-warm-up-before-exercising/'},
 {id:'ace-bird-dog',title:'ACE · bird-dog exercise reference',url:'https://www.acefitness.org/resources/everyone/exercise-library/14/bird-dog/'},
 {id:'nasm-dead-bug',title:'NASM · dead-bug exercise reference',url:'https://www.nasm.org/resource-center/exercise-library/dead-bug'},
 {id:'ace-bands',title:'ACE · resistance-band workout programming',url:'https://www.acefitness.org/continuing-education/certified/july-2025/8897/the-ace-workout-builder-for-resistance-band-workouts/'},
 {id:'cdc-older-strength',title:'CDC · strength, balance and activity for older adults',url:'https://www.cdc.gov/physical-activity-basics/adding-older-adults/what-counts.html'},
 {id:'band-resistance',title:'THERABAND · resistance depends on band stretch',url:'https://support.performancehealth.com/support/solutions/articles/69000743834-theraband-professional-resistance-tubing'}
];

const CHAIR=[['Stable Chair','Bench','Flat Bench']];
const SUPPORT=[['Stable Chair','Stable Support','Wall']];
const BAND=[['Resistance Bands']];
const ANCHORED=[['Resistance Bands'],['Secure Band Anchor']];
const anatomy=(group,subgroup,primary,secondary,movement,compound,muscleTags)=>({group,subgroup,primary,secondary,movement,compound,muscleTags});
const CORE=anatomy('Core','anti_extension','Rectus abdominis; transverse abdominis','Obliques; trunk stabilizers','anti_extension',false,['core']);
const ANTIROTATION=anatomy('Core','anti_rotation','Obliques; transverse abdominis','Rectus abdominis; shoulder stabilizers','anti_rotation',false,['core','obliques']);
const SIDECORE=anatomy('Core','anti_lateral_flexion','Obliques; quadratus lumborum','Gluteus medius; shoulder stabilizers','anti_lateral_flexion',false,['core','obliques']);
const QUADS=anatomy('Legs','quads','Quadriceps; gluteus maximus','Adductors; trunk stabilizers','squat',true,['quads','glutes']);
const HINGE=anatomy('Legs','hamstrings','Hamstrings; gluteus maximus','Spinal erectors; trunk stabilizers','hinge',true,['hamstrings','glutes']);
const GLUTES=anatomy('Legs','glutes','Gluteus maximus','Hamstrings; trunk stabilizers','hip_extension',false,['glutes','hamstrings']);
const ABDUCTORS=anatomy('Legs','abductors','Gluteus medius; gluteus minimus','Hip and trunk stabilizers','hip_abduction',false,['glutes','abductors']);
const CALVES=anatomy('Legs','calves','Gastrocnemius; soleus','Foot and ankle stabilizers','plantar_flexion',false,['calves']);
const CHEST=anatomy('Chest','chest','Pectoralis major','Triceps; anterior deltoids; trunk stabilizers','horizontal_push',true,['chest']);
const BACK=anatomy('Back','upper_back','Rhomboids; middle trapezius; latissimus dorsi','Posterior deltoids; biceps','horizontal_pull',true,['back','upper_back','lats']);
const SHOULDERS=anatomy('Shoulders','anterior','Anterior deltoids; lateral deltoids','Triceps; serratus anterior','vertical_push',true,['shoulders','anterior_delts']);
const LATERAL=anatomy('Shoulders','lateral','Lateral deltoids','Supraspinatus; shoulder stabilizers','shoulder_abduction',false,['shoulders','lateral_delts']);
const REAR=anatomy('Shoulders','rear','Posterior deltoids; middle trapezius','Rhomboids; rotator cuff','rear_delt',false,['shoulders','rear_delts','upper_back']);
const BICEPS=anatomy('Biceps','biceps','Biceps brachii','Brachialis; forearm stabilizers','elbow_flexion',false,['biceps']);
const TRICEPS=anatomy('Triceps','triceps','Triceps brachii','Shoulder and forearm stabilizers','elbow_extension',false,['triceps']);
const nameKey=value=>String(value??'').normalize('NFKC').replace(/[’‘]/g,"'").toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim().replace(/\s+/g,' ');
const idFor=name=>nameKey(name).replace(/ /g,'-');
const clone=value=>structuredClone(value);
function entry(name,info,setup,cues,mistakes,options={}){
 const equipment=clone(options.equipment||[]),band=options.band===true;
 const modalities=[...(band?['bands']:['bodyweight','calisthenics']),...(info.group==='Core'?['core']:[])];
 return {id:idFor(name),name,aliases:[name],...clone(info),equipment,equipmentRequirements:clone(equipment),
  equipmentLabel:equipment.length?equipment.map(clause=>clause.join(' or ')).join(' + '):'Bodyweight',
  loadMode:band?'band':'bodyweight',sets:2,range:options.seconds?'10-20':options.range||'6-10',repUnit:options.seconds?'seconds':'reps',
  setup:setup.slice(),cues:cues.slice(),mistakes:mistakes.slice(),
  loadNote:band?'Band resistance varies with the band and stretch; colour alone is not a measured lb/kg load. Record brand, level and setup separately. Inspect the band and use only manufacturer-approved attachments; progress repetitions and control before changing resistance.':'Use your chosen body position and comfortable range consistently. Record zero added load when no external weight is used; progress control or repetitions before a harder variation.',
  newFamily:'accessible',programmingTier:options.tier||'supported',floorRequired:options.floor===true,purpose:options.purpose||'strength',modalities,
  manualProgression:true,independentGuide:true,mediaNeedsVariantReview:true,defaultExcluded:false,
  sourceIds:(options.sources||[band?'ace-bands':'nhs-strength']).slice(),
  trainingGroups:info.group==='Legs'?info.subgroup==='quads'?['legs1']:['hamstrings','glutes'].includes(info.subgroup)?['legs2']:['legs_accessory']:[info.group.toLowerCase().replace(/ /g,'_')]
 };
}

export const ACCESSIBLE_EXERCISES=[
 entry('Wall Plank',CORE,
  ['Face a clear, solid wall and place the forearms against it below shoulder height.','Step back a small distance so your body forms a comfortable straight line.'],
  ['Gently tighten the abdomen while breathing normally.','Keep the hips steady; move closer to the wall to make the hold easier.'],
  ['Holding the breath or pressing through shoulder pain.','Letting the lower back sag.'],{equipment:[['Wall']],seconds:true}),
 entry('Seated Abdominal Brace',CORE,
  ['Sit tall on a stable, non-wheeled chair or flat bench with feet supported.','Keep the ribs comfortably over the pelvis and relax the shoulders.'],
  ['Exhale gently and lightly firm the abdomen without curling forward.','Keep taking easy breaths throughout the hold.'],
  ['Bearing down or holding the breath.','Leaning back to replace trunk control.'],{equipment:CHAIR,seconds:true,sources:['nhs-sitting']}),
 entry('Supine Abdominal Brace',CORE,
  ['Lie on a comfortable floor surface with knees bent and feet resting flat.','Let the head and shoulders rest; a mat may improve comfort.'],
  ['Gently firm the abdomen as you breathe out.','Maintain easy breathing and a comfortable lower-back position.'],
  ['Forcefully flattening or arching the back.','Bracing so hard that breathing stops.'],{floor:true,seconds:true,sources:['nasm-dead-bug']}),
 entry('Supine Heel Slide',CORE,
  ['Lie with knees bent and both feet on a comfortable floor surface.','Settle the trunk before moving one leg.'],
  ['Slide one heel away a short distance without letting the pelvis tip.','Bring it back slowly and alternate; the repetitions are per side.'],
  ['Reaching farther than you can control.','Holding the breath or dragging through pain.'],{floor:true,sources:['nasm-dead-bug']}),
 entry('Dead Bug Heel Tap',CORE,
  ['Lie on the floor with hips and knees bent; bring the legs up only if comfortable.','Keep the arms resting beside you and the trunk steady.'],
  ['Lower one heel toward the floor through a short controlled range, then return.','Alternate sides without arching the lower back; count repetitions per side.'],
  ['Dropping the foot quickly.','Extending the leg too far and losing trunk control.'],{floor:true,tier:'standard',sources:['nasm-dead-bug']}),
 entry('Dead Bug',CORE,
  ['Lie on the floor with bent legs raised and arms reaching upward.','Choose a position where you can breathe easily without arching the back.'],
  ['Reach one arm and the opposite leg away only as far as the trunk stays steady.','Return slowly and alternate; the repetitions are per side.'],
  ['Forcing straight limbs or a large range too soon.','Letting the ribs lift and the lower back arch.'],{floor:true,tier:'standard',sources:['nasm-dead-bug']}),
 entry('Quadruped Arm Reach',ANTIROTATION,
  ['Use a comfortable floor surface with hands under shoulders and knees under hips.','Keep the neck long and the trunk steady.'],
  ['Reach one hand forward a short distance while keeping both knees down.','Return the hand softly and alternate sides without shifting the hips.'],
  ['Rotating the torso or lifting the opposite leg before ready.','Locking the elbows or forcing painful wrist positions.'],{floor:true,sources:['ace-bird-dog']}),
 entry('Bird Dog',ANTIROTATION,
  ['Set up on hands and knees on a comfortable floor surface.','Brace lightly and find a steady three-point position before reaching.'],
  ['Lengthen one arm and the opposite leg without lifting them above your controlled range.','Return slowly, then change sides; count repetitions per side.'],
  ['Swinging the leg high and arching the back.','Twisting the hips or rushing the change of sides.'],{floor:true,tier:'standard',sources:['ace-bird-dog']}),
 entry('Bent-Knee Side Plank',SIDECORE,
  ['Lie on your side with knees bent and forearm on the floor, elbow under shoulder.','Keep the shoulder comfortable and align the trunk with the thighs.'],
  ['Lift the hips a small distance while keeping the knees supported.','Breathe steadily; lower with control and work both sides.'],
  ['Shrugging into the supporting shoulder.','Continuing after losing a comfortable, steady position.'],{floor:true,tier:'standard',seconds:true}),
 entry('Glute Bridge',GLUTES,
  ['Lie on the floor with knees bent, feet planted and arms resting by your sides.','Choose a foot position that feels steady without forcing the knees outward.'],
  ['Press through the feet and lift the hips until the trunk and thighs form a comfortable line.','Lower gently without pushing into a large lower-back arch.'],
  ['Driving the movement through the lower back.','Bouncing or lifting higher than you can control.'],{floor:true}),
 entry('Wall Push-Up',CHEST,
  ['Place both palms on a solid wall near chest height, slightly wider than the shoulders.','Stand a comfortable distance away with feet secure on the floor.'],
  ['Bend the elbows to bring the chest toward the wall, then press away smoothly.','Keep the trunk steady; move the feet closer to make the movement easier.'],
  ['Letting the hips lead the movement.','Flaring the elbows or forcing a painful shoulder range.'],{equipment:[['Wall']]}),
 entry('Incline Push-Up',CHEST,
  ['Use a fixed, stable bench or support that will not slide or tip.','Place the hands on the support and choose a body angle you can control.'],
  ['Lower the chest toward the support with the body moving together.','Press back without shrugging; a higher support makes the movement easier.'],
  ['Using a rolling chair or unstable furniture.','Sagging through the hips or bouncing off the support.'],{equipment:[['Stable Support','Bench','Flat Bench']],tier:'standard'}),
 entry('Chair Sit-to-Stand',QUADS,
  ['Choose a stable chair or bench at a height that lets both feet rest firmly.','Sit toward the front with space to stand and the seat secured against movement.'],
  ['Lean forward from the hips and stand at a controlled pace.','Sit back slowly; use your hands for assistance when needed.'],
  ['Dropping heavily onto the seat.','Choosing a seat that rolls, slides or is too low for your controlled range.'],{equipment:CHAIR}),
 entry('Supported Mini Squat',QUADS,
  ['Stand beside a fixed support or behind a stable chair with feet comfortably apart.','Use light hand contact for balance without pulling the support toward you.'],
  ['Bend the knees a little while keeping the whole foot down.','Stand smoothly and stop the descent before balance or comfort changes.'],
  ['Pulling on an unsecured chair.','Bending deeper than you can control or lifting the heels.'],{equipment:SUPPORT}),
 entry('Bodyweight Squat',QUADS,
  ['Stand with comfortable foot spacing and clear floor around you.','Keep your arms in a position that helps balance.'],
  ['Move the hips back and bend the knees through a comfortable depth.','Stand without snapping the knees straight or bouncing.'],
  ['Forcing a deep squat when control is lost.','Letting the feet roll or the knees collapse inward.'],{tier:'standard'}),
 entry('Bodyweight Hip Hinge',HINGE,
  ['Stand steadily with knees softly bent and hands resting on the hips.','Begin without external weight and choose a small range.'],
  ['Move the hips backward as the torso tips forward with a long, comfortable spine.','Stand by bringing the hips forward without leaning backward.'],
  ['Rounding the back to reach lower.','Turning the movement into a rapid forward bend.']),
 entry('Supported Standing Hip Extension',GLUTES,
  ['Stand beside a stable support and keep the supporting knee softly bent.','Hold the trunk upright before moving the other leg.'],
  ['Move one leg a short distance behind you without leaning forward.','Return gently and repeat both sides with the pelvis steady.'],
  ['Arching the lower back to move the leg farther.','Swinging the leg or gripping an unstable support.'],{equipment:SUPPORT}),
 entry('Supported Standing Hip Abduction',ABDUCTORS,
  ['Stand beside a fixed support with feet facing forward.','Keep a light hand contact and your trunk upright.'],
  ['Move the free leg a short distance to the side without leaning the torso.','Return slowly and work both sides in the same comfortable range.'],
  ['Turning the toes outward to force more range.','Tilting the pelvis or swinging the leg.'],{equipment:SUPPORT}),
 entry('Supported Heel Raise',CALVES,
  ['Stand on a level floor with a stable chair, wall or support close enough to touch.','Keep both feet planted and knees softly extended.'],
  ['Raise both heels slowly, keeping pressure across the balls of the feet.','Lower gently without bouncing; use the support for balance.'],
  ['Rolling the ankles outward.','Using a step edge or extra load before level-floor control is comfortable.'],{equipment:SUPPORT}),
 entry('Seated Heel Raise',anatomy('Legs','calves','Soleus','Gastrocnemius; foot and ankle stabilizers','plantar_flexion',false,['calves']),
  ['Sit on a stable chair or bench with both feet flat and the knees comfortably bent.','Keep the balls of the feet on a level floor without adding weights to the thighs.'],
  ['Raise the heels slowly as high as comfortable while keeping the toes relaxed.','Lower gently; keep the movement at the ankles rather than bouncing the knees.'],
  ['Rolling onto the outside edges of the feet.','Rushing the lowering phase or forcing painful ankle range.'],{equipment:CHAIR,sources:['nhs-sitting','cdc-older-strength']}),
 entry('Supported Standing Hamstring Curl',anatomy('Legs','hamstrings','Hamstrings','Gluteus maximus; calf and trunk stabilizers','knee_flexion',false,['hamstrings']),
  ['Stand beside a secure support with the knees comfortably apart and lightly hold for balance.','Keep the trunk upright and choose a small range with no ankle weight.'],
  ['Bend one knee to bring the heel back without moving the thigh forward.','Lower the foot slowly and work both sides while the hips stay level.'],
  ['Arching the lower back or swinging the thigh.','Pulling on an unsecured support or forcing the heel toward the buttock.'],{equipment:SUPPORT,sources:['cdc-older-strength']}),
 entry('Seated Knee Extension',anatomy('Legs','quads','Quadriceps','Hip and trunk stabilizers','knee_extension',false,['quads']),
  ['Sit on a stable chair or bench with the thighs supported and feet resting comfortably.','Keep the trunk upright and the working knee free to move.'],
  ['Straighten one knee through a comfortable range, then lower the foot slowly.','Work both sides without adding external resistance at first.'],
  ['Snapping the knee straight.','Leaning back or swinging the lower leg.'],{equipment:CHAIR,sources:['nhs-sitting']}),
 entry('Prone W Raise',anatomy('Back','upper_back','Rhomboids; middle trapezius','Posterior deltoids; rotator cuff','scapular_retraction',false,['back','upper_back','rear_delts']),
  ['Lie face down on a comfortable floor surface with the arms bent into a relaxed W shape.','Keep the forehead comfortably supported and use no added load.'],
  ['Gently draw the shoulder blades toward each other and lift the hands a small distance.','Lower without lifting the chest or straining the neck.'],
  ['Arching the back to create a larger lift.','Shrugging or forcing the shoulders into an uncomfortable angle.'],{floor:true,tier:'standard'}),
 entry('Prone Y Raise',anatomy('Shoulders','scapular','Lower trapezius; deltoids','Serratus anterior; rotator cuff','scaption',false,['shoulders','lower_traps']),
  ['Lie face down with arms angled into a comfortable Y and thumbs pointing upward.','Support the forehead comfortably and leave external weights aside.'],
  ['Lift the hands slightly while keeping the neck and ribs quiet.','Lower slowly; use only a shoulder range you can control.'],
  ['Throwing the arms upward.','Lifting the chest or forcing the arms overhead.'],{floor:true,tier:'standard'}),
 entry('Band Biceps Curl',BICEPS,
  ['Use an intact light band held securely beneath both shoed feet.','Stand steadily with the hands holding equal band lengths and elbows by the sides.'],
  ['Curl the hands upward without moving the upper arms forward.','Lower slowly and keep the wrists comfortable throughout.'],
  ['Standing on a loose or damaged band.','Leaning backward or treating band colour as a measured weight.'],{equipment:BAND,band:true,tier:'standard'}),
 entry('Seated Band Biceps Curl',BICEPS,
  ['Sit on a stable chair or bench with an intact light band secured beneath the shoed feet.','Hold the ends evenly with elbows resting near the sides.'],
  ['Bend the elbows while keeping the torso still.','Return slowly and keep the band away from the face.'],
  ['Using a wheeled seat or allowing the band to slip under the feet.','Pulling with a shoulder shrug or swinging the trunk.'],{equipment:[...BAND,...CHAIR],band:true}),
 entry('Band Chest Press',CHEST,
  ['Place an intact light band around the upper back below the neck, holding the ends beside the chest.','Choose a steady stance and keep the band clear of the throat and face.'],
  ['Press the hands forward through a comfortable path with soft elbows.','Bring them back slowly without letting the band pull the shoulders backward.'],
  ['Wrapping the band around the neck.','Using excessive stretch or letting the band snap back.'],{equipment:BAND,band:true,tier:'standard'}),
 entry('Seated Band Chest Press',CHEST,
  ['Sit on a stable chair or bench with both feet planted and the shoulders comfortable.','Place an intact light band around the upper back below the neck, holding the ends beside the chest; keep it free of the seat and clear of the face.'],
  ['Press the hands forward through a controlled comfortable range without locking the elbows.','Bring the hands back slowly while keeping the torso steady and breathing easily.'],
  ['Wrapping the band around the neck or fastening it to an unapproved chair anchor.','Letting the band snap back or leaning the torso to finish a repetition.'],{equipment:[...BAND,...CHAIR],band:true}),
 entry('Band Pull-Apart',REAR,
  ['Hold a light band in front of the chest with a grip that leaves room for a small movement.','Keep the hands below a painful shoulder angle and the elbows soft.'],
  ['Separate the hands gently while keeping the ribs and shoulders relaxed.','Return slowly before fatigue changes the movement.'],
  ['Lifting the band toward the eyes.','Shrugging or overstretching the band for a larger range.'],{equipment:BAND,band:true}),
 entry('Band External Rotation',anatomy('Shoulders','rotator_cuff','Infraspinatus; teres minor','Posterior deltoids; shoulder stabilizers','external_rotation',false,['shoulders','rear_delts']),
  ['Hold a light band between both hands with elbows bent and kept near the sides.','Set the shoulders comfortably without pinning them forcefully backward.'],
  ['Move the hands apart a little while the elbows stay in place.','Return with control; choose a very light band and comfortable range.'],
  ['Moving the elbows away from the trunk to force range.','Continuing through pinching or painful shoulder movement.'],{equipment:BAND,band:true}),
 entry('Band Lateral Raise',LATERAL,
  ['Secure an intact light band beneath the shoed feet and hold the ends evenly.','Stand steadily with arms resting by the sides.'],
  ['Raise the arms slightly out and forward only as high as comfortable.','Lower slowly without leaning the torso.'],
  ['Shrugging to raise the hands higher.','Using a band that forces jerky movement or points toward the face.'],{equipment:BAND,band:true,tier:'standard'}),
 entry('Band Overhead Press',SHOULDERS,
  ['Secure an intact light band beneath both shoed feet and hold the ends near the shoulders.','Choose a steady stance and check that the overhead path is comfortable.'],
  ['Press upward without lifting the ribs or leaning backward.','Return slowly; skip overhead work when a comfortable path is unavailable.'],
  ['Using a damaged band or allowing it to slip under the feet.','Forcing overhead range or holding the breath.'],{equipment:BAND,band:true,tier:'standard'}),
 entry('Seated Band Overhead Press',SHOULDERS,
  ['Sit on a stable chair or bench and secure an intact light band beneath both shoed feet.','Bring the hands near the shoulders without pre-stretching the band excessively.'],
  ['Press upward through a comfortable path while keeping the trunk steady.','Lower gently and keep breathing; choose another movement if overhead motion hurts.'],
  ['Leaning backward to finish a repetition.','Using a seat that moves or allowing the band to slip.'],{equipment:[...BAND,...CHAIR],band:true}),
 entry('Standing Band Row',BACK,
  ['Attach an appropriate resistance band to a secure purpose-made anchor at a comfortable torso height.','Check the anchor and band, then take a steady stance with only light initial tension.'],
  ['Draw the elbows backward without rocking the torso.','Return the hands slowly and keep the line of pull away from the face.'],
  ['Using an improvised door handle or unsecured furniture as an anchor.','Jerking backward or allowing the band to snap toward you.'],{equipment:ANCHORED,band:true,tier:'standard'}),
 entry('Seated Band Row',BACK,
  ['Use a stable chair or bench facing a secure purpose-made resistance-band anchor.','Keep both feet planted and choose a comfortable horizontal line of pull.'],
  ['Draw the elbows back while the chest remains quiet.','Return slowly without rounding forward or shrugging.'],
  ['Assuming a chair leg or door handle is a suitable anchor.','Leaning far backward to move stronger band resistance.'],{equipment:[...ANCHORED,...CHAIR],band:true}),
 entry('Band Pallof Press',ANTIROTATION,
  ['Attach a light band to a secure purpose-made anchor around chest height.','Stand side-on with the hands held at the chest and feet in a comfortable steady stance.'],
  ['Press the hands forward a short distance while keeping the hips and shoulders facing ahead.','Return slowly and work both sides without holding the breath.'],
  ['Using an unsecured anchor or an excessively stretched band.','Turning toward the anchor or twisting to finish a repetition.'],{equipment:ANCHORED,band:true,tier:'standard'}),
 entry('Standing Band Hamstring Curl',anatomy('Legs','hamstrings','Hamstrings','Glutes; calf and trunk stabilizers','knee_flexion',false,['hamstrings']),
  ['Use a band designed for ankle attachment, secured to a purpose-made low anchor.','Stand with a stable hand support and arrange the band so it cannot catch either foot.'],
  ['Bend one knee through a small controlled range while keeping the thigh quiet.','Return slowly, then work the other side with the same setup.'],
  ['Improvising an ankle loop or anchor not rated for the band.','Arching the back or losing balance as the band tightens.'],{equipment:[...ANCHORED,['Band Ankle Attachment'],...SUPPORT],band:true,tier:'standard'}),
 entry('Band Triceps Pressdown',TRICEPS,
  ['Secure a suitable light band to a purpose-made overhead anchor and inspect the whole setup.','Hold the band with elbows comfortably beside the torso and feet steady.'],
  ['Straighten the elbows without driving the shoulders downward.','Return slowly and keep the band path clear of the face.'],
  ['Using an improvised high anchor.','Leaning the body onto the band or allowing a sudden return.'],{equipment:ANCHORED,band:true,tier:'standard'}),
 entry('Seated Loop-Band Hip Abduction',ABDUCTORS,
  ['Sit on a stable chair or bench and place a suitable light loop band above the knees.','Keep both feet flat with a small comfortable distance between the knees.'],
  ['Move the knees outward a little without rolling the feet or leaning back.','Bring them inward slowly without letting the band pull them together abruptly.'],
  ['Assuming a long open band is a suitable loop.','Forcing a wide range or letting the feet tip onto their edges.'],{equipment:[['Loop Resistance Band'],...CHAIR],band:true}),
 entry('Supported March',anatomy('Legs','hip_flexors','Hip flexors','Quadriceps; trunk and balance stabilizers','marching',false,['quads','core']),
  ['Stand beside a secure support with clear floor around both feet.','Use light hand contact and choose a pace that keeps breathing comfortable.'],
  ['Lift one foot a small distance and place it down gently before changing sides.','Keep the torso upright rather than lifting the knee as high as possible.'],
  ['Rushing the foot changes.','Pulling on an unstable support or continuing after balance changes.'],{equipment:SUPPORT,purpose:'mobility',sources:['nhs-warmup']}),
 entry('Seated March',anatomy('Legs','hip_flexors','Hip flexors','Quadriceps; abdominal stabilizers','marching',false,['quads','core']),
  ['Sit tall on a stable chair or bench with feet supported.','Use the sides of the seat lightly if needed to stay steady.'],
  ['Lift one bent knee a comfortable distance, then lower the foot slowly.','Alternate sides without leaning backward; the repetitions are per side.'],
  ['Using a wheeled seat.','Swinging the leg or holding the breath to lift it higher.'],{equipment:CHAIR,purpose:'mobility',sources:['nhs-sitting']}),
 entry('Supported Tandem Stand',anatomy('Full Body','balance','Foot, ankle and hip stabilizers','Trunk stabilizers','static_balance',false,['core','calves','glutes']),
  ['Stand next to a secure support and place one foot partly in front of the other.','Begin with a wider stance instead of a heel-to-toe line if that is steadier.'],
  ['Use enough hand support to remain comfortable while breathing normally.','Hold briefly, then change the leading foot without rushing.'],
  ['Closing the eyes or removing support before ready.','Trying to hold a narrow stance after losing steadiness.'],{equipment:SUPPORT,purpose:'balance',seconds:true,sources:['nhs-strength']}),
 entry('Wall Slide',anatomy('Shoulders','mobility','Deltoids; serratus anterior','Rotator cuff; upper-back stabilizers','shoulder_mobility',false,['shoulders','upper_back']),
  ['Face a clear wall and place the hands or forearms against it at a comfortable height.','Keep the feet steady and the ribs relaxed.'],
  ['Slide the arms upward only as far as the shoulders remain comfortable.','Lower slowly without leaning the lower back away from a steady position.'],
  ['Forcing the arms overhead.','Arching the back or pushing through shoulder pinching.'],{equipment:[['Wall']],purpose:'mobility',sources:['nhs-warmup']})
];

// The caller supplies only the original catalogue. Check identifiers and all
// spellings so a new variation cannot steal a legacy history/media alias.
export function appendAccessibleExercises(existing,additions=ACCESSIBLE_EXERCISES){
 const ids=new Set(existing.map(exercise=>exercise.id)),names=new Set(existing.flatMap(exercise=>[exercise.name,...(exercise.aliases||[])]).map(nameKey));
 const added=[];
 for(const exercise of additions){
  const spellings=[exercise.name,...(exercise.aliases||[])].map(nameKey);
  if(ids.has(exercise.id)||spellings.some(name=>names.has(name)))throw Error('Accessible exercise duplicates an existing ID or name: '+exercise.name);
  ids.add(exercise.id);for(const name of spellings)names.add(name);added.push(clone(exercise));
 }
 return [...existing,...added];
}
