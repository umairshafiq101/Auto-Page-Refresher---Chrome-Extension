// options.js

document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#settings-table tbody");
  let refreshSettings = {};

  // Load settings
  chrome.storage.local.get("refreshSettings", (data) => {
    if (data.refreshSettings) {
      refreshSettings = data.refreshSettings;
      populateTable();
    }
  });

  // Populate the table with settings
  function populateTable() {
    tableBody.innerHTML = "";

    for (const url in refreshSettings) {
      const setting = refreshSettings[url];
      const row = document.createElement("tr");

      // URL Cell
      const urlCell = document.createElement("td");
      urlCell.textContent = url;
      row.appendChild(urlCell);

      // Active Cell
      const activeCell = document.createElement("td");
      const activeCheckbox = document.createElement("input");
      activeCheckbox.type = "checkbox";
      activeCheckbox.checked = setting.active;
      activeCheckbox.addEventListener("change", () => {
        setting.active = activeCheckbox.checked;
        saveSettings();
      });
      activeCell.appendChild(activeCheckbox);
      row.appendChild(activeCell);

      // Interval Cell
      const intervalCell = document.createElement("td");
      const intervalInput = document.createElement("input");
      intervalInput.type = "number";
      intervalInput.min = "1";
      intervalInput.value = setting.interval;
      intervalInput.addEventListener("change", () => {
        const interval = parseInt(intervalInput.value);
        if (isNaN(interval) || interval < 1) {
          alert("Please enter a valid interval (minimum 1 second).");
          intervalInput.value = setting.interval;
        } else {
          setting.interval = interval;
          saveSettings();
        }
      });
      intervalCell.appendChild(intervalInput);
      row.appendChild(intervalCell);

      // Actions Cell
      const actionsCell = document.createElement("td");
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Remove";
      deleteButton.addEventListener("click", () => {
        delete refreshSettings[url];
        saveSettings();
        row.remove();
      });
      actionsCell.appendChild(deleteButton);
      row.appendChild(actionsCell);

      tableBody.appendChild(row);
    }
  }

  // Save settings to storage and notify background script
  function saveSettings() {
    chrome.storage.local.set({ refreshSettings }, () => {
      chrome.runtime.sendMessage({ type: "updateSettings", settings: refreshSettings });
    });
  }
});
