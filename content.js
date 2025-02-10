let isEnabled = false;
let showThumbnails = false;
let replace = false;
let imageUrl = ''//'https://i.ytimg.com/vi/fFnMrFMli1Y/hq720.jpg?sqp=-oaymwEnCNAFEJQDSFryq4qpAxkIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB&rs=AOn4CLDHCVwmOTMi-ngc_MGU-oluZluWsg';
let imageTitle = '';
let apiKey = '';
let analysisEnabled = false;
let showAnalysis = false;
const MAX_CACHE_SIZE = 100; // Maximum number of entries to store
chrome.storage.local.get(['apiKey', 'enabled', 'showThumbnails', 'imageUrl', 'imageTitle', 'replace', 'analysisEnabled', 'showAnalysis', 'analysisCache'], (result) => {
    isEnabled = result.enabled || false;
    showThumbnails = result.showThumbnails || false;
    apiKey = result.apiKey || '';
    showAnalysis = result.showAnalysis || false;
    
    // Restore cache from storage
    if (result.analysisCache) {
        analysisCache = new Map(JSON.parse(result.analysisCache));
        console.log('Restored analysis cache:', analysisCache);
    }

    if (isEnabled) {
        setGreyscale(true);
    }
    if (showAnalysis) {
        showAnalysisOverlays();
    }
    //console.log("Initial API Key loaded:", apiKey);
});

const words = ['OBEY', 'CONSUME', 'CONFORM', 'SUBMIT', 'SLEEP'];
const analysisCache = new Map();

function getRandomWord() {
    return words[Math.floor(Math.random() * words.length)];
}

function createWipeAnimation(enabled) {
    const wipe = document.createElement('div');
    wipe.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: black;
        transition: transform 0.5s ease-in;
        transform: translateY(${enabled ? '-100%' : '0'});
        z-index: 999999;
        pointer-events: none;
    `;
    document.body.appendChild(wipe);

    if (enabled) {
        // Start animation after a brief delay
        setTimeout(() => {
            wipe.style.transform = 'translateY(0)';
        }, 50);

        // Make changes when black screen is fully down
        setTimeout(() => {
            document.documentElement.style.filter = 'grayscale(100%)';
            replaceThumbnails();
            // Start the exit animation
            wipe.style.transform = 'translateY(100%)';
        }, 550);
    } else {
        // For disable, wait a moment then start sliding down
        setTimeout(() => {
            document.documentElement.style.filter = 'none';
            clearOverlays();
            wipe.style.transform = 'translateY(100%)';
        }, 50);
    }

    // Remove the wipe element after all animations
    setTimeout(() => {
        wipe.remove();
    }, 1100);
}

function setGreyscale(enabled) {
    createWipeAnimation(enabled);
}

function clearOverlays() {
    // Remove all existing overlays
    document.querySelectorAll('.white-background, .overlay-text').forEach(el => el.remove());
    document.querySelectorAll('.text-overlay-processed').forEach(el => {
        el.classList.remove('text-overlay-processed');
    });
    }

function replaceAllImages(imageUrl, imageTitle) {
    if (!imageUrl && !imageTitle) return;

    const thumbnails = document.querySelectorAll(`img[src*="ytimg.com/vi/"], img[src*="i.ytimg.com"]`);


    thumbnails.forEach(thumbnail => {
        const container = thumbnail.closest('ytd-thumbnail, ytd-reel-item-renderer');
        if (!container) return;
        const titleElement = container.closest('ytd-rich-item-renderer')?.querySelector('#video-title');
        const rawTitle = titleElement?.textContent?.trim() || 'Untitled';
        console.log(rawTitle);
        //const cacheKey = 
        
        if(!container.classList.contains('image-replaced')) {
            container.classList.add('image-replaced');
            container.style.position = 'relative';

            const newImage = document.createElement('img');
            newImage.className = 'custom-thumbnail';
            newImage.src = imageUrl;
            newImage.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                z-index: 2;
            `;
            if (imageUrl){
                thumbnail.style.visibility = 'hidden';
                container.appendChild(newImage);
            }
            //NOTE: this needs to be fixed as it actually doesn't replace the correct <a> element properly
            if (imageTitle){
                titleElement.style.visibility = 'hidden';
                const newTitle = document.createElement('div');
                newTitle.className = 'custom-title';
                newTitle.textContent = imageTitle;
                newTitle.style.cssText = `
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 100%;
                    text-align: center;
                    font-size: 1.6rem;
                    line-height: 2.2rem;
                    font-weight: 500;
                    color: var(--yt-spec-text-primary);
                    font-family: "Roboto", "Arial", sans-serif;
                    background: transparent;
                    padding: 4px;
                    max-height: 4.4rem;
                    overflow: hidden;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    text-overflow: ellipsis;
                    white-space: normal;
                    z-index: 2;
                `;
                container.appendChild(newTitle);

            }
        }
    });
}


