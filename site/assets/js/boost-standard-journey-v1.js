(()=>{
'use strict';

const file=(location.pathname.split('/').pop()||'').toLowerCase();
const isM1=file==='northern_boost_module1_pinalflow_v1.html';
const isM2=file==='northern_boost_module2_pinalflow_v1.html';
const isM4=file==='module4-v4.html';
if(!isM1&&!isM2&&!isM4)return;

const config=isM1?{
  active:0,
  here:'Start with your interests and identify careers worth exploring.'
}:isM2?{
  active:1,
  here:'Test your careers against wages, preparation, life fit, and Northern Arizona opportunity.'
}:{
  active:3,
  here:'Turn the evidence you gathered into a direction for what comes next.'
};

const stages=['Discover','Validate','Explore Skills','Decide','Experience','Close the Gap','Launch'];

function ensureCss(){
  if(document.querySelector('link[data-boost-standard-journey]'))return;
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href='assets/css/boost-standard-journey-v1.css?v=20260911a';
  link.dataset.boostStandardJourney='1';
  document.head.appendChild(link);
}

function makeJourney(){
  const wrap=document.createElement('div');
  wrap.className='journeyWrap noPrint';
  wrap.id='boostStandardJourney';
  wrap.innerHTML=`<div class="journey"><div class="journeyLabel">Your BOOST Journey</div><div class="journeyTrack" aria-label="BOOST journey progress">${stages.map((name,i)=>`<div class="journeyStage${i<config.active?' done':''}${i===config.active?' active':''}"><span>${name}</span></div>`).join('')}</div><div class="journeyYou"><strong>You are here:</strong> ${config.here}</div></div>`;
  return wrap;
}

function removeLegacy(){
  if(isM1){
    document.querySelector('.rail')?.remove();
  }
  if(isM2){
    [...document.querySelectorAll('body > .journey')].forEach(el=>el.remove());
  }
  if(isM4){
    const old=[...document.querySelectorAll('main .wrap > .panel')].find(el=>/your boost progression/i.test(el.textContent||''));
    old?.remove();
  }
}

function install(){
  if(document.getElementById('boostStandardJourney'))return true;
  const hero=document.querySelector('header.hero,.hero');
  if(!hero)return false;
  ensureCss();
  removeLegacy();
  hero.insertAdjacentElement('afterend',makeJourney());
  document.dispatchEvent(new CustomEvent('boost:standard-journey-ready'));
  return true;
}

function run(){
  let tries=0;
  const timer=setInterval(()=>{
    if(install()||++tries>50)clearInterval(timer);
  },120);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});
else run();
})();
