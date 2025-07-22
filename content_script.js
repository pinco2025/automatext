// content_script.js for Gemini Multi-Tab Automator

// Helper: find Gemini chat input field (robust selector for new UI)
function findGeminiInput() {
  // Robust selector for Gemini chat input
  return document.querySelector('div[contenteditable="true"][aria-label="Enter a prompt here"]')
      || document.querySelector('.ql-editor.textarea[contenteditable="true"]');
}

// Helper: insert text and simulate Enter
async function insertAndSubmit(chunk) {
  let input = findGeminiInput();
  let retries = 0;
  while (!input && retries < 10) {
    await new Promise(r => setTimeout(r, 500));
    input = findGeminiInput();
    retries++;
  }
  if (!input) {
    alert('Could not find Gemini chat input field.');
    return;
  }
  input.focus();
  // For Quill rich text editor, set innerHTML
  input.innerHTML = chunk.replace(/\n/g, '<br>');
  input.dispatchEvent(new Event('input', { bubbles: true }));
  // Simulate Enter key
  const enterEvent = new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    key: 'Enter',
    code: 'Enter',
    which: 13,
    keyCode: 13
  });
  input.dispatchEvent(enterEvent);
}

// Expose for injection
window.handleGeminiPromptChunk = insertAndSubmit;

// If window.__GEMINI_PROMPT_CHUNK is set, auto-handle
if (window.__GEMINI_PROMPT_CHUNK) {
  insertAndSubmit(window.__GEMINI_PROMPT_CHUNK);
}

// Aistudio prompt injection
function findAistudioInput() {
  // Placeholder selector; update with DevTools if needed
  // Try to find a textarea or input for speech prompt
  return document.querySelector('textarea') || document.querySelector('input[type="text"]');
}

async function insertAndSubmitAistudio(chunk) {
  let input = findAistudioInput();
  let retries = 0;
  while (!input && retries < 10) {
    await new Promise(r => setTimeout(r, 500));
    input = findAistudioInput();
    retries++;
  }
  if (!input) {
    alert('Could not find Aistudio input field.');
    return;
  }
  input.focus();
  input.value = chunk;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  // Simulate Enter key
  const enterEvent = new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    key: 'Enter',
    code: 'Enter',
    which: 13,
    keyCode: 13
  });
  input.dispatchEvent(enterEvent);
}
window.handleAistudioPromptChunk = insertAndSubmitAistudio;

if (window.__AISTUDIO_PROMPT_CHUNK) {
  insertAndSubmitAistudio(window.__AISTUDIO_PROMPT_CHUNK);
} 

// On load, if on aistudio.google.com/generate-speech, auto-select single-speaker audio
async function autoSelectSingleSpeakerAudio() {
  if (
    window.location.hostname.includes('aistudio.google.com') &&
    window.location.pathname.includes('generate-speech')
  ) {
    await new Promise(r => setTimeout(r, 3000)); // Wait 3 seconds for page to load
    let retries = 0;
    let btn = null;
    while (retries < 20 && !btn) {
      console.log(`[Ext Debug] Attempt ${retries+1}: Searching for 'Single-speaker audio' button...`);
      btn = Array.from(document.querySelectorAll('button')).find(
        b => b.textContent && b.textContent.trim().toLowerCase().includes('single-speaker audio')
      );
      if (!btn) {
        await new Promise(r => setTimeout(r, 400));
        retries++;
      }
    }
    if (btn && (!btn.getAttribute('aria-pressed') || btn.getAttribute('aria-pressed') === 'false')) {
      btn.click();
      console.log('[Ext Debug] Clicked Single-speaker audio button.');
    } else if (!btn) {
      console.log('[Ext Debug] Single-speaker audio button not found after retries.');
    } else {
      console.log('[Ext Debug] Single-speaker audio button already selected.');
    }
  }
}
autoSelectSingleSpeakerAudio(); 

