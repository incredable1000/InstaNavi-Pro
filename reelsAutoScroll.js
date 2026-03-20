(() => {
  const NS = window.InstaNaviReels;
  if (!NS) return;

  let currentVideo = null;
  let lastTriggeredVideo = null;
  const CHECK_INTERVAL_MS = 500;

  function getThresholdSeconds(duration) {
    if (!isFinite(duration) || duration <= 0) return 0.5;
    const dynamic = duration * 0.02;
    return Math.min(1, Math.max(0.4, dynamic));
  }

  function shouldAutoScroll(video) {
    if (!video || !isFinite(video.duration) || video.duration <= 0) return false;
    const remaining = video.duration - video.currentTime;
    return remaining <= getThresholdSeconds(video.duration);
  }

  function triggerAutoScroll(video) {
    if (!video || video === lastTriggeredVideo) return;
    lastTriggeredVideo = video;
    NS.scrollToNextVideo(video);
  }

  function onTimeUpdate() {
    if (!NS.isReelsContext()) return;
    if (shouldAutoScroll(currentVideo)) {
      triggerAutoScroll(currentVideo);
    }
  }

  function onEnded() {
    if (!NS.isReelsContext()) return;
    triggerAutoScroll(currentVideo);
  }

  function onSeeked() {
    if (!NS.isReelsContext()) return;
    if (shouldAutoScroll(currentVideo)) {
      triggerAutoScroll(currentVideo);
    }
  }

  function detachVideoListeners() {
    if (!currentVideo) return;
    currentVideo.removeEventListener('timeupdate', onTimeUpdate);
    currentVideo.removeEventListener('ended', onEnded);
    currentVideo.removeEventListener('seeked', onSeeked);
    currentVideo = null;
  }

  function attachVideoListeners(video) {
    detachVideoListeners();
    currentVideo = video;
    if (!currentVideo) return;
    currentVideo.addEventListener('timeupdate', onTimeUpdate);
    currentVideo.addEventListener('ended', onEnded);
    currentVideo.addEventListener('seeked', onSeeked);
  }

  setInterval(() => {
    if (!NS.isReelsContext()) return;
    const activeVideo = NS.getActiveVideo();
    if (activeVideo && activeVideo !== currentVideo) {
      attachVideoListeners(activeVideo);
    }
  }, CHECK_INTERVAL_MS);
})();
