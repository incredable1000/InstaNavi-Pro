// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "openNewTab") {
    // Create new tab in the background
    chrome.tabs.create({
      url: request.url,
      active: false  // This ensures the new tab opens in the background
    });
  }
});
