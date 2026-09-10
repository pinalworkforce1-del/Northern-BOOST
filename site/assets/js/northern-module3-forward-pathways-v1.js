(()=>{
'use strict';
const JKEY='boost_naz_journey_v1',SKEY='northern_boost_career_exploration_v1';
const frame=document.getElementById('activityFrame');
let RELS=[];
const norm=v=>String(v||'');
const FALLBACK={
 '31-1131':{pathway:'Nursing',position:'Entry Point',bridge:['Licensed Practical / Vocational Nurse'],dest:['Registered Nurse'],why:'Nursing Assistant can build patient-care experience that supports advancement into licensed nursing roles with additional preparation.'},
 '15-1232':{pathway:'IT Systems & Analysis',position:'Entry Point',bridge:['Network / Systems Administrator','Computer Systems Analyst'],dest:['Computer & Information Systems Manager'],why:'User support can provide a credible entry point into systems and analysis work.'},
 '53-3032':{pathway:'Transportation & Logistics',position:'Skilled Entry',bridge:['Transportation / Material-Moving Supervisor','Dispatcher / Fleet Coordinator'],dest:['Transportation, Storage & Distribution Manager','Logistician'],why:'Commercial driving can build operational knowledge that supports movement into dispatch, supervision, fleet operations, and broader logistics roles.'},
 '53-7062':{pathway:'Logistics & Supply Chain',position:'Entry Point',bridge:['First-Line Transportation / Material-Moving Supervisor'],dest:['Logistician'],why:'Frontline material-moving work can build logistics experience that supports movement into supervision and higher-level logistics roles.'},
 '49-9071':{pathway:'Maintenance & Facilities Leadership',position:'Skilled Entry',bridge:['First-Line Supervisor of Mechanics / Installers / Repairers'],dest:['Facilities Manager','General & Operations Manager'],why:'Maintenance work can progress into repair supervision and facilities leadership.'},
 '43-4051':{pathway:'Customer Operations',position:'Entry Point',bridge:['First-Line Office / Administrative Support Supervisor'],dest:['Administrative Services Manager','General & Operations Manager'],why:'Customer service can transfer into administrative supervision and operations leadership.'},
 '41-2031':{pathway:'Retail & Sales Leadership',position:'Entry Point',bridge:['First-Line Retail Sales Supervisor'],dest:['General & Operations Manager','Sales Manager'],why:'Retail sales can build toward supervision, sales management, and operations.'},
 '35-3023':{pathway:'Food Service Leadership',position:'Entry Point',bridge:['Food Service Supervisor','Food Service Manager'],dest:['General & Operations Manager'],why:'Frontline food service can build toward supervision and food-service management.'},
 '47-2061':{pathway:'Construction Leadership',position:'Entry Point',bridge:['First-Line Supervisor of Construction Trades'],dest:['Construction Manager'],why:'Construction labor can build experience that supports movement toward trade supervision and, with additional preparation, construction management.'}
};
function read(k){try{return JSON.parse(localStorage.getItem(k)||'{}')||{}}catch(_){return{}}}
function write(k,o){o=o||{};o.region='Northern Arizona';o.updatedAt=new Date().toISOString();localStorage.setItem(k,JSON.stringify(o))}
async function ready(){try{const r=await window.BOOSTCareerRelationships?.load?.();RELS=r?.relationships||[]}catch(e){console.warn('Forward pathway load failed',e)}}
function derived(soc){
 const rows=RELS.filter(r=>norm(r.sourceSoc)===norm(soc)&&(r.destinations||[]).length);
 if(!rows.length)return null;
 const first=rows[0],names=[];
 rows.forEach(r=>(r.destinations||[]).forEach(d=>{const n=typeof d==='string'?d:(d?.title||d?.name||d?.label||d?.soc);if(n&&!names.includes(n))names.push(n)}));
 return{pathway:first.pathway||'Career pathway',position:first.position||'Starting point',bridge:names.slice(0,2),dest:names.slice(2,4),why:first.relationship||first.why||''};
}
function pathway(soc){return FALLBACK[norm(soc)]||derived(soc)}
function sequence(p){return [...(p?.bridge||[]),...(p?.dest||[])].filter(Boolean)}
function relationshipObject(p){if(!p)return null;const seq=sequence(p);return{kind:'forward_pathway',pathway:p.pathway,position:`${p.position||'Starting point'}${seq.length?' → '+seq.join(' → '):''}`,nextMoves:seq,why:p.why||''}}
function careers(st){const m3=st?.module3||{},m2=st?.module2||{},m1=st?.module1||{};return (m3.careers?.length?m3.careers:(m2.careers?.length?m2.careers:(m1.selected?.length?m1.selected:m1.careers||[]))).filter(x=>x?.soc).slice(0,3)}
function patchStore(k){
 const st=read(k),list=careers(st);if(!list.length)return;
 st.module3=st.module3||{};st.module3.mobilitySignalsBySoc=st.module3.mobilitySignalsBySoc||{};
 st.module3.decisionEvidence=st.module3.decisionEvidence||{};st.module3.decisionEvidence.mobilitySignalsBySoc=st.module3.decisionEvidence.mobilitySignalsBySoc||{};
 list.forEach(c=>{const p=pathway(c.soc);if(!p)return;const rel=relationshipObject(p);const sig=st.module3.mobilitySignalsBySoc[c.soc]||{};if(sig.relationship&&sig.relationship.kind!=='forward_pathway'&&!sig.mobilityRelationship)sig.mobilityRelationship=sig.relationship;sig.relationship=rel;sig.forwardPathway=p;st.module3.mobilitySignalsBySoc[c.soc]=sig;const ds=st.module3.decisionEvidence.mobilitySignalsBySoc[c.soc]||{};if(ds.relationship&&ds.relationship.kind!=='forward_pathway'&&!ds.mobilityRelationship)ds.mobilityRelationship=ds.relationship;ds.relationship=rel;ds.forwardPathway=p;st.module3.decisionEvidence.mobilitySignalsBySoc[c.soc]=ds});
 write(k,st);
}
function persist(){patchStore(SKEY);patchStore(JKEY)}
function text(p){const seq=sequence(p);return `${p.pathway} • ${p.position||'Starting point'}${seq.length?' → '+seq.join(' → '):''}`}
function updateCards(){
 try{const d=frame?.contentDocument;if(!d?.body)return;d.querySelectorAll('.boostM3CareerCompare[data-soc]').forEach(card=>{const cell=[...card.querySelectorAll('.boostM3Evidence')].find(x=>/Career relationship|Career pathway/i.test(x.querySelector('span')?.textContent||''));if(!cell)return;const p=pathway(card.dataset.soc);if(!p)return;const label=cell.querySelector('span'),b=cell.querySelector('b');if(label)label.textContent='Career pathway';if(b)b.textContent=text(p)});persist()}catch(e){console.warn('Forward pathway display failed',e)}
}
function bindDoc(){try{const d=frame?.contentDocument;if(!d?.body||d.body.__boostForwardPathBound)return;d.body.__boostForwardPathBound=true;d.addEventListener('click',e=>{if(e.target?.closest?.('#boostM3CompareLane,[data-v2-decision]')){setTimeout(updateCards,100);setTimeout(updateCards,350)}},true);setTimeout(updateCards,900)}catch(e){console.warn('Forward pathway bind failed',e)}}
async function init(){await ready();persist();if(frame){frame.addEventListener('load',()=>setTimeout(bindDoc,650));setTimeout(bindDoc,1500)}document.getElementById('finishBtn')?.addEventListener('click',()=>{persist()},true)}
init();
})();