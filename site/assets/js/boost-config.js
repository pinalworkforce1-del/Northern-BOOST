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

// Module 3 conversion: route the Northern home-map hotspot through the standard
// BOOST activity HUD wrapper. The wrapper preserves the Northern Module 3 v0.8
// LMI/logic and adds the optional Pizza Workplace Skills Lab evidence experience.
(() => {
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  if(file && file!=='index.html') return;
  const wire=()=>{
    const hot=document.querySelector('[data-core="module3"]');
    if(!hot) return false;
    hot.href='module3-activity-v2.html';
    hot.removeAttribute('target');
    const tip=hot.querySelector('.tip');
    if(tip) tip.textContent='Module 3 • Career Mobility + Workplace Skills Lab';
    return true;
  };
  if(!wire()) document.addEventListener('DOMContentLoaded',wire,{once:true});
})();
