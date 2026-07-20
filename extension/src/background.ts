import { processPendingQueue } from './lib/sync';

// Start sync timer on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('syncPending', { periodInMinutes: 5 });
  console.log('Lethe extension installed');
});

// Retry pending syncs every 5 minutes
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'syncPending') {
    processPendingQueue();
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'SYNC_NOW') {
    processPendingQueue()
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
});