function clearAllReplaces(){
    const replacedContainers = document.querySelectorAll('.image-replaced');
    replacedContainers.forEach(container => {
        // Find and remove the custom thumbnail
        const customThumbnail = container.querySelector('.custom-thumbnail');
        if (customThumbnail) {
            customThumbnail.remove();
        }

        // Restore the original thumbnail visibility
        const originalThumbnail = container.querySelector(`img[src*="ytimg.com/vi/"], img[src*="i.ytimg.com"]`);
        if (originalThumbnail) {
            originalThumbnail.style.visibility = 'visible';
        }
        
        const customTitle = container.querySelector('.custom-title');
        if (customTitle) {
            customTitle.remove();
        }

        // Restore original title visibility
        const titleElement = container.closest('ytd-rich-item-renderer')?.querySelector('#video-title');
        if (titleElement) {
            titleElement.style.visibility = 'visible';
        }

        // Remove the class so it can be replaced again later if needed
        container.classList.remove('image-replaced');
    });
}

function replaceThumbnails() {
    if (!isEnabled) return;

    const thumbnails = document.querySelectorAll(`
        img[src*="ytimg.com/vi/"],
        img[src*="i.ytimg.com"]
    `);
    
    thumbnails.forEach(thumbnail => {
        const container = thumbnail.closest('ytd-thumbnail, ytd-reel-item-renderer');
        if (!container) return;

        const titleElement = container.closest('ytd-rich-item-renderer')?.querySelector('#video-title');
        const rawTitle = titleElement?.textContent?.trim() || 'Untitled';
        const cacheKey = rawTitle;
        analysisCache
        if (!container.classList.contains('text-overlay-processed')) {
            container.classList.add('text-overlay-processed');
            container.style.position = 'relative';
            
            // Create white background when thumbnails are hidden
            const whiteBackground = document.createElement('div');
            whiteBackground.className = 'white-background';
            whiteBackground.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: white;
                z-index: 1;
                display: ${showThumbnails ? 'none' : 'block'};
            `;
            
            // Create text overlay
            const overlay = document.createElement('div');
            overlay.className = 'overlay-text';
            
            overlay.textContent = getRandomWord();
            
            const isShorts = thumbnail.closest('ytd-reel-item-renderer') !== null;
            
            overlay.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: ${showThumbnails ? 'white' : 'black'};
                font-size: ${isShorts ? '32px' : '48px'};
                font-weight: bold;
                font-family: Impact, sans-serif;
                text-align: center;
                pointer-events: none;
                z-index: 2;
                letter-spacing: 2px;
                width: 90%;
                word-wrap: break-word;
                margin: 0;
                padding: 0;
                text-shadow: ${showThumbnails ? '2px 2px 4px rgba(0, 0, 0, 0.9)' : 'none'};
                mix-blend-mode: ${showThumbnails ? 'overlay' : 'normal'};
            `;
            
            container.appendChild(whiteBackground);
            container.appendChild(overlay);
        } else {
            // Update existing elements when show thumbnails setting changes
            const whiteBackground = container.querySelector('.white-background');
            const overlay = container.querySelector('.overlay-text');
            
            if (whiteBackground && overlay) {
                whiteBackground.style.display = showThumbnails ? 'none' : 'block';
                overlay.style.color = showThumbnails ? 'white' : 'black';
                overlay.style.textShadow = showThumbnails ? '2px 2px 4px rgba(0, 0, 0, 0.9)' : 'none';
                overlay.style.mixBlendMode = showThumbnails ? 'overlay' : 'normal';
            }
        }
    });
}

