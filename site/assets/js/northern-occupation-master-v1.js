(()=>{
'use strict';
const PARTS=[1,2,3,4].map(n=>`assets/data/northern-occ-master-v1.b64.${n}.txt?v=20260910a`);
let cache=null;
function decodeRows(obj){
  const fields=obj?.fields||[];
  const occupations=(obj?.rows||[]).map(row=>Object.fromEntries(fields.map((field,i)=>[field,row[i]])));
  return {fields,occupations,map:new Map(occupations.map(o=>[String(o.soc),o]))};
}
async function inflateGzipBase64(b64){
  if(!('DecompressionStream' in window))throw new Error('Your browser needs a current version to open Northern BOOST career data.');
  const binary=atob(b64.replace(/\s+/g,''));
  const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));
  const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Response(stream).text();
}
async function load(){
  if(cache)return cache;
  cache=(async()=>{
    const parts=await Promise.all(PARTS.map(async url=>{
      const r=await fetch(url,{cache:'no-store'});
      if(!r.ok)throw new Error('Northern occupation master data could not be loaded.');
      return (await r.text()).trim();
    }));
    const text=await inflateGzipBase64(parts.join(''));
    const decoded=decodeRows(JSON.parse(text));
    if(decoded.occupations.length!==798)throw new Error(`Northern occupation master expected 798 occupations but found ${decoded.occupations.length}.`);
    return decoded;
  })();
  try{return await cache}catch(e){cache=null;throw e}
}
window.NORTHERN_OCC_MASTER={version:'northern-occ-master-v1',load};
})();