(()=>{
'use strict';

function alignReadinessLanguage(){
  document.querySelectorAll('.career').forEach(card=>{
    const prepSelect=card.querySelector('select[data-field="prep"]');
    if(prepSelect){
      const step=prepSelect.closest('.evidenceStep');
      const heading=step?.querySelector('h4');
      const description=step?.querySelector('p');
      const label=prepSelect.previousElementSibling;
      const note=step?.querySelector('textarea[data-field="prepNote"]');
      const current=prepSelect.value;

      if(heading)heading.textContent='How do the employer requirements compare with what you bring today?';
      if(description)description.textContent='Compare the qualifications that repeatedly appear in the job postings with the skills, credentials, education, and experience you already have. The goal is to decide how ready you are to apply now—not simply whether the occupation has requirements.';
      if(label&&label.tagName==='LABEL')label.textContent='Based on the postings you reviewed, how ready are you to apply now?';

      prepSelect.innerHTML=`
        <option value="">Choose…</option>
        <option value="Ready / can apply now">I have the skills and qualifications to apply now</option>
        <option value="Some preparation gap">I have a small or specific gap to close before I can apply</option>
        <option value="Substantial preparation gap">I have a significant preparation gap to close before I can apply</option>
        <option value="Requirements vary by employer">My readiness depends on the employer or specific posting</option>
        <option value="Need more research">I need more research before I can tell</option>`;

      if([...prepSelect.options].some(o=>o.value===current))prepSelect.value=current;
      if(note)note.placeholder='What qualification, credential, experience, education, or skill do you already have—or still need before you would be ready to apply?';
    }

    const employerSelect=card.querySelector('select[data-field="employerSupport"]');
    if(employerSelect){
      const step=employerSelect.closest('.evidenceStep');
      const heading=step?.querySelector('h4');
      const description=step?.querySelector('p');
      const label=employerSelect.previousElementSibling;
      if(heading)heading.textContent='Can any preparation gap be closed through employer-supported development after you start working?';
      if(description)description.textContent='Look for paid training, trainee positions, apprenticeship, OJT, tuition assistance, certification reimbursement, or credentials that can be earned after hire.';
      if(label&&label.tagName==='LABEL')label.textContent='What employer-supported option did you verify?';
    }
  });
}

function init(){
  alignReadinessLanguage();
  const careers=document.getElementById('careers');
  if(!careers)return;
  const observer=new MutationObserver(()=>alignReadinessLanguage());
  observer.observe(careers,{childList:true,subtree:true});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
