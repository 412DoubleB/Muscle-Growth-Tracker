// Optional common-setup estimates, never claims about a particular gym floor.
// Share the bounded vocabulary with research validation. Specialist attachments,
// dual-cable configurations and quantitative limits need separate evidence.
export const COMMON_CABLE_ATTACHMENTS=Object.freeze([
 'Rope Attachment','D-Handles','Straight Bar Attachment','EZ Cable Bar','V-Bar Attachment','Ankle Strap',
 'Wide Lat Bar','Neutral Pulldown Handle','Close-Grip Pulldown Handle','Straight Lat Bar','Close Neutral Row Handle'
]);

export const GYM_TYPES=Object.freeze(Object.fromEntries(Object.entries({
 commercial:{label:'Commercial gym',estimates:[
  'Dumbbells','Adjustable Bench','Barbell','Olympic Plates','Squat Rack','Single Cable Column','Lat Pulldown','Leg Press 45°','Leg Extension','Seated Leg Curl','Selectorized Chest Press','Seated Cable Row','Smith Machine','Kettlebells','Pec Deck / Chest Fly','Selectorized Shoulder Press','Biceps Curl Machine','Triceps Extension Machine','Treadmill','Stationary Bike','Elliptical','Rower','Stair Climber',
  'Decline Bench','EZ Bar','Fixed Barbells','Preacher Bench','Bench-Press Rack',
  'Selectorized Incline Press','Plate-Loaded Chest Press','Plate-Loaded Incline Press','Plate-Loaded Decline Press','Plate-Loaded Shoulder Press','Plate-Loaded Pulldown','Plate-Loaded Row','Chest-Supported Row Machine','Reverse Pec Deck','Lateral Raise Machine','Preacher Curl Machine',
  'Horizontal / Seated Leg Press','Hack Squat','Lying Leg Curl','Hip Abductor','Hip Adductor','Standing Calf Raise','Seated Calf Raise','Glute Drive / Hip Thrust','Glute Kickback Machine',
  'Ab Crunch Machine','Back Extension Machine','45° Back Extension','Assisted Pull-up / Dip','Captain’s Chair',
  'Medicine Balls','Resistance Bands','Step / Plyo Box','Air Bike','Spin Bike',
  ...COMMON_CABLE_ATTACHMENTS
 ],note:'A fuller optional commercial starting list with common cable attachments, estimated rather than an inventory of this location. Review every item before adding and saving; brands, specialist configurations and available loads need separate evidence or your confirmation. Attachments do not establish which cable or pulldown stations are available.'},
 strength:{label:'Strength gym',estimates:['Barbell','Olympic Plates','Adjustable Bench','Squat Rack','Dumbbells'],note:'A provisional free-weight setup with a rack and adjustable bench; specialist machines and attachments remain unknown.'},
 hotel:{label:'Hotel fitness room',estimates:['Dumbbells'],note:'A small fitness room may have light dumbbells; weights and other equipment need checking.'},
 home:{label:'Home gym',estimates:[],note:'Home setups vary. Enter the equipment you actually have.'},
 workplace:{label:'Workplace / fire station',estimates:['Dumbbells','Bench'],note:'Basic workplace suggestions only; no particular station setup is verified.'},
 custom:{label:'Custom setup',estimates:[],note:'Start with your own checklist.'}
}).map(([id,profile])=>[id,Object.freeze({...profile,estimates:Object.freeze(profile.estimates)})])));

export const ESTIMATED_EQUIPMENT=Object.freeze([...new Set(Object.values(GYM_TYPES).flatMap(profile=>profile.estimates))]);
