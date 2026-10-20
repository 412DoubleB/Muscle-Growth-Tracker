import test from 'node:test';
import assert from 'node:assert/strict';
import {ProviderError,normalizeGymQuery,buildGymResearchRequest,parseGymResearchResponse,researchGym} from '../server/gym-research-provider.mjs';
import {EQUIPMENT} from '../core.mjs';
import {buildGymAutofillPreview} from '../gyms.mjs';

const query={name:'Synthetic Fitness',location:'Cleveland OH',address:''};
const url='https://fitness.example.com/cleveland';
const equipmentUrl='https://fitness.example.com/cleveland/equipment';
const now=()=>new Date('2026-10-19T23:59:59.000Z');
const options={query,allowedEquipment:EQUIPMENT,now};
const apiKey='sk-synthetic-not-a-real-key';
const candidate=()=>({name:'Synthetic Fitness Cleveland',city:'Cleveland OH',address:'123 Example Street, Cleveland OH 44101',operatingStatus:'open',url,equipment:[{name:'Dumbbells',detail:'Location equipment list publishes dumbbells up to 40 kg each.',sourceUrl:equipmentUrl,max:40,unit:'kg'},{name:'Bench',detail:'Location equipment checklist lists a bench, with its configuration unspecified.',sourceUrl:equipmentUrl,max:null,unit:null}],unknown:['Cable configuration and attachments','Current availability and working condition']});
const responseBody=(locations=[candidate()])=>({status:'completed',output:[{type:'web_search_call',status:'completed',action:{type:'search',sources:[{type:'url',url,title:'Location source'},{type:'url',url:equipmentUrl,title:'Equipment source'}]}},{type:'message',role:'assistant',status:'completed',content:[{type:'output_text',text:JSON.stringify({locations}),annotations:[]}]}]});
const expectCode=(action,code,status)=>assert.throws(action,error=>error instanceof ProviderError&&error.code===code&&error.status===status&&!error.message.includes(apiKey));

test('request pins one bounded search, strict output and only the three gym identity fields',()=>{
 const input={name:'  Synthetic Fitness  ',location:'Cleveland OH',address:''};
 const original=structuredClone(input),body=buildGymResearchRequest(input,{allowedEquipment:EQUIPMENT});
 assert.deepEqual(input,original);assert.deepEqual(normalizeGymQuery(input),query);
 assert.equal(body.model,'gpt-6-luna');assert.deepEqual(body.reasoning,{effort:'low'});assert.equal(body.service_tier,'default');assert.equal(body.store,false);
 assert.deepEqual(body.tools,[{type:'web_search',search_context_size:'low'}]);assert.equal(body.tool_choice,'required');assert.equal(body.max_tool_calls,1);assert.equal(body.max_output_tokens,2500);assert.deepEqual(body.include,['web_search_call.action.sources']);
 assert.deepEqual(JSON.parse(body.input[0].content[0].text),query);assert.match(body.instructions,/untrusted data/);assert.match(body.instructions,/Never supply estimated equipment/);
 assert.equal(body.text.format.strict,true);assert.equal(body.text.format.schema.additionalProperties,false);assert.equal(body.text.format.schema.properties.locations.maxItems,3);
 const item=body.text.format.schema.properties.locations.items;assert.equal(item.additionalProperties,false);assert.equal(item.properties.equipment.maxItems,60);assert.deepEqual(item.properties.equipment.items.properties.name.enum,EQUIPMENT.slice().sort());
 for(const bad of [{...query,ownerId:'personal'},{name:'',location:'Cleveland',address:''},{name:'Fitness',location:'',address:''},{...query,name:'a'.repeat(301)},{...query,address:'a'.repeat(501)},{...query,name:'Fitness\u0000Instructions'},null])expectCode(()=>buildGymResearchRequest(bad,{allowedEquipment:EQUIPMENT}),'invalid_query',400);
});

