(()=>{
'use strict';
const JK='boost_naz_journey_v1',SK='northern_boost_career_exploration_v1';
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'{}')||{}}catch(_){return{}}};
function module4Done(){
  const j=read(JK),s=read(SK),m={...(s.module4||{}),...(j.module4||{})},p=j.progress||{};
  return p.module4==='complete'||!!m.completedAt||!!((m.careerTarget||m.targetCareer||m.career)&&m.participantDirection&&m.answers);
}
window.addEventListener('click',e=>{
  const el=e.target?.closest?.('[data-applied]');
  if(!el||!module4Done())return;
  const href=el.getAttribute('href');
  if(!href||href.startsWith('#'))return;
  e.preventDefault();
  e.stopImmediatePropagation();
  localStorage.setItem('boost_naz_pathway_v1','career');
  location.assign(href);
},true);
})();
