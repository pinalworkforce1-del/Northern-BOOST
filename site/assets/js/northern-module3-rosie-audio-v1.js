(()=>{
'use strict';
const frame=document.getElementById('activityFrame');
const ROSIE='https://pinalworkforce1-del.github.io/BOOST_Pathway-Portal/assets/images/rosie-master.webp';

function text(el){return String(el?.textContent||'').replace(/\s+/g,' ').trim().toLowerCase()}
function findAudioArea(d){
  const audio=d.querySelector('audio');
  if(audio){
    return audio.closest('.panel,section,article,.card,.audio-card,.audioCard,.narration,.narration-card') || audio.parentElement;
  }
  const control=[...d.querySelectorAll('button,a')].find(el=>/listen|audio|play narration|play audio|hear rosie|rosie/i.test(text(el)));
  if(control){
    return control.closest('.panel,section,article,.card,.audio-card,.audioCard,.narration,.narration-card') || control.parentElement;
  }
  return null;
}

function install(){
  let d;
  try{d=frame?.contentDocument}catch(_){return false}
  if(!d?.body||d.getElementById('boostM3RosieAudioVisual'))return false;
  const area=findAudioArea(d);
  if(!area)return false;

  const style=d.createElement('style');
  style.id='boostM3RosieAudioStyle';
  style.textContent=`
#boostM3RosieAudioVisual{display:flex;align-items:flex-end;gap:16px;margin:0 0 14px;padding:12px 14px 0;border-radius:14px;background:linear-gradient(135deg,#eef8f6,#f8fbfd);border:1px solid #cfe3e3;overflow:hidden}
#boostM3RosieAudioVisual .boostM3RosiePortrait{width:108px;max-height:155px;object-fit:contain;object-position:center bottom;align-self:flex-end;flex:0 0 auto}
#boostM3RosieAudioVisual .boostM3RosieCopy{padding:5px 0 14px;min-width:0}
#boostM3RosieAudioVisual .boostM3RosieKicker{font-size:11px;font-weight:900;letter-spacing:1.2px;text-transform:uppercase;color:#168c87;margin-bottom:4px}
#boostM3RosieAudioVisual .boostM3RosieTitle{font-size:18px;font-weight:900;color:#0b3158;line-height:1.25;margin-bottom:4px}
#boostM3RosieAudioVisual .boostM3RosieSub{font-size:12px;color:#617387;line-height:1.45}
@media(max-width:620px){#boostM3RosieAudioVisual{gap:10px;padding-left:10px}#boostM3RosieAudioVisual .boostM3RosiePortrait{width:78px;max-height:118px}#boostM3RosieAudioVisual .boostM3RosieTitle{font-size:16px}}
`;
  d.head.appendChild(style);

  const visual=d.createElement('div');
  visual.id='boostM3RosieAudioVisual';
  visual.innerHTML=`<img class="boostM3RosiePortrait" src="${ROSIE}" alt="Rosie, the BOOST guide"><div class="boostM3RosieCopy"><div class="boostM3RosieKicker">ROSIE • BOOST GUIDE</div><div class="boostM3RosieTitle">Listen with Rosie</div><div class="boostM3RosieSub">Use the audio controls below whenever you want Rosie to walk you through this part of Career Mobility.</div></div>`;
  area.insertBefore(visual,area.firstChild);
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
