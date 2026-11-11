/* Northern Ready2Work cloud adapter: never accesses Pinal Ready2Work table. */
(()=>{
 'use strict';
 const ctx=window.NORTHERN_R2W;
 if(!ctx?.verified||!ctx.client||!ctx.userId)return;
 const KEY='boost-northern-r2w-v1',TABLE='boost_northern_ready2work_progress';
 const status=document.createElement('span');status.id='r2wSaveStatus';status.setAttribute('role','status');status.style.cssText='font:12px system-ui;color:#d9e8f2;margin-left:8px';
 document.querySelector('.top-actions')?.prepend(status);
 const say=s=>{status.textContent=s};
 const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||sessionStorage.getItem(KEY)||'null')}catch{return null}};
 const combine=(remote,local)=>{
  remote=remote&&typeof remote==='object'?remote:{};
  local=local&&typeof local==='object'?local:{};
  return {...remote,...local,
   sceneSelections:{...(remote.sceneSelections||{}),...(local.sceneSelections||{})},
   resumeBuilder:local.resumeBuilder?.complete?local.resumeBuilder:(remote.resumeBuilder?.complete?remote.resumeBuilder:(local.resumeBuilder||remote.resumeBuilder||{})),
   jacquelineInterview:remote.jacquelineInterview?.verifiedComplete?remote.jacquelineInterview:(local.jacquelineInterview||remote.jacquelineInterview||{})
  };
 };
 let ready=false,busy=false,queued=false,timer=0,last='';
 async function cloudRow(){
  const {data,error}=await ctx.client.from(TABLE).select('progress_json').eq('participant_id',ctx.userId).maybeSingle();
  if(error)throw error;return data?.progress_json||null;
 }
 function schedule(){queued=true;clearTimeout(timer);timer=setTimeout(flush,800)}
 async function flush(){
  if(!ready||busy||!queued)return;
  queued=false;busy=true;
  try{
   const remote=await cloudRow(),local=read();
   if(!local){say('No local changes');return}
   const merged=combine(remote,local),serialized=JSON.stringify(merged);
   if(serialized===last){say('Saved');return}
   const {error}=await ctx.client.from(TABLE).upsert({participant_id:ctx.userId,progress_json:merged,updated_at:new Date().toISOString()},{onConflict:'participant_id'});
   if(error)throw error;
   last=serialized;say('Saved to Northern BOOST cloud');
  }catch(e){queued=true;say('Northern cloud sync pending — saved on this device')}
  finally{busy=false;if(queued)timer=setTimeout(flush,4500)}
 }
 window.addEventListener('boost-r2w-saved',()=>{if(ready)schedule()});
 window.addEventListener('online',()=>{if(ready)schedule()});
 (async()=>{
  try{
   const remote=await cloudRow(),local=read();
   if(remote){
    const merged=combine(remote,local);
    if(JSON.stringify(merged)!==JSON.stringify(local)){
     try{localStorage.setItem(KEY,JSON.stringify(merged))}catch{sessionStorage.setItem(KEY,JSON.stringify(merged))}
     window.dispatchEvent(new CustomEvent('boost-r2w-cloud-restored',{detail:{progress:merged}}));
    }
   }
   ready=true;say('Northern BOOST cloud connected');
   if(local||remote)schedule();
  }catch(e){say('Northern cloud unavailable — saved on this device')}
 })();
})();