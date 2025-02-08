document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('toggleExtension');
  const thumbnailToggle = document.getElementById('showThumbnails');
  const inputImageUrl = document.getElementById('imageUrl');
  const inputImageTitle = document.getElementById('imageTitle');
  const imagePreview = document.getElementById('imagePreview'); // Add this line
  const replaceAllCheckbox = document.getElementById('replaceAll'); // Checkbox

  // Load saved states
  chrome.storage.local.get(['enabled', 'showThumbnails', 'imageUrl', 'imageTitle', 'replace'], (result) => {
    toggle.checked = result.enabled || false;
    thumbnailToggle.checked = result.showThumbnails || false;
    inputImageUrl.value = result.imageUrl || '';
    inputImageTitle.value = result.imageTitle || '';
    replaceAllCheckbox.checked = result.replace || false;
  });
  
  // Save state and send message to content script when main toggle changed
  toggle.addEventListener('change', () => {
    const enabled = toggle.checked;
    const showThumbnails = thumbnailToggle.checked;
    const replace = replaceAllCheckbox.checked;
    const imageUrl = inputImageUrl.value;
    const imageTitle = inputImageTitle.value;
    
    chrome.storage.local.set({ enabled, showThumbnails, replace, imageUrl, imageTitle });
    
    // Send message to active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { enabled, showThumbnails, replace, imageUrl, imageTitle });
    });
  });

  // Handle thumbnail toggle
  thumbnailToggle.addEventListener('change', () => {
    const showThumbnails = thumbnailToggle.checked;
    const replace = replaceAllCheckbox.checked;
    const imageUrl = inputImageUrl.value;
    const imageTitle = inputImageTitle.value;
    
    chrome.storage.local.set({ showThumbnails, replace, imageUrl, imageTitle });
    
    // Send message to active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { 
        enabled: toggle.checked, 
        showThumbnails,
        replace,
        imageUrl,
        imageTitle
      });
    });
  });

  // Handle image URL input
  inputImageUrl.addEventListener('input', () => {
    const imageUrl = inputImageUrl.value;
    chrome.storage.local.set({ imageUrl });
    imagePreview.src = imageUrl;
    imagePreview.style.display = imageUrl ? 'block' : 'none'; // Show the preview only if the URL is not empty
  });

  // Handle replace all checkbox
  replaceAllCheckbox.addEventListener('change', () => {
    const enabled = toggle.checked;
    const showThumbnails = thumbnailToggle.checked;
    const replace = replaceAllCheckbox.checked;
    const imageUrl = inputImageUrl.value;
    const imageTitle = inputImageTitle.value;
    chrome.storage.local.set({ replace });

    // Send message to active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        enabled,
        showThumbnails,
        replace,
        imageUrl,
        imageTitle
      });
    });
  });
});