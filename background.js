// background.js for Gemini Multi-Tab Automator
// Listen for messages from popup.js to open Gemini and Aistudio tabs

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'openAllTabs') {
    const geminiUrls = [
      'https://gemini.google.com/app/new',
      'https://gemini.google.com/app/new',
      'https://gemini.google.com/app/new',
      'https://gemini.google.com/app/new'
    ];
    const aistudioUrls = [
      'https://aistudio.google.com/generate-speech',
      'https://aistudio.google.com/generate-speech',
      'https://aistudio.google.com/generate-speech',
      'https://aistudio.google.com/generate-speech'
    ];
    (async () => {
      // Open Gemini tabs in parallel
      const geminiTabs = await Promise.all(
        geminiUrls.map(url => chrome.tabs.create({ url }))
      );
      const geminiTabIds = geminiTabs.map(tab => tab.id);
      // Open Aistudio tabs sequentially with delay
      const aistudioTabs = [];
      for (let i = 0; i < aistudioUrls.length; i++) {
        if (i > 0) await new Promise(r => setTimeout(r, 400));
        const tab = await chrome.tabs.create({ url: aistudioUrls[i] });
        aistudioTabs.push(tab);
      }
      const aistudioTabIds = aistudioTabs.map(tab => tab.id);
      await chrome.storage.local.set({ geminiTabIds, aistudioTabIds });
      sendResponse({ success: true, geminiTabIds, aistudioTabIds });
    })();
    return true;
  }
}); 