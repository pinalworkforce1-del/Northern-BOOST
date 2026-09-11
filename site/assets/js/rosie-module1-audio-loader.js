(function(){
  'use strict';

  const JOURNEY_KEY = 'boost_naz_journey_v1';
  const audio = document.getElementById('rosieAudio');
  const AUDIO_SRC = 'assets/audio/rosie-naz-module1-intro.mp3?v=20260911';

  // Northern BOOST Module 1 uses one normal MP3 file as its audio source.
  if (audio) {
    audio.querySelectorAll('source').forEach(function(source){ source.remove(); });
    audio.src = AUDIO_SRC;
    audio.preload = 'metadata';
    audio.style.display = 'block';

    const oldStatus = document.getElementById('rosieAudioStatus');
    if (oldStatus) oldStatus.remove();

    function prepareAudio(){
      if (audio.getAttribute('src') !== AUDIO_SRC) audio.src = AUDIO_SRC;
      audio.load();
      return Promise.resolve(audio);
    }

    window.BOOSTRosieModule1Audio = { prepare: prepareAudio };
  }

  function readJourney(){
    try { return JSON.parse(localStorage.getItem(JOURNEY_KEY) || '{}') || {}; }
    catch (_) { return {}; }
  }

  function writeJourney(journey){
    try { localStorage.setItem(JOURNEY_KEY, JSON.stringify(journey)); }
    catch (_) {}
  }

  function recordModule1Entry(){
    const journey = readJourney();
    const now = new Date().toISOString();
    journey.region = journey.region || 'Northern Arizona';
    journey.tracking = journey.tracking || {};
    journey.tracking.currentModule = 'module1';
    journey.tracking.lastActivityAt = now;
    if (!journey.tracking.boostStartedAt) journey.tracking.boostStartedAt = now;
    writeJourney(journey);
    setTimeout(function(){ try { window.BOOSTCloud?.flush?.(); } catch (_) {} }, 450);
  }

  async function syncCompletedModule1(){
    // The Module 1 controller writes its final completion state first.
    // Read that final state after the click handler has finished, then force
    // the cloud save to complete before the participant leaves the module.
    const journey = readJourney();
    if (journey?.progress?.module1 !== 'complete') return;

    const now = new Date().toISOString();
    journey.tracking = journey.tracking || {};
    journey.tracking.currentModule = 'module1';
    journey.tracking.lastActivityAt = now;
    if (!journey.tracking.boostStartedAt) journey.tracking.boostStartedAt = journey.module1?.completedAt || now;
    journey.module1 = journey.module1 || {};
    journey.module1.completedAt = journey.module1.completedAt || now;
    writeJourney(journey);

    try { await window.BOOSTCloud?.flush?.(); } catch (_) {}
    document.dispatchEvent(new CustomEvent('boostprogress',{detail:{moduleId:'module1',status:'complete'}}));

    const status = document.getElementById('saveStatus');
    if (status) status.textContent = 'Module 1 complete. Your results are saved to BOOST. Return to the map and choose your pathway.';
    const link = document.querySelector('#completion a');
    if (link) {
      link.href = 'index.html#choose-pathway';
      link.textContent = 'Return to Map & Choose Pathway';
    }
  }

  function installCompletionSync(){
    recordModule1Entry();
    const saveBtn = document.getElementById('saveBtn');
    if (!saveBtn || saveBtn.dataset.boostCloudSync === '1') return;
    saveBtn.dataset.boostCloudSync = '1';
    saveBtn.addEventListener('click', function(){
      setTimeout(function(){ syncCompletedModule1(); }, 0);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installCompletionSync, {once:true});
  } else {
    installCompletionSync();
  }
})();
