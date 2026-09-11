(()=>{
'use strict';
const ROSIE='https://pinalworkforce1-del.github.io/BOOST_Pathway-Portal/assets/images/rosie-master.webp';

function install(){
  if(document.getElementById('boostM4RosieAudioCard')) return true;

  const introAudio=document.querySelector('.hero .introAudio') || document.querySelector('.introAudio');
  const audio=introAudio?.querySelector('audio') || document.querySelector('.hero audio');
  const progressPanel=document.querySelector('main .wrap > .panel');
  if(!audio || !progressPanel) return false;

  if(!document.getElementById('boostM4RosieAudioStyle')){
    const style=document.createElement('style');
    style.id='boostM4RosieAudioStyle';
    style.textContent=`
#boostM4RosieAudioCard{display:grid;grid-template-columns:120px minmax(0,1fr);gap:18px;align-items:center;background:linear-gradient(135deg,#eef8f6,#f8fbfd);border-color:#cfe3e3;overflow:hidden;padding:16px 20px 16px 14px}
#boostM4RosieAudioCard .boostM4RosieWrap{align-self:stretch;display:flex;align-items:flex-end;justify-content:center}
#boostM4RosieAudioCard .boostM4RosiePortrait{display:block;width:102px;max-height:135px;object-fit:contain;object-position:center bottom;margin-bottom:-16px}
#boostM4RosieAudioCard .boostM4RosieKicker{font-size:.72rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:#168c87;margin-bottom:3px}
#boostM4RosieAudioCard h2{margin:.1rem 0 .35rem;color:#102b46;font-size:1.22rem}
#boostM4RosieAudioCard p{margin:0 0 10px;color:#61717e;font-size:.9rem}
#boostM4RosieAudioCard .boostM4AudioHost{margin:0}
#boostM4RosieAudioCard audio{width:100%;max-width:560px;display:block}
@media(max-width:640px){#boostM4RosieAudioCard{grid-template-columns:86px minmax(0,1fr);gap:10px;padding-left:8px}#boostM4RosieAudioCard .boostM4RosiePortrait{width:76px;max-height:105px;margin-bottom:-16px}#boostM4RosieAudioCard h2{font-size:1.05rem}}
`;
    document.head.appendChild(style);
  }

  const card=document.createElement('section');
  card.id='boostM4RosieAudioCard';
  card.className='panel';
  card.innerHTML=`<div class="boostM4RosieWrap"><img class="boostM4RosiePortrait" src="${ROSIE}" alt="Rosie, the BOOST guide"></div><div><div class="boostM4RosieKicker">ROSIE • BOOST GUIDE</div><h2>Listen with Rosie</h2><p>Rosie can walk you through how Module 4 turns the evidence you have gathered into a direction.</p><div class="boostM4AudioHost"></div></div>`;

  const host=card.querySelector('.boostM4AudioHost');
  if(introAudio){
    introAudio.classList.add('boostM4AudioHost');
    introAudio.style.marginTop='0';
    host.replaceWith(introAudio);
  }else{
    host.appendChild(audio);
  }

  progressPanel.insertAdjacentElement('afterend',card);
  return true;
}

function run(){
  let tries=0;
  const timer=setInterval(()=>{
    if(install() || ++tries>40) clearInterval(timer);
  },200);
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true});
else run();
})();
