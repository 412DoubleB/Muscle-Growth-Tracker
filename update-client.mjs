// Standalone recovery entry: no imports, storage deletion, sign-out or unregister.
const button=document.getElementById('loadLatest'),status=document.getElementById('status');
const next=new URL('./',location.href);next.searchParams.set('release','8.1.2');next.hash='recipes';
button.addEventListener('click',async()=>{
 button.disabled=true;status.textContent='Checking the latest app files…';
 if('serviceWorker'in navigator)try{
  const reg=await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});
  await reg.update();
  if(reg.installing)await new Promise(resolve=>{const worker=reg.installing;const done=()=>{if(['installed','activated','redundant'].includes(worker.state))resolve()};worker.addEventListener('statechange',done);done();setTimeout(resolve,6000)});
  if(reg.waiting){status.textContent='Applying the update. Your saved records stay in place…';const changed=new Promise(resolve=>{navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true});setTimeout(resolve,4000)});reg.waiting.postMessage('activate-update');await changed;}
 }catch{status.textContent='Opening fresh app files. Offline installation can be retried in Settings.'}
 location.replace(next.href);
});
