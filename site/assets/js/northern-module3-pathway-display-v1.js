(()=>{
'use strict';
const frame=document.getElementById('activityFrame');
let RELS=[];
const norm=v=>String(v||'');
async function ready(){
  try{
    const d=await window.BOOSTCareerRelationships?.load?.();
    RELS=d?.relationships||[];
  }catch(e){console.warn('Pathway display load failed',e)}
}
function memberships(soc){return RELS.filter(r=>norm(r.sourceSoc)===norm(soc))}
function positionFor(soc,path){const r=RELS.find(x=>norm(x.sourceSoc)===norm(soc)&&x.pathway===path);return r?.position||''}
function direct(from,to){return RELS.find(r=>norm(r.sourceSoc)===norm(from)&&(r.destinations||[]).some(d=>norm(d.soc)===norm(to)))}
function describe(from,to){
  const d=direct(from,to);
  if(d){const tp=positionFor(to,d.pathway);return `${d.pathway} • ${d.position||'Current role'} → ${tp||'Related destination'}`}
  const a=memberships(from),b=memberships(to),same=a.find(x=>b.some(y=>y.pathway===x.pathway));
  if(same){const tp=positionFor(to,same.pathway);return `${same.pathway} • ${same.position||'Current role'} → ${tp||'Related pathway role'}`}
  if(b.length){const t=b[0];return `${t.pathway} • ${t.position||'Mapped pathway role'} • No specific progression from your starting occupation is mapped; this is pathway context, not a promise of advancement.`}
  return 'No specific mapped progression is available for this career yet. You can still keep exploring it using interests, preparation, transferable experience, and Northern regional evidence.';
}
function apply(){
  try{
    const d=frame.contentDocument,w=frame.contentWindow;
    if(!d||!w)return;
    const cur=w.__BOOST_NAZ_M3_API?.getCurrent?.();
    d.querySelectorAll('.boostM3CareerCompare[data-soc]').forEach(card=>{
      const cell=[...card.querySelectorAll('.boostM3Evidence')].find(x=>x.querySelector('span')?.textContent?.trim()==='Career relationship');
      const b=cell?.querySelector('b');
      if(!b)return;
      const next=describe(cur?.soc,card.dataset.soc);
      if(b.textContent!==next)b.textContent=next;
    });
  }catch(e){console.warn('Pathway display apply failed',e)}
}
function bindDocument(){
  try{
    const d=frame.contentDocument;
    if(!d?.body||d.body.__boostPathDisplayBound)return;
    d.body.__boostPathDisplayBound=true;
    d.addEventListener('click',e=>{
      if(e.target?.closest?.('#boostM3CompareLane,#boostM3WorkLane,[data-v2-decision]'))setTimeout(apply,80);
    },true);
    setTimeout(apply,250);
    setTimeout(apply,900);
  }catch(e){console.warn('Pathway display bind failed',e)}
}
async function bind(){
  await ready();
  frame.addEventListener('load',()=>setTimeout(bindDocument,500));
  setTimeout(bindDocument,1300);
}
bind();
})();