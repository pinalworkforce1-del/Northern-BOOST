(()=>{'use strict';
if(window.__NORTHERN_COACH_PREP_V1__)return;window.__NORTHERN_COACH_PREP_V1__=true;
const $=id=>document.getElementById(id),REGION='Northern Arizona';
const NAMES={R:'Realistic',I:'Investigative',A:'Artistic',S:'Social',E:'Enterprising',C:'Conventional'};
const safe=(v)=>String(v??'').trim(),list=(x)=>Array.isArray(x)?x.filter(Boolean):[];
let client=null,journey=null,user=null,ready=false;
const status=(msg,error=false)=>{$('loadStatus').textContent=msg;$('loadStatus').classList.toggle('error',error)};
const saveStatus=(msg,error=false)=>{$('saveStatus').textContent=msg;$('saveStatus').classList.toggle('error',error)};
function supa(){
 if(client)return client;
 const c=window.BOOST_CONFIG||{};
 if(!window.supabase?.createClient||!c.supabaseUrl||!c.supabaseAnonKey)throw Error('Northern secure sign-in is not available.');
 client=window.supabase.createClient(c.supabaseUrl,c.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 return client;
}
const moduleOne=j=>j?.module1||j?.modules?.module1||{};
function m1Complete(j){return j?.progress?.module1==='complete'}
function scores(j){const m=moduleOne(j);return [m.riasec,m.scores,m.interestScores,j?.onetScores].find(v=>v&&typeof v==='object'&&Object.keys(NAMES).some(k=>Number(v[k])>0))||{}}
function topics(){return [...document.querySelectorAll('#topics input:checked')].map(x=>x.value)}
function docs(){return [...document.querySelectorAll('#documents input:checked')].map(x=>x.value)}
function fillChecked(selector,values){const wanted=new Set(list(values));document.querySelectorAll(selector+' input').forEach(x=>x.checked=wanted.has(x.value))}
function render(j){
 const m=moduleOne(j),participant=j.participant||{},rs=scores(j);
 $('participantName').textContent=safe(participant.name||participant.fullName||user?.user_metadata?.full_name||user?.email||'Participant');
 const ranking=Object.keys(NAMES).filter(k=>Number(rs[k])>0).sort((a,b)=>Number(rs[b])-Number(rs[a]));
 $('interestSummary').textContent=ranking.length?ranking.slice(0,3).map(k=>NAMES[k]+' ('+rs[k]+')').join(' · '):'Discuss your saved O*NET results with your coach';
 const careers=list(m.careers?.length?m.careers:m.selected).slice(0,4);
 const box=$('careerList');box.replaceChildren();
 if(careers.length){
  for(const c of careers){
   const row=document.createElement('div');row.className='career';
   const label=document.createElement('b');label.textContent=safe(c.title||c.name||c.soc||'Career option');
   const detail=document.createElement('small');detail.textContent=[c.soc?'SOC '+c.soc:null,c.regionalOpportunityLabel||c.regional?.tier||null].filter(Boolean).join(' • ');
   row.append(label,detail);box.append(row);
  }
 }else box.textContent='Career selections were not found. Review the completed Discover report with your coach.';
 const drivers=m.mindmap?.drivers||{};
 const selectedDrivers=Object.entries(drivers).filter(([,value])=>value==='yes').map(([key])=>key.replace(/([a-z])([A-Z])/g,'$1 $2').replace(/[_-]/g,' '));
 const wrap=$('driverList');wrap.replaceChildren();
 if(selectedDrivers.length){for(const driver of selectedDrivers){const chip=document.createElement('span');chip.className='chip';chip.textContent=driver;wrap.append(chip)}}
 else wrap.textContent='Ask your coach about the work conditions and preferences you described in Discover.';
 const p=j.modules?.coachAppointmentPrep||{};
 fillChecked('#topics',p.discussionTopics);fillChecked('#documents',p.documentsReviewed);
 $('myQuestion').value=safe(p.participantQuestion||'');
 $('ack').checked=!!p.readyAt;
 if(p.readyAt){saveStatus('✓ Previously prepared on '+new Date(p.readyAt).toLocaleString()+'. You may update your topics and save again.');}
}
async function load(){
 const {data:{session},error:authErr}=await supa().auth.getSession();
 if(authErr)throw authErr;
 if(!session?.user){status('Please sign in to Northern BOOST 2.0 first, then reopen Coach Appointment Prep.',true);return}
 user=session.user;
 const result=await supa().rpc('boost_load_my_journey_for_region',{p_region:REGION});
 if(result.error)throw result.error;
 if(!result.data){status('No Northern BOOST journey was found for this account. Complete Discover first.',true);return}
 journey=result.data;
 if(!m1Complete(journey)){status('Coach Appointment Prep becomes available after Module 1 — Discover is completed. Your other pathway rules are unchanged.',true);return}
 render(journey);ready=true;$('mainContent').hidden=false;status('✓ Your Northern BOOST Discover results loaded securely. Prepare for your coach appointment below.');
}
async function save(){
 if(!ready||!journey||!user){saveStatus('Sign in and load completed Discover first.',true);return}
 if(!$('ack').checked){saveStatus('Please acknowledge that you reviewed your preparation before saving.',true);return}
 const topicsSelected=topics(),question=safe($('myQuestion').value);
 if(!topicsSelected.length){saveStatus('Select at least one topic you would like to discuss.',true);return}
 const payload={source:'northern_post_discover_coach_prep_v1',pathwayStage:'post_discover_pre_enrollment',acknowledged:true,discussionTopics:topicsSelected,documentsReviewed:docs(),participantQuestion:question,notes:'Preparation acknowledgment only. Attendance, eligibility, service selection, and enrollment require staff verification.'};
 const b=$('save');b.disabled=true;saveStatus('Saving your coach preparation to Northern BOOST…');
 try{
  const result=await supa().rpc('boost_northern_save_coach_prep',{p_prep:payload});
  if(result.error)throw result.error;
  if(!result.data?.readyAt)throw Error('The cloud did not return a confirmed preparation timestamp.');
  const verify=await supa().rpc('boost_load_my_journey_for_region',{p_region:REGION});
  if(verify.error)throw verify.error;
  const confirmed=verify.data?.modules?.coachAppointmentPrep;
  if(!confirmed||confirmed.readyAt!==result.data.readyAt||verify.data?.progress?.coachAppointmentPrep!=='complete')throw Error('Northern cloud did not confirm the saved preparation record.');
  journey=verify.data;
  saveStatus('✓ Supabase CONFIRMED: your coach preparation is saved. This does not mean an appointment occurred or that enrollment was completed.');
  window.setTimeout(()=>{window.location.assign(new URL('preview-v2/index.html',document.baseURI).toString())},550);
 }catch(err){saveStatus('Cloud save NOT confirmed: '+(err.message||'Unknown error')+'. Your existing Discover progress has not been changed. Retry the save.',true)}
 finally{b.disabled=false}
}
function init(){
 $('save').onclick=save;$('print').onclick=()=>window.print();
 load().catch(e=>status('Unable to load Northern BOOST: '+(e.message||'Please refresh and sign in again.'),true));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();