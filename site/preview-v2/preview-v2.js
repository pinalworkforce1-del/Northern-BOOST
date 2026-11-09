(()=>{
'use strict';
if(window.__NorthernBoostV2Preview)return;window.__NorthernBoostV2Preview=true;
const JOURNEY_KEY='boost_naz_journey_v1',PORTAL_KEY='boost_naz_portal_progress_v1',PATH_KEY='boost_naz_pathway_v1',PICK_KEY='northern_boost_v2_preview_pathway',AREA_KEY='boost_naz_service_area_v1',NONCE_PREFIX='boost_naz_completion_nonce:';
const AREA_FORMS={
 agn:'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=B5g44f9pukus8ui6NzWh9oMizKqrSvNIoO8HO9ayO39UNE1NN1o0RUNFMUI1OENHSUlTTVJKUURMTi4u',
 coconino:'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=B5g44f9pukus8ui6NzWh9oMizKqrSvNIoO8HO9ayO39UNFFNVjFYS0dRNEU5UFRBR1JERVEyQkJNTi4u'
};
const $=id=>document.getElementById(id);
const read=(k)=>{try{return JSON.parse(localStorage.getItem(k)||'{}')||{}}catch{return{}}};
const industryMap={skilled_trades:{label:'Skilled Trades',url:'Northern_BOOST_Skilled_Trades_Connected_Test_v0.4.html',legacy:'skilledTrades'},advanced_manufacturing:{label:'Advanced Manufacturing',url:'Northern_BOOST_Advanced_Manufacturing_Connected_Test_v0.2.html',legacy:'advancedManufacturing'},healthcare:{label:'Health Care',url:'Northern_BOOST_Healthcare_Connected_Test_v0.2.html',legacy:'healthcare'},it:{label:'Information Technology',url:'Northern_BOOST_IT_Connected_Test_v0.2.html',legacy:'it'},cdl:{label:'Transportation & Logistics',url:'Northern_BOOST_CDL_Connected_Test_v0.2.html',legacy:'cdl'},customer_service:{label:'Customer Service',url:'Northern_BOOST_Customer_Service_Connected_Test_v0.2.html',legacy:'customerService'}};
const details={
 module1:{name:'Module 1 — Discover',desc:'Identify your interests, strengths, work drivers, and occupations worth exploring.',audio:'assets/audio/rosie-map-module1.mp3',url:'Northern_BOOST_Module1_PinalFlow_v1.html'},
 module2:{name:'Module 2 — Reality Check',desc:'Compare the careers you chose with wages, hiring, preparation, and how they fit your life.',audio:'assets/audio/rosie-map-module2.mp3',url:'Northern_BOOST_Module2_PinalFlow_v1.html'},
 module3:{name:'Module 3 — Career Mobility',desc:'Explore transferable strengths and see where you could go from your current skills.',audio:'assets/audio/rosie-map-module3.mp3',url:'Northern_BOOST_Module3_Connected_Test_v0.8.html'},
 module4:{name:'Module 4 — Decide',desc:'Bring your evidence together and decide the most realistic next step.',audio:'assets/audio/rosie-map-module4.mp3',url:'Northern_BOOST_Module4_Connected_Test_v0.6.html'},
 industry:{name:'Applied Career Experience',desc:'Explore the industry related to the occupation you selected in Decide.',audio:'assets/audio/rosie-map-applied.mp3'},
 skillmobility:{name:'Finding Yourself in Work',desc:'Connect your existing skills to opportunities you could pursue now.',audio:'assets/audio/rosie-map-skillmobility.mp3',url:'rapid-employment.html'},
 jobsearch:{name:'48-Hour Job Search Strategy',desc:'Build a focused two-day plan with specific job search actions and contacts.',audio:'assets/audio/rosie-map-jobsearch.mp3',url:'https://pinalworkforce1-del.github.io/48_hour_job_search/boost.html'},
 financial:{name:'Build Strong Financial Habits',desc:'Consider the financial realities of finding and keeping employment.',audio:'assets/audio/rosie-map-financial.mp3',url:'https://pinalworkforce1-del.github.io/Financial_Assessment/'},
 ai:{name:'AI & You',desc:'Learn and practice practical AI skills with your own judgment in control.',audio:'assets/audio/rosie-map-ai.mp3',url:'https://pinalworkforce1-del.github.io/AI_Literacy/'}
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
function localJourney(){return read(JOURNEY_KEY)}
function cloudOrLocal(){return journey&&Object.keys(journey).length?journey:localJourney()}
function done(id){
 const j=cloudOrLocal(),pr=j.progress||{};
 if(pr[id]==='stale')return false;
 if(id==='module1')return pr.module1==='complete';
 if(id==='module2')return pr.module2==='complete'||!!j.module2?.careers?.length;
 if(id==='module3')return pr.module3==='complete'||!!j.module3?.careers?.length;
 if(id==='module4'){const m=j.module4||j.modules?.module4||{};return pr.module4==='complete'||!!m.completedAt||!!((m.careerTarget||m.targetCareer||m.career)&&m.answers)}
 if(id==='industry')return Object.entries(industryMap).some(([k,v])=>pr[v.legacy]==='complete'||pr['industry-'+k]==='complete'||j.appliedModules?.[k]?.completed===true);
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
 if(['41','43'].includes(soc)||/retail|customer service|sales|hospitality|food service/.test(title))return'customer_service';
 return null;
}
function stale(id){
 const j=cloudOrLocal();return j.progress?.[id]==='stale'||(!!j.staleModules?.[id]&&j.progress?.[id]!=='complete');
}
function available(id){
 if(id==='module1')return true;
 if(!done('module1'))return false;
 if(id==='module2'||id==='skillmobility')return true;
 const order=orders[selected]||[],index=order.indexOf(id);
 if(index<0)return false;
 if(index===0)return true;
 return done(order[index-1]);
}
function labelFor(id){const rec=id==='industry'?recommendedIndustry():null;return rec&&industryMap[rec]?industryMap[rec].label+' — Applied Experience':details[id]?.name||id}
function nextId(){if(!done('module1'))return'module1';const order=orders[selected]||[];return order.find(id=>!done(id))||null;}
function setVisible(){
 const yes=!!user;
 $('authGate').hidden=yes;$('appShell').hidden=!yes;$('signOut').hidden=!yes;
 $('identity').textContent=yes?user.email:'Sign in to begin';
}
function showDialog(id){$(id).hidden=false;document.body.style.overflow='hidden';}
function closeDialog(id){
 $(id).hidden=true;document.body.style.overflow='';
 if(id==='rosieDialog')$('rosieVideo').pause();
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
 const all=['module1',...(orders[selected]||[])];
 const completed=all.filter(done).length,total=all.length;
 const percent=Math.round(completed/total*100);
 $('progressPercent').textContent=percent+'%';
 $('progressCaption').textContent=completed+' of '+total+' completed';
 $('progressFill').style.width=percent+'%';$('progressTrack').setAttribute('aria-valuenow',String(percent));
 $('progressMessage').textContent=!selected?'Complete Discover, then choose a pathway to see your next steps.':(completed===total?'All required steps in this pathway are marked complete.':'Your next required step is '+labelFor(nextId()||'module1')+'.');
 $('journeySection').hidden=!selected;
 if(!selected)return;
 $('selectedEyebrow').textContent=selected==='career'?'CAREER EXPLORATION & DEVELOPMENT':'RAPID EMPLOYMENT';
 $('journeyTitle').textContent=selected==='career'?'Explore, validate, and decide':'Move forward with a focused plan';
 const next=nextId();const n=$('nextStep');n.replaceChildren();
 const info=document.createElement('div');const k=document.createElement('small'),strong=document.createElement('strong'),para=document.createElement('p');
 k.textContent=next?'NEXT REQUIRED STEP':'PATHWAY PROGRESS';strong.textContent=next?labelFor(next):'All required steps complete';para.textContent=next?(details[next]?.desc||'Continue your BOOST journey.'):'You can reopen completed activities or speak with your career coach.';
 info.append(k,strong,para);n.append(info);
 if(next&&available(next)){const b=document.createElement('button');b.className='btn primary';b.textContent='Open next step →';b.onclick=()=>launch(next);n.append(b);}
 const stepList=$('stepList');stepList.replaceChildren();
 orders[selected].forEach((id,i)=>{
   const complete=done(id),unlocked=available(id),review=stale(id);const article=document.createElement('article');
   article.className='step-card'+(complete?' completed':'')+(!unlocked?' locked':'');
   const badge=document.createElement('div');badge.className='step-number';badge.textContent=complete?'✓':String(i+2).padStart(2,'0');
   const body=document.createElement('div');body.className='step-content';
   const h=document.createElement('h3');h.textContent=labelFor(id);const p=document.createElement('p');p.textContent=details[id]?.desc||'Continue your Northern BOOST experience';
   const status=document.createElement('div');status.className='step-status'+(complete?' done':unlocked?' current':'');
   status.textContent=review?'↻ Review required':complete?'✓ Completed — review again':unlocked?'● Available to start':'🔒 Complete the previous required step';
   body.append(h,p,status);
   const controls=document.createElement('div');controls.className='step-controls';
   const explain=document.createElement('button');explain.className='small-btn';explain.textContent='Ask Rosie';explain.onclick=()=>explainStep(id);controls.append(explain);
   const go=document.createElement('button');go.className='small-btn launch';go.textContent=complete?'Review again →':'Open activity →';go.disabled=!unlocked;go.onclick=()=>launch(id);controls.append(go);
   article.append(badge,body,controls);stepList.append(article);
 });
 $('syncStatus').textContent=lastCloudMessage;
}
function choosePath(p){
 if(!validPath(p))return;
 if(!done('module1')){sessionStorage.setItem(PICK_KEY,p);render();$('progressMessage').textContent='You chose a pathway. Complete Module 1 — Discover before opening its next activities.';document.getElementById('progressTrack').scrollIntoView({behavior:'smooth',block:'center'});return;}
 if(selected&&selected!==p&&!window.confirm('Switch your preview to the other pathway? This keeps existing saved records; the selection will be made active when you open a module.'))return;
 sessionStorage.setItem(PICK_KEY,p);render();$('journeySection').scrollIntoView({behavior:'smooth',block:'start'});
}
function explainStep(id){
 activeStep=id;const d=details[id];if(!d)return;
 $('stepTitle').textContent=labelFor(id);$('stepDescription').textContent=d.desc;
 const can=available(id);
 $('stepRequirement').textContent=can?'This step is available. Your Northern BOOST progression still applies.':id==='industry'&&!recommendedIndustry()?'The applied experience requires a selected occupation from Decide.':'Complete the earlier step in your Northern BOOST pathway first.';
 $('openStep').hidden=!can;
 $('audioStatus').textContent='';$('stepAudio').removeAttribute('src');$('stepAudio').load();showDialog('stepDialog');
}
function nonce(){const a=new Uint8Array(18);crypto.getRandomValues(a);return [...a].map(x=>x.toString(16).padStart(2,'0')).join('');}
function launch(id){
 if(!user){$('authGate').scrollIntoView();return}
 if(!available(id)){explainStep(id);return;}
 const d=details[id];if(!d)return;let target=d.url;
 if(id==='industry'){const key=recommendedIndustry();if(!key||!industryMap[key]){explainStep(id);return}target=industryMap[key].url;}
 if(!target)return;
 // Preserve existing Northern progression keys only when intentionally entering a test activity.
 if(selected) localStorage.setItem(PATH_KEY,selected);
 const url=new URL(target,document.baseURI);
 if(id==='skillmobility'||id==='jobsearch'||id==='financial'||id==='ai'){
    const t=nonce();sessionStorage.setItem(NONCE_PREFIX+id,t);
    if(id==='jobsearch')url.searchParams.set('boost_region','northern');
    url.searchParams.set('boost_return',new URL('preview-v2/index.html',document.baseURI).toString());
    url.searchParams.set('boost_module',id);
    url.searchParams.set('boost_nonce',t);
 }
 if(id==='module1'||id==='module2'||id==='module3'||id==='module4'||id==='industry'){
   // Keep the preview open; legacy modules currently return to the existing Northern map.
   const tab=window.open(url.toString(),'_blank','noopener');
   if(!tab){window.location.assign(url.toString());return;}
   $('progressMessage').textContent='Activity opened in a separate tab. After saving, return here and select Refresh Progress.';
 }else{
   const tab=window.open(url.toString(),'_blank','noopener');
   if(!tab){window.location.assign(url.toString());return;}
   $('progressMessage').textContent='Activity opened in a separate tab. After saving, return here and select Refresh Progress.';
 }
}
async function loadJourney(){
 if(!user)return;
 try{
  const c=getClient(),{data,error}=await c.rpc('boost_load_my_journey_for_region',{p_region:'Northern Arizona'});
  if(error)throw error;
  journey=(data&&typeof data==='object')?data:{};
  const j=journey;
  const local=localJourney();
  if(!Object.keys(j).length&&Object.keys(local).length)lastCloudMessage='No authenticated Northern record found. Local browser progress is shown; verify cloud save before launch.';
  else lastCloudMessage='Northern authenticated journey loaded (read-only preview).';
 }catch(err){journey=localJourney();lastCloudMessage='Cloud load unavailable; showing local browser data only. '+(err.message||'');}
 render();
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
 else{setMessage('Enter your test-account email to receive a secure code.');}
}
function install(){
 $('chooseArea').onclick=()=>showDialog('areaDialog');$('meetRosie').onclick=()=>showDialog('rosieDialog');
 $('resumeBtn').onclick=()=>{if(!user){$('authGate').scrollIntoView({behavior:'smooth'});return;}if(!selected){$('pathwaySection').scrollIntoView({behavior:'smooth'});return;}const id=nextId();if(id)launch(id);else $('journeySection').scrollIntoView({behavior:'smooth'});};
 $('discoverBtn').onclick=()=>launch('module1');
 $('ajcLink').addEventListener('click',()=>{portal=read(PORTAL_KEY);portal.visited=portal.visited||{};portal.visited.ajc=true;localStorage.setItem(PORTAL_KEY,JSON.stringify(portal));render();});
 $('switchPathway').onclick=()=>{$('pathwaySection').scrollIntoView({behavior:'smooth',block:'start'})};
 document.querySelectorAll('[data-path-choice]').forEach(b=>b.onclick=()=>choosePath(b.dataset.pathChoice));
 document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>closeDialog(b.dataset.close));
 document.querySelectorAll('.overlay').forEach(el=>el.addEventListener('click',e=>{if(e.target===el)closeDialog(el.id)}));
 window.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.overlay:not([hidden])').forEach(x=>closeDialog(x.id))});
 document.querySelectorAll('[data-area]').forEach(b=>b.onclick=()=>{
   const k=b.dataset.area;if(!AREA_FORMS[k])return;
   localStorage.setItem(AREA_KEY,k);portal=read(PORTAL_KEY);portal.visited=portal.visited||{};portal.visited.startarea=true;portal.serviceArea=k;localStorage.setItem(PORTAL_KEY,JSON.stringify(portal));render();
   closeDialog('areaDialog');window.open(AREA_FORMS[k],'_blank','noopener');
 });
 $('rosieVideo').addEventListener('ended',()=>closeDialog('rosieDialog'));
 $('playStepAudio').onclick=()=>{const d=details[activeStep];if(!d?.audio)return;const a=$('stepAudio');a.src=d.audio;a.play().catch(()=>{$('audioStatus').textContent='Audio unavailable. The written explanation is still available.'})};
 $('openStep').onclick=()=>{const id=activeStep;closeDialog('stepDialog');launch(id)};
 const refresh=document.createElement('button');refresh.id='refreshProgress';refresh.type='button';refresh.className='ghost dark';refresh.textContent='↻ Refresh Progress';
 $('topActions');document.querySelector('.top-actions').insertBefore(refresh,$('signOut'));refresh.onclick=refresh;
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