(() => {
  'use strict';
  function init(){
  if(document.querySelector('.m1Hud'))return;
  const KEY='boost_naz_journey_v1';
  const labels=[['Welcome','How Northern BOOST works'],['Strengths','What you bring'],['Interests','O*NET + career evidence'],['Review & Continue','Save your direction']];
  const strengths=[
    ['Solve practical problems','I like troubleshooting, fixing, or finding a workable next step.'],
    ['Help people','I listen, support, explain, or respond when someone needs help.'],
    ['Organize details','I keep information, schedules, materials, or tasks in order.'],
    ['Work with tools or equipment','I learn by doing and feel comfortable with hands-on work.'],
    ['Learn systems and technology','I like understanding how processes, software, or equipment work.'],
    ['Communicate clearly','I can share information, ask useful questions, and keep others informed.'],
    ['Notice quality and safety','I pay attention to details, standards, risks, and what could go wrong.'],
    ['Lead and coordinate','I help people focus, make decisions, or move work forward.'],
    ['Create and improve','I generate ideas and look for better ways to complete the work.']
  ];
  let step=Math.max(0,Math.min(3,Number(sessionStorage.getItem('boost_naz_m1_step_v3')||0)));
  let journey={};try{journey=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(_){journey={}}journey.module1=journey.module1||{};
  let selected=new Set(Array.isArray(journey.module1.strengths)?journey.module1.strengths:[]);
  const title=document.createElement('section');title.className='m1ModuleTitle';title.innerHTML='<div class="wrap"><div class="eyebrow">Northern BOOST • Module 1</div><h1>Identify Your Direction</h1><p>Start with what you already bring, add your interests, and use Northern Arizona labor-market evidence to identify career possibilities worth exploring.</p></div>';
  const firstContent=document.querySelector('.visualIntro,.rosieIntro,.main,main');firstContent?.insertAdjacentElement('beforebegin',title);
  const hud=document.createElement('header');hud.className='m1Hud';hud.setAttribute('aria-label','Northern BOOST Module 1 navigation');hud.innerHTML=`<div class="m1Brand">Northern BOOST<small>IDENTIFY YOUR DIRECTION</small></div><nav class="m1Steps" aria-label="Module 1 steps">${labels.map((x,i)=>`<button class="m1Step" type="button" data-m1-step="${i}">${i+1}. ${x[0]}<span>${x[1]}</span></button>`).join('')}</nav><div class="m1Actions"><button class="m1Summary" type="button">Save / summary</button><a class="m1Map" href="index.html#step=module1">Return to Map</a></div>`;document.body.prepend(hud);
  const skip=document.createElement('a');skip.className='m1Skip';skip.href='#m1ActiveStep';skip.textContent='Skip to module content';document.body.prepend(skip);
  const visual=document.querySelector('.visualIntro'),rosie=document.querySelector('#rosieIntro'),identity=document.querySelector('#participantIdentity'),onet=document.querySelector('#onetEntry'),results=document.querySelector('#resultsPanel'),main=document.querySelector('.main,main');
  const panels=[...document.querySelectorAll('.main .panel,main .panel')];const reverse=panels.find(p=>/Reverse Engineer/i.test(p.textContent||''));const reflection=panels.find(p=>p.classList.contains('reflection'));const report=document.querySelector('#possibilitiesReport');
  const strengthPanel=document.createElement('section');strengthPanel.className='m1StrengthPanel';strengthPanel.innerHTML=`<div class="step">Step 2 • Strengths</div><h2>What strengths do you bring to work?</h2><p class="m1StrengthIntro">Choose the patterns that sound like you. These are not job titles or tests. They help you describe experience you may already use across many kinds of work.</p><div class="m1StrengthGrid">${strengths.map(([a,b])=>`<button class="m1Strength" type="button" aria-pressed="${selected.has(a)}" data-strength="${a}"><strong>${a}</strong><span>${b}</span></button>`).join('')}</div><div class="m1StrengthNote"><b>Your strengths travel with you.</b> Northern BOOST will carry these patterns forward so later modules can connect your experience to occupations, mobility options, and realistic next steps.</div>`;
  main?.querySelector('.wrap')?.prepend(strengthPanel);
  const regional=document.createElement('aside');regional.className='m1RegionalNote';regional.innerHTML='<b>Northern Arizona Regional Opportunity:</b> BOOST considers current employment, average annual openings, projected growth, and wages across Apache, Coconino, Gila, and Navajo Counties. Careers with stronger regional evidence may be surfaced first, but every occupation remains available for you and your Career Coach to explore.';title.insertAdjacentElement('afterend',regional);
  const groups=[[visual,rosie,identity],[strengthPanel],[onet,results,reverse],[reflection,report]].map(g=>g.filter(Boolean));
  function persist(){journey.region='Northern Arizona';journey.module1=journey.module1||{};journey.module1.strengths=[...selected];journey.module1.experienceVersion='northern-m1-pinal-flow-v3';localStorage.setItem(KEY,JSON.stringify(journey))}
  function canAdvance(){if(step===0){const name=document.getElementById('participantName');if(name&&!name.value.trim()){document.getElementById('identityErr')?.style.setProperty('display','block');name.focus();return false}}if(step===1&&!selected.size){alert('Choose at least one strength to continue.');return false}if(step===2&&typeof window.validScores==='function'&&!window.validScores()){alert('Enter all six O*NET Interest Profiler scores to continue.');return false}return true}
  function navActions(){document.querySelectorAll('.m1FlowActions').forEach(x=>x.remove());const area=document.createElement('div');area.className='m1FlowActions';area.innerHTML=`<button class="m1FlowBtn secondary" type="button" data-m1-back ${step===0?'disabled':''}>← Back</button><button class="m1FlowBtn" type="button" data-m1-next>${step===3?'Create / review my summary':'Continue →'}</button>`;const last=groups[step][groups[step].length-1];last?.insertAdjacentElement('afterend',area);area.querySelector('[data-m1-back]').onclick=()=>go(step-1);area.querySelector('[data-m1-next]').onclick=()=>{if(step===3){if(typeof window.buildReport==='function')window.buildReport();report?.scrollIntoView({behavior:'smooth'})}else if(canAdvance()){persist();go(step+1)}}}
  function go(n){step=Math.max(0,Math.min(3,n));sessionStorage.setItem('boost_naz_m1_step_v3',String(step));groups.flat().forEach(el=>el.classList.add('m1StepHidden'));groups[step].forEach(el=>el.classList.remove('m1StepHidden'));document.querySelectorAll('[data-m1-step]').forEach((b,i)=>{b.classList.toggle('active',i===step);b.classList.toggle('done',i<step);b.setAttribute('aria-current',i===step?'step':'false')});const active=groups[step][0];if(active){active.id=active.id||'m1ActiveStep';active.scrollIntoView({block:'start'})}navActions()}
  strengthPanel.querySelectorAll('[data-strength]').forEach(btn=>btn.addEventListener('click',()=>{const k=btn.dataset.strength;if(selected.has(k))selected.delete(k);else selected.add(k);btn.setAttribute('aria-pressed',String(selected.has(k)));persist()}));
  hud.querySelectorAll('[data-m1-step]').forEach(btn=>btn.addEventListener('click',()=>{const target=Number(btn.dataset.m1Step);if(target>step+1)return;if(target<=step||canAdvance()){persist();go(target)}}));hud.querySelector('.m1Summary').addEventListener('click',()=>{if(step===3)go(3);else alert('Complete the current Module 1 step before opening your final review.')});
  const footer=document.querySelector('.footer');
  if(footer)footer.textContent='BOOST combines O*NET interest information with Northern Arizona labor-market data to support career exploration. Use these results as a starting point for discussion with your Career Coach.';
  document.title='Northern BOOST — Module 1';
  go(step);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
