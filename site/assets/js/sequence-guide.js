(()=>{
'use strict';
const AREA='Northern BOOST';
const JK='boost_naz_journey_v1',PK='boost_naz_portal_progress_v1',PATH='boost_naz_pathway_v1';
const ROSIE_IMG='assets/images/rosie-master.webp';
const INDUSTRY_LABELS={skilled_trades:'Skilled Trades',advanced_manufacturing:'Advanced Manufacturing',healthcare:'Health Care',it:'Information Technology',cdl:'Transportation & Logistics',customer_service:'Customer Service'};
const steps={
 module1:{title:'Module 1 — Discover',unlock:'Start here',text:'This is where your BOOST journey begins. We’ll use your interests, strengths, and career ideas to identify possibilities worth exploring. What you save here becomes evidence that follows you into the next steps.',audio:'assets/audio/rosie-map-module1.mp3'},
 coach:{title:'Career Coach Check-In',unlock:'Complete Module 1 first',text:'This conversation helps you and your Career Coach look at what you discovered before choosing a pathway. BOOST gives you evidence; your conversation helps turn that evidence into an individualized next step.',audio:'assets/audio/rosie-map-coach.mp3'},
 choose:{title:'Choose Your BOOST Pathway',unlock:'Complete Module 1 and your Career Coach check-in first',text:'Both BOOST pathways lead toward employment, but they solve different problems. Rapid Employment focuses on getting ready and moving quickly. Career Exploration and Development gives you more evidence before you make a larger career or training decision.',audio:'assets/audio/rosie-map-choose-pathway.mp3'},
 financial:{title:'Build Strong Financial Habits',unlock:'Complete the preceding step on your selected pathway first',text:'We’ll look at the practical side of going to work. This shared step helps you identify financial pressure points, employment-related expenses, and supports that may help you stay focused on the goal.',audio:'assets/audio/rosie-map-financial.mp3'},
 skillmobility:{title:'Finding Yourself in Work',unlock:'Choose Rapid Employment and complete Module 1 first',text:'Now we look at what you already bring to work. You’ll explore the way you solve problems, work with people, organize tasks, and respond to real situations so we can see strengths that may transfer into your next job.',audio:'assets/audio/rosie-map-skillmobility.mp3'},
 ai:{title:'AI & You',unlock:'Complete the step before this one',text:'AI can be a practical career tool when you know how to use it well. You’ll learn what it can do, see useful examples, try it yourself, and practice using human judgment to check the result.',audio:'assets/audio/rosie-map-ai.mp3'},
 jobsearch:{title:'48-Hour Job Search',unlock:'Complete Finding Yourself in Work first',text:'This is where preparation turns into action. You’ll build a focused short-cycle job-search plan using the direction and strengths you developed earlier in the pathway.',audio:'assets/audio/rosie-map-jobsearch.mp3'},
 module2:{title:'Module 2 — Reality Check',unlock:'Choose Career Exploration and complete Module 1 first',text:'You found possibilities in Discover. Now we test them against the real world — jobs, wages, life, and future opportunity. The goal is not to eliminate options too quickly; it is to understand them well enough to keep exploring with confidence.',audio:'assets/audio/rosie-map-module2.mp3'},
 module3:{title:'Module 3 — Career Mobility',unlock:'Complete Module 2 first',text:'Here we connect what you already know how to do with where you may be able to move next. We’ll use your earlier career evidence and add a clearer picture of transferable skills, immediate mobility, and what may take more development.',audio:'assets/audio/rosie-map-module3.mp3'},
 module4:{title:'Module 4 — Decide',unlock:'Complete Module 3 first',text:'By this point, BOOST has collected several kinds of evidence. Decide helps you make sense of it without making the decision for you. You’ll compare what points toward work now, a bridge strategy, training, or reconsidering the direction.',audio:'assets/audio/rosie-map-module4.mp3'},
 careerai:{title:'AI & You',unlock:'Complete Build Strong Financial Habits first',text:'This shared step gives you practical AI literacy you can carry into almost any workplace. You’ll learn how to use AI as a tool while keeping judgment, accuracy, and responsibility in your hands.',audio:'assets/audio/rosie-map-ai.mp3'},
 industry:{title:'Applied Career Experience',unlock:'Complete Module 4 and follow the industry connected to your selected occupation',text:'This is your chance to experience the work before making a bigger investment. You’ll enter a realistic workplace challenge connected to the career direction you selected in Decide and compare what the work asks of you with what you learned about yourself.',audio:'assets/audio/rosie-map-applied.mp3'}
};
const rapidOrder=['skillmobility','jobsearch','financial','ai'];
const careerOrder=['module2','module3','module4','industry','financial','careerai'];
function j(){try{return JSON.parse(localStorage.getItem(JK)||'{}')}catch{return{}}}
function p(){try{return JSON.parse(localStorage.getItem(PK)||'{}')}catch{return{visited:{},rapid:{}}}}
function selectedPath(){return localStorage.getItem(PATH)||''}
function module4State(x=j()){return x.module4||x.modules?.module4||{}}
function coreDone(id){const x=j(),pr=x.progress||{};if(id==='module1')return pr.module1==='complete'||!!x.module1?.careers?.length;if(id==='module2')return pr.module2==='complete'||!!x.module2?.careers?.length;if(id==='module3')return pr.module3==='complete'||!!x.module3?.careers?.length;if(id==='module4'){const m=module4State(x);return pr.module4==='complete'||!!m.completedAt||!!((m.careerTarget||m.targetCareer||m.career)&&m.answers)}return false}
function rapidDone(id){const x=j(),pr=x.progress||{},pp=p();return pr[id]==='complete'||!!pp.rapid?.[id]}
function careerDone(id){if(id.startsWith('module'))return coreDone(id);const x=j(),pr=x.progress||{},pp=p();if(id==='financial')return pr.financial==='complete'||!!pp.career?.financial;if(id==='careerai')return pr.ai==='complete'||pr.careerAi==='complete'||!!pp.career?.ai;if(id==='industry')return ['skilledTrades','advancedManufacturing','healthcare','it','cdl','customerService'].some(k=>pr[k]==='complete');return false}
function keyFor(el){if(el.dataset.core)return el.dataset.core;if(el.dataset.rapid)return el.dataset.rapid;if(el.dataset.shared==='financial')return'financial';if(el.dataset.shared==='ai')return selectedPath()==='career'?'careerai':'ai';if(el.dataset.careerResource==='ai')return'careerai';if(el.hasAttribute('data-industry-choice'))return'industry';if(el.dataset.applied)return'applied:'+el.dataset.applied;if(el.dataset.visit==='coach')return'coach';if(el.hasAttribute('data-choose'))return'choose';return null}
function infoFor(key){if(key?.startsWith('applied:'))return steps.industry;return steps[key]||null}
function socKey(v){const d=String(v??'').replace(/\D/g,'');return d.length>=6?d.slice(0,6):d}
function norm(v){return String(v??'').toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim()}
function findCareer(list,ref){const sk=socKey(ref?.soc),tk=norm(ref?.title);return (list||[]).find(c=>(sk&&socKey(c?.soc)===sk)||(tk&&norm(c?.title)===tk))||null}
function recommendedIndustry(){
 const x=j();if(!coreDone('module4'))return null;
 const m=module4State(x),existing=m.appliedExperienceSelected||m.appliedExperienceRecommendation;
 if(existing?.key&&Object.prototype.hasOwnProperty.call(INDUSTRY_LABELS,existing.key))return existing.key;
 const ref=m.careerTarget||m.targetCareer||m.career||m.boostSignal?.careerTarget||m.selection?.career||null;if(!ref)return null;
 const c=Object.assign({},findCareer(x.module1?.careers,ref)||{},findCareer(x.module2?.careers,ref)||{},ref);
 const soc=socKey(c.soc||ref.soc),major=soc.slice(0,2),text=norm((c.sector||c.industry||c.cluster||'')+' '+(c.title||ref.title||''));
 if(['29','31'].includes(major)||/health care|healthcare|nurs|medical|clinical|pharmacy|dental|therapy|therapist|diagnostic|patient/.test(text))return'healthcare';
 if(major==='15'||/information technology|computer|software|cyber|network|help desk|database|web developer|systems analyst/.test(text))return'it';
 if(major==='53'||/transportation|logistics|cdl|truck|tractor trailer|commercial driver|delivery driver|freight|warehouse/.test(text))return'cdl';
 if(major==='51'||/advanced manufacturing|manufacturing|machin|cnc|production|fabricat|automation|mechatronic|quality control/.test(text))return'advanced_manufacturing';
 if(['47','49'].includes(major)||/skilled trade|construction|electrician|plumb|hvac|heating|air conditioning|weld|carpenter|mason|roofer|heavy equipment|utility|solar|maintenance repair|automotive/.test(text))return'skilled_trades';
 if(['41','43'].includes(major)||/customer service|retail|sales|hospitality|food service/.test(text))return'customer_service';
 return null;
}
function unlocked(key){
 if(key==='module1')return true;
 if(key==='coach'||key==='choose')return coreDone('module1');
 const path=selectedPath(),order=path==='rapid'?rapidOrder:path==='career'?careerOrder:[];
 if(key?.startsWith('applied:')){const rec=recommendedIndustry();return coreDone('module4')&&!!rec&&key===`applied:${rec}`;}
 if(key==='industry')return coreDone('module4')&&!!recommendedIndustry();
 if(order.includes(key)){const i=order.indexOf(key),done=path==='rapid'?rapidDone:careerDone;return i===0?coreDone('module1'):done(order[i-1])}
 if(rapidOrder.includes(key)||careerOrder.includes(key))return false;
 return true;
}
function renderIndustryArrow(){
 document.querySelectorAll('.boostPinalIndustryArrow').forEach(n=>n.remove());
 document.querySelectorAll('[data-applied]').forEach(el=>{el.classList.remove('boostRecommendedIndustry');el.removeAttribute('data-recommended-industry')});
 const rec=recommendedIndustry();
 document.querySelectorAll('[data-applied]').forEach(el=>{
   const isRec=!!rec&&el.dataset.applied===rec;
   el.dataset.industryLocked=isRec?'false':'true';
   if(coreDone('module4')&&!isRec)el.setAttribute('aria-label',`${INDUSTRY_LABELS[el.dataset.applied]||'Industry experience'} — locked because it is not connected to your Module 4 occupation`);
 });
 if(!rec)return;
 if(coreDone('module4')&&selectedPath()!=='career')localStorage.setItem(PATH,'career');
 const el=document.querySelector(`[data-applied="${rec}"]`);if(!el)return;
 el.classList.add('boostRecommendedIndustry');el.dataset.recommendedIndustry='true';el.classList.remove('boostSeqLocked');el.removeAttribute('aria-disabled');el.style.pointerEvents='auto';
 const badge=el.querySelector('.rec');if(badge)badge.style.display='none';
 const arrow=document.createElement('span');arrow.className='boostPinalIndustryArrow';arrow.textContent='➜';arrow.setAttribute('aria-hidden','true');el.appendChild(arrow);
 const tip=el.querySelector('.tip');if(tip)tip.textContent=`Recommended next — open ${INDUSTRY_LABELS[rec]||'this industry'} experience`;
}
function injectStyles(){const s=document.createElement('style');s.textContent=`.boostSeqLocked{filter:none!important;outline:none!important;box-shadow:none!important;cursor:pointer!important}.boostSeqLocked:before{display:none!important}.hot[data-applied].boostSeqLocked:before{content:'LOCKED';display:block!important;position:absolute;right:6px;top:6px;z-index:12;padding:4px 7px;border-radius:999px;background:#10243ad9;color:#fff;border:1px solid #ffffffbb;font:900 9px/1 Inter,Arial,sans-serif;letter-spacing:.06em}.hot[data-applied].boostSeqLocked{background:#0b22372a!important}.boostSeqInfo{position:absolute;left:6px;bottom:6px;z-index:10;width:27px;height:27px;border:2px solid #fff;border-radius:50%;background:#e4a72b;color:#132b43;font-weight:950;font-size:15px;display:grid;place-items:center;box-shadow:0 3px 10px #0005;cursor:pointer;opacity:0;transform:scale(.92);transition:opacity .18s ease,transform .18s ease}.hot:hover .boostSeqInfo,.hot:focus-within .boostSeqInfo,.hot:focus-visible .boostSeqInfo{opacity:1;transform:scale(1)}.boostRecommendedIndustry{pointer-events:auto!important;cursor:pointer!important;z-index:9!important}.boostRecommendedIndustry .boostSeqInfo{display:none!important}.boostPinalIndustryArrow{position:absolute;left:0;top:50%;transform:translate(-42%,-50%);z-index:50;width:52px;height:52px;border-radius:50%;display:grid;place-items:center;background:#e4a72b;color:#10243a;border:3px solid #fff;box-shadow:0 5px 16px #0006;font:1000 31px/1 Arial,sans-serif;pointer-events:none}.boostSeqModal{position:fixed;inset:0;z-index:2147483600;background:#03101bd9;display:none;align-items:center;justify-content:center;padding:18px}.boostSeqModal.show{display:flex}.boostSeqCard{width:min(720px,96vw);background:#fffaf0;border-radius:20px;overflow:hidden;box-shadow:0 30px 90px #0009}.boostSeqHead{background:linear-gradient(90deg,#102d49,#1f587f);color:#fff;padding:18px 20px;border-bottom:3px solid #e4a72b}.boostSeqHead small{display:block;text-transform:uppercase;letter-spacing:.09em;color:#f4cd71;font-weight:900;margin-bottom:4px}.boostSeqHead h2{margin:0}.boostSeqBody{padding:20px}.boostSeqRosie{display:grid;grid-template-columns:160px 1fr;gap:18px;align-items:stretch}.boostSeqAvatar{min-height:210px;border-radius:18px;overflow:hidden;background:linear-gradient(180deg,#eef6fa,#dceaf1);border:2px solid #c9d9e2;display:flex;align-items:flex-end;justify-content:center}.boostSeqAvatar img{width:100%;height:100%;object-fit:cover;object-position:50% 18%;display:block}.boostSeqSpeech{background:#f4f8fa;border-left:5px solid #e4a72b;border-radius:12px;padding:14px;line-height:1.55}.boostSeqUnlock{margin-top:13px;font-size:12px;font-weight:900;color:#526977}.boostSeqActions{display:flex;gap:9px;flex-wrap:wrap;margin-top:16px}.boostSeqBtn{border:0;border-radius:999px;padding:10px 14px;font-weight:900;cursor:pointer;background:#0d2741;color:#fff}.boostSeqBtn.alt{background:#eef4f7;color:#17324d;border:1px solid #c9d7df}.boostSeqAudioStatus{font-size:12px;color:#60727e;margin-top:7px}@media(max-width:620px){.boostSeqRosie{grid-template-columns:1fr}.boostSeqAvatar{min-height:180px;max-height:230px}.boostSeqAvatar img{object-position:50% 15%}.boostPinalIndustryArrow{width:42px;height:42px;font-size:25px;border-width:2px}}`;
document.head.appendChild(s)}
let modal,activeKey;
function ensureModal(){if(modal)return;modal=document.createElement('div');modal.className='boostSeqModal';modal.innerHTML='<div class="boostSeqCard"><div class="boostSeqHead"><small>Tell me about this step</small><h2 id="boostSeqTitle"></h2></div><div class="boostSeqBody"><div class="boostSeqRosie"><div class="boostSeqAvatar"><img src="'+ROSIE_IMG+'" alt="Rosie, BOOST guide"></div><div><div class="boostSeqSpeech" id="boostSeqText"></div><div class="boostSeqUnlock" id="boostSeqUnlock"></div><div class="boostSeqAudioStatus" id="boostSeqAudioStatus"></div></div></div><div class="boostSeqActions"><button class="boostSeqBtn" id="boostSeqPlay">▶ Play Rosie</button><button class="boostSeqBtn alt" id="boostSeqClose">Close</button></div><audio id="boostSeqAudio" preload="none"></audio></div></div>';document.body.appendChild(modal);modal.querySelector('#boostSeqClose').onclick=()=>closeModal();modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});modal.querySelector('#boostSeqPlay').onclick=()=>{const d=infoFor(activeKey),a=modal.querySelector('#boostSeqAudio'),st=modal.querySelector('#boostSeqAudioStatus');if(!d?.audio)return;st.textContent='';a.src=d.audio;a.play().catch(()=>st.textContent='Rosie audio has not been added for this step yet. The text guide is ready now.')};}
function openModal(key){
 const d=infoFor(key);if(!d)return;ensureModal();activeKey=key;
 const isApplied=key?.startsWith('applied:'),requested=isApplied?key.split(':')[1]:null,rec=isApplied?recommendedIndustry():null;
 if(isApplied&&coreDone('module4')&&rec&&requested!==rec){
   modal.querySelector('#boostSeqTitle').textContent=`${INDUSTRY_LABELS[requested]||'Industry'} — Locked for this pathway`;
   modal.querySelector('#boostSeqText').textContent=`Your occupation selected in Decide connects to the ${INDUSTRY_LABELS[rec]||'recommended'} applied career experience. BOOST keeps the other industry experiences visible, but only the experience connected to your selected occupation is unlocked so the evidence stays tied to the career you are actually exploring.`;
   modal.querySelector('#boostSeqUnlock').textContent=`Next step: open ${INDUSTRY_LABELS[rec]||'the highlighted industry experience'}.`;
 }else{
   modal.querySelector('#boostSeqTitle').textContent=d.title;
   modal.querySelector('#boostSeqText').textContent=d.text;
   modal.querySelector('#boostSeqUnlock').textContent=unlocked(key)?'This step is available to start now.':'Looking ahead is always okay. To start this step: '+d.unlock+'.';
 }
 modal.querySelector('#boostSeqAudioStatus').textContent='';modal.classList.add('show');
}
function closeModal(){modal?.classList.remove('show');const a=modal?.querySelector('#boostSeqAudio');if(a){a.pause();a.currentTime=0}}
function decorate(){document.querySelectorAll('.hot').forEach(el=>{const key=keyFor(el);if(!key||!infoFor(key))return;const canOpen=unlocked(key);el.classList.toggle('boostSeqLocked',!canOpen);if(!canOpen)el.setAttribute('aria-disabled','true');else el.removeAttribute('aria-disabled');if(!el.querySelector('.boostSeqInfo')){const b=document.createElement('span');b.className='boostSeqInfo';b.textContent='?';b.title='Tell me about this step';b.setAttribute('role','button');b.setAttribute('aria-label','Tell me about this step');b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();openModal(key)},true);el.appendChild(b)}});renderIndustryArrow()}
function gate(e){const el=e.target.closest('.hot');if(!el)return;const key=keyFor(el);if(!key)return;if(el.dataset.recommendedIndustry==='true')return;if(e.target.closest('.boostSeqInfo'))return;if(!unlocked(key)){e.preventDefault();e.stopImmediatePropagation();openModal(key)}}
function init(){injectStyles();ensureModal();if(coreDone('module4')&&selectedPath()!=='career')localStorage.setItem(PATH,'career');decorate();document.addEventListener('click',gate,true);window.addEventListener('storage',decorate);document.addEventListener('boostprogress',decorate);document.addEventListener('boostpathway',()=>setTimeout(decorate,0));window.addEventListener('pageshow',()=>setTimeout(decorate,0));setInterval(decorate,1200)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
