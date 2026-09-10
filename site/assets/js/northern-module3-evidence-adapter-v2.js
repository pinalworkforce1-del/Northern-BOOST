(()=>{'use strict';
const LEGACY='Northern_BOOST_Module1_Connected_Test_v2.8.html';
const nativeFetch=window.fetch.bind(window);
window.fetch=async function(input,init){
  const url=typeof input==='string'?input:(input&&input.url)||'';
  if(String(url).includes(LEGACY)){
    if(!window.NORTHERN_OCC_MASTER?.load) return nativeFetch(input,init);
    const master=await window.NORTHERN_OCC_MASTER.load();
    const data=(master.occupations||[]).map(o=>({
      soc:o.soc,title:o.title,jobs:o.jobs,jobs2035:o.jobs2035,annualOpenings:o.annualOpenings,
      growthPercent:o.growthPercent,wage25:o.wage25,wageMedian:o.wageMedian,wage75:o.wage75,
      typicalEntryEducation:o.typicalEntryEducation,workExperienceRequired:o.workExperienceRequired,
      typicalOnTheJobTraining:o.typicalOnTheJobTraining,education:o.typicalEntryEducation,
      passesRecommendationGate:!!o.passesRecommendationGate,regionalOpportunityLabel:o.regionalOpportunityLabel,
      regional:{jobs26:o.jobs,jobs35:o.jobs2035,annualOpenings:o.annualOpenings,growthPct:o.growthPercent,
        p25Hourly:o.wage25,medianHourly:o.wageMedian,p75Hourly:o.wage75,tier:o.regionalOpportunityLabel,
        passesRecommendationGate:!!o.passesRecommendationGate}
    }));
    const body='const DATA='+JSON.stringify(data)+';\nconst RIASEC=[];';
    return new Response(body,{status:200,headers:{'Content-Type':'text/html; charset=utf-8','X-Northern-BOOST-Evidence':'northern-occ-master-v1'}});
  }
  return nativeFetch(input,init);
};
window.NorthernBOOSTModule3EvidenceAdapter={version:'v2',source:'northern-occ-master-v1'};
})();