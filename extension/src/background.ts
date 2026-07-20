import { processPendingQueue, startSyncTimer } from './lib/sync';

// Start sync timer on install
chrome.runtime.onInstalled.addListener(() => {
  startSyncTimer();
  console.log('Lethe extension installed');
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'SYNC_NOW') {
    processPendingQueue()
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }
});
