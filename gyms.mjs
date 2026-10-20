// Curated official-source research. Lookup is local and never claims a live AI audit.
// Location identity must be confirmed before applying any published equipment.
import {gymIdentityMatches} from './gym-identity.mjs?v=8.1.1';
import {GYM_TYPES,ESTIMATED_EQUIPMENT} from './gym-profiles.mjs?v=8.1.1';
export {GYM_TYPES};
export {COMMON_CABLE_ATTACHMENTS} from './gym-profiles.mjs?v=8.1.1';
export const GYM_DIRECTORY=[
 {id:'crunch-pleasant-hills-pa',name:'Crunch Pleasant Hills',city:'Pleasant Hills, PA',address:'601 Clairton Blvd, Suite 38, Pleasant Hills, PA 15236',checked:'2026-10-18',url:'https://www.crunch.com/locations/pleasant-hills',status:'Published location information',equipment:[{name:'Dumbbells',detail:'Published maximum 120 lb each; confirm at the club.',status:'published',max:120},{name:'Kettlebells',detail:'Published maximum 50 lb; confirm at the club.',status:'published',max:50}],amenities:['Olympic platforms','Strength and cardio machines (models unspecified)','Circuit training','TRX / suspension training','HIITZone'],unknown:['Individual machines and their models','Cable configuration and attachments','Racks, barbells, benches and plates','Equipment availability and working condition'],complete:false},
 {id:'crunch-monroeville-pa',name:'Crunch Monroeville',city:'Monroeville, PA',address:'3700 William Penn Hwy, Monroeville, PA 15146',checked:'2026-10-18',url:'https://www.crunch.com/locations/monroeville',status:'Official page says coming soon; hours listed closed',equipment:[],amenities:[],unknown:['Opening date','All location-specific equipment'],complete:false}
];
const normalize=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export function lookupGyms(name,location=''){const q=normalize(name+' '+location),words=q.split(' ').filter(w=>!['gym','fitness','the','pa','pennsylvania'].includes(w));if(!normalize(name)||!words.length)return [];return GYM_DIRECTORY.filter(g=>{const text=normalize(g.name+' '+g.city+' '+g.address);return words.every(w=>text.split(' ').includes(w))})}
export function gymResearchPrompt(name,location=''){return `Research the exact gym ${String(name).slice(0,150)} in ${String(location||'the location I will confirm').slice(0,150)} for my MENEI. Use current official location sources. First confirm its address and operating status. List each specifically supported equipment type, dumbbell maximum, source URL and checked date. Keep published claims, physical/user confirmation and estimates distinct. Do not infer specific machines, dual cables, plates, benches, racks or attachments from generic strength-equipment claims. Identify unknowns. Do not copy site photos or expressive text. Return a concise equipment checklist for me to enter in Your gyms.`}
export function researchLink(name,location=''){return 'https://chatgpt.com/?q='+encodeURIComponent(gymResearchPrompt(name,location))}

