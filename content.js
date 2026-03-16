// Constants
const CONSTANTS = {
  ZOOM: {
    MIN: 1,
    MAX: 4,
    STEP: 0.5
  },
  SCROLL: {
    INTERVAL: 3,
    LOAD_DELAY: 3000
  },
  VIDEO: {
    SEEK_SECONDS: 3,
    TIMEOUT: 5000
  },
  UI: {
    BUTTON_COLOR: '#0095f6',
    BUTTON_HOVER_COLOR: '#007bb5'
  }
};

// Initialize variables with proper cleanup handling
let isPaused = true;
let posts = [];
let currentVisiblePost = null;
let scrollInterval = CONSTANTS.SCROLL.INTERVAL;
let scrollTimerId;
let isFullscreen = false;
let currentGalleryIndex = 0;
let observer = null;

// Add fullscreenchange event listener to handle Escape key
document.addEventListener('fullscreenchange', function() {
  isFullscreen = !!document.fullscreenElement;
  
  // Clean up fullscreen container when exiting fullscreen
  if (!isFullscreen) {
    const container = document.getElementById('fullscreen-container');
    if (container) {
      container.remove();
    }
  }
});

// Create a container for the buttons
const buttonContainer = document.createElement("div");
buttonContainer.style.position = "fixed";
buttonContainer.style.top = "50%";
buttonContainer.style.right = "20px";
buttonContainer.style.transform = "translateY(-50%)";
buttonContainer.style.display = "flex";
buttonContainer.style.flexDirection = "column";
buttonContainer.style.gap = "10px";
buttonContainer.style.zIndex = "1000";
document.body.appendChild(buttonContainer);

// Create the Up button with an SVG icon
const upButton = document.createElement("button");
upButton.style.padding = "10px";
upButton.style.cursor = "pointer";
upButton.style.border = "none";
upButton.style.background = "transparent";
upButton.style.display = "inline-block"; // Initially show

// Add SVG for the Up button (Arrow pointing up)
upButton.innerHTML = `
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4L6 10H9V14H15V10H18L12 4Z" fill="currentColor"/>
  </svg>
`;
upButton.addEventListener("click", scrollToPreviousPost);
buttonContainer.appendChild(upButton);

// Create the pause/resume button with an SVG icon
const toggleButton = document.createElement("button");
toggleButton.style.padding = "10px";
toggleButton.style.cursor = "pointer";
toggleButton.style.border = "none";
toggleButton.style.background = "transparent";
toggleButton.style.display = "inline-block";

// Initially show Resume icon when paused
toggleButton.innerHTML = `
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
  </svg>
`;
toggleButton.addEventListener("click", toggleScrolling);
buttonContainer.appendChild(toggleButton);

// Create the Down button with an SVG icon
const downButton = document.createElement("button");
downButton.style.padding = "10px";
downButton.style.cursor = "pointer";
downButton.style.border = "none";
downButton.style.background = "transparent";
downButton.style.display = "inline-block"; // Initially show

// Add SVG for the Down button (Arrow pointing down)
downButton.innerHTML = `
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 20L18 14H15V10H9V14H6L12 20Z" fill="currentColor"/>
  </svg>
`;
downButton.addEventListener("click", scrollToNextPost);
buttonContainer.appendChild(downButton);

// Function to show or hide the buttons based on settings
function toggleButtonsVisibility(shouldShow) {
  buttonContainer.style.display = shouldShow ? "flex" : "none";
}

// Function to scroll to the next post manually (when paused)
function scrollToNextPost() {
  // Exit full-screen mode if a video is currently in full screen
  if (document.fullscreenElement) {
    document.exitFullscreen();
  }

  currentVisiblePost = document.querySelector("article.visible");

  if (!currentVisiblePost) {
    posts[0].classList.add("visible");
    currentVisiblePost = posts[0];
  }

  const nextPost = currentVisiblePost.nextElementSibling || posts[0]; // Loop to the first post if we reach the last one

  currentVisiblePost.classList.remove("visible");
  nextPost.classList.add("visible");

  scrollToElement(nextPost);
}

// Function to scroll to the previous post manually (when paused)
function scrollToPreviousPost() {
  // Exit full-screen mode if a video is currently in full screen
  if (document.fullscreenElement) {
    document.exitFullscreen();
  }

  currentVisiblePost = document.querySelector("article.visible");

  if (!currentVisiblePost) {
    posts[0].classList.add("visible");
    currentVisiblePost = posts[0];
  }

  const prevPost =
    currentVisiblePost.previousElementSibling || posts[posts.length - 1]; // Loop to the last post if we reach the first one

  currentVisiblePost.classList.remove("visible");
  prevPost.classList.add("visible");

  scrollToElement(prevPost);
}