test('completed search becomes a whitelist DTO compatible with editable gym preview without changing a saved gym',()=>{
 const raw=responseBody(),original=structuredClone(raw),result=parseGymResearchResponse(raw,options),location=result.locations[0];
 assert.deepEqual(raw,original);assert.equal(result.checked,'2026-10-19');assert.match(result.notice,/need your review/);assert.equal(result.locations.length,1);
 assert.deepEqual(Object.keys(location).sort(),['id','name','city','address','operatingStatus','status','url','checked','sources','equipment','amenities','unknown','complete'].sort());
 assert.match(location.id,/^ai-gym-[a-f0-9]{16}$/);assert.equal(location.id,parseGymResearchResponse(raw,{...options,now:()=>new Date('2026-10-20')}).locations[0].id);
 assert.equal(location.complete,false);assert.deepEqual(location.amenities,[]);assert.equal(location.sources.length,2);assert.ok(location.sources.every(source=>source.checked==='2026-10-19'&&!Object.hasOwn(source,'type')));
 assert.equal(location.equipment[0].status,'published');assert.equal(location.equipment[0].max,40);assert.equal(location.equipment[0].unit,'kg');assert.equal(Object.hasOwn(location.equipment[1],'max'),false);assert.equal(Object.hasOwn(location.equipment[1],'unit'),false);
 const gym={name:query.name,location:query.location,address:'',inventory:['Owner entered apparatus'],dbMax:85,notes:'Preserve my notes'};
 const before=structuredClone(gym),preview=buildGymAutofillPreview(gym,{query,gymType:'custom',research:location,allowedEquipment:EQUIPMENT});
 assert.equal(preview.canApply,true);assert.equal(preview.dbMaxProposal.value,88.18);assert.deepEqual(gym,before);assert.match(location.status,/AI research candidate/);assert.doesNotMatch(location.status,/official|verified/);
});

test('actual completed web-search evidence is required even if model JSON or output_text looks valid',()=>{
 for(const change of [raw=>raw.status='incomplete',raw=>raw.incomplete_details={reason:'max_output_tokens'},raw=>raw.error={message:'private provider details'},raw=>raw.output.shift(),raw=>raw.output[0].status='in_progress',raw=>raw.output[1].content=[{type:'refusal',refusal:'No'}],raw=>raw.output[1].status='in_progress',raw=>raw.output[1].content[0].text='```json\n{}\n```',raw=>raw.output[1].content.push({...raw.output[1].content[0]}),raw=>{raw.output_text=raw.output[1].content[0].text;raw.output.pop()}]){
  const raw=responseBody();change(raw);expectCode(()=>parseGymResearchResponse(raw,options),'invalid_provider_response',502);
 }
});

test('one-search budget rejects extra web-search calls even when all calls completed successfully',()=>{
 for(const secondStatus of ['completed','in_progress']){
  const raw=responseBody(),second=structuredClone(raw.output[0]);second.status=secondStatus;raw.output.splice(1,0,second);
  expectCode(()=>parseGymResearchResponse(raw,options),'invalid_provider_response',502);
 }
 for(const actionType of ['open_page','find_in_page']){
  const raw=responseBody();raw.output[0].action.type=actionType;
  expectCode(()=>parseGymResearchResponse(raw,options),'invalid_provider_response',502);
 }
 assert.equal(parseGymResearchResponse(responseBody(),options).locations.length,1);
});

test('citation annotations can support claims but uncited location, equipment and limits are rejected',()=>{
 const raw=responseBody();raw.output[0].action.sources=[];raw.output[1].content[0].annotations=[{type:'url_citation',url,title:'Cited location'},{type:'url_citation',url:equipmentUrl,title:'Cited equipment'}];
 assert.equal(parseGymResearchResponse(raw,options).locations.length,1);
 for(const change of [item=>item.url='https://invented.example.com/location',item=>item.equipment[0].sourceUrl='https://invented.example.com/equipment',item=>item.equipment[0].unit=null,item=>item.equipment[0].max=null,item=>item.equipment[0].max=5001,item=>item.equipment[0].max=0,item=>item.equipment[0].unit='lbs']){
  const item=candidate();change(item);expectCode(()=>parseGymResearchResponse(responseBody([item]),options),'invalid_provider_response',502);
 }
 const fragments=responseBody();fragments.output[0].action.sources[1].url+='#section';assert.equal(parseGymResearchResponse(fragments,options).locations[0].equipment[0].sourceUrl,equipmentUrl);
});

