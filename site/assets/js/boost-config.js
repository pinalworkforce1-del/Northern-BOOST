// Northern Arizona BOOST cloud configuration.
// The Supabase URL and publishable/anon key are safe to expose in a browser app
// when database access is protected by RLS / RPCs as provided in this package.
window.BOOST_CONFIG = {
  cloudEnabled: true,
  supabaseUrl: "https://dxcajwarqojvmbteroco.supabase.co",
  supabaseAnonKey: "sb_publishable_ehUKOOksq5SlkTNb-wQ8ZA_Zh8XlWDF",
  region: "Northern Arizona"
};

// Applied career experiences now use the qualitative interest connection label
// carried from Discover / Career Mobility instead of expecting the old numeric percentage.
(() => {
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  const applied=['advanced_manufacturing','healthcare','skilled_trades','it_','cdl_'];
  if(!file.includes('northern_boost_')||!file.includes('connected_test')||!applied.some(x=>file.includes(x))) return;
  if(document.querySelector('script[data-boost-applied-interest-label]')) return;
  const s=document.createElement('script');
  s.src='assets/js/northern-applied-interest-label-v1.js?v=20260911a';
  s.defer=true;
  s.dataset.boostAppliedInterestLabel='1';
  document.head.appendChild(s);
})();

// Standardize the participant-facing journey bar across core Northern modules.
// Module 3 remains the visual gold master; Modules 1, 2 and 4 are normalized to it.
(() => {
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  if(!['northern_boost_module1_pinalflow_v1.html','northern_boost_module2_pinalflow_v1.html','module4-v4.html'].includes(file)) return;
  if(document.querySelector('script[data-boost-standard-journey]')) return;
  const s=document.createElement('script');
  s.src='assets/js/boost-standard-journey-v1.js?v=20260911a';
  s.defer=true;
  s.dataset.boostStandardJourney='1';
  document.head.appendChild(s);
})();

// Northern AI & You v2 adapter. The shared learning experience stays in the
// AI_Literacy repo, while Northern owns journey context, Rosie, cloud persistence,
// and the validated completion receipt. A return receipt is ignored unless the
// new Module 5 evidence exists in the Northern journey.
(() => {
  const file=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  if(file!=='index.html') return;
  try{
    const q=new URLSearchParams(location.search);
    if(q.get('boost_complete')==='ai'){
      const j=JSON.parse(localStorage.getItem('boost_naz_journey_v1')||'{}')||{};
      const m5=j.module5||j.modules?.module5||{};
      if(!m5.completedAt&&!m5.completed_at){
        const u=new URL(location.href);u.searchParams.delete('boost_complete');u.searchParams.delete('boost_nonce');
        history.replaceState({},'',u.toString());
        console.warn('Northern BOOST AI & You completion receipt was ignored because Module 5 evidence was not found.');
      }
    }
  }catch(e){console.warn('Northern AI & You completion guard unavailable',e)}
  const wire=()=>{
    const ai=document.querySelector('[data-shared="ai"]');
    if(!ai) return false;
    ai.href='ai-you.html';
    ai.removeAttribute('target');
    ai.removeAttribute('rel');
    const tip=ai.querySelector('.tip');if(tip)tip.textContent='AI & You • Practical AI Literacy';
    return true;
  };
  if(!wire()) document.addEventListener('DOMContentLoaded',wire,{once:true});
})();

// Home-map enhancement: sequential progression + Rosie “Tell me about this step” guide.
(() => {
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  if(file && file!=='index.html') return;
  if(document.querySelector('script[data-boost-sequence-guide]')) return;
  const s=document.createElement('script');
  s.src='assets/js/sequence-guide.js?v=20260916ai2';
  s.defer=true;
  s.dataset.boostSequenceGuide='1';
  document.head.appendChild(s);
})();

// After Module 4, exactly one applied-industry hotspot is actionable: the one
// matched to the participant's selected occupation in Decide. This capture-phase
// gate also prevents stale/legacy handlers from opening locked industries.
(() => {
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  if(file && file!=='index.html') return;
  if(document.querySelector('script[data-boost-applied-map-click]')) return;
  const s=document.createElement('script');
  s.src='assets/js/northern-applied-map-click-v1.js?v=20260911active-card4';
  s.defer=true;
  s.dataset.boostAppliedMapClick='1';
  document.head.appendChild(s);
})();

// Completed core modules are always reviewable/reopenable from the map.
(() => {
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  if(file && file!=='index.html') return;
  if(document.querySelector('script[data-boost-reentry-fix]')) return;
  const s=document.createElement('script');
  s.src='assets/js/northern-map-reentry-fix-v1.js?v=20260910reentry2';
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

// Pinal-parity repair for Northern Module 4. Participant-facing Decide uses the
// same evidence structure as the current Pinal gold master; no numeric interest
// alignment is displayed in Module 4. Northern regional data remain Northern.
(() => {
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  if(!file.includes('module4_')) return;
  if(document.querySelector('script[data-boost-m4-interest-prep]')) return;
  const s=document.createElement('script');
  s.src='assets/js/northern-module4-interest-prep-fix-v1.js?v=20260910pinalparity2';
  s.dataset.boostM4InterestPrep='1';
  document.head.appendChild(s);
})();

// Reconcile Northern completion across the journey + shared evidence stores,
// write the Module 4 industry recommendation, show the Pinal-style arrow marker,
// and make the recommended industry immediately selectable after Decide.
(() => {
  const file=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  if(file!=='index.html'&&!file.includes('module4_')) return;
  if(document.querySelector('script[data-boost-m4-industry-map]')) return;
  const s=document.createElement('script');
  s.src='assets/js/northern-module4-industry-map-v1.js?v=20260911industry-lock2';
  s.defer=true;
  s.dataset.boostM4IndustryMap='1';
  document.head.appendChild(s);
})();

// Module 4 intro narration: move the existing player out of the hero and into
// a Rosie audio card immediately below the BOOST progression bar.
(() => {
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  if(file!=='module4-v4.html') return;
  if(document.querySelector('script[data-boost-m4-rosie-audio]')) return;
  const s=document.createElement('script');
  s.src='assets/js/northern-module4-rosie-audio-v1.js?v=20260911m4rosie1';
  s.defer=true;
  s.dataset.boostM4RosieAudio='1';
  document.head.appendChild(s);
})();

// Northern Ask Rosie Career Coach. Keep this in the shared config loader so the
// map and core Modules 1–4 receive the same closed, read-only coaching layer
// without changing their internal learning/progression logic. AI & You uses the
// Northern adapter page, which calls the same Northern Rosie function directly.
(() => {
  const file=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  const eligible=!file||file==='index.html'||file==='activity.html'||/module[1-4]/.test(file);
  if(!eligible||document.querySelector('script[data-northern-ask-rosie]')) return;
  const s=document.createElement('script');
  s.src='assets/js/northern-ask-rosie-v1.js?v=20260913mapctx1';
  s.defer=true;
  s.dataset.northernAskRosie='1';
  document.head.appendChild(s);
})();

// Northern Rapid Employment: validated Skill Mobility + 48-Hour Job Search launch/return.
(() => {
  const file=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  if(file!=='index.html'||document.querySelector('script[data-northern-rapid-map-v2]')) return;
  const s=document.createElement('script');
  s.src='assets/js/northern-rapid-map-v2.js?v=20260916a';
  s.defer=true;
  s.dataset.northernRapidMapV2='1';
  document.head.appendChild(s);
})();