// Pause/Resume toggle function
function toggleScrolling() {
  isPaused = !isPaused; // Toggle the pause state

  if (isPaused) {
    // Change to Resume icon
    toggleButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
      </svg>
    `;
  } else {
    // Change to Pause icon
    toggleButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 6H10V18H6V6ZM14 6H18V18H14V6Z" fill="currentColor"/>
      </svg>
    `;
    autoScroll(); // Start auto-scrolling when resumed
  }
}

// Function to start auto-scrolling
function autoScroll() {
  clearInterval(scrollTimerId); // Clear any existing interval
  scrollTimerId = setInterval(() => {
    if (!isPaused) {
      scrollToNextPost();
    }
  }, scrollInterval * 1000);
}

// Function to scroll to a specific element (post) using pixel offsets
function scrollToElement(post) {
  const rect = post.getBoundingClientRect();
  const postTop = rect.top + window.scrollY; // Get the top position of the post relative to the page

  window.scrollTo({
    top: postTop - 10, // Scroll to the top of the post (with a small offset for margin)
    behavior: "instant",
  });
}

// Function to detect and navigate through carousel/gallery posts
function navigateGallery(direction) {
  currentVisiblePost = document.querySelector("article.visible");

  if (!currentVisiblePost) return;

  // Find the Next or Previous button in the carousel
  const nextButton = currentVisiblePost.querySelector('[aria-label="Next"]');
  const prevButton = currentVisiblePost.querySelector('[aria-label="Go back"]');

  if (nextButton && direction === "next") {
    nextButton.click(); // Click the next button to move to the next image
  } else if (prevButton && direction === "prev") {
    prevButton.click(); // Click the previous button to move to the previous image
  }
}

// Function to get current gallery index
function getCurrentGalleryIndex() {
  const mediaElements = getGalleryMedia();
  if (mediaElements.length === 0) return 0;

  // Find the element that's most visible (closest to center)
  const viewportCenter = window.innerWidth / 2;
  let closestElement = 0;
  let minDistance = Infinity;

  mediaElements.forEach((element, index) => {
    const rect = element.getBoundingClientRect();
    const elementCenter = rect.left + (rect.width / 2);
    const distance = Math.abs(elementCenter - viewportCenter);
    if (distance < minDistance) {
      minDistance = distance;
      closestElement = index;
    }
  });

  return closestElement;
}

// Function to get all gallery media (images and videos)
function getGalleryMedia() {
  const currentVisiblePost = document.querySelector("article.visible");
  if (!currentVisiblePost) return [];

  // Get all media elements in the post
  const mediaElements = [];
  
  // Get all images
  const images = Array.from(currentVisiblePost.querySelectorAll('img'))
    .filter(img => {
      // Filter out small images and profile pictures
      const rect = img.getBoundingClientRect();
      return rect.width > 100 && rect.height > 100 && !img.alt.includes('profile picture');
    });

  // Get all videos
  const videos = Array.from(currentVisiblePost.querySelectorAll('video'));
  
  // Combine both and sort by position
  mediaElements.push(...images, ...videos);
  
  // Sort by position (left to right)
  mediaElements.sort((a, b) => {
    const rectA = a.getBoundingClientRect();
    const rectB = b.getBoundingClientRect();
    return rectA.left - rectB.left;
  });

  return mediaElements;
}

