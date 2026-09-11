(() => {
  'use strict';
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  const moduleNumber=Number((file.match(/module([1-4])_/)||[])[1]||1);
  const stages=[['Discover','Interests + possibilities'],['Validate','Jobs + wages + life'],['Mobility','Skills + pathways'],['Decide','Evidence + direction']];
  const mapUrl='./index.html';
  const journeyKey='boost_naz_journey_v1';
  const getJourney=()=>{try{return JSON.parse(localStorage.getItem(journeyKey)||'{}')}catch(_){return{}}};
  const isDone=(n,j)=>{const p=j.progress||{};if(p[`module${n}`]==='complete')return true;if(n===1)return !!j.module1?.careers?.length;if(n===2)return !!j.module2?.careers?.length;if(n===3)return !!j.module3;if(n===4)return !!j.module4;return false};
  function renderHud(){
    const j=getJourney();
    const hud=document.createElement('header');hud.className='nbHud';hud.setAttribute('aria-label','Northern BOOST navigation');
    hud.innerHTML=`<div class="nbBrand"><span class="nbBrandMark">BOOST</span><span class="nbBrandText">Northern Arizona BOOST<small>MODULE ${moduleNumber} OF 4</small></span></div><nav class="nbJourney" aria-label="BOOST module progress">${stages.map((s,i)=>{const n=i+1,cls=n===moduleNumber?'active':isDone(n,j)?'done':'';return `<div class="nbStep ${cls}" ${n===moduleNumber?'aria-current="step"':''}><b>${isDone(n,j)&&n!==moduleNumber?'✓':n}</b>${s[0]}<span>${s[1]}</span></div>`}).join('')}</nav><div class="nbActions"><span class="nbSaved"><strong>●</strong> Progress saves as you work</span><button class="nbAction" type="button" data-nb-summary>Save / summary</button><a class="nbAction" href="${mapUrl}">Return to Map</a></div>`;
    document.body.prepend(hud);
    const skip=document.createElement('a');skip.className='nbHudSkip';skip.href='#nbMainStart';skip.textContent='Skip to module content';document.body.prepend(skip);
    const main=document.querySelector('main,.main');if(main)main.id=main.id||'nbMainStart';
    hud.querySelector('[data-nb-summary]').addEventListener('click',()=>{const target=document.querySelector('#possibilitiesReport,#summaryPanel,#reportPanel,.reportActions');if(target)target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});else document.querySelector('main,.main')?.scrollIntoView({block:'end'})});
  }
  function addRegionalBanner(){
    const anchor=document.querySelector('.hero,.visualIntro,.rosie,.main,main');if(!anchor)return;
    const banner=document.createElement('aside');banner.className='nbRegionalBanner';banner.innerHTML='<b>Northern Arizona evidence:</b> Career information in this module uses employment, average annual openings, projected growth, and wages for Apache, Coconino, Gila, and Navajo Counties. Regional evidence informs recommendations; it never limits what you may explore.';
    anchor.insertAdjacentElement('afterend',banner);
  }
  function alignExperienceLanguage(){
    const firstH1=document.querySelector('h1');
    const titles={1:'Discover Career Possibilities',2:'Does This Career Work in the Real World?',3:'See Where Your Skills Can Take You.',4:'Turn Your Evidence Into a Direction'};
    if(firstH1&&titles[moduleNumber])firstH1.textContent=titles[moduleNumber];
    document.title=`Northern Arizona BOOST | Module ${moduleNumber} — ${stages[moduleNumber-1][0]}`;
  }
  function guardRegionalLanguage(){
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;
    while(node=walker.nextNode()){
      if(node.parentElement?.closest('script,style,audio,video'))continue;
      if(/\bH3\b/.test(node.nodeValue||''))node.nodeValue=node.nodeValue.replace(/\bH3\b/g,'Northern Arizona Regional Opportunity');
    }
  }
  function loadModule1Conversion(){
    const base=new URL('./',document.currentScript?.src||location.href);
    if(!document.querySelector('link[data-northern-module1-v3]')){const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('../css/northern-module1-v3.css?v=20260910a',base);css.dataset.northernModule1V3='';document.head.appendChild(css)}
    if(!document.querySelector('script[data-northern-module1-v3]')){const js=document.createElement('script');js.src=new URL('northern-module1-v3.js?v=20260910a',base);js.dataset.northernModule1V3='';document.head.appendChild(js)}
  }
  function recordModuleActivity(){
    const j=getJourney(),now=new Date().toISOString();
    j.region=j.region||'Northern Arizona';
    j.tracking=j.tracking||{};
    j.tracking.currentModule=`module${moduleNumber}`;
    j.tracking.lastActivityAt=now;
    if(moduleNumber===1&&!j.tracking.boostStartedAt)j.tracking.boostStartedAt=now;
    try{localStorage.setItem(journeyKey,JSON.stringify(j))}catch(_){}
    try{window.BOOSTCloud?.queueSave?.(j)}catch(_){}
  }
  const init=()=>{recordModuleActivity();if(moduleNumber===1){loadModule1Conversion();return}if(document.querySelector('.nbHud'))return;renderHud();addRegionalBanner();alignExperienceLanguage();guardRegionalLanguage()};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
