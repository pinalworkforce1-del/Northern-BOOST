(()=>{
'use strict';
if(window.__NorthernBoostV2Preview)return;window.__NorthernBoostV2Preview=true;
const JOURNEY_KEY='boost_naz_journey_v1',PORTAL_KEY='boost_naz_portal_progress_v1',PATH_KEY='boost_naz_pathway_v1',PICK_KEY='northern_boost_v2_preview_pathway',AREA_KEY='boost_naz_service_area_v1',NONCE_PREFIX='boost_naz_completion_nonce:';
const RETURN_KEY='boost_naz_preview_return_v1',RETURN_NOTICE_KEY='boost_naz_preview_return_notice_v1';
const NAV_RETURN_KEY='boost_naz_v2_pathway_navigation_v1';
const NAV_RETURN_WINDOW_MS=2*60*60*1000;
const STEP_BRANCH={module2:'career',module3:'career',module4:'career',industry:'career',skillmobility:'rapid',jobsearch:'rapid'};
let returnFocusHandled=false;
function markReturnNavigation(moduleId){
 if(!user)return;
 sessionStorage.setItem(NAV_RETURN_KEY,JSON.stringify({module:moduleId,path:selected,userId:user.id,startedAt:Date.now()}));
}
function sameOriginModuleReferrer(){
 try{
  const ref=new URL(document.referrer);
  if(ref.origin!==location.origin)return null;
  const last=ref.pathname.split('/').pop().toLowerCase();
  if(last==='discover.html')return'module1';
  if(last==='coach-appointment-prep.html')return'coachAppointmentPrep';
  if(last.includes('module2_'))return'module2';
  if(last.includes('module3_'))return'module3';
  if(last.includes('module4_'))return'module4';
  if(last==='rapid-employment.html'||last==='rapid-skill-mobility.html')return'skillmobility';
  if(last==='48-hour-job-search.html')return'jobsearch';
  if(last==='financial-habits.html')return'financial';
  if(last==='ai-you.html')return'ai';
  if(/connected_test_/.test(last))return'industry';
 }catch(_){}
 return null;
}
function pendingPathwayReturn(){
 if(!user||returnFocusHandled)return null;
 const query=new URLSearchParams(location.search);
 const hash=new URLSearchParams(location.hash.replace(/^#/,''));
 const step=hash.get('step');
 const from=query.get('boost2_from');
 const requestedPath=validPath(query.get('boost2_path'));
 const explicitStep=Object.hasOwn(details,step)?step:null;
 const refStep=sameOriginModuleReferrer();
 let marker=null;
 try{marker=JSON.parse(sessionStorage.getItem(NAV_RETURN_KEY)||'null')}catch(_){}
 const fresh=marker?.userId===user.id&&Number.isFinite(marker.startedAt)&&
    Date.now()-marker.startedAt>=0&&Date.now()-marker.startedAt<NAV_RETURN_WINDOW_MS;
 if(!fresh&&marker)sessionStorage.removeItem(NAV_RETURN_KEY);
 if(!fresh&&!explicitStep&&!requestedPath&&!refStep&&!Object.hasOwn(details,from))return null;
 const path=STEP_BRANCH[explicitStep]||requestedPath||
   (fresh?validPath(marker.path):null)||
   STEP_BRANCH[refStep]||STEP_BRANCH[from]||
   validPath(sessionStorage.getItem(PICK_KEY))||validPath(localStorage.getItem(PATH_KEY));
 return {path,module:explicitStep||(fresh?marker.module:null)||refStep||from||null,fresh};
}
function focusSelectedPathwayAfterReturn(intent){
 if(!intent||returnFocusHandled)return;
 returnFocusHandled=true;
 if(intent.fresh)sessionStorage.removeItem(NAV_RETURN_KEY);
 const target=done('module1')&&selected&&!$('journeySection').hidden
   ?$('journeySection'):done('module1')?$('pathwaySection'):$('discoverStarter');
 if(!target)return;
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
   target.scrollIntoView({behavior:'auto',block:'start'});
   if(target.id==='journeySection')target.classList.add('returned-to-pathway');
 }));
}
const AREA_FORMS={
 agn:'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=B5g44f9pukus8ui6NzWh9oMizKqrSvNIoO8HO9ayO39UNE1NN1o0RUNFMUI1OENHSUlTTVJKUURMTi4u',
 coconino:'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=B5g44f9pukus8ui6NzWh9oMizKqrSvNIoO8HO9ayO39UNFFNVjFYS0dRNEU5UFRBR1JERVEyQkJNTi4u'
};
const $=id=>document.getElementById(id);
const read=(k)=>{try{return JSON.parse(localStorage.getItem(k)||'{}')||{}}catch{return{}}};
const industryMap={skilled_trades:{label:'Skilled Trades',url:'Northern_BOOST_Skilled_Trades_Connected_Test_v0.4.html',legacy:'skilledTrades'},advanced_manufacturing:{label:'Advanced Manufacturing',url:'Northern_BOOST_Advanced_Manufacturing_Connected_Test_v0.2.html',legacy:'advancedManufacturing'},healthcare:{label:'Health Care',url:'Northern_BOOST_Healthcare_Connected_Test_v0.2.html',legacy:'healthcare'},it:{label:'Information Technology',url:'Northern_BOOST_IT_Connected_Test_v0.2.html',legacy:'it'},cdl:{label:'Transportation & Logistics',url:'Northern_BOOST_CDL_Connected_Test_v0.2.html',legacy:'cdl'}};
const details={
 coachAppointmentPrep:{name:'Coach Appointment Prep',desc:'Review your Discover evidence and prepare questions for your pre-enrollment Career Coach conversation.',audio:'assets/audio/rosie-map-coach.mp3',url:'preview-v2/coach-appointment-prep.html'},
 module1:{name:'Module 1 — Discover',desc:'Identify your interests, strengths, work drivers, and occupations worth exploring.',audio:'assets/audio/rosie-map-module1.mp3',url:'preview-v2/discover.html'},
 module2:{name:'Module 2 — Reality Check',desc:'Compare the careers you chose with wages, hiring, preparation, and how they fit your life.',audio:'assets/audio/rosie-map-module2.mp3',url:'Northern_BOOST_Module2_PinalFlow_v1.html'},
 module3:{name:'Module 3 — Career Mobility',desc:'Explore transferable strengths and see where you could go from your current skills.',audio:'assets/audio/rosie-map-module3.mp3',url:'Northern_BOOST_Module3_Connected_Test_v0.8.html'},
 module4:{name:'Module 4 — Decide',desc:'Bring your evidence together and decide the most realistic next step.',audio:'assets/audio/rosie-map-module4.mp3',url:'Northern_BOOST_Module4_Connected_Test_v0.6.html'},
 industry:{name:'Applied Career Experience',desc:'Explore the industry related to the occupation you selected in Decide.',audio:'assets/audio/rosie-map-applied.mp3'},
 skillmobility:{name:'Finding Yourself in Work',desc:'Connect your existing skills to opportunities you could pursue now.',audio:'assets/audio/rosie-map-skillmobility.mp3',url:'rapid-employment.html'},
 jobsearch:{name:'48-Hour Job Search Strategy',desc:'Build a focused two-day plan with specific job search actions and contacts.',audio:'assets/audio/rosie-map-jobsearch.mp3',url:'48-hour-job-search.html'},
 financial:{name:'Build Strong Financial Habits',desc:'Consider the financial realities of finding and keeping employment.',audio:'assets/audio/rosie-map-financial.mp3',url:'financial-habits.html'},
 ai:{name:'AI & You',desc:'Learn and practice practical AI skills with your own judgment in control.',audio:'assets/audio/rosie-map-ai.mp3',url:'ai-you.html'}
};
const orders={career:['module2','module3','module4','industry','financial','ai'],rapid:['skillmobility','jobsearch','financial','ai']};
let client=null,user=null,journey={},portal={},selected=null,activeStep=null,lastCloudMessage='Cloud record not checked',authReady=false;
const validPath=p=>p==='career'||p==='rapid'?p:null;
const setMessage=t=>{$('authStatus').textContent=t;};
function getClient(){
 if(client)return client;
 const c=window.BOOST_CONFIG||{};
 if(!window.supabase?.createClient||!c.supabaseUrl||!c.supabaseAnonKey)throw new Error('Northern sign-in service is not ready.');
 client=window.supabase.createClient(c.supabaseUrl,c.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 return client;
}
const SHARED_KEY='northern_boost_career_exploration_v1';
const HYDRATED_OWNER_KEY='boost_naz_local_cloud_owner_v1';
function hydrateNorthernLocalFromCloud(cloud){
  // The original Northern modules read browser evidence before saving. After
  // switching GitHub Pages -> custom domain, browser storage is a fresh origin.
  // Preload only the signed-in participant's authoritative Northern record.
  if(!user?.id||!cloud||typeof cloud!=='object'||!Object.keys(cloud).length)return;
  const owner=localStorage.getItem(HYDRATED_OWNER_KEY)||'';
  const prior=localJourney();
  const differentOwner=(owner&&owner!==user.id)||
    (!owner&&prior?.participant?.email&&user.email&&
      String(prior.participant.email).toLowerCase()!==String(user.email).toLowerCase());
  if(differentOwner){
    // Never upload or show one participant's cached journey under another login.
    [JOURNEY_KEY,SHARED_KEY,PATH_KEY,PORTAL_KEY].forEach(k=>localStorage.removeItem(k));
  }
  const current=differentOwner?{}:prior;
  const stamp=o=>Date.parse(o?.updatedAt||o?.updated_at||o?.tracking?.lastActivityAt||'')||0;
  const useCloud=!Object.keys(current).length||stamp(cloud)>=stamp(current);
  if(useCloud){
    localStorage.setItem(JOURNEY_KEY,JSON.stringify(cloud));
    // The older module controllers also read this shared store for career
    // selections/interest scores. Only seed it from cloud; never invent results.
    const shared={
      region:'Northern Arizona',
      module1:{...(cloud.module1||cloud.modules?.module1||{}),
        selected:cloud.module1?.selected||cloud.module1?.careers||cloud.modules?.module1?.selected||[],
        scores:cloud.module1?.riasec||cloud.module1?.scores||cloud.modules?.module1?.scores||{}},
      module2:cloud.module2||cloud.modules?.module2||{},
      module3:cloud.module3||cloud.modules?.module3||{},
      module4:cloud.module4||cloud.modules?.module4||{},
      updatedAt:cloud.updatedAt||cloud.updated_at||new Date().toISOString()
    };
    const oldShared=read(SHARED_KEY);
    if(differentOwner||!Object.keys(oldShared).length||stamp(shared)>=stamp(oldShared)){
      localStorage.setItem(SHARED_KEY,JSON.stringify(shared));
    }
  }
  localStorage.setItem(HYDRATED_OWNER_KEY,user.id);
  // Browser-specific pathway selection does not survive a domain change.
  const remembered=validPath(cloud.selectedPathway)||validPath(cloud.pathway?.selected);
  const progress=cloud.progress||{};
  const evidenceCareer=['module2','module3','module4'].some(k=>progress[k]==='complete'||!!cloud[k]?.completedAt);
  const evidenceRapid=['skillmobility','jobsearch'].some(k=>progress[k]==='complete');
  const inferred=remembered||(evidenceCareer&&!evidenceRapid?'career':evidenceRapid&&!evidenceCareer?'rapid':null);
  if(!validPath(localStorage.getItem(PATH_KEY))&&inferred)localStorage.setItem(PATH_KEY,inferred);
}
function localJourney(){return read(JOURNEY_KEY)}
function cloudOrLocal(){return journey||{}}
function done(id){
 const j=cloudOrLocal(),pr=j.progress||{};
 if(pr[id]==='stale')return false;
 if(id==='module1')return pr.module1==='complete';
 if(id==='coachAppointmentPrep')return pr.coachAppointmentPrep==='complete'&&!!j.modules?.coachAppointmentPrep?.readyAt;
 if(id==='module2')return pr.module2==='complete'||!!j.module2?.careers?.length;
 if(id==='module3')return pr.module3==='complete'||!!j.module3?.careers?.length;
 if(id==='module4'){const m=j.module4||j.modules?.module4||{};return pr.module4==='complete'||!!m.completedAt||!!((m.careerTarget||m.targetCareer||m.career)&&m.answers)}
 if(id==='industry'){
   // Count evidence only for the industry mapped to the current Decide career.
   // A previous challenge in an unrelated industry must not satisfy this stage.
   const key=recommendedIndustry(),v=key&&industryMap[key];
   return !!v&&(pr[v.legacy]==='complete'||pr['industry-'+key]==='complete'||j.appliedModules?.[key]?.completed===true||j.appliedModules?.[v.legacy]?.completed===true);
 }
 if(id==='ai')return pr.ai==='complete'||pr.careerAi==='complete'||!!j.modules?.ai?.completedAt;
 if(id==='financial')return pr.financial==='complete';
 if(id==='skillmobility'||id==='jobsearch')return pr[id]==='complete'||!!portal.rapid?.[id];
 return false;
}
function recommendedIndustry(){
 const j=cloudOrLocal(),m=j.module4||j.modules?.module4||{};
 const chosen=m.appliedExperienceSelected||m.appliedExperienceRecommendation;
 if(chosen?.key&&industryMap[chosen.key])return chosen.key;
 const ref=m.careerTarget||m.targetCareer||m.career||m.boostSignal?.careerTarget||m.selection?.career||null;
 if(!ref)return null;
 const soc=String(ref.soc||'').replace(/\D/g,'').slice(0,2);
 const title=String([ref.title,ref.sector,ref.industry,ref.cluster].filter(Boolean).join(' ')).toLowerCase();
 if(['29','31'].includes(soc)||/health|nurs|medical|clinical|pharmacy|dental|therapy|patient/.test(title))return'healthcare';
 if(soc==='15'||/computer|information technology|software|cyber|network|help desk|database/.test(title))return'it';
 if(soc==='53'||/transport|logistic|cdl|truck|driver|freight|warehouse/.test(title))return'cdl';
 if(soc==='51'||/manufactur|machin|cnc|production|fabricat|automation/.test(title))return'advanced_manufacturing';
 if(['47','49'].includes(soc)||/construction|trade|electrician|plumb|hvac|weld|carpent|maintenance|repair/.test(title))return'skilled_trades';
 // Customer service is not yet a deployed Northern applied-experience page.
 if(['41','43'].includes(soc)||/retail|customer service|sales|hospitality|food service/.test(title))return null;
 return null;
}
function stale(id){
 const j=cloudOrLocal();return j.progress?.[id]==='stale'||(!!j.staleModules?.[id]&&j.progress?.[id]!=='complete');
}
function skipUnmappedIndustry(path=selected){
 // No synthetic completion or cloud mutation: an unmatched applied experience
 // is simply omitted from this participant's required career sequence.
 return path==='career'&&done('module4')&&!recommendedIndustry();
}
function pathwayOrder(path=selected){
 const steps=orders[path]||[];
 return skipUnmappedIndustry(path)?steps.filter(id=>id!=='industry'):steps;
}
function available(id){
 if(id==='module1')return true;
 if(id==='coachAppointmentPrep')return done('module1');
 if(!done('module1'))return false;
 if(id==='module2'||id==='skillmobility')return true;
 if(id==='industry'&&!recommendedIndustry())return false;
 const order=pathwayOrder(),index=order.indexOf(id);
 if(index<0)return false;
 if(index===0)return true;
 return done(order[index-1]);
}
function labelFor(id){const rec=id==='industry'?recommendedIndustry():null;return rec&&industryMap[rec]?industryMap[rec].label+' — Applied Experience':details[id]?.name||id}
function nextId(){if(!done('module1'))return'module1';if(!done('coachAppointmentPrep'))return'coachAppointmentPrep';const order=pathwayOrder();return order.find(id=>!done(id))||null;}
function setVisible(){
 const yes=!!user;
 $('authGate').hidden=yes;$('appShell').hidden=!yes;$('signOut').hidden=!yes;
 $('identity').textContent=yes?user.email:'Sign in to begin';
}
function showDialog(id){$(id).hidden=false;document.body.style.overflow='hidden';}
function closeDialog(id){
 $(id).hidden=true;document.body.style.overflow='';
 if(id==='rosieDialog'){ $('rosieVideo').pause();$('rosieOverviewAudio').pause(); }
 if(id==='stepDialog'){const a=$('stepAudio');a.pause();a.currentTime=0;}
}
function render(){
 setVisible();if(!user)return;
 portal=read(PORTAL_KEY);
 const chosen=validPath(sessionStorage.getItem(PICK_KEY))||validPath(localStorage.getItem(PATH_KEY));
 selected=chosen;
 for(const button of document.querySelectorAll('[data-path-choice]')){const yes=button.dataset.pathChoice===selected;button.classList.toggle('active',yes);const p=button.querySelector('.selection-pill');if(p)p.textContent=yes?'SELECTED':'';}
 $('startAreaState').textContent=localStorage.getItem(AREA_KEY)?'✓ Area selected':'Select your service area';
 $('startAreaState').className='micro-status'+(localStorage.getItem(AREA_KEY)?' done':'');
 $('ajcState').textContent=portal.visited?.ajc?'✓ Visited':'Open this step when ready';
 $('ajcState').className='micro-status'+(portal.visited?.ajc?' done':'');
 $('discoverState').textContent=done('module1')?'✓ Completed':cloudOrLocal().progress?.module1==='in_progress'?'In progress':'Ready to start';
 $('discoverState').className='micro-status'+(done('module1')?' done':'');
 const prepReady=done('module1'),prepDone=done('coachAppointmentPrep');
 $('coachPrepButton').disabled=!prepReady;
 $('coachPrepButton').textContent=prepDone?'Review Coach Prep →':'Open Coach Prep →';
 $('coachPrepIcon').textContent=prepDone?'✓':'04';
 $('coachBridge').classList.toggle('complete',prepDone);
 $('coachBridge').classList.toggle('locked',!prepReady);
 $('coachPrepState').textContent=prepDone?'✓ Preparation reviewed and saved':prepReady?'● Available — prepare for enrollment conversation':'🔒 Available after Discover';
 const all=['module1',...pathwayOrder()];
 const completed=all.filter(done).length,total=all.length;
 const percent=Math.round(completed/total*100);
 $('progressPercent').textContent=percent+'%';
 $('progressCaption').textContent=completed+' of '+total+' completed';
 $('progressFill').style.width=percent+'%';$('progressTrack').setAttribute('aria-valuenow',String(percent));
 const pendingCoach=done('module1')&&!done('coachAppointmentPrep');
 $('progressMessage').textContent=pendingCoach?'Coach Appointment Prep is ready before enrollment. This recommended step does not block Northern pathway activities.':(!selected?'Complete Discover, then choose a pathway to see your next steps.':(completed===total?'All required steps in this pathway are marked complete.':'Your next required step is '+labelFor(nextId()||'module1')+'.'));

 $('journeySection').hidden=!selected;
 if(!selected)return;
 $('selectedEyebrow').textContent=selected==='career'?'CAREER EXPLORATION & DEVELOPMENT':'RAPID EMPLOYMENT';
 $('journeyTitle').textContent=selected==='career'?'Explore, validate, and decide':'Move forward with a focused plan';
 const next=nextId();const n=$('nextStep');n.replaceChildren();
 const info=document.createElement('div');const k=document.createElement('small'),strong=document.createElement('strong'),para=document.createElement('p');
 k.textContent=next==='coachAppointmentPrep'?'PRE-ENROLLMENT PREPARATION':next?'NEXT REQUIRED STEP':'PATHWAY PROGRESS';strong.textContent=next?labelFor(next):'All required steps complete';para.textContent=next?(details[next]?.desc||'Continue your BOOST journey.'):'You can reopen completed activities or speak with your career coach.';
 info.append(k,strong,para);n.append(info);
 if(next&&available(next)){const b=document.createElement('button');b.className='btn primary';b.textContent='Open next step →';b.onclick=()=>launch(next);n.append(b);}
 const stepList=$('stepList');stepList.replaceChildren();
 const ART_BASE='https://pinalworkforce1-del.github.io/BOOST_Pathway-Portal/assets/images/';
 const STEP_ART=Object.freeze({
   module2:'validate.webp',
   module3:'career-mobility.webp',
   module4:'decide.webp',
   industry:'industry-skills.webp',
   financial:'financial-habits.webp',
   ai:'ai-and-you.webp',
   skillmobility:'career-mobility.webp',
   jobsearch:'48-hour-job-search.webp'
 });
 // Display every pathway stage, even when an unmatched industry experience
 // is excluded from the required progression sequence. Match Pinal's
 // "Not required" card semantics without creating a false completion.
 orders[selected].forEach((id,i)=>{
   const notRequired=id==='industry'&&skipUnmappedIndustry();
   const complete=!notRequired&&done(id),unlocked=!notRequired&&available(id),review=!notRequired&&stale(id);
   const article=document.createElement('article');
   article.className='step-card'+(notRequired?' not-required':complete?' completed':!unlocked?' locked':'');
   const badge=document.createElement('div');badge.className='step-number';badge.textContent=notRequired?'—':complete?'✓':String(i+2).padStart(2,'0');
   const body=document.createElement('div');body.className='step-content';
   const h=document.createElement('h3');h.textContent=labelFor(id);
   const p=document.createElement('p');
   p.textContent=notRequired?'No industry skills experience is mapped to your career selected in Decide. Continue to Financial Habits.':details[id]?.desc||'Continue your Northern BOOST experience';
   const status=document.createElement('div');status.className='step-status'+(notRequired?' not-required':complete?' done':unlocked?' current':'');
   status.textContent=notRequired?'Not required for this occupation':review?'↻ Review required':complete?'✓ Completed — review again':unlocked?'● Available to start':'🔒 Complete the previous required step';
   body.append(h,p,status);
   const controls=document.createElement('div');controls.className='step-controls';
   const explain=document.createElement('button');explain.className='small-btn';explain.textContent=notRequired?'Why not required?':'Ask Rosie';explain.onclick=()=>explainStep(id);controls.append(explain);
   const go=document.createElement('button');go.className='small-btn launch';
   go.textContent=notRequired?'Not required':complete?'Review again →':'Open activity →';
   go.disabled=notRequired||!unlocked;go.onclick=()=>launch(id);controls.append(go);
   // Decorative art only: preserve original completion state, launch controls and handlers.
   const media=document.createElement('div');media.className='step-art';media.setAttribute('aria-hidden','true');
   const art=document.createElement('img');art.alt='';art.loading='lazy';art.decoding='async';
   art.src=ART_BASE+(STEP_ART[id]||'discover.webp');
   art.onerror=()=>{media.classList.add('art-unavailable');art.remove();};
   media.append(art);
   article.append(badge,media,body,controls);stepList.append(article);
 });
 // Append the certificate AFTER nextStep has been rebuilt by render().
 // Earlier insertion was removed immediately by nextStep.replaceChildren().
 const certEligible=!!selected&&all.length>0&&completed===total;
 window.NorthernBOOSTPathwayCertificate?.sync({
   eligible:certEligible,userId:user.id,path:selected,
   requiredIds:all,journey:cloudOrLocal(),
   serviceArea:localStorage.getItem(AREA_KEY+':'+user.id)||localStorage.getItem(AREA_KEY)||portal.serviceArea||''
 });
 $('syncStatus').textContent=lastCloudMessage;
}
function choosePath(p){
 if(!validPath(p))return;
 if(!done('module1')){sessionStorage.setItem(PICK_KEY,p);render();$('progressMessage').textContent='You chose a pathway. Complete Module 1 — Discover before opening its next activities.';document.getElementById('progressTrack').scrollIntoView({behavior:'smooth',block:'center'});return;}
 if(selected&&selected!==p&&!window.confirm('Switch to the other pathway? Your existing saved work will remain available.'))return;
 sessionStorage.setItem(PICK_KEY,p);render();$('journeySection').scrollIntoView({behavior:'smooth',block:'start'});
}
function explainStep(id){
 activeStep=id;const d=details[id];if(!d)return;
 $('stepTitle').textContent=labelFor(id);$('stepDescription').textContent=d.desc;
 const can=available(id);
 $('stepRequirement').textContent=can?'This step is available. Your Northern BOOST progression still applies.':id==='industry'&&!recommendedIndustry()?'No matching Northern industry skills experience exists for this occupation. BOOST skips this stage and continues to Financial Habits.':'Complete the earlier step in your Northern BOOST pathway first.';
 $('openStep').hidden=!can;
 $('audioStatus').textContent='';$('stepAudio').pause();$('stepAudio').removeAttribute('src');$('stepAudio').removeAttribute('data-module');$('stepAudio').load();$('playStepAudio').textContent='▶ Listen to Rosie explain this step';showDialog('stepDialog');
}
function nonce(){const a=new Uint8Array(18);crypto.getRandomValues(a);return [...a].map(x=>x.toString(16).padStart(2,'0')).join('');}
function launch(id){
 if(!user){$('authGate').scrollIntoView();return}
 if(!available(id)){explainStep(id);return;}
 const d=details[id];if(!d)return;let target=d.url;
 if(id==='industry'){
   const key=recommendedIndustry();
   if(!key||!industryMap[key]){
     // Never route an unavailable industry step into Rosie’s pathway-intro video.
     render();
     $('journeySection').scrollIntoView({behavior:'smooth',block:'start'});
     return;
   }
   target=industryMap[key].url;
 }
 if(!target)return;
 // Coach preparation saves its own atomic cloud record; no legacy completion-return marker.
 if(id==='coachAppointmentPrep'){markReturnNavigation(id);sessionStorage.removeItem(RETURN_KEY);window.location.assign(new URL(target,document.baseURI).toString());return;}
 // Preserve existing Northern progression keys only when intentionally entering a test activity.
 if(selected) localStorage.setItem(PATH_KEY,selected);
 const url=new URL(target,document.baseURI);
 if(id==='skillmobility'||id==='jobsearch'||id==='financial'||id==='ai'){
    const t=nonce();sessionStorage.setItem(NONCE_PREFIX+id,t);
    if(id==='jobsearch')url.searchParams.set('boost_region','northern');
    // Existing Northern map verifies nonce receipts and saves completion to cloud.
    // Always return through that authoritative controller, not the preview.
    url.searchParams.set('boost_return',new URL('index.html',document.baseURI).toString());
    url.searchParams.set('boost_module',id);
    url.searchParams.set('boost_nonce',t);
 }
 // Keep one browsing context: sessionStorage completion receipts belong to this tab.
 // The legacy map performs its normal save/validation before the preview-only bridge returns here.
 const receipt=sessionStorage.getItem(NONCE_PREFIX+id);
 sessionStorage.setItem(RETURN_KEY,JSON.stringify({
   version:1,module:id,startedAt:Date.now(),expectedNonce:receipt||null
 }));
 markReturnNavigation(id);
 window.location.assign(url.toString());
}
// Only accept a completed activity when the same Northern browser session
// initiated it AND the signed-in participant has the saved evidence locally.
async function consumeNorthernCompletionReturn(){
 const url=new URL(location.href),id=url.searchParams.get('boost_complete'),received=url.searchParams.get('boost_nonce');
 if(!id)return null;
 const supported=['skillmobility','jobsearch','financial','ai'];
 const expected=id&&sessionStorage.getItem(NONCE_PREFIX+id);
 const raw=sessionStorage.getItem(RETURN_KEY);
 let marker=null;try{marker=raw?JSON.parse(raw):null}catch(_){}
 const clearUrl=()=>{url.searchParams.delete('boost_complete');url.searchParams.delete('boost_nonce');history.replaceState({},'',url.toString())};
 if(!supported.includes(id)||!expected||!received||expected!==received||
    marker?.module!==id||marker.version!==1||Date.now()-Number(marker.startedAt)>2*60*60*1000){
   clearUrl();
   return 'Completion was not accepted because its Northern session verification was missing. Your saved work was not deleted.';
 }
 const local=localJourney(),modules=local.modules||{};
 const record=id==='ai'?(local.module5||modules.module5):modules[id];
 const completedAt=record?.completedAt||record?.completed_at;
 const finished=Boolean(completedAt)&&
   (id!=='jobsearch'||(record?.activities?.plan===true&&record?.module==='jobsearch'))&&
   (id!=='financial'||record?.module==='financial')&&
   (id!=='ai'||record?.snapshot||record?.version);
 if(!finished){
   clearUrl();
   return 'The activity returned, but complete saved evidence was not found. No completion was added.';
 }
 const c=getClient();
 const loaded=await c.rpc('boost_load_my_journey_for_region',{p_region:'Northern Arizona'});
 if(loaded.error)throw loaded.error;
 const remote=loaded.data&&typeof loaded.data==='object'?loaded.data:{};
 const next={...remote,region:'Northern Arizona',
    modules:{...(remote.modules||{})},progress:{...(remote.progress||{})}};
 if(id==='ai'){
   next.module5=record;next.modules.module5=record;
 }else next.modules[id]=record;
 next.progress[id]='complete';
 const now=new Date().toISOString();
 next.updatedAt=now;next.updated_at=now;
 const save=await c.rpc('boost_save_my_journey_for_region',{p_region:'Northern Arizona',p_journey:next});
 if(save.error)throw save.error;
 // The authenticated cloud save succeeded. Only now accept this completion.
 localStorage.setItem(JOURNEY_KEY,JSON.stringify(next));
 const p=read(PORTAL_KEY);p.rapid=p.rapid||{};if(['skillmobility','jobsearch'].includes(id))p.rapid[id]=true;
 localStorage.setItem(PORTAL_KEY,JSON.stringify(p));
 sessionStorage.removeItem(NONCE_PREFIX+id);sessionStorage.removeItem(RETURN_KEY);
 sessionStorage.setItem(RETURN_NOTICE_KEY,JSON.stringify({module:id,at:Date.now()}));
 clearUrl();
 return null;
}
async function loadJourney(){
 if(!user)return;
 let completionNotice=null;
 try{completionNotice=await consumeNorthernCompletionReturn()}
 catch(err){completionNotice='Your activity is saved locally, but Northern cloud completion could not be confirmed. Please keep this tab and try Refresh Progress. '+(err?.message||'')}
 try{
  const c=getClient(),{data,error}=await c.rpc('boost_load_my_journey_for_region',{p_region:'Northern Arizona'});
  if(error)throw error;
  journey=(data&&typeof data==='object')?data:{};
  hydrateNorthernLocalFromCloud(journey);
  lastCloudMessage=Object.keys(journey).length?'Your saved Northern BOOST journey is ready.':'No saved Northern BOOST journey was found yet.';
 }catch(err){journey={};lastCloudMessage='Cloud load unavailable. Progress cannot be confirmed until connection is restored. '+(err.message||'');}
 const pathwayReturn=pendingPathwayReturn();
 if(pathwayReturn?.path)sessionStorage.setItem(PICK_KEY,pathwayReturn.path);
 render();
 if(completionNotice)$('progressMessage').textContent=completionNotice;
 const noticeRaw=sessionStorage.getItem(RETURN_NOTICE_KEY);
 if(noticeRaw){
   sessionStorage.removeItem(RETURN_NOTICE_KEY);
   try{
     const notice=JSON.parse(noticeRaw);
     if(Date.now()-Number(notice.at||0)<180000){
       const label=details[notice.module]?.name||'Your activity';
       $('progressMessage').textContent=label+' returned to BOOST 2.0. '+(done(notice.module)?'Your completion is visible in the Northern cloud journey.':'No new cloud completion is confirmed for this step. Review the activity save if you expected it to be complete.');
     }
   }catch(_){}
 }
 // On a verified return, resume at the selected pathway rather than the
 // orientation, progress and pathway-selection sections. Keep any cloud-save
 // error visible instead of scrolling past it.
 if(!completionNotice)focusSelectedPathwayAfterReturn(pathwayReturn);
}
async function refresh(){
 if(!user)return;const b=$('refreshProgress');if(b)b.disabled=true;
 await loadJourney();
 if(b)b.disabled=false;
}
async function boot(){
 const c=getClient();const{data,error}=await c.auth.getSession();
 if(error)throw error;
 user=data?.session?.user||null;authReady=true;setVisible();
 if(user)await loadJourney();
 else{setMessage('Enter your email to receive a secure sign-in code.');}
}
function install(){
 $('chooseArea').onclick=()=>showDialog('areaDialog');
 const INTRO_MEDIA={
   career:{title:'Career Exploration & Development',src:'https://pinalworkforce1-del.github.io/BOOST_Pathway-Portal/assets/video/rosie-boost2-career-exploration.mp4'},
   rapid:{title:'Rapid Employment',src:'https://pinalworkforce1-del.github.io/BOOST_Pathway-Portal/assets/video/rosie-boost2-rapid-reemployment.mp4'}
 };
 let introLoaded=null;
 function offerIntro(type){
   const chosen=type==='rapid'?'rapid':'career',data=INTRO_MEDIA[chosen];
   const video=$('rosieVideo');const stage=$('rosieVideoStage'),status=$('rosieVideoStatus');
   $('rosieOverviewAudio').pause();
   $('rosieVideoTitle').textContent='Rosie Introduces '+data.title;
   $('rosieVideoFallback').href=data.src;$('rosieVideoFallback').hidden=true;
   video.pause();video.removeAttribute('src');video.load();video.src=data.src;video.load();
   introLoaded=chosen;stage.hidden=false;status.textContent='Video ready. Choose Play when you are ready.';
   document.querySelectorAll('[data-rosie-intro]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.rosieIntro===chosen)));
   showDialog('rosieDialog');
 }
 $('meetRosie').onclick=()=>{
   const chosen=selected==='rapid'?'rapid':'career';
   offerIntro(chosen);
 };
 document.querySelectorAll('[data-rosie-intro]').forEach(button=>button.onclick=()=>offerIntro(button.dataset.rosieIntro));
 $('rosieVideo').addEventListener('error',()=>{
   $('rosieVideoStatus').textContent='The video could not load here. You can continue your pathway or open the recording in a separate tab.';
   $('rosieVideoFallback').hidden=false;
 });
 $('rosieVideo').addEventListener('loadedmetadata',()=>{
   $('rosieVideoStatus').textContent='Optional recorded introduction with Rosie. Choose Play to listen.';
 });
 $('rosieOverview').addEventListener('toggle',()=>{
   if($('rosieOverview').open){$('rosieVideo').pause()}
   else{$('rosieOverviewAudio').pause()}
 });
 $('resumeBtn').onclick=()=>{if(!user){$('authGate').scrollIntoView({behavior:'smooth'});return;}if(!selected){$('pathwaySection').scrollIntoView({behavior:'smooth'});return;}const id=nextId();if(id)launch(id);else $('journeySection').scrollIntoView({behavior:'smooth'});};
 $('discoverBtn').onclick=()=>launch('module1');
 $('coachPrepButton').onclick=()=>launch('coachAppointmentPrep');
 $('ajcLink').addEventListener('click',()=>{portal=read(PORTAL_KEY);portal.visited=portal.visited||{};portal.visited.ajc=true;localStorage.setItem(PORTAL_KEY,JSON.stringify(portal));render();});
 $('switchPathway').onclick=()=>{$('pathwaySection').scrollIntoView({behavior:'smooth',block:'start'})};
 document.querySelectorAll('[data-path-choice]').forEach(b=>b.onclick=()=>choosePath(b.dataset.pathChoice));
 document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>closeDialog(b.dataset.close));
 document.querySelectorAll('.overlay').forEach(el=>el.addEventListener('click',e=>{if(e.target===el)closeDialog(el.id)}));
 window.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.overlay:not([hidden])').forEach(x=>closeDialog(x.id))});
 document.querySelectorAll('[data-area]').forEach(b=>b.onclick=()=>{
   const k=b.dataset.area;if(!AREA_FORMS[k])return;
   localStorage.setItem(AREA_KEY,k);if(user?.id)localStorage.setItem(AREA_KEY+':'+user.id,k);portal=read(PORTAL_KEY);portal.visited=portal.visited||{};portal.visited.startarea=true;portal.serviceArea=k;localStorage.setItem(PORTAL_KEY,JSON.stringify(portal));render();
   closeDialog('areaDialog');window.open(AREA_FORMS[k],'_blank','noopener');
 });
 $('rosieVideo').addEventListener('ended',()=>{$('rosieVideoStatus').textContent='Introduction complete. Continue to your Northern BOOST journey whenever you are ready.';});
 $('playStepAudio').onclick=()=>{
   const d=details[activeStep],a=$('stepAudio');
   if(!d?.audio){$('audioStatus').textContent='Narration is not available for this step.';return;}
   if(a.dataset.module!==activeStep){
     a.src=new URL(d.audio,document.baseURI).href;
     a.dataset.module=activeStep;
   }
   if(!a.paused){a.pause();$('playStepAudio').textContent='▶ Listen to Rosie explain this step';return;}
   a.play().then(()=>{$('audioStatus').textContent='Playing Rosie’s step guidance.';$('playStepAudio').textContent='Ⅱ Pause step narration';})
     .catch(()=>{$('audioStatus').textContent='Narration is unavailable. You can still ask Rosie a question or open this step.';});
 };
 $('stepAudio').addEventListener('ended',()=>{$('playStepAudio').textContent='▶ Listen to Rosie explain this step';});
 $('askStepRosie').onclick=()=>{
 const id=activeStep,d=details[id];if(!d)return;
 closeDialog('stepDialog');
 const prompt='I am looking at '+d.name+' in Northern BOOST. '+d.desc+' Can you help me understand how it connects to my saved progress and what to discuss with my Career Coach?';
 if(window.NorthernRosieV2?.open)window.NorthernRosieV2.open(prompt);
 else $('progressMessage').textContent='Rosie is unavailable right now. You can still open this activity.';
 };
 $('openStep').onclick=()=>{const id=activeStep;closeDialog('stepDialog');launch(id)};
 const refreshButton=document.createElement('button');refreshButton.id='refreshProgress';refreshButton.type='button';refreshButton.className='ghost dark';refreshButton.textContent='↻ Refresh Progress';
 document.querySelector('.top-actions').insertBefore(refreshButton,$('signOut'));refreshButton.onclick=refresh;
 $('signOut').onclick=async()=>{try{await getClient().auth.signOut()}finally{user=null;journey={};sessionStorage.removeItem(PICK_KEY);render();}};
 $('authForm').addEventListener('submit',async e=>{
 e.preventDefault();const em=$('email').value.trim();if(!em)return;
 const b=$('emailSend');b.disabled=true;setMessage('Requesting your secure code…');
 try{
   const {error}=await getClient().auth.signInWithOtp({email:em,options:{shouldCreateUser:true,emailRedirectTo:new URL('index.html',document.baseURI).toString()}});
   if(error)throw error;
   $('codeRow').hidden=false;setMessage('If the address is eligible, a sign-in email was requested. Enter the numeric code to continue.');
 }catch(err){setMessage('Unable to request a code: '+(err.message||'Unknown error'))}finally{b.disabled=false}
 });
 $('verifyCode').onclick=async()=>{
  const em=$('email').value.trim(),token=$('code').value.replace(/\s/g,'');
  if(!em||!token){setMessage('Enter your email and verification code.');return;}
  $('verifyCode').disabled=true;setMessage('Verifying…');
  try{
   const {data,error}=await getClient().auth.verifyOtp({email:em,token,type:'email'});
   if(error)throw error;
   user=data?.user||data?.session?.user||null;
   if(!user)throw Error('A verified session was not returned.');
   setMessage('Verified successfully.');setVisible();await loadJourney();
  }catch(err){setMessage('Could not verify: '+(err.message||'Unknown error'))}finally{$('verifyCode').disabled=false}
 };
 // The preview does not synthesize completion signals or silently write participant journey records.
 // Only Northern modules themselves can write participant progress to Supabase.
 window.addEventListener('focus',()=>{if(authReady&&user)loadJourney()});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&authReady&&user)loadJourney()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{install();boot().catch(err=>setMessage(err.message||'Sign-in setup failed'))});
else{install();boot().catch(err=>setMessage(err.message||'Sign-in setup failed'))}
})();