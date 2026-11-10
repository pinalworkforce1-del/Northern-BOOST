(()=>{
'use strict';
if(window.__NorthernStagedProfilerEntryV1)return;
window.__NorthernStagedProfilerEntryV1=true;
// Only the isolated 2.0 staging Discover copy includes this helper.
// Keep Northern's normal Module 1 listeners, saves, and completion rules untouched.
const focusProfiler=()=>{
 const section=document.getElementById('onet');
 if(!section)return;
 section.scrollIntoView({behavior:'smooth',block:'start'});
 const focusTarget=document.getElementById('boostEmbeddedOnet')||section;
 if(!focusTarget.hasAttribute('tabindex'))focusTarget.setAttribute('tabindex','-1');
 // Focus without initiating a second scroll when supported.
 try{focusTarget.focus({preventScroll:true})}catch(_){focusTarget.focus()}
};
document.addEventListener('click',event=>{
 const button=event.target.closest('#profileBtn');
 if(!button||!document.getElementById('onet'))return;
 event.preventDefault();event.stopImmediatePropagation();
 // The original mindmap button saved inputs before jumping to the legacy score
 // section. Trigger its existing input-save listener before the new jump.
 if(button.id==='profileBtn'){
   const field=document.getElementById('dreamJob');
   if(field)field.dispatchEvent(new Event('input',{bubbles:true}));
 }
 focusProfiler();
},true);

// These two links belong exclusively to the staged Discover page, not legacy Northern.
// Navigation after completion waits for the existing cloud save and verifies the
// authenticated Northern journey before returning to the new dashboard.
const RETURN_MARKER='boost_naz_preview_return_v1';
const TARGET=new URL('preview-v2/index.html',document.baseURI).toString();
const statusNode=()=>document.getElementById('saveStatus');
const clearMarker=()=>sessionStorage.removeItem(RETURN_MARKER);
const readLocal=()=>{try{return JSON.parse(localStorage.getItem('boost_naz_journey_v1')||'{}')}catch(_){return{}}};
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let navigating=false;
async function returnDashboard(fromCompleted){
 if(navigating)return;
 navigating=true;
 const anchor=document.getElementById(fromCompleted?'boostV2DiscoverComplete':'boostV2DiscoverBack');
 const original=anchor?.textContent||'Return to BOOST 2.0';
 if(anchor){anchor.setAttribute('aria-disabled','true');anchor.textContent=fromCompleted?'Confirming Northern cloud save…':'Returning to BOOST 2.0…'}
 try{
  if(fromCompleted && readLocal()?.progress?.module1!=='complete')throw Error('Module 1 is not yet marked complete in your browser. Save your career choices first.');
  const cloud=window.BOOSTCloud;
  if(cloud?.flush)await cloud.flush();
  if(fromCompleted){
   if(!cloud?.loadAuthenticatedJourney)throw Error('Northern cloud confirmation is unavailable.');
   let confirmed=false;
   for(let attempt=0;attempt<4;attempt++){
    const remote=await cloud.loadAuthenticatedJourney();
    if(remote?.progress?.module1==='complete'){confirmed=true;break}
    if(attempt<3)await sleep(450);
   }
   if(!confirmed)throw Error('Module 1 completion has not yet been confirmed in your authenticated Northern cloud record.');
   const status=statusNode();
   if(status)status.textContent='✓ Your Module 1 completion was confirmed in Northern BOOST cloud. Returning to your dashboard.';
  }
  clearMarker();window.location.assign(TARGET);
 }catch(err){
  const status=statusNode();
  if(status)status.textContent='Cloud confirmation needed: '+(err?.message||'Unable to confirm save')+' Your saved browser results have not been reset. Please try again.';
  if(anchor){anchor.textContent=fromCompleted?'Retry confirmed return →':original;anchor.removeAttribute('aria-disabled')}
  // Only the completed-return must stay for validation. An ordinary Back link
  // may still be used directly through its visible staging URL.
 }finally{navigating=false}
}
for(const [id,completed] of [['boostV2DiscoverBack',false],['boostV2DiscoverComplete',true]]){
 const link=document.getElementById(id);
 if(link)link.addEventListener('click',event=>{event.preventDefault();returnDashboard(completed)});
}

})();