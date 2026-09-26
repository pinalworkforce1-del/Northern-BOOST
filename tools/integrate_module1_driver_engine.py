#!/usr/bin/env python3
from pathlib import Path
import re

JS=Path('site/assets/js/northern-module1-pinalflow-v1.js')
HTML=Path('site/Northern_BOOST_Module1_PinalFlow_v1.html')
text=JS.read_text(encoding='utf-8')

helpers=r'''function explicitDrivers(){const j=readJourney(),d=j?.module1?.mindmap?.drivers||{};return Object.entries(d).filter(([,v])=>v==='yes').map(([k])=>k)}
function driverProfile(o){const active=explicitDrivers(),bank=window.NORTHERN_ONET_DRIVERS,raw=bank?.occupations?.[String(o?.soc)]||null;if(!active.length||!raw)return{score:null,active,matches:[],label:'Add work drivers to compare'};const rows=active.filter(k=>Number.isFinite(Number(raw[k]))).map(k=>({key:k,score:Number(raw[k]),label:bank?.drivers?.[k]?.label||k}));if(!rows.length)return{score:null,active,matches:[],label:'Work-driver evidence not available'};const score=rows.reduce((s,x)=>s+x.score,0)/rows.length;const matches=rows.filter(x=>x.score>=60).sort((a,b)=>b.score-a.score).slice(0,3);const label=score>=72?'Strong connection to your work drivers':score>=55?'Some connection to your work drivers':'Different from your strongest work drivers';return{score,active,matches,label}}
function combinedAlignment(o){const interest=alignment(o),driver=driverProfile(o);return driver.score==null?interest:(interest*.60+driver.score*.40)}
function driverWhy(o){const d=driverProfile(o);if(d.score==null)return'';if(d.matches.length)return`<div class="evidenceStory"><b>Why this connected:</b> ${d.matches.map(x=>esc(x.label)).join(' • ')}. These connections come from your validated work drivers compared with O*NET occupation ratings.</div>`;return`<div class="evidenceStory"><b>Work-driver check:</b> this occupation connects less strongly with the work drivers you marked Yes. It may still be worth exploring because your O*NET interests and regional evidence point here.</div>`}
'''

if 'function explicitDrivers()' not in text:
    text=text.replace('function buildRank(){',helpers+'function buildRank(){',1)

text,n=re.subn(r"function buildRank\(\)\{.*?\}\nfunction filtered\(\)","function buildRank(){ranked=DATA.filter(o=>o.passesRecommendationGate&&o.riasecProxy).map(o=>({...o,_alignment:alignment(o),_driver:driverProfile(o),_combined:combinedAlignment(o)})).sort((a,b)=>b._combined-a._combined||(Number(b.jobs)||0)-(Number(a.jobs)||0)||(Number(b.annualOpenings)||0)-(Number(a.annualOpenings)||0))}\nfunction filtered()",text,count=1,flags=re.S)
if n!=1: raise SystemExit('buildRank patch failed')

new_card=r'''function cardHtml(o,origin='BOOST Surfaced'){const ic=interestConnection(o),op=opportunity(o),saved=selected.has(String(o.soc)),dc=driverProfile(o);return`<article class="card"><div class="origin">${esc(origin)} • SOC ${esc(o.soc)}</div><h3>${esc(o.title)}</h3><div class="badges"><span class="badge sector">${esc(o.sector||'Career')}</span><span class="badge opp ${op.cls}">${esc(op.label)}</span>${saved?'<span class="badge selectedBadge">Saved ✓</span>':''}</div><div class="metrics"><div class="metric"><small>Interest connection</small><b>${esc(ic.label)}</b></div><div class="metric"><small>Work-driver connection</small><b>${esc(dc.label)}</b></div><div class="metric"><small>Regional jobs</small><b>${num(o.jobs)}</b></div><div class="metric"><small>Annual openings</small><b>${num(o.annualOpenings)}</b></div><div class="metric"><small>Projected growth</small><b>${pct(o.growthPercent)}</b></div><div class="metric entry"><small>Point-of-entry estimate</small><b>${money(o.wage25)}/hr</b></div><div class="metric"><small>Median wage</small><b>${money(o.wageMedian)}/hr</b></div></div>${driverWhy(o)}<div class="evidenceStory">${evidenceStory(o,origin)}</div><button class="addBtn ${saved?'remove':''}" type="button" data-soc="${esc(o.soc)}" data-origin="${esc(origin)}">${saved?'Remove from My Career Exploration':'＋ Add to My Career Exploration'}</button></article>`}'''
text,n=re.subn(r"function cardHtml\(o,origin='BOOST Surfaced'\)\{.*?\}\nfunction bindAdd",new_card+'\nfunction bindAdd',text,count=1,flags=re.S)
if n!=1: raise SystemExit('cardHtml patch failed')

old="$('interestSummary').innerHTML=`Your strongest interest themes are <b>${tops.map(([k])=>LABELS[k]).join(', ')}</b>. BOOST uses your full interest pattern in the background, then adds Northern Arizona labor-market evidence.`;"
new="const ds=explicitDrivers(),dl=window.NORTHERN_ONET_DRIVERS?.drivers||{};$('interestSummary').innerHTML=`Your strongest interest themes are <b>${tops.map(([k])=>LABELS[k]).join(', ')}</b>. ${ds.length?`BOOST is also comparing the work drivers you validated — <b>${ds.map(k=>esc(dl[k]?.label||k)).join(', ')}</b> — with O*NET occupation evidence.`:'Validate one or more work-driver themes above to add that evidence to career matching.'} Northern Arizona labor-market evidence remains a separate reality check.`;"
if old not in text: raise SystemExit('surface summary patch failed')
text=text.replace(old,new,1)

JS.write_text(text,encoding='utf-8')
html=HTML.read_text(encoding='utf-8')
needle='<script src="assets/js/northern-module1-pinalflow-v1.js?v=20260910a"></script>'
replacement='<script src="assets/data/northern-onet-driver-crosswalk-v1.js?v=20260925b"></script><script src="assets/js/northern-module1-pinalflow-v1.js?v=20260925b"></script>'
if 'northern-onet-driver-crosswalk-v1.js' not in html:
    if needle not in html: raise SystemExit('HTML script insertion point missing')
    html=html.replace(needle,replacement,1)
else:
    html=html.replace('assets/js/northern-module1-pinalflow-v1.js?v=20260910a','assets/js/northern-module1-pinalflow-v1.js?v=20260925b')
HTML.write_text(html,encoding='utf-8')
print('Integrated participant-validated work drivers into Northern Module 1 ranking and explanation cards.')
