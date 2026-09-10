(()=>{
'use strict';
const JOURNEY_KEY='boost_naz_journey_v1';
const SHARED_KEY='northern_boost_career_exploration_v1';
const RIASEC=['R','I','A','S','E','C'];
const LABELS={R:'Realistic',I:'Investigative',A:'Artistic',S:'Social',E:'Enterprising',C:'Conventional'};
const LAB_MESSAGE='BOOST_NAZ_M3_SKILL_LAB_RESULT';
const frame=document.getElementById('activityFrame');
const finish=document.getElementById('finishBtn');

function read(key){try{return JSON.parse(localStorage.getItem(key)||'{}')||{}}catch(_){return{}}}
function write(key,obj){obj=obj||{};obj.region=obj.region||'Northern Arizona';obj.updatedAt=new Date().toISOString();localStorage.setItem(key,JSON.stringify(obj));return obj}
function validScores(x){if(!x||typeof x!=='object')return null;const out={};for(const k of RIASEC){const n=Number(x[k]);if(!Number.isFinite(n))return null;out[k]=n}return out}
function firstScores(){
 const s=read(SHARED_KEY),j=read(JOURNEY_KEY),m1=j.module1||{};
 const candidates=[
   s?.module1?.scores,
   m1.riasec,
   m1.scores,
   m1.interestScores,
   m1.onetScores,
   m1.onet?.scores,
   m1.interests?.scores,
   j.riasec,
   j.interestScores
 ];
 for(const c of candidates){const v=validScores(c);if(v)return v}
 return null;
}
function topInterests(scores){
 const s=read(SHARED_KEY),j=read(JOURNEY_KEY);
 const candidates=[s?.module1?.topInterests,j?.module1?.topInterests,j?.module1?.onet?.topInterests,j?.module1?.interests?.topInterests];
 for(const list of candidates){
   if(!Array.isArray(list)||!list.length)continue;
   const cleaned=list.map(x=>{
     const code=typeof x==='string'?x:x?.code;
     if(!LABELS[code])return null;
     const score=Number(typeof x==='string'?scores?.[code]:x?.score);
     return{code,label:LABELS[code],score:Number.isFinite(score)?score:Number(scores?.[code]??0)};
   }).filter(Boolean);
   if(cleaned.length>=3)return cleaned.slice(0,3);
 }
 if(!scores)return[];
 return RIASEC.map(code=>({code,label:LABELS[code],score:Number(scores[code])})).sort((a,b)=>b.score-a.score).slice(0,3);
}
function carrySnapshot(){
 const scores=firstScores();
 const top=topInterests(scores);
 return{scores,topInterests:top,topCodes:top.map(x=>x.code),source:'module1_discover',carriedAt:new Date().toISOString()};
}
function persistInterestCarry(){
 const carry=carrySnapshot();
 if(!carry.scores)return carry;
 const s=read(SHARED_KEY);s.module1=s.module1||{};if(!validScores(s.module1.scores))s.module1.scores=carry.scores;if(!Array.isArray(s.module1.topInterests)||s.module1.topInterests.length<3)s.module1.topInterests=carry.topInterests;s.module3={...(s.module3||{}),interestCarry:carry,interestScores:carry.scores,topInterests:carry.topInterests};write(SHARED_KEY,s);
 const j=read(JOURNEY_KEY);j.module1=j.module1||{};if(!validScores(j.module1.riasec))j.module1.riasec=carry.scores;if(!Array.isArray(j.module1.topInterests)||j.module1.topInterests.length<3)j.module1.topInterests=carry.topInterests;j.module3={...(j.module3||{}),interestCarry:carry,interestScores:carry.scores,topInterests:carry.topInterests};write(JOURNEY_KEY,j);
 return carry;
}
function applyScoresToFrame(){
 const carry=persistInterestCarry();if(!carry.scores)return false;
 try{
   const d=frame?.contentDocument;if(!d?.body)return false;
   let changed=false;
   RIASEC.forEach(code=>{
     const el=d.getElementById(code);if(!el)return;
     const val=String(carry.scores[code]);
     if(el.value!==val){el.value=val;changed=true}
     el.dispatchEvent(new Event('input',{bubbles:true}));
     el.dispatchEvent(new Event('change',{bubbles:true}));
   });
   const setup=d.getElementById('setup')||d.querySelector('main,.wrap');
   if(setup&&!d.getElementById('boostNazInterestCarry')){
     const box=d.createElement('div');box.id='boostNazInterestCarry';
     box.style.cssText='margin:12px 0 16px;padding:12px 14px;border-radius:12px;background:#eef8f6;border:1px solid #c5e3da;color:#244f4a;font:700 13px/1.5 Arial,sans-serif';
     box.innerHTML='<b>Carried from Discover:</b> '+carry.topInterests.map(x=>x.label+' '+x.score).join(' • ')+'<br><span style="font-weight:500">Your full six O*NET interest scores are already connected to this module and will inform the Workplace Skills Lab.</span>';
     setup.insertBefore(box,setup.firstChild);
   }
   return changed||true;
 }catch(e){console.warn('Northern Module 3 O*NET carry-forward unavailable',e);return false}
}
function module4Snapshot(){
 const j=read(JOURNEY_KEY),s=read(SHARED_KEY),m3={...(s.module3||{}),...(j.module3||{})};
 const carry=m3.interestCarry||carrySnapshot();
 return{
   source:'northern_boost_module3',
   capturedAt:new Date().toISOString(),
   onet:{scores:carry.scores||null,topInterests:carry.topInterests||[],topCodes:(carry.topInterests||[]).map(x=>x.code)},
   startingPoint:m3.startingPoint||null,
   selfAssessment:m3.selfAssessment||[],
   workplaceLab:m3.skillLab||null,
   workPreferences:m3.workPreferences||m3.skillLab?.workPreferences||[],
   skillEvidence:m3.skillEvidence||m3.skillLab?.strengthsToCarry||[],
   careerDecisionsBySoc:m3.careerDecisionsBySoc||{},
   careers:m3.careers||[],
   newExplorations:m3.newExplorations||[],
   completionReady:!!m3.completionReady,
   finalizedAt:m3.finalizedAt||null
 };
}
function mirrorIntoModule4(){
 const snap=module4Snapshot();
 const s=read(SHARED_KEY);s.module3={...(s.module3||{}),module4Carry:snap};s.module4={...(s.module4||{}),inputFromModule3:snap};write(SHARED_KEY,s);
 const j=read(JOURNEY_KEY);j.module3={...(j.module3||{}),module4Carry:snap};j.module4={...(j.module4||{}),inputFromModule3:snap};write(JOURNEY_KEY,j);
 window.dispatchEvent(new CustomEvent('northern-boost-module3-carry',{detail:snap}));
 return snap;
}

persistInterestCarry();
if(frame){frame.addEventListener('load',()=>{setTimeout(applyScoresToFrame,250);setTimeout(applyScoresToFrame,900)});setTimeout(applyScoresToFrame,1200)}
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.data?.type!==LAB_MESSAGE||!e.data?.payload)return;setTimeout(()=>{persistInterestCarry();mirrorIntoModule4();applyScoresToFrame();try{window.BOOSTCloud?.flush?.()}catch(_){}},0)});
if(finish)finish.addEventListener('click',()=>setTimeout(()=>{persistInterestCarry();mirrorIntoModule4();try{window.BOOSTCloud?.flush?.()}catch(_){}},0));
setTimeout(()=>{const j=read(JOURNEY_KEY);if(j?.module3?.skillLab||read(SHARED_KEY)?.module3?.skillLab)mirrorIntoModule4()},700);
})();
