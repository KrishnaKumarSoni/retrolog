import { timerService } from './services/TimerService';
import { loggingService } from './services/LoggingService';

// Initialize alarm when extension is installed or updated
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Extension installed/updated');
});

// Update last activity time when there's user interaction
chrome.tabs.onActivated.addListener(() => {
  timerService.updateLastActivity();
});

chrome.tabs.onUpdated.addListener(() => {
  timerService.updateLastActivity();
});

// Helper function to safely send messages
async function sendMessageToUI(message: any): Promise<void> {
  try {
    const views = chrome.extension.getViews({ type: 'popup' });
    if (views.length > 0) {
      await chrome.runtime.sendMessage(message);
    }
  } catch (error) {
    console.log('UI not available for message:', message);
  }
}

// Listen for alarm
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'takeSnapshot') {
    console.log('Alarm triggered, attempting auto-log');
    await loggingService.createAutoLog();
  }
});

// Listen for messages from popup/webapp
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      switch (message.action) {
        case 'updateLastActivity':
          await timerService.updateLastActivity();
          sendResponse({ success: true });
          break;

        case 'updateAutoLogging':
          await timerService.toggleAutoLogging(message.enabled);
          sendResponse({ success: true });
          break;

        case 'updateTimer':
          if (message.minutes) {
            await timerService.updateTimerLength(message.minutes);
          }
          sendResponse({ success: true });
          break;

        case 'createLog':
          if (message.description) {
            await loggingService.createManualLog(message.description);
            sendResponse({ success: true });
          }
          break;

        case 'updateLogDescription':
          if (message.id && message.description) {
            await loggingService.updateLogDescription(message.id, message.description);
            sendResponse({ success: true });
          }
          break;

        case 'deleteLog':
          if (message.id) {
            await loggingService.deleteLog(message.id);
            sendResponse({ success: true });
          }
          break;
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      });
    }
  })();

  return true; // Keep the message channel open for async response
}); 