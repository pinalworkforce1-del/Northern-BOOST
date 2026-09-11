(function(){
  'use strict';

  const audio = document.getElementById('rosieAudio');
  if (!audio) return;

  const AUDIO_SRC = 'assets/audio/rosie-naz-module1-intro.mp3?v=20260911';

  // Northern BOOST Module 1 uses one standard MP3 source only.
  audio.querySelectorAll('source').forEach(function(source){ source.remove(); });
  audio.src = AUDIO_SRC;
  audio.preload = 'metadata';
  audio.style.display = 'block';

  const priorStatus = document.getElementById('rosieAudioStatus');
  if (priorStatus) priorStatus.remove();

  function prepareAudio(){
    if (audio.getAttribute('src') !== AUDIO_SRC) {
      audio.src = AUDIO_SRC;
    }
    audio.load();
    return Promise.resolve(audio);
  }

  audio.addEventListener('error', function(){
    console.error('Rosie Module 1 MP3 could not be loaded:', AUDIO_SRC);
  });

  window.BOOSTRosieModule1Audio = { prepare: prepareAudio };
})();
