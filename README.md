# Behind The Click

A browser extension that reveals ideological messaging in YouTube thumbnails and titles.

## Installation

### Chrome/Chromium Browser
1. Download or clone this repository
   - Using Git: `git clone https://github.com/ellipticalcurves/behindtheclick.git`
   - Or download ZIP: Click green "Code" button and "Download ZIP", then extract
2. Open Chrome and go to `chrome://extensions`
3. Enable "Developer mode" using the toggle in the top-right corner
4. Click "Load unpacked" and select the directory containing the extension files
5. The extension icon should appear in your browser toolbar

### Firefox Browser
1. Download or clone this repository as described above
2. Open Firefox and go to `about:debugging`
3. Click "This Firefox" in the left sidebar
4. Click "Load Temporary Add-on"
5. Navigate to the extension directory and select any file (e.g., manifest.json)

## Usage
1. Click the extension icon to open the control panel
2. Enable the extension using the main toggle
3. Configure options:
   - Show/Hide Thumbnails: Toggle thumbnail visibility
   - API Key: Enter your GROQ API key for analysis
   - Enable Analysis: Use AI to analyze video titles
   - Show Explanations: Display detailed analysis overlays

## Getting a GROQ API Key
1. Visit [groq.com](https://groq.com)
2. Sign up for an account
3. Navigate to API section
4. Generate a new API key
5. Copy and paste the key into the extension's API Key field

## Features
- Replace thumbnails with ideological critiques
- AI-powered analysis of video titles
- Toggle between showing/hiding original thumbnails
- Detailed analysis overlays
- Custom thumbnail replacement options

## Note
The Firefox installation is temporary and will need to be reloaded when Firefox restarts. For permanent installation in Firefox, the extension needs to be signed by Mozilla.
