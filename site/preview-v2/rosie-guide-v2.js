(()=>{
'use strict';
if(window.__NORTHERN_ROSIE_STAGE_V2__)return;
window.__NORTHERN_ROSIE_STAGE_V2__=true;

const ENDPOINT='https://dxcajwarqojvmbteroco.supabase.co/functions/v1/boost-ask-rosie-northern-v173';
const JOURNEY_KEY='boost_naz_journey_v1';
const SHARED_KEY='northern_boost_career_exploration_v1';
const PORTAL_KEY='boost_naz_portal_progress_v1';
const PATH_KEY='boost_naz_pathway_v1';
const ROSIE_IMG='https://pinalworkforce1-del.github.io/BOOST_Pathway-Portal/assets/images/rosie-guide-panel.webp';
const ROSIE_FALLBACK=new URL('assets/images/rosie-master.webp',document.baseURI).href;
const ALIASES={
  'cna':['31-1131'],'certified nursing assistant':['31-1131'],'nursing assistant':['31-1131'],
  'registered nurse':['29-1141'],'rn':['29-1141'],'lpn':['29-2061'],'lvn':['29-2061'],'licensed practical nurse':['29-2061'],
  'medical assistant':['31-9092'],'pharmacy tech':['29-2052'],'pharmacy technician':['29-2052'],
  'welder':['51-4121'],'electrician':['47-2111'],'plumber':['47-2152'],'hvac':['49-9021'],
  'truck driver':['53-3032'],'cdl':['53-3032'],'help desk':['15-1232'],'it support':['15-1232'],
  'cybersecurity':['15-1212'],'cyber security':['15-1212'],'warehouse':['53-7062'],'forklift':['53-7062']
};
let OCCS_PROMISE=null,lastFocus=null,authClient=null,cloudJourney=null;
let history=[];

function read(key){try{return JSON.parse(localStorage.getItem(key)||'{}')||{}}catch(_){return{}}}
function norm(s){return String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').replace(/\b(roles?|jobs?|career|careers|occupation|occupations|position|positions)\b/g,' ').replace(/\s+/g,' ').trim()}
function pageLabel(){
 const path=location.pathname.toLowerCase();
 if(path.includes('/preview-v2/coach-appointment-prep'))return'Northern BOOST 2.0 — Coach Appointment Prep (after Discover, before enrollment)';
 if(path.includes('/preview-v2/discover'))return'Northern BOOST 2.0 — Discover: Career Mindmap and embedded 30-activity interest profiler';
 return'Northern BOOST 2.0 — Pathway dashboard (Career Exploration or Rapid Employment)';
}
function isMap(){return location.pathname.toLowerCase().includes('/preview-v2/index.html')||location.pathname.toLowerCase().endsWith('/preview-v2/')}
function eligiblePage(){return location.pathname.toLowerCase().includes('/preview-v2/')}

async function ensureMaster(){
  if(window.NORTHERN_OCC_MASTER?.load)return window.NORTHERN_OCC_MASTER.load();
  await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=new URL('assets/js/northern-occupation-master-v1.js?v=20261110rosie2',document.baseURI).href;s.onload=resolve;s.onerror=reject;document.head.appendChild(s)});
  if(!window.NORTHERN_OCC_MASTER?.load)throw new Error('Northern Arizona career evidence is unavailable.');
  return window.NORTHERN_OCC_MASTER.load();
}
async function loadOccupations(){
  if(OCCS_PROMISE)return OCCS_PROMISE;
  OCCS_PROMISE=(async()=>{const m=await ensureMaster();return(m.occupations||[]).map(o=>({
    soc:String(o.soc||''),title:o.title||'',jobsCurrent:o.jobs,jobsProjected:o.jobs2035,annualOpenings:o.annualOpenings,growthPct:o.growthPercent,
    p25Hourly:o.wage25,medianHourly:o.wageMedian,p75Hourly:o.wage75,education:o.typicalEntryEducation,experience:o.workExperienceRequired,
    ojt:o.typicalOnTheJobTraining,passesRecommendationGate:!!o.passesRecommendationGate,regionalOpportunityLabel:o.regionalOpportunityLabel||'',
    geography:'Apache, Coconino, Gila & Navajo Counties, Arizona'
  }))})();
  try{return await OCCS_PROMISE}catch(e){OCCS_PROMISE=null;throw e}
}

function rawJourney(){return cloudJourney||{}}
async function refreshCloudJourney(){
 const c=getAuthClient();if(!c)throw Error('Northern BOOST sign-in service is unavailable.');
 const {data,error}=await c.rpc('boost_load_my_journey_for_region',{p_region:'Northern Arizona'});
 if(error)throw Error('Could not load your Northern saved journey: '+error.message);
 cloudJourney=data&&typeof data==='object'?data:{};
 return cloudJourney;
}
function rawShared(){return {}}
function rawPortal(){return read(PORTAL_KEY)}
function currentWage(j,s){return j?.participant?.currentHourlyWage||j?.module2?.currentHourlyWage||j?.module2?.wageBaseline?.hourly||s?.module2?.currentHourlyWage||s?.module2?.wageBaseline?.hourly||j?.module3?.currentWage||s?.module3?.currentWage||null}
function sanitizedJourney(){
  const j=rawJourney(),s=rawShared(),p=rawPortal(),path=sessionStorage.getItem('northern_boost_v2_preview_pathway')||localStorage.getItem(PATH_KEY)||'';
  return{
    region:'Northern Arizona',
    participant:{name:j?.participant?.name||'',currentHourlyWage:currentWage(j,s)},
    progress:j.progress||{},
    appliedModules:j.appliedModules||{},
    sharedModules:j.sharedModules||{},
    portal:{
      pathway:path,
      map:p,
      career:{financialMarked:!!p?.career?.financial,aiMarked:!!p?.career?.ai},
      rapid:{skillMobilityMarked:!!p?.rapid?.skillmobility,jobSearchMarked:!!p?.rapid?.jobsearch,financialMarked:!!p?.rapid?.financial,aiMarked:!!p?.rapid?.ai},
      completionSource:'Northern BOOST authenticated regional cloud journey is authoritative. Browser pathway selection is a navigation preference, not proof of staff enrollment or appointment attendance.'
    },
    modules:{
      module1:j.module1||s.module1||{},
      module2:j.module2||s.module2||{},
      module3:j.module3||s.module3||{},
      module4:j.module4||s.module4||{},
      financial:j.modules?.financial||j.sharedModules?.financial||{},
      ai:j.modules?.ai||j.sharedModules?.ai||{},
      skillmobility:j.modules?.skillmobility||{},
      jobsearch:j.modules?.jobsearch||{},
       coachAppointmentPrep:{acknowledged:!!j.modules?.coachAppointmentPrep?.readyAt,readyAt:j.modules?.coachAppointmentPrep?.readyAt||null,discussionTopics:Array.isArray(j.modules?.coachAppointmentPrep?.discussionTopics)?j.modules.coachAppointmentPrep.discussionTopics.slice(0,8):[]}
    }
  };
}
function careerArrays(j,s){return[
  j?.module1?.careers,s?.module1?.selected,j?.module2?.careers,s?.module2?.careers,j?.module3?.careers,s?.module3?.careers,
  j?.module3?.activeCareers,s?.module3?.activeCareers
].filter(Array.isArray)}
function savedSocs(){const j=rawJourney(),s=rawShared(),out=new Set();for(const arr of careerArrays(j,s))for(const c of arr){const v=String(c?.soc||c?.SOC||'');if(v)out.add(v)}for(const v of[j?.module4?.selectedSoc,s?.module4?.selectedSoc,j?.module4?.soc,s?.module4?.soc,j?.module4?.careerTarget?.soc,s?.module4?.careerTarget?.soc])if(v)out.add(String(v));return out}
function findFocus(all,q){
  const nq=norm(q);
  for(const[alias,socs]of Object.entries(ALIASES))if(nq.includes(alias)){const hit=all.find(o=>socs.includes(o.soc));if(hit){lastFocus=hit;return hit}}
  let best=null,bestLen=0;
  for(const o of all){const t=norm(o.title);if(t.length>=5&&nq.includes(t)&&t.length>bestLen){best=o;bestLen=t.length}}
  if(!best&&/\b(it|that|this|those|these|there)\b/.test(nq)&&lastFocus)best=all.find(o=>o.soc===lastFocus.soc)||lastFocus;
  if(best)lastFocus=best;
  return best;
}
function groupMatch(o,q){const n=norm(q),p=o.soc.slice(0,2);if(/health|medical|nurs|clinical|patient|dental|pharmacy/.test(n))return['29','31'].includes(p);if(/manufactur|production|cnc|machin|fabricat/.test(n))return p==='51';if(/trade|construction|electric|plumb|hvac|weld|carpent|maintenance|repair/.test(n))return['47','49'].includes(p);if(/\bit\b|technology|computer|cyber|network|software|help desk/.test(n))return p==='15';if(/transport|logistic|truck|cdl|warehouse/.test(n))return p==='53';return false}
function relevantOccupations(all,q,focus){
  if(focus)return[focus];
  const saved=savedSocs(),chosen=all.filter(o=>saved.has(o.soc));
  const words=norm(q).split(' ').filter(w=>w.length>3&&!['what','which','about','northern','boost','does','have','with','from','that','this','would','could','should','want','know','tell','much'].includes(w));
  const scored=all.map(o=>{const hay=norm(o.title);let score=saved.has(o.soc)?80:0;if(groupMatch(o,q))score+=45;for(const w of words)if(hay.includes(w))score+=16;if(o.passesRecommendationGate)score+=3;score+=Math.min(5,Number(o.annualOpenings||0)/100);return{o,score}}).filter(x=>x.score>3).sort((a,b)=>b.score-a.score||Number(b.o.annualOpenings||0)-Number(a.o.annualOpenings||0)).map(x=>x.o);
  const out=[];for(const o of[...chosen,...scored])if(!out.some(x=>x.soc===o.soc))out.push(o);return out.slice(0,18)
}

function getAuthClient(){
  if(authClient)return authClient;
  const cfg=window.BOOST_CONFIG||{};
  if(!window.supabase?.createClient||!cfg.supabaseUrl||!cfg.supabaseAnonKey)return null;
  authClient=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
  return authClient;
}
async function accessToken(){const c=getAuthClient();if(!c)return null;const{data}=await c.auth.getSession();return data?.session?.access_token||null}

function addStyles(){if(document.getElementById('northernAskRosieStyle'))return;const s=document.createElement('style');s.id='northernAskRosieStyle';s.textContent=`
#northernAskRosieLaunch{position:fixed;right:18px;bottom:${isMap()?'18px':'92px'};z-index:2147483200;border:2px solid #e4a72b;border-radius:999px;background:#123a5c;color:#fff;padding:9px 15px 9px 9px;display:flex;align-items:center;gap:9px;font:900 14px/1 system-ui,-apple-system,Segoe UI,sans-serif;box-shadow:0 12px 34px #0006;cursor:pointer}#northernAskRosieLaunch:hover,#northernAskRosieLaunch:focus-visible{outline:3px solid #f4c85c55;transform:translateY(-1px)}#northernAskRosieLaunch img{width:40px;height:40px;border-radius:50%;object-fit:cover;object-position:50% 18%;border:2px solid #fff;background:#e8f1f5}
#northernAskRosiePanel{position:fixed;right:18px;bottom:18px;z-index:2147483300;width:min(440px,calc(100vw - 24px));height:min(710px,calc(100vh - 36px));display:none;grid-template-rows:auto 1fr auto;background:#f7fafb;border:1px solid #bfcfd9;border-radius:20px;overflow:hidden;box-shadow:0 24px 80px #0008;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#17324d}#northernAskRosiePanel.open{display:grid}
.narHead{background:linear-gradient(135deg,#102d49,#1f587f);color:#fff;padding:13px 14px;display:flex;gap:11px;align-items:center;border-bottom:3px solid #e4a72b}.narHead img{width:52px;height:52px;border-radius:13px;object-fit:cover;object-position:50% 18%;border:2px solid #ffffffaa}.narHeadText{min-width:0;flex:1}.narHeadText b{display:block;font-size:17px}.narHeadText span{display:block;margin-top:2px;font-size:11px;color:#d8e7f1}.narClose{border:1px solid #ffffff55;background:#ffffff12;color:#fff;width:34px;height:34px;border-radius:50%;font-size:20px;cursor:pointer}
.narBody{overflow:auto;padding:14px;background:linear-gradient(#f7fafb,#eef4f7)}.narWelcome{font-size:12px;line-height:1.5;color:#526875;margin-bottom:10px;padding:11px 12px;background:#fff;border:1px solid #d8e3e9;border-radius:12px}.narWelcome b{color:#173f60}.narMsg{max-width:89%;margin:8px 0;padding:10px 12px;border-radius:14px;font-size:13px;line-height:1.5;white-space:pre-wrap}.narMsg.user{margin-left:auto;background:#173f60;color:#fff;border-bottom-right-radius:5px}.narMsg.rosie{background:#fff;color:#243e52;border:1px solid #d4e0e7;border-bottom-left-radius:5px}.narMsg.system{max-width:100%;background:#fff8df;color:#665018;border:1px solid #ead28a}.narEvidence{margin-top:8px;font-size:10px;color:#72838e}.narStarters{display:flex;gap:7px;flex-wrap:wrap;margin:10px 0 4px}.narChip{border:1px solid #b9ccd7;background:#fff;color:#174b70;border-radius:999px;padding:7px 9px;font-size:11px;font-weight:800;cursor:pointer}.narChip:hover{background:#edf5f8}.narFoot{padding:11px;background:#fff;border-top:1px solid #d2dee5}.narForm{display:grid;grid-template-columns:1fr auto;gap:8px}.narForm textarea{resize:none;min-height:48px;max-height:110px;border:1px solid #b6c9d5;border-radius:12px;padding:10px 11px;font:13px/1.4 system-ui;background:#fbfdfe;color:#17324d}.narSend{border:0;border-radius:12px;background:#0d3152;color:#fff;padding:0 14px;font-weight:900;cursor:pointer}.narSend:disabled{opacity:.55;cursor:wait}.narHint{margin-top:6px;font-size:10px;line-height:1.35;color:#71828e}.narThinking{display:flex;align-items:center;gap:8px}.narThinkingText{font-size:12px;color:#536d7d;font-weight:750}.narTyping{display:inline-flex;gap:4px}.narTyping i{width:5px;height:5px;background:#78909d;border-radius:50%;animation:narDot .8s infinite alternate}.narTyping i:nth-child(2){animation-delay:.16s}.narTyping i:nth-child(3){animation-delay:.32s}@keyframes narDot{to{opacity:.25;transform:translateY(-2px)}}
@media(max-width:600px){#northernAskRosieLaunch{right:12px;bottom:${isMap()?'12px':'82px'}}#northernAskRosiePanel{right:6px;bottom:6px;width:calc(100vw - 12px);height:calc(100vh - 12px);border-radius:16px}}
`;document.head.appendChild(s)}
function addMsg(body,kind,text,evidence){const d=document.createElement('div');d.className='narMsg '+kind;d.textContent=text;if(evidence){const e=document.createElement('div');e.className='narEvidence';e.textContent=evidence;d.appendChild(e)}body.appendChild(d);body.scrollTop=body.scrollHeight;return d}
function thinking(body){const d=document.createElement('div');d.className='narMsg rosie narThinking';d.innerHTML='<span class="narTyping"><i></i><i></i><i></i></span><span class="narThinkingText">Rosie is checking your Northern BOOST journey…</span>';body.appendChild(d);body.scrollTop=body.scrollHeight;const text=d.querySelector('.narThinkingText'),steps=['Rosie is checking your Northern BOOST journey…','Looking at Northern Arizona career evidence…','Checking approved evidence…','Putting it together…'];let i=0;const timer=setInterval(()=>{i=(i+1)%steps.length;text.textContent=steps[i]},560);return{el:d,stop(){clearInterval(timer)}}}
function pushHistory(role,text){history.push({role,text:String(text).slice(0,2200)});if(history.length>10)history.splice(0,history.length-10)}

async function ask(question,body,send){
  addMsg(body,'user',question);pushHistory('user',question);send.disabled=true;
  const t=thinking(body),started=Date.now();
  try{
    const token=await accessToken();if(!token){t.stop();t.el.remove();addMsg(body,'system','Please sign in to Northern BOOST 2.0 so Rosie can use your saved progress.');return}const all=await loadOccupations();
    if(!token){t.stop();t.el.remove();addMsg(body,'system','Rosie needs a secure Northern BOOST sign-in to access saved progress. Sign in on the BOOST 2.0 dashboard, then return to Ask Rosie.');return}
    try{await refreshCloudJourney()}catch(e){t.stop();t.el.remove();addMsg(body,'system','Rosie could not securely load your Northern BOOST saved progress. No participant data was changed. Please try again. '+e.message);return}
 const focus=findFocus(all,question),items=relevantOccupations(all,question,focus);
    const response=await fetch(ENDPOINT,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({question,journey:sanitizedJourney(),focusOccupation:focus,occupations:items,history:history.slice(-10),page:pageLabel()})});
    const out=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(out?.error||`Rosie could not complete that question (${response.status}).`);
    const wait=Math.max(0,900-(Date.now()-started));if(wait)await new Promise(r=>setTimeout(r,wait));
    t.stop();t.el.remove();
    const evidence=[out.onet_live?`O*NET ${out.onet_version||'approved snapshot'}`:null,out.etpl_live?`Arizona ETPL ${out.etpl_version||'approved snapshot'}`:null,focus?'Northern Arizona LMI':null].filter(Boolean).join(' • ');
    addMsg(body,'rosie',out.answer||'I could not assemble an evidence-grounded answer from the available Northern BOOST sources.',evidence||'Northern BOOST controlled evidence');
    pushHistory('assistant',out.answer||'');
  }catch(e){t.stop();t.el.remove();addMsg(body,'system',e?.message||'Rosie could not complete that question. Please try again.')}finally{send.disabled=false}
}

