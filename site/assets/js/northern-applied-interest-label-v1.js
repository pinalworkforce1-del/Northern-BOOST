(()=>{
'use strict';
const JKEY='boost_naz_journey_v1',SKEY='northern_boost_career_exploration_v1';
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'{}')||{}}catch(_){return{}}};
const soc=v=>String(v??'').replace(/\D/g,'').slice(0,6);
const norm=v=>String(v??'').trim();

function target(j,s){
  const m4={...(s?.module4||{}),...(j?.module4||{})};
  return m4.careerTarget||m4.targetCareer||m4.career||m4.boostSignal?.careerTarget||m4.selection?.career||null;
}
function findCareer(list,ref){
  const id=soc(ref?.soc||ref),title=norm(ref?.title).toLowerCase();
  return (list||[]).find(c=>(id&&soc(c?.soc)===id)||(title&&norm(c?.title).toLowerCase()===title))||null;
}
function numericLabel(v){
  const n=Number(v);
  if(!Number.isFinite(n))return null;
  if(n>=78)return'Strong connection to your interests';
  if(n>=62)return'Some connection to your interests';
  return'Different from your strongest interests';
}
function labelFor(ref,j,s){
  if(!ref)return null;
  const id=soc(ref?.soc);
  const m1=findCareer(s?.module1?.selected,ref)||findCareer(j?.module1?.careers,ref)||{};
  const m3s=s?.module3||{},m3j=j?.module3||{};
  const signals=m3s?.mobilitySignalsBySoc?.[ref.soc]||m3j?.mobilitySignalsBySoc?.[ref.soc]||m3s?.decisionEvidence?.mobilitySignalsBySoc?.[ref.soc]||m3j?.decisionEvidence?.mobilitySignalsBySoc?.[ref.soc]||{};
  const direct=[
    m1.interestConnectionLabel,
    m1.interestConnection,
    m1.interestAlignmentLabel,
    signals.interestConnection,
    signals.interestAlignmentLabel,
    ref.interestConnectionLabel,
    ref.interestConnection
  ].find(v=>typeof v==='string'&&v.trim());
  if(direct)return direct.trim();
  const legacy=[m1.personalAlignment,m1.interestAlignment,signals.interestAlignment,ref.personalAlignment,ref.interestAlignment];
  for(const v of legacy){const out=numericLabel(v);if(out)return out}
  return null;
}
function primaryTitle(ref){return ref?.title||'this career'}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

function patch(){
  const j=read(JKEY),s=read(SKEY),ref=target(j,s);
  const label=labelFor(ref,j,s);
  if(!label)return false;
  const card=document.getElementById('connectedJourneyCard');
  if(card){
    const cells=[...card.querySelectorAll('.cjCell')];
    const interest=cells.find(c=>/interest alignment/i.test(c.textContent||''));
    const span=interest?.querySelector('span');
    if(span)span.textContent=label;
  }
  const note=document.getElementById('carriedInterestNote');
  if(note){
    note.style.display='block';
    note.innerHTML=`<b>Evidence carried forward:</b> Your earlier interest evidence for <b>${esc(primaryTitle(ref))}</b> showed <b>${esc(label)}</b>. That is context—not your answer here. Rate how this applied career experience feels to you <i>before</i> you begin.`;
  }
  return !!card;
}

function run(){
  let tries=0;
  const timer=setInterval(()=>{patch();if(++tries>=40)clearInterval(timer)},250);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
window.addEventListener('storage',patch);
window.addEventListener('boost-cloud-status',()=>setTimeout(patch,100));
})();
