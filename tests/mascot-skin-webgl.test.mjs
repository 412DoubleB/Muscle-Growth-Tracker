import test from 'node:test';
import assert from 'node:assert/strict';
import {mascotPose} from '../mascot-motion.mjs';
import {BODY_SKIN_VERTICES,bodySkinVertices} from '../mascot-skin.mjs';
import {renderMascotSkin,disposeMascotSkin} from '../mascot-skin-webgl.mjs';
function fixture({missingContext=false,compile=true}={}){
 const calls=[],listeners=new Map();let id=0;
 const gl={calls,NO_ERROR:0};
 for(const key of ['VERTEX_SHADER','FRAGMENT_SHADER','COMPILE_STATUS','LINK_STATUS','ARRAY_BUFFER','DYNAMIC_DRAW','STATIC_DRAW','FLOAT','ELEMENT_ARRAY_BUFFER','TEXTURE0','TEXTURE_2D','UNPACK_FLIP_Y_WEBGL','UNPACK_PREMULTIPLY_ALPHA_WEBGL','TEXTURE_WRAP_S','TEXTURE_WRAP_T','CLAMP_TO_EDGE','TEXTURE_MIN_FILTER','TEXTURE_MAG_FILTER','LINEAR','RGBA','UNSIGNED_BYTE','DEPTH_TEST','BLEND','COLOR_BUFFER_BIT','TRIANGLES','UNSIGNED_SHORT'])gl[key]=++id;
 for(const name of ['shaderSource','compileShader','attachShader','linkProgram','useProgram','bindBuffer','enableVertexAttribArray','vertexAttribPointer','activeTexture','bindTexture','pixelStorei','texParameteri','texImage2D','uniform1i','disable','viewport','clearColor','clear','drawElements','deleteBuffer','deleteTexture','deleteProgram','deleteShader'])gl[name]=(...args)=>calls.push({name,args});
 for(const name of ['createShader','createProgram','createBuffer','createTexture'])gl[name]=()=>({id:++id});
 gl.getShaderParameter=()=>compile;gl.getProgramParameter=()=>true;gl.getAttribLocation=(_,name)=>name==='a_position'?0:1;gl.getUniformLocation=()=>({id:++id});gl.getError=()=>0;gl.isContextLost=()=>false;
 gl.bufferData=(target,data,usage)=>calls.push({name:'bufferData',args:[target,Array.from(data),usage]});
 gl.bufferSubData=(target,offset,data)=>calls.push({name:'bufferSubData',args:[target,offset,Array.from(data)]});
 const node=()=>({style:{},setAttribute(name,value){this[name]=value}});
 const nodes={rigSkinCanvas:{...node(),getContext:(...args)=>{calls.push({name:'getContext',args});return missingContext?null:gl},addEventListener:(name,handler)=>listeners.set(name,handler),removeEventListener:(name,handler)=>{if(listeners.get(name)===handler)listeners.delete(name)}},openingAtlas:{complete:true,naturalWidth:1536,naturalHeight:1024,src:'./artwork/greek-wall-ball-reconstructed.png'},rigBodySkin:node(),rigSkinSurface:node()};
 return {gl,calls,listeners,nodes,lookup:id=>nodes[id]};
}

