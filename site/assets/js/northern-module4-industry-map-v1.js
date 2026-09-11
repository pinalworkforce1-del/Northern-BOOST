(()=>{
'use strict';
const JK='boost_naz_journey_v1',SK='northern_boost_career_exploration_v1';
const LABELS={
  skilled_trades:'Skilled Trades',
  advanced_manufacturing:'Advanced Manufacturing',
  healthcare:'Health Care',
  it:'Information Technology',
  cdl:'CDL / Transportation',
  customer_service:'Customer Service'
};
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'{}')||{}}catch(_){return{}}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}};
const socKey=v=>{const d=String(v??'').replace(/\D/g,'');return d.length>=6?d.slice(0,6):d};
const norm=v=>String(v??'').toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
function find(list,ref){const sk=socKey(ref?.soc||ref),tk=norm(ref?.title);return (list||[]).find(x=>(sk&&socKey(x?.soc||x?.socCode||x?.code)===sk)||(tk&&norm(x?.title)===tk))||null}
function module4(j,s){return{...(s?.module4||{}),...(j?.module4||{})}}
function explicitDone(j,s,id){
  const p=j?.progress||{};
  if(p[id]==='complete')return true;
  if(id==='module1')return !!(j?.module1?.completedAt||s?.module1?.completedAt);
  if(id==='module2')return !!(j?.module2?.completedAt||s?.module2?.completedAt);
  if(id==='module3')return !!(j?.module3?.finalizedAt||s?.module3?.finalizedAt||j?.module3?.completionReady||s?.module3?.completionReady);
  if(id==='module4'){const m=module4(j,s);return !!(m?.completedAt||((m?.careerTarget||m?.targetCareer||m?.career)&&m?.participantDirection&&m?.answers));}
  return false;
}
function reconciledCompletion(j,s){
  const d={module4:explicitDone(j,s,'module4'),module3:explicitDone(j,s,'module3'),module2:explicitDone(j,s,'module2'),module1:explicitDone(j,s,'module1')};
  if(d.module4){d.module3=true;d.module2=true;d.module1=true}
  else if(d.module3){d.module2=true;d.module1=true}
  else if(d.module2){d.module1=true}
  return d;
}
function syncCompletion(){
  const j=read(JK),s=read(SK),d=reconciledCompletion(j,s);j.progress=j.progress||{};let changed=false;
  for(const id of ['module1','module2','module3','module4'])if(d[id]&&j.progress[id]!=='complete'){j.progress[id]='complete';changed=true}
  if(changed){j.region=j.region||'Northern Arizona';j.updatedAt=new Date().toISOString();save(JK,j)}
  return{j:changed?read(JK):j,s,d};
}
function careerEvidence(ref,j,s){
  const lists=[s?.module1?.selected,j?.module1?.careers,s?.module2?.careers,j?.module2?.careers,s?.module3?.careers,j?.module3?.careers];
  const hits=lists.map(list=>find(list,ref)).filter(Boolean);
  return Object.assign({},...hits,ref||{});
}
function keyFor(ref,j,s){
  if(!ref)return null;
  const c=careerEvidence(ref,j,s),sector=norm(c?.sector||c?.industry||c?.cluster),title=norm(c?.title||ref?.title),soc=socKey(c?.soc||ref?.soc),major=soc.slice(0,2),text=(sector+' '+title).trim();
  if(/health care|healthcare|nurs|medical|clinical|pharmacy|dental|therapy|therapist|diagnostic|patient/.test(text)||['29','31'].includes(major))return'healthcare';
  if(/information technology|\bit\b|computer|software|cyber|network|help desk|database|web developer|systems analyst/.test(text)||major==='15')return'it';
  if(/transportation|logistics|cdl|truck|tractor trailer|commercial driver|delivery driver|freight|warehouse/.test(text)||major==='53')return'cdl';
  if(/advanced manufacturing|manufacturing|machin|cnc|production|fabricat|industrial engineering|quality control|automation|mechatronic/.test(text)||major==='51')return'advanced_manufacturing';
  if(/skilled trade|construction|electrician|plumb|hvac|heating|air conditioning|weld|carpenter|mason|roofer|heavy equipment|utility|solar|maintenance repair|automotive/.test(text)||['47','49'].includes(major))return'skilled_trades';
  if(/customer service|retail|sales|hospitality|food service/.test(text)||['41','43'].includes(major))return'customer_service';
  return null;
}
function targetFromModule4(m4){return m4?.careerTarget||m4?.targetCareer||m4?.career||m4?.boostSignal?.careerTarget||m4?.selection?.career||null}
function recommendation(){
  const {j,s,d}=syncCompletion();if(!d.module4)return null;
  const m4=module4(j,s),existing=m4?.appliedExperienceSelected||m4?.appliedExperienceRecommendation||null;
  if(existing?.key&&LABELS[existing.key])return existing;
  const ref=targetFromModule4(m4);if(!ref)return null;
  const key=keyFor(ref,j,s);if(!key)return null;
  const evidence=careerEvidence(ref,j,s);
  return{key,label:LABELS[key],soc:String(ref?.soc||evidence?.soc||''),title:ref?.title||evidence?.title||'',source:'Module 4 active career',updatedAt:new Date().toISOString()};
}
function persistRecommendation(){
  const rec=recommendation();if(!rec)return null;
  const j=read(JK),s=read(SK);let jc=false,sc=false;
  if(j?.module4?.appliedExperienceRecommendation?.key!==rec.key){j.module4={...(j.module4||{}),appliedExperienceRecommendation:rec};j.region=j.region||'Northern Arizona';j.updatedAt=new Date().toISOString();jc=true}
  if(s?.module4?.appliedExperienceRecommendation?.key!==rec.key){s.module4={...(s.module4||{}),appliedExperienceRecommendation:rec};s.region=s.region||'Northern Arizona';s.updatedAt=new Date().toISOString();sc=true}
  if(jc)save(JK,j);if(sc)save(SK,s);return rec;
}
function ensureMapStyle(){
  if(document.getElementById('boostNazMapCompletionRecStyle'))return;
  const st=document.createElement('style');st.id='boostNazMapCompletionRecStyle';
  st.textContent=`
    .hot.current{outline-color:transparent!important;box-shadow:none!important}.hot.current:after{content:none!important;display:none!important}
    .hot[data-applied].rec{outline:4px solid #ffd65e!important;box-shadow:0 0 0 6px rgba(255,214,94,.28),0 8px 28px rgba(0,0,0,.34)!important;background:rgba(255,227,139,.12)!important;pointer-events:auto!important;cursor:pointer!important;z-index:8!important;animation:boostRecommendedGlow 1.65s ease-in-out infinite}
    .hot[data-applied].rec .rec{display:none!important}
    .hot[data-applied].rec .boostSeqInfo{display:none!important}
    @keyframes boostRecommendedGlow{0%,100%{outline-color:#ffd65e;box-shadow:0 0 0 5px rgba(255,214,94,.24),0 8px 28px rgba(0,0,0,.34)}50%{outline-color:#fff3a9;box-shadow:0 0 0 12px rgba(255,214,94,.50),0 0 34px rgba(255,205,65,.72),0 8px 28px rgba(0,0,0,.34)}}
    .boostIndustryArrow{position:absolute;left:0;top:50%;transform:translate(-38%,-50%);z-index:30;width:50px;height:50px;border-radius:50%;display:grid;place-items:center;background:#e4a72b;color:#10243a;border:3px solid #fff;box-shadow:0 5px 16px rgba(0,0,0,.38);font:1000 31px/1 Arial,sans-serif;pointer-events:none}
    .boostIndustryNext{position:absolute;right:6px;top:6px;z-index:31;padding:5px 9px;border-radius:999px;background:#10243a;color:#fff;border:2px solid #ffd65e;box-shadow:0 4px 12px rgba(0,0,0,.34);font:900 10px/1.15 Inter,Arial,sans-serif;letter-spacing:.06em;text-transform:uppercase;pointer-events:none}
    @media(max-width:760px){.boostIndustryArrow{width:40px;height:40px;font-size:25px;border-width:2px}.boostIndustryNext{font-size:8px;padding:4px 6px}}
    @media(prefers-reduced-motion:reduce){.hot[data-applied].rec{animation:none!important}}
  `;
  document.head.appendChild(st);
}
function applyMap(){
  ensureMapStyle();const {d}=syncCompletion();const rec=persistRecommendation();
  document.querySelectorAll('.hot.current').forEach(el=>el.classList.remove('current'));
  document.querySelectorAll('[data-core]').forEach(el=>{const id=el.dataset.core;if(d[id])el.classList.add('done')});
  document.querySelectorAll('[data-applied]').forEach(el=>{
    const on=!!rec&&el.dataset.applied===rec.key;
    el.classList.toggle('rec',on);
    el.classList.toggle('boostSeqLocked',!on&&el.classList.contains('boostSeqLocked'));
    el.querySelectorAll('.boostIndustryArrow,.boostIndustryNext').forEach(a=>a.remove());
    if(on){
      el.classList.remove('boostSeqLocked');
      el.removeAttribute('aria-disabled');
      el.style.pointerEvents='auto';
      const arrow=document.createElement('span');arrow.className='boostIndustryArrow';arrow.textContent='→';arrow.setAttribute('aria-hidden','true');el.appendChild(arrow);
      const next=document.createElement('span');next.className='boostIndustryNext';next.textContent='Next';next.setAttribute('aria-hidden','true');el.appendChild(next);
      el.setAttribute('aria-label',`${rec.label} — recommended next career exploration based on your Module 4 career choice`);
      const tip=el.querySelector('.tip');if(tip)tip.textContent=`Next: Open ${rec.label} Career Exploration`;
    }
  });
  const choice=document.querySelector('[data-industry-choice] .tip');if(choice)choice.textContent=rec?`Recommended next: ${rec.label}`:'Choose Your Applied Career Experience';
  window.__BOOST_NAZ_MAP_RECONCILED={completion:d,recommendation:rec};
}
function installModule4(){
  const saveRec=()=>setTimeout(()=>{const r=persistRecommendation();if(r){try{window.BOOSTCloud?.flush?.()}catch(_){}}},0);
  const wire=()=>{['decide','nativeFinish','finishFromModule'].forEach(id=>{const b=document.getElementById(id);if(b&&!b.dataset.industryRecV3){b.dataset.industryRecV3='1';b.addEventListener('click',saveRec,true)}})};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire,{once:true});else wire();setTimeout(wire,500);setTimeout(saveRec,800);
}
function installMap(){
  const run=()=>{applyMap();setTimeout(applyMap,80)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  // Pinal-parity safeguard: the recommended industry is immediately open after Decide.
  window.addEventListener('click',e=>{
    const el=e.target?.closest?.('[data-applied].rec');if(!el)return;
    const href=el.getAttribute('href');if(!href)return;
    e.preventDefault();e.stopImmediatePropagation();
    localStorage.setItem('boost_naz_pathway_v1','career');
    location.assign(href);
  },true);
  window.addEventListener('pageshow',()=>setTimeout(run,0));window.addEventListener('storage',run);window.addEventListener('boost-cloud-status',()=>setTimeout(run,80));
  setTimeout(run,350);setTimeout(run,1100);setTimeout(run,2200);
}
const file=(location.pathname.split('/').pop()||'index.html').toLowerCase();
if(file.includes('module4_'))installModule4();else if(!file||file==='index.html')installMap();
window.NorthernBOOSTIndustryRecommendation={persistRecommendation,keyFor,applyMap,syncCompletion};
})();