// Function to navigate gallery in fullscreen mode
async function navigateGalleryFullscreen(direction) {
  const fullscreenContainer = document.getElementById('fullscreen-container');
  if (!fullscreenContainer || !isFullscreen) return;

  const mediaElements = getGalleryMedia();
  if (mediaElements.length <= 1) return;

  // Update current index
  if (direction === "next") {
    if (currentGalleryIndex < mediaElements.length - 1) {
      currentGalleryIndex++;
    }
  } else {
    if (currentGalleryIndex > 0) {
      currentGalleryIndex--;
    }
  }

  // Click the gallery button to keep the UI in sync
  const currentVisiblePost = document.querySelector("article.visible");
  if (direction === "next") {
    const nextButton = currentVisiblePost.querySelector('[aria-label="Next"]');
    if (nextButton) nextButton.click();
  } else {
    const prevButton = currentVisiblePost.querySelector('[aria-label="Go back"]');
    if (prevButton) prevButton.click();
  }

  // Update fullscreen content
  const currentElement = mediaElements[currentGalleryIndex];
  if (!currentElement) return;

  try {
    // Handle video
    if (currentElement.tagName.toLowerCase() === 'video') {
      const fullscreenVideo = await setupFullscreenVideo(currentElement, fullscreenContainer);
      if (fullscreenVideo) {
        // Try to play the video
        await tryPlayVideo(fullscreenVideo, fullscreenContainer);
      }
    } else {
      // Handle image (unchanged)
      const fullscreenImage = fullscreenContainer.querySelector('img') || document.createElement('img');
      fullscreenImage.style.cssText = `
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      `;

      // Get highest resolution URL
      let imageUrl;
      if (currentElement.srcset) {
        const srcsetUrls = currentElement.srcset.split(',')
          .map(src => {
            const [url, width] = src.trim().split(' ');
            return { url, width: parseInt(width || '0') };
          })
          .sort((a, b) => b.width - a.width);
        
        imageUrl = srcsetUrls[0]?.url || currentElement.src;
      } else {
        imageUrl = currentElement.src.replace(/\w\d+x\d+\//, '');
      }

      // Update the fullscreen image
      fullscreenImage.onerror = () => {
        if (imageUrl !== currentElement.src) {
          fullscreenImage.src = currentElement.src;
        }
      };
      fullscreenImage.onload = () => {
        setupImageZoom(fullscreenImage); // Setup zoom after image loads
      };
      fullscreenImage.src = imageUrl;

      // Ensure the image is in the container
      if (!fullscreenImage.parentElement) {
        fullscreenContainer.innerHTML = '';
        fullscreenContainer.appendChild(fullscreenImage);
      }
    }
  } catch (error) {
    // Handle error silently
  }
}

// Improved video setup with better error handling and performance
async function setupFullscreenVideo(originalVideo, container) {
  try {
    // If already in fullscreen, exit
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return originalVideo;
    }

    // Request fullscreen on the video element
    await originalVideo.requestFullscreen();
    
    // Add controls while in fullscreen
    originalVideo.controls = true;
    
    // Wait a bit for the fullscreen transition and try to play
    setTimeout(async () => {
      try {
        // Try to play the video
        await originalVideo.play();
      } catch (e) {
        console.warn('Autoplay failed:', e);
        // If autoplay fails, try one more time with user interaction
        originalVideo.addEventListener('click', () => {
          originalVideo.play().catch(err => console.warn('Play failed:', err));
        }, { once: true });
      }
    }, 100);

    // Remove controls when exiting fullscreen
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        originalVideo.controls = false;
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
      }
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return originalVideo;
  } catch (error) {
    console.warn('Error in setupFullscreenVideo:', error);
    return null;
  }
}

