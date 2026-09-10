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
const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const socKey=v=>{const d=String(v??'').replace(/\D/g,'');return d.length>=6?d.slice(0,6):d};
const norm=v=>String(v??'').toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
function find(list,ref){const sk=socKey(ref?.soc||ref),tk=norm(ref?.title);return (list||[]).find(x=>(sk&&socKey(x?.soc||x?.socCode||x?.code)===sk)||(tk&&norm(x?.title)===tk))||null}
function careerEvidence(ref){
  const j=read(JK),s=read(SK);
  const lists=[s?.module1?.selected,j?.module1?.careers,s?.module2?.careers,j?.module2?.careers];
  for(const list of lists){const hit=find(list,ref);if(hit)return hit}
  return ref||{};
}
function keyFor(ref){
  const c=careerEvidence(ref),sector=norm(c?.sector||c?.industry||c?.cluster),title=norm(c?.title||ref?.title),soc=socKey(c?.soc||ref?.soc),major=soc.slice(0,2);
  const text=(sector+' '+title).trim();
  if(/health care|healthcare|nurs|medical|clinical|pharmacy|dental|therapy|therapist|diagnostic|patient/.test(text)||['29','31'].includes(major))return'healthcare';
  if(/information technology|\bit\b|computer|software|cyber|network|help desk|data base|database|web developer|systems analyst/.test(text)||major==='15')return'it';
  if(/transportation|logistics|cdl|truck|tractor trailer|commercial driver|delivery driver|freight|warehouse/.test(text)||major==='53')return'cdl';
  if(/advanced manufacturing|manufacturing|machin|cnc|production|fabricat|industrial engineering|quality control|automation|mechatronic/.test(text)||major==='51')return'advanced_manufacturing';
  if(/skilled trade|construction|electrician|plumb|hvac|heating|air conditioning|weld|carpenter|mason|roofer|heavy equipment|utility|solar|maintenance repair|automotive/.test(text)||['47','49'].includes(major))return'skilled_trades';
  if(/customer service|retail|sales|hospitality|food service/.test(text)||['41','43'].includes(major))return'customer_service';
  return null;
}
function persistRecommendation(){
  const j=read(JK),m4=j.module4||{},complete=j?.progress?.module4==='complete'||!!m4.completedAt;
  if(!complete)return null;
  const ref=m4.careerTarget||m4.targetCareer||m4.career||null;if(!ref)return null;
  const key=keyFor(ref);if(!key)return null;
  const evidence=careerEvidence(ref);
  const rec={key,label:LABELS[key],soc:String(ref.soc||evidence.soc||''),title:ref.title||evidence.title||'',source:'Module 4 active career',updatedAt:new Date().toISOString()};
  j.module4={...m4,appliedExperienceRecommendation:rec};j.updatedAt=new Date().toISOString();write(JK,j);
  const s=read(SK);s.module4={...(s.module4||{}),appliedExperienceRecommendation:rec};s.updatedAt=new Date().toISOString();write(SK,s);
  return rec;
}
function installModule4(){
  const save=()=>{const r=persistRecommendation();if(r){try{window.BOOSTCloud?.flush?.()}catch(_){}}};
  const wire=()=>{
    const decide=document.getElementById('decide');
    if(decide&&!decide.dataset.industryRec){decide.dataset.industryRec='1';decide.addEventListener('click',()=>setTimeout(save,0))}
    ['nativeFinish','finishFromModule'].forEach(id=>{const b=document.getElementById(id);if(b&&!b.dataset.industryRec){b.dataset.industryRec='1';b.addEventListener('click',save,true)}});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire,{once:true});else wire();
  setTimeout(wire,500);setTimeout(save,800);
}
function installMap(){
  if(!document.getElementById('boostNazNoCurrentMarker')){
    const st=document.createElement('style');st.id='boostNazNoCurrentMarker';
    st.textContent='.hot.current{outline-color:transparent!important;box-shadow:none!important}.hot.current:after{content:none!important;display:none!important}.hot[data-core="module1"].current:after{content:none!important;display:none!important}';
    document.head.appendChild(st);
  }
  const refresh=()=>{
    const rec=persistRecommendation();
    document.querySelectorAll('.hot.current').forEach(el=>el.classList.remove('current'));
    document.querySelectorAll('[data-applied]').forEach(el=>{
      const on=!!rec&&el.dataset.applied===rec.key;
      el.classList.toggle('rec',on);
      if(on){
        el.setAttribute('aria-label',`${rec.label} — recommended applied career experience after Module 4`);
        const tip=el.querySelector('.tip');if(tip)tip.textContent=`${rec.label} — Recommended after Module 4`;
      }
    });
    const choice=document.querySelector('[data-industry-choice] .tip');
    if(choice&&rec)choice.textContent=`Recommended next: ${rec.label}`;
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh,{once:true});else refresh();
  window.addEventListener('pageshow',refresh);window.addEventListener('storage',refresh);window.addEventListener('boost-cloud-status',()=>setTimeout(refresh,50));
  setTimeout(refresh,300);setTimeout(refresh,1000);
}
const file=(location.pathname.split('/').pop()||'index.html').toLowerCase();
if(file.includes('module4_'))installModule4();else if(!file||file==='index.html')installMap();
window.NorthernBOOSTIndustryRecommendation={persistRecommendation,keyFor};
})();
