(()=>{
'use strict';
const JK='boost_naz_journey_v1';
function read(){try{return JSON.parse(localStorage.getItem(JK)||'{}')||{}}catch(_){return{}}}
function complete(id){const j=read(),p=j.progress||{};if(id==='module1')return p.module1==='complete'||!!j.module1?.careers?.length;if(id==='module2')return p.module2==='complete'||!!j.module2?.careers?.length;if(id==='module3')return p.module3==='complete'||!!j.module3?.careers?.length;if(id==='module4')return p.module4==='complete'||!!j.module4;return false}
// Capture on WINDOW, which fires before the document-level sequential gate.
// A completed core module must always remain reviewable/reopenable.
window.addEventListener('click',e=>{
 const hot=e.target?.closest?.('.hot[data-core]');if(!hot)return;
 const id=hot.dataset.core;if(!/^module[1-4]$/.test(id)||!complete(id))return;
 const href=hot.getAttribute('href');if(!href)return;
 e.preventDefault();e.stopImmediatePropagation();
 location.assign(href);
},true);
window.__BOOST_NAZ_COMPLETED_REENTRY='20260910-v2-window-capture';
})();