// Improved image zoom functionality with better performance
function setupImageZoom(fullscreenImage) {
  let currentZoom = CONSTANTS.ZOOM.MIN;
  let lastX = 0;
  let lastY = 0;
  let isDragging = false;
  let transformX = 0;
  let transformY = 0;
  let rafId = null; // For requestAnimationFrame

  // Use transform matrix for better performance
  function updateTransform() {
    if (rafId) return; // Don't schedule multiple updates
    
    rafId = requestAnimationFrame(() => {
      fullscreenImage.style.transform = `matrix(${currentZoom}, 0, 0, ${currentZoom}, ${transformX}, ${transformY})`;
      rafId = null;
    });
  }

  function resetImagePosition(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    currentZoom = CONSTANTS.ZOOM.MIN;
    transformX = 0;
    transformY = 0;
    
    fullscreenImage.style.transition = 'transform 0.2s ease-out';
    updateTransform();
    
    setTimeout(() => {
      fullscreenImage.style.transition = 'none';
    }, 200);
  }

  function constrainBounds() {
    const container = fullscreenImage.parentElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const rect = fullscreenImage.getBoundingClientRect();

    const imageWidth = rect.width * currentZoom;
    const imageHeight = rect.height * currentZoom;
    
    const minX = Math.min(0, containerRect.width - imageWidth);
    const minY = Math.min(0, containerRect.height - imageHeight);
    
    transformX = Math.min(0, Math.max(minX, transformX));
    transformY = Math.min(0, Math.max(minY, transformY));
  }

  const handleZoom = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const container = fullscreenImage.parentElement;
    if (!container) return;

    const rect = fullscreenImage.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    const mouseX = event.clientX - containerRect.left;
    const mouseY = event.clientY - containerRect.top;
    
    const imageX = mouseX - transformX;
    const imageY = mouseY - transformY;
    
    const zoomDirection = event.deltaY < 0 ? 1 : -1;
    const oldZoom = currentZoom;
    currentZoom = Math.max(
      CONSTANTS.ZOOM.MIN,
      Math.min(CONSTANTS.ZOOM.MAX, currentZoom + (CONSTANTS.ZOOM.STEP * zoomDirection))
    );

    if (currentZoom !== oldZoom) {
      const scaleFactor = currentZoom / oldZoom;
      const newImageX = imageX * scaleFactor;
      const newImageY = imageY * scaleFactor;
      
      transformX = mouseX - newImageX;
      transformY = mouseY - newImageY;

      if (currentZoom === CONSTANTS.ZOOM.MIN) {
        resetImagePosition();
      } else {
        constrainBounds();
        updateTransform();
      }
    }
  };

  const handleDragStart = (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (currentZoom > CONSTANTS.ZOOM.MIN) {
      isDragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      fullscreenImage.style.cursor = 'grabbing';
      
      document.body.style.userSelect = 'none';
    }
  };

  const handleDragMove = (event) => {
    if (!isDragging) return;
    
    event.preventDefault();
    event.stopPropagation();

    const deltaX = event.clientX - lastX;
    const deltaY = event.clientY - lastY;
    
    lastX = event.clientX;
    lastY = event.clientY;

    transformX += deltaX;
    transformY += deltaY;

    constrainBounds();
    updateTransform();
  };

  const handleDragEnd = () => {
    isDragging = false;
    fullscreenImage.style.cursor = currentZoom > CONSTANTS.ZOOM.MIN ? 'grab' : 'default';
    document.body.style.userSelect = '';
  };

  // Set initial styles
  Object.assign(fullscreenImage.style, {
    transformOrigin: '0 0',
    cursor: 'default',
    transition: 'none',
    touchAction: 'none'
  });

  // Add event listeners with passive option where appropriate
  fullscreenImage.addEventListener('wheel', handleZoom, { passive: false });
  fullscreenImage.addEventListener('mousedown', handleDragStart);
  window.addEventListener('mousemove', handleDragMove, { passive: false });
  window.addEventListener('mouseup', handleDragEnd);
  window.addEventListener('mouseleave', handleDragEnd);
  fullscreenImage.addEventListener('dragstart', e => e.preventDefault());
  fullscreenImage.addEventListener('dblclick', resetImagePosition);

  // Return cleanup function
  return () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
    
    fullscreenImage.removeEventListener('wheel', handleZoom);
    fullscreenImage.removeEventListener('mousedown', handleDragStart);
    window.removeEventListener('mousemove', handleDragMove);
    window.removeEventListener('mouseup', handleDragEnd);
    window.removeEventListener('mouseleave', handleDragEnd);
    fullscreenImage.removeEventListener('dragstart', e => e.preventDefault());
    fullscreenImage.removeEventListener('dblclick', resetImagePosition);
    
    document.body.style.userSelect = '';
  };
}