function build(){
  if(!eligiblePage()||document.getElementById('northernAskRosieLaunch'))return;
  addStyles();
  const launch=document.createElement('button');launch.id='northernAskRosieLaunch';launch.type='button';launch.innerHTML=`<img src="${ROSIE_IMG}" alt=""><span>Ask Rosie</span>`;document.body.appendChild(launch);
  const panel=document.createElement('section');panel.id='northernAskRosiePanel';panel.setAttribute('aria-label','Ask Rosie — Northern BOOST Career Coach');panel.innerHTML=`<div class="narHead"><img src="${ROSIE_IMG}" alt="Rosie"><div class="narHeadText"><b>Ask Rosie</b><span>Northern Arizona Career Guide • your results and next steps</span></div><button class="narClose" type="button" aria-label="Close Ask Rosie">×</button></div><div class="narBody"><div class="narWelcome"><b>Hi — I’m Rosie.</b> Ask me a normal question about your BOOST results, Northern Arizona jobs and wages, career mobility, training, or what your evidence means. The Northern Recommendation Gate controls what BOOST proactively surfaces — it never tells you what you are allowed to explore.</div><div class="narStarters"><button class="narChip" type="button">Why am I seeing my careers?</button><button class="narChip" type="button">Compare my saved careers</button><button class="narChip" type="button">What careers pay more than my current wage?</button><button class="narChip" type="button">What training options are approved?</button><button class="narChip" type="button">Explain my Module 4 direction</button></div></div><div class="narFoot"><div class="narForm"><textarea aria-label="Ask Rosie a question" placeholder="Ask Rosie about your career evidence…"></textarea><button class="narSend" type="button">Send</button></div><div class="narHint">Rosie uses your Northern BOOST journey, Northern Arizona labor-market evidence, approved O*NET evidence, approved Arizona ETPL data, and your Northern BOOST map progress. Eligibility and funding decisions stay with your Career Coach.</div></div>`;document.body.appendChild(panel);
  const body=panel.querySelector('.narBody'),input=panel.querySelector('textarea'),send=panel.querySelector('.narSend');
   const stage=pageLabel();
   const intro=panel.querySelector('.narWelcome');
   intro.textContent=stage.includes('Coach Appointment Prep')
     ? 'Hi, I’m Rosie. I can help you review your saved Discover interests, dream-work preferences, and career choices before your Northern Arizona Career Coach appointment. No sensitive documents or personal circumstances need to be entered here.'
     : stage.includes('embedded')
       ? 'Hi, I’m Rosie. Start with the Career Mindmap and then explore the 30-activity BOOST Mini Interest Profiler. I can help explain your results, career ideas, and Northern Arizona opportunities without choosing a career for you.'
       : 'Hi, I’m Rosie. Ask me about your saved Northern BOOST progress, your interests, and what comes next. I’ll use your authenticated Northern journey and regional career evidence to support the conversation.';
   const suggestions=stage.includes('Coach Appointment Prep')
     ? ['What do my O*NET scores suggest about my interests?','How do my work preferences relate to the careers I chose?','What should I ask my Career Coach?','Which documents should I gather for my appointment?']
     : stage.includes('embedded')
       ? ['What is the BOOST 30-activity Mini Interest Profiler?','How do my work drivers relate to my O*NET interests?','Why did BOOST suggest these careers?','What do Northern Arizona opportunity labels mean?']
       : ['What is my next step in Northern BOOST?','When is my first Career Coach meeting?','Compare the occupations I am exploring','What happens after I finish my BOOST pathway?'];
   const suggested=panel.querySelector('.narStarters');suggested.replaceChildren();
   for(const question of suggestions){const button=document.createElement('button');button.type='button';button.className='narChip';button.textContent=question;suggested.append(button)}
   for(const img of [launch.querySelector('img'),panel.querySelector('.narHead img')]){
     img?.addEventListener('error',()=>{if(img.src!==ROSIE_FALLBACK)img.src=ROSIE_FALLBACK},{once:true});
   }
   const polish=document.createElement('style');
   polish.textContent='#northernAskRosiePanel .narWelcome{border-left:4px solid #dfb25e}#northernAskRosiePanel .narChip{background:#edf5f9;border-color:#c3d8e4;text-align:left;white-space:normal}#northernAskRosiePanel .narHeadText span{line-height:1.35}';
   document.head.append(polish);
  function open(){panel.classList.add('open');launch.style.display='none';setTimeout(()=>input.focus(),30)}
   function close(){panel.classList.remove('open');launch.style.display='flex';launch.focus()}
   window.NorthernRosieV2={open(prompt){open();if(prompt){input.value=String(prompt).slice(0,1300);input.focus()}}};
   document.addEventListener('click',e=>{const button=e.target.closest('[data-northern-rosie-question]');if(!button)return;e.preventDefault();window.NorthernRosieV2.open(button.dataset.northernRosieQuestion||'')});
   function go(){const q=input.value.trim();if(!q||send.disabled)return;input.value='';ask(q,body,send)}
  launch.addEventListener('click',open);panel.querySelector('.narClose').addEventListener('click',close);send.addEventListener('click',go);input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();go()}});panel.querySelectorAll('.narChip').forEach(b=>b.addEventListener('click',()=>{input.value=b.textContent||'';go()}));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&panel.classList.contains('open'))close()});
  loadOccupations().catch(e=>console.warn('Northern Ask Rosie LMI preload failed',e));
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build,{once:true});else build();
})();