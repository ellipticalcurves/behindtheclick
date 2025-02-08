let isEnabled = false;
let showThumbnails = false;
let replace = false;
let imageUrl = 'https://i.ytimg.com/vi/DdV8dqw6ZzE/hqdefault.jpg?sqp=-oaymwFBCNACELwBSFryq4qpAzMIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB8AEB-AH-CYAC0AWKAgwIABABGEggZSg8MA8=&rs=AOn4CLB2xortox5sf8KPfQF3tZdoaMpNzQ';
let imageTitle = '';


const words = ['OBEY', 'CONSUME', 'CONFORM', 'SUBMIT', 'SLEEP'];

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
    if (!imageUrl) return;

    const thumbnails = document.querySelectorAll(`img[src*="ytimg.com/vi/"], img[src*="i.ytimg.com"]`);

    thumbnails.forEach(thumbnail => {
        const container = thumbnail.closest('ytd-thumbnail, ytd-reel-item-renderer');
        if (!container) return;

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
            thumbnail.style.visibility = 'hidden';

            container.appendChild(newImage);
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






// Listen for messages from popup
chrome.runtime.onMessage.addListener((message) => {    
    const wasEnabled = isEnabled;
    const wasShowingThumbnails = showThumbnails;
    const wasReplace = replace;
    //console.log(replace);
    //console.log(message.replace);
    isEnabled = message.enabled;
    showThumbnails = message.showThumbnails;
    replace = message.replace;
    //first I make the thumbnails replaced if the replace button changed
    if (wasReplace !== replace) {
        if (!replace) {
            clearAllReplaces();
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

            replaceThumbnails();
        }
    } 
    // If only the thumbnail setting changed, just update without animation
    else if (wasShowingThumbnails !== showThumbnails && isEnabled) {
        document.documentElement.style.filter = 'grayscale(100%)';
        replaceThumbnails();
    }



});



// Load initial state
chrome.storage.local.get(['enabled', 'showThumbnails','imageUrl','imageTitle', 'replace'], (result) => {
    isEnabled = result.enabled || false;
    showThumbnails = result.showThumbnails || false;
    if (isEnabled) {
        setGreyscale(true);
    }

    result.imageUrl || '';
    result.imageTitle || '';
});




// Add scroll event listener
window.addEventListener('scroll',() => {
    if(replace){
        debouncedReplaceAll();
    }
    debouncedReplace();
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