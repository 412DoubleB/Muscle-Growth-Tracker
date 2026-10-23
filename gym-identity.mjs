// Shared comparison only: do not use these values to rewrite saved identities,
// request signatures, source evidence or IDs. This recognizes bounded US address
// conventions, not renamed brands, neighborhood aliases or approximate places.
const text=value=>value.toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const states={al:'alabama',ak:'alaska',az:'arizona',ar:'arkansas',ca:'california',co:'colorado',ct:'connecticut',de:'delaware',dc:'district of columbia',fl:'florida',ga:'georgia',hi:'hawaii',id:'idaho',il:'illinois',in:'indiana',ia:'iowa',ks:'kansas',ky:'kentucky',la:'louisiana',me:'maine',md:'maryland',ma:'massachusetts',mi:'michigan',mn:'minnesota',ms:'mississippi',mo:'missouri',mt:'montana',ne:'nebraska',nv:'nevada',nh:'new hampshire',nj:'new jersey',nm:'new mexico',ny:'new york',nc:'north carolina',nd:'north dakota',oh:'ohio',ok:'oklahoma',or:'oregon',pa:'pennsylvania',ri:'rhode island',sc:'south carolina',sd:'south dakota',tn:'tennessee',tx:'texas',ut:'utah',vt:'vermont',va:'virginia',wa:'washington',wv:'west virginia',wi:'wisconsin',wy:'wyoming'};
const stateNames=Object.entries(states).flatMap(([abbreviation,name])=>[[name,abbreviation],[abbreviation,abbreviation]]).sort((a,b)=>b[0].length-a[0].length);
const directions={n:'north',north:'north',s:'south',south:'south',e:'east',east:'east',w:'west',west:'west',ne:'northeast',northeast:'northeast',nw:'northwest',northwest:'northwest',se:'southeast',southeast:'southeast',sw:'southwest',southwest:'southwest'};
const suffixes={st:'street',street:'street',rd:'road',road:'road',ave:'avenue',avenue:'avenue',blvd:'boulevard',boulevard:'boulevard',dr:'drive',drive:'drive',ln:'lane',lane:'lane',ct:'court',court:'court',cir:'circle',circle:'circle',pl:'place',place:'place',pkwy:'parkway',parkway:'parkway',hwy:'highway',highway:'highway',ter:'terrace',terrace:'terrace',trl:'trail',trail:'trail',way:'way'};
const unitNames={ste:'suite',suite:'suite',unit:'unit',apt:'apartment',apartment:'apartment',fl:'floor',floor:'floor',bldg:'building',building:'building'};
const direction=value=>Object.hasOwn(directions,value)?directions[value]:'';
const suffix=value=>Object.hasOwn(suffixes,value)?suffixes[value]:'';
const isUnit=value=>Object.hasOwn(unitNames,value.split(' ')[0]);
const canonicalUnit=value=>{const [name,...rest]=value.split(' ');return (unitNames[name]||name)+' '+rest.join(' ')};
const zipMatches=(a,b)=>a.base===b.base&&(!a.extension||!b.extension||a.extension===b.extension);

function nameText(value){
 // Dotted initials are explicit punctuation variants; ordinary separate words
 // and branch names remain separate (Southside is not South Side).
 return text(value.normalize('NFKC').replace(/\b(?:[a-z]\.\s*){2,}|(?:\b[a-z]\.)+[a-z]\b/gi,initials=>initials.replace(/[.\s]/g,'')+' '));
}
function region(value,{address=false}={}){
 let remaining=value.trim(),zip=null;
 const match=remaining.match(/(?:^|[\s,])(\d{5})(?:-(\d{4}))?\s*$/);
 if(match&&!(address&&/\b(?:suite|ste|unit|apt|apartment|floor|fl|building|bldg)\s*$/i.test(remaining.slice(0,match.index)))){
  zip={base:match[1],extension:match[2]||''};remaining=remaining.slice(0,match.index);
 }
 const parts=remaining.split(',').map(text).filter(Boolean);let state='';
 if(parts.length)for(const [name,abbreviation] of stateNames){
  const last=parts.at(-1);
  // A lone full name can be a city (New York, Washington). Do not turn that
  // city query into permission to match every location in the same state.
  if(last===name&&parts.length===1&&name!==abbreviation)continue;
  if(last===name||last.endsWith(' '+name)){state=abbreviation;parts[parts.length-1]=last.slice(0,last.length-name.length).trim();if(!parts.at(-1))parts.pop();break}
 }
 return {parts,state,zip};
}
function place(value){const {parts,state,zip}=region(value);return {city:parts.join(' '),state,zip}}
function streetText(value,number){
 let words=text(value).slice(text(number).length).trim().split(' ').filter(Boolean);
 // Only address direction positions and the final street suffix are aliases.
 // "St" in a city, brand or the beginning of a street name stays literal.
 const last=words.length-1;
 if(words.length>2&&direction(words[last])&&suffix(words[last-1]))words[last]=direction(words[last]);
 const suffixIndex=direction(words.at(-1))&&words.length>2?words.length-2:words.length-1;
 if(suffixIndex>0&&suffix(words[suffixIndex]))words[suffixIndex]=suffix(words[suffixIndex]);
 if(words.length>1&&direction(words[0])&&!(words.length===2&&suffix(words[1])))words[0]=direction(words[0]);
 return words.join(' ');
}
function address(value,expectedCity){
 const {parts,state,zip}=region(value.replace(/#/g,' unit '),{address:true});
 let street=parts.shift()||'',city='';const units=[],extra=[];
 if(parts.length&&!isUnit(parts.at(-1)))city=parts.pop();
 // Without commas, use the supplied city only at the address's end; never
 // satisfy a city query using words from the street name.
 if(!city&&expectedCity&&street.endsWith(' '+expectedCity)){city=expectedCity;street=street.slice(0,-expectedCity.length).trim()}
 const words=street.split(' '),unitIndex=words.findIndex((word,index)=>index>1&&Object.hasOwn(unitNames,word)&&(suffix(words[index-1])||direction(words[index-1])&&suffix(words[index-2])));
 if(unitIndex>=0){units.push(canonicalUnit(words.slice(unitIndex).join(' ')));street=words.slice(0,unitIndex).join(' ')}
 for(const part of parts)(isUnit(part)?units:extra).push(isUnit(part)?canonicalUnit(part):part);
 const streetWords=street.split(' '),suffixIndex=streetWords.findLastIndex((word,index)=>index>1&&suffix(word));
 const tail=suffixIndex>=0?streetWords.slice(suffixIndex+1):[];if(direction(tail[0]))tail.shift();
 // An unknown tail after a recognized suffix may be a different city. Without
 // a requested literal address, accepting it would ignore that uncertainty.
 const unresolvedTail=!city&&tail.length>0;
 // Read the leading house number from the original text so a suite number, a
 // ZIP or punctuation-normalized hyphenated number cannot stand in for it.
 const number=value.match(/^\s*(\d+[a-z]?(?:-\d+[a-z]?)?)(?=\s|$)/i)?.[1].toLowerCase()||'';
 return {city,state,zip,number,street:number?streetText(street,number):street,units,extra,unresolvedTail};
}
function combinePlace(primary,secondary){
 if(primary.city&&secondary.city&&primary.city!==secondary.city||primary.state&&secondary.state&&primary.state!==secondary.state||primary.zip&&secondary.zip&&!zipMatches(primary.zip,secondary.zip))return null;
 return {city:primary.city||secondary.city,state:primary.state||secondary.state,zip:primary.zip?.extension?primary.zip:secondary.zip||primary.zip};
}

export function gymIdentityMatches(query,candidate){
 try{
  if(!query||!candidate||typeof query.name!=='string'||typeof candidate.name!=='string'||typeof candidate.city!=='string'||typeof candidate.address!=='string'||query.location!=null&&typeof query.location!=='string'||query.address!=null&&typeof query.address!=='string')return false;
  const wantedName=nameText(query.name),foundName=new Set(nameText(candidate.name).split(' '));
  if(!wantedName||!wantedName.split(' ').every(word=>foundName.has(word))||!candidate.address.trim()||!(query.location||query.address||'').trim())return false;
  const wantedPlace=place(query.location||''),foundPlace=place(candidate.city);
  const wantedAddress=query.address?.trim()?address(query.address,wantedPlace.city):null,foundAddress=address(candidate.address,foundPlace.city);
  const wanted=combinePlace(wantedPlace,wantedAddress||{city:'',state:'',zip:null}),found=combinePlace(foundPlace,foundAddress);
  if(!wanted||!found||wanted.city&&wanted.city!==found.city||wanted.state&&wanted.state!==found.state||wanted.zip&&(!found.zip||!zipMatches(wanted.zip,found.zip)))return false;
  if(!wantedAddress)return !!foundAddress.number&&!!foundAddress.street&&!foundAddress.unresolvedTail;
  if(wantedAddress.number!==foundAddress.number)return false;
  // Unrecognized but identical formats may still match literally. Otherwise
  // require independently comparable street numbers and complete street text.
  if(text(query.address)===text(candidate.address))return true;
  return !wantedAddress.unresolvedTail&&!foundAddress.unresolvedTail&&!!wantedAddress.number&&!!wantedAddress.street&&wantedAddress.street===foundAddress.street&&wantedAddress.units.every(unit=>foundAddress.units.includes(unit))&&JSON.stringify(wantedAddress.extra)===JSON.stringify(foundAddress.extra);
 }catch{return false}
}
