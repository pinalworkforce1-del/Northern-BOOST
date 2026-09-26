#!/usr/bin/env python3
from pathlib import Path

JS=Path('site/assets/js/northern-module1-pinalflow-v1.js')
HTML=Path('site/Northern_BOOST_Module1_PinalFlow_v1.html')
js=JS.read_text(encoding='utf-8')
html=HTML.read_text(encoding='utf-8')

old_state="let DATA=[],scores=null,ranked=[],visible=8,filter='all',selected=new Map(),lastSearch=null;"
new_state="let DATA=[],scores=null,ranked=[],visible=8,filter='all',sortMode='overall',selected=new Map(),lastSearch=null;"
if old_state in js:
    js=js.replace(old_state,new_state,1)
elif "sortMode='overall'" not in js:
    raise SystemExit('state insertion point not found')

old_filtered="function filtered(){let arr=ranked;if(filter==='priority')arr=ranked.filter(o=>o.prioritySector);if(filter==='strong')arr=ranked.filter(o=>['strong','established'].includes(opportunity(o).cls));return arr.slice(0,visible)}"
new_filtered="""function sortedRanked(){const arr=[...ranked];const tie=(a,b)=>(Number(b.jobs)||0)-(Number(a.jobs)||0)||(Number(b.annualOpenings)||0)-(Number(a.annualOpenings)||0);if(sortMode==='interest')return arr.sort((a,b)=>b._alignment-a._alignment||tie(a,b));if(sortMode==='drivers')return arr.sort((a,b)=>(Number(b._driver?.score)??-1)-(Number(a._driver?.score)??-1)||b._alignment-a._alignment||tie(a,b));return arr.sort((a,b)=>b._combined-a._combined||tie(a,b))}
function filtered(){let arr=sortedRanked();if(filter==='priority')arr=arr.filter(o=>o.prioritySector);if(filter==='strong')arr=arr.filter(o=>['strong','established'].includes(opportunity(o).cls));return arr.slice(0,visible)}
function updateSortControls(){const hasDrivers=explicitDrivers().length>0;document.querySelectorAll('.sortBtn').forEach(b=>{const mode=b.dataset.sort;b.classList.toggle('active',mode===sortMode);if(mode==='drivers'){b.disabled=!hasDrivers;b.title=hasDrivers?'Sort by the work drivers you marked Yes':'Mark at least one work driver Yes to use this sort';}});const note=$('sortNote');if(note)note.textContent=sortMode==='interest'?'Showing strongest O*NET interest alignment first.':sortMode==='drivers'?'Showing strongest validated work-driver alignment first.':'Showing the combined view: 60% O*NET interests + 40% validated work drivers.'}
function setSortMode(mode){if(mode==='drivers'&&!explicitDrivers().length)return;sortMode=mode;visible=8;updateSortControls();renderCards()}"""
if old_filtered in js:
    js=js.replace(old_filtered,new_filtered,1)
elif 'function sortedRanked()' not in js:
    raise SystemExit('filtered insertion point not found')

old_bind="function bind(){$('surfaceBtn').onclick=surface;$('moreBtn').onclick=()=>{visible=Math.min(visible+8,40);renderCards()};$('searchInput').addEventListener('input',renderSearchList);$('saveBtn').onclick=completeModule;document.querySelectorAll('.filterBtn').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;visible=8;document.querySelectorAll('.filterBtn').forEach(x=>x.classList.toggle('active',x===b));renderCards()});['participantName','participantEmail'].forEach(id=>$(id)?.addEventListener('change',()=>persist(true)));document.addEventListener('click',e=>{if(!e.target.closest('.searchWrap'))$('searchResults').style.display='none'})}"
new_bind="function bind(){$('surfaceBtn').onclick=surface;$('moreBtn').onclick=()=>{visible=Math.min(visible+8,40);renderCards()};$('searchInput').addEventListener('input',renderSearchList);$('saveBtn').onclick=completeModule;document.querySelectorAll('.sortBtn').forEach(b=>b.onclick=()=>setSortMode(b.dataset.sort));document.querySelectorAll('.filterBtn').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;visible=8;document.querySelectorAll('.filterBtn').forEach(x=>x.classList.toggle('active',x===b));renderCards()});['participantName','participantEmail'].forEach(id=>$(id)?.addEventListener('change',()=>persist(true)));document.addEventListener('click',e=>{if(!e.target.closest('.searchWrap'))$('searchResults').style.display='none'});updateSortControls()}"
if old_bind in js:
    js=js.replace(old_bind,new_bind,1)
elif "document.querySelectorAll('.sortBtn')" not in js:
    raise SystemExit('bind insertion point not found')

# Refresh button availability/active state whenever careers are surfaced.
needle="scores=s;buildRank();visible=8;filter='all';"
replacement="scores=s;buildRank();visible=8;filter='all';updateSortControls();"
if needle in js:
    js=js.replace(needle,replacement,1)
elif "filter='all';updateSortControls();" not in js:
    raise SystemExit('surface update insertion point not found')

css="""
.sortBar{margin-top:14px;padding:13px 14px;border:1px solid #c8dbe5;border-radius:14px;background:#f7fbfd;display:flex;gap:9px;align-items:center;flex-wrap:wrap}.sortBar strong{color:#173346;margin-right:2px}.sortBtn{border:1px solid #a9c2d1;border-radius:999px;background:#fff;color:#174e70;padding:9px 13px;font-weight:900;cursor:pointer}.sortBtn:hover:not(:disabled){border-color:#2d6d8d;background:#edf7fb}.sortBtn.active{background:#173b56;color:#fff;border-color:#173b56}.sortBtn:disabled{opacity:.45;cursor:not-allowed}.sortNote{flex-basis:100%;font-size:12px;color:#607988;margin-top:1px}.sortExplain{font-size:12px;color:#607988;margin-left:2px}@media(max-width:760px){.sortBar{align-items:stretch}.sortBtn{width:100%;text-align:center}.sortExplain{margin-left:0}}
"""
if '.sortBar{' not in html:
    html=html.replace('</style>',css+'</style>',1)

old_summary='<div class="error" id="scoreError">Enter all six O*NET scores before continuing.</div><div class="interestSummary" id="interestSummary"></div></section>'
new_summary='''<div class="error" id="scoreError">Enter all six O*NET scores before continuing.</div><div class="interestSummary" id="interestSummary"></div><div class="sortBar" id="careerSortBar" aria-label="Sort career recommendations"><strong>Sort careers by:</strong><button class="sortBtn active" type="button" data-sort="overall">Overall Match</button><button class="sortBtn" type="button" data-sort="interest">Interest Alignment</button><button class="sortBtn" type="button" data-sort="drivers">Work Drivers</button><span class="sortExplain">Sorting changes the order — not which careers you can explore.</span><div class="sortNote" id="sortNote">Showing the combined view: 60% O*NET interests + 40% validated work drivers.</div></div></section>'''
if old_summary in html:
    html=html.replace(old_summary,new_summary,1)
elif 'id="careerSortBar"' not in html:
    raise SystemExit('sort controls HTML insertion point not found')

# Bust the module script cache for the sorting update.
html=html.replace('assets/js/northern-module1-pinalflow-v1.js?v=20260925b','assets/js/northern-module1-pinalflow-v1.js?v=20260926sort1')

JS.write_text(js,encoding='utf-8')
HTML.write_text(html,encoding='utf-8')
print('Added Overall Match, Interest Alignment, and Work Drivers sorting to Northern BOOST Module 1.')