// Function to try playing video with fallbacks
function tryPlayVideo(video, container) {
  // Function to show play button with custom message
  const showPlayButton = (message = 'Click to play video') => {
    // Remove any existing play buttons first
    const existingButtons = container.querySelectorAll('.video-play-button');
    existingButtons.forEach(btn => btn.remove());

    const playButton = document.createElement('div');
    playButton.className = 'video-play-button';
    playButton.textContent = message;
    playButton.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      background: rgba(0, 0, 0, 0.7);
      padding: 15px 30px;
      border-radius: 5px;
      cursor: pointer;
      z-index: 10000;
      font-size: 16px;
      transition: background 0.3s;
    `;

    // Add hover effect
    playButton.onmouseover = () => playButton.style.background = 'rgba(0, 0, 0, 0.9)';
    playButton.onmouseout = () => playButton.style.background = 'rgba(0, 0, 0, 0.7)';

    container.appendChild(playButton);
    return playButton;
  };

  // Function to handle play attempt
  const attemptPlay = async (muted = false) => {
    video.muted = muted;
    try {
      await video.play();
      return true;
    } catch (error) {
      return false;
    }
  };

  // Main playback logic
  const startPlayback = async () => {
    // First try: unmuted autoplay
    if (await attemptPlay(false)) return;

    // Second try: muted autoplay (more likely to be allowed by browsers)
    if (await attemptPlay(true)) {
      // Show unmute button if muted playback succeeds
      const unmuteButton = showPlayButton('Click to unmute');
      unmuteButton.onclick = async () => {
        video.muted = false;
        unmuteButton.remove();
      };
      return;
    }

    // If both autoplay attempts fail, show play button
    const playButton = showPlayButton('Click to play');
    playButton.onclick = async () => {
      // Try unmuted first on click
      if (await attemptPlay(false)) {
        playButton.remove();
        return;
      }

      // If unmuted fails, try muted
      if (await attemptPlay(true)) {
        // Change to unmute button
        playButton.textContent = 'Click to unmute';
        playButton.onclick = () => {
          video.muted = false;
          playButton.remove();
        };
      } else {
        // If all attempts fail, show error message
        playButton.textContent = 'Unable to play video';
        playButton.style.background = 'rgba(255, 0, 0, 0.7)';
        setTimeout(() => playButton.remove(), 3000);
      }
    };
  };

  // Start the playback attempt process
  startPlayback().catch(error => {
    showPlayButton('Error playing video');
  });
}

// Function to seek the video 2 seconds forward or backward (renamed to avoid conflict)
function seekVideoNonFullscreen(direction) {
  try {
    // Get the video element based on fullscreen state
    let video;
    
    if (document.fullscreenElement?.tagName === 'VIDEO') {
      video = document.fullscreenElement;
    } else if (isFullscreen) {
      const container = document.getElementById('fullscreen-container');
      video = container?.querySelector('video');
    } else {
      const currentVisiblePost = document.querySelector("article.visible");
      video = currentVisiblePost?.querySelector("video");
    }
    
    if (!video) return;

    const seekAmount = CONSTANTS.VIDEO.SEEK_SECONDS;
    const currentTime = video.currentTime;
    const duration = video.duration;
    
    // Calculate new time with bounds checking
    const newTime = direction === "forward"
      ? Math.min(currentTime + seekAmount, isFinite(duration) ? duration : currentTime + seekAmount)
      : Math.max(0, currentTime - seekAmount);

    // Store playback state
    const wasPlaying = !video.paused;
    
    try {
      // Set the new time
      video.currentTime = newTime;
      
      // Resume playback if it was playing
      if (wasPlaying) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // If play fails, try again after a short delay
            setTimeout(() => {
              video.play().catch(console.warn);
            }, 100);
          });
        }
      }
    } catch (err) {
      console.warn('Error seeking video:', err);
      // Fallback: reload video and set time
      const currentSrc = video.src || video.currentSrc;
      if (currentSrc) {
        video.src = currentSrc;
        video.currentTime = newTime;
        if (wasPlaying) {
          video.play().catch(console.warn);
        }
      }
    }
  } catch (error) {
    console.warn('Error in seekVideo:', error);
  }
}

// Improved posts query with cleanup
function updatePosts() {
  const newPosts = document.querySelectorAll("article");
  if (newPosts.length !== posts.length) {
    posts = newPosts;
  }
}

// Debounced scroll handler
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Improved video seeking with error boundaries
function seekVideo(direction) {
  try {
    let video;
    if (isFullscreen) {
      video = document.fullscreenElement?.tagName === 'VIDEO' ? document.fullscreenElement : null;
    } else {
      video = document.querySelector("article.visible video");
    }
    
    if (!video) return;

    const seekAmount = CONSTANTS.VIDEO.SEEK_SECONDS;
    const currentTime = video.currentTime;
    const duration = video.duration;
    
    // Calculate new time with bounds checking
    const newTime = direction === "forward"
      ? Math.min(currentTime + seekAmount, isFinite(duration) ? duration : currentTime + seekAmount)
      : Math.max(0, currentTime - seekAmount);

    // Store playback state
    const wasPlaying = !video.paused;
    
    try {
      video.currentTime = newTime;
      if (wasPlaying) {
        video.play();
      }
    } catch (err) {
      // Fallback: reload video and set time
      const currentSrc = video.src || video.currentSrc;
      if (currentSrc) {
        video.src = currentSrc;
        video.currentTime = newTime;
        if (wasPlaying) {
          video.play();
        }
      }
    }
  } catch (error) {
    // Handle error silently
  }
}

// Improved scroll to top button with proper transform
const scrollToTopButton = document.createElement("button");
scrollToTopButton.id = "scrollToTopButton";

// SVG icon for the button
const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-up">
    <line x1="12" y1="19" x2="12" y2="5"></line>
    <line x1="5" y1="12" x2="12" y2="5"></line>
    <line x1="19" y1="12" x2="12" y2="5"></line>
</svg>
`;

// Set the inner HTML of the button to include the SVG icon
scrollToTopButton.innerHTML = svgIcon;

// Append the button to the body
document.body.appendChild(scrollToTopButton);

// Add styles to the button
Object.assign(scrollToTopButton.style, {
  position: "fixed",
  bottom: "20px",
  right: "20px",
  zIndex: "1000",
  padding: "10px 15px",
  backgroundColor: CONSTANTS.UI.BUTTON_COLOR,
  color: "#ffffff",
  border: "none",
  borderRadius: "25px",
  cursor: "pointer",
  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.3)",
  fontSize: "16px",
  display: "flex",
  alignItems: "center",
  transition: "all 0.3s ease"
});

// Proper event cleanup for scroll to top button
const scrollToTopEvents = {
  click: () => window.scrollTo({ top: 0, behavior: "smooth" }),
  mouseover: () => scrollToTopButton.style.backgroundColor = CONSTANTS.UI.BUTTON_HOVER_COLOR,
  mouseout: () => scrollToTopButton.style.backgroundColor = CONSTANTS.UI.BUTTON_COLOR,
  mousedown: () => scrollToTopButton.style.transform = "scale(0.95)",
  mouseup: () => scrollToTopButton.style.transform = "scale(1)"
};

Object.entries(scrollToTopEvents).forEach(([event, handler]) => {
  scrollToTopButton.addEventListener(event, handler);
});

// Cleanup function
function cleanup() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  
  if (scrollTimerId) {
    clearInterval(scrollTimerId);
  }
  
  Object.entries(scrollToTopEvents).forEach(([event, handler]) => {
    scrollToTopButton.removeEventListener(event, handler);
  });
  
  scrollToTopButton.remove();
}

