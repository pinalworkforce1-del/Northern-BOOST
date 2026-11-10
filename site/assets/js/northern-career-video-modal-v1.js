(()=>{
'use strict';
if(window.__northernCareerVideoModalV1)return;
window.__northernCareerVideoModalV1=true;
const style=document.createElement('style');
style.textContent='.nv-overlay[hidden]{display:none!important}.nv-overlay{position:fixed;inset:0;z-index:10010;display:grid;place-items:center;background:rgba(4,18,34,.88);padding:16px;backdrop-filter:blur(6px)}.nv-dialog{max-height:94vh;overflow:auto;width:min(880px,96vw);background:#fff;border-radius:17px;position:relative;padding:23px;box-shadow:0 20px 80px #0009;color:#173a52}.nv-dialog h2{font-size:clamp(18px,3vw,26px);margin:6px 40px 11px 0;line-height:1.35}.nv-dialog p{color:#587387;font-size:13px;line-height:1.6}.nv-dialog video{display:block;width:100%;max-height:66vh;aspect-ratio:16/9;background:#071929;border-radius:12px}.nv-close{position:absolute;right:17px;top:14px;background:#e8f1f6;border:1px solid #ccdae3;border-radius:9px;color:#164966;min-width:40px;min-height:40px;font-size:26px;cursor:pointer}.nv-links{display:flex;gap:12px;justify-content:space-between;align-items:center;flex-wrap:wrap;font-size:12px;margin-top:11px}.nv-links a{color:#17618a;text-decoration:underline;font-weight:800}.nv-status{font-size:12px;color:#6c7f8c;font-weight:700}.nv-fallback{border:1px solid #e3c98b;border-radius:11px;padding:14px;background:#fff8e8;color:#725322}.nv-fallback[hidden]{display:none!important}';
document.head.append(style);
let overlay=null,player=null,previousFocus=null;
function url(soc){
 const code=String(soc||'').replace(/[^0-9]/g,'');
 const c=code.length>=8?code.slice(0,8):code.length>=6?code.slice(0,6)+'00':null;
 return c?'https://cdn.careeronestop.org/OccVids/OccupationVideos/'+c.slice(0,2)+'-'+c.slice(2,6)+'.'+c.slice(6,8)+'.mp4':null;
}
function profile(soc,title){return 'https://www.careeronestop.org/Toolkit/Careers/Occupations/occupation-profile.aspx?'+new URLSearchParams({keyword:title||soc||'',location:'US'});}
function close(){
 if(!overlay)return;
 overlay.hidden=true;if(player){player.pause();player.removeAttribute('src');player.load();}
 document.body.style.overflow='';if(previousFocus&&previousFocus.isConnected)previousFocus.focus();
}
function make(){
 overlay=document.createElement('div');overlay.className='nv-overlay';overlay.hidden=true;
 const dialog=document.createElement('section');dialog.className='nv-dialog';dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-labelledby','nvTitle');
 const closeButton=document.createElement('button');closeButton.className='nv-close';closeButton.setAttribute('aria-label','Close career video');closeButton.type='button';closeButton.textContent='×';closeButton.onclick=close;
 const top=document.createElement('div');top.className='stepTag';top.textContent='CAREERONESTOP · CAREER IN ACTION';
 const h=document.createElement('h2');h.id='nvTitle';
 const info=document.createElement('p');info.textContent='Watch this occupational video without leaving Discover. CareerOneStop may use a representative video shared by related occupations.';
 player=document.createElement('video');player.controls=true;player.playsInline=true;player.preload='metadata';
 player.addEventListener('error',()=>{dialog.querySelector('.nv-fallback').hidden=false;player.hidden=true;});
 const fallback=document.createElement('div');fallback.className='nv-fallback';fallback.hidden=true;
 fallback.textContent='This CareerOneStop video cannot be played in the embedded player. Open the occupation profile below to view another available source.';
 const links=document.createElement('div');links.className='nv-links';
 const status=document.createElement('span');status.className='nv-status';status.textContent='Source: U.S. Department of Labor CareerOneStop';
 const link=document.createElement('a');link.target='_blank';link.rel='noopener noreferrer';link.textContent='Open CareerOneStop occupation profile ↗';
 links.append(status,link);dialog.append(closeButton,top,h,info,player,fallback,links);overlay.append(dialog);document.body.append(overlay);
 overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
 document.addEventListener('keydown',e=>{
  if(overlay.hidden)return;
  if(e.key==='Escape'){e.preventDefault();close()}
  if(e.key==='Tab'){const focusable=[closeButton,player,link].filter(el=>!el.hidden);
    if(e.shiftKey&&document.activeElement===focusable[0]){e.preventDefault();focusable[focusable.length-1].focus()}
    else if(!e.shiftKey&&document.activeElement===focusable[focusable.length-1]){e.preventDefault();focusable[0].focus()}
  }
 });
 return {h,link,fallback,closeButton};
}
let ui;
function open(source){
 const wrap=source.closest('.cosRealityWrap');if(!wrap)return;
 if(!ui)ui=make();
 const soc=wrap.dataset.cosSoc;
 const card=wrap.closest('article,.card,.career-card,.careerCard,.resultCard');
 const title=card?.querySelector('h2,h3,h4,.title')?.textContent?.trim()||'Career video';
 const src=url(soc);
 previousFocus=source;ui.h.textContent=title+' — Career Video';ui.link.href=profile(soc,title);ui.fallback.hidden=true;
 player.hidden=false;overlay.hidden=false;document.body.style.overflow='hidden';ui.closeButton.focus();
 if(!src){player.hidden=true;ui.fallback.hidden=false;return}
 player.src=src;player.load();player.play().catch(()=>{});
}
document.addEventListener('click',e=>{
 const b=e.target.closest('.cosVideoAction');if(!b)return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();open(b);
},true);
})();