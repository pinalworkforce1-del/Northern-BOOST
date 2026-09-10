(()=>{
'use strict';
const JOURNEY_KEY='boost_naz_journey_v1';
const SHARED_KEY='northern_boost_career_exploration_v1';
const LABELS={R:'Realistic',I:'Investigative',A:'Artistic',S:'Social',E:'Enterprising',C:'Conventional'};
const read=key=>{try{return JSON.parse(localStorage.getItem(key)||'{}')||{}}catch(_){return{}}};
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const socKey=v=>{const d=String(v??'').replace(/\D/g,'');return d.length>=6?d.slice(0,6):d};
const titleKey=v=>String(v??'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const first=(...v)=>v.find(x=>x!==undefined&&x!==null&&String(x).trim()!=='');
const number=(...v)=>{for(const x of v){const n=Number(x);if(Number.isFinite(n))return n}return null};
function find(list,ref){const sk=socKey(ref?.soc||ref),tk=titleKey(ref?.title);return (list||[]).find(x=>(sk&&socKey(x?.soc||x?.socCode||x?.code)===sk)||(tk&&titleKey(x?.title)===tk))||null}
function validationFor(module2,ref){const map=module2?.validationBySoc||{},sk=socKey(ref?.soc||ref);for(const [k,v] of Object.entries(map)){if(socKey(k)===sk)return v||{}}return{}}
function sources(){const j=read(JOURNEY_KEY),s=read(SHARED_KEY);return{j,s,m1j:j.module1||{},m1s:s.module1||{},m2j:j.module2||{},m2s:s.module2||{},m3:{...(s.module3||{}),...(j.module3||{})}}}
function richSupport(c){
 const x=sources();
 const a=find(x.m1s.selected,c)||find(x.m1j.careers,c)||{};
 const b=find(x.m2s.careers,c)||find(x.m2j.careers,c)||{};
 const v={...validationFor(x.m2j,c),...validationFor(x.m2s,c),...(b.validation||{})};
 const r=a.regional||{};
 const self=(x.m3.selfAssessment||[]).filter(z=>/Used Regularly|Used Sometimes/i.test(String(z?.use||'')));
 const decision=first(c?.decision,x.m3.careerDecisionsBySoc?.[c?.soc],x.m3.careerDecisionsBySoc?.[String(c?.soc||'')]);
 const mobility=decision==='keep'?'Kept active in Career Mobility':decision==='pause'?'Paused in Career Mobility':decision==='work_now_lane'?'Work-Now exploration':'Career Mobility reviewed';
 const prepIntel=first(b.preparationIntel,v.preparationIntel,a.preparationIntel,a.preparation);
 let typicalEducation=first(c?.typicalEducation,a.typicalEducation,a.education,prepIntel?.baseline?.education,prepIntel?.education);
 const employer=first(b.employerSupport,v.employerSupport,b.employerSupportedDevelopment,b.developmentEvidence,b.employerSupportedRoute,v.employerSupportedRoute);
 return{
   m1:a,m2:b,validation:v,
   skill:null,
   skillStory:self.length?`${self.length} transferable strength${self.length===1?'':'s'} identified from your current/recent work`:'Transferable-skill evidence completed in Module 3',
   strengthCount:self.length,
   interest:number(c?.interestAlignment,a.personalAlignment,a.interestAlignment),
   mobility,
   regional:first(c?.regionalOpportunityLabel,b.regionalOpportunityLabel,a.regionalOpportunityLabel,r.tier,'Northern Arizona regional evidence'),
   education:typicalEducation,
   prepText:first(b.preparationReadiness,v.prep,b.prep,b.preparationReadiness),
   jobs:number(b.jobs,a.jobs,r.jobs26,a.employment),
   openings:number(b.annualOpenings,a.annualOpenings,r.annualOpenings,a.openings),
   growth:number(b.growthPercent,a.growthPercent,r.growthPct,a.growth),
   wage25:number(b.wage25,a.wage25,r.p25Hourly),
   median:number(b.wageMedian,a.wageMedian,r.medianHourly,a.medianWage),
   wage75:number(b.wage75,a.wage75,r.p75Hourly),
   jobsText:first(b.jobsInterpretation,v.jobs,b.jobs),
   wagesText:first(b.wagesInterpretation,v.wages,b.wageInterpretation,b.wageFit),
   lifeText:first(b.lifeInterpretation,v.life,b.lifeFit),
   futureText:first(b.futureDirection,b.futureInterpretation,b.future,v.future),
   employer,
   employerNote:first(v.employerSupportNote,b.employerSupportNote),
   jobsNote:first(v.jobsNote,b.jobsNote),
   lifeNote:first(v.lifeNote,b.lifeNote),
   postedWage:first(v.postedWage,b.postedWage),
   researchLocation:first(v.researchLocation,b.researchLocation),
   selfAssessment:x.m3.selfAssessment||[],
   workPreferences:x.m3.workPreferences||x.m3.skillLab?.workPreferences||[]
 };
}
function installEvidenceBridge(){
 if(typeof window.support!=='function'||typeof window.renderSelected!=='function')return false;
 window.support=richSupport;
 window.m3Strengths=function(){const x=sources().m3;return (x.selfAssessment||[]).filter(z=>/Used Regularly|Used Sometimes/i.test(String(z?.use||''))).map(z=>z.skill||z.name).filter(Boolean).slice(0,8)};
 window.qContext=function(id){
   const c=typeof window.selectedCareer==='function'?(window.selectedCareer()||{}):{};
   const s=richSupport(c);
   const bridge=typeof window.verifiedEmployerBridge==='function'?window.verifiedEmployerBridge(c):false;
   if(id==='wagefit'){const parts=[];if(s.wagesText)parts.push(`Your Reality Check: ${s.wagesText}`);if(s.postedWage)parts.push(`Posted wage you recorded: ${s.postedWage}`);if(s.wage25!=null)parts.push(`Northern point-of-entry estimate: $${Number(s.wage25).toFixed(2)}/hr`);return `<strong>Wage evidence:</strong> ${esc(parts.join(' • ')||'Wage evidence is available in your Reality Check record')}.`}
   if(id==='prepready'){const parts=[];if(s.prepText)parts.push(`Your Reality Check: ${s.prepText}`);if(s.education)parts.push(`Typical preparation: ${s.education}`);return `<strong>Preparation evidence:</strong> ${esc(parts.join(' • ')||'Review the preparation evidence with your Career Coach')}.`}
   if(id==='employer'){if(bridge)return `<strong>Employer-supported development carried forward:</strong> ${esc(String(s.employer))}${s.employerNote?` • ${esc(s.employerNote)}`:''}.`;return `<strong>Reality Check employer-supported route:</strong> ${esc(s.employer||'No verified route recorded')}${s.employerNote?` • ${esc(s.employerNote)}`:''}.`}
   if(id==='lifefit')return `<strong>Module 2 life-fit evidence:</strong> ${esc(s.lifeText||'No response recorded')}${s.lifeNote?` • ${esc(s.lifeNote)}`:''}.`;
   if(id==='confidence'){const parts=[s.regional,s.jobsText?`JOBS: ${s.jobsText}`:'',s.futureText?`FUTURE: ${s.futureText}`:'',s.skillStory].filter(Boolean);return `Consider the combined evidence: ${esc(parts.join(' • '))}.`}
   return'';
 };
 const original=window.renderSelected;
 window.renderSelected=function(){
   original();
   try{
     const c=typeof window.selectedCareer==='function'?window.selectedCareer():null;if(!c)return;
     const s=richSupport(c);
     document.querySelectorAll('#evidence .ev').forEach(card=>{
       const label=card.querySelector('small')?.textContent?.trim();const value=card.querySelector('b');if(!value)return;
       if(label==='TRANSFERABLE EXPERIENCE')value.textContent=s.skillStory;
       if(label==='PREPARATION'){const p=[s.prepText?s.prepText:null,s.education?`Typical entry: ${s.education}`:null].filter(Boolean).join(' • ');if(p)value.textContent=p}
       if(label==='EMPLOYER-SUPPORTED DEVELOPMENT'&&s.employer){value.textContent=String(s.employer)+(s.employerNote?` • ${s.employerNote}`:'')}
     });
     const legacy=document.getElementById('legacyNote');if(legacy)legacy.classList.add('hidden');
   }catch(e){console.warn('Northern Module 4 evidence display refresh failed',e)}
 };
 window.__BOOST_NAZ_M4_EVIDENCE_BRIDGE='20260910-soc-join-v3';
 return true;
}
function derive(){const x=sources(),m3=x.m3;const existing=x.j?.module4?.inputFromModule3||x.s?.module4?.inputFromModule3||m3.module4Carry;if(existing)return existing;const scores=m3.interestCarry?.scores||m3.interestScores||x.j?.module1?.riasec||x.s?.module1?.scores||null;const top=m3.interestCarry?.topInterests||m3.topInterests||x.s?.module1?.topInterests||[];return{source:'northern_boost_module3',capturedAt:new Date().toISOString(),onet:{scores,topInterests:top,topCodes:top.map(z=>z.code)},startingPoint:m3.startingPoint||null,selfAssessment:m3.selfAssessment||[],workplaceLab:m3.skillLab||null,workPreferences:m3.workPreferences||m3.skillLab?.workPreferences||[],skillEvidence:m3.skillEvidence||m3.skillLab?.strengthsToCarry||[],careerDecisionsBySoc:m3.careerDecisionsBySoc||{},careers:m3.careers||[],newExplorations:m3.newExplorations||[],completionReady:!!m3.completionReady,finalizedAt:m3.finalizedAt||null}}
function installCarryBox(){
 const input=derive();window.NorthernBOOSTModule3Input=input;window.BOOST_CARRY_FORWARD={...(window.BOOST_CARRY_FORWARD||{}),module3:input};
 if(document.getElementById('boostNazM4Carry'))return;
 const top=(input?.onet?.topInterests||[]).slice(0,3),prefs=(input?.workPreferences||[]).slice(0,4),strengths=(input?.selfAssessment||[]).filter(z=>/Used Regularly|Used Sometimes/i.test(String(z?.use||''))).slice(0,6),careers=(input?.careers||[]).slice(0,4);
 const style=document.createElement('style');style.id='boostNazM4CarryStyle';style.textContent='#boostNazM4Carry{max-width:1120px;margin:16px auto;padding:16px 18px;border-radius:16px;border:2px solid #bfded4;background:linear-gradient(135deg,#f2fbf8,#fff);color:#17324a;box-shadow:0 7px 22px rgba(8,42,75,.06);font-family:Arial,Helvetica,sans-serif}#boostNazM4Carry .ey{font-size:11px;font-weight:900;letter-spacing:1.1px;text-transform:uppercase;color:#168c87}#boostNazM4Carry h2{margin:4px 0 7px;color:#082a4b}#boostNazM4Carry p{margin:0 0 12px;color:#5d7284;line-height:1.5}#boostNazM4Carry .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px}#boostNazM4Carry .cell{padding:10px 11px;border-radius:11px;background:#fff;border:1px solid #dce7eb}#boostNazM4Carry .cell span{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:#718596;font-weight:900}#boostNazM4Carry .cell b{display:block;margin-top:4px;font-size:13px;line-height:1.4;color:#17324a}@media(max-width:850px){#boostNazM4Carry .grid{grid-template-columns:1fr 1fr}}@media(max-width:520px){#boostNazM4Carry .grid{grid-template-columns:1fr}}';document.head.appendChild(style);
 const topText=top.length?top.map(z=>`${esc(z.label||LABELS[z.code]||z.code)} ${Number.isFinite(Number(z.score))?esc(z.score):''}`.trim()).join(' • '):'Interest evidence available from Discover';
 const prefText=input?.workplaceLab?(prefs.length?prefs.map(z=>`${esc(z.name)} — ${esc(z.preferenceLabel||'preference recorded')}`).join(', '):'Workplace Skills Lab completed'):'Optional Workplace Skills Lab not completed';
 const strengthText=strengths.length?strengths.map(z=>esc(z.skill||z.name)).join(', '):'Transferable-skill evidence available from Module 3';
 const careerText=careers.length?careers.map(z=>esc(z.title)).join(', '):'Career decisions from Module 3 are available';
 const box=document.createElement('section');box.id='boostNazM4Carry';box.innerHTML=`<div class="ey">Carried Forward from Modules 1–3</div><h2>Your evidence is connected to Decide.</h2><p>Module 4 reconnects the same SOC across Discover, Reality Check, and Career Mobility. You should not have to recreate your evidence.</p><div class="grid"><div class="cell"><span>Top O*NET interests</span><b>${topText}</b></div><div class="cell"><span>Workplace preference evidence</span><b>${prefText}</b></div><div class="cell"><span>Transferable strengths</span><b>${strengthText}</b></div><div class="cell"><span>Careers carried forward</span><b>${careerText}</b></div></div>`;
 const main=document.querySelector('main');if(main)main.insertBefore(box,main.firstChild);
}
function install(){installEvidenceBridge();installCarryBox();setTimeout(()=>{installEvidenceBridge();if(document.querySelector('.career.sel')&&typeof window.renderSelected==='function')window.renderSelected()},500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.addEventListener('boost-cloud-status',()=>setTimeout(()=>{installEvidenceBridge();if(document.querySelector('.career.sel')&&typeof window.renderSelected==='function')window.renderSelected()},50));
})();