function trimCache() {
    if (analysisCache.size > MAX_CACHE_SIZE) {
        // Convert to array, sort by timestamp, and keep only the most recent entries
        const entries = Array.from(analysisCache.entries());
        const trimmed = entries.slice(-MAX_CACHE_SIZE);
        analysisCache = new Map(trimmed);
        
        // Update storage with trimmed cache
        chrome.storage.local.set({ 
            analysisCache: JSON.stringify(trimmed) 
        });
        console.log(`Cache trimmed to ${analysisCache.size} entries`);
    }
}

async function analyzeWithGroq(text, cacheKey) {

    if (analysisCache.has(cacheKey)) {
        return analysisCache.get(cacheKey);
    }

    // Add debug logging
    //console.log('Current API key:', apiKey);
    
    if (!apiKey || apiKey.trim() === '') {
        console.log('GROQ API key not provided or empty');
        return getRandomWord();
    }
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'mixtral-8x7b-32768',
            messages: [{
                role: "user",
                content: `Analyze this YouTube video title from an ideological perspective: "${text}"
                    Provide your response in this exact JSON format:
                    {
                        "summary": "SHORT UNIQUE CRITIQUE IN CAPS (1-3 words)",
                        "analysis": "2-3 sentence critical analysis of ideological messaging",
                        "impact": "One sentence about potential societal impact"
                    }
                    Make the summary a powerful and UNIQUE short phrase that critiques the underlying ideology.
                    Never repeat the same summary twice. Examples: "CONSUME NOW", "STAY ASLEEP", "OBEY AUTHORITY", "CONFORM OR DIE".
                    Keep it under 3 words and impactful. Must be in caps. Must be unique. OUTPUT AS ONLY JSON.`
            }],
            temperature: 0.9,
            top_p: 0.95,
            max_tokens: 250
        })
    });

    const responseData = await response.json();
    const result = responseData.choices[0]?.message?.content;
    
    if (result) {
        let parsed;
        
        try{
            parsed = JSON.parse(result);
            if (!parsed || typeof parsed !== 'object') {
                throw new Error('Invalid response format');
            }
            
            // Save to cache and persist
            analysisCache.set(text, parsed);
            trimCache(); // Add cache size check
            // Convert Map to array for storage
            const cacheArray = Array.from(analysisCache.entries());
            chrome.storage.local.set({ 
                analysisCache: JSON.stringify(cacheArray) 
            });
            
            return parsed;
        } catch (error){
            console.error('Invalid JSON response:', error);
            console.log(result);
            throw new Error('Invalid JSON response from API');
        
        }

        analysisCache.set(text, parsed);
        return parsed;
    }

    console.log(result);
    return result;
}