test('body uses one indexed GPU draw per frame, shared vertices and top-down atlas UVs; uploads image only once',()=>{
 const f=fixture();assert.equal(renderMascotSkin(f.lookup,mascotPose(0)),true);assert.equal(renderMascotSkin(f.lookup,mascotPose(750)),true);
 assert.equal(f.nodes.rigSkinCanvas.width,512);assert.equal(f.nodes.rigSkinCanvas.height,376);
 assert.deepEqual(f.calls.find(c=>c.name==='getContext').args,['webgl',{alpha:true,premultipliedAlpha:false,depth:false,stencil:false,antialias:true}]);
 assert.equal(f.calls.filter(c=>c.name==='texImage2D').length,1);assert.equal(f.calls.filter(c=>c.name==='drawElements').length,2);
 assert.deepEqual(f.calls.find(c=>c.name==='drawElements').args,[f.gl.TRIANGLES,720,f.gl.UNSIGNED_SHORT,0]);
 const buffers=f.calls.filter(c=>c.name==='bufferData');assert.deepEqual(buffers.map(c=>c.args[1].length),[286,286,720]);
 const uv=buffers[1].args[1];assert.ok(Math.abs(uv[0]-110/1536)<1e-7);assert.ok(Math.abs(uv[1]-280/1024)<1e-7);
 assert.ok(f.calls.some(c=>c.name==='pixelStorei'&&c.args[0]===f.gl.UNPACK_FLIP_Y_WEBGL&&c.args[1]===false));
 assert.ok(f.calls.some(c=>c.name==='pixelStorei'&&c.args[0]===f.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL&&c.args[1]===false));
 assert.equal(f.nodes.rigBodySkin.style.display,'none');assert.equal(f.nodes.rigSkinSurface.style.display,'');
 const positions=f.calls.filter(c=>c.name==='bufferSubData').at(-1).args[2],posed=bodySkinVertices(mascotPose(750));
 posed.forEach((p,i)=>{assert.ok(Math.abs(positions[i*2]-p.x)<.0001);assert.ok(Math.abs(positions[i*2+1]-p.y)<.0001)});
 BODY_SKIN_VERTICES.forEach((p,i)=>{if(p.y>=490){assert.ok(Math.abs(positions[i*2]-(p.x*2.8-230))<.0001);assert.ok(Math.abs(positions[i*2+1]-p.y*2.8)<.0001)}});
 const vertexShader=f.calls.find(c=>c.name==='shaderSource'&&c.args[1].includes('gl_Position')).args[1];assert.match(vertexShader,/a_position\.x\/512\.0-1\.0/);assert.match(vertexShader,/1\.0-\(a_position\.y-784\.0\)\/376\.0/);
 const fragment=f.calls.find(c=>c.name==='shaderSource'&&c.args[1].includes('gl_FragColor')).args[1];assert.match(fragment,/min\(1\.0,color\.a\*1\.02\)/);
 disposeMascotSkin(f.lookup);
});

test('missing image/context, shader failure or draw failure keeps SVG visible and never exposes an empty surface',()=>{
 assert.equal(renderMascotSkin(()=>null,mascotPose(0)),false);
 for(const options of [{missingContext:true},{compile:false}]){const f=fixture(options);assert.equal(renderMascotSkin(f.lookup,mascotPose(0)),false);assert.equal(f.nodes.rigBodySkin.style.display,'');assert.equal(f.nodes.rigSkinSurface.style.display,'none');assert.equal(f.calls.filter(c=>c.name==='drawElements').length,0);disposeMascotSkin(f.lookup)}
 const notLoaded=fixture();notLoaded.nodes.openingAtlas.complete=false;assert.equal(renderMascotSkin(notLoaded.lookup,mascotPose(0)),false);assert.equal(notLoaded.calls.length,0);
 const badDraw=fixture();badDraw.gl.drawElements=()=>{throw Error('lost')};assert.equal(renderMascotSkin(badDraw.lookup,mascotPose(0)),false);assert.equal(badDraw.nodes.rigBodySkin.style.display,'');assert.equal(badDraw.nodes.rigSkinSurface.style.display,'none');disposeMascotSkin(badDraw.lookup);
});

test('context loss restores SVG immediately; restoration/replay creates fresh resources and dispose removes every listener/resource',()=>{
 const f=fixture();assert.equal(renderMascotSkin(f.lookup,mascotPose(0)),true);assert.equal(f.listeners.size,2);
 let prevented=false;f.listeners.get('webglcontextlost')({preventDefault(){prevented=true}});assert.equal(prevented,true);assert.equal(f.nodes.rigBodySkin.style.display,'');assert.equal(f.nodes.rigSkinSurface.style.display,'none');assert.equal(renderMascotSkin(f.lookup,mascotPose(20)),false);
 f.listeners.get('webglcontextrestored')();assert.equal(f.listeners.size,0);assert.equal(renderMascotSkin(f.lookup,mascotPose(100)),true);assert.equal(f.calls.filter(c=>c.name==='texImage2D').length,2);
 disposeMascotSkin(f.lookup);assert.equal(f.listeners.size,0);assert.equal(f.nodes.rigSkinSurface.style.display,'none');
 assert.equal(f.calls.filter(c=>c.name==='deleteBuffer').length,6);assert.equal(f.calls.filter(c=>c.name==='deleteTexture').length,2);assert.equal(f.calls.filter(c=>c.name==='deleteProgram').length,2);assert.equal(f.calls.filter(c=>c.name==='deleteShader').length,4);
 assert.equal(renderMascotSkin(f.lookup,mascotPose(0)),true);assert.equal(f.calls.filter(c=>c.name==='texImage2D').length,3);disposeMascotSkin(f.lookup);
});
