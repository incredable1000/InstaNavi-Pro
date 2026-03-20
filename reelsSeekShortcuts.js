(() => {
  const NS = window.InstaNaviReels;
  if (!NS) return;

  const SEEK_SECONDS = 3;

  function handleKeydown(event) {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (NS.isEditableTarget(event.target)) return;
    if (!NS.isReelsContext()) return;

    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

    const video = NS.getActiveVideo();
    if (!video || !isFinite(video.duration) || video.duration <= 0) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const delta = event.key === 'ArrowRight' ? SEEK_SECONDS : -SEEK_SECONDS;
    const nextTime = Math.max(0, Math.min(video.duration, video.currentTime + delta));
    video.currentTime = nextTime;
  }

  document.addEventListener('keydown', handleKeydown, true);
})();
