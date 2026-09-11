(()=>{
'use strict';
const JOURNEY_KEY='boost_naz_journey_v1';
const CLOUD_ID_KEY='boost_naz_cloud_journey_id';
const CLOUD_TOKEN_KEY='boost_naz_cloud_access_token';
const cfg=window.BOOST_CONFIG||{};
const $=id=>document.getElementById(id);
function readJourney(){try{return JSON.parse(localStorage.getItem(JOURNEY_KEY)||'{}')||{}}catch(_){return{}}}
function writeJourney(j){try{localStorage.setItem(JOURNEY_KEY,JSON.stringify(j))}catch(_){}return j}
function participantFromUser(user){
 const meta=user?.user_metadata||{};
 const name=[meta.first_name,meta.last_name].filter(Boolean).join(' ')||meta.full_name||'';
 return{name,email:user?.email||''};
}
function show(msg,ok){const el=$('saveMessage');if(!el)return;el.textContent=msg;el.style.color=ok===false?'#9f2f2f':''}
async function saveDirect(){
 const j=readJourney();
 if(j?.progress?.module2!=='complete')return{ok:false,reason:'module2-not-complete'};
 if(!cfg.supabaseUrl||!cfg.supabaseAnonKey||!window.supabase?.createClient)return{ok:false,reason:'cloud-not-configured'};
 const c=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 const {data:{session}}=await c.auth.getSession();
 if(session?.user){
   const p=participantFromUser(session.user);j.participant=j.participant||{};
   if(!j.participant.name&&p.name)j.participant.name=p.name;
   if(!j.participant.email&&p.email)j.participant.email=p.email.toLowerCase();
   j.region=j.region||'Northern Arizona';j.tracking=j.tracking||{};j.tracking.currentModule='module2';j.tracking.lastActivityAt=new Date().toISOString();writeJourney(j);
   const {data,error}=await c.rpc('boost_save_my_journey_for_region',{p_region:cfg.region||'Northern Arizona',p_journey:j});
   if(error)return{ok:false,error};
   if(data)localStorage.setItem(CLOUD_ID_KEY,String(data));
   return{ok:true,data,mode:'authenticated'};
 }
 const name=String(j?.participant?.name||'').trim(),email=String(j?.participant?.email||'').trim();
 if(!name&&!email)return{ok:false,reason:'identity-missing'};
 const id=localStorage.getItem(CLOUD_ID_KEY),token=localStorage.getItem(CLOUD_TOKEN_KEY);
 if(!id||!token)return{ok:false,reason:'resume-credentials-missing'};
 j.region=j.region||'Northern Arizona';j.tracking=j.tracking||{};j.tracking.currentModule='module2';j.tracking.lastActivityAt=new Date().toISOString();writeJourney(j);
 const {data,error}=await c.rpc('boost_save_journey',{p_journey_id:id,p_access_token:token,p_journey:j});
 if(error)return{ok:false,error};
 if(data&&String(data)!==id)localStorage.setItem(CLOUD_ID_KEY,String(data));
 return{ok:true,data,mode:'resume-token'};
}
async function confirmCloudSave(){
 const j=readJourney();if(j?.progress?.module2!=='complete')return;
 show('Saving Module 2 to BOOST…');
 try{if(window.BOOSTCloud?.flush)await window.BOOSTCloud.flush()}catch(_){}
 let result;
 try{result=await saveDirect()}catch(error){result={ok:false,error}}
 if(result?.ok){show('Module 2 complete — saved to BOOST cloud ✓',true);document.dispatchEvent(new CustomEvent('boostprogress',{detail:{moduleId:'module2',status:'complete'}}));return}
 const reason=result?.reason;
 if(reason==='identity-missing')show('Module 2 is saved on this device, but the participant sign-in is not active. Reopen Module 1 and sign in to sync the staff dashboard.',false);
 else if(reason==='resume-credentials-missing')show('Module 2 is saved on this device, but this browser does not have the BOOST resume credentials needed to sync it.',false);
 else show('Module 2 saved locally, but BOOST cloud did not confirm the save. Please stay on this page and try Save again.',false);
 if(result?.error)console.warn('Northern Module 2 cloud confirmation failed',result.error.message||result.error);
}
function install(){const btn=$('saveBtn');if(!btn||btn.dataset.cloudConfirm==='1')return;btn.dataset.cloudConfirm='1';btn.addEventListener('click',()=>setTimeout(confirmCloudSave,80));}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.NorthernBOOSTModule2CloudConfirm={saveDirect,confirmCloudSave};
})();