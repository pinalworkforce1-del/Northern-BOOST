(function(){
  'use strict';
  const audio=document.getElementById('rosieAudio');
  if(!audio) return;

  const partUrls=[
    'assets/audio/rosie-naz-module1-opus-v2/chunk00.txt?v=20260910d',
    'assets/audio/rosie-naz-module1-opus-v2/chunk01.txt?v=20260910d',
    'assets/audio/rosie-naz-module1-opus-v2/chunk02.txt?v=20260910d',
    'assets/audio/rosie-naz-module1-opus-v2/chunk03.txt?v=20260910d',
    'assets/audio/rosie-naz-module1-opus-v2/chunk04a.txt?v=20260910d',
    'assets/audio/rosie-naz-module1-opus-v2/chunk04b.txt?v=20260910d',
    'assets/audio/rosie-naz-module1-opus-v2/chunk05.txt?v=20260910d',
    'assets/audio/rosie-naz-module1-opus-v2/chunk06.txt?v=20260910d',
    'assets/audio/rosie-naz-module1-opus-v2/chunk07.txt?v=20260910d',
    'assets/audio/rosie-naz-module1-opus-v2/chunk08.txt?v=20260910d'
  ];

  audio.querySelectorAll('source').forEach(function(source){source.remove();});
  audio.removeAttribute('src');
  audio.load();
  audio.style.display='none';

  const status=document.createElement('div');
  status.id='rosieAudioStatus';
  status.setAttribute('role','status');
  status.style.marginTop='10px';
  status.style.fontSize='.86rem';
  status.style.fontWeight='700';
  status.style.color='#607585';
  status.textContent='Loading Rosie audio…';
  audio.insertAdjacentElement('afterend',status);

  let objectUrl=null;
  let loadPromise=null;

  function prepareAudio(){
    if(loadPromise) return loadPromise;
    loadPromise=Promise.all(partUrls.map(function(url){
      return fetch(url,{cache:'force-cache'}).then(function(response){
        if(!response.ok) throw new Error('Audio part failed: '+response.status+' '+url);
        return response.text();
      });
    })).then(function(parts){
      const encoded=parts.join('').replace(/\s+/g,'');
      const binary=atob(encoded);
      const bytes=new Uint8Array(binary.length);
      for(let i=0;i<binary.length;i++) bytes[i]=binary.charCodeAt(i);
      objectUrl=URL.createObjectURL(new Blob([bytes],{type:'audio/ogg'}));
      audio.src=objectUrl;
      audio.addEventListener('loadedmetadata',function(){
        audio.style.display='block';
        status.textContent='Ready to play.';
      },{once:true});
      audio.addEventListener('error',function(){
        audio.style.display='none';
        status.textContent='Rosie audio could not be played in this browser.';
      },{once:true});
      audio.load();
      return audio;
    }).catch(function(error){
      console.error('Rosie Module 1 audio failed to load',error);
      loadPromise=null;
      status.textContent='Rosie audio could not be loaded. Refresh the page and try again.';
      throw error;
    });
    return loadPromise;
  }

  window.BOOSTRosieModule1Audio={prepare:prepareAudio};
  prepareAudio().catch(function(){});

  window.addEventListener('pagehide',function(){
    if(objectUrl) URL.revokeObjectURL(objectUrl);
  },{once:true});
})();
