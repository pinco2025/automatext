# Gemini & Aistudio Multi-Tab Automator Extension

## Features
- One-click setup: Opens 4 Gemini and 4 Aistudio tabs and tracks them for automation.
- Input Image Prompt: Split a prompt into 4 parts and inject each into a Gemini tab, prefixed with "generate an image".
- Aistudio Input Prompt: Split a prompt into 4 parts and inject style/narration into Aistudio tabs, then auto-run.
- Download Audio: Download generated audio from all Aistudio tabs in order (scene-1.wav, scene-2.wav, ...).
- Modern, theme-matched popup UI.

## Installation

### Option 1: Load as Unpacked Extension
1. **Download and unzip** this extension folder.
2. Go to your browser's extensions page:
   - **Opera GX:** `opera://extensions`
   - **Chrome:** `chrome://extensions`
3. **Enable Developer Mode** (toggle at the top right).
4. Click **Load unpacked** and select the unzipped folder.

### Option 2: Install as a .crx File (Opera GX)
1. Go to `opera://extensions` and enable Developer Mode.
2. Click **Pack extension** and select this folder as the root directory.
3. Opera will generate a `.crx` file and a `.pem` key (save the key for future updates).
4. **Share the `.crx` file** with others.
5. To install, **drag and drop the `.crx` file** onto the extensions page and confirm.

> **Note:** Chrome may block .crx installation for security reasons. Use unpacked mode for Chrome.

## Usage
1. Click the extension icon to open the popup.
2. Click **Setup** to open and track 4 Gemini and 4 Aistudio tabs.
3. Use **Input Image Prompt** to send prompts to Gemini tabs (separate 4 parts with `~`).
4. Use **Aistudio Input Prompt** to send prompts to Aistudio tabs (see popup for format).
5. Use **Download Audio** to download audio from all Aistudio tabs in order.

## Troubleshooting
- **Tabs not opening?**
  - Make sure you enabled Developer Mode and selected the correct folder.
  - Some browsers block multiple tab openings; try Opera GX for best results.
- **Prompts not injected?**
  - Make sure you ran Setup first and did not close the tabs.
  - If Gemini/Aistudio UI changes, update the selectors in `content_script.js`.
- **Audio not downloading?**
  - Make sure audio is generated in each Aistudio tab before clicking Download Audio.

## Updating/Customizing
- To update selectors or add features, edit the relevant JS/CSS files and reload the extension.
- For updates to a .crx install, use the same `.pem` key when packing.

## License
MIT 