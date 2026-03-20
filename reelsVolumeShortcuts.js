(() => {
  const NS = window.InstaNaviReels;
  if (!NS) return;

  const VOLUME_STEP = 0.1;

  function handleKeydown(event) {
    if (!event.ctrlKey || event.metaKey || event.altKey) return;
    if (NS.isEditableTarget(event.target)) return;

    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;

    const video = NS.getActiveVideo();
    if (!video) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const delta = event.key === 'ArrowUp' ? VOLUME_STEP : -VOLUME_STEP;
    const currentVolume = Number.isFinite(video.volume) ? video.volume : 1;
    const nextVolume = Math.max(0, Math.min(1, currentVolume + delta));

    video.volume = nextVolume;
    if (nextVolume > 0) {
      video.muted = false;
    } else {
      video.muted = true;
    }
  }

  document.addEventListener('keydown', handleKeydown, true);
})();
