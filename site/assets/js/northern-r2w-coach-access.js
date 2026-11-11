/* Northern BOOST Coach View: staff-authorized Ready2Work access toggle. */
(()=>{
'use strict';
const endpoint=(window.BOOST_CONFIG?.supabaseUrl||'https://dxcajwarqojvmbteroco.supabase.co')+'/functions/v1/boost-northern-ready2work-access';
const key=window.BOOST_CONFIG?.supabaseAnonKey||'';
const tokenKey='boost-coach-staff-token-v1';
let statusMap=new Map(),inFlight=new Set(),loading=false;
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;',"'":'&#39;'}[c]));
async function call(action,body){
 const token=localStorage.getItem(tokenKey);
 if(!token)throw Error('Sign in to Coach View again.');
 const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','apikey':key,'Authorization':'Bearer '+key,'X-BOOST-Staff-Token':token},body:JSON.stringify({action,...body})});
 const data=await res.json().catch(()=>({}));
 if(!res.ok)throw Error(data.error||'Unable to update Ready 2 Work access');
 return data;
}
function card(row){
 const id=row.journey_id,st=statusMap.get(id),has=!!row.user_id||st?.has_account===true;
 const enabled=!!st?.enabled;
 return '<div class="r2w-coach-control" data-r2w-control="'+escape(id)+'"><div><strong>Ready 2 Work Access</strong><div class="r2w-coach-detail">'+(!has?'Participant sign-in not linked':st?enabled?'Enabled — participant can open Ready 2 Work':'Disabled — coach must enable':'Checking access…')+'</div>'+(st?.updated_by?'<small>Last changed by '+escape(st.updated_by)+'</small>':'')+'</div><button class="btn '+(enabled?'alt':'')+'" type="button" data-r2w-toggle="'+escape(id)+'" '+(!has||!st||inFlight.has(id)?'disabled':'')+'>'+(enabled?'Disable access':'Enable access')+'</button></div>';
}
function draw(){
 const records=window.__northernR2WCoachRecords||[];
 for(const row of records){
  const el=document.querySelector('[data-r2w-control="'+CSS.escape(row.journey_id)+'"]');
  if(el)el.outerHTML=card(row);
 }
 bind();
}
function bind(){
 document.querySelectorAll('[data-r2w-toggle]').forEach(btn=>{
  if(btn.dataset.bound)return;
  btn.dataset.bound='1';
  btn.onclick=async()=>{
   const id=btn.dataset.r2wToggle,st=statusMap.get(id);
   if(!st||inFlight.has(id))return;
   const next=!st.enabled;
   if(!next&&!confirm('Disable Ready 2 Work for this participant? Saved progress will be retained.'))return;
   inFlight.add(id);draw();
   try{
    const data=await call('set',{journey_id:id,enabled:next});
    statusMap.set(id,{...st,enabled:data.status.enabled,updated_by:data.status.updated_by_staff_email,updated_at:data.status.updated_at});
   }catch(e){alert(e.message)}
   finally{inFlight.delete(id);draw()}
  };
 });
}
async function refresh(rows){
 window.__northernR2WCoachRecords=rows;
 if(loading||!rows.length)return;
 loading=true;
 try{
  const ids=rows.map(x=>x.journey_id).filter(Boolean);
  for(let i=0;i<ids.length;i+=75){
   const d=await call('status',{journey_ids:ids.slice(i,i+75)});
   for(const st of d.statuses||[])statusMap.set(st.journey_id,st);
  }
 }catch(e){console.warn('Northern Ready2Work access status:',e.message)}
 finally{loading=false;draw()}
}
window.NorthernR2WCoach={card,refresh,bind};
})();