// Improved keyboard event handling with better performance
const keyboardShortcuts = {
  'ArrowUp': (event) => {
    event.preventDefault();
    if (isPaused) scrollToPreviousPost();
  },
  'ArrowDown': (event) => {
    event.preventDefault();
    if (isPaused) scrollToNextPost();
  },
  ' ': (event) => {
    event.preventDefault();
    toggleScrolling();
  },
  'ArrowRight': async (event) => {
    event.preventDefault();
    
    if (event.ctrlKey && isFullscreen) {
      await navigateGalleryFullscreen("next");
      return;
    }
    
    const currentVisiblePost = document.querySelector("article.visible");
    const hasGalleryButtons = currentVisiblePost?.querySelector('[aria-label="Next"]');
    const video = currentVisiblePost?.querySelector("video");
    
    if (isFullscreen && document.getElementById('fullscreen-container')?.querySelector('video')) {
      seekVideo("forward"); // Use the improved seekVideo for fullscreen
    } else if (hasGalleryButtons && !isFullscreen) {
      navigateGallery("next");
    } else if (video) {
      seekVideo("forward"); // Use the improved seekVideo for non-fullscreen
    }
  },
  'ArrowLeft': async (event) => {
    event.preventDefault();
    
    if (event.ctrlKey && isFullscreen) {
      await navigateGalleryFullscreen("prev");
      return;
    }
    
    const currentVisiblePost = document.querySelector("article.visible");
    const hasGalleryButtons = currentVisiblePost?.querySelector('[aria-label="Go back"]');
    const video = currentVisiblePost?.querySelector("video");
    
    if (isFullscreen && document.getElementById('fullscreen-container')?.querySelector('video')) {
      seekVideo("backward"); // Use the improved seekVideo for fullscreen
    } else if (hasGalleryButtons && !isFullscreen) {
      navigateGallery("prev");
    } else if (video) {
      seekVideo("backward"); // Use the improved seekVideo for non-fullscreen
    }
  },
  'Enter': async (event) => {
    event.preventDefault();
    await toggleMediaFullscreen(event);
  },
  'Shift': (event) => {
    event.preventDefault();
    if (!isFullscreen) {
      openProfileInNewTab();
    }
  }
};

// Add keyboard event listener with improved handling
document.addEventListener("keydown", (event) => {
  const handler = keyboardShortcuts[event.key];
  if (handler) {
    handler(event);
  }
});

// Improved Chrome storage handling with error boundaries
const storageHandlers = {
  scrollTimer: (value) => {
    scrollInterval = value;
    autoScroll();
  },
  showButtons: (value) => {
    toggleButtonsVisibility(value);
  }
};

// Listen for changes in chrome storage with error handling
chrome.storage.onChanged.addListener((changes) => {
  Object.entries(changes).forEach(([key, { newValue }]) => {
    const handler = storageHandlers[key];
    if (handler) {
      try {
        handler(newValue);
      } catch (error) {
        // Handle error silently
      }
    }
  });
});