// Fill Aistudio style and text sections (V2: accepts both style and narration)
window.handleAistudioPromptFillV2 = async function({style, narration}) {
  // Style instructions field
  let styleInput = document.querySelector('input[aria-label="Style instructions"], textarea[aria-label="Style instructions"]')
    || Array.from(document.querySelectorAll('input, textarea')).find(el => el.placeholder && el.placeholder.toLowerCase().includes('style'));
  if (styleInput) {
    styleInput.focus();
    styleInput.value = '';
    styleInput.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise(r => setTimeout(r, 100));
    styleInput.value = style;
    styleInput.dispatchEvent(new Event('input', { bubbles: true }));
  }
  // Main script/text area
  let allTextareas = Array.from(document.querySelectorAll('textarea'));
  let textArea = allTextareas.find(t => t !== styleInput);
  if (!textArea) {
    textArea = document.querySelector('textarea[aria-label="Raw structure"]')
      || document.querySelector('textarea');
  }
  if (textArea) {
    textArea.focus();
    textArea.value = '';
    textArea.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise(r => setTimeout(r, 100));
    textArea.value = narration;
    textArea.dispatchEvent(new Event('input', { bubbles: true }));
  }
}; 

// Click the blue Run button in Aistudio with retry and logging
window.clickAistudioRunButton = async function() {
  let retries = 0;
  let btn = null;
  while (retries < 10 && !btn) {
    console.log(`[Ext Debug] Attempt ${retries+1}: Searching for 'Run' button...`);
    btn = Array.from(document.querySelectorAll('button')).find(
      b => b.textContent && b.textContent.trim().toLowerCase().includes('run')
    );
    if (!btn) {
      await new Promise(r => setTimeout(r, 400));
      retries++;
    }
  }
  if (btn) {
    btn.click();
    console.log('[Ext Debug] Clicked Run button.');
  } else {
    console.log('[Ext Debug] Run button not found after retries.');
  }
}; 

// Download the generated audio in Aistudio
window.downloadAistudioAudio = async function() {
  // 1. Click the kebab menu (three dots) near the audio player
  let retries = 0;
  let kebab = null;
  while (retries < 10 && !kebab) {
    kebab = Array.from(document.querySelectorAll('button, div')).find(
      el => el.getAttribute && (el.getAttribute('aria-label') === 'More options' || el.getAttribute('aria-label') === 'More actions')
    );
    if (!kebab) {
      await new Promise(r => setTimeout(r, 400));
      retries++;
    }
  }
  if (kebab) {
    kebab.click();
    // 2. Wait for the Download button to appear
    let downloadBtn = null;
    retries = 0;
    while (retries < 10 && !downloadBtn) {
      downloadBtn = Array.from(document.querySelectorAll('button, div')).find(
        el => el.textContent && el.textContent.trim().toLowerCase().includes('download')
      );
      if (!downloadBtn) {
        await new Promise(r => setTimeout(r, 400));
        retries++;
      }
    }
    if (downloadBtn) {
      downloadBtn.click();
    }
  }
}; 

// Download all audio files directly from <audio> elements (robust Blob version, accepts filename)
window.downloadAistudioAudioDirect = function(filename) {
  const audios = Array.from(document.querySelectorAll('audio'));
  if (audios.length === 0) {
    console.log('[Ext Debug] No <audio> elements found.');
  }
  audios.forEach((audio, i) => {
    const src = audio.src;
    if (src) {
      fetch(src)
        .then(res => res.blob())
        .then(blob => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename || `aistudio-audio-${i+1}.wav`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          console.log(`[Ext Debug] Triggered download for audio #${i+1}:`, src, 'as', a.download);
        })
        .catch(err => {
          console.log(`[Ext Debug] Failed to fetch audio #${i+1}:`, err);
        });
    } else {
      console.log(`[Ext Debug] <audio> element #${i+1} has no src.`);
    }
  });
  console.log(`[Ext Debug] Download trigger attempted for ${audios.length} audio(s).`);
}; 