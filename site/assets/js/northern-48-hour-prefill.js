(()=>{'use strict';
const JOURNEY_KEY='boost_naz_journey_v1';
const PLAN_KEY='northern_boost_rapid_skill_mobility_v2';
const JOB_KEY='boost48JobSearchV11';
const MODULE='jobsearch';
const read=(k,fb={})=>{try{return JSON.parse(localStorage.getItem(k)||'null')||fb}catch{return fb}};
const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
function mobilityEvidence(){
 const j=read(JOURNEY_KEY,{}),m=j.modules?.skillmobility;
 if(m&&(m.confirmedSkills?.length||m.confirmedPriorSkillIds?.length||m.skillAssessment))return m;
 const p=read(PLAN_KEY,{});
 return p?.confirmedSkills?.length?p:null;
}
function rankedSkills(src){
 const labels={communication:'Communication',customer:'Customer service',numbers:'Handling transactions and numbers',teamwork:'Teamwork and collaboration',accuracy:'Accuracy and attention to detail',adaptability:'Adaptability',problem:'Problem solving',people:'Working with people',detail:'Attention to detail',digital:'Digital skills',lead:'Leadership',hands:'Hands-on work'};
 const assessed=src?.skillAssessment;
 const confirmed=[...(src?.confirmedSkills||[]),...(Array.isArray(assessed?.confirmedSkills)?assessed.confirmedSkills:[]),...(src?.confirmedPriorSkillIds||[])];
 const raw=confirmed.map((x,i)=>{const value=String(typeof x==='string'?x:(x?.label||x?.name||x?.skill||'')).trim();return {label:labels[value]||(/^[a-z][a-z0-9_]{1,15}$/.test(value)?'':value),i}}).filter(x=>x.label);
 const freq=new Map();
 for(const c of src?.selectedCareers||[]){for(const label of c?.skills?.transfer||[]){const k=norm(label);if(k)freq.set(k,(freq.get(k)||0)+1)}}
 const seen=new Set();
 return raw.filter(x=>{const k=norm(x.label);if(!k||seen.has(k))return false;seen.add(k);return true}).sort((a,b)=>(freq.get(norm(b.label))||0)-(freq.get(norm(a.label))||0)||a.i-b.i).map(x=>x.label);
}
function addCarryForwardNote(inputs,filled,total){
 if(!inputs.length||document.getElementById('boostMobilitySkillsNote'))return;
 const note=document.createElement('div');note.id='boostMobilitySkillsNote';note.className='preview';note.style.margin='8px 0 2px';
 if(filled>0)note.innerHTML=`<strong>Carried forward from Skill Mobility:</strong> ${filled} confirmed skill area${filled===1?'':'s'} ${filled===1?'was':'were'} added to your inventory. BOOST prioritized skills that also transferred into the careers you researched. Keep, edit, or replace them for the jobs you are targeting now.`;
 else note.innerHTML=`<strong>Skill Mobility evidence available:</strong> BOOST found ${total} confirmed skill area${total===1?'':'s'}, but your saved 48-Hour Job Search inventory was already filled in, so it was left unchanged.`;
 inputs[2]?.insertAdjacentElement('afterend',note);
}
function prefillSkills(){
 const src=mobilityEvidence();if(!src)return;
 const candidates=rankedSkills(src);if(!candidates.length)return;
 const inputs=[...document.querySelectorAll('input[data-list="skills"]')].sort((a,b)=>Number(a.dataset.index)-Number(b.dataset.index));if(!inputs.length)return;
 const used=new Set(inputs.map(x=>norm(x.value)).filter(Boolean));let filled=0;
 for(const input of inputs){if(input.value.trim())continue;const next=candidates.find(x=>!used.has(norm(x)));if(!next)break;input.value=next;used.add(norm(next));input.dispatchEvent(new Event('input',{bubbles:true}));filled++}
 addCarryForwardNote(inputs,filled,candidates.length);
}
function prefillIdentity(){
 const j=read(JOURNEY_KEY,{}),rapid=j.modules?.['rapid-discover']||{},mobility=j.modules?.skillmobility||{},job=read(JOB_KEY,{});
 const name=String(j.participant?.name||j.participant_name||'').trim();
 const target=String(mobility.considerations?.[0]?.title||mobility.priorOccupation||rapid.priorOccupation||'').trim();
 for(const [key,value] of [['participantName',name],['targetRole',target]]){
  const field=document.querySelector('[data-save="'+key+'"]');
  if(field&&!field.value.trim()&&!String(job.values?.[key]||'').trim()&&value){
   field.value=value;
   field.dispatchEvent(new Event('input',{bubbles:true}));
  }
 }
}
function saveJobSearchJourney(){
 const job=read(JOB_KEY,null);if(!job?.completed)return;
 const j=read(JOURNEY_KEY,{}),now=new Date().toISOString();j.schema_version=Math.max(Number(j.schema_version)||0,2);j.region='Northern Arizona';j.modules=j.modules||{};j.progress=j.progress||{};
 j.modules[MODULE]={module:MODULE,source:'northern_48_hour_job_search',version:12,completedAt:now,targetRole:String(job.values?.targetRole||'').trim()||null,skills:(job.lists?.skills||[]).filter(Boolean),accomplishments:(job.lists?.accomplishments||[]).filter(Boolean),targetEmployers:(job.lists?.employers||[]).filter(Boolean),contacts:(job.lists?.contacts||[]).filter(Boolean),phases:job.phases||{},activities:job.activities||{},commitment:String(job.values?.commitment||'').trim()||null};
 j.progress[MODULE]='complete';j.updated_at=now;localStorage.setItem(JOURNEY_KEY,JSON.stringify(j));
}
function prefillFromPortalHandoff(){
 let packet=null;
 try{const hash=new URLSearchParams(location.hash.replace(/^#/,''));packet=JSON.parse(hash.get('boost_prefill')||'null')}catch{}
 if(!packet||typeof packet!=='object')return;
 const job=read(JOB_KEY,{});
 for(const [key,value] of [['participantName',packet.name],['targetRole',packet.target]]){
  const field=document.querySelector('[data-save="'+key+'"]');
  if(field&&!field.value.trim()&&!String(job.values?.[key]||'').trim()&&typeof value==='string'&&value.trim()){
   field.value=value.slice(0,120);field.dispatchEvent(new Event('input',{bubbles:true}));
  }
 }
 const inputs=[...document.querySelectorAll('input[data-list="skills"]')].sort((a,b)=>Number(a.dataset.index)-Number(b.dataset.index));
 const skills=Array.isArray(packet.skills)?packet.skills.filter(x=>typeof x==='string'&&x.trim()).slice(0,3):[];
 inputs.forEach((el,i)=>{if(!el.value.trim()&&skills[i]){el.value=skills[i].slice(0,100);el.dispatchEvent(new Event('input',{bubbles:true}))}});
 // Remove the fragment after successful local capture; subsequent revisits use saved fields.
 history.replaceState(null,'',location.pathname+location.search);
}
function install(){
 setTimeout(()=>{prefillFromPortalHandoff();prefillIdentity();prefillSkills()},80);
 const finish=document.querySelector('[data-finish]');if(finish)finish.addEventListener('click',()=>setTimeout(saveJobSearchJourney,180));
 if(read(JOB_KEY,{}).completed)saveJobSearchJourney();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();