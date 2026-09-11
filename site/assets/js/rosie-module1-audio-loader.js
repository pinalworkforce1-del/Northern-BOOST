(function(){
  'use strict';

  const audio = document.getElementById('rosieAudio');
  if (!audio) return;

  const AUDIO_SRC = 'assets/audio/rosie-naz-module1-intro.mp3?v=20260911';

  // Northern BOOST Module 1 uses one normal MP3 file as its audio source.
  audio.querySelectorAll('source').forEach(function(source){ source.remove(); });
  audio.src = AUDIO_SRC;
  audio.preload = 'metadata';
  audio.style.display = 'block';

  const oldStatus = document.getElementById('rosieAudioStatus');
  if (oldStatus) oldStatus.remove();

  function prepareAudio(){
    if (audio.getAttribute('src') !== AUDIO_SRC) {
      audio.src = AUDIO_SRC;
    }
    audio.load();
    return Promise.resolve(audio);
  }

  window.BOOSTRosieModule1Audio = { prepare: prepareAudio };
})();