async function replaceThumbnailsWithAnalysis(analysisEnabled) {
    if (!isEnabled) return;

    const thumbnails = Array.from(document.querySelectorAll(`
        img[src*="ytimg.com/vi/"],
        img[src*="i.ytimg.com"]
    `));

    // Map to store promises for each thumbnail
    const updates = thumbnails.map(async (thumbnail) => {
        const container = thumbnail.closest('ytd-thumbnail, ytd-reel-item-renderer');
        if (!container || container.classList.contains('text-overlay-processed')) {
            return;
        }

        const titleElement = container.closest('ytd-rich-item-renderer')?.querySelector('#video-title');
        const rawTitle = titleElement?.textContent?.trim() || 'Untitled';
        const cacheKey = rawTitle;

        // Mark as processed and set up container
        container.classList.add('text-overlay-processed');
        container.style.position = 'relative';

        // Create and append white background
        const whiteBackground = document.createElement('div');
        whiteBackground.className = 'white-background';
        whiteBackground.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: white;
            z-index: 1;
            display: ${showThumbnails ? 'none' : 'block'};
        `;
        
        // Create and append overlay with loading state
        const overlay = document.createElement('div');
        overlay.className = 'overlay-text';

        if (analysisCache.has(cacheKey)) {
            const cached = analysisCache.get(cacheKey);
            overlay.textContent = cached.summary || getRandomWord();
        } else {
            overlay.textContent = analysisEnabled ? 'ANALYZING...' : getRandomWord();
        }
        const isShorts = thumbnail.closest('ytd-reel-item-renderer') !== null;
        overlay.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: ${showThumbnails ? 'white' : 'black'};
            font-size: ${isShorts ? '32px' : '48px'};
            font-weight: bold;
            font-family: Impact, sans-serif;
            text-align: center;
            pointer-events: none;
            z-index: 2;
            letter-spacing: 2px;
            width: 90%;
            word-wrap: break-word;
            margin: 0;
            padding: 0;
            text-shadow: ${showThumbnails ? '2px 2px 4px rgba(0, 0, 0, 0.9)' : 'none'};
            mix-blend-mode: ${showThumbnails ? 'overlay' : 'normal'};
        `;

        container.appendChild(whiteBackground);
        container.appendChild(overlay);

        // Return promise for API call and DOM update
        if (analysisEnabled) {
            return analyzeWithGroq(rawTitle, rawTitle)
                .then(analysis => {
                    if (analysis && typeof analysis === 'object') {
                        overlay.textContent = analysis.summary;
                    } else {
                        overlay.textContent = typeof analysis === 'string' ? analysis : 'ERROR';
                    }
                })
                .catch(error => {
                    console.error('Analysis failed:', error);
                    overlay.textContent = getRandomWord()//'SYSTEM ERROR';
                });
            }

    });

    // Wait for all updates to complete
    await Promise.all(updates);
}

// Debounce function to prevent too many calls
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

// Debounced version of replaceThumbnails
const debouncedReplace = debounce(replaceThumbnails, 250);

const debouncedReplaceAll = debounce(() => replaceAllImages(imageUrl, imageTitle), 250);


