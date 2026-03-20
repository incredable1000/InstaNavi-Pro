(() => {
  const NS = window.InstaNaviReels;
  if (!NS) return;

  const VOLUME_STEP = 0.1;
  const DEFAULT_VOLUME = 1;
  let preferredVolume = DEFAULT_VOLUME;
  let currentVideo = null;
  let isApplyingVolume = false;

  function clampVolume(value) {
    const normalized = Number.isFinite(value) ? value : DEFAULT_VOLUME;
    return Math.max(0, Math.min(1, normalized));
  }

  function applyVolume(video) {
    if (!video) return;
    const volume = clampVolume(preferredVolume);
    isApplyingVolume = true;
    try {
      video.volume = volume;
      video.muted = volume === 0;
    } finally {
      setTimeout(() => {
        isApplyingVolume = false;
      }, 0);
    }
  }

  function syncPreferredVolume(video) {
    if (!video) return;
    preferredVolume = clampVolume(video.volume);
  }

  function handleVideoVolumeChange() {
    if (isApplyingVolume) return;
    if (currentVideo?.muted && preferredVolume > 0) return;
    syncPreferredVolume(currentVideo);
  }

  function detachVideo() {
    if (!currentVideo) return;
    currentVideo.removeEventListener('loadedmetadata', applyVolume);
    currentVideo.removeEventListener('play', applyVolume);
    currentVideo.removeEventListener('volumechange', handleVideoVolumeChange);
    currentVideo = null;
  }

  function attachVideo(video) {
    if (!video || video === currentVideo) return;
    detachVideo();
    currentVideo = video;
    currentVideo.addEventListener('loadedmetadata', applyVolume);
    currentVideo.addEventListener('play', applyVolume);
    currentVideo.addEventListener('volumechange', handleVideoVolumeChange);
    applyVolume(currentVideo);
  }

  function handleKeydown(event) {
    if (!event.ctrlKey || event.metaKey || event.altKey) return;
    if (NS.isEditableTarget(event.target)) return;

    const key = event.key || event.code;
    if (key !== 'ArrowUp' && key !== 'ArrowDown') return;

    const video = NS.getActiveVideo();
    if (!video) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const delta = key === 'ArrowUp' ? VOLUME_STEP : -VOLUME_STEP;
    const currentVolume = Number.isFinite(video.volume) ? video.volume : preferredVolume;
    preferredVolume = clampVolume(currentVolume + delta);
    applyVolume(video);
  }

  window.addEventListener('keydown', handleKeydown, true);

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
