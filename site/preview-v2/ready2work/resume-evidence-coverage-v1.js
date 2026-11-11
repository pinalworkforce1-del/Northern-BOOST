/* Northern BOOST — Rosie evidence coverage and one-responsibility-at-a-time drafting.
 * The participant's original description is immutable by Rosie; bullets require approval.
 * Legacy saved bullets remain intact; no destructive migration.
 */
(function(){
'use strict';
function create(ctx){
 const {$,resumeData,syncActiveExperience,saveState,renderResumeBuilder,renderResumePreview,callR2WResumeAI,showResumeCoach,escapeHtml:esc}=ctx;
 const safe=v=>esc(String(v??''));
 const stamp=()=>new Date().toISOString();
 const split=raw=>String(raw||'').split(/[,;\n]+/).map(x=>x.trim()).filter(Boolean);
 const norm=x=>String(x||'').trim().toLocaleLowerCase();
 const active=exp=>(exp?.evidenceItems||[]).filter(x=>!x.retired);
 function sync(exp){
   if(!exp)return [];
   exp.evidenceItems=Array.isArray(exp.evidenceItems)?exp.evidenceItems:[];
   const matched=new Set();
   for(const text of split(exp.evidence)){
     const existing=exp.evidenceItems.find(x=>!matched.has(x.id)&&norm(x.text)===norm(text));
     if(existing){existing.retired=false;matched.add(existing.id);}
     else{
       const item={id:'e-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10),text,status:'unreviewed',clarifications:[],createdAt:stamp(),retired:false};
       exp.evidenceItems.push(item);matched.add(item.id);
     }
   }
   exp.evidenceItems.forEach(x=>{if(!matched.has(x.id))x.retired=true;});
   const items=active(exp);
   if(!items.some(x=>x.id===exp.activeEvidenceId))exp.activeEvidenceId=(items.find(x=>x.status!=='approved')||items[0])?.id||null;
   return items;
 }
 function get(){
   const d=resumeData();
   syncActiveExperience(d);
   const exp=d.experiences?.[d.activeExperience||0]||null;
   if(exp)sync(exp);
   const item=exp?active(exp).find(x=>x.id===exp.activeEvidenceId)||active(exp)[0]||null:null;
   return {d,exp,item};
 }
 function showCoverage(){
   const box=$('rbEvidenceCoverage');if(!box)return;
   const {exp,item}=get(),items=exp?active(exp):[];
   if(!items.length){
     box.innerHTML='<p class="evidence-coverage-empty">Describe what you actually did above. Separate responsibilities with commas or new lines so Rosie can help you develop each one.</p>';
     return;
   }
   const done=items.filter(x=>x.status==='approved').length;
   const retired=(exp.evidenceItems||[]).filter(x=>x.retired&&x.status==='approved').length;
   box.innerHTML='<div class="evidence-coverage-heading"><strong>Evidence coverage</strong><p>'+done+' of '+items.length+' responsibilities have a reviewed résumé bullet. All of your original evidence is preserved.</p></div>'+
     '<div class="evidence-coverage-items">'+items.map(x=>'<button type="button" class="evidence-coverage-item'+(x.id===item?.id?' selected':'')+'" data-evidence-id="'+safe(x.id)+'" aria-pressed="'+(x.id===item?.id)+'"><span>'+safe(x.text)+'</span><span class="evidence-coverage-status">'+(x.status==='approved'?'✓ Bullet added':x.drafts?'Rosie draft ready':'Needs a bullet')+'</span></button>').join('')+'</div>'+
     (retired?'<p class="evidence-coverage-warning">Some previously approved bullets came from source descriptions you have changed or removed. Review them before sharing your résumé.</p>':'');
   box.querySelectorAll('[data-evidence-id]').forEach(button=>button.onclick=()=>{
     exp.activeEvidenceId=button.dataset.evidenceId;saveState();showCoverage();showDrafts();
     const chosen=active(exp).find(x=>x.id===exp.activeEvidenceId);
     showResumeCoach('rbBulletCoach','<b>Now coaching:</b> '+safe(chosen?.text)+'<br>Rosie will focus on this responsibility without dropping your other evidence.');
   });
 }
 function showDrafts(){
   const choices=$('rbBulletChoices'),approval=$('rbBulletApproval');
   if(!choices||!approval)return;
   choices.innerHTML='';approval.innerHTML='';
   const {item}=get();
   if(!item?.drafts)return;
   const drafts=[{key:'clearDirect',label:'Clear & Direct',text:item.drafts.clearDirect},{key:'skillsForward',label:'Skills Forward',text:item.drafts.skillsForward}].filter(x=>x.text);
   choices.innerHTML='<p class="rosie-draft-guidance">Rosie drafted wording for the selected responsibility. Other responsibilities remain available in Evidence coverage.</p>'+
     drafts.map(x=>'<button type="button" class="rosie-draft'+(item.selectedDraft===x.key?' selected':'')+'" data-rb-draft="'+x.key+'"><b>'+safe(x.label)+'</b><span>'+safe(x.text)+'</span></button>').join('');
   choices.querySelectorAll('[data-rb-draft]').forEach(button=>button.onclick=()=>{
     item.selectedDraft=button.dataset.rbDraft;saveState();showDrafts();
   });
   if(!item.selectedDraft||!item.drafts[item.selectedDraft])return;
   const selected=item.drafts[item.selectedDraft];
   approval.innerHTML='<div class="bullet-approval"><strong>Confirm the selected bullet</strong><p>'+safe(selected)+'</p><label class="bullet-confirm"><input type="checkbox" id="rbBulletAttest"> I performed this work and can explain every claim in this bullet.</label><button type="button" class="primary-btn" id="rbApproveBullet">'+(item.status==='approved'?'Replace this reviewed bullet':'Confirm & add reviewed bullet')+'</button><p class="bullet-approval-status" role="status"></p></div>';
   $('rbApproveBullet').onclick=()=>{
     const message=approval.querySelector('.bullet-approval-status');
     if(!$('rbBulletAttest').checked){message.textContent='Confirm the statement is accurate before adding it.';return;}
     const {exp,current}=(()=>{const data=get();return {exp:data.exp,current:data.item};})();
     if(current!==item||!current.drafts||current.drafts[current.selectedDraft]!==selected){
       message.textContent='Your evidence has changed. Ask Rosie to review it again.';return;
     }
     exp.bullets=Array.isArray(exp.bullets)?exp.bullets:[];
     if(item.approvedBullet&&item.approvedBullet!==selected)exp.bullets=exp.bullets.filter(x=>x!==item.approvedBullet);
     if(!exp.bullets.includes(selected))exp.bullets.push(selected);
     item.approvedBullet=selected;item.approvedAt=stamp();item.status='approved';
     saveState();renderResumeBuilder();renderResumePreview();
     showResumeCoach('rbBulletCoach','<b>Reviewed bullet added.</b><br>Your original description remains saved. Select another uncovered responsibility to develop the next bullet.');
   };
 }
 function render(){showCoverage();showDrafts();}
 function source(item){
   return [item.text,...(Array.isArray(item.clarifications)?item.clarifications:[]).map(x=>'Participant clarification: '+String(x.answer||''))].join('\n');
 }
 async function coach(){
   const {d,exp,item}=get(),btn=$('rbBuildBullet');
   if(!item){showResumeCoach('rbBulletCoach','<b>Describe your experience first.</b><br>Use commas or new lines to separate responsibilities. Rosie will help with each one.');$('rbEvidence')?.focus();return;}
   const expIndex=d.activeExperience||0,sourceText=source(item),id=item.id;
   btn.disabled=true;btn.textContent='Rosie is working…';
   showResumeCoach('rbBulletCoach','<b>Rosie is developing this responsibility:</b><br>'+safe(item.text)+'<br>Other responsibilities will remain available.');
   try{
     const data=await callR2WResumeAI({mode:'bullet',evidence:{
       targetOccupation:d.target,
       experience:[exp.role,exp.employer].filter(Boolean).join(' • '),
       currentEvidence:sourceText,
       previousBullets:(exp.bullets||[]).filter(Boolean)
     }});
     const fresh=get(),freshItem=fresh.d.activeExperience===expIndex?active(fresh.exp).find(x=>x.id===id):null;
     if(!freshItem||source(freshItem)!==sourceText){showResumeCoach('rbBulletCoach','<b>Your evidence changed while Rosie was working.</b><br>No draft was saved. Please run Rosie again.');return;}
     if(data.needsClarification||data.integrityFailed){
       const question=String(data.question||'What exactly did you do, and how?');
       freshItem.pendingQuestion=question;saveState();
       const box=$('rbBulletCoach');
       box.hidden=false;box.innerHTML='<div class="rosie-live-convo"><div class="rosie-convo-label">Rosie needs a detail</div><p><b>'+safe(question)+'</b></p><label>Your answer<textarea rows="4" placeholder="Describe only what you actually did."></textarea></label><button type="button" class="rosie-send-btn">Send clarification to Rosie</button></div>';
       box.querySelector('button').onclick=()=>{
         const answer=box.querySelector('textarea').value.trim();
         if(!answer){box.querySelector('textarea').focus();return;}
         freshItem.clarifications=Array.isArray(freshItem.clarifications)?freshItem.clarifications:[];
         freshItem.clarifications.push({question,answer,at:stamp()});freshItem.pendingQuestion='';
         freshItem.drafts=null;freshItem.selectedDraft=null;saveState();coach();
       };
       return;
     }
     const drafts={clearDirect:String(data.clearDirect||'').trim(),skillsForward:String(data.skillsForward||'').trim()};
     if(!drafts.clearDirect&&!drafts.skillsForward)throw new Error('Rosie did not return a usable draft.');
     freshItem.drafts=drafts;freshItem.selectedDraft=null;freshItem.draftedAt=stamp();
     saveState();render();
     showResumeCoach('rbBulletCoach','<b>Rosie has two draft options.</b><br>Review both and confirm one if it accurately reflects your work. Your other responsibilities remain available.');
   }catch(e){showResumeCoach('rbBulletCoach','<b>Rosie could not complete this draft.</b><br>Your source evidence is still saved. Try again.');}
   finally{btn.disabled=false;btn.textContent='✦ Rosie: Turn This Into Résumé Evidence';}
 }
 function next(){
   const {d,exp,item}=get();
   if(!exp){$('rbEvidence')?.focus();return;}
   const remaining=active(exp).find(x=>x.status!=='approved'&&x.id!==item?.id);
   if(remaining){
     exp.activeEvidenceId=remaining.id;saveState();render();
     showResumeCoach('rbBulletCoach','<b>Next responsibility:</b> '+safe(remaining.text)+'<br>Ask Rosie to develop this evidence.');
     $('rbBuildBullet')?.focus();return;
   }
   const field=$('rbEvidence');
   if(field){
     if(field.value.trim()&&!/[,;\n]\s*$/.test(field.value))field.value+=', ';
     d.evidence=field.value;syncActiveExperience(d);saveState();render();
     field.focus();field.setSelectionRange(field.value.length,field.value.length);
   }
   showResumeCoach('rbBulletCoach','<b>Ready for more evidence.</b><br>Add another responsibility above. Existing descriptions and approved bullets will remain saved.');
 }
 return {sync,render,coach,next,split};
}
window.R2WEvidenceCoverage={create};
})();