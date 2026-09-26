(()=>{
'use strict';
if(window.__NorthernBOOSTDependencyFreshnessInstalled)return;
window.__NorthernBOOSTDependencyFreshnessInstalled=true;
const JK='boost_naz_journey_v1',SK='northern_boost_career_exploration_v1',DK='boost_naz_dependency_freshness_v1';
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'{}')||{}}catch(_){return{}}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}};
const ts=v=>{const n=Date.parse(v||'');return Number.isFinite(n)?n:0};
const soc=v=>String(v??'').replace(/[^0-9-]/g,'').trim();
const arr=v=>Array.isArray(v)?v:[];
const uniq=a=>[...new Set(a.filter(Boolean))].sort();
function newer(a,b){return ts(a?.updatedAt||a?.completedAt)>=ts(b?.updatedAt||b?.completedAt)?(a||{}):(b||{})}
function stores(){return{j:read(JK),s:read(SK)}}
function m1(){const {j,s}=stores();return newer(s.module1,j.module1)}
function m2(){const {j,s}=stores();return newer(s.module2,j.module2)}
function m3(){const {j,s}=stores();return newer(s.module3,j.module3)}
function m4(){const {j,s}=stores();return newer(s.module4,j.module4)}
function careerList(mod,which){if(which===1)return arr(mod?.selected).length?arr(mod.selected):arr(mod?.careers);return arr(mod?.careers)}
function careerSocs(mod,which){return uniq(careerList(mod,which).map(x=>soc(x?.soc)))}
function driverKeys(mod){return uniq(arr(mod?.alignmentProfile?.validatedWorkDrivers).map(x=>String(typeof x==='string'?x:(x?.key||x?.label||'')).trim()))}
function scoreBits(mod){const r=mod?.scores||mod?.riasec||{};return ['R','I','A','S','E','C'].map(k=>`${k}:${Number.isFinite(Number(r?.[k]))?Number(r[k]):''}`)}
function m1Sig(){const x=m1();return JSON.stringify({careers:careerSocs(x,1),scores:scoreBits(x),drivers:driverKeys(x)})}
function m1CareerSig(){return JSON.stringify(careerSocs(m1(),1))}
function m2CareerSig(){return JSON.stringify(careerSocs(m2(),2))}
function completionAt(id){const x=id===2?m2():id===3?m3():m4();return id===3?ts(x?.completedAt||x?.finalizedAt):ts(x?.completedAt)}
function state(){const d=read(DK);d.review=d.review||{};d.snapshots=d.snapshots||{};d.lastCompletion=d.lastCompletion||{};return d}
function mark(d,id,reason,now){const k='module'+id;if(!d.review[k])d.review[k]={since:now,reason};else{d.review[k].reason=reason;d.review[k].since=d.review[k].since||now}}
function clear(d,id){delete d.review['module'+id]}
function review(id){return !!state().review?.['module'+id]}
function reason(id){return state().review?.['module'+id]?.reason||''}
function reconcile(){
 const now=new Date().toISOString(),d=state(),sig=m1Sig(),careerSig=m1CareerSig(),m2sig=m2CareerSig();
 if(!d.module1Sig){d.module1Sig=sig;d.module1CareerSig=careerSig;const hasM2=careerSocs(m2(),2).length>0;if(hasM2&&careerSig!==m2sig){mark(d,2,'Your Discover career choices changed after this Reality Check was completed.',now);mark(d,3,'Career Mobility was built from an earlier set of Discover / Reality Check careers.',now);mark(d,4,'Decide was built from earlier upstream career evidence.',now)}else if(hasM2){d.snapshots.module2=sig}}
 else if(d.module1Sig!==sig){d.module1Sig=sig;d.module1CareerSig=careerSig;mark(d,2,'Your Discover evidence changed. Review Reality Check so the new career evidence is validated.',now);mark(d,3,'Discover changed upstream. Refresh Reality Check, then review Career Mobility with the updated careers.',now);mark(d,4,'Upstream career evidence changed. Review Modules 2 and 3 before refreshing Decide.',now)}
 if(careerSocs(m2(),2).length&&careerSig!==m2sig){mark(d,2,'Your Discover career choices no longer match the careers saved in Reality Check.',now);mark(d,3,'Career Mobility is based on careers that no longer match Discover.',now);mark(d,4,'Decide is based on earlier upstream career evidence.',now)}
 const c2=completionAt(2),r2=ts(d.review.module2?.since);if(d.review.module2&&c2>r2&&careerSig===m2sig){clear(d,2);d.snapshots.module2=sig;d.lastCompletion.module2=c2}
 const c3=completionAt(3),r3=ts(d.review.module3?.since);if(d.review.module3&&!d.review.module2&&c3>r3){clear(d,3);d.snapshots.module3=d.snapshots.module2||sig;d.lastCompletion.module3=c3}
 const c4=completionAt(4),r4=ts(d.review.module4?.since);if(d.review.module4&&!d.review.module2&&!d.review.module3&&c4>r4){clear(d,4);d.snapshots.module4=d.snapshots.module3||sig;d.lastCompletion.module4=c4}
 d.updatedAt=now;write(DK,d);decorate();return d
}
function status(id){const d=state(),k='module'+id;if(!d.review[k])return'fresh';if(id===2)return'review';if(id===3)return d.review.module2?'blocked':'review';if(id===4)return(d.review.module2||d.review.module3)?'blocked':'review';return'fresh'}
function injectCss(){if(document.getElementById('boostDependencyFreshnessCss'))return;const s=document.createElement('style');s.id='boostDependencyFreshnessCss';s.textContent=`
.boostNeedsReview{outline:4px solid #e0a52f!important;box-shadow:0 0 0 7px #fff3cdcc!important;filter:none!important}.boostNeedsReview .boostReviewBadge{display:block}.boostReviewBadge{position:absolute;left:7px;top:7px;z-index:30;padding:5px 8px;border-radius:999px;background:#9a6700;color:#fff;border:1px solid #ffe19a;font:900 10px/1.1 Inter,Arial,sans-serif;letter-spacing:.03em}.boostDependencyBlocked{opacity:.78}.boostDependencyBanner{margin:14px auto;padding:14px 16px;border-radius:13px;background:#fff7dc;border:1px solid #e0b653;border-left:6px solid #d69a18;color:#4d3c13;max-width:1120px;font:600 14px/1.45 system-ui,-apple-system,Segoe UI,Arial,sans-serif}.boostDependencyBanner b{color:#3f300d}.boostDependencyBanner a{font-weight:900;color:#174e70}.boostDependencyBanner.review{background:#fff7dc}.boostDependencyBanner.blocked{background:#fff1e8;border-color:#d99b72;border-left-color:#b85f2b}.boostDependencyInline{margin:12px 0;padding:12px 14px;border-radius:11px;background:#fff7dc;border-left:5px solid #d69a18;color:#4d3c13;font-weight:650}`;document.head.appendChild(s)}
function labelFor(id,st){if(st==='review')return'REVIEW NEEDED';if(st==='blocked')return'UPDATE EARLIER STEP';return''}
function decorateMap(){[2,3,4].forEach(id=>{const el=document.querySelector(`[data-core="module${id}"]`);if(!el)return;const st=status(id);el.classList.toggle('boostNeedsReview',st!=='fresh');el.classList.toggle('boostDependencyBlocked',st==='blocked');if(st!=='fresh'){el.classList.remove('done','complete','completed');let b=el.querySelector('.boostReviewBadge');if(!b){b=document.createElement('span');b.className='boostReviewBadge';el.appendChild(b)}b.textContent=labelFor(id,st);const tip=el.querySelector('.tip');if(tip)tip.textContent=st==='review'?`Module ${id} • Review updated evidence`:`Module ${id} • Update the earlier highlighted step first`}else el.querySelector('.boostReviewBadge')?.remove()})}
function pageId(){const f=(location.pathname.split('/').pop()||'').toLowerCase();if(f.includes('module2'))return 2;if(f==='activity.html'||f.includes('module3'))return 3;if(f.includes('module4'))return 4;return 0}
function banner(){const id=pageId();if(!id)return;const st=status(id),existing=document.getElementById('boostDependencyBanner');if(st==='fresh'){existing?.remove();return}const d=existing||document.createElement('div');d.id='boostDependencyBanner';d.className='boostDependencyBanner '+st;const current=careerList(m1(),1).map(x=>x?.title).filter(Boolean).join(', ')||'your updated Discover career choices';let html='';if(id===2)html=`<b>Discover changed — Reality Check needs a refresh.</b><br>Your current Discover career${careerList(m1(),1).length===1?' is':'s are'} <b>${escapeHtml(current)}</b>. Review the evidence below and save Module 2 again. Your earlier responses are preserved where they still match the same occupation.`;
 if(id===3)html=st==='blocked'?`<b>Career Mobility is waiting for an updated Reality Check.</b><br>Discover now carries <b>${escapeHtml(current)}</b>, but Module 2 still reflects an earlier career set. <a href="Northern_BOOST_Module2_PinalFlow_v1.html">Update Module 2 — Reality Check →</a>`:`<b>Your upstream career evidence changed.</b><br>Career Mobility will use the refreshed careers from Discover / Reality Check. Review the career comparison again before saving Module 3.`;
 if(id===4)html=st==='blocked'?`<b>Decide is waiting for refreshed upstream evidence.</b><br>Complete the highlighted review step first so Decide does not use an older career path.`:`<b>Your upstream evidence changed.</b><br>Review this decision again so the saved direction reflects the refreshed Career Mobility evidence.`;if(d.innerHTML!==html)d.innerHTML=html;if(!existing){const host=document.querySelector('main')||document.body;host.insertAdjacentElement('afterbegin',d)}}
