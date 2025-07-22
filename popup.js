// Handles Setup and Input Prompt logic for popup

document.getElementById('setupBtn').addEventListener('click', async () => {
  // Ask background.js to open 4 Gemini and 4 Aistudio tabs
  chrome.runtime.sendMessage({ action: 'openAllTabs' }, (response) => {
    if (response && response.success) {
      // alert(`Tabs opened. Gemini tab IDs: ${response.geminiTabIds.join(', ')}\nAistudio tab IDs: ${response.aistudioTabIds.join(', ')}`);
    } else {
      // alert('Error opening tabs: ' + (response && response.error ? response.error : 'Unknown error'));
    }
  });
});

// Modal logic
const modal = document.getElementById('promptModal');
const inputBtn = document.getElementById('inputPromptBtn');
const closeModal = document.getElementById('closeModal');
const submitPrompt = document.getElementById('submitPrompt');
const promptInput = document.getElementById('promptInput');

// Aistudio modal logic
const aistudioModal = document.getElementById('aistudioPromptModal');
const aistudioInputBtn = document.getElementById('aistudioPromptBtn');
const closeAistudioModal = document.getElementById('closeAistudioModal');
const submitAistudioPrompt = document.getElementById('submitAistudioPrompt');
const aistudioPromptInput = document.getElementById('aistudioPromptInput');

inputBtn.onclick = () => {
  modal.style.display = 'block';
};
closeModal.onclick = () => {
  modal.style.display = 'none';
};
window.onclick = (e) => {
  if (e.target === modal) modal.style.display = 'none';
};

aistudioInputBtn.onclick = () => {
  aistudioModal.style.display = 'block';
};
closeAistudioModal.onclick = () => {
  aistudioModal.style.display = 'none';
};
window.addEventListener('click', (e) => {
  if (e.target === aistudioModal) aistudioModal.style.display = 'none';
});

submitPrompt.onclick = async () => {
  const value = promptInput.value;
  if (!value) return alert('Please paste your prompt.');
  // Split into 4 parts by ~
  const chunks = value.split(/\s*~\s*/);
  if (chunks.length !== 4) return alert('Prompt must have 4 parts separated by ~');
  // Get Gemini tab IDs
  const { geminiTabIds } = await chrome.storage.local.get('geminiTabIds');
  if (!geminiTabIds || geminiTabIds.length !== 4) {
    alert('Please run Setup first.');
    return;
  }
  // For each Gemini tab, inject the chunk prefixed with 'generate an image '
  for (let i = 0; i < 4; i++) {
    try {
      // 1. Inject the content script
      await chrome.scripting.executeScript({
        target: { tabId: geminiTabIds[i] },
        files: ['content_script.js']
      });
      // 2. Set the prompt chunk
      await chrome.scripting.executeScript({
        target: { tabId: geminiTabIds[i] },
        func: (chunk) => {
          window.__GEMINI_PROMPT_CHUNK = chunk;
        },
        args: ['generate an image ' + chunks[i]]
      });
      // 3. Call the handler
      await chrome.scripting.executeScript({
        target: { tabId: geminiTabIds[i] },
        func: () => {
          if (window.handleGeminiPromptChunk) {
            window.handleGeminiPromptChunk(window.__GEMINI_PROMPT_CHUNK);
          }
        }
      });
    } catch (e) {
      // alert('Failed to inject prompt into Gemini tab #' + (i+1) + ': ' + e.message);
    }
  }
  alert('Image prompts sent to Gemini tabs!');
  modal.style.display = 'none';
  promptInput.value = '';
};

submitAistudioPrompt.onclick = async () => {
  // Get the large input text
  const value = aistudioPromptInput.value;
  if (!value) return alert('Please paste your prompt.');
  // Split into 4 parts by ~
  const parts = value.split(/\s*~\s*/);
  if (parts.length !== 4) return alert('Prompt must have 4 parts separated by ~');
  // Get Aistudio tab IDs
  const { aistudioTabIds } = await chrome.storage.local.get('aistudioTabIds');
  if (!aistudioTabIds || aistudioTabIds.length !== 4) {
    alert('Please run Setup first.');
    return;
  }
  // For each part, extract Style Instructions and Narration, then inject
  for (let i = 0; i < 4; i++) {
    const part = parts[i];
    // Extract Style Instructions and Narration
    const styleMatch = part.match(/Style Instructions:\s*([\s\S]*?)Narration:/i);
    const narrationMatch = part.match(/Narration:\s*([\s\S]*)/i);
    let style = styleMatch ? styleMatch[1].trim() : '';
    const narration = narrationMatch ? narrationMatch[1].trim() : '';
    // Transform style: lowercase and prepend line
    style = 'the tone should be ' + style.toLowerCase();
    try {
      await chrome.scripting.executeScript({
        target: { tabId: aistudioTabIds[i] },
        func: ({style, narration}) => {
          if (window.handleAistudioPromptFillV2) {
            window.handleAistudioPromptFillV2({style, narration});
          }
        },
        args: [{ style, narration }]
      });
    } catch (e) {
      // alert('Failed to inject prompt into Aistudio tab #' + (i+1) + ': ' + e.message);
    }
  }
  // After filling, trigger the run button in each tab
  for (let i = 0; i < 4; i++) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: aistudioTabIds[i] },
        func: () => {
          if (window.clickAistudioRunButton) {
            window.clickAistudioRunButton();
          }
        }
      });
      await new Promise(r => setTimeout(r, 500)); // Small delay between triggers
    } catch (e) {
      // alert('Failed to click Run in Aistudio tab #' + (i+1) + ': ' + e.message);
    }
  }
  alert('All Aistudio tabs filled and Run triggered!');
  aistudioModal.style.display = 'none';
  aistudioPromptInput.value = '';
};

const downloadAudioBtn = document.getElementById('downloadAudioBtn');
downloadAudioBtn.onclick = async () => {
  const { aistudioTabIds } = await chrome.storage.local.get('aistudioTabIds');
  if (!aistudioTabIds || aistudioTabIds.length !== 4) {
    alert('Please run Setup first.');
    return;
  }
  for (let i = 0; i < 4; i++) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: aistudioTabIds[i] },
        func: (filename) => {
          if (window.downloadAistudioAudioDirect) {
            window.downloadAistudioAudioDirect(filename);
          }
        },
        args: [`scene-${i+1}.wav`]
      });
      await new Promise(r => setTimeout(r, 1000)); // Wait 1s between downloads
    } catch (e) {
      // alert('Failed to download audio in Aistudio tab #' + (i+1) + ': ' + e.message);
    }
  }
  alert('Triggered download in all Aistudio tabs in order!');
}; 