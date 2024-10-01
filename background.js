// background.js

// Store user settings
let refreshSettings = {};

// Load settings from storage on startup
chrome.storage.local.get("refreshSettings", (data) => {
  if (data.refreshSettings) {
    refreshSettings = data.refreshSettings;
  }
});

// Listen for tab updates to inject content scripts
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    checkAndInject(tabId, tab.url);
  }
});

// Function to check settings and inject script
function checkAndInject(tabId, url) {
  const normalizedUrl = normalizeUrl(url);
  const setting = refreshSettings[normalizedUrl];

  if (setting && setting.active) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: setupAutoRefresh,
      args: [setting.interval]
    });
  }
}

// Function injected into the web page
function setupAutoRefresh(interval) {
  clearInterval(window.autoRefreshTimer);
  window.autoRefreshTimer = setInterval(() => {
    location.reload();
  }, interval * 1000);
}

// Normalize URL to use as key
function normalizeUrl(url) {
  try {
    const parsedUrl = new URL(url);
    return `${parsedUrl.origin}${parsedUrl.pathname}`;
  } catch (e) {
    return url;
  }
}

// Listen for messages from other parts of the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "updateSettings") {
    refreshSettings = request.settings;
    chrome.storage.local.set({ refreshSettings });
    sendResponse({ status: "success" });
  }
});
