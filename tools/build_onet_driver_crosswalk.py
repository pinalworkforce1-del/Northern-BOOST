#!/usr/bin/env python3
import csv, io, json, urllib.request
from collections import defaultdict
from pathlib import Path

VERSION='onet-31.0-driver-crosswalk-v1'
BASE='https://www.onetcenter.org/dl_files/database/db_31_0_csv/'
OUT=Path('site/assets/data/northern-onet-driver-crosswalk-v1.js')

DRIVERS={
 'helping':{
   'label':'Helping people directly',
   'activities':['Assisting and Caring for Others','Coaching and Developing Others','Training and Teaching Others'],
   'styles':['Empathy','Cooperation','Social Orientation']},
 'hands':{
   'label':'Working with my hands',
   'activities':['Handling and Moving Objects','Controlling Machines and Processes','Performing General Physical Activities','Repairing and Maintaining Mechanical Equipment','Repairing and Maintaining Electronic Equipment']},
 'solving':{
   'label':'Solving problems',
   'activities':['Making Decisions and Solving Problems','Analyzing Data or Information','Inspecting Equipment, Structures, or Materials','Identifying Objects, Actions, and Events'],
   'styles':['Intellectual Curiosity']},
 'creating':{
   'label':'Creating or improving things',
   'activities':['Thinking Creatively','Developing Objectives and Strategies'],
   'styles':['Innovation']},
 'leading':{
   'label':'Leading or influencing',
   'activities':['Guiding, Directing, and Motivating Subordinates','Coordinating the Work and Activities of Others','Selling or Influencing Others'],
   'styles':['Leadership Orientation']},
 'organizing':{
   'label':'Organizing details or systems',
   'activities':['Organizing, Planning, and Prioritizing Work','Scheduling Work and Activities','Documenting/Recording Information'],
   'styles':['Attention to Detail','Dependability']},
 'independence':{
   'label':'Having independence',
   'contexts':['Freedom to Make Decisions','Determine Tasks, Priorities and Goals'],
   'styles':['Initiative']},
 'team':{
   'label':'Being part of a team',
   'activities':['Establishing and Maintaining Interpersonal Relationships','Communicating with Supervisors, Peers, or Subordinates','Developing and Building Teams'],
   'contexts':['Work With or Contribute to a Work Group or Team'],
   'styles':['Cooperation']},
 'movement':{
   'label':'Staying active',
   'activities':['Performing General Physical Activities','Handling and Moving Objects'],
   'contexts':['Spend Time Standing']}
}

# stability and growth are intentionally calculated from Northern Arizona LMI in the browser.
# impact is intentionally participant-defined and not auto-scored.

def download(name):
    req=urllib.request.Request(BASE+name,headers={'User-Agent':'Northern-BOOST/1.0 O*NET crosswalk builder'})
    with urllib.request.urlopen(req,timeout=90) as r:
        return r.read().decode('utf-8-sig')

def soc6(code):
    return str(code).split('.')[0]

def norm_activity(v):
    return max(0,min(100,(float(v)-1.0)/4.0*100.0))

def norm_style(v):
    return max(0,min(100,max(0,float(v))/3.0*100.0))

def norm_context(v):
    return max(0,min(100,(float(v)-1.0)/4.0*100.0))

def load_selected(text, kind, wanted):
    out=defaultdict(lambda:defaultdict(list))
    for row in csv.DictReader(io.StringIO(text)):
        name=row.get('Element Name','')
        if name not in wanted: continue
        scale=row.get('Scale ID','')
        if kind=='activity' and scale!='IM': continue
        if kind=='style' and scale!='WI': continue
        if kind=='context' and scale!='CX': continue
        try:
            val=float(row.get('Data Value',''))
        except Exception:
            continue
        if kind=='activity': val=norm_activity(val)
        elif kind=='style': val=norm_style(val)
        else: val=norm_context(val)
        out[soc6(row['O*NET-SOC Code'])][name].append(val)
    return out

def collapse(src):
    return {soc:{name:sum(vals)/len(vals) for name,vals in names.items()} for soc,names in src.items()}

def main():
    wanted_a={x for d in DRIVERS.values() for x in d.get('activities',[])}
    wanted_s={x for d in DRIVERS.values() for x in d.get('styles',[])}
    wanted_c={x for d in DRIVERS.values() for x in d.get('contexts',[])}
    acts=collapse(load_selected(download('work_activities.csv'),'activity',wanted_a))
    styles=collapse(load_selected(download('work_styles.csv'),'style',wanted_s))
    contexts=collapse(load_selected(download('work_context.csv'),'context',wanted_c))
    socs=sorted(set(acts)|set(styles)|set(contexts))
    occupations={}
    coverage={k:0 for k in DRIVERS}
    for soc in socs:
        scores={}
        for key,d in DRIVERS.items():
            vals=[]
            for n in d.get('activities',[]):
                if n in acts.get(soc,{}): vals.append(acts[soc][n])
            for n in d.get('styles',[]):
                if n in styles.get(soc,{}): vals.append(styles[soc][n])
            for n in d.get('contexts',[]):
                if n in contexts.get(soc,{}): vals.append(contexts[soc][n])
            if vals:
                scores[key]=round(sum(vals)/len(vals),1)
                coverage[key]+=1
        if scores: occupations[soc]=scores
    payload={
      'version':VERSION,
      'source':{'name':'O*NET 31.0 Database','publisher':'U.S. Department of Labor, Employment and Training Administration','license':'CC BY 4.0','url':'https://www.onetcenter.org/database.html'},
      'method':'Participant-validated BOOST work drivers crosswalked to O*NET Work Activities, Work Styles, and Work Context. O*NET detailed occupations are averaged to six-digit SOC. Northern LMI stability/growth are calculated separately; participant-defined meaning/impact is not auto-scored.',
      'drivers':{k:{'label':v['label'],'activities':v.get('activities',[]),'styles':v.get('styles',[]),'contexts':v.get('contexts',[])} for k,v in DRIVERS.items()},
      'coverage':coverage,
      'occupations':occupations
    }
    OUT.parent.mkdir(parents=True,exist_ok=True)
    js='window.NORTHERN_ONET_DRIVERS='+json.dumps(payload,separators=(',',':'))+';\n'
    OUT.write_text(js,encoding='utf-8')
    print(f'wrote {OUT} with {len(occupations)} SOC profiles; {len(js):,} bytes')

if __name__=='__main__': main()
