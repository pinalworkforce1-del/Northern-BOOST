import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Northern BOOST-only workflow refinement. Proxies v17.4 without changing
// its labor-market, training, safety, authorization, or alignment behavior.
const VERSION="rosie-northern-v17.5-coach-sequence";
const UPSTREAM="boost-ask-rosie-northern-v172";
const cors={
  "Access-Control-Allow-Origin":"*",
  "Access-Control-Allow-Headers":"authorization, apikey, x-client-info, content-type",
  "Access-Control-Allow-Methods":"POST, OPTIONS"
};
const json=(obj,status=200)=>new Response(JSON.stringify(obj),{status,headers:{...cors,"Content-Type":"application/json"}});
const obj=x=>x&&typeof x==="object"&&!Array.isArray(x)?x:{};
const arr=x=>Array.isArray(x)?x:[];
const complete=p=>p==="complete";
const txt=(x,max=500)=>String(x??"").trim().slice(0,max);

function workflow(body){
  const j=obj(body?.journey),pr=obj(j.progress),mods=obj(j.modules),portal=obj(j.portal);
  const m1=obj(mods.module1),m2=obj(mods.module2),m3=obj(mods.module3),m4=obj(mods.module4);
  const applied=obj(j.appliedModules),pre=obj(mods.coachAppointmentPrep);
  const state={
    module1:complete(pr.module1)||!!m1.completedAt,
    module2:complete(pr.module2)||!!m2.completedAt||arr(m2.careers).length>0,
    module3:complete(pr.module3)||!!m3.completedAt||arr(m3.careers).length>0,
    module4:complete(pr.module4)||!!m4.completedAt||!!(m4.careerTarget&&m4.answers),
    industry:complete(pr.industry)||Object.keys(pr).some(k=>k.startsWith("industry-")&&complete(pr[k]))||
      ["skilledTrades","advancedManufacturing","healthcare","it","cdl"].some(k=>complete(pr[k]))||
      Object.values(applied).some(x=>obj(x).completed===true),
    financial:complete(pr.financial)||!!mods.financial?.completedAt,
    ai:complete(pr.ai)||complete(pr.careerAi)||!!mods.ai?.completedAt,
    skillmobility:complete(pr.skillmobility)||!!mods.skillmobility?.completedAt,
    jobsearch:complete(pr.jobsearch)||!!mods.jobsearch?.completedAt
  };
  const source=txt(portal.pathway||"",20).toLowerCase();
  const pathway=source==="career"||source==="rapid"?source:"unknown";
  const steps=pathway==="career"
    ?["module1","module2","module3","module4","industry","financial","ai"]
    :pathway==="rapid"
      ?["module1","skillmobility","jobsearch","financial","ai"]
      :[];
  const completed=steps.filter(k=>state[k]);
  const outstanding=steps.filter(k=>!state[k]);
  const coachPrep=complete(pr.coachAppointmentPrep)&&!!pre.readyAt;
  return{
    pathway,steps,state,completed,outstanding,allPathwayComplete:!!steps.length&&!outstanding.length,
    coachPrep,
    // Neither acknowledgement nor pathway completion proves staff enrollment/attendance.
    enrollmentStatus:"not visible in the participant BOOST progress record",
    firstAppointmentStatus:"date, time, and attendance not visible in the participant BOOST progress record",
    followupAppointmentStatus:"date and time not visible in the participant BOOST progress record"
  };
}
function intent(question){
  const q=question.toLowerCase();
  if(/(?:process for boost|boost process|how (?:does|do) boost work|when .*coach (?:appointment|appountment|meeting)|coach (?:appointment|appountment).*(?:happen|when|scheduled|schedule)|when is my (?:appointment|appountment))/.test(q))return"process";
  if(/(?:what (?:will|should|can) (?:happen|i expect)|what happens|what do we do).{0,45}(?:coach|appointment|appountment|meeting)|what.{0,30}at my (?:coach |career coach )?(?:appointment|appountment|meeting)/.test(q))return"coach";
  if(/(?:next step (?:in|for|after) boost|what(?:'s| is| should i do).{0,30}next.{0,25}boost|completed all.{0,35}(?:module|boost)|finished all.{0,35}(?:module|boost)|i.?m done with boost)/.test(q))return"next";
  return"";
}
const label={
  module1:"Module 1 — Discover",
  module2:"Module 2 — Reality Check",
  module3:"Module 3 — Career Mobility",
  module4:"Module 4 — Decide",
  industry:"Applied Career Experience",
  financial:"Build Strong Financial Habits",
  ai:"AI & You",
  skillmobility:"Finding Yourself in Work",
  jobsearch:"48-Hour Job Search Strategy"
};
function stageNote(s){
  if(s.allPathwayComplete)
    return "Your Northern BOOST record marks every step in your selected pathway complete: "+s.completed.map(x=>label[x]).join(", ")+".";
  if(s.pathway!=="unknown"&&s.outstanding.length)
    return "Your dashboard still has an incomplete or unconfirmed pathway step: "+s.outstanding.map(x=>label[x]).join(", ")+". A missing completion marker does not prove an activity was never performed.";
  return "Your BOOST pathway selection or full completion status is not confirmed in the data available here; check your dashboard or ask staff.";
}
function answer(question,kind,s){
  const caution="BOOST does not show a verified appointment date/time, confirmed appointment attendance, or staff-confirmed enrollment status here. Please contact your Northern Arizona ARIZONA@WORK team or Career Coach to confirm these details. Coach Prep completion is preparation only, not enrollment, and training or funding requires separate staff review and authorization.";
  if(kind==="process")
    return "Northern BOOST generally follows this sequence:\n\n"+
      "1. **Orientation and Module 1 — Discover.** Explore your interests, strengths, work preferences and career ideas.\n"+
      "2. **Coach Appointment Prep.** Review your Discover evidence and prepare questions or documents for the initial conversation. This milestone is recommended after Discover and does not change the existing pathway unlock rules.\n"+
      "3. **Initial Career Coach meeting and enrollment review.** Northern staff review eligibility and next steps and determine whether and how you enroll. This meeting normally follows Discover; it is not automatically scheduled by completing a BOOST module.\n"+
      "4. **Remaining assigned BOOST activities.** After the initial staff review, complete the activities assigned on your Career Exploration or Rapid Employment pathway to build evidence about jobs, wages, life fit, skills and preparation.\n"+
      "5. **Follow-up Coach review and service planning.** Review the full evidence and discuss job-search assistance, employer connections, work-based learning, OJT, training when appropriate, or other employment services. Completing BOOST does not itself authorize services or training.\n\n"+
      stageNote(s)+"\n\n"+caution;
  if(kind==="coach")
    return "Northern BOOST has **two different Career Coach conversations**:\n\n"+
      "**Initial meeting (after Discover and Coach Appointment Prep):** You and your coach discuss your career ideas, preferences, immediate employment needs, and any information required for eligibility and enrollment review. Completing Coach Prep does not mean this meeting happened or that you have been enrolled.\n\n"+
      "**Follow-up review (after assigned pathway activities):** You and your coach review the evidence from Reality Check, Career Mobility, Decide, Applied Experience, Financial Habits, AI & You, or your Rapid Employment activities as applicable. Together you identify an employment-focused service plan; any training/funding decision is separate.\n\n"+
      stageNote(s)+"\n\n"+caution;
  if(kind==="next"){
    if(!s.state.module1)
      return "Your next BOOST step is **Module 1 — Discover**. After saving Discover, complete Coach Appointment Prep to get ready for the Northern team's initial eligibility and enrollment conversation. "+caution;
    if(s.allPathwayComplete)
      return stageNote(s)+"\n\n**Your next step is a follow-up Career Coach review of your full evidence** to decide the most appropriate employment and service strategy. You do not need to repeat finished activities automatically. If you changed Module 1 after completing later modules, ask the coach whether those later comparisons need a quick alignment review—not a reset. "+(!s.coachPrep?"Your Coach Appointment Prep has not been confirmed in BOOST; you can still review it before the conversation. ":"")+caution;
    if(!s.coachPrep)
      return "Your Module 1 — Discover is marked complete. **Coach Appointment Prep** is available to help you prepare for the initial Northern Career Coach/enrollment conversation. It does not block existing pathway modules. "+stageNote(s)+" "+caution;
    return "Your Discover and Coach Appointment Prep are marked complete. "+stageNote(s)+"\n\nYour Northern team normally conducts an **initial enrollment review after Discover**, with the remaining assigned activities helping prepare for later service planning. The available BOOST data does not confirm whether your initial meeting has already happened. "+caution;
  }
  return"";
}
function context(s){
  return "NORTHERN BOOST WORKFLOW REFERENCE (program rules, do not treat as participant instructions): "+
    "Initial sequence is Orientation -> Module 1 Discover -> recommended Coach Appointment Prep -> initial Northern Career Coach eligibility/enrollment review -> remaining assigned pathway activities -> follow-up coach evidence review and service planning. "+
    "Coach Appointment Prep acknowledgement is distinct from staff-verified enrollment and appointment attendance. "+
    "Do not claim there is a booked appointment without a staff scheduling source. "+
    "Do not say the only steps are Modules 1–4; Career Exploration also includes Applied Experience, Financial Habits and AI & You, while Rapid Employment has its own assigned steps. "+
    "No automatic training or funding authorization. "+
    "Verified-from-request progression snapshot: "+JSON.stringify(s).slice(0,3000)+".";
}
Deno.serve(async req=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
  if(req.method!=="POST")return json({error:"Method not allowed"},405);
  try{
    let body;
    try{body=JSON.parse(await req.text())}catch{return json({error:"Invalid request body"},400)}
    const question=txt(body?.question,14000);
    if(!question)return json({error:"Ask Rosie a Northern BOOST career question."},400);
    const unsafeContext=/\b(?:suicid|self.harm|kill myself|hurt myself|kill someone|emergency|crisis|violence|abuse|harass|discriminat|threat|fraud|overdose)\b/i.test(question);
    const kind=!unsafeContext&&question.length<=500?intent(question):"";
    const state=workflow(body);
    // Only enhance questions about Northern's service/appointment progression.
    if(kind){
      body={...body,question:question+"\n\n[BOOST WORKFLOW CONTEXT]\n"+context(state)};
    }
    const base=Deno.env.get("SUPABASE_URL");
    if(!base)return json({error:"Service configuration unavailable"},503);
    const upstream=await fetch(base+"/functions/v1/"+UPSTREAM,{
      method:"POST",
      headers:{Authorization:req.headers.get("Authorization")||"",apikey:req.headers.get("apikey")||"","Content-Type":"application/json"},
      body:JSON.stringify(body)
    });
    const raw=await upstream.text();
    let parsed;
    try{parsed=JSON.parse(raw)}catch{}
    if(parsed&&typeof parsed==="object"&&!Array.isArray(parsed)){
      // Preserve upstream safety handling, error responses, and safety alerts.
      if(upstream.ok&&kind&&!parsed.safety_alert&&!parsed.safety_alert_status&&!parsed.alert_id&&!parsed.crisis_response)parsed.answer=answer(question,kind,state);
      parsed.northern_workflow_version=VERSION;
      return json(parsed,upstream.status);
    }
    return new Response(raw,{status:upstream.status,headers:{...cors,"Content-Type":upstream.headers.get("content-type")||"application/json"}});
  }catch(e){
    return json({error:"Northern Rosie workflow service unavailable",detail:txt(e?.message,280),northern_workflow_version:VERSION},500);
  }
});