// Load initial settings with error handling
async function loadInitialSettings() {
  try {
    const data = await chrome.storage.local.get(['scrollTimer', 'showButtons']);
    if (data.scrollTimer) {
      scrollInterval = data.scrollTimer;
    }
    toggleButtonsVisibility(data.showButtons !== false);
  } catch (error) {
    // Handle error silently
    // Use defaults
    scrollInterval = CONSTANTS.SCROLL.INTERVAL;
    toggleButtonsVisibility(true);
  }
}

// Initialize the extension with proper error handling
async function initializeExtension() {
  try {
    // Load settings
    await loadInitialSettings();
    
    // Initialize the page by ensuring posts are loaded
    ensurePostsLoaded();

    // Setup observers
    observer = new MutationObserver(debounce(updatePosts, 100));
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Ensure posts are loaded
    await new Promise(resolve => {
      setTimeout(() => {
        updatePosts();
        if (posts.length > 0) {
          startFirstVisiblePost();
        }
        resolve();
      }, CONSTANTS.SCROLL.LOAD_DELAY);
    });
  } catch (error) {
    // Handle error silently
  }
}

// Start initialization
initializeExtension();

// Cleanup on extension unload
chrome.runtime.onSuspend?.addListener(() => {
  try {
    cleanup();
  } catch (error) {
    // Handle error silently
  }
});

// Function to open profile in new tab
function openProfileInNewTab() {
  const currentVisiblePost = document.querySelector("article.visible");
  
  if (!currentVisiblePost) return;
  
  // Find the header section of the post which contains the profile link
  const profileLink = currentVisiblePost.querySelector('a');
  
  if (profileLink) {
    const profileUrl = profileLink.href;
    // Create a new tab in the background
    chrome.runtime.sendMessage({
      action: "openNewTab",
      url: profileUrl,
      active: false  // This ensures the new tab opens in the background
    });
  }
}

// Ensure the posts are loaded before attempting to interact
function ensurePostsLoaded() {
  setTimeout(() => {
    posts = document.querySelectorAll("article"); // Re-fetch posts after waiting
    startFirstVisiblePost(); // Make sure to start with the first post as visible
  }, CONSTANTS.SCROLL.LOAD_DELAY); // Wait for 3 seconds to ensure page content is fully loaded
}

// Start by setting the first post as visible
function startFirstVisiblePost() {
  if (posts && posts.length > 0) {
    posts[0].classList.add("visible");
    currentVisiblePost = posts[0];
  }
}

