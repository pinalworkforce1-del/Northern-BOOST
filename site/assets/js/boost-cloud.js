(function(){
  "use strict";
  const JOURNEY_KEY="boost_naz_journey_v1";
  const CLOUD_ID_KEY="boost_naz_cloud_journey_id";
  const CLOUD_TOKEN_KEY="boost_naz_cloud_access_token";
  const DEVICE_BYPASS_KEY="boost_naz_device_only_mode";
  const HASH_PREFIX="boost=";
  const cfg=window.BOOST_CONFIG||{};
  let client=null, saveTimer=null, saving=false, pendingJourney=null;
  const originalSetItem=Storage.prototype.setItem;

  function configured(){
    return !!(cfg.cloudEnabled && cfg.supabaseUrl && cfg.supabaseAnonKey &&
      !String(cfg.supabaseUrl).startsWith("REPLACE_") &&
      !String(cfg.supabaseAnonKey).startsWith("REPLACE_") &&
      window.supabase && window.supabase.createClient);
  }
  function getClient(){
    if(!configured()) return null;
    if(!client) client=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    return client;
  }
  function randomToken(){
    const b=new Uint8Array(32); crypto.getRandomValues(b);
    return Array.from(b,x=>x.toString(16).padStart(2,"0")).join("");
  }
  function ensureCredentials(){
    let id=localStorage.getItem(CLOUD_ID_KEY), token=localStorage.getItem(CLOUD_TOKEN_KEY);
    if(!id){id=crypto.randomUUID(); originalSetItem.call(localStorage,CLOUD_ID_KEY,id);}
    if(!token){token=randomToken(); originalSetItem.call(localStorage,CLOUD_TOKEN_KEY,token);}
    return {id,token};
  }
  function credentials(){
    return {id:localStorage.getItem(CLOUD_ID_KEY),token:localStorage.getItem(CLOUD_TOKEN_KEY)};
  }
  function parseResumeHash(){
    const h=(location.hash||"").replace(/^#/,"");
    if(!h.startsWith(HASH_PREFIX)) return null;
    const raw=h.slice(HASH_PREFIX.length), dot=raw.indexOf(".");
    if(dot<1) return null;
    const id=raw.slice(0,dot), token=raw.slice(dot+1);
    if(!/^[0-9a-f-]{36}$/i.test(id) || !/^[0-9a-f]{64}$/i.test(token)) return null;
    return {id,token};
  }
  function saveLocalCredentials(c){
    originalSetItem.call(localStorage,CLOUD_ID_KEY,c.id);
    originalSetItem.call(localStorage,CLOUD_TOKEN_KEY,c.token);
  }
  async function remoteSave(journey){
    const c=getClient(); if(!c||!journey) return {ok:false,reason:"not-configured"};
    const cred=ensureCredentials();
    const {data,error}=await c.rpc("boost_save_journey",{p_journey_id:cred.id,p_access_token:cred.token,p_journey:journey});
    if(error){console.warn("BOOST cloud save failed",error.message);return {ok:false,error};}
    if(data && data!==cred.id) originalSetItem.call(localStorage,CLOUD_ID_KEY,String(data));
    window.dispatchEvent(new CustomEvent("boost-cloud-status",{detail:{state:"saved",at:new Date().toISOString()}}));
    return {ok:true,data};
  }
  function queueSave(journey){
    if(!configured()||!journey) return;
    pendingJourney=journey;
    clearTimeout(saveTimer);
    saveTimer=setTimeout(async()=>{
      if(saving) return;
      saving=true;
      try{
        while(pendingJourney){const j=pendingJourney;pendingJourney=null;await remoteSave(j);}
      }finally{saving=false;}
    },350);
  }
  async function remoteLoad(cred){
    const c=getClient(); if(!c||!cred?.id||!cred?.token) return null;
    const {data,error}=await c.rpc("boost_load_journey",{p_journey_id:cred.id,p_access_token:cred.token});
    if(error){console.warn("BOOST cloud load failed",error.message);return null;}
    return data||null;
  }
  async function loadAuthenticatedJourney(){
    const c=getClient(); if(!c) return null;
    const {data,error}=await c.rpc("boost_load_my_journey");
    if(error){console.warn("BOOST authenticated journey load failed",error.message);return null;}
    return data||null;
  }
  async function bootstrapRemoteIfNeeded(){
    if(!configured()) return;
    const c=getClient();
    const fromHash=parseResumeHash();
    const localRaw=localStorage.getItem(JOURNEY_KEY);
    const cred=fromHash||credentials();
    if(fromHash){
      document.documentElement.style.visibility="hidden";
      saveLocalCredentials(fromHash);
      const j=await remoteLoad(fromHash);
      if(j){originalSetItem.call(localStorage,JOURNEY_KEY,JSON.stringify(j));location.reload();return;}
      document.documentElement.style.visibility="";
      return;
    }
    const {data:{session}}=await c.auth.getSession();
    if(session?.user){
      if(!localRaw){
        const j=await loadAuthenticatedJourney();
        if(j){originalSetItem.call(localStorage,JOURNEY_KEY,JSON.stringify(j));}
      }else{
        try{await remoteSave(JSON.parse(localRaw));}catch(e){}
      }
      return;
    }
    if(!localRaw && cred.id && cred.token){
      document.documentElement.style.visibility="hidden";
      const j=await remoteLoad(cred);
      if(j){originalSetItem.call(localStorage,JOURNEY_KEY,JSON.stringify(j));location.reload();return;}
      document.documentElement.style.visibility="";
    }
  }
  function resumeLink(){
    const cred=ensureCredentials();
    const base=new URL("index.html",location.href);
    base.hash=HASH_PREFIX+cred.id+"."+cred.token;
    return base.toString();
  }
  async function flush(){
    clearTimeout(saveTimer);
    const raw=localStorage.getItem(JOURNEY_KEY); if(!raw) return;
    try{await remoteSave(JSON.parse(raw));}catch(e){}
  }

  Storage.prototype.setItem=function(key,value){
    originalSetItem.call(this,key,value);
    if(this===localStorage && key===JOURNEY_KEY){
      try{queueSave(JSON.parse(value));}catch(e){}
    }
  };

  function mapContext(){
    const f=decodeURIComponent((location.pathname.split('/').pop()||'').toLowerCase());
    if(!f || f==='index.html') return null;
    if(f.includes('module1_')) return ['module1','Step 1 of 6 • Discover'];
    if(f.includes('module2_')) return ['module2','Step 2 of 6 • Reality Check'];
    if(f.includes('module3_')) return ['module3','Step 3 of 6 • Career Mobility'];
    if(f.includes('module4_')) return ['module4','Step 4 of 6 • Decide'];
    if(f.includes('skilled_trades')) return ['skilled_trades','Step 5 of 6 • Skilled Trades'];
    if(f.includes('advanced_manufacturing')) return ['advanced_manufacturing','Step 5 of 6 • Advanced Manufacturing'];
    if(f.includes('cdl_')) return ['cdl','Step 5 of 6 • CDL / Transportation'];
    if(f.includes('healthcare')) return ['healthcare','Step 5 of 6 • Health Care'];
    if(f.includes('customer_service')) return ['customer_service','Step 5 of 6 • Customer Service / Transferable Skills'];
    if(f.includes('it_connected')) return ['it','Step 5 of 6 • Information Technology'];
    return null;
  }
  function injectJourneyMapButton(){
    if(document.querySelector('.boostJourneyMapFab')) return;
    const ctx=mapContext(); if(!ctx) return;
    const style=document.createElement('style');
    style.textContent='.boostJourneyMapFab{position:fixed;right:16px;bottom:16px;z-index:2147483000;display:flex;flex-direction:column;gap:2px;min-width:205px;padding:11px 14px;border-radius:16px;background:#0d2741;color:#fff!important;text-decoration:none!important;box-shadow:0 14px 30px rgba(0,0,0,.24);border:2px solid rgba(255,255,255,.22);font-family:Arial,sans-serif}.boostJourneyMapFab strong{font-size:13px;letter-spacing:.05em;text-transform:uppercase}.boostJourneyMapFab span{font-size:12px;line-height:1.25;color:#d7e6ef}.boostJourneyMapFab:hover,.boostJourneyMapFab:focus-visible{outline:3px solid #f0c35e;outline-offset:2px;background:#154067}@media(max-width:700px){.boostJourneyMapFab{right:10px;left:10px;bottom:10px;min-width:auto}}';
    document.head.appendChild(style);
    const a=document.createElement('a');
    a.className='boostJourneyMapFab';
    a.href='index.html#step='+ctx[0];
    a.setAttribute('aria-label','Open My Northern BOOST Journey map');
    a.innerHTML='<strong>My Journey Map</strong><span>'+ctx[1]+'</span>';
    document.body.appendChild(a);
  }

  function isModule1(){
    return (location.pathname.split('/').pop()||'').toLowerCase().includes('module1_');
  }
  function authStyles(){
    if(document.getElementById('boost-auth-style')) return;
    const s=document.createElement('style');s.id='boost-auth-style';
    s.textContent='.boostAuthGate{position:fixed;inset:0;z-index:2147483640;background:rgba(4,17,28,.86);backdrop-filter:blur(7px);display:flex;align-items:center;justify-content:center;padding:18px;font-family:Arial,sans-serif}.boostAuthCard{width:min(540px,96vw);background:#fff;border-radius:22px;box-shadow:0 30px 90px rgba(0,0,0,.45);overflow:hidden}.boostAuthHead{padding:20px 22px;background:linear-gradient(90deg,#102d49,#1f587f);color:#fff;border-bottom:3px solid #e4a72b}.boostAuthHead h2{margin:0;font-size:25px}.boostAuthHead p{margin:7px 0 0;color:#d9e8f2;line-height:1.4}.boostAuthBody{padding:20px 22px}.boostAuthBody label{display:block;font-weight:800;color:#17324d;margin:11px 0 5px}.boostAuthBody input{width:100%;padding:12px 13px;border:1px solid #bdccd5;border-radius:11px;font:inherit}.boostAuthRow{display:grid;grid-template-columns:1fr 1fr;gap:10px}.boostAuthBtn{width:100%;border:0;border-radius:12px;padding:12px 14px;margin-top:14px;background:#0d2741;color:#fff;font-weight:900;font-size:15px;cursor:pointer}.boostAuthBtn.secondary{background:#eef4f7;color:#17324d;border:1px solid #c4d3db}.boostAuthBtn:disabled{opacity:.55;cursor:wait}.boostAuthNote{margin-top:12px;padding:10px 12px;border-radius:10px;background:#f2f7fa;color:#526975;font-size:13px;line-height:1.45}.boostAuthStatus{margin-top:10px;font-size:13px;font-weight:800;color:#2f6b50}.boostAuthCode{display:none}.boostAuthCode.show{display:block}@media(max-width:600px){.boostAuthRow{grid-template-columns:1fr}}';
    document.head.appendChild(s);
  }
  function mergeParticipant(name,email){
    let j={};try{j=JSON.parse(localStorage.getItem(JOURNEY_KEY)||'{}')}catch(e){}
    j.region=j.region||'Northern Arizona';j.participant=j.participant||{};
    if(name)j.participant.name=name;if(email)j.participant.email=email.toLowerCase();
    originalSetItem.call(localStorage,JOURNEY_KEY,JSON.stringify(j));queueSave(j);
  }
  async function showAuthGate(){
    if(!isModule1()||!configured()||sessionStorage.getItem(DEVICE_BYPASS_KEY)==='1') return;
    const c=getClient();
    const {data:{session}}=await c.auth.getSession();
    if(session?.user){
      const meta=session.user.user_metadata||{};
      const name=[meta.first_name,meta.last_name].filter(Boolean).join(' ')||meta.full_name||'';
      mergeParticipant(name,session.user.email||'');
      return;
    }
    authStyles();
    const gate=document.createElement('div');gate.className='boostAuthGate';
    gate.innerHTML='<div class="boostAuthCard"><div class="boostAuthHead"><h2>Welcome to Northern BOOST</h2><p>Sign in once so your career journey can follow you across devices.</p></div><div class="boostAuthBody"><div class="boostAuthRow"><div><label for="boostFirst">First name</label><input id="boostFirst" autocomplete="given-name"></div><div><label for="boostLast">Last name</label><input id="boostLast" autocomplete="family-name"></div></div><label for="boostEmail">Email</label><input id="boostEmail" type="email" autocomplete="email" placeholder="you@example.com"><button class="boostAuthBtn" id="boostSend">Send My Sign-In Email</button><div class="boostAuthCode" id="boostCodeWrap"><label for="boostCode">6-digit code</label><input id="boostCode" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="123456"><button class="boostAuthBtn" id="boostVerify">Verify Code & Start</button></div><div class="boostAuthStatus" id="boostAuthStatus"></div><div class="boostAuthNote">Open the sign-in email we send you. If it contains a button or link, use it to return here. If it contains a six-digit code, enter the code above.</div><button class="boostAuthBtn secondary" id="boostDevice">Continue on this device for now</button></div></div>';
    document.body.appendChild(gate);
    const first=gate.querySelector('#boostFirst'),last=gate.querySelector('#boostLast'),email=gate.querySelector('#boostEmail'),send=gate.querySelector('#boostSend'),codeWrap=gate.querySelector('#boostCodeWrap'),code=gate.querySelector('#boostCode'),verify=gate.querySelector('#boostVerify'),status=gate.querySelector('#boostAuthStatus');
    send.addEventListener('click',async()=>{
      const em=email.value.trim(),fn=first.value.trim(),ln=last.value.trim();
      if(!fn||!ln||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){status.textContent='Enter your first name, last name, and a valid email address.';return;}
      send.disabled=true;status.textContent='Sending your secure sign-in email…';
      const redirect=new URL(location.href);redirect.hash='';
      const {error}=await c.auth.signInWithOtp({email:em,options:{emailRedirectTo:redirect.toString(),data:{first_name:fn,last_name:ln,full_name:(fn+' '+ln).trim()}}});
      send.disabled=false;
      if(error){status.textContent='We could not send the sign-in email. '+error.message;return;}
      localStorage.setItem('boost_naz_pending_name',(fn+' '+ln).trim());localStorage.setItem('boost_naz_pending_email',em.toLowerCase());
      codeWrap.classList.add('show');status.textContent='Email sent. Check your inbox to continue.';
    });
    verify.addEventListener('click',async()=>{
      const em=email.value.trim(),token=code.value.trim();if(!/^\d{6}$/.test(token)){status.textContent='Enter the six-digit code from your email.';return;}
      verify.disabled=true;status.textContent='Verifying…';
      const {data,error}=await c.auth.verifyOtp({email:em,token,type:'email'});verify.disabled=false;
      if(error){status.textContent='That code could not be verified. '+error.message;return;}
      const nm=(first.value.trim()+' '+last.value.trim()).trim();mergeParticipant(nm,em);await flush();gate.remove();location.reload();
    });
    gate.querySelector('#boostDevice').addEventListener('click',()=>{sessionStorage.setItem(DEVICE_BYPASS_KEY,'1');gate.remove();});
  }
  async function finishAuthReturn(){
    if(!configured()) return;
    const c=getClient();const {data:{session}}=await c.auth.getSession();if(!session?.user)return;
    const pendingName=localStorage.getItem('boost_naz_pending_name')||'';const pendingEmail=localStorage.getItem('boost_naz_pending_email')||session.user.email||'';
    const remote=await loadAuthenticatedJourney();
    if(remote){originalSetItem.call(localStorage,JOURNEY_KEY,JSON.stringify(remote));}
    mergeParticipant(pendingName,pendingEmail);localStorage.removeItem('boost_naz_pending_name');localStorage.removeItem('boost_naz_pending_email');await flush();
  }

  window.BOOSTCloud={configured,queueSave,flush,resumeLink,remoteLoad,ensureCredentials,loadAuthenticatedJourney};
  (async()=>{await bootstrapRemoteIfNeeded();await finishAuthReturn();if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',()=>{injectJourneyMapButton();showAuthGate();});}else{injectJourneyMapButton();showAuthGate();}})();
  window.addEventListener("pagehide",()=>{try{flush()}catch(e){}});
})();