function showAnalysisOverlays() {
    if (!showAnalysis || !isEnabled) return;
    
    const thumbnails = document.querySelectorAll(
        'ytd-thumbnail, ytd-reel-item-renderer, ytd-rich-grid-media'
    );

    thumbnails.forEach(container => {
        const titleElement = container.closest('ytd-rich-item-renderer')?.querySelector('#video-title') || 
                            container.closest('ytd-compact-video-renderer')?.querySelector('#video-title');
        const rawTitle = titleElement?.textContent?.trim() || 'Untitled';

        if (analysisCache.has(rawTitle) && !container.querySelector('.analysis-overlay')) {
            const analysis = analysisCache.get(rawTitle);
            
            // Create overlay container
            const overlay = document.createElement('div');
            overlay.className = 'analysis-overlay';
            overlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.95);
                color: white;
                padding: 12px;
                font-size: 13px;
                z-index: 1000;
                display: flex;
                flex-direction: column;
                overflow-y: auto;
                overscroll-behavior: contain;
            `;

            // Create summary section
            const summaryDiv = document.createElement('div');
            summaryDiv.style.cssText = 'font-size: 1.2em; color: #ff4444; margin-bottom: 8px;';
            summaryDiv.textContent = analysis.summary;
            overlay.appendChild(summaryDiv);

            // Create analysis section
            const analysisDiv = document.createElement('div');
            analysisDiv.style.cssText = 'flex-grow: 1; margin-bottom: 12px;';
            analysisDiv.textContent = analysis.analysis;
            overlay.appendChild(analysisDiv);

            // Create impact section
            const impactDiv = document.createElement('div');
            impactDiv.style.cssText = 'border-top: 1px solid #444; padding-top: 8px; color: #888;';
            impactDiv.textContent = analysis.impact;
            overlay.appendChild(impactDiv);

            // Add to container
            container.style.position = 'relative';
            container.appendChild(overlay);
        }
    });
}

function hideAnalysisOverlays() {
    document.querySelectorAll('.analysis-overlay').forEach(overlay => {
        overlay.remove();
    });
}


// Listen for messages from popup
chrome.runtime.onMessage.addListener((message) => {    
    const wasEnabled = isEnabled;
    const wasShowingThumbnails = showThumbnails;
    const wasReplace = replace;
    const wasShowAnalysis = showAnalysis;
    //console.log(replace);
    //console.log(message.replace);
    isEnabled = message.enabled;
    showThumbnails = message.showThumbnails;
    replace = message.replace;
    analysisEnabled = message.analysisEnabled;
    showAnalysis = message.showAnalysis;
    //first I make the thumbnails replaced if the replace button changed

    if (wasShowAnalysis !== showAnalysis) {
        if (showAnalysis) {
            console.log("Showing analysis overlays");
            showAnalysisOverlays();
        } else {
            console.log("Hiding analysis overlays");
            hideAnalysisOverlays();
        }
    }

    if (wasReplace !== replace) {
        if (!replace) {
            clearAllReplaces();
            console.log(analysisCache.size);
        } else {
            replaceAllImages(message.imageUrl, message.imageTitle)
        }
    }
    
    // If main extension toggle changed
    if (wasEnabled !== isEnabled) {
        if (!isEnabled) {
            // If extension is being disabled, restore YouTube to normal
            document.documentElement.style.filter = 'none';
            clearOverlays();
            clearAllReplaces();
        } else {
            // Only run animation when enabling the extension
            setGreyscale(true);
            //replaceAllImages('https://i.ytimg.com/vi/Mu3BfD6wmPg/hq720.jpg?sqp=-oaymwFBCNAFEJQDSFryq4qpAzMIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB8AEB-AH-CYAC0AWKAgwIABABGBEgYihyMA8=&rs=AOn4CLCY6KSCtCHAKGgbGjInahMAocVO8g', 'Test Title');
            replaceThumbnailsWithAnalysis(analysisEnabled);
        }

            //console.log(apiKey);
            //console.log(analyzeWithGroq("The Matrix - Official Trailer"));
            console.log(analysisCache)

        } 
    // If only the thumbnail setting changed, just update without animation
    else if (wasShowingThumbnails !== showThumbnails && isEnabled) {
        document.documentElement.style.filter = 'grayscale(100%)';
        replaceThumbnails();
    }



});



// Load initial state
chrome.storage.local.get(['enabled', 'showThumbnails','imageUrl','imageTitle', 'replace','apiKey'], (result) => {
    isEnabled = result.enabled || false;
    showThumbnails = result.showThumbnails || false;
    if (isEnabled) {
        setGreyscale(true);
    }

    result.imageUrl || '';
    result.imageTitle || '';
});

// Add a storage change listener
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.apiKey) {
        apiKey = changes.apiKey.newValue;
        //console.log('API key updated:', apiKey);
    }
});

// Add cache cleanup function
function clearAnalysisCache() {
    analysisCache.clear();
    chrome.storage.local.remove('analysisCache');
}

// Add scroll event listener
window.addEventListener('scroll',() => {
    if(replace){
        debouncedReplaceAll();
    }
    debouncedReplace();
    if (showAnalysis) {
        // Debounce the analysis overlay updates
        debounce(showAnalysisOverlays, 250)();
    }
});


// Create an observer to handle dynamically loaded thumbnails
const observer = new MutationObserver((mutations) => {
    // Check if any of the mutations involve adding nodes
    const hasNewNodes = mutations.some(mutation => 
        mutation.addedNodes.length > 0 || 
        mutation.type === 'attributes'
    );
    
    if (hasNewNodes && isEnabled) {
        debouncedReplace();
        if (showAnalysis) {
            debounce(showAnalysisOverlays, 250)();
        }
    }
});

// Start observing the page for changes with more specific options
observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src']  // Only watch for src attribute changes
});

// Also observe the specific content container that YouTube uses for infinite scroll
const contentContainer = document.querySelector('#content');
if (contentContainer) {
    observer.observe(contentContainer, {
        childList: true,
        subtree: true
    });
} 

console.log("I exist!")