test('strict schema validation rejects injected fields, unknown equipment, duplicates and unbounded lists',()=>{
 for(const change of [item=>item.id='model-picked',item=>item.equipment[0].status='estimated',item=>item.equipment[0].name='Mystery pulley',item=>item.equipment.push({...item.equipment[0]}),item=>item.equipment[0].detail='a'.repeat(1201),item=>item.equipment=Array.from({length:61},()=>({...item.equipment[0]})),item=>item.unknown=Array(13).fill('Unknown'),item=>item.name='a'.repeat(301),item=>item.operatingStatus='probably open',item=>item.equipment[0].max='40']){
  const item=candidate();change(item);expectCode(()=>parseGymResearchResponse(responseBody([item]),options),'invalid_provider_response',502);
 }
 expectCode(()=>parseGymResearchResponse(responseBody([candidate(),candidate()]),options),'invalid_provider_response',502);
 expectCode(()=>parseGymResearchResponse(responseBody(Array(4).fill(candidate())),options),'invalid_provider_response',502);
});

test('unsafe and private-looking URLs cannot be promoted by citations',()=>{
 for(const unsafe of ['javascript:alert(1)','http://fitness.example.com/gym','https://name:password@fitness.example.com/gym','https://fitness.example.com:8443/gym','https://localhost/gym','https://internal.local/gym','https://office.internal/gym','https://gym.test/gym','https://127.0.0.1/gym','https://2130706433/gym','https://0x7f000001/gym','https://[::1]/gym','https://127.0.0.1.nip.io/gym','https://fitness.example.com./gym']){
  const item=candidate();item.url=unsafe;const raw=responseBody([item]);raw.output[0].action.sources.push({type:'url',url:unsafe});expectCode(()=>parseGymResearchResponse(raw,options),'invalid_provider_response',502);
 }
});

test('unrelated branches are omitted while closed and unknown statuses stay reviewable and cannot imply a verified inventory',()=>{
 const different=candidate();different.city='Pittsburgh PA';different.address='987 Other Street Pittsburgh PA';
 assert.deepEqual(parseGymResearchResponse(responseBody([different]),options).locations,[]);
 const wrongName=candidate();wrongName.name='Other Fitness';assert.deepEqual(parseGymResearchResponse(responseBody([wrongName]),options).locations,[]);
 for(const operatingStatus of ['closed','temporarily_closed','coming_soon','unknown']){
  const item=candidate();item.operatingStatus=operatingStatus;const location=parseGymResearchResponse(responseBody([item]),options).locations[0];assert.equal(location.operatingStatus,operatingStatus);assert.equal(location.complete,false);
  const preview=buildGymAutofillPreview({inventory:[]},{query,research:location,allowedEquipment:EQUIPMENT});assert.equal(preview.canApply,operatingStatus==='unknown');
 }
 assert.deepEqual(parseGymResearchResponse(responseBody([]),options).locations,[]);
});

test('HTTP adapter uses a fixed endpoint, one request and no secret or user record in its JSON body',async()=>{
 const calls=[];const result=await researchGym(query,{apiKey,allowedEquipment:EQUIPMENT,now,fetcher:async(url,options)=>{calls.push({url,options});return new Response(JSON.stringify(responseBody()))}});
 assert.equal(result.locations.length,1);assert.equal(calls.length,1);const call=calls[0];assert.equal(call.url,'https://api.openai.com/v1/responses');assert.equal(call.options.method,'POST');assert.equal(call.options.redirect,'manual');assert.equal(call.options.headers.Authorization,'Bearer '+apiKey);assert.ok(call.options.signal instanceof AbortSignal);
 assert.ok(!call.options.body.includes(apiKey));assert.deepEqual(JSON.parse(JSON.parse(call.options.body).input[0].content[0].text),query);
});

