(()=>{
'use strict';
const JK='boost_naz_journey_v1',SK='northern_boost_career_exploration_v1';
const LMI_SOURCE='Northern_BOOST_Module1_Connected_Test_v2.8.html';
const RIASEC=['R','I','A','S','E','C'];
let DATA_PROMISE=null;
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'{}')||{}}catch(_){return{}}};
const socKey=v=>{const d=String(v??'').replace(/\D/g,'');return d.length>=6?d.slice(0,6):d};
const titleKey=v=>String(v??'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const n=v=>{const x=Number(v);return Number.isFinite(x)?x:null};
function find(list,ref){const sk=socKey(ref?.soc||ref),tk=titleKey(ref?.title);return (list||[]).find(x=>(sk&&socKey(x?.soc||x?.socCode||x?.code)===sk)||(tk&&titleKey(x?.title)===tk))||null}
function validationFor(m2,ref){const sk=socKey(ref?.soc||ref),map=m2?.validationBySoc||{};for(const [k,v] of Object.entries(map)){if(socKey(k)===sk)return v||{}}return{}}
function sources(){const j=read(JK),s=read(SK);return{j,s,m1s:s.module1||{},m1j:j.module1||{},m2s:s.module2||{},m2j:j.module2||{}}}
function careerSources(c){const x=sources();const m1=find(x.m1s.selected,c)||find(x.m1j.careers,c)||{};const m2=find(x.m2s.careers,c)||find(x.m2j.careers,c)||{};const v={...validationFor(x.m2j,c),...validationFor(x.m2s,c),...(m2.validation||{})};return{x,m1,m2,v}}
function savedInterest(c){const {m1,m2}=careerSources(c);for(const v of [m1.interestAlignment,m1.personalAlignment,m2.interestAlignment,m2.personalAlignment]){const x=n(v);if(x!=null)return x}return null}
function savedScores(){const x=sources();for(const o of [x.m1s.scores,x.m1j.riasec,x.m1j.scores,x.m1j.interestScores]){if(!o)continue;const out={};let ok=true;for(const k of RIASEC){const v=n(o[k]);if(v==null){ok=false;break}out[k]=v}if(ok)return out}return null}
async function lmi(){if(DATA_PROMISE)return DATA_PROMISE;DATA_PROMISE=(async()=>{try{const r=await fetch(LMI_SOURCE,{cache:'no-store'});if(!r.ok)return[];const text=await r.text(),token='const DATA=',start=text.indexOf(token);if(start<0)return[];const from=start+token.length;let end=text.indexOf(';\nconst RIASEC',from);if(end<0)end=text.indexOf(';const RIASEC',from);if(end<0)end=text.indexOf(';\r\nconst RIASEC',from);if(end<0)return[];return JSON.parse(text.slice(from,end))}catch(e){console.warn('Northern Module 4 interest LMI recovery unavailable',e);return[]}})();return DATA_PROMISE}
function alignment(scores,o){if(!scores||!o?.riasecProxy)return null;const umax=Math.max(...Object.values(scores))||1,pmax=Math.max(...RIASEC.map(k=>Number(o.riasecProxy[k])||0))||1;const d=RIASEC.reduce((sum,k)=>sum+Math.abs((scores[k]/umax*100)-((Number(o.riasecProxy[k])||0)/pmax*100)),0)/6;return Math.round(Math.max(0,100-d)*10)/10}
async function interestFor(c){const existing=savedInterest(c);if(existing!=null)return existing;const scores=savedScores();if(!scores)return null;const data=await lmi(),o=data.find(x=>socKey(x?.soc)===socKey(c?.soc));return alignment(scores,o)}
function prepFor(c){const {m1,m2,v}=careerSources(c);const readiness=m2.preparationReadiness||v.prep||m2.prep||'';const note=v.prepNote||m2.prepNote||'';const intel=m2.preparationIntel||v.preparationIntel||m1.preparationIntel||m1.preparation||null;const education=m1.typicalEducation||m1.education||intel?.baseline?.education||intel?.education||'';const parts=[];if(readiness)parts.push(String(readiness));if(note)parts.push(String(note));if(education)parts.push('Typical entry: '+String(education));return{readiness,note,education,text:parts.join(' • ')} }
function activeCareer(){try{return typeof window.selectedCareer==='function'?window.selectedCareer():null}catch(_){return null}}
function rewritePrep(c){const p=prepFor(c);document.querySelectorAll('#evidence .ev').forEach(card=>{const label=(card.querySelector('small')?.textContent||'').trim().toUpperCase(),b=card.querySelector('b');if(!b)return;if(label.startsWith('PREPARATION')&&p.text)b.textContent=p.text});const note=document.getElementById('prepNote');if(note&&p.text)note.innerHTML='<b>Preparation evidence from Reality Check</b><br>'+p.text+'<br><small>This is the evidence you recorded in Northern BOOST Module 2 for this occupation.</small>'}
async function rewriteInterest(c){const val=await interestFor(c);if(val==null)return;document.querySelectorAll('#evidence .ev').forEach(card=>{const label=(card.querySelector('small')?.textContent||'').trim().toUpperCase(),b=card.querySelector('b');if(b&&label==='INTEREST ALIGNMENT')b.textContent=Math.round(val)+'%'});document.querySelectorAll('.career').forEach(card=>{const soc=socKey(card.dataset.soc),target=socKey(c?.soc);if(soc!==target)return;const sm=[...card.querySelectorAll('small')].find(x=>/Interest/i.test(x.textContent||''));if(sm)sm.textContent=(sm.textContent||'').replace(/Interest\s+(not retained|reviewed|\d+(?:\.\d+)?%)/i,'Interest '+Math.round(val)+'%')})}
function refresh(){const c=activeCareer();if(!c)return;rewritePrep(c);rewriteInterest(c)}
function install(){if(typeof window.renderSelected==='function'&&!window.__BOOST_NAZ_M4_INTEREST_PREP_WRAP){const old=window.renderSelected;window.renderSelected=function(){old();setTimeout(refresh,0)};window.__BOOST_NAZ_M4_INTEREST_PREP_WRAP=true}setTimeout(refresh,120);setTimeout(refresh,700)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.addEventListener('boost-cloud-status',()=>setTimeout(refresh,80));
window.__BOOST_NAZ_M4_INTEREST_PREP_FIX='20260910-v1';
})();
