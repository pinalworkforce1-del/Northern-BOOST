(()=>{
'use strict';
const JK='boost_naz_journey_v1',SK='northern_boost_career_exploration_v1';
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'{}')||{}}catch(_){return{}}};
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const socKey=v=>{const d=String(v??'').replace(/\D/g,'');return d.length>=6?d.slice(0,6):d};
const titleKey=v=>String(v??'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const first=(...v)=>v.find(x=>x!==undefined&&x!==null&&String(x).trim()!=='');
const num=(...v)=>{for(const x of v){const n=Number(x);if(Number.isFinite(n))return n}return null};
function find(list,ref){const sk=socKey(ref?.soc||ref),tk=titleKey(ref?.title);return (list||[]).find(x=>(sk&&socKey(x?.soc||x?.socCode||x?.code)===sk)||(tk&&titleKey(x?.title)===tk))||null}
function validationFor(m2,ref){const sk=socKey(ref?.soc||ref),map=m2?.validationBySoc||{};for(const [k,v] of Object.entries(map)){if(socKey(k)===sk)return v||{}}return{}}
function data(c){
 const j=read(JK),s=read(SK),m1j=j.module1||{},m1s=s.module1||{},m2j=j.module2||{},m2s=s.module2||{},m3={...(s.module3||{}),...(j.module3||{})};
 const m1=find(m1s.selected,c)||find(m1j.careers,c)||{};
 const m2=find(m2s.careers,c)||find(m2j.careers,c)||{};
 const v={...validationFor(m2j,c),...validationFor(m2s,c),...(m2.validation||{})};
 const r=m1.regional||{};
 const intel=v.preparationIntel||m2.preparationIntel||m1.preparationIntel||null;
 const entry=v.entryWage||m2.entryWage||((num(m2.wage25,m1.wage25,r.p25Hourly)!=null)?{hourly:num(m2.wage25,m1.wage25,r.p25Hourly),annual:num(m2.wage25,m1.wage25,r.p25Hourly)*2080}:null);
 const align=m3.skillAlignmentBySoc?.[c?.soc]||m3.skillAlignmentBySoc?.[String(c?.soc||'')]||null;
 const strengths=(m3.selfAssessment||[]).filter(x=>/Used Regularly|Used Sometimes/i.test(String(x?.use||''))).map(x=>x.skill||x.name||x.activity).filter(Boolean);
 return{
  j,s,m1,m2,m3,v,intel,entry,align,strengths,
  wageFit:first(v.wages,m2.wagesInterpretation,m2.wages,'Not recorded in Module 2'),
  prep:first(v.prep,m2.preparationReadiness,m2.prep,'Not recorded in Module 2'),
  prepNote:first(v.prepNote,m2.prepNote,''),
  life:first(v.life,m2.lifeInterpretation,m2.life,'Not recorded in Module 2'),
  employer:first(v.employerSupport,m2.employerSupport,''),
  regionalLabel:first(m2.regionalOpportunityLabel,m1.regionalOpportunityLabel,r.tier,'Northern Arizona regional evidence'),
  jobs:num(m2.jobs,m1.jobs,r.jobs26),
  openings:num(m2.annualOpenings,m1.annualOpenings,r.annualOpenings)
 };
}
function money(n){return Number.isFinite(Number(n))?'$'+Number(n).toFixed(2):'Not available'}
function annual(n){return Number.isFinite(Number(n))?'$'+Math.round(Number(n)).toLocaleString():'Not available'}
function transferStory(x){if(x.align?.already!=null&&x.align?.total)return `${x.align.already} of ${x.align.total} high-use skill patterns already appear in your experience`;return x.strengths.length?`${x.strengths.length} transferable strength${x.strengths.length===1?'':'s'} identified in Module 3`:'Module 3 transferable-skill evidence carried forward'}
function verified(x){return String(x.employer||'').trim()==='Verified employer-supported development found'}
function current(){try{return typeof window.selectedCareer==='function'?window.selectedCareer():null}catch(_){return null}}
function rebuildCareerCards(){
 document.querySelectorAll('.career[data-soc]').forEach(card=>{
  const soc=card.dataset.soc,c={soc,title:card.querySelector('h3')?.textContent||''},x=data(c);
  const firstSmall=card.querySelector('small');if(firstSmall)firstSmall.textContent=soc;
  [...card.querySelectorAll('small')].slice(1).forEach(el=>el.remove());
  card.querySelectorAll('.badge.path').forEach(el=>el.remove());
  if(!card.querySelector('.badge.kept')){const b=document.createElement('span');b.className='badge kept';b.textContent='✓ Kept active in Module 3';card.insertBefore(b,card.firstChild)}
  const reg=card.querySelector('.badge.reg');if(reg)reg.textContent=x.regionalLabel;
  if(x.intel&&!card.querySelector('.badge.prepBadge')){const b=document.createElement('span');b.className='badge prepBadge';b.textContent=x.intel.label||'Preparation evidence';card.appendChild(b)}
 });
}
function rebuildEvidence(){
 const c=current();if(!c)return;const x=data(c),box=document.getElementById('evidence');if(!box)return;
 const cards=[
  ['TRANSFERABLE EXPERIENCE',transferStory(x),''],
  ['WAGE FIT',x.wageFit,''],
  ['PREPARATION READINESS',x.prep,'prep'],
  ['LIFE FIT',x.life,''],
  ['EMPLOYER-SUPPORTED ROUTE',verified(x)?'Verified employer-supported development found':'No verified route carried forward',''],
  ['REGIONAL OPPORTUNITY',x.jobs!=null?`${Number(x.jobs).toLocaleString()} jobs • ${Number(x.openings||0).toLocaleString()} annual openings`:x.regionalLabel,'']
 ];
 if(x.entry?.hourly!=null)cards.push(['POINT-OF-ENTRY WAGE',`${money(x.entry.hourly)}/hr • about ${annual(x.entry.annual)}/yr`,'prep']);
 box.innerHTML=cards.map(z=>`<div class="ev ${z[2]}"><small>${z[0]}</small><b>${esc(z[1])}</b></div>`).join('');
 const badges=document.getElementById('careerBadges');if(badges){badges.querySelectorAll('.badge.path').forEach(el=>el.remove());if(!badges.querySelector('.badge.kept'))badges.insertAdjacentHTML('afterbegin','<span class="badge kept">✓ Kept active in Module 3</span>')}
 const path=document.getElementById('pathStory');if(path)path.textContent='Your career remains active based on the evidence you chose to carry forward.';
 const note=document.getElementById('prepNote');
 if(note){
   if(x.intel){const qs=(x.intel.topQualifications||[]).slice(0,3);note.classList.remove('hidden');note.innerHTML=`<b>Preparation context BOOST is considering</b><br>${esc(x.intel.summary||x.intel.label||x.prep)}${x.prepNote?`<br><b>Your Reality Check note:</b> ${esc(x.prepNote)}`:''}${qs.length?`<div class="qualList">${qs.map(q=>`<span class="qual">${esc(q[0])}${q[1]!=null?' • '+esc(q[1])+'%':''}</span>`).join('')}</div>`:''}<small>Module 2 employer + preparation evidence</small>`}
   else if(x.prep!=='Not recorded in Module 2'||x.prepNote){note.classList.remove('hidden');note.innerHTML=`<b>Preparation context BOOST is considering</b><br>${esc(x.prep)}${x.prepNote?`<br>${esc(x.prepNote)}`:''}<br><small>Module 2 Reality Check evidence</small>`}
   else{note.classList.add('hidden');note.innerHTML=''}
 }
 const legacy=document.getElementById('legacyNote');if(legacy)legacy.classList.add('hidden');
}
function pinalQContext(id){const c=current()||{},x=data(c);if(id==='wagefit')return x.entry?`<strong>Point-of-entry estimate:</strong> ${money(x.entry.hourly)}/hr • about ${annual(x.entry.annual)}/yr at 40 hours/week. Module 2 wage fit: <strong>${esc(x.wageFit)}</strong>.`:'A point-of-entry wage estimate is not available.';if(id==='prepready')return x.intel?`<strong>Preparation evidence:</strong> ${esc(x.intel.label||x.prep)}. Module 2 readiness: <strong>${esc(x.prep)}</strong>.`:`Preparation readiness from Module 2: <strong>${esc(x.prep)}</strong>.`;if(id==='employer')return verified(x)?`<strong>Verified in Module 2:</strong> ${esc(x.employer)}. A BRIDGE route may be considered if a preparation gap exists.`:'<strong>No verified employer-supported route is carried forward.</strong> Your answer here cannot create BRIDGE evidence; verification must come from employer/apprenticeship/OJT evidence.';if(id==='lifefit')return`Module 2 life-fit evidence: <strong>${esc(x.life)}</strong>. Consider schedule, commute, childcare, physical demands, travel, and how quickly you need income.`;if(id==='confidence')return'Confidence should reflect the combined evidence above—wage, preparation, life fit, transferable experience, and any verified employer-supported route.';return''}
function refresh(){document.getElementById('boostNazM4Carry')?.remove();rebuildCareerCards();rebuildEvidence()}
function install(){
 window.qContext=pinalQContext;
 if(typeof window.renderSelected==='function'&&!window.__BOOST_NAZ_M4_PINAL_PARITY){const old=window.renderSelected;window.renderSelected=function(){old();setTimeout(refresh,0)};window.__BOOST_NAZ_M4_PINAL_PARITY=true}
 refresh();setTimeout(refresh,350);setTimeout(refresh,900);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.addEventListener('boost-cloud-status',()=>setTimeout(refresh,80));
window.__BOOST_NAZ_M4_PINAL_PARITY_FIX='20260910-v2';
})();
