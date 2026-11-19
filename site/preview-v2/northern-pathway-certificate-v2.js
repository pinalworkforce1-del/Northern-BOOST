(()=>{
'use strict';
// Northern BOOST 2.0 pathway graduation: read-only UI. The signed-in
// homepage controller confirms required completion from its Northern cloud
// journey BEFORE calling sync(). Do not write progress, invent completions,
// or reuse Pinal / Ready 2 Work certificate issuance.
const PROMPT_PREFIX='boost_naz_pathway_certificate_prompted_v2:';
const LABELS={
 module1:'Discover',module2:'Reality Check',module3:'Career Mobility',
 module4:'Decide',industry:'Applied Career Experience',
 skillmobility:'Finding Yourself in Work',jobsearch:'48-Hour Job Search',
 financial:'Build Strong Financial Habits',ai:'AI & You'
};
const PATHS={career:'Career Exploration & Development',rapid:'Rapid Employment'};
let context=null,dialog=null;
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function dateLabel(v){
 const dt=new Date(v);
 return Number.isNaN(dt.getTime())?'Date not recorded':dt.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
}
function who(j){
 const p=j.participant||{};
 return String(p.fullName||p.full_name||p.name||
   [p.firstName||p.first_name,p.lastName||p.last_name].filter(Boolean).join(' ')||
   j.participantName||'BOOST Participant').trim();
}
function aiEvidence(j){
 const m=j.module5||j.modules?.module5||j.modules?.ai||j.sharedModules?.ai||{};
 return m;
}
function completeDate(j){
 const m=aiEvidence(j);
 return m.completedAt||m.completed_at||j.completion?.completedAt||j.boostCompletedAt||null;
}
const CERTIFICATE_BRANDS={
 coconino:{
   name:'ARIZONA@WORK Coconino County',
   logo:new URL('preview-v2/ready2work/northern-azwork-logo.png',document.baseURI).href
 },
 agn:{
   name:'ARIZONA@WORK Northeastern Arizona',
   logo:new URL('preview-v2/ready2work/northern-neaz-logo-clean.png',document.baseURI).href
 }
};
const CERTIFICATE_AREA_KEY='boost_naz_pathway_certificate_area_v1:';
function regionKey(j,area){
 // Prefer the participant's explicit certificate-area selection when present,
 // otherwise use the same Northern service-area code as Ready 2 Work.
 let explicit='';
 try{explicit=localStorage.getItem(CERTIFICATE_AREA_KEY+(context?.userId||''))||''}catch(_){}
 const candidate=String(explicit||area||j.serviceArea||j.portal?.serviceArea||
   j.participant?.serviceArea||j.participant?.service_area||'').trim().toLowerCase();
 if(/coconino|^coco$/.test(candidate))return 'coconino';
 if(/agn|neaz|north.?eastern/.test(candidate))return 'agn';
 return '';
}
function close(){
 if(!dialog)return;
 dialog.remove();
 dialog=null;
 document.body.style.overflow='';
 document.removeEventListener('keydown',keyClose);
}
function keyClose(e){if(e.key==='Escape')close()}
function celebrate(){
 if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
 const host=dialog;if(!host)return;
 const c=document.createElement('canvas');c.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:1;width:100%;height:100%';c.setAttribute('aria-hidden','true');host.append(c);
 const ctx=c.getContext('2d');if(!ctx)return;
 const width=window.innerWidth,height=window.innerHeight,dpr=Math.min(2,window.devicePixelRatio||1);
 c.width=Math.round(width*dpr);c.height=Math.round(height*dpr);ctx.scale(dpr,dpr);
 const pieces=Array.from({length:100},()=>({x:Math.random()*width,y:-Math.random()*height,v:2+Math.random()*3,w:3+Math.random()*5,c:['#f4c46f','#2eb5b0','#74aeda','#fff2c8'][Math.floor(Math.random()*4)]}));
 let frame=0;function draw(){if(!c.isConnected)return;ctx.clearRect(0,0,width,height);for(const p of pieces){p.y+=p.v;p.x+=Math.sin((p.y+p.w)/40)*.9;ctx.fillStyle=p.c;ctx.fillRect(p.x,p.y,p.w,p.w*1.7)}if(++frame<250)requestAnimationFrame(draw);else c.remove()}requestAnimationFrame(draw);
}
function showModal(){
 if(!context?.eligible||dialog)return;
 const j=context.journey,name=who(j);
 dialog=document.createElement('div');
 dialog.id='northernPathwayCertificateDialog';
 dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-label','BOOST pathway complete');
 dialog.style.cssText='position:fixed;inset:0;z-index:2147483000;background:#061826e5;display:grid;place-items:center;padding:16px;font-family:Inter,Arial,sans-serif';
 const card=document.createElement('section');
 card.style.cssText='position:relative;z-index:2;width:min(630px,95vw);background:#fffdf7;border:3px solid #ecc56b;border-radius:22px;overflow:hidden;box-shadow:0 28px 80px #0009;text-align:center;color:#14354b';
 const header=document.createElement('header');
 header.style.cssText='background:linear-gradient(130deg,#0c304a,#1d5970);padding:28px 25px;color:white;border-bottom:5px solid #edbe5e';
 const med=document.createElement('div');med.textContent='🎉';med.style.fontSize='40px';
 const kicker=document.createElement('div');kicker.textContent='NORTHERN BOOST · PATHWAY COMPLETE';kicker.style.cssText='font-size:11px;letter-spacing:.13em;font-weight:900;color:#f7cb78;margin:6px 0';
 const title=document.createElement('h2');title.textContent='Congratulations, '+name+'!';title.style.cssText='font-size:clamp(24px,4vw,32px);line-height:1.15;margin:9px 0';
 const sub=document.createElement('p');sub.textContent='You completed the '+(PATHS[context.path]||'BOOST')+' pathway.';sub.style.cssText='font-size:15px;margin:8px 0 0;color:#e4f5fb';
 header.append(med,kicker,title,sub);
 const body=document.createElement('div');body.style.cssText='padding:25px 28px 30px';
 const expl=document.createElement('p');expl.textContent='Your completed learning activities and AI & You evidence have been confirmed in your Northern BOOST journey. Your certificate is available to view and print.';expl.style.cssText='line-height:1.6;font-size:15px;margin:0 0 22px';
 const actions=document.createElement('div');actions.style.cssText='display:flex;gap:10px;flex-wrap:wrap;justify-content:center';
 const open=document.createElement('button');open.type='button';open.textContent='🏅 View My BOOST Certificate';open.style.cssText='background:#103b56;color:white;border:0;border-radius:10px;padding:13px 18px;font-weight:900;cursor:pointer';
 const later=document.createElement('button');later.type='button';later.textContent='Return to My Pathway';later.style.cssText='background:#e8f0f3;color:#153b50;border:1px solid #aac3cf;border-radius:10px;padding:13px 18px;font-weight:800;cursor:pointer';
 open.onclick=()=>{close();openCertificate()};later.onclick=close;
 actions.append(open,later);body.append(expl,actions);card.append(header,body);dialog.append(card);document.body.append(dialog);document.body.style.overflow='hidden';
 dialog.addEventListener('click',e=>{if(e.target===dialog)close()});
 document.addEventListener('keydown',keyClose);later.focus();celebrate();
}
function certificateHtml(){
 const d=context,j=d.journey||{},name=who(j),path=PATHS[d.path]||'Northern BOOST Pathway';
 const area=regionKey(j,d.serviceArea),brand=CERTIFICATE_BRANDS[area]||null;
 const date=dateLabel(completeDate(j));
 const m=j.module4||j.modules?.module4||{},career=m.careerTarget||m.targetCareer||m.career||m.selection?.career||{};
 const careerName=String(m.careerTitle||m.title||career.title||'').trim();
 const route=String(m.route||m.participantDirection||m.decision?.code||'').toUpperCase();
 const modules=(d.requiredIds||[]).map(id=>'<span>'+esc(LABELS[id]||id)+'</span>').join('');
 const noIndustry=d.path==='career'&&!(d.requiredIds||[]).includes('industry');
 // The popup has the same origin as Northern BOOST, but image paths must be
 // absolute because the document itself is opened from about:blank.
 const initialLogo=brand?esc(brand.logo):'';
 const initialLabel=brand?esc(brand.name):'';
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BOOST Certificate — '+esc(name)+'</title><style>'+
 '*{box-sizing:border-box}body{background:#eaf0f4;color:#133852;margin:0;font-family:Arial,sans-serif}.actions{max-width:1100px;margin:14px auto;display:flex;justify-content:flex-end;align-items:center;gap:12px;flex-wrap:wrap}.actions label{font-size:13px;font-weight:800}.actions select{padding:10px 12px;border-radius:9px;border:1px solid #9db8c5;background:white;color:#173c56;font-weight:700}.actions button{background:#123a54;color:#fff;border:0;border-radius:10px;padding:12px 20px;font-weight:900;cursor:pointer}.actions button:disabled{opacity:.45;cursor:not-allowed}.sheet{max-width:1100px;min-height:730px;margin:0 auto 20px;padding:36px 50px 35px;text-align:center;background:linear-gradient(175deg,#fffdf6 60%,#e7f2ef);border:16px solid #10334d;outline:5px solid #f0bb5b;outline-offset:-31px;box-shadow:0 18px 45px #0820362f;display:flex;flex-direction:column;justify-content:center}.regional-lockup{width:min(510px,80%);height:134px;display:flex;align-items:center;justify-content:center;margin:0 auto 10px;max-width:100%}.regional-lockup img{width:100%;height:100%;max-width:100%;max-height:100%;object-fit:contain;object-position:center}.regional-lockup[data-area="coconino"] img{transform:scale(1.43);transform-origin:center}.regional-lockup[data-area="agn"] img{transform:none}.regional-fallback{font-size:24px;line-height:1.35;color:#243a78;font-weight:900}.regional-prompt{font-size:14px;color:#466676;border:1px dashed #a4bbc6;border-radius:10px;padding:13px;margin:auto}.eyebrow{font-size:13px;letter-spacing:.2em;color:#597786;font-weight:900}.brand{font-weight:900;font-size:40px;margin-top:9px}.title{font:normal 38px Georgia,serif;color:#986318;margin:0 0 14px}.minor{font-size:16px;color:#5c737f}.name{font:700 39px Georgia,serif;border-bottom:2px solid #cfbd93;display:inline-block;margin:6px auto 16px;padding:6px 15px;color:#102d46}.path{font-size:21px;font-weight:900}.career{margin:10px auto 0;font-size:14px}.modules{display:flex;gap:7px;flex-wrap:wrap;justify-content:center;margin:19px auto 5px;max-width:900px}.modules span{padding:7px 11px;border-radius:99px;border:1px solid #b7d0d6;background:#f1f7f8;font-size:12px;font-weight:800}.note{font-size:12px;color:#587280;margin-top:9px}.date{margin-top:17px;font-size:16px}.foot{font-size:11px;color:#597481;max-width:800px;margin:15px auto 0;line-height:1.5}@media(max-width:750px){.sheet{min-height:610px;padding:27px 20px}.regional-lockup{height:100px;width:min(440px,95%)}.title{font-size:30px}.name{font-size:29px}.brand{font-size:33px}.actions{padding:0 12px}}@page{size:landscape;margin:.28in}@media print{body{background:white}.actions{display:none!important}.sheet{max-width:none;width:100%;min-height:7.2in;margin:0;box-shadow:none;break-inside:avoid}.regional-lockup{height:120px}}'+
 '</style></head><body><div class="actions"><label for="certificateRegionSelect">Service area</label><select id="certificateRegionSelect" aria-label="Select official certificate branding"><option value="">Choose your Northern service area</option><option value="coconino"'+(area==='coconino'?' selected':'')+'>Coconino County</option><option value="agn"'+(area==='agn'?' selected':'')+'>Northeastern Arizona</option></select><button id="certificatePrintButton" type="button"'+(!brand?' disabled':'')+'>Print / Save PDF</button></div><main class="sheet"><div class="regional-lockup" data-area="'+esc(area)+'"><img id="certificateRegionalLogo" src="'+initialLogo+'" alt="'+initialLabel+'"'+(!brand?' hidden':'')+'><span class="regional-fallback" id="certificateRegionalFallback"'+(brand?' hidden':'')+'>'+ (brand?initialLabel:'Select your Northern service area above to display the correct ARIZONA@WORK logo')+'</span></div><div class="eyebrow">WORKFORCE CAREER DEVELOPMENT</div><div class="brand">BOOST</div><h1 class="title">Certificate of Completion</h1><div class="minor">This certifies that</div><div class="name">'+esc(name)+'</div><div class="minor">completed the</div><div class="path">'+esc(path)+'</div>'+
 (careerName?'<div class="career">Career Direction: <b>'+esc(careerName)+'</b>'+(route?' · Decision: '+esc(route):'')+'</div>':'')+
 '<div class="modules">'+modules+'</div>'+(noIndustry?'<div class="note">Applied Career Experience: Not required for the selected occupation</div>':'')+
 '<div class="date"><b>Completed:</b> '+esc(date)+'</div><p class="foot">This certificate recognizes successful completion of the BOOST learning pathway and the activities listed above.</p></main></body></html>';
}
function initCertificateBranding(popup){
 // No changes to Supabase or participant progress. Allow an explicit regional
 // choice when the service area was not saved in the older participant flow.
 const doc=popup.document,select=doc.getElementById('certificateRegionSelect');
 const image=doc.getElementById('certificateRegionalLogo');
 const fallback=doc.getElementById('certificateRegionalFallback');
 const printButton=doc.getElementById('certificatePrintButton');
 if(!select||!image||!fallback||!printButton)return;
 const logoLockup=image.closest('.regional-lockup');
 function useArea(key){
   if(logoLockup)logoLockup.dataset.area=key;
   const brand=CERTIFICATE_BRANDS[key]||null;
   printButton.disabled=!brand;
   if(!brand){
     image.hidden=true;image.removeAttribute('src');
     fallback.hidden=false;fallback.textContent='Select your Northern service area above to display the correct ARIZONA@WORK logo';
     return;
   }
   fallback.textContent=brand.name;
   fallback.hidden=true;
   image.alt=brand.name;
   image.onload=()=>{image.hidden=false;fallback.hidden=true};
   image.onerror=()=>{image.hidden=true;fallback.hidden=false};
   image.hidden=true;
   image.src=brand.logo;
   if(image.complete&&image.naturalWidth>0){image.hidden=false;fallback.hidden=true}
 }
 select.addEventListener('change',()=>{
   const chosen=select.value;
   if(CERTIFICATE_BRANDS[chosen]&&context?.userId){
     try{localStorage.setItem(CERTIFICATE_AREA_KEY+context.userId,chosen)}catch(_){}
   }
   useArea(chosen);
 });
 printButton.onclick=()=>{if(CERTIFICATE_BRANDS[select.value])popup.print()};
 useArea(select.value);
}
function openCertificate(){
 if(!context?.eligible)return;
 const popup=window.open('','_blank');
 if(!popup){window.alert('Please allow pop-ups for Northern BOOST to open your certificate.');return}
 popup.document.open();popup.document.write(certificateHtml());popup.document.close();
 initCertificateBranding(popup);
 popup.focus();
}
function sync(info){
 context=info?.eligible&&info?.userId&&['career','rapid'].includes(info.path)&&info.journey&&Array.isArray(info.requiredIds)
   ?{...info,eligible:true}:null;
 const target=document.getElementById('nextStep');
 if(!context||!target){close();return}
 let b=document.getElementById('northernCertificateButton');
 if(!b){b=document.createElement('button');b.id='northernCertificateButton';b.type='button';b.className='btn primary';b.textContent='🏅 View My BOOST Certificate';b.style.cssText='margin-left:auto;white-space:normal;max-width:280px';b.onclick=openCertificate;target.append(b)}
 const stamp=completeDate(context.journey)||'completed',key=PROMPT_PREFIX+context.userId+':'+context.path;
 try{if(localStorage.getItem(key)!==stamp){localStorage.setItem(key,stamp);showModal()}}catch(e){console.warn('Certificate celebration state unavailable',e)}
}
window.NorthernBOOSTPathwayCertificate={sync,open:openCertificate};
})();
