// popup.js

document.addEventListener("DOMContentLoaded", () => {
  const activateCheckbox = document.getElementById("activate");
  const intervalInput = document.getElementById("interval");
  const saveButton = document.getElementById("save-btn");
  const statusDiv = document.getElementById("status");

  let currentUrlKey;
  let refreshSettings = {};

  // Load settings
  chrome.storage.local.get("refreshSettings", (data) => {
    if (data.refreshSettings) {
      refreshSettings = data.refreshSettings;
    }
    initialize();
  });

  // Initialize the popup with current page settings
  function initialize() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0].url;
      currentUrlKey = normalizeUrl(url);

      const setting = refreshSettings[currentUrlKey];
      if (setting) {
        activateCheckbox.checked = setting.active;
        intervalInput.value = setting.interval;
      } else {
        intervalInput.value = 60;
      }
    });
  }

  // Save settings when the user clicks the save button
  saveButton.addEventListener("click", () => {
    const interval = parseInt(intervalInput.value);
    if (isNaN(interval) || interval < 1) {
      statusDiv.textContent = "Please enter a valid interval (minimum 1 second).";
      return;
    }

    refreshSettings[currentUrlKey] = {
      active: activateCheckbox.checked,
      interval: interval
    };

    chrome.runtime.sendMessage({ type: "updateSettings", settings: refreshSettings }, (response) => {
      if (response.status === "success") {
        statusDiv.textContent = "Settings saved.";
      }
    });
  });

  // Helper function to normalize URL
  function normalizeUrl(url) {
    try {
      const parsedUrl = new URL(url);
      return `${parsedUrl.origin}${parsedUrl.pathname}`;
    } catch (e) {
      return url;
    }
  }
});
