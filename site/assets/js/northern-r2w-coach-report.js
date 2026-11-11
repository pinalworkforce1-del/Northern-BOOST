/* Northern Ready2Work coach reporting, based on Pinal Coach View layout. */
(()=>{
'use strict';
const cfg=window.BOOST_CONFIG||{};
const endpoint=(cfg.supabaseUrl||'https://dxcajwarqojvmbteroco.supabase.co')+'/functions/v1/boost-northern-ready2work-report';
const key=cfg.supabaseAnonKey||'';
const TOKEN='boost-coach-staff-token-v1';
const cache=new Map();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=d=>d?new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'—';
const skillDefs=[['COM','Communication',27],['PRO','Professionalism & Integrity',25],['PSA','Problem Solving & Adaptability',14],['TEAM','Teamwork & Collaboration',9],['TIME','Planning & Time Management',11],['QUAL','Quality & Attention to Detail',9]];
const sceneNames={1:'Running Late',2:'Unclear Instructions',3:'The Mistake',4:'Coworker Falling Behind',5:'Three Priorities',6:'Upset Customer',7:'Confidential Information',8:'Shift Handoff',9:'Procedure Changed',10:'Quality vs. Speed',11:'Coworker Conflict',12:'Schedule Mix-Up',21:'Make My Title Better',22:'The Employment Gap',23:'Are You an Expert?',24:'One Resume for Everything',25:'Duties or Accomplishments?',31:'Interview Tomorrow',32:'Getting There',33:'Tell Me About Yourself',34:'Difficult Coworker Question',35:'Tell Me About a Mistake'};
const section=(title,body)=>'<section class="detailSection"><h3>'+esc(title)+'</h3>'+body+'</section>';
async function call(action,body){
 const token=localStorage.getItem(TOKEN);
 if(!token)throw Error('Please sign in to Northern Coach View again.');
 const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',apikey:key,Authorization:'Bearer '+key,'X-BOOST-Staff-Token':token},body:JSON.stringify({action,...body})});
 const data=await res.json().catch(()=>({}));
 if(!res.ok)throw Error(data.error||'Unable to load Northern Ready 2 Work results');
 return data;
}
async function refresh(rows){
 const ids=rows.map(r=>r.journey_id).filter(Boolean);
 if(!ids.length)return;
 try{
  for(let i=0;i<ids.length;i+=75){
   const data=await call('summary',{journey_ids:ids.slice(i,i+75)});
   for(const x of data.summaries||[])cache.set(x.journey_id,x.ready2work);
  }
  for(const row of rows){
   const host=document.querySelector('[data-r2w-report="'+CSS.escape(row.journey_id)+'"]');
   if(!host)continue;
   const p=cache.get(row.journey_id);
   if(!p){host.innerHTML='';continue;}
   host.innerHTML='<div class="r2wCoachBar"><strong>Ready 2 Work</strong><span>'+p.scenario_count+' / 22 scenarios · Base Camp '+p.stage_counts.softskills+'/12 · Resume Retreat '+p.stage_counts.resume+'/5 · Interview Landing '+p.stage_counts.interview+'/5</span><button type="button" class="btn alt" data-r2w-report-open="'+esc(row.journey_id)+'">View Ready 2 Work Results</button></div>';
  }
  document.querySelectorAll('[data-r2w-report-open]').forEach(b=>b.onclick=()=>open(b.dataset.r2wReportOpen,rows));
 }catch(e){console.warn('Northern Ready2Work coach reporting:',e.message)}
}
async function open(id,rows){
 const r=rows.find(x=>String(x.journey_id)===String(id));if(!r)return;
 const title=document.getElementById('drawerTitle'),meta=document.getElementById('drawerMeta'),body=document.getElementById('drawerBody'),drawer=document.getElementById('drawerBack');
 title.textContent=(r.participant_name||'Participant')+' • Ready 2 Work';
 meta.textContent=[r.participant_email,'Northern BOOST Ready 2 Work','Learning evidence'].filter(Boolean).join(' • ');
 body.innerHTML='<div class="notice">Loading Ready 2 Work results…</div>';drawer.classList.add('show');
 try{
  const result=await call('detail',{journey_id:id}),p=result.ready2work;
  if(!p){body.innerHTML='<div class="notice">No Northern Ready 2 Work results saved yet.</div>';return;}
  const count=Number(p.scenario_count||0),st=p.stage_counts||{};
  const scores=skillDefs.map(([key,name,max])=>{
   const raw=Number(p.skill_scores?.[key]||0),pct=Math.round(100*Math.max(0,raw)/max);
   const level=pct>=85?'Advanced':pct>=68?'Strong':pct>=48?'Demonstrated':'Developing';
   return '<tr><th>'+esc(name)+'</th><td><b>'+raw+' / '+max+'</b> ('+pct+'%)</td><td><strong>'+level+'</strong><div class="r2wMeter"><i style="width:'+Math.min(100,pct)+'%"></i></div></td></tr>';
  }).join('');
  const answered=p.scenario_answers||{};
  const evidence=Object.keys(answered).sort((a,b)=>Number(a)-Number(b)).map(k=>'<tr><th>'+esc(sceneNames[k]||'Scenario '+k)+'</th><td>'+esc(answered[k])+'</td></tr>').join('');
  const resume=p.resume||{};
  const experiences=Array.isArray(resume.experiences)?resume.experiences:[];
  let html=section('Progress','<p><b>'+count+'/22</b> scenarios · Soft Skills Base Camp: <b>'+Number(st.softskills||0)+'/12</b> · Resume Retreat: <b>'+Number(st.resume||0)+'/5</b> · Interview Landing: <b>'+Number(st.interview||0)+'/5</b></p><p>Résumé: <b>'+(p.resume_complete?'Complete':'Pending')+'</b> · Jacqueline Mock Interview: <b>'+(p.interview_complete?'Verified':'Pending')+'</b> · Certificate: <b>Not yet issued</b></p><p class="notice">Last cloud save: '+esc(fmt(p.updated_at))+'</p>');
  html+=section('Six Employability Competencies','<p class="notice"><b>'+(count<22?'Provisional learning evidence: ':'Learning evidence: ')+'</b>Scores reflect points accumulated across the complete 22-scenario framework. Levels shown below use the Pinal Coach View thresholds (Advanced 85–100%, Strong 68–84%, Demonstrated 48–67%, Developing below 48%). Until all scenarios are complete, these are not final competency levels. These are learning indicators, not standardized employment assessments.</p><table class="r2wTable"><thead><tr><th>Competency</th><th>Evidence score</th><th>Mastery level</th></tr></thead><tbody>'+scores+'</tbody></table>');
  html+=section('Scenario Evidence','<p>'+Object.keys(answered).length+' saved decisions. Choices document learning activity and should be discussed with the participant, not used as a standalone hiring score.</p>'+(evidence?'<table class="r2wTable"><thead><tr><th>Scenario</th><th>Selected option</th></tr></thead><tbody>'+evidence+'</tbody></table>':'<p>No scenario decisions saved.</p>'));
  html+=section('Resume Retreat',p.resume_complete?'<p><b>Target:</b> '+esc(resume.target||'—')+'</p><p><b>Summary:</b> '+esc(resume.summary||'—')+'</p><p><b>Skills:</b> '+esc(resume.skills||'—')+'</p><p><b>Education:</b> '+esc(resume.education||'—')+'</p>'+experiences.map(e=>'<p><b>'+esc([e.role,e.employer].filter(Boolean).join(' — '))+'</b> '+esc([e.startDate,e.endDate].filter(Boolean).join(' to '))+' '+esc((e.bullets||[]).join('; ')||e.evidence||'')+'</p>').join(''):'<p>Résumé not yet verified complete.</p>');
  html+=section('Interview Landing','<p>'+(p.interview_complete?'Jacqueline interview completion verified.':'Jacqueline live interview not yet verified complete.')+'</p><p class="notice">Detailed interview feedback will appear when the Northern callback integration is validated.</p>');
  html+=section('Certificate','<p>Northern Ready 2 Work certificate issuance remains in validation.</p>');
  html+=section('Coach discussion','<p class="coachNote">Review decisions with the participant. Ask for examples of how they would apply these skills at work, identify areas to practice, and agree on a next action. Do not interpret incomplete competency scores as final results.</p>');
  body.innerHTML=html;
 }catch(e){body.innerHTML='<div class="notice">'+esc(e.message)+'</div>'}
}
window.NorthernR2WReport={refresh,open};
})();