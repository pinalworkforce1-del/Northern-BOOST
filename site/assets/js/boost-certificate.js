(()=>{
'use strict';
const JOURNEY_KEY="boost_naz_journey_v1",PATH_KEY="boost_naz_pathway_v1",PROMPT_KEY='boost_certificate_prompted_v1';
const MAP_KEY=null;
const PATH_LABELS={rapid:'Rapid Employment Pathway',career:'Career Exploration & Development'};
const ROUTE_LABELS={READY:'Ready for Employment',BRIDGE:'Bridge Strategy',BUILD:'Skill Building / Training',RECONSIDER:'Reconsider / Explore Another Direction'};
const MODULES={
 rapid:['Discover','Finding Yourself in Work','48-Hour Job Search','Build Strong Financial Habits','AI & You'],
 career:['Discover','Reality Check','Career Mobility','Decide','Applied Career Experience','Build Strong Financial Habits','AI & You']
};
function read(){try{return JSON.parse(localStorage.getItem(JOURNEY_KEY)||'{}')||{}}catch(_){return{}}}
function map(){if(!MAP_KEY)return{};try{return JSON.parse(localStorage.getItem(MAP_KEY)||'{}')||{}}catch(_){return{}}}
function path(){return localStorage.getItem(PATH_KEY)||map().pathway||read().selectedPathway||read().pathway?.selected||''}
function done(id){
 const j=read(),pr=j.progress||{},m=map(),mc=m.complete||{};
 if(id==='industry')return Object.entries(pr).some(([k,v])=>k.startsWith('industry-')&&v==='complete')||Object.keys(pr).some(k=>['skilledTrades','advancedManufacturing','healthcare','it','cdl','customerService'].includes(k)&&pr[k]==='complete')||Object.entries(mc).some(([k,v])=>k.startsWith('i:')&&v===true);
 if(id==='ai')return pr.ai==='complete'||pr.careerAi==='complete'||!!j.modules?.ai?.completed_at||!!j.sharedModules?.ai?.completedAt||!!mc['m:ai'];
 if(id==='financial')return pr.financial==='complete'||!!j.sharedModules?.financial?.completedAt||!!mc['m:financial'];
 if(id==='module5')return pr.module5==='complete'||!!j.modules?.module5?.completedAt||!!j.modules?.module5?.evaluatedAt||!!mc['m:module5'];
 return pr[id]==='complete'||!!mc['m:'+id]||!!j.modules?.[id]?.completedAt||!!j[id]?.completedAt;
}
function complete(){
 const p=path();
 if(p==='rapid')return ['module1','skillmobility','jobsearch','financial','ai'].every(done);
 if(p==='career')return ['module1','module2','module3','module4','industry','financial','ai'].every(done);
 return false;
}
function module4(j){return j.modules?.module4||j.module4||{}}
function career(j){const m=module4(j),c=m.careerTarget||m.targetCareer||m.career||m.selection?.career||{};return String(m.careerTitle||c.title||m.selectedCareerTitle||'').trim()}
function route(j){const m=module4(j);return String(m.route||m.participantDirection||m.decision?.code||m.participant?.direction||'').trim().toUpperCase()}
function participant(j){return String(j.participant?.name||j.participant?.fullName||j.participantName||localStorage.getItem('boostParticipantName')||'Participant').trim()}
function completionDate(j){return j.completion?.completedAt||j.modules?.ai?.completed_at||j.modules?.ai?.completedAt||j.sharedModules?.ai?.completedAt||new Date().toISOString()}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function prettyDate(v){const d=new Date(v);return Number.isNaN(d.getTime())?String(v||''):d.toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'})}
async function persistCompletion(){
 const j=read(),p=path();if(!j.completion?.completedAt){j.completion={...(j.completion||{}),completedAt:completionDate(j),pathway:p,certificateVersion:1};j.boostCompletedAt=j.completion.completedAt;localStorage.setItem(JOURNEY_KEY,JSON.stringify(j));try{await window.BOOSTCloud?.flush?.()}catch(_){}}return j;
}
function certificateHtml(j){
 const p=path(),name=participant(j),c=career(j),r=route(j),date=prettyDate(completionDate(j)),mods=MODULES[p]||[];
 const routeText=ROUTE_LABELS[r]||r;
 const moduleItems=mods.map(x=>'<span>'+esc(x)+'</span>').join('');
 return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BOOST Certificate — '+esc(name)+'</title><style>'+
 '@page{size:landscape;margin:.35in}*{box-sizing:border-box}body{margin:0;background:#edf2f4;font-family:Arial,Helvetica,sans-serif;color:#17324d}.actions{max-width:1100px;margin:16px auto;display:flex;justify-content:flex-end;gap:8px}.actions button{border:0;border-radius:999px;padding:11px 16px;background:#102d49;color:white;font-weight:900;cursor:pointer}.cert{width:min(1100px,calc(100vw - 30px));aspect-ratio:1.294/1;margin:0 auto 20px;background:#fffdf7;border:14px solid #102d49;outline:4px solid #e4a72b;outline-offset:-24px;padding:58px 72px;display:flex;flex-direction:column;text-align:center;justify-content:center;box-shadow:0 18px 60px #0002}.eyebrow{font-size:16px;letter-spacing:.22em;font-weight:900;color:#55707e}.brand{font-size:52px;font-weight:1000;letter-spacing:.08em;color:#102d49;margin:8px 0 0}.title{font-family:Georgia,serif;font-size:42px;color:#9a6a10;margin:4px 0 22px}.small{font-size:17px;color:#506774}.name{font-family:Georgia,serif;font-size:44px;font-weight:700;border-bottom:2px solid #d7c38d;display:inline-block;min-width:60%;padding:6px 20px;margin:5px auto 15px;color:#17324d}.path{font-size:21px;font-weight:900}.career{margin:12px auto 0;font-size:18px}.career b{color:#102d49}.modules{display:flex;flex-wrap:wrap;justify-content:center;gap:7px;margin:22px auto 12px;max-width:900px}.modules span{border:1px solid #b9c9d1;border-radius:999px;padding:6px 10px;font-size:12px;font-weight:800;background:#f4f8fa}.date{margin-top:12px;font-size:17px}.foot{margin-top:20px;font-size:11px;color:#687a84;line-height:1.4}.seal{width:76px;height:76px;border-radius:50%;margin:0 auto 10px;border:5px double #e4a72b;background:#102d49;color:#fff;display:grid;place-items:center;font-size:13px;font-weight:1000;letter-spacing:.08em}@media print{body{background:#fff}.actions{display:none}.cert{box-shadow:none;width:100%;margin:0;aspect-ratio:auto;min-height:7.2in}}</style></head><body>'+
 '<div class="actions"><button onclick="window.print()">Print / Save PDF</button></div><main class="cert"><div class="seal">BOOST</div><div class="eyebrow">WORKFORCE CAREER DEVELOPMENT</div><div class="brand">BOOST</div><div class="title">Certificate of Completion</div><div class="small">This certifies that</div><div class="name">'+esc(name)+'</div><div class="small">completed the</div><div class="path">'+esc(PATH_LABELS[p]||'BOOST Pathway')+'</div>'+
 (c?'<div class="career"><b>Selected Career Direction:</b> '+esc(c)+(routeText?' &nbsp; • &nbsp; <b>Decision Path:</b> '+esc(routeText):'')+'</div>':'')+
 '<div class="modules">'+moduleItems+'</div><div class="date"><b>Date Completed:</b> '+esc(date)+'</div><div class="foot">This certificate documents completion of the BOOST learning pathway. It is not an industry credential, license, or certification of occupational competence.</div></main></body></html>';
}
async function openCertificate(){if(!complete())return;const j=await persistCompletion(),w=window.open('','_blank');if(!w){alert('Your browser blocked the certificate window. Allow pop-ups for this site and try again.');return}w.document.open();w.document.write(certificateHtml(j));w.document.close()}
function ensureButton(){if(!complete()||document.getElementById('boostCertificateButton'))return;const b=document.createElement('button');b.id='boostCertificateButton';b.type='button';b.textContent='🏅 BOOST Certificate';b.style.cssText='position:fixed;left:16px;bottom:16px;z-index:2147482500;border:2px solid #e4a72b;border-radius:999px;padding:11px 15px;background:#102d49;color:#fff;font:900 13px Arial,sans-serif;box-shadow:0 8px 24px #0004;cursor:pointer';b.onclick=openCertificate;document.body.appendChild(b)}
function launchCelebration(host){
 if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
 const c=document.createElement('canvas');c.setAttribute('aria-hidden','true');c.style.cssText='position:fixed;inset:0;z-index:2147483600;pointer-events:none;width:100%;height:100%';host.parentNode.insertBefore(c,host);
 const ctx=c.getContext('2d'),dpr=Math.max(1,Math.min(2,window.devicePixelRatio||1));
 const resize=()=>{c.width=Math.floor(innerWidth*dpr);c.height=Math.floor(innerHeight*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)};resize();
 const confetti=Array.from({length:150},()=>({x:Math.random()*innerWidth,y:-20-Math.random()*innerHeight*.45,vx:(Math.random()-.5)*2.4,vy:2.4+Math.random()*4.2,r:3+Math.random()*4,a:Math.random()*Math.PI*2,spin:(Math.random()-.5)*.22,h:Math.floor(Math.random()*360)}));
 const sparks=[];const burst=(x,y)=>{for(let i=0;i<46;i++){const a=Math.random()*Math.PI*2,sp=1.8+Math.random()*4.8;sparks.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:1,h:Math.floor(Math.random()*360)})}};
 burst(innerWidth*.22,innerHeight*.28);setTimeout(()=>burst(innerWidth*.78,innerHeight*.24),650);setTimeout(()=>burst(innerWidth*.5,innerHeight*.18),1350);setTimeout(()=>burst(innerWidth*.32,innerHeight*.42),2050);setTimeout(()=>burst(innerWidth*.7,innerHeight*.4),2700);
 const start=performance.now();
 function draw(now){
   ctx.clearRect(0,0,innerWidth,innerHeight);
   confetti.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.a+=p.spin;if(p.y>innerHeight+20){p.y=-20;p.x=Math.random()*innerWidth}ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.a);ctx.fillStyle='hsl('+p.h+' 85% 58%)';ctx.fillRect(-p.r,-p.r*.45,p.r*2,p.r*.9);ctx.restore()});
   for(let i=sparks.length-1;i>=0;i--){const p=sparks[i];p.x+=p.vx;p.y+=p.vy;p.vy+=.035;p.life-=.018;if(p.life<=0){sparks.splice(i,1);continue}ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle='hsl('+p.h+' 90% 62%)';ctx.beginPath();ctx.arc(p.x,p.y,2.2,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}
   if(now-start<5600)requestAnimationFrame(draw);else c.remove();
 }
 requestAnimationFrame(draw);window.addEventListener('resize',resize,{once:true});
}
function modal(){
 if(document.getElementById('boostCertificateModal'))return;
 const j=read(),name=participant(j);
 const d=document.createElement('div');d.id='boostCertificateModal';d.style.cssText='position:fixed;inset:0;z-index:2147483601;background:#03101bd9;display:grid;place-items:center;padding:18px;font-family:Arial,sans-serif';
 d.innerHTML='<section style="position:relative;z-index:2;width:min(660px,96vw);background:#fffdf7;border-radius:22px;overflow:hidden;box-shadow:0 30px 90px #000a;border:3px solid #e4a72b"><header style="background:linear-gradient(135deg,#102d49,#1f587f);color:#fff;padding:26px 24px;border-bottom:4px solid #e4a72b;text-align:center"><div style="font-size:42px;margin-bottom:6px">🎉</div><small style="font-weight:900;letter-spacing:.13em;color:#f3cd72">BOOST PATHWAY COMPLETE</small><h2 style="margin:7px 0 4px;font-size:31px">Congratulations, '+esc(name)+'!</h2><div style="font-size:18px;font-weight:900;color:#fff">You completed BOOST.</div></header><div style="padding:24px;color:#314b5b;line-height:1.55;text-align:center"><p style="margin-top:0">You explored careers, tested your options, built evidence, and completed your final BOOST learning steps.</p><p style="font-weight:900;color:#17324d;font-size:18px">You are now a BOOST Graduate.</p><div style="display:flex;gap:9px;flex-wrap:wrap;justify-content:center;margin-top:20px"><button id="boostCertOpen" style="border:0;border-radius:999px;padding:12px 17px;background:#102d49;color:#fff;font-weight:900;cursor:pointer">🏅 View My BOOST Certificate</button><button id="boostCertLater" style="border:1px solid #c4d2d9;border-radius:999px;padding:12px 17px;background:#eef4f7;color:#17324d;font-weight:900;cursor:pointer">Return to Map</button></div></div></section>';
 document.body.appendChild(d);launchCelebration(d);d.querySelector('#boostCertOpen').onclick=()=>{d.remove();openCertificate()};d.querySelector('#boostCertLater').onclick=()=>d.remove();
}
async function check(showPrompt=true){
 if(!complete())return false;const j=await persistCompletion();ensureButton();const stamp=j.completion?.completedAt||completionDate(j),mark=path()+':'+stamp;if(showPrompt&&localStorage.getItem(PROMPT_KEY)!==mark){localStorage.setItem(PROMPT_KEY,mark);modal()}return true;
}
window.BOOSTCertificate={open:openCertificate,check};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>check(true),350));else setTimeout(()=>check(true),350);
document.addEventListener('boostprogress',e=>setTimeout(()=>check(e.detail?.moduleId==='ai'),250));
window.addEventListener('pageshow',()=>setTimeout(()=>check(true),350));
})();