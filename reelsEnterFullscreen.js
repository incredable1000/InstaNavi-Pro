(() => {
  const NS = window.InstaNaviReels;
  if (!NS) return;

  async function toggleBrowserFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        const target = document.documentElement;
        if (target?.requestFullscreen) {
          await target.requestFullscreen({ navigationUI: 'hide' });
        }
      }
    } catch (error) {
      // Ignore fullscreen errors (user gesture, permissions, etc.)
    }
  }

  function handleKeydown(event) {
    if (event.key !== 'Enter') return;
    if (NS.isEditableTarget(event.target)) return;
    if (!NS.isReelsContext()) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    toggleBrowserFullscreen();
  }

  document.addEventListener('keydown', handleKeydown, true);
})();
