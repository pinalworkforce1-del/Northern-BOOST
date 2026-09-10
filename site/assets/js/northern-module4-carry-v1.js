(()=>{
'use strict';
const JOURNEY_KEY='boost_naz_journey_v1';
const SHARED_KEY='northern_boost_career_exploration_v1';
const LABELS={R:'Realistic',I:'Investigative',A:'Artistic',S:'Social',E:'Enterprising',C:'Conventional'};
function read(key){try{return JSON.parse(localStorage.getItem(key)||'{}')||{}}catch(_){return{}}}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function derive(){
 const j=read(JOURNEY_KEY),s=read(SHARED_KEY),m3={...(s.module3||{}),...(j.module3||{})};
 const existing=j?.module4?.inputFromModule3||s?.module4?.inputFromModule3||m3.module4Carry;
 if(existing)return existing;
 const scores=m3.interestCarry?.scores||m3.interestScores||j?.module1?.riasec||s?.module1?.scores||null;
 const top=m3.interestCarry?.topInterests||m3.topInterests||s?.module1?.topInterests||[];
 return{source:'northern_boost_module3',capturedAt:new Date().toISOString(),onet:{scores,topInterests:top,topCodes:top.map(x=>x.code)},startingPoint:m3.startingPoint||null,selfAssessment:m3.selfAssessment||[],workplaceLab:m3.skillLab||null,workPreferences:m3.workPreferences||m3.skillLab?.workPreferences||[],skillEvidence:m3.skillEvidence||m3.skillLab?.strengthsToCarry||[],careerDecisionsBySoc:m3.careerDecisionsBySoc||{},careers:m3.careers||[],newExplorations:m3.newExplorations||[],completionReady:!!m3.completionReady,finalizedAt:m3.finalizedAt||null};
}
function install(){
 const input=derive();window.NorthernBOOSTModule3Input=input;window.BOOST_CARRY_FORWARD={...(window.BOOST_CARRY_FORWARD||{}),module3:input};
 window.dispatchEvent(new CustomEvent('northern-boost-module4-input',{detail:input}));
 if(document.getElementById('boostNazM4Carry'))return;
 const top=(input?.onet?.topInterests||[]).slice(0,3);
 const prefs=(input?.workPreferences||[]).slice(0,4);
 const strengths=(input?.skillEvidence||[]).slice(0,4);
 const careers=(input?.careers||[]).slice(0,4);
 const style=document.createElement('style');style.id='boostNazM4CarryStyle';style.textContent=`#boostNazM4Carry{max-width:1120px;margin:16px auto;padding:16px 18px;border-radius:16px;border:2px solid #bfded4;background:linear-gradient(135deg,#f2fbf8,#fff);color:#17324a;box-shadow:0 7px 22px rgba(8,42,75,.06);font-family:Arial,Helvetica,sans-serif}#boostNazM4Carry .ey{font-size:11px;font-weight:900;letter-spacing:1.1px;text-transform:uppercase;color:#168c87}#boostNazM4Carry h2{margin:4px 0 7px;color:#082a4b}#boostNazM4Carry p{margin:0 0 12px;color:#5d7284;line-height:1.5}#boostNazM4Carry .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px}#boostNazM4Carry .cell{padding:10px 11px;border-radius:11px;background:#fff;border:1px solid #dce7eb}#boostNazM4Carry .cell span{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:#718596;font-weight:900}#boostNazM4Carry .cell b{display:block;margin-top:4px;font-size:13px;line-height:1.4;color:#17324a}@media(max-width:850px){#boostNazM4Carry .grid{grid-template-columns:1fr 1fr}}@media(max-width:520px){#boostNazM4Carry .grid{grid-template-columns:1fr}}`;
 document.head.appendChild(style);
 const box=document.createElement('section');box.id='boostNazM4Carry';
 const topText=top.length?top.map(x=>`${esc(x.label||LABELS[x.code]||x.code)} ${Number.isFinite(Number(x.score))?esc(x.score):''}`.trim()).join(' • '):'Interest evidence available from Discover';
 const prefText=input?.workplaceLab?(prefs.length?prefs.map(x=>`${esc(x.name)} — ${esc(x.preferenceLabel||'preference recorded')}`).join(', '):'Pizza Workplace Skills Lab completed'):'Optional Pizza Workplace Skills Lab not completed';
 const strengthText=strengths.length?strengths.map(x=>esc(x.name||x.skill||x.evidenceLabel)).join(', '):((input?.selfAssessment||[]).length?`${input.selfAssessment.length} transferable-skill responses carried forward`:'Transferable-skill evidence available from Module 3');
 const careerText=careers.length?careers.map(x=>esc(x.title)).join(', '):'Career decisions from Module 3 are available';
 box.innerHTML=`<div class="ey">Carried Forward from Module 3</div><h2>Your evidence is already connected to Decide.</h2><p>Module 4 can use the same evidence you built earlier. You should not have to recreate your O*NET interests, workplace preferences, transferable-skill evidence, or career decisions.</p><div class="grid"><div class="cell"><span>Top O*NET interests</span><b>${topText}</b></div><div class="cell"><span>Workplace preference evidence</span><b>${prefText}</b></div><div class="cell"><span>Skill evidence</span><b>${strengthText}</b></div><div class="cell"><span>Careers carried forward</span><b>${careerText}</b></div></div>`;
 const main=document.querySelector('main');const hero=document.querySelector('.hero');const intro=document.querySelector('.rosieIntro');
 if(main)main.insertBefore(box,main.firstChild);else if(intro)intro.insertAdjacentElement('afterend',box);else if(hero)hero.insertAdjacentElement('afterend',box);else document.body.insertBefore(box,document.body.firstChild);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
