(()=>{
'use strict';
const JKEY='boost_naz_journey_v1',SKEY='northern_boost_career_exploration_v1';
const $=id=>document.getElementById(id);
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'{}')||{}}catch(_){return{}}};
const write=(k,o)=>{o=o||{};o.region='Northern Arizona';o.updatedAt=new Date().toISOString();localStorage.setItem(k,JSON.stringify(o));return o};
const money=n=>'$'+Number(n).toFixed(2);
function existingBaseline(){const j=read(JKEY),s=read(SKEY),vals=[s?.module2?.currentHourlyWage,j?.module2?.currentHourlyWage,s?.module2?.wageBaseline?.hourly,j?.module2?.wageBaseline?.hourly,s?.participant?.currentHourlyWage,j?.participant?.currentHourlyWage,s?.module4?.wageComparison?.baselineHourly,j?.module4?.wageComparison?.baselineHourly];for(const v of vals){const n=Number(v);if(Number.isFinite(n)&&n>0)return n}return null}
function valid(){const n=Number($('currentHourlyWage')?.value);return Number.isFinite(n)&&n>0&&n<=250?n:null}
function saveBaseline(flush=true){const n=valid();if(!n)return false;const now=new Date().toISOString();for(const [key,st] of [[JKEY,read(JKEY)],[SKEY,read(SKEY)]]){st.participant=st.participant||{};st.participant.currentHourlyWage=n;st.module2=st.module2||{};st.module2.currentHourlyWage=n;st.module2.wageBaseline={hourly:n,annual:n*2080,annualHours:2080,source:'Participant current or most recent hourly wage',required:true,updatedAt:now};write(key,st)}if(flush){try{window.BOOSTCloud?.flush?.()}catch(_){}}return true}
function entryForSoc(soc){const j=read(JKEY),s=read(SKEY),lists=[s?.module2?.careers,j?.module2?.careers,s?.module1?.selected,j?.module1?.careers];for(const list of lists){const c=(list||[]).find(x=>String(x?.soc||'')===String(soc));if(c){const n=Number(c.wage25??c.regional?.p25Hourly??c.entryWage?.hourly);if(Number.isFinite(n)&&n>0)return n}}return null}
function updateAnnual(){const n=valid(),out=$('wageBaselineAnnual');if(out)out.textContent=n?`About $${Math.round(n*2080).toLocaleString()} per year at 2,080 hours.`:'Enter the hourly wage from your current or most recent job.';renderComparisons()}
function renderComparisons(){const base=valid()||existingBaseline();document.querySelectorAll('.career[data-soc]').forEach(card=>{const step=[...card.querySelectorAll('.evidenceStep')].find(x=>/2\s*•\s*WAGES/i.test(x.querySelector('.evidenceLabel')?.textContent||''));if(!step)return;let box=step.querySelector('.currentWageCompare');if(!box){box=document.createElement('div');box.className='currentWageCompare';box.style.cssText='margin-top:12px;padding:11px 12px;border-radius:11px;background:#eef7fb;border:1px solid #c9dde8;font-size:.92rem';step.appendChild(box)}const entry=entryForSoc(card.dataset.soc);if(!base||!entry){box.innerHTML='<b>Wage change from your current/most recent job:</b> Enter your baseline wage above to compare.';return}const d=(entry-base)*2080,p=base?((entry-base)/base*100):0,up=d>=0;box.innerHTML=`<b>Estimated change at point of entry:</b> ${up?'+':'−'}$${Math.abs(Math.round(d)).toLocaleString()}/yr (${p>=0?'+':''}${p.toFixed(1)}%)<br><span style="color:#60717e">${money(base)}/hr current or most recent → ${money(entry)}/hr Northern point-of-entry estimate. This is evidence for the decision, not a guarantee of pay.</span>`})}
function blockIfMissing(e){if(valid()){
  // Save before the main Module 2 handler runs, then re-apply immediately after
  // because the main handler rebuilds module2 and could otherwise drop these fields.
  saveBaseline(false);
  setTimeout(()=>saveBaseline(true),0);
  return;
}e.preventDefault();e.stopImmediatePropagation();const msg=$('wageBaselineMessage');if(msg){msg.textContent='Enter your current or most recent hourly wage before completing Reality Check.';msg.style.display='block'}$('wageBaselinePanel')?.scrollIntoView({behavior:'smooth',block:'center'});$('currentHourlyWage')?.focus()}
function init(){const input=$('currentHourlyWage');if(!input)return;const old=existingBaseline();if(old)input.value=old;updateAnnual();input.addEventListener('input',updateAnnual);input.addEventListener('change',()=>{if(valid()){saveBaseline(true);const m=$('wageBaselineMessage');if(m)m.style.display='none'}});$('saveBtn')?.addEventListener('click',blockIfMissing,true)}
setTimeout(init,0);
})();