// MutationObserver to detect dynamically loaded posts (Instagram often loads posts dynamically)
observer = new MutationObserver(() => {
  posts = document.querySelectorAll("article"); // Re-fetch the posts when new posts are added to the page
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Function to check if we're on a post page
function isPostPage() {
  return window.location.pathname.startsWith('/p/');
}

// Function to get the main media element on a post page
function getPostPageMedia() {
  if (!isPostPage()) return null;
  
  // Try to find the main image or video in the dialog
  const dialog = document.querySelector('div[role=dialog]');
  if (!dialog) return null;

  // First try to find a video
  const video = dialog.querySelector('video._aagv');
  if (video) return video;

  // Then try to find the main image
  const image = dialog.querySelector('img._aagt');
  if (image) return image;
  
  return null;
}

// Handle keydown events for the entire page
document.addEventListener('keydown', async (event) => {
  // Only handle Enter key
  if (event.key !== 'Enter') return;

  // Check if we're on a post page
  if (isPostPage()) {
    const mediaElement = getPostPageMedia();
    if (!mediaElement) return;

    event.preventDefault();
    event.stopPropagation();

    // Exit fullscreen if already in fullscreen mode
    if (document.fullscreenElement) {
      document.exitFullscreen();
      isFullscreen = false;
      return;
    }

    // Create or get fullscreen container
    let fullscreenContainer = document.getElementById('fullscreen-container');
    if (!fullscreenContainer) {
      fullscreenContainer = document.createElement('div');
      fullscreenContainer.id = 'fullscreen-container';
      fullscreenContainer.style.cssText = `
        background: black;
        width: 100vw;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 2147483647;
      `;
      document.body.appendChild(fullscreenContainer);
    } else {
      fullscreenContainer.innerHTML = '';
    }

    try {
      if (mediaElement.tagName.toLowerCase() === 'video') {
        const fullscreenVideo = await setupFullscreenVideo(mediaElement, fullscreenContainer);
        if (fullscreenVideo) {
          await fullscreenContainer.requestFullscreen();
          isFullscreen = true;
          await tryPlayVideo(fullscreenVideo, fullscreenContainer);
        }
      } else {
        const fullscreenImage = document.createElement('img');
        fullscreenImage.style.cssText = `
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        `;

        // Get highest resolution URL
        let imageUrl = mediaElement.src;
        if (mediaElement.srcset) {
          const srcsetUrls = mediaElement.srcset.split(',')
            .map(src => {
              const [url, width] = src.trim().split(' ');
              return { url, width: parseInt(width || '0') };
            })
            .sort((a, b) => b.width - a.width);
          
          imageUrl = srcsetUrls[0]?.url || mediaElement.src;
        }

        fullscreenImage.onerror = () => {
          if (imageUrl !== mediaElement.src) {
            fullscreenImage.src = mediaElement.src;
          }
        };
        fullscreenImage.onload = () => {
          setupImageZoom(fullscreenImage);
        };
        fullscreenImage.src = imageUrl;

        fullscreenContainer.appendChild(fullscreenImage);
        await fullscreenContainer.requestFullscreen();
        isFullscreen = true;
      }
    } catch (error) {
      // Handle error silently
    }
  } else {
    // Handle feed page media using existing toggleMediaFullscreen
    toggleMediaFullscreen(event);
  }
});

// Function to handle the full-screen toggle for media (video or image)
async function toggleMediaFullscreen(event) {
  const currentVisiblePost = document.querySelector("article.visible");
  if (!currentVisiblePost) return;

  // Prevent event propagation to gallery navigation
  event.stopPropagation();

  // Update current gallery index when entering fullscreen
  if (!document.fullscreenElement) {
    currentGalleryIndex = getCurrentGalleryIndex();
  }

  const mediaElements = getGalleryMedia();
  if (mediaElements.length === 0) return;

  const currentElement = mediaElements[currentGalleryIndex];
  if (!currentElement) return;

  // Exit fullscreen if already in fullscreen mode
  if (document.fullscreenElement) {
    document.exitFullscreen();
    isFullscreen = false;
    return;
  }

  // Create or get fullscreen container
  let fullscreenContainer = document.getElementById('fullscreen-container');
  if (!fullscreenContainer) {
    fullscreenContainer = document.createElement('div');
    fullscreenContainer.id = 'fullscreen-container';
    fullscreenContainer.style.cssText = `
      background: black;
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 2147483647;
    `;
    document.body.appendChild(fullscreenContainer);
  } else {
    fullscreenContainer.innerHTML = '';
  }

  try {
    // Handle video
    if (currentElement.tagName.toLowerCase() === 'video') {
      // Stop any existing video playback
      const existingVideo = currentElement;
      if (!existingVideo.paused) {
        existingVideo.pause();
      }

      const fullscreenVideo = await setupFullscreenVideo(currentElement, fullscreenContainer);
      if (fullscreenVideo) {
        // Request fullscreen first
        await fullscreenContainer.requestFullscreen();
        isFullscreen = true;
        
        // Then try to play
        await tryPlayVideo(fullscreenVideo, fullscreenContainer);
      }
    } else {
      // Handle image
      const fullscreenImage = fullscreenContainer.querySelector('img') || document.createElement('img');
      fullscreenImage.style.cssText = `
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      `;

      // Get highest resolution URL
      let imageUrl;
      if (currentElement.srcset) {
        const srcsetUrls = currentElement.srcset.split(',')
          .map(src => {
            const [url, width] = src.trim().split(' ');
            return { url, width: parseInt(width || '0') };
          })
          .sort((a, b) => b.width - a.width);
        
        imageUrl = srcsetUrls[0]?.url || currentElement.src;
      } else {
        imageUrl = currentElement.src.replace(/\w\d+x\d+\//, '');
      }

      // Update the fullscreen image
      fullscreenImage.onerror = () => {
        if (imageUrl !== currentElement.src) {
          fullscreenImage.src = currentElement.src;
        }
      };
      fullscreenImage.onload = () => {
        setupImageZoom(fullscreenImage); // Setup zoom after image loads
      };
      fullscreenImage.src = imageUrl;

      // Ensure the image is in the container
      if (!fullscreenImage.parentElement) {
        fullscreenContainer.innerHTML = '';
        fullscreenContainer.appendChild(fullscreenImage);
      }

      // Request fullscreen
      await fullscreenContainer.requestFullscreen();
      isFullscreen = true;
    }
  } catch (error) {
    // Handle error silently
  }
}
