(()=>{'use strict';
if(window.__NORTHERN_COACH_PREP_V1__)return;window.__NORTHERN_COACH_PREP_V1__=true;
const $=id=>document.getElementById(id),REGION='Northern Arizona';
const NAMES={R:'Realistic',I:'Investigative',A:'Artistic',S:'Social',E:'Enterprising',C:'Conventional'};
const safe=(v)=>String(v??'').trim(),list=(x)=>Array.isArray(x)?x.filter(Boolean):[];
let client=null,journey=null,user=null,ready=false;
const status=(msg,error=false)=>{$('loadStatus').textContent=msg;$('loadStatus').classList.toggle('error',error)};
const saveStatus=(msg,error=false)=>{$('saveStatus').textContent=msg;$('saveStatus').classList.toggle('error',error)};
function supa(){
 if(client)return client;
 const c=window.BOOST_CONFIG||{};
 if(!window.supabase?.createClient||!c.supabaseUrl||!c.supabaseAnonKey)throw Error('Northern secure sign-in is not available.');
 client=window.supabase.createClient(c.supabaseUrl,c.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 return client;
}
const moduleOne=j=>j?.module1||j?.modules?.module1||{};
function m1Complete(j){return j?.progress?.module1==='complete'}
function scores(j){const m=moduleOne(j);return [m.riasec,m.scores,m.interestScores,j?.onetScores].find(v=>v&&typeof v==='object'&&Object.keys(NAMES).some(k=>Number(v[k])>0))||{}}
function topics(){return [...document.querySelectorAll('#topics input:checked')].map(x=>x.value)}
function docs(){return [...document.querySelectorAll('#documents input:checked')].map(x=>x.value)}
function fillChecked(selector,values){const wanted=new Set(list(values));document.querySelectorAll(selector+' input').forEach(x=>x.checked=wanted.has(x.value))}

const DESCRIPTIONS={
 R:{word:'building, fixing, working with tools and practical tasks',heading:'hands-on work'},
 I:{word:'asking questions, understanding problems, and finding explanations',heading:'exploring and solving problems'},
 A:{word:'creating, designing, and expressing ideas',heading:'creating and expressing ideas'},
 S:{word:'helping, teaching, supporting, and working with people',heading:'helping people'},
 E:{word:'leading, persuading, and guiding projects or groups',heading:'leading and influencing'},
 C:{word:'organizing information, following processes, and working with details',heading:'working with structure and details'}
};
const DRIVER_LABELS={
 helping:'Helping people directly',hands:'Working with my hands',solving:'Solving problems',
 creating:'Creating or improving things',leading:'Leading or influencing others',
 organizing:'Organizing details or systems',independence:'Having independence',
 team:'Being part of a team',movement:'Staying active or moving',stability:'Having stability',
 growth:'Growing into something bigger',impact:'Doing work that matters'
};
const DRIVER_THEMES={
 helping:['S'],hands:['R'],solving:['I'],creating:['A'],leading:['E'],
 organizing:['C'],team:['S','E'],independence:[],movement:['R'],
 stability:[],growth:[],impact:[]
};
const make=(tag,cls,value)=>{
 const n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=String(value);return n
};
const addLine=(target,label,value)=>{
 if(value===undefined||value===null||String(value).trim()==='')return;
 const row=make('div','evidence-row'),key=make('strong','',label),content=make('span','',value);
 row.append(key,content);target.append(row)
};
function narrativeList(parts){
 const a=parts.filter(Boolean).map(x=>String(x));
 if(!a.length)return'';
 return a.length===1?a[0]:a.length===2?a.join(' and '):a.slice(0,-1).join(', ')+', and '+a[a.length-1]
}
function savedScoreRows(j){
 const r=scores(j);
 return Object.keys(NAMES).map(k=>({code:k,label:NAMES[k],value:Number(r[k])})).filter(x=>r[x.code]!==undefined&&r[x.code]!==null&&r[x.code]!==''&&Number.isFinite(x.value)&&x.value>=0).sort((a,b)=>b.value-a.value);
}
function savedCareers(j){const m=moduleOne(j);return list(m.careers?.length?m.careers:m.selected).slice(0,3)}
function selectedDrivers(m){
 const d=m?.mindmap?.drivers||{};
 return Object.entries(d).filter(([,v])=>v==='yes').map(([key])=>key)
}
function interpretation(k){return DESCRIPTIONS[k]?.word||''}
function classify(label,value){
 // Prefer Module 1's own descriptions, never manufacture an alignment score.
 const s=safe(label).toLowerCase();
 if(/strong/.test(s))return'notice-positive';
 if(/some|moderate|partial/.test(s))return'notice-neutral';
 if(/different|limited|low/.test(s))return'notice-attention';
 if(Number.isFinite(Number(value))&&value!==null&&value!==undefined&&value!==''){
  const n=Number(value);
  return n>=78?'notice-positive':n>=62?'notice-neutral':'notice-attention';
 }
 return'notice-neutral'
}
function appendMeaning(target,msg){const p=make('p','',msg);target.append(p)}
function render(j){
 const m=moduleOne(j),f=m.mindmap?.fields||{},person=j.participant||{};
 const firstName=safe(person.name||person.fullName||user?.user_metadata?.full_name||'').split(/\s+/)[0]||'';
 const greeting=firstName?firstName+', here is what you discovered.':'Here is what you discovered.';
 $('storyGreeting').textContent=greeting;
 $('storyOverview').textContent='You explored the work that feels right to you, added your six O*NET interest results, and selected occupations to investigate. This brief puts those pieces together so you can talk through what fits, what remains uncertain, and what to look at next.';
 const assessment=m.interestAssessment||{};
 const mini=assessment.type==='boost_onet_mini_30_v1';
 $('interestAssessmentSource').textContent=mini
   ?'Source: BOOST 30-activity Mini Interest Profiler (0–20 points per theme). Adapted from O*NET interest themes; not the full official assessment.'
   :'Source: Saved six-score O*NET interest pattern. If these scores came from the full profiler, its scoring scale differs from BOOST Mini; compare the patterns rather than raw numbers.';
 const rows=savedScoreRows(j),leading=rows.filter(x=>x.value>0).slice(0,3);
 const strong=leading.map(x=>x.label);
 const scoreBars=$('scoreBars');scoreBars.replaceChildren();
 const full=rows.length===6&&rows.some(x=>x.value>0);
 if(full){
  const max=Math.max(...rows.map(x=>x.value),1);
  const order=Object.keys(NAMES);
  for(const code of order){
   const item=rows.find(x=>x.code===code);
   const row=make('div','score-row');const key=make('span','score-name',code+' · '+NAMES[code]);const bar=make('div','score-track');const fill=make('div','score-fill');fill.style.width=Math.round((item.value/max)*100)+'%';bar.append(fill);
   const value=make('strong','score-value',item.value);row.append(key,bar,value);scoreBars.append(row);
  }
  $('onetNarrative').textContent='My highest O*NET interest areas were '+narrativeList(strong)+'. All six results are shown below. Higher scores reflect activities I reported enjoying more; they do not mean I am better at those activities.';
  $('onetInterpretation').textContent='What that may mean: '+leading.map(x=>x.label+' interests often involve '+interpretation(x.code)).join('; ')+'. My coach and I can compare this pattern with the work I described and the careers I chose.';
 }else{
  $('onetNarrative').textContent='My full six-score O*NET interest pattern was not available in this saved Module 1 record. I can review the profiler results with my coach.';
  $('onetInterpretation').textContent='The interest scores need to be reviewed before drawing conclusions.';
  scoreBars.append(make('p','missing','Six complete scores were not found. No scores have been estimated.'));
 }
 const dream=safe(f.dreamJob),tasks=safe(f.dreamTasks),natural=safe(f.dreamNatural);
 const dreaming=[];
 if(dream)dreaming.push('When I pictured work that felt right, I described '+dream+'.');
 if(tasks)dreaming.push('I imagined spending my day '+tasks+'.');
 if(natural)dreaming.push('What felt natural about this was '+natural+'.');
 $('dreamNarrative').textContent=dreaming.join(' ')||'My dream-work description was not available in the cloud record. I can explain it to my coach.';
 const dreamBox=$('dreamEvidence');dreamBox.replaceChildren();
 addLine(dreamBox,'Who or what I want to help',safe(f.dreamHelp));
 addLine(dreamBox,'Problems I enjoy solving',safe(f.dreamProblems));
 addLine(dreamBox,'What would make me proud',safe(f.dreamProud));
 addLine(dreamBox,'What motivates me',safe(f.dreamMotivation));
 if(!dreamBox.childNodes.length)dreamBox.append(make('p','missing','Additional dream-work answers were not recorded.'));
 const drivers=selectedDrivers(m),wrap=$('driverList');wrap.replaceChildren();
 for(const key of drivers)wrap.append(make('span','chip',DRIVER_LABELS[key]||key));
 if(!drivers.length)wrap.append(make('span','missing','No work-driver cards were marked Yes.'));
 $('preferencesNarrative').textContent=drivers.length?'In my Discover mindmap, I said these work activities or conditions mattered to me: '+narrativeList(drivers.map(k=>DRIVER_LABELS[k]||k))+'.':'I have not yet confirmed a set of work-driver themes. My coach can help me revisit the preferences I described.';
 const life=$('lifeFit');life.replaceChildren();
 addLine(life,'Income I need',safe(f.incomeNeeds));addLine(life,'Schedule that works for me',safe(f.scheduleNeeds));
 addLine(life,'Environment I prefer',safe(f.environmentNeeds));addLine(life,'Growth I want',safe(f.growthNeeds));
 addLine(life,'Training I would consider',safe(f.trainingComfort));
 if(!life.childNodes.length)life.append(make('p','missing','Work-life and training preferences were not recorded.'));
 const connections=$('connectionDetails');connections.replaceChildren();
 const topCodes=leading.map(x=>x.code);
 const thematic=drivers.map(key=>({key,related:DRIVER_THEMES[key]||[]})).filter(item=>item.related.length);
 const shared=thematic.filter(item=>item.related.some(code=>topCodes.includes(code)));
 const unmatched=thematic.filter(item=>!item.related.some(code=>topCodes.includes(code)));
 if(full&&drivers.length){
  $('profileConnection').textContent=shared.length?'Some of the preferences I selected connect naturally to my stronger O*NET interest themes. That gives my coach and me something to explore, not a final answer.':'My top O*NET themes and selected work preferences tell somewhat different stories. That is useful to discuss—not evidence that either is wrong.';
  if(shared.length)appendMeaning(connections,'The clearest discussion connections: '+shared.map(x=>(DRIVER_LABELS[x.key]||x.key)+' connects with '+x.related.filter(k=>topCodes.includes(k)).map(k=>NAMES[k]).join('/')).join('; ')+'.');
  if(unmatched.length)appendMeaning(connections,'Preferences to explore separately: '+unmatched.map(x=>DRIVER_LABELS[x.key]||x.key).join(', ')+'. Some may connect with lower-ranked interests, and some may describe conditions rather than activities.');
  const conditions=drivers.filter(key=>!(DRIVER_THEMES[key]||[]).length);
  if(conditions.length)appendMeaning(connections,'Personal priorities such as '+narrativeList(conditions.map(key=>DRIVER_LABELS[key]||key))+' are important even when an interest score cannot evaluate them.');
 }else{
  $('profileConnection').textContent='There is not enough saved information for a meaningful comparison between my work preferences and O*NET results. My coach and I can review the missing evidence together.';
 }
 const careers=savedCareers(j),box=$('careerList');box.replaceChildren();
 $('careerIntro').textContent=careers.length?'I selected '+careers.length+' occupation'+(careers.length===1?'':'s')+' to carry into Reality Check. Here is what Discover actually recorded about their connection to my interests, my work drivers, and local opportunity.':'No saved occupation choices were found. I can review options with my coach before continuing.';
 const oppQuestions=[];
 for(const c of careers){
  const item=make('article','occupation-card'),head=make('div','occupation-head'),title=make('h4','',safe(c.title||c.name||c.soc||'Career option'));
  const soc=make('span','occupation-soc',c.soc?'SOC '+c.soc:'Occupation under consideration');
  head.append(title,soc);item.append(head);
  const interest=safe(c.interestConnectionLabel),work=safe(c.workDriverConnectionLabel),opportunity=safe(c.regionalOpportunityLabel||c.regional?.tier),overall=c.overallAlignmentScore;
  const interestLabel=interest||(Number.isFinite(Number(c.interestAlignmentScore))?'Interest evidence recorded; review Module 1 for context':'Interest comparison not available');
  const workLabel=work||'Work-driver comparison not available';
  const interestLine=make('div','alignment-row'),iTag=make('span','alignment-tag '+classify(interest,c.interestAlignmentScore),interestLabel);
  interestLine.append(make('strong','','O*NET interest connection'),iTag);item.append(interestLine);
  const workLine=make('div','alignment-row'),wTag=make('span','alignment-tag '+classify(work,c.workDriverAlignmentScore),workLabel);
  workLine.append(make('strong','','Work-preference connection'),wTag);item.append(workLine);
  const matches=list(c.matchedWorkDrivers).map(v=>safe(v.label||v.name||v.key)).filter(Boolean);
  if(matches.length)item.append(make('p','occupation-story','Why some work preferences connected: '+narrativeList(matches)+'.'));
  const op=make('p','occupation-opportunity',opportunity?'Northern Arizona opportunity evidence: '+opportunity+'. This is separate from personal fit.':'Northern Arizona opportunity evidence needs review with my coach.');
  item.append(op);
  const base=c.preparationIntel?.baseline||{};
  const prep=[c.typicalEntryEducation||base.education,c.workExperienceRequired||base.workExperience,c.typicalOnTheJobTraining||base.onTheJobTraining].filter(Boolean);
  if(prep.length)item.append(make('p','occupation-prep','Typical entry preparation to verify: '+prep.join(' · ')+'.'));
  if(overall!==null&&overall!==undefined&&overall!==''&&Number.isFinite(Number(overall))){
   item.append(make('p','score-caveat','BOOST saved a combined match score of '+Number(overall).toFixed(1)+'. This is a comparison of interest/work-driver evidence, not a probability of employment.'));
  }
  const question=(interest.toLowerCase().includes('different')||work.toLowerCase().includes('different'))?'What makes this option interesting to me even where the evidence differs?':'What would I need to verify about this occupation before pursuing it?';
  item.append(make('p','career-question','Coach question: '+question));
  oppQuestions.push(question);
  box.append(item);
 }
 if(!careers.length)box.append(make('p','missing','My Module 1 career choices are not available in the cloud record. No occupations have been inferred.'));
 const summary=[];
 if(strong.length)summary.push('My O*NET pattern emphasizes '+narrativeList(strong)+'.');
 if(dream)summary.push('My starting work idea was '+dream+'.');
 if(drivers.length)summary.push('I said '+narrativeList(drivers.slice(0,4).map(k=>DRIVER_LABELS[k]||k))+' matter to me.');
 if(careers.length)summary.push('I am considering '+narrativeList(careers.map(c=>safe(c.title||c.name||c.soc)))+'.');
 $('coachSummary').textContent=summary.join(' ')+' My coach can help me compare my interests with real work tasks, wages, preparation, and current opportunities. BOOST is a starting point for the conversation, not an enrollment or hiring decision.';
 const prompts=$('coachPrompts');prompts.replaceChildren();
 const promptList=[
 'Which of my saved careers best reflects the work activities and preferences I described?',
 'Where do my O*NET interests and my dream-work preferences reinforce each other—and where do they differ?',
 'What current Northern Arizona jobs, pay, commute, and training requirements should we verify?',
 'What information or documents do I need for next steps with the workforce team?'
 ];
 for(const v of promptList)prompts.append(make('div','coach-prompt',v));
 const p=j.modules?.coachAppointmentPrep||{};
 fillChecked('#topics',p.discussionTopics);fillChecked('#documents',p.documentsReviewed);
 $('myQuestion').value=safe(p.participantQuestion||'');
 $('ack').checked=!!p.readyAt;
 if(p.readyAt)saveStatus('✓ Previously prepared on '+new Date(p.readyAt).toLocaleString()+'. You may update your topics and save again.');
}

async function load(){
 const {data:{session},error:authErr}=await supa().auth.getSession();
 if(authErr)throw authErr;
 if(!session?.user){status('Please sign in to Northern BOOST 2.0 first, then reopen Coach Appointment Prep.',true);return}
 user=session.user;
 const result=await supa().rpc('boost_load_my_journey_for_region',{p_region:REGION});
 if(result.error)throw result.error;
 if(!result.data){status('No Northern BOOST journey was found for this account. Complete Discover first.',true);return}
 journey=result.data;
 if(!m1Complete(journey)){status('Coach Appointment Prep becomes available after Module 1 — Discover is completed. Your other pathway rules are unchanged.',true);return}
 render(journey);ready=true;$('mainContent').hidden=false;status('✓ Your Northern BOOST Discover results loaded securely. Prepare for your coach appointment below.');
}
async function save(){
 if(!ready||!journey||!user){saveStatus('Sign in and load completed Discover first.',true);return}
 if(!$('ack').checked){saveStatus('Please acknowledge that you reviewed your preparation before saving.',true);return}
 const topicsSelected=topics(),question=safe($('myQuestion').value);
 if(!topicsSelected.length){saveStatus('Select at least one topic you would like to discuss.',true);return}
 const payload={source:'northern_post_discover_coach_prep_v1',pathwayStage:'post_discover_pre_enrollment',acknowledged:true,discussionTopics:topicsSelected,documentsReviewed:docs(),participantQuestion:question,notes:'Preparation acknowledgment only. Attendance, eligibility, service selection, and enrollment require staff verification.'};
 const b=$('save');b.disabled=true;saveStatus('Saving your coach preparation to Northern BOOST…');
 try{
  const result=await supa().rpc('boost_northern_save_coach_prep',{p_prep:payload});
  if(result.error)throw result.error;
  if(!result.data?.readyAt)throw Error('The cloud did not return a confirmed preparation timestamp.');
  const verify=await supa().rpc('boost_load_my_journey_for_region',{p_region:REGION});
  if(verify.error)throw verify.error;
  const confirmed=verify.data?.modules?.coachAppointmentPrep;
  if(!confirmed||confirmed.readyAt!==result.data.readyAt||verify.data?.progress?.coachAppointmentPrep!=='complete')throw Error('Northern cloud did not confirm the saved preparation record.');
  journey=verify.data;
  saveStatus('✓ Supabase CONFIRMED: your coach preparation is saved. This does not mean an appointment occurred or that enrollment was completed.');
  window.setTimeout(()=>{window.location.assign(new URL('preview-v2/index.html',document.baseURI).toString())},550);
 }catch(err){saveStatus('Cloud save NOT confirmed: '+(err.message||'Unknown error')+'. Your existing Discover progress has not been changed. Retry the save.',true)}
 finally{b.disabled=false}
}
function init(){
 $('save').onclick=save;$('print').onclick=()=>window.print();
 load().catch(e=>status('Unable to load Northern BOOST: '+(e.message||'Please refresh and sign in again.'),true));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();