(()=>{
'use strict';
if(window.__BOOST_M3_STABILITY_GUARD)return;
window.__BOOST_M3_STABILITY_GUARD='20260910-stable2';
const NativeMutationObserver=window.MutationObserver;
if(!NativeMutationObserver)return;
window.MutationObserver=class BOOSTStableMutationObserver extends NativeMutationObserver{
  observe(target,options){
    try{
      if(target?.ownerDocument && target.ownerDocument!==document){
        console.info('Northern BOOST stability guard: skipped cross-document MutationObserver.');
        return;
      }
    }catch(_){ }
    return super.observe(target,options);
  }
};
})();
