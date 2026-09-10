(()=>{
'use strict';
const api=window.BOOSTCareerRelationships;
if(!api?.load)return;
const originalLoad=api.load.bind(api);
let cache=null;
function cleanText(value){
  return String(value)
    .replace(/Official Pinal 3H destination/gi,'Established pathway destination')
    .replace(/Pinal County/gi,'the earlier pathway model')
    .replace(/Pinal H3/gi,'pathway')
    .replace(/Pinal 3H/gi,'pathway')
    .replace(/\bH3\b/gi,'pathway')
    .replace(/\b3H\b/gi,'pathway')
    .replace(/current three-county[^.]*\./gi,'Regional availability should be checked against the current Northern occupation master.')
    .replace(/pathway pathway/gi,'pathway');
}
function clean(value){
  if(Array.isArray(value))return value.map(clean);
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,clean(v)]));
  return typeof value==='string'?cleanText(value):value;
}
api.load=async function(){
  if(cache)return cache;
  cache=clean(await originalLoad());
  cache.version='neutral-career-relationships-v2-northern-clean';
  cache.source='Geography-neutral occupational relationship crosswalk for Northern Arizona BOOST';
  return cache;
};
api.version='neutral-career-relationships-v2-northern-clean';
})();