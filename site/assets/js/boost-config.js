// Northern Arizona BOOST cloud configuration.
// The Supabase URL and publishable/anon key are safe to expose in a browser app
// when database access is protected by RLS / RPCs as provided in this package.
window.BOOST_CONFIG = {
  cloudEnabled: true,
  supabaseUrl: "https://dxcajwarqojvmbteroco.supabase.co",
  supabaseAnonKey: "sb_publishable_ehUKOOksq5SlkTNb-wQ8ZA_Zh8XlWDF",
  region: "Northern Arizona"
};

// Home-map enhancement: sequential progression + Rosie “Tell me about this step” guide.
(() => {
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  if(file && file!=='index.html') return;
  if(document.querySelector('script[data-boost-sequence-guide]')) return;
  const s=document.createElement('script');
  s.src='assets/js/sequence-guide.js';
  s.defer=true;
  s.dataset.boostSequenceGuide='1';
  document.head.appendChild(s);
})();

// Module 3 conversion: the participant-facing source of truth is the current
// assembled Pinal activity experience. Northern uses that same HUD/flow while
// reading Northern Modules 1–2, Northern regional LMI, and Northern cloud state.
(() => {
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  if(file && file!=='index.html') return;
  const wire=()=>{
    const hot=document.querySelector('[data-core="module3"]');
    if(!hot) return false;
    hot.href='activity.html?m=module3&boost_return=index.html&boost_module=module3';
    hot.removeAttribute('target');
    const tip=hot.querySelector('.tip');
    if(tip) tip.textContent='Module 3 • Where Can My Experience Take Me?';
    return true;
  };
  if(!wire()) document.addEventListener('DOMContentLoaded',wire,{once:true});
})();

// The legacy connected Module 2 page originally sent participants directly to
// the old Northern Module 3 v0.8 file. Preserve its save behavior, then route
// forward to the new gold-master Module 3 activity shell instead.
(() => {
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  if(file!=='northern_boost_module2_connected_test_v1.3.html') return;
  window.addEventListener('load',()=>{
    if(typeof window.completeModule2AndContinue!=='function') return;
    window.completeModule2AndContinue=function(){
      try{ if(typeof window.persistModule2Structured==='function') window.persistModule2Structured(); }catch(e){ console.warn('Northern Module 2 structured save unavailable',e); }
      try{
        const key='boost_naz_journey_v1';
        const j=JSON.parse(localStorage.getItem(key)||'{}')||{};
        j.region='Northern Arizona';
        j.progress=j.progress||{};
        j.progress.module2='complete';
        j.updatedAt=new Date().toISOString();
        localStorage.setItem(key,JSON.stringify(j));
      }catch(e){ console.warn('Northern Module 2 completion marker unavailable',e); }
      window.location.href='activity.html?m=module3&boost_return=index.html&boost_module=module3';
    };
  },{once:true});
})();

// Module 4 carry-forward: expose the integrated Module 3 evidence package
// (O*NET interests, transferable skills, Pizza Lab preferences, and career
// decisions) inside the existing Northern Decide build without changing Pinal.
(() => {
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  if(!file.includes('module4_')) return;
  if(document.querySelector('script[data-boost-m4-carry]')) return;
  const s=document.createElement('script');
  s.src='assets/js/northern-module4-carry-v1.js?v=20260910m3carry1';
  s.dataset.boostM4Carry='1';
  document.head.appendChild(s);
})();
