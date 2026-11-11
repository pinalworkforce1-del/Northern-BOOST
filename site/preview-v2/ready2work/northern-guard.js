/* Northern-only Ready2Work guard. No app code loads until verified staff enrollment. */
(async()=>{
 'use strict';
 const text=document.getElementById('northernGateText');
 const gate=document.getElementById('northernGate');
 const say=msg=>{if(text)text.textContent=msg};
 const cfg=window.BOOST_CONFIG;
 const base='https://pinalworkforce1-del.github.io/BOOST_Pathway-Portal/ready-2-work-qa/';
 if(!cfg||cfg.region!=='Northern Arizona'||!window.supabase?.createClient){say('Northern sign-in is unavailable. Please return to BOOST.');return;}
 const client=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
 try{
  const {data:sessionData,error:sessionError}=await client.auth.getSession();
  if(sessionError||!sessionData?.session){say('Please sign in to Northern BOOST first, then reopen Ready 2 Work.');return;}
  const {data:identity,error:identityError}=await client.auth.getUser();
  if(identityError||!identity?.user){say('Could not verify your Northern BOOST identity. Return to BOOST and sign in again.');return;}
  const {data:enrolled,error:enrollError}=await client.rpc('boost_northern_ready2work_enrolled');
  if(enrollError){say('Northern Ready 2 Work access verification is unavailable. Please contact your career coach.');return;}
  if(enrolled!==true){say('Ready 2 Work is not enabled for your account. Ask your Northern BOOST career coach to enable access in Coach View. Your existing BOOST progress is unchanged.');return;}
  // The shared app uses a fixed local key; swap its value to a per-user
  // Northern namespace before any application code can load.
  const localKey='boost-northern-r2w-v1',ownerKey='boost-northern-r2w-current-owner',scopedKey=localKey+':'+identity.user.id;
  try{
   const previousOwner=localStorage.getItem(ownerKey);
   if(previousOwner&&previousOwner!==identity.user.id){
    const previous=localStorage.getItem(localKey);
    if(previous)localStorage.setItem(localKey+':'+previousOwner,previous);
   }
   const scoped=localStorage.getItem(scopedKey);
   if(scoped)localStorage.setItem(localKey,scoped);
   else localStorage.removeItem(localKey);
   // Never fall back to a different participant's tab-only backup.
   if(previousOwner!==identity.user.id){sessionStorage.removeItem(localKey);sessionStorage.removeItem(localKey+'-backup');}
   localStorage.setItem(ownerKey,identity.user.id);
  }catch(e){say('Browser storage is unavailable. Open Ready 2 Work in a standard browser window.');return;}
  window.NORTHERN_R2W={client,userId:identity.user.id,verified:true,region:'Northern Arizona'};
  const scripts=[
    base+'course-data.js',
    'app.js',
    'resume-polish-v1.js',
    base+'resume-step-arrival-v1.js',
    'resume-strategy-v1.js',
    'interview-landing-v1.js',
    'northern-cloud-save.js'
  ];
  for(const src of scripts){
   await new Promise((resolve,reject)=>{
    const el=document.createElement('script');el.src=src;el.onload=resolve;el.onerror=()=>reject(new Error('Could not load '+src));
    document.body.append(el);
   });
  }
  gate.hidden=true;
 }catch(err){say('Ready 2 Work could not be opened safely. Please return to Northern BOOST and try again.');}
})();