(() => {
  const NS = window.InstaNaviReels;
  if (!NS) return;

  const bar = document.createElement('div');
  const fill = document.createElement('div');

  bar.id = 'reels-progress-bar';
  bar.appendChild(fill);

  Object.assign(bar.style, {
    position: 'fixed',
    left: '50%',
    bottom: '10px',
    transform: 'translateX(-50%)',
    width: '60vw',
    maxWidth: '520px',
    height: '3px',
    background: 'rgba(255, 255, 255, 0.25)',
    borderRadius: '999px',
    zIndex: '10000',
    pointerEvents: 'none',
    opacity: '0',
    transition: 'opacity 0.2s ease'
  });

  Object.assign(fill.style, {
    width: '100%',
    height: '100%',
    background: '#ffffff',
    borderRadius: '999px',
    transformOrigin: 'left center',
    transform: 'scaleX(0)'
  });

  document.body.appendChild(bar);

  let currentVideo = null;
  let rafId = null;

  function updateProgress() {
    if (!currentVideo || !isFinite(currentVideo.duration) || currentVideo.duration <= 0) {
      bar.style.opacity = '0';
      fill.style.transform = 'scaleX(0)';
      return;
    }

    const progress = Math.max(0, Math.min(1, currentVideo.currentTime / currentVideo.duration));
    fill.style.transform = `scaleX(${progress})`;
    bar.style.opacity = '1';
  }

  function startTick() {
    if (rafId) return;
    const tick = () => {
      updateProgress();
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
  }

  function stopTick() {
    if (!rafId) return;
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  function detachVideo() {
    if (!currentVideo) return;
    currentVideo.removeEventListener('timeupdate', updateProgress);
    currentVideo.removeEventListener('seeked', updateProgress);
    currentVideo.removeEventListener('loadedmetadata', updateProgress);
    currentVideo.removeEventListener('play', startTick);
    currentVideo.removeEventListener('pause', stopTick);
    stopTick();
    currentVideo = null;
    bar.style.opacity = '0';
    fill.style.transform = 'scaleX(0)';
  }

  function attachVideo(video) {
    if (!video || video === currentVideo) return;
    detachVideo();
    currentVideo = video;
    currentVideo.addEventListener('timeupdate', updateProgress);
    currentVideo.addEventListener('seeked', updateProgress);
    currentVideo.addEventListener('loadedmetadata', updateProgress);
    currentVideo.addEventListener('play', startTick);
    currentVideo.addEventListener('pause', stopTick);
    updateProgress();
    if (!currentVideo.paused) {
      startTick();
    }
  }

  setInterval(() => {
    const activeVideo = NS.getActiveVideo();
    if (activeVideo !== currentVideo) {
      if (activeVideo) {
        attachVideo(activeVideo);
      } else {
        detachVideo();
      }
    }
  }, 500);
})();
