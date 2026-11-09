// Northern BOOST 2.0 staging-only handoff. Runs on the legacy map AFTER its
// existing handlers; never changes normal production navigation.
(()=>{'use strict';
const KEY='boost_naz_preview_return_v1',NOTICE='boost_naz_preview_return_notice_v1',JK='boost_naz_journey_v1';
const TARGET=new URL('preview-v2/index.html',location.href);
if(!location.pathname.endsWith('/Northern-BOOST/')&&!location.pathname.endsWith('/Northern-BOOST/index.html'))return;
const raw=sessionStorage.getItem(KEY);if(!raw)return;
let marker;
try{marker=JSON.parse(raw)}catch(_){sessionStorage.removeItem(KEY);return}
if(marker?.version!==1||!['module1','module2','module3','module4','industry','skillmobility','jobsearch','financial','ai'].includes(marker.module)||!Number.isFinite(marker.startedAt)||Date.now()-marker.startedAt>2*60*60*1000){sessionStorage.removeItem(KEY);return}
const el=document.createElement('div');
el.id='boostV2ReturnGate';
el.style.cssText='position:fixed;bottom:20px;left:20px;z-index:2147483499;max-width:min(440px,calc(100vw - 40px));border:1px solid #7ab4d4;border-radius:16px;padding:13px 16px;background:#082a42;color:#fff;box-shadow:0 14px 45px #0008;font:13px/1.5 system-ui,sans-serif';
el.innerHTML='<b>Returning to BOOST 2.0</b><p id="boostV2ReturnText" style="margin:6px 0">Checking your saved module status…</p><a id="boostV2ReturnManual" href="'+TARGET.href+'" style="color:#ffdb8a;display:none;font-weight:800">Back to new dashboard →</a><button id="boostV2ReturnCancel" type="button" style="background:transparent;color:#fff;border:1px solid #ffffff66;padding:6px 10px;border-radius:7px;margin-left:12px">Stay on old map</button>';
document.body.appendChild(el);
el.querySelector('#boostV2ReturnCancel').onclick=()=>{sessionStorage.removeItem(KEY);el.remove()};
const info=el.querySelector('#boostV2ReturnText'),manual=el.querySelector('#boostV2ReturnManual');
const state=()=>{try{return JSON.parse(localStorage.getItem(JK)||'{}')||{}}catch(_){return {}}};
function done(j,id){
 const p=j.progress||{},m=j.modules||{};
 if(p[id]==='stale')return false;
 if(id==='module1')return p.module1==='complete';
 if(id==='module2')return p.module2==='complete'||!!j.module2?.careers?.length;
 if(id==='module3')return p.module3==='complete'||!!j.module3?.careers?.length;
 if(id==='module4')return p.module4==='complete'||!!(j.module4?.completedAt||m.module4?.completedAt);
 if(id==='industry')return Object.values(j.appliedModules||{}).some(x=>x?.completed===true)||Object.keys(p).some(k=>(k.startsWith('industry-')||['skilledTrades','advancedManufacturing','healthcare','it','cdl','customerService'].includes(k))&&p[k]==='complete');
 if(id==='financial')return p.financial==='complete';
 if(id==='ai')return p.ai==='complete'||p.careerAi==='complete'||!!(j.module5?.completedAt||m.module5?.completedAt);
 return p[id]==='complete';
}
const requiresNonce=['skillmobility','jobsearch','financial','ai'];
async function tryReturn(){
 // Let the existing map validate the completion nonce and write its authoritative
 // progress flag first. Never synthesize a success receipt from the preview marker.
 if(requiresNonce.includes(marker.module)){
  const pending=sessionStorage.getItem('boost_naz_completion_nonce:'+marker.module);
  if(marker.expectedNonce && pending===marker.expectedNonce) {
   info.textContent='Waiting for Northern BOOST to validate the saved activity…';
   return;
  }
 }
 const j=state();
 if(!done(j,marker.module)){
  info.textContent='No completed save was confirmed for this step. Finish and save the activity first, or return to the new dashboard without marking it complete.';
  manual.style.display='inline';
  return;
 }
 try{
  // Cloud sync must finish before leaving the authoritative map.
  if(window.BOOSTCloud?.flush)await Promise.race([window.BOOSTCloud.flush(),new Promise((_,reject)=>setTimeout(()=>reject(Error('Cloud save confirmation timed out')),7000))]);
  const cfg=window.BOOST_CONFIG||{},sup=window.supabase;
  if(!sup?.createClient||!cfg.supabaseUrl||!cfg.supabaseAnonKey)throw Error('Northern cloud service unavailable');
  const c=sup.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey);
  const auth=await c.auth.getSession();
  if(!auth.data?.session?.user)throw Error('Secure sign-in has expired');
  const result=await c.rpc('boost_load_my_journey_for_region',{p_region:cfg.region||'Northern Arizona'});
  if(result.error)throw result.error;
  if(!done(result.data||{},marker.module))throw Error('Cloud completion has not been confirmed');
  sessionStorage.setItem(NOTICE,JSON.stringify({module:marker.module,at:Date.now()}));
  sessionStorage.removeItem(KEY);
  location.replace(TARGET.toString());
 }catch(err){
  info.textContent='The module is saved locally, but cloud completion is not yet confirmed ('+(err.message||'unknown error')+'). Staying here to protect your progress.';
  manual.style.display='inline';
 }
}
let launched=false;
function start(){
 if(launched)return;launched=true;
 // Module controllers attach via deferred configuration scripts. Wait before verifying.
 setTimeout(tryReturn,950);
}
if(document.readyState==='complete')start();else window.addEventListener('load',start,{once:true});
})();