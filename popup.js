document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('toggleExtension');
  const thumbnailToggle = document.getElementById('showThumbnails');
  const inputImageUrl = document.getElementById('imageUrl');
  const inputImageTitle = document.getElementById('imageTitle');
  const imagePreview = document.getElementById('imagePreview'); // Add this line
  const replaceAllCheckbox = document.getElementById('replaceAll'); // Checkbox
  const apiKeyInput = document.getElementById('apiKey'); // API key input
  const toggleanalysisEnabled = document.getElementById('analysisEnabled'); // Analysis enabled checkbox
  const toggleExplanation = document.getElementById('showAnalysis');
  // Load saved states
  chrome.storage.local.get(['enabled', 'showThumbnails', 'imageUrl', 'imageTitle', 'replace', 'apiKey', 'analysisEnabled','showAnalysis'], (result) => {
    toggle.checked = result.enabled || false;
    thumbnailToggle.checked = result.showThumbnails || false;
    inputImageUrl.value = result.imageUrl || '';
    inputImageTitle.value = result.imageTitle || '';
    replaceAllCheckbox.checked = result.replace || false;
    apiKeyInput.value = result.apiKey || ''; // Load the API key
    toggleanalysisEnabled.checked = result.analysisEnabled || false; // Load the analysis enabled state
    toggleExplanation.checked = result.showAnalysis || false;
    
    // if (result.apiKey) {
    //   chrome.storage.local.set({ apiKey }, () => {
    //       console.log("API Key saved:", apiKey);
    //       chrome.runtime.sendMessage({ type: "apiKeyUpdated", apiKey });
    //   });
    // }

    if (result.imageUrl) {
      imagePreview.src = result.imageUrl;
      imagePreview.style.display = 'block';
    } else {
      imagePreview.style.display = 'none';
    }
  });
  
  // Save state and send message to content script when main toggle changed
  toggle.addEventListener('change', () => {
    const enabled = toggle.checked;
    const showThumbnails = thumbnailToggle.checked;
    const replace = replaceAllCheckbox.checked;
    const imageUrl = inputImageUrl.value;
    const imageTitle = inputImageTitle.value;
    const analysisEnabled = toggleanalysisEnabled.checked;
    
    chrome.storage.local.set({ enabled });
    
    // Send message to active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { enabled, showThumbnails, replace, imageUrl, imageTitle, analysisEnabled });
    });
  });

  // Handle thumbnail toggle
  thumbnailToggle.addEventListener('change', () => {
    const showThumbnails = thumbnailToggle.checked;
    const replace = replaceAllCheckbox.checked;
    const imageUrl = inputImageUrl.value;
    const imageTitle = inputImageTitle.value;
    const analysisEnabled = toggleanalysisEnabled.checked;
    
    chrome.storage.local.set({ showThumbnails, replace, imageUrl, imageTitle });
    
    // Send message to active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { 
        enabled: toggle.checked, 
        showThumbnails,
        replace,
        imageUrl,
        imageTitle,
        analysisEnabled 
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
    const analysisEnabled = toggleanalysisEnabled.checked;
    chrome.storage.local.set({ replace });

    // Send message to active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        enabled,
        showThumbnails,
        replace,
        imageUrl,
        imageTitle,
        analysisEnabled 
      });
    });
  });
  
  apiKeyInput.addEventListener('input', () => {
    const apiKey = apiKeyInput.value;
    chrome.storage.local.set({ apiKey });
  });
  
  toggleanalysisEnabled.addEventListener('change', () => {
    const enabled = toggle.checked;
    const showThumbnails = thumbnailToggle.checked;
    const replace = replaceAllCheckbox.checked;
    const imageUrl = inputImageUrl.value;
    const imageTitle = inputImageTitle.value;
    const analysisEnabled = toggleanalysisEnabled.checked;  // Fix: use .checked directly

    chrome.storage.local.set({ analysisEnabled });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
            enabled,
            showThumbnails,
            replace,
            imageUrl,
            imageTitle,
            analysisEnabled
        });
    });
  });
  toggleExplanation.addEventListener('change', () => {
    const enabled = toggle.checked;
    const showThumbnails = thumbnailToggle.checked;
    const replace = replaceAllCheckbox.checked;
    const imageUrl = inputImageUrl.value;
    const imageTitle = inputImageTitle.value;
    const analysisEnabled = toggleanalysisEnabled.checked;  // Fix: use .checked direc
    const showAnalysis = toggleExplanation.checked;

    chrome.storage.local.set({ showAnalysis });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
          enabled,
          showThumbnails,
          replace,
          imageUrl,
          imageTitle,
          analysisEnabled,
          showAnalysis
        });
      });
    });
  });