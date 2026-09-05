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
    if(fromHash){
      document.documentElement.style.visibility="hidden";
      saveLocalCredentials(fromHash);
      const j=await remoteLoad(fromHash);
      if(j){originalSetItem.call(localStorage,JOURNEY_KEY,JSON.stringify(j));location.reload();return;}
      document.documentElement.style.visibility="";
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

  window.BOOSTCloud={configured,queueSave,flush,resumeLink,remoteLoad,ensureCredentials};
  bootstrapRemoteIfNeeded();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',injectJourneyMapButton);
  else injectJourneyMapButton();
  window.addEventListener("pagehide",()=>{try{flush()}catch(e){}});
})();
