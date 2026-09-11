(()=>{
'use strict';

const JOURNEY_KEY='boost_naz_journey_v1';
const SHARED_KEY='northern_boost_career_exploration_v1';
const frame=document.getElementById('activityFrame');

const read=key=>{
  try{return JSON.parse(localStorage.getItem(key)||'{}')||{}}
  catch(_){return{}}
};

const write=(key,obj)=>{
  obj=obj||{};
  obj.region='Northern Arizona';
  obj.updatedAt=new Date().toISOString();
  localStorage.setItem(key,JSON.stringify(obj));
};

function module2Wage(){
  const shared=read(SHARED_KEY);
  const journey=read(JOURNEY_KEY);
  const values=[
    shared?.module2?.currentHourlyWage,
    journey?.module2?.currentHourlyWage,
    shared?.module2?.wageBaseline?.hourly,
    journey?.module2?.wageBaseline?.hourly,
    shared?.participant?.currentHourlyWage,
    journey?.participant?.currentHourlyWage
  ];
  for(const value of values){
    const wage=Number(value);
    if(Number.isFinite(wage)&&wage>0&&wage<=250)return wage;
  }
  return null;
}

let lastPersisted=null;
function persistModule3Wage(wage){
  if(lastPersisted===wage)return;
  let changed=false;
  const now=new Date().toISOString();
  for(const [key,state] of [[JOURNEY_KEY,read(JOURNEY_KEY)],[SHARED_KEY,read(SHARED_KEY)]]){
    state.module3=state.module3||{};
    if(Number(state.module3.currentWage)!==wage||state.module3.currentWageSource!=='module2'){
      state.module3.currentWage=wage;
      state.module3.currentWageSource='module2';
      state.module3.currentWageCarriedAt=now;
      write(key,state);
      changed=true;
    }
  }
  lastPersisted=wage;
  if(changed){
    try{window.BOOSTCloud?.flush?.()}catch(_){}
  }
}

function applyCarryForward(){
  const wage=module2Wage();
  if(!wage||!frame)return false;
  let doc;
  try{doc=frame.contentDocument}catch(_){return false}
  if(!doc?.body)return false;

  const input=doc.getElementById('currentWage');
  if(!input)return false;

  input.value=wage.toFixed(2);
  input.readOnly=true;
  input.setAttribute('aria-readonly','true');
  input.dataset.boostWageSource='module2';
  input.title='Carried forward from Module 2 Reality Check';
  input.style.background='#f3f7f8';
  input.style.cursor='default';

  const setup=doc.getElementById('setup');
  const labels=setup?[...setup.querySelectorAll('label')]:[];
  const label=labels.find(el=>el.htmlFor==='currentWage'||/hourly wage/i.test(el.textContent||''));
  if(label){
    label.innerHTML='Current or last hourly wage <span class="muted">— carried forward from Module 2</span>';
  }

  let note=doc.getElementById('boostModule2WageCarryNote');
  if(!note){
    note=doc.createElement('div');
    note.id='boostModule2WageCarryNote';
    note.className='muted';
    note.style.cssText='margin-top:-4px;margin-bottom:8px;font-size:.78rem;';
    input.insertAdjacentElement('afterend',note);
  }
  note.textContent=`Using $${wage.toFixed(2)}/hr from your Module 2 Reality Check.`;

  persistModule3Wage(wage);
  return true;
}

function runWindow(){
  let tries=0;
  const timer=setInterval(()=>{
    applyCarryForward();
    if(++tries>=40)clearInterval(timer);
  },250);
}

frame?.addEventListener('load',runWindow);
window.addEventListener('storage',applyCarryForward);
runWindow();
})();
