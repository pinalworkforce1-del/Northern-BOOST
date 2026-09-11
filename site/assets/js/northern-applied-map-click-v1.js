(()=>{
'use strict';
if(window.__NorthernBOOSTAppliedMapGateInstalled)return;
window.__NorthernBOOSTAppliedMapGateInstalled=true;
const JK='boost_naz_journey_v1',SK='northern_boost_career_exploration_v1',PATH='boost_naz_pathway_v1';
const VALID=new Set(['skilled_trades','advanced_manufacturing','healthcare','it','cdl','customer_service']);
const NAMES={skilled_trades:'Skilled Trades',advanced_manufacturing:'Advanced Manufacturing',healthcare:'Health Care',it:'Information Technology',cdl:'Transportation & Logistics',customer_service:'Customer Service'};
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'{}')||{}}catch(_){return{}}};
const soc=v=>String(v??'').replace(/\D/g,'').slice(0,6);
const norm=v=>String(v??'').toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
function merged(){const j=read(JK),s=read(SK);return{j,s,m:{...(s.module4||{}),...(j.module4||{})}}}
function module4Done(){const {j,m}=merged(),p=j.progress||{};return p.module4==='complete'||!!m.completedAt||!!((m.careerTarget||m.targetCareer||m.career)&&m.participantDirection&&m.answers)}
function findCareer(list,ref){const sk=soc(ref?.soc||ref),tk=norm(ref?.title);return (list||[]).find(x=>(sk&&soc(x?.soc||x?.socCode||x?.code)===sk)||(tk&&norm(x?.title)===tk))||null}
function recommended(){
  if(!module4Done())return null;
  const {j,s,m}=merged();
  const saved=m.appliedExperienceSelected||m.appliedExperienceRecommendation;
  if(saved?.key&&VALID.has(saved.key))return saved.key;
  const ref=m.careerTarget||m.targetCareer||m.career||m.boostSignal?.careerTarget||m.selection?.career||null;if(!ref)return null;
  const c=Object.assign({},findCareer(s?.module1?.selected,ref)||{},findCareer(j?.module1?.careers,ref)||{},findCareer(s?.module2?.careers,ref)||{},findCareer(j?.module2?.careers,ref)||{},ref||{});
  const code=soc(c.soc||ref.soc),major=code.slice(0,2),text=norm((c.sector||c.industry||c.cluster||'')+' '+(c.title||ref.title||''));
  if(['29','31'].includes(major)||/health care|healthcare|nurs|medical|clinical|pharmacy|dental|therapy|therapist|diagnostic|patient/.test(text))return'healthcare';
  if(major==='15'||/information technology|computer|software|cyber|network|help desk|database|web developer|systems analyst/.test(text))return'it';
  if(major==='53'||/transportation|logistics|cdl|truck|tractor trailer|commercial driver|delivery driver|freight|warehouse/.test(text))return'cdl';
  if(major==='51'||/advanced manufacturing|manufacturing|machin|cnc|production|fabricat|automation|mechatronic|quality control/.test(text))return'advanced_manufacturing';
  if(['47','49'].includes(major)||/skilled trade|construction|electrician|plumb|hvac|heating|air conditioning|weld|carpenter|mason|roofer|heavy equipment|utility|solar|maintenance repair|automotive/.test(text))return'skilled_trades';
  if(['41','43'].includes(major)||/customer service|retail|sales|hospitality|food service/.test(text))return'customer_service';
  return null;
}
function ensureStyle(){
  if(document.getElementById('boostAppliedMapGateStyle'))return;
  const s=document.createElement('style');s.id='boostAppliedMapGateStyle';
  s.textContent=`.stage .hot[data-applied]{pointer-events:auto!important;cursor:not-allowed!important}.stage .hot[data-applied].boostMatchedIndustry,.stage .hot[data-applied][data-recommended-industry="true"]{pointer-events:auto!important;cursor:pointer!important;z-index:40!important}`;
  document.head.appendChild(s);
}
function decorate(){
  ensureStyle();
  const rec=recommended();
  document.querySelectorAll('[data-applied]').forEach(el=>{
    const match=!!rec&&el.dataset.applied===rec;
    el.classList.toggle('boostMatchedIndustry',match);
    if(match){
      el.classList.remove('boostSeqLocked');
      el.dataset.recommendedIndustry='true';
      el.removeAttribute('aria-disabled');
      el.setAttribute('role','link');
      el.setAttribute('tabindex','0');
      el.style.setProperty('pointer-events','auto','important');
      el.style.setProperty('cursor','pointer','important');
      el.style.setProperty('z-index','40','important');
      el.setAttribute('aria-label',`${NAMES[rec]} — open your matched applied career experience`);
    }else if(module4Done()){
      el.removeAttribute('data-recommended-industry');
      el.setAttribute('aria-disabled','true');
      el.style.setProperty('pointer-events','auto','important');
      el.style.setProperty('cursor','not-allowed','important');
      el.style.removeProperty('z-index');
    }
  });
}
function explainLocked(el){
  const info=el.querySelector('.boostSeqInfo');if(info){info.click();return;}
  const rec=recommended();const msg=rec?`This experience is locked. Your Module 4 occupation connects to ${NAMES[rec]||'the highlighted industry experience'}.`:'Complete Module 4 to unlock the industry experience connected to your selected occupation.';
  try{window.showToast?.(msg)}catch(_){alert(msg)}
}
window.addEventListener('click',e=>{
  const el=e.target?.closest?.('[data-applied]');if(!el||!module4Done())return;
  const rec=recommended(),key=el.dataset.applied;
  e.preventDefault();e.stopImmediatePropagation();
  if(!rec||key!==rec){explainLocked(el);return;}
  const href=el.getAttribute('href');if(!href||href.startsWith('#'))return;
  localStorage.setItem(PATH,'career');
  location.assign(new URL(href,location.href).href);
},true);
window.addEventListener('keydown',e=>{
  if(e.key!=='Enter'&&e.key!==' ')return;
  const el=e.target?.closest?.('[data-applied]');if(!el||!module4Done())return;
  e.preventDefault();el.click();
},true);
function run(){decorate();setTimeout(decorate,100);setTimeout(decorate,500);setTimeout(decorate,1500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
window.addEventListener('pageshow',run);window.addEventListener('storage',run);setInterval(decorate,1000);
window.NorthernBOOSTAppliedMapGate={recommended,module4Done,decorate};
})();
