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

// Completed core modules are always reviewable/reopenable from the map.
(() => {
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  if(file && file!=='index.html') return;
  if(document.querySelector('script[data-boost-reentry-fix]')) return;
  const s=document.createElement('script');
  s.src='assets/js/northern-map-reentry-fix-v1.js?v=20260910reentry1';
  s.defer=true;
  s.dataset.boostReentryFix='1';
  document.head.appendChild(s);
})();

// Module 1 + Module 2 conversion: keep the pathway map pointed at the clean
// Northern builds that were assembled from the current Pinal gold-master flow.
// The legacy Connected_Test files remain in the repo for reference only.
(() => {
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  if(file && file!=='index.html') return;
  const wire=()=>{
    const m1=document.querySelector('[data-core="module1"]');
    const m2=document.querySelector('[data-core="module2"]');
    if(!m1&&!m2) return false;
    if(m1){
      m1.href='Northern_BOOST_Module1_PinalFlow_v1.html';
      m1.removeAttribute('target');
      const tip=m1.querySelector('.tip');
      if(tip) tip.textContent='Module 1 • Discover';
    }
    if(m2){
      m2.href='Northern_BOOST_Module2_PinalFlow_v1.html';
      m2.removeAttribute('target');
      const tip=m2.querySelector('.tip');
      if(tip) tip.textContent='Module 2 • Reality Check';
    }
    return true;
  };
  if(!wire()) document.addEventListener('DOMContentLoaded',wire,{once:true});
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

// Module 4 carry-forward: expose the integrated Module 1–3 evidence package
// inside Northern Decide without changing Pinal.
(() => {
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  if(!file.includes('module4_')) return;
  if(document.querySelector('script[data-boost-m4-carry]')) return;
  const s=document.createElement('script');
  s.src='assets/js/northern-module4-carry-v1.js?v=20260910evidence4';
  s.dataset.boostM4Carry='1';
  document.head.appendChild(s);
})();

// Targeted Module 4 repair: recover numeric interest alignment from the saved
// Module 1 career (or recompute it from the same RIASEC formula) and pull the
// SOC-keyed preparation evidence from Module 2.
(() => {
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  if(!file.includes('module4_')) return;
  if(document.querySelector('script[data-boost-m4-interest-prep]')) return;
  const s=document.createElement('script');
  s.src='assets/js/northern-module4-interest-prep-fix-v1.js?v=20260910ip1';
  s.dataset.boostM4InterestPrep='1';
  document.head.appendChild(s);
})();
