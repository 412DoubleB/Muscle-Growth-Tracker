// Optional body-only acceleration. The SVG skin remains the complete fallback.
import {BODY_SKIN_VERTICES,BODY_SKIN_TRIANGLES,bodySkinVertices} from './mascot-skin.mjs?v=8.2.0';
const states=new WeakMap();
const vertexSource=`attribute vec2 a_position;
attribute vec2 a_uv;
varying vec2 v_uv;
void main(){
 gl_Position=vec4(a_position.x/512.0-1.0,1.0-(a_position.y-784.0)/376.0,0.0,1.0);
 v_uv=a_uv;
}`;
const fragmentSource=`precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_atlas;
void main(){
 vec4 color=texture2D(u_atlas,v_uv);
 gl_FragColor=vec4(color.rgb,min(1.0,color.a*1.02));
}`;
const elements=lookup=>{
 if(typeof lookup!=='function')return {};
 try{return {canvas:lookup('rigSkinCanvas'),image:lookup('openingAtlas'),fallback:lookup('rigBodySkin'),surface:lookup('rigSkinSurface')}}catch{return {}}
};
const visible=(element,on)=>{
 if(!element)return;
 if(element.style)element.style.display=on?'':'none';
 element.setAttribute?.('display',on?'inline':'none');
};
const fallback=lookup=>{const e=elements(lookup);visible(e.surface,false);visible(e.fallback,true)};
const release=state=>{
 const gl=state.gl;if(!gl)return;
 for(const [kind,method]of [['buffers','deleteBuffer'],['textures','deleteTexture'],['programs','deleteProgram'],['shaders','deleteShader']]){
  for(const resource of state[kind]||[])try{gl[method](resource)}catch{}
  state[kind]=[];
 }
};
const detach=state=>{
 state.canvas.removeEventListener?.('webglcontextlost',state.onLost);
 state.canvas.removeEventListener?.('webglcontextrestored',state.onRestored);
};
const shader=(state,type,source)=>{
 const gl=state.gl,s=gl.createShader(type);if(!s)throw Error('Shader unavailable');
 state.shaders.push(s);gl.shaderSource(s,source);gl.compileShader(s);
 if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('Shader compilation failed');
 return s;
};
const buffer=(state,target,data,usage)=>{
 const gl=state.gl,b=gl.createBuffer();if(!b)throw Error('Buffer unavailable');
 state.buffers.push(b);gl.bindBuffer(target,b);gl.bufferData(target,data,usage);return b;
};
const initialize=(canvas,image,lookup)=>{
 const state={canvas,image,imageSource:image.currentSrc||image.src||'',lookup,gl:null,buffers:[],textures:[],programs:[],shaders:[],failed:false,lost:false};
 states.set(canvas,state);
 try{
  canvas.width=512;canvas.height=376;
  const gl=state.gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:false,depth:false,stencil:false,antialias:true});
  if(!gl)throw Error('WebGL unavailable');
  const vertex=shader(state,gl.VERTEX_SHADER,vertexSource),fragment=shader(state,gl.FRAGMENT_SHADER,fragmentSource);
  const program=gl.createProgram();if(!program)throw Error('Program unavailable');
  state.programs.push(program);state.program=program;
  gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Shader link failed');
  gl.useProgram(program);
  const position=gl.getAttribLocation(program,'a_position'),uv=gl.getAttribLocation(program,'a_uv');
  if(position<0||uv<0)throw Error('Attribute unavailable');
  state.positions=new Float32Array(BODY_SKIN_VERTICES.length*2);
  state.positionBuffer=buffer(state,gl.ARRAY_BUFFER,state.positions,gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  const texcoords=new Float32Array(BODY_SKIN_VERTICES.flatMap(p=>[p.x/1536,p.y/1024]));
  buffer(state,gl.ARRAY_BUFFER,texcoords,gl.STATIC_DRAW);gl.enableVertexAttribArray(uv);gl.vertexAttribPointer(uv,2,gl.FLOAT,false,0,0);
  state.indices=buffer(state,gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(BODY_SKIN_TRIANGLES.flat()),gl.STATIC_DRAW);
  const texture=gl.createTexture();if(!texture)throw Error('Texture unavailable');
  state.texture=texture;state.textures.push(texture);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);
  // Atlas UVs count downward from its top row. No upload flip is needed: the
  // vertex shader independently converts top-down world Y into NDC's upward Y.
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
  gl.uniform1i(gl.getUniformLocation(program,'u_atlas'),0);gl.disable(gl.DEPTH_TEST);gl.disable(gl.BLEND);
  state.onLost=event=>{event.preventDefault?.();state.lost=true;fallback(state.lookup)};
  state.onRestored=()=>{detach(state);release(state);states.delete(canvas);fallback(state.lookup)};
  canvas.addEventListener?.('webglcontextlost',state.onLost);
  canvas.addEventListener?.('webglcontextrestored',state.onRestored);
 }catch{state.failed=true;release(state);fallback(lookup)}
 return state;
};

/** Draw the shared skin mesh in one GPU draw. False leaves SVG rendering active.
 * No image is fetched: openingAtlas must already be loaded by the opening scene.
 */
export function renderMascotSkin(elementLookup,pose){
 const e=elements(elementLookup);
 if(!e.canvas||typeof e.canvas.getContext!=='function'||!e.surface||!e.fallback||!e.image?.complete||e.image.naturalWidth!==1536||e.image.naturalHeight!==1024){fallback(elementLookup);return false}
 let state=states.get(e.canvas);
 const source=e.image.currentSrc||e.image.src||'';
 if(state&&(state.image!==e.image||state.imageSource!==source)){disposeMascotSkin(elementLookup);state=null}
 state??=initialize(e.canvas,e.image,elementLookup);state.lookup=elementLookup;
 if(state.failed||state.lost){fallback(elementLookup);return false}
 try{
  const gl=state.gl;if(gl.isContextLost?.())throw Error('Context lost');
  const vertices=bodySkinVertices(pose);
  vertices.forEach((p,i)=>{if(!Number.isFinite(p.x)||!Number.isFinite(p.y))throw Error('Invalid body vertex');state.positions[i*2]=p.x;state.positions[i*2+1]=p.y});
  gl.viewport(0,0,512,376);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(state.program);
  gl.bindBuffer(gl.ARRAY_BUFFER,state.positionBuffer);gl.bufferSubData(gl.ARRAY_BUFFER,0,state.positions);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,state.texture);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,state.indices);
  gl.drawElements(gl.TRIANGLES,BODY_SKIN_TRIANGLES.length*3,gl.UNSIGNED_SHORT,0);
  if(gl.getError&&gl.getError()!==gl.NO_ERROR)throw Error('WebGL draw failed');
  visible(e.fallback,false);visible(e.surface,true);return true;
 }catch{state.failed=true;release(state);fallback(elementLookup);return false}
}

export function disposeMascotSkin(elementLookup){
 const e=elements(elementLookup),state=e.canvas&&states.get(e.canvas);
 if(state){detach(state);release(state);states.delete(e.canvas)}
 fallback(elementLookup);
}