function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function blockStalePage(){const id=pageId(),st=status(id);if(id===3&&st==='blocked'){const finish=document.getElementById('finishBtn');if(finish){finish.disabled=true;finish.title='Update Module 2 first'}}if(id===4&&st==='blocked'){document.querySelectorAll('#nativeFinish,#finishFromModule,#decide').forEach(b=>{b.disabled=true;b.title='Refresh the earlier BOOST step first'})}}
function acknowledgeModule3Finish(){
 const clicked=Date.now();
 let tries=0;
 const timer=setInterval(()=>{tries++;const {j}=stores(),x=m3(),d=state(),updated=ts(x?.updatedAt);if(!d.review?.module3){clearInterval(timer);return}if(!d.review?.module2&&j?.progress?.module3==='complete'&&updated>=clicked-1000){clear(d,3);d.snapshots.module3=d.snapshots.module2||m1Sig();d.lastCompletion.module3=updated;d.updatedAt=new Date().toISOString();write(DK,d);decorate();clearInterval(timer);return}if(tries>30)clearInterval(timer)},50)
}
function installCompletionHooks(){
 const f=document.getElementById('finishBtn');if(f&&!f.dataset.boostDependencyHook){f.dataset.boostDependencyHook='1';f.addEventListener('click',acknowledgeModule3Finish,true)}
}
function decorate(){if(!document.documentElement)return;injectCss();decorateMap();banner();blockStalePage();installCompletionHooks()}
function gate(e){const el=e.target?.closest?.('[data-core]');if(!el)return;const id=Number(String(el.dataset.core||'').replace(/\D/g,''));if(![2,3,4].includes(id))return;const st=status(id);if(st==='blocked'){e.preventDefault();e.stopImmediatePropagation();const target=id===3?'Module 2 — Reality Check':'the earlier highlighted BOOST step';try{window.showToast?.(`Update ${target} first so this step uses your current career evidence.`)}catch(_){};decorate()}}
window.addEventListener('click',gate,true);
window.addEventListener('storage',()=>setTimeout(reconcile,30));
document.addEventListener('boostprogress',()=>setTimeout(reconcile,30));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{reconcile();setTimeout(reconcile,700);setTimeout(reconcile,1800)},{once:true});else{reconcile();setTimeout(reconcile,700);setTimeout(reconcile,1800)}
setInterval(reconcile,1500);
window.NorthernBOOSTDependencies={reconcile,status,review,reason,state,m1Sig,m1CareerSig,m2CareerSig};
})();