test('Worker-compatible fetch succeeds and rejects redirects without forwarding the provider key',async()=>{
 const endpoint='https://api.openai.com/v1/responses',redirected='https://redirect.example.com/provider';
 for(const status of [200,301,302,303,307,308]){
  const calls=[];let cancelled=false;
  const fetcher=async(url,options)=>{
   // Workers rejects redirect:error before dispatch and otherwise follows by
   // default. Model both behaviors so either unsafe mode breaks this regression.
   if(!['manual','follow'].includes(options.redirect??'follow'))throw new TypeError('Unsupported redirect mode');
   calls.push({url,headers:options.headers});
   if(url===redirected||status===200)return new Response(JSON.stringify(responseBody()));
   if((options.redirect??'follow')==='follow')return fetcher(redirected,options);
   return new Response(new ReadableStream({cancel(){cancelled=true}}),{status,headers:{Location:redirected}});
  };
  const work=researchGym(query,{apiKey,allowedEquipment:EQUIPMENT,now,fetcher});
  if(status===200)assert.equal((await work).locations.length,1);
  else{
   await assert.rejects(work,error=>error instanceof ProviderError&&error.code==='provider_unavailable'&&error.status===503&&!error.message.includes(apiKey));
   assert.equal(cancelled,true);
  }
  assert.deepEqual(calls,[{url:endpoint,headers:{Authorization:'Bearer '+apiKey,'Content-Type':'application/json'}}]);
 }
});

test('provider errors are sanitized and never retried or read for raw error details',async()=>{
 for(const failure of [async()=>{throw Error('provider failure '+apiKey)},async()=>({ok:false,status:401,text:()=>{throw Error('Do not read provider error bodies')}}),async()=>new Response('{broken JSON'),async()=>new Response(JSON.stringify({error:{message:apiKey}}))]){
  let calls=0;await assert.rejects(researchGym(query,{apiKey,allowedEquipment:EQUIPMENT,now,fetcher:async(...args)=>{calls++;return failure(...args)}}),error=>error instanceof ProviderError&&!error.message.includes(apiKey)&&!JSON.stringify(error).includes(apiKey));assert.equal(calls,1);
 }
 let calls=0;await assert.rejects(researchGym(query,{apiKey:'',allowedEquipment:EQUIPMENT,fetcher:async()=>{calls++}}),error=>error.code==='provider_unavailable');assert.equal(calls,0);
});

test('response size is bounded by both advertised size and streamed bytes',async()=>{
 for(const response of [()=>new Response('{}',{headers:{'content-length':'131073'}}),()=>new Response(' '.repeat(131073)),()=>new Response('x'.repeat(101))]){
  const cap=response().headers.has('content-length')?131072:100;
  await assert.rejects(researchGym(query,{apiKey,allowedEquipment:EQUIPMENT,fetcher:async()=>response(),maxResponseBytes:cap}),error=>error instanceof ProviderError&&error.code==='response_too_large');
 }
});

test('timeouts cover fetch and slow response bodies even if a mock ignores the abort signal',async()=>{
 for(const fetcher of [async()=>new Promise(()=>{}),async()=>new Response(new ReadableStream({start(controller){controller.enqueue(new TextEncoder().encode('{'))}}))]){
  const before=Date.now();await assert.rejects(researchGym(query,{apiKey,allowedEquipment:EQUIPMENT,fetcher,timeoutMs:15}),error=>error instanceof ProviderError&&error.code==='provider_timeout'&&error.status===504);assert.ok(Date.now()-before<1000);
 }
});

test('caller cancellation makes no request when already aborted and interrupts pending research',async()=>{
 const early=new AbortController();early.abort();let calls=0;
 await assert.rejects(researchGym(query,{apiKey,allowedEquipment:EQUIPMENT,signal:early.signal,fetcher:async()=>{calls++}}),error=>error instanceof ProviderError&&error.code==='cancelled');assert.equal(calls,0);
 const controller=new AbortController();let forwarded;
 const work=researchGym(query,{apiKey,allowedEquipment:EQUIPMENT,signal:controller.signal,fetcher:async(_url,{signal})=>{forwarded=signal;return new Promise(()=>{})}});controller.abort();
 await assert.rejects(work,error=>error instanceof ProviderError&&error.code==='cancelled');assert.equal(forwarded.aborted,true);
});
