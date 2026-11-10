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
 const button=event.target.closest('#profileBtn, #miniProfilerJump');
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
})();