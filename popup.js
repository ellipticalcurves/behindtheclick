document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('toggleExtension');
  const thumbnailToggle = document.getElementById('showThumbnails');
  
  // Load saved states
  chrome.storage.local.get(['enabled', 'showThumbnails'], (result) => {
    toggle.checked = result.enabled || false;
    thumbnailToggle.checked = result.showThumbnails || false;
  });
  
  // Save state and send message to content script when main toggle changed
  toggle.addEventListener('change', () => {
    const enabled = toggle.checked;
    const showThumbnails = thumbnailToggle.checked;
    chrome.storage.local.set({ enabled, showThumbnails });
    
    // Send message to active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { enabled, showThumbnails });
    });
  });

  // Handle thumbnail toggle
  thumbnailToggle.addEventListener('change', () => {
    const showThumbnails = thumbnailToggle.checked;
    chrome.storage.local.set({ showThumbnails });
    
    // Send message to active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { 
        enabled: toggle.checked, 
        showThumbnails 
      });
    });
  });
}); 