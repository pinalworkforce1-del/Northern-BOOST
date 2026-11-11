import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

// Northern-only coach reporting. No Pinal Ready2Work table or TalentSync access.
const url=Deno.env.get("SUPABASE_URL")!,key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
const headers={
  "Access-Control-Allow-Origin":"*",
  "Access-Control-Allow-Headers":"content-type, authorization, apikey, x-boost-staff-token",
  "Access-Control-Allow-Methods":"POST, OPTIONS",
  "Content-Type":"application/json","Cache-Control":"no-store"
};
const reply=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers});
const digest=async(v:string)=>Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(v))),x=>x.toString(16).padStart(2,"0")).join("");
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const sceneIds=new Set([1,2,3,4,5,6,7,8,9,10,11,12,21,22,23,24,25,31,32,33,34,35].map(String));
const skills=["COM","PRO","PSA","TEAM","TIME","QUAL"];
const obj=(v:unknown):Record<string,unknown>=>v&&typeof v==="object"&&!Array.isArray(v)?v as Record<string,unknown>:{};
const str=(v:unknown,max=4000)=>typeof v==="string"?v.slice(0,max):"";
const arr=(v:unknown)=>Array.isArray(v)?v:[];
function project(progress:unknown,updatedAt:string|null,includeDetail=false){
  const p=obj(progress),selections=obj(p.sceneSelections),scores=obj(p.skillScores);
  const answers=Object.fromEntries(Object.entries(selections).filter(([id,v])=>sceneIds.has(id)&&typeof v==="string"&&/^[A-D]$/.test(v)));
  const ids=Object.keys(answers);
  const rb=obj(p.resumeBuilder),ji=obj(p.jacquelineInterview);
  const resumeComplete=rb.complete===true,interviewComplete=ji.verifiedComplete===true;
  const out:Record<string,unknown>={
    scenario_count:ids.length,
    stage_counts:{
      softskills:ids.filter(x=>Number(x)<=12).length,
      resume:ids.filter(x=>Number(x)>=21&&Number(x)<=25).length,
      interview:ids.filter(x=>Number(x)>=31).length
    },
    resume_complete:resumeComplete,
    interview_complete:interviewComplete,
    certificate_earned:false, // Northern certificate issuance is intentionally held.
    updated_at:updatedAt,
    skill_scores:Object.fromEntries(skills.map(k=>[k,Math.max(0,Number(scores[k])||0)]))
  };
  if(includeDetail){
    out.scenario_answers=answers;
    if(resumeComplete)out.resume={
      target:str(rb.target||rb.careerTarget,250),
      summary:str(rb.summary),
      skills:Array.isArray(rb.skills)?rb.skills.map(x=>str(x,250)).join(", "):str(rb.skills),
      education:str(rb.education),
      experiences:arr(rb.experiences).slice(0,12).map(x=>{
        const e=obj(x);
        return {role:str(e.role,180),employer:str(e.employer,180),startDate:str(e.startDate,80),endDate:str(e.endDate,80),bullets:arr(e.bullets).slice(0,12).map(b=>str(b,500)),evidence:str(e.evidence,1200)};
      })
    };
  }
  return out;
}
Deno.serve(async req=>{
  if(req.method==="OPTIONS")return new Response(null,{status:204,headers});
  if(req.method!=="POST")return reply({error:"Method not allowed"},405);
  try{
    const raw=String(req.headers.get("X-BOOST-Staff-Token")||"").trim();
    if(!raw)return reply({error:"Staff session required"},401);
    const {data:session,error:sessionError}=await db.from("boost_staff_sessions")
      .select("id,email_normalized,expires_at,revoked_at").eq("token_hash",await digest(raw)).maybeSingle();
    if(sessionError||!session||session.revoked_at||new Date(session.expires_at).getTime()<=Date.now())
      return reply({error:"Staff session expired"},401);
    const {data:staff,error:staffError}=await db.from("boost_staff_access")
      .select("email,active,can_northern").ilike("email",session.email_normalized).maybeSingle();
    if(staffError||!staff?.active||!staff.can_northern)
      return reply({error:"Northern Coach View access required"},403);
    const body=await req.json();
    const action=body?.action;
    if(action!=="summary"&&action!=="detail")return reply({error:"Unsupported action"},400);
    const ids=action==="summary"?body.journey_ids:[body.journey_id];
    if(!Array.isArray(ids)||ids.length<1||ids.length>75||new Set(ids).size!==ids.length||
      ids.some((x:unknown)=>typeof x!=="string"||!uuid.test(x)))
      return reply({error:"Invalid journey selection"},400);
    const {data:journeys,error:journeyError}=await db.from("boost_journeys")
      .select("id,user_id,region").in("id",ids).eq("region","Northern Arizona");
    if(journeyError)return reply({error:"Journey lookup unavailable"},503);
    if(!journeys||journeys.length!==ids.length)return reply({error:"Northern journey not found"},404);
    const users=[...new Set(journeys.map(x=>x.user_id).filter(Boolean))];
    if(!users.length)return action==="summary"?reply({summaries:journeys.map(j=>({journey_id:j.id,ready2work:null}))}):reply({ready2work:null});
    const {data:progress,error:progressError}=await db.from("boost_northern_ready2work_progress")
      .select("participant_id,progress_json,updated_at").in("participant_id",users);
    if(progressError)return reply({error:"Northern progress unavailable"},503);
    const byUser=new Map((progress||[]).map(p=>[p.participant_id,p]));
    if(action==="detail"){
      const j=journeys[0],p=byUser.get(j.user_id);
      return reply({ready2work:p?project(p.progress_json,p.updated_at,true):null});
    }
    return reply({summaries:journeys.map(j=>{
      const p=byUser.get(j.user_id);
      return {journey_id:j.id,ready2work:p?project(p.progress_json,p.updated_at):null};
    })});
  }catch(_){return reply({error:"Report request could not be processed"},400)}
});