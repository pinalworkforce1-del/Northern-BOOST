(()=>{
'use strict';
const frame=document.getElementById('activityFrame');
const ROSIE='https://pinalworkforce1-del.github.io/BOOST_Pathway-Portal/assets/images/rosie-master.webp';

function install(){
  let d;
  try{d=frame?.contentDocument}catch(_){return false}
  if(!d?.body)return false;

  // Remove the earlier standalone Rosie card if it exists.
  d.getElementById('boostM3RosieAudioVisual')?.remove();

  // The Career Mobility intro already has its audio box BELOW the visual/header.
  // Rosie belongs inside that existing audio box; do not move or replace the player.
  const box=d.querySelector('.openingExperience .audioBox') || d.querySelector('.audioBox');
  if(!box)return false;

  if(!d.getElementById('boostM3RosieAudioStyle')){
    const style=d.createElement('style');
    style.id='boostM3RosieAudioStyle';
    style.textContent=`
.audioBox.boostM3RosieAudioBox{position:relative;padding-left:132px!important;min-height:112px;overflow:hidden}
.audioBox.boostM3RosieAudioBox .boostM3RosiePortrait{position:absolute;left:18px;bottom:0;width:96px;max-height:108px;object-fit:contain;object-position:center bottom;pointer-events:none}
@media(max-width:680px){.audioBox.boostM3RosieAudioBox{padding-left:96px!important;min-height:100px}.audioBox.boostM3RosieAudioBox .boostM3RosiePortrait{left:10px;width:72px;max-height:94px}}
@media(max-width:480px){.audioBox.boostM3RosieAudioBox{padding-left:16px!important;padding-top:92px!important}.audioBox.boostM3RosieAudioBox .boostM3RosiePortrait{left:16px;top:4px;bottom:auto;width:68px;max-height:84px}}
`;
    d.head.appendChild(style);
  }

  box.classList.add('boostM3RosieAudioBox');
  if(!box.querySelector('.boostM3RosiePortrait')){
    const img=d.createElement('img');
    img.className='boostM3RosiePortrait';
    img.src=ROSIE;
    img.alt='Rosie, the BOOST guide';
    img.onerror=()=>img.remove();
    box.insertBefore(img,box.firstChild);
  }
  return true;
}

function run(){
  let tries=0;
  const timer=setInterval(()=>{
    if(install()||++tries>60)clearInterval(timer);
  },250);
}
frame?.addEventListener('load',run);
run();
})();
