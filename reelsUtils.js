(() => {
  const NS = window.InstaNaviReels || {};
  window.InstaNaviReels = NS;

  function isEditableTarget(target) {
    if (!target) return false;
    const tagName = target.tagName?.toLowerCase();
    return (
      target.isContentEditable ||
      tagName === 'input' ||
      tagName === 'textarea' ||
      tagName === 'select'
    );
  }

  function isReelsContext() {
    const path = window.location.pathname || '';
    if (path.startsWith('/reel/') || path.startsWith('/reels/')) {
      return true;
    }
    return false;
  }

  function getCandidateVideos() {
    const videos = Array.from(document.querySelectorAll('video'));
    return videos.filter((video) => {
      const rect = video.getBoundingClientRect();
      return rect.width >= 120 && rect.height >= 120;
    });
  }

  function getActiveVideo() {
    const videos = getCandidateVideos();
    if (videos.length === 0) return null;

    const viewportLeft = 0;
    const viewportTop = 0;
    const viewportRight = window.innerWidth;
    const viewportBottom = window.innerHeight;

    let bestVideo = null;
    let bestArea = 0;

    videos.forEach((video) => {
      const rect = video.getBoundingClientRect();
      const intersectWidth = Math.max(
        0,
        Math.min(rect.right, viewportRight) - Math.max(rect.left, viewportLeft)
      );
      const intersectHeight = Math.max(
        0,
        Math.min(rect.bottom, viewportBottom) - Math.max(rect.top, viewportTop)
      );
      const area = intersectWidth * intersectHeight;
      if (area > bestArea) {
        bestArea = area;
        bestVideo = video;
      }
    });

    return bestVideo;
  }

  function scrollToNextVideo(currentVideo) {
    const videos = getCandidateVideos().sort((a, b) => {
      const rectA = a.getBoundingClientRect();
      const rectB = b.getBoundingClientRect();
      return rectA.top - rectB.top;
    });

    if (currentVideo) {
      const currentRect = currentVideo.getBoundingClientRect();
      const nextVideo = videos.find((video) => {
        if (video === currentVideo) return false;
        const rect = video.getBoundingClientRect();
        return rect.top > currentRect.top + 20;
      });

      if (nextVideo) {
        nextVideo.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }

    window.scrollBy({ top: Math.round(window.innerHeight * 0.9), behavior: 'smooth' });
  }

  NS.isEditableTarget = isEditableTarget;
  NS.isReelsContext = isReelsContext;
  NS.getCandidateVideos = getCandidateVideos;
  NS.getActiveVideo = getActiveVideo;
  NS.scrollToNextVideo = scrollToNextVideo;
})();
