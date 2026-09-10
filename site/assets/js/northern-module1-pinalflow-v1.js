(()=>{
'use strict';
const JOURNEY_KEY='boost_naz_journey_v1';
const SHARED_KEY='northern_boost_career_exploration_v1';
const LMI_SOURCE='Northern_BOOST_Module1_Connected_Test_v2.8.html';
const RIASEC=['R','I','A','S','E','C'];
const LABELS={R:'Realistic',I:'Investigative',A:'Artistic',S:'Social',E:'Enterprising',C:'Conventional'};
const ALIASES={
 'cna':['31-1131'],'certified nursing assistant':['31-1131'],'nursing assistant':['31-1131'],
 'rn':['29-1141'],'registered nurse':['29-1141'],'lpn':['29-2061'],'lvn':['29-2061'],
 'cdl':['53-3032'],'truck driver':['53-3032'],'class a':['53-3032'],
 'help desk':['15-1232'],'it support':['15-1232'],'computer support':['15-1232'],
 'hvac':['49-9021'],'air conditioning':['49-9021'],'refrigeration':['49-9021'],
 'pharmacy tech':['29-2052'],'medical assistant':['31-9092'],'welder':['51-4121'],
 'electrician':['47-2111'],'plumber':['47-2152'],'cybersecurity':['15-1212'],'cyber security':['15-1212'],
 'forklift':['53-7062'],'warehouse':['53-7062'],'retail manager':['41-1011'],'store manager':['41-1011']
};
let DATA=[],scores=null,ranked=[],visible=8,filter='all',selected=new Map(),lastSearch=null;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const num=n=>n==null||!Number.isFinite(Number(n))?'—':Math.round(Number(n)).toLocaleString();
const money=n=>n==null||!Number.isFinite(Number(n))?'—':'$'+Number(n).toFixed(2);
const pct=n=>n==null||!Number.isFinite(Number(n))?'—':Number(n).toFixed(1)+'%';
function readJourney(){try{return JSON.parse(localStorage.getItem(JOURNEY_KEY)||'{}')||{}}catch(_){return{}}}
function writeJourney(j){j.region=j.region||'Northern Arizona';j.updatedAt=new Date().toISOString();localStorage.setItem(JOURNEY_KEY,JSON.stringify(j));return j}
function readShared(){try{return JSON.parse(localStorage.getItem(SHARED_KEY)||'{}')||{}}catch(_){return{}}}
function writeShared(s){s.region='Northern Arizona';s.updatedAt=new Date().toISOString();localStorage.setItem(SHARED_KEY,JSON.stringify(s));return s}
function currentScores(){const out={};for(const k of RIASEC){const el=$(k),v=Number(el?.value);if(!el||el.value===''||!Number.isFinite(v)||v<0||v>60)return null;out[k]=v}return Math.max(...Object.values(out))>0?out:null}
function alignment(o){if(!scores||!o?.riasecProxy)return 0;const umax=Math.max(...Object.values(scores))||1;const pmax=Math.max(...RIASEC.map(k=>Number(o.riasecProxy[k])||0))||1;const d=RIASEC.reduce((sum,k)=>sum+Math.abs((scores[k]/umax*100)-((Number(o.riasecProxy[k])||0)/pmax*100)),0)/6;return Math.max(0,100-d)}
function boostScore(o){const a=alignment(o),opp=Number(o.regionalOpportunityScore)||0;return a*.50+opp*.35+(o.prioritySector?15:0)}
function opportunity(o){
 if(o.jobs==null)return{label:'Very Limited Local Evidence',cls:'evidence'};
 if(!o.fullLmiForScoring&&o.passesRecommendationGate)return{label:'Established Employment • Openings Pending',cls:'evidence'};
 if(o.passesRecommendationGate&&o.regionalOpportunityScore!=null&&Number(o.regionalOpportunityScore)>=65)return{label:'Strong Regional Opportunity',cls:'strong'};
 if(Number(o.jobs)>=500&&o.passesRecommendationGate)return{label:'Established Regional Opportunity',cls:'established'};
 if(o.passesRecommendationGate)return{label:'Viable Regional Opportunity',cls:'viable'};
 if(Number(o.jobs)<10)return{label:'Very Limited Local Evidence',cls:'evidence'};
 return{label:'Limited Regional Availability',cls:'limited'};
}
function topInterests(){if(!scores)return[];return RIASEC.map(k=>[k,scores[k]]).sort((a,b)=>b[1]-a[1]).slice(0,3)}
function sourceText(origin){return origin==='I Chose to Explore'?'I Chose to Explore':'BOOST Surfaced'}
function careerSnapshot(o,origin){const op=opportunity(o),a=alignment(o);return{
 soc:o.soc,title:o.title,sector:o.sector,source:sourceText(origin),origin:sourceText(origin),
 personalAlignment:Math.round(a),interestAlignment:Math.round(a*10)/10,
 regionalOpportunityLabel:op.label,regionalOpportunityScore:o.regionalOpportunityScore,
 jobs:o.jobs,jobs2035:o.jobs2035,annualOpenings:o.annualOpenings,growthPercent:o.growthPercent,
 wage25:o.wage25,wageMedian:o.wageMedian,wage75:o.wage75,prioritySector:!!o.prioritySector,
 passesRecommendationGate:!!o.passesRecommendationGate,sourceAreas:o.sourceAreas||[],
 regional:{jobs26:o.jobs,jobs35:o.jobs2035,annualOpenings:o.annualOpenings,growthPct:o.growthPercent,p25Hourly:o.wage25,medianHourly:o.wageMedian,p75Hourly:o.wage75,tier:op.label,opportunityScore:o.regionalOpportunityScore,passesRecommendationGate:!!o.passesRecommendationGate}
}}
function restore(){
 const j=readJourney(),m=j.module1||{};
 const r=m.riasec||readShared()?.module1?.scores||null;
 if(r)RIASEC.forEach(k=>{if(Number.isFinite(Number(r[k])))$(k).value=r[k]});
 const careers=(m.careers||readShared()?.module1?.selected||[]).slice(0,3);
 careers.forEach(c=>{if(c?.soc)selected.set(String(c.soc),{...c,origin:c.origin||c.source||'I Chose to Explore'})});
 const name=j.participant?.name||'';const email=j.participant?.email||'';
 if($('participantName'))$('participantName').value=name;if($('participantEmail'))$('participantEmail').value=email;
 renderChosen();
}
function persist(inProgress=true){
 scores=currentScores()||scores;
 const chosen=[...selected.values()].map(c=>{const o=DATA.find(x=>String(x.soc)===String(c.soc));return o?careerSnapshot(o,c.origin||c.source):c}).filter(Boolean);
 const now=new Date().toISOString();
 const shared=readShared();shared.module1={scores:scores||null,topInterests:scores?topInterests().map(([code,score])=>({code,label:LABELS[code],score})):[],selected:chosen,evidenceVersion:'northern-lightcast-pinalflow-v1',geography:'Apache, Coconino, Gila & Navajo Counties, Arizona',updatedAt:now};writeShared(shared);
 const j=readJourney();j.participant=j.participant||{};const name=$('participantName')?.value.trim(),email=$('participantEmail')?.value.trim();if(name)j.participant.name=name;if(email)j.participant.email=email.toLowerCase();j.progress=j.progress||{};if(inProgress&&j.progress.module1!=='complete')j.progress.module1='in_progress';j.module1=j.module1||{};j.module1.riasec=scores||j.module1.riasec||null;j.module1.careers=chosen;j.module1.evidenceVersion='northern-lightcast-pinalflow-v1';j.module1.geography='Apache, Coconino, Gila & Navajo Counties, Arizona';j.module1.updatedAt=now;writeJourney(j);
}
async function loadLmi(){
 $('cards').innerHTML='<div class="load">Loading Northern Arizona career evidence…</div>';
 const r=await fetch(LMI_SOURCE,{cache:'no-store'});if(!r.ok)throw new Error('Northern career evidence could not be loaded.');const text=await r.text();const startToken='const DATA=',start=text.indexOf(startToken);if(start<0)throw new Error('Northern career evidence was not found.');const from=start+startToken.length;let end=text.indexOf(';\nconst RIASEC',from);if(end<0)end=text.indexOf(';const RIASEC',from);if(end<0)end=text.indexOf(';\r\nconst RIASEC',from);if(end<0)throw new Error('Northern career evidence boundary was not found.');DATA=JSON.parse(text.slice(from,end));
 selected.forEach((c,soc)=>{const o=DATA.find(x=>String(x.soc)===String(soc));if(o)selected.set(soc,{...careerSnapshot(o,c.origin||c.source),origin:c.origin||c.source||'I Chose to Explore'})});renderChosen();$('cards').innerHTML='<div class="empty">Enter your O*NET scores above to surface careers.</div>';
}
function buildRank(){ranked=DATA.filter(o=>o.passesRecommendationGate&&o.regionalOpportunityScore!=null&&o.riasecProxy).map(o=>({...o,_alignment:alignment(o),_boost:boostScore(o)})).sort((a,b)=>b._boost-a._boost)}
function filtered(){let arr=ranked;if(filter==='priority')arr=ranked.filter(o=>o.prioritySector);if(filter==='strong')arr=ranked.filter(o=>['strong','established'].includes(opportunity(o).cls));return arr.slice(0,visible)}
function evidenceStory(o,origin){const op=opportunity(o);if(origin==='I Chose to Explore'&&!o.passesRecommendationGate)return`You chose this career directly. Northern Arizona shows <b>${num(o.jobs)}</b> regional jobs, about <b>${num(o.annualOpenings)}</b> average annual openings, and <b>${pct(o.growthPercent)}</b> projected growth. That is a smaller regional footprint than careers BOOST usually surfaces automatically, so it is labeled <b>${esc(op.label)}</b>. It remains available for exploration.`;if(!o.fullLmiForScoring)return`Some Northern Arizona labor-market fields are limited for this occupation. BOOST keeps it available so you can review the evidence that does exist and discuss it with your Career Coach.`;return`Northern Arizona evidence supports this as <b>${esc(op.label)}</b>. BOOST combines your interest pattern with regional employment, openings, growth, and wage evidence; no single score decides whether you can pursue the career.`}
function cardHtml(o,origin='BOOST Surfaced'){const a=alignment(o),op=opportunity(o),saved=selected.has(String(o.soc));return`<article class="card"><div class="origin">${esc(origin)} • SOC ${esc(o.soc)}</div><h3>${esc(o.title)}</h3><div class="badges"><span class="badge sector">${esc(o.sector||'Career')}</span><span class="badge opp ${op.cls}">${esc(op.label)}</span>${saved?'<span class="badge selectedBadge">Saved ✓</span>':''}</div><div class="metrics"><div class="metric"><small>Interest alignment</small><b>${Math.round(a)}%</b></div><div class="metric"><small>Regional jobs</small><b>${num(o.jobs)}</b></div><div class="metric"><small>Annual openings</small><b>${num(o.annualOpenings)}</b></div><div class="metric"><small>Projected growth</small><b>${pct(o.growthPercent)}</b></div><div class="metric entry"><small>Point-of-entry estimate</small><b>${money(o.wage25)}/hr</b></div><div class="metric"><small>Median wage</small><b>${money(o.wageMedian)}/hr</b></div></div><div class="evidenceStory">${evidenceStory(o,origin)}</div><button class="addBtn ${saved?'remove':''}" type="button" data-soc="${esc(o.soc)}" data-origin="${esc(origin)}">${saved?'Remove from My Career Exploration':'＋ Add to My Career Exploration'}</button></article>`}
function bindAdd(root=document){root.querySelectorAll('.addBtn').forEach(btn=>btn.onclick=()=>toggle(btn.dataset.soc,btn.dataset.origin))}
function renderCards(){const arr=filtered();$('cards').innerHTML=arr.length?arr.map(o=>cardHtml(o,'BOOST Surfaced')).join(''):'<div class="empty">No careers match this view. Try another filter or search any occupation below.</div>';bindAdd($('cards'));$('moreBtn').style.display=visible<Math.min((filter==='all'?ranked:filter==='priority'?ranked.filter(o=>o.prioritySector):ranked.filter(o=>['strong','established'].includes(opportunity(o).cls))).length,40)?'inline-block':'none'}
function surface(){const s=currentScores();$('scoreError').style.display='none';if(!s){$('scoreError').style.display='block';return}scores=s;buildRank();visible=8;filter='all';document.querySelectorAll('.filterBtn').forEach(b=>b.classList.toggle('active',b.dataset.filter==='all'));const tops=topInterests();$('interestSummary').innerHTML=`Your strongest interest signals are <b>${tops.map(([k])=>LABELS[k]).join(', ')}</b>. BOOST uses the full six-score pattern, then adds Northern Arizona labor-market evidence.`;$('interestSummary').style.display='block';renderCards();persist(true);$('recommendations').scrollIntoView({behavior:'smooth',block:'start'})}
function toggle(soc,origin){soc=String(soc);const o=DATA.find(x=>String(x.soc)===soc);if(!o)return;if(selected.has(soc))selected.delete(soc);else{if(selected.size>=3){alert('You can carry up to three careers into Reality Check. Remove one before adding another.');return}selected.set(soc,{...careerSnapshot(o,origin),origin:sourceText(origin)})}renderChosen();renderCards();if(lastSearch&&String(lastSearch.soc)===soc)renderSearchDetail(lastSearch);persist(true)}
function renderChosen(){const box=$('chosen');if(!selected.size){box.innerHTML='<div class="chosenItem"><b>No careers saved yet.</b><br><small>Choose up to three from the cards or search any occupation.</small></div>';return}box.innerHTML=[...selected.values()].map(c=>`<div class="chosenItem"><b>${esc(c.title||c.soc)}</b><br><small>${esc(c.origin||c.source||'Saved career')} • ${esc(c.regionalOpportunityLabel||c.regional?.tier||'Northern Arizona evidence')}</small></div>`).join('')}
function searchMatches(q){q=q.trim().toLowerCase();if(!q)return[];const aliasSocs=new Set();Object.entries(ALIASES).forEach(([a,socs])=>{if(a.includes(q)||q.includes(a))socs.forEach(s=>aliasSocs.add(s))});return DATA.filter(o=>aliasSocs.has(String(o.soc))||String(o.title).toLowerCase().includes(q)||String(o.soc).includes(q)).sort((a,b)=>{const aa=aliasSocs.has(String(a.soc))?1:0,bb=aliasSocs.has(String(b.soc))?1:0;if(bb!==aa)return bb-aa;const ax=scores&&a.riasecProxy?alignment(a):-1,bx=scores&&b.riasecProxy?alignment(b):-1;if(bx!==ax)return bx-ax;return String(a.title).localeCompare(String(b.title))}).slice(0,30)}
function renderSearchList(){const q=$('searchInput').value,res=searchMatches(q),box=$('searchResults');if(!q.trim()){box.style.display='none';box.innerHTML='';return}box.style.display='block';box.innerHTML=res.length?res.map(o=>{const op=opportunity(o);return`<button class="searchPick" type="button" data-soc="${esc(o.soc)}"><b>${esc(o.title)}</b><small>${esc(o.soc)} • ${esc(op.label)}${o.passesRecommendationGate?'':' • Participant-selected exploration'}</small></button>`}).join(''):'<div class="empty">No occupation found. Try another title or SOC.</div>';box.querySelectorAll('.searchPick').forEach(b=>b.onclick=()=>{lastSearch=DATA.find(x=>String(x.soc)===String(b.dataset.soc));renderSearchDetail(lastSearch);box.style.display='none'})}
function renderSearchDetail(o){$('searchDetail').innerHTML=o?cardHtml(o,'I Chose to Explore'):'';bindAdd($('searchDetail'))}
function completeModule(){scores=currentScores()||scores;if(!scores){$('scoreError').style.display='block';$('scoresPanel').scrollIntoView({behavior:'smooth'});return}if(!selected.size){$('saveStatus').textContent='Save at least one career before completing Discover.';return}const name=$('participantName').value.trim();if(!name){$('saveStatus').textContent='Add your name so your Northern BOOST journey can be saved.';$('participantName').focus();return}persist(false);const j=readJourney();j.progress=j.progress||{};j.progress.module1='complete';j.module1=j.module1||{};j.module1.completedAt=new Date().toISOString();writeJourney(j);const shared=readShared();shared.module1=shared.module1||{};shared.module1.completedAt=j.module1.completedAt;writeShared(shared);$('saveStatus').textContent=`Saved ${selected.size} career${selected.size===1?'':'s'} for Reality Check.`;$('completion').style.display='block';$('completion').scrollIntoView({behavior:'smooth',block:'center'})}
function bind(){
 $('surfaceBtn').onclick=surface;$('moreBtn').onclick=()=>{visible=Math.min(visible+8,40);renderCards()};$('searchInput').addEventListener('input',renderSearchList);$('saveBtn').onclick=completeModule;document.querySelectorAll('.filterBtn').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;visible=8;document.querySelectorAll('.filterBtn').forEach(x=>x.classList.toggle('active',x===b));renderCards()});['participantName','participantEmail'].forEach(id=>$(id)?.addEventListener('change',()=>persist(true)));document.addEventListener('click',e=>{if(!e.target.closest('.searchWrap'))$('searchResults').style.display='none'})
}
async function init(){restore();bind();try{await loadLmi();const s=currentScores();if(s){scores=s;buildRank();$('interestSummary').innerHTML=`Your saved O*NET scores are ready. Select <b>See Careers That Connect</b> to refresh Northern Arizona recommendations.`;$('interestSummary').style.display='block'}}catch(e){console.error(e);$('cards').innerHTML=`<div class="empty"><b>Northern Arizona career evidence could not load.</b><br>${esc(e.message)}</div>`}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
