(function(){
  "use strict";
  const JOURNEY_KEY="boost_naz_journey_v1";
  const CLOUD_ID_KEY="boost_naz_cloud_journey_id";
  const CLOUD_TOKEN_KEY="boost_naz_cloud_access_token";
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
    if(!client) client=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
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
  async function bootstrapRemoteIfNeeded(){
    if(!configured()) return;
    const fromHash=parseResumeHash();
    const localRaw=localStorage.getItem(JOURNEY_KEY);
    const cred=fromHash||credentials();
    // A resume hash deliberately wins over unrelated local state.
    if(fromHash){
      document.documentElement.style.visibility="hidden";
      saveLocalCredentials(fromHash);
      const j=await remoteLoad(fromHash);
      if(j){originalSetItem.call(localStorage,JOURNEY_KEY,JSON.stringify(j));location.reload();return;}
      document.documentElement.style.visibility="";
      return;
    }
    // If browser storage was cleared but cloud credentials remain, restore automatically.
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

  // Mirror every existing module save to Supabase without changing module business logic.
  Storage.prototype.setItem=function(key,value){
    originalSetItem.call(this,key,value);
    if(this===localStorage && key===JOURNEY_KEY){
      try{queueSave(JSON.parse(value));}catch(e){}
    }
  };

  window.BOOSTCloud={configured,queueSave,flush,resumeLink,remoteLoad,ensureCredentials};
  bootstrapRemoteIfNeeded();
  window.addEventListener("pagehide",()=>{try{flush()}catch(e){}});
})();