const cloneResearch=value=>structuredClone(value);
const researchRecord=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
const estimateNames=new Set(ESTIMATED_EQUIPMENT);
const evidenceKey=value=>JSON.stringify(value,(_key,item)=>researchRecord(item)?Object.fromEntries(Object.keys(item).sort().map(key=>[key,item[key]])):item);
function retainPriorEvidence(previous,next){
 const seen=new Set(),prior=[],current=cloneResearch(next);delete current.priorEvidence;const currentKey=evidenceKey(current);
 const retain=entry=>{if(!researchRecord(entry))throw Error('Saved source evidence is malformed.');if(entry.priorEvidence!==undefined&&!Array.isArray(entry.priorEvidence))throw Error('Saved prior evidence is malformed.');for(const older of entry.priorEvidence||[])retain(older);const flat=cloneResearch(entry);delete flat.priorEvidence;const key=evidenceKey(flat);if(!seen.has(key)){seen.add(key);prior.push(flat)}};
 for(const entry of next.priorEvidence||[])retain(entry);if(previous){if(!researchRecord(previous)||previous.priorEvidence!==undefined&&!Array.isArray(previous.priorEvidence))throw Error('Saved prior evidence is malformed.');for(const entry of previous.priorEvidence||[])retain(entry);const flat=cloneResearch(previous);delete flat.priorEvidence;if(evidenceKey(flat)!==currentKey)retain(flat)}
 if(prior.length)current.priorEvidence=prior;return current;
}
function researchText(value,label,{required=false,max=2000}={}){if(value==null&&!required)return '';if(typeof value!=='string'||value.length>max||required&&!value.trim())throw Error('Invalid '+label+'.');return value.trim()}
function evidenceDate(value){const date=researchText(value,'source checked date',{required:true,max:10}),parsed=new Date(date+'T12:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(parsed.getTime())||parsed.toISOString().slice(0,10)!==date)throw Error('Use a valid source checked date.');return date}
function sourceUrl(value){const text=researchText(value,'source URL',{required:true,max:4096});let url;try{url=new URL(text)}catch{throw Error('Use a public HTTPS source URL.')}
 if(url.protocol!=='https:'||url.username||url.password||url.port||!url.hostname.includes('.')||url.hostname==='localhost'||url.hostname.endsWith('.localhost')||url.hostname.endsWith('.local')||/^\d+(?:\.\d+){3}$/.test(url.hostname)||url.hostname.includes(':'))throw Error('Use a public HTTPS source URL.');return text;
}
function equipmentVocabulary(values){if(!(Array.isArray(values)||values instanceof Set)||!values.size&&!values.length)throw Error('Supply the app equipment vocabulary.');const map=new Map();for(const value of values){if(typeof value!=='string'||!value.trim())throw Error('Invalid equipment vocabulary.');map.set(normalize(value),value)}return map}
function normalizedGymQuery(query){if(!researchRecord(query))throw Error('Enter a gym name and location.');const identity={name:normalize(researchText(query.name,'gym name',{required:true,max:300})),location:normalize(researchText(query.location,'gym location',{max:500})),address:normalize(researchText(query.address,'gym address',{max:500}))};if(!identity.name)throw Error('Enter a gym name.');return identity}
export function gymLocationSignature(query){const identity=normalizedGymQuery(query);return JSON.stringify([identity.name,identity.location,identity.address])}
export function sourceInfoMatchesGym(info,query){try{return researchRecord(info)&&typeof info.requestSignature==='string'&&info.requestSignature===gymLocationSignature(query)}catch{return false}}

export function validateGymResearch(result,{allowedEquipment}={}){
 if(!researchRecord(result))throw Error('Gym research must contain a structured location result.');
 const vocabulary=equipmentVocabulary(allowedEquipment),out=cloneResearch(result);
 out.name=researchText(result.name,'researched gym name',{required:true,max:300});out.address=researchText(result.address,'researched address',{max:500});out.city=researchText(result.city||result.location,'researched city',{max:500});
 out.status=researchText(result.status,'location status',{max:1000});if(result.operatingStatus!==undefined)out.operatingStatus=researchText(result.operatingStatus,'operating status',{max:100});
 if(result.url)out.url=sourceUrl(result.url);if(result.checked)out.checked=evidenceDate(result.checked);
 if(result.sources!==undefined&&!Array.isArray(result.sources))throw Error('Source references must be a list.');
 out.sources=(result.sources||[]).map(entry=>{if(!researchRecord(entry))throw Error('A source reference is malformed.');return {...cloneResearch(entry),url:sourceUrl(entry.url),...(entry.checked?{checked:evidenceDate(entry.checked)}:{})}});
 if(!Array.isArray(result.equipment)||result.equipment.length>300)throw Error('Research equipment must be a bounded list.');
 out.equipment=result.equipment.map(entry=>{
  if(!researchRecord(entry)||!['published','estimated'].includes(entry.status))throw Error('Every equipment item needs published or estimated provenance.');
  const name=vocabulary.get(normalize(entry.name));if(!name)throw Error('Research named equipment outside the app vocabulary.');
  if(entry.status==='estimated'&&!estimateNames.has(name))throw Error('Specific equipment and attachments need published evidence or your manual checklist.');
  if(entry.status==='estimated'&&(Object.hasOwn(entry,'max')||Object.hasOwn(entry,'unit')))throw Error('Estimated equipment cannot supply weight limits or units.');
  const item={...cloneResearch(entry),name,detail:researchText(entry.detail,'equipment explanation',{required:true}),status:entry.status};
  const reference=entry.sourceUrl||entry.url||(entry.status==='published'?(out.url||out.sources[0]?.url):null),checked=entry.checked||(entry.status==='published'?(out.checked||out.sources[0]?.checked):null);
  if(reference)item.sourceUrl=sourceUrl(reference);if(checked)item.checked=evidenceDate(checked);
  if(entry.status==='published'&&(!item.sourceUrl||!item.checked))throw Error('Published equipment needs a source URL and checked date.');
  if(entry.max!==undefined){if(typeof entry.max!=='number'||!Number.isFinite(entry.max)||entry.max<=0||entry.max>5000)throw Error('A published equipment limit is invalid.');item.unit=entry.unit||'lb';if(!['lb','kg'].includes(item.unit))throw Error('Equipment limits need lb or kg units.')}
  return item;
 });
 if(Object.hasOwn(result,'setup')){
  if(result.setup===null)out.setup=null;
  else{
   const setup=result.setup;
   if(!researchRecord(setup)||!Object.hasOwn(GYM_TYPES,setup.gymType))throw Error('The suggested gym setup is invalid.');
   out.setup={...cloneResearch(setup),gymType:setup.gymType,basis:researchText(setup.basis,'setup estimate basis',{required:true,max:400}),sourceUrl:sourceUrl(setup.sourceUrl),checked:evidenceDate(setup.checked)};
  }
 }
 if(Object.hasOwn(result,'estimatedEquipment')){
  if(!Array.isArray(result.estimatedEquipment)||result.estimatedEquipment.length>12)throw Error('Wider equipment estimates must be a bounded list.');
  const names=new Set();
  out.estimatedEquipment=result.estimatedEquipment.map(entry=>{
   if(!researchRecord(entry)||entry.status!=='estimated'||entry.basis!=='wider-web')throw Error('Wider equipment needs estimated provenance.');
   const name=vocabulary.get(normalize(entry.name));
   if(!name||names.has(name))throw Error('Wider estimates need distinct canonical equipment names.');names.add(name);
   if(Object.hasOwn(entry,'max')||Object.hasOwn(entry,'unit'))throw Error('Estimated equipment cannot supply weight limits or units.');
   return {...cloneResearch(entry),name,status:'estimated',basis:'wider-web',detail:researchText(entry.detail,'wider equipment explanation',{required:true,max:400}),sourceUrl:sourceUrl(entry.sourceUrl),checked:evidenceDate(entry.checked)};
  });
 }
 for(const key of ['amenities','unknown']){if(result[key]!==undefined&&!Array.isArray(result[key]))throw Error('Research '+key+' must be a list.');out[key]=(result[key]||[]).map(value=>researchText(value,key,{required:true}))}
 out.complete=false;return out;
}

function locationMatchesResearch(query,research){
 return gymIdentityMatches(query,research);
}
function closedResearch(research){return research.closed===true||/\b(closed|coming soon|not yet open|not open yet|permanently shut|temporarily shut|under construction)\b/i.test([research.operatingStatus,research.status].filter(Boolean).join(' ').replace(/[-_]+/g,' '))}

export function buildGymAutofillPreview(existing,{query,gymType='custom',research=null,allowedEquipment}={}){
 if(!researchRecord(existing)||!Array.isArray(existing.inventory)||existing.inventory.some(value=>typeof value!=='string'))throw Error('Keep a valid editable gym checklist.');
 if(!Object.hasOwn(GYM_TYPES,gymType))throw Error('Choose an available gym type.');
 const vocabulary=equipmentVocabulary(allowedEquipment),identity=normalizedGymQuery(query),signature=gymLocationSignature(query),profile=GYM_TYPES[gymType],published=research?validateGymResearch(research,{allowedEquipment}):null;
 const proposals=new Map();for(const name of profile.estimates){if(!vocabulary.has(normalize(name)))throw Error('The app vocabulary does not support this gym profile.');proposals.set(name,{name,status:'estimated',detail:profile.label+' starting suggestion; not verified for this location.',basis:gymType})}
 for(const item of published?.equipment||[]){const previous=proposals.get(item.name);if(!previous||previous.status!=='published'||item.status==='published')proposals.set(item.name,cloneResearch(item))}
 for(const item of published?.estimatedEquipment||[]){if(proposals.get(item.name)?.status!=='published')proposals.set(item.name,cloneResearch(item))}
 const items=[...proposals.values()].map(item=>({...item,alreadySelected:existing.inventory.includes(item.name)})),additions=items.filter(item=>!item.alreadySelected).map(item=>item.name);
 let reason='';if(published&&!locationMatchesResearch(query,published))reason='The researched name or address does not match this gym location.';else if(published&&closedResearch(published))reason='This location is reported closed or not yet open. Review it before using equipment research.';else if(!items.length)reason='No equipment suggestions yet. Keep editing your own checklist or choose a gym type.';
 const dumbbells=items.find(item=>item.name==='Dumbbells'&&item.status==='published'&&item.max!==undefined);
 const dbMaxProposal=dumbbells?{value:Math.round(dumbbells.max*(dumbbells.unit==='kg'?2.20462262185:1)*100)/100,detail:dumbbells.detail,sourceUrl:dumbbells.sourceUrl,checked:dumbbells.checked}:null;
 const sourceInfo={...(published?cloneResearch(published):{}),id:published?.id||'estimated-'+gymType,name:published?.name||researchText(query.name,'gym name',{required:true}),location:published?.city||researchText(query.location,'gym location'),address:published?.address||researchText(query.address,'gym address'),url:published?.url||'',checked:published?.checked||'',equipment:cloneResearch(published?.equipment||[]),complete:false,requestSignature:signature,identity,gymType,estimates:cloneResearch(items.filter(item=>item.status==='estimated').map(({alreadySelected,...item})=>item))};
 return {signature,gymType,canApply:!reason,reason,items,additions,dbMaxProposal,sourceInfo};
}

export function applyGymAutofillPreview(existing,preview,{query,selectedEquipment=preview?.additions,usePublishedDbMax=false}={}){
 if(!researchRecord(existing)||!Array.isArray(existing.inventory)||existing.inventory.some(value=>typeof value!=='string')||!researchRecord(preview)||!preview.canApply)throw Error(preview?.reason||'Review a valid equipment proposal first.');
 if(!query||gymLocationSignature(query)!==preview.signature||!sourceInfoMatchesGym(preview.sourceInfo,query))throw Error('The gym name or location changed. Look it up again before applying this proposal.');
 if(!Array.isArray(selectedEquipment)||selectedEquipment.some(name=>!preview.items.some(item=>item.name===name)))throw Error('Select only equipment from this reviewed proposal.');
 const out=cloneResearch(existing),inventory=[...existing.inventory];for(const name of selectedEquipment)if(!inventory.includes(name))inventory.push(name);
 out.inventory=inventory;out.sourceInfo=retainPriorEvidence(existing.sourceInfo,preview.sourceInfo);
 if(usePublishedDbMax){if(!preview.dbMaxProposal||!Number.isFinite(preview.dbMaxProposal.value)||preview.dbMaxProposal.value<=0)throw Error('No published dumbbell maximum is available.');out.dbMax=preview.dbMaxProposal.value}
 if(inventory.length!==existing.inventory.length||usePublishedDbMax&&out.dbMax!==existing.dbMax)out.equipmentConfirmedAt=null;
 return out;
}
