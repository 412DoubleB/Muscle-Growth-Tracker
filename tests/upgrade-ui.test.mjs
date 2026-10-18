import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {VERSION} from '../core.mjs';

const originalTimeout=globalThis.setTimeout,originalInterval=globalThis.setInterval;
function environment(raw){
 const elements=new Map(),listeners=new Map(),rows=new Map([['MGT28v6',raw]]);let confirms=0;
 class Element{constructor(id){Object.assign(this,{id,innerHTML:'',textContent:'',value:'',open:false,dataset:{},listeners:{},classList:{add(){},remove(){}}})}addEventListener(k,f){this.listeners[k]=f}showModal(){this.open=true}close(){this.open=false}focus(){}click(){}}
 globalThis.document={getElementById:id=>{if(!elements.has(id))elements.set(id,new Element(id));return elements.get(id)},activeElement:{tagName:'BODY'},hidden:false,addEventListener:(k,fn)=>{const list=listeners.get(k)||[];list.push(fn);listeners.set(k,list)},querySelector:()=>null,querySelectorAll:()=>[],createElement:()=>new Element('new')};
 globalThis.localStorage={getItem:key=>rows.get(key)??null,setItem:(key,value)=>rows.set(key,String(value)),removeItem:()=>{throw Error('Startup must not remove data')}};globalThis.sessionStorage={getItem:()=>null,setItem(){},removeItem(){}};
 globalThis.window={addEventListener(){},scrollTo(){}};Object.defineProperty(globalThis,'navigator',{value:{onLine:true,vibrate(){}},configurable:true});globalThis.location={origin:'https://412doubleb.github.io',pathname:'/Muscle-Growth-Tracker/',href:'https://412doubleb.github.io/Muscle-Growth-Tracker/',hash:'',search:''};globalThis.history={replaceState(){}};globalThis.confirm=()=>{confirms++;throw Error('Migration must not depend on a dismissed confirmation dialog')};globalThis.setInterval=()=>0;globalThis.setTimeout=()=>0;
 globalThis.fetch=async path=>({ok:true,json:async()=>JSON.parse(await fs.readFile(new URL('../'+path.replace(/^\.\//,''),import.meta.url),'utf8'))});
 return {elements,listeners,rows,confirms:()=>confirms,restore(){globalThis.setTimeout=originalTimeout;globalThis.setInterval=originalInterval}};
}

test('real application startup copies old device history before its first normal save and keeps the GitHub Auth path',async()=>{
 const raw=JSON.stringify({logs:{'0-0':{actualDate:'2026-10-01',planIndex:0,gym:'Crunch Pleasant Hills',completed:true,ex:[{name:'Flat DB press',range:'8-10',sets:[{w:50,r:10,i:2}]}]}},gyms:[{name:'Crunch Pleasant Hills',inventory:['Dumbbells','Bench']}],profile:{units:'lb'}}),env=environment(raw);
 try{await import('../app.mjs?upgrade=success');const saved=JSON.parse(env.rows.get('MGT_BETA_V8:guest'));assert.equal(saved.logs['2026-10-01'].exercises[0].sets[0].w,50);assert.equal(saved.logs['2026-10-01'].status,'completed');assert.equal(saved.legacySnapshots.length,1);assert.equal(env.rows.get('MGT28v6'),raw);assert.equal(env.confirms(),0);assert.match(env.elements.get('app').innerHTML,/previous workout history has been copied/);assert.equal(env.elements.get('appVersion').textContent,VERSION);
 for(const fn of env.listeners.get('click'))fn({target:{closest:()=>({dataset:{action:'view',view:'settings'}})},preventDefault(){}});assert.ok(env.elements.get('app').innerHTML.includes('https://412doubleb.github.io/Muscle-Growth-Tracker/'));
 }finally{env.restore()}
});
test('startup parsing failure exposes original-backup recovery and does not write an empty replacement database',async()=>{
 const env=environment('{broken previous data');try{await import('../app.mjs?upgrade=invalid');assert.equal(env.rows.get('MGT_BETA_V8:guest'),undefined);assert.equal(env.rows.get('MGT28v6'),'{broken previous data');assert.match(env.elements.get('app').innerHTML,/Export original backup/);assert.match(env.elements.get('app').innerHTML,/original records are still intact/);assert.equal(env.confirms(),0)}finally{env.restore()}
});
