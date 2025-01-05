// Constants
const INACTIVITY_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds

let lastActivityTime = Date.now();

// Initialize alarm when extension is installed or updated
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Extension installed/updated');
  const data = await chrome.storage.local.get(['autoLogging', 'timerLength']);
  console.log('Initial auto-logging state:', data.autoLogging);
  
  if (data.autoLogging === false) {
    console.log('Auto-logging disabled on install, clearing alarm');
    await chrome.alarms.clear('takeSnapshot');
  } else {
    console.log('Setting up initial alarm');
    await setupAlarm(data.timerLength || 30);
  }
});

// Update last activity time when there's user interaction
chrome.tabs.onActivated.addListener(() => {
  lastActivityTime = Date.now();
});

chrome.tabs.onUpdated.addListener(() => {
  lastActivityTime = Date.now();
});

// Listen for alarm
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'takeSnapshot') {
    console.log('Alarm triggered, checking auto-logging state');
    // Check current auto-logging state from storage
    const data = await chrome.storage.local.get(['autoLogging']);
    console.log('Current auto-logging state:', data.autoLogging);
    
    if (data.autoLogging === false) {
      console.log('Auto-logging is disabled, clearing alarm');
      await chrome.alarms.clear('takeSnapshot');
      return;
    }
    
    console.log('Auto-logging is enabled, attempting snapshot');
    await attemptSnapshot();
  }
});

// Setup alarm with proper interval
async function setupAlarm(minutes) {
  try {
    console.log('Setting up alarm for', minutes, 'minutes');
    
    // Clear any existing alarm first
    console.log('Clearing existing alarm');
    await chrome.alarms.clear('takeSnapshot');
    
    // Double check auto-logging state
    const data = await chrome.storage.local.get(['autoLogging']);
    console.log('Checking auto-logging state before creating alarm:', data.autoLogging);
    
    if (data.autoLogging === false) {
      console.log('Auto-logging is disabled, not creating new alarm');
      return;
    }
    
    // Create new alarm
    console.log('Creating new alarm');
    await chrome.alarms.create('takeSnapshot', {
      periodInMinutes: minutes
    });
    
    // Notify popup and webapp to update their timers
    chrome.runtime.sendMessage({
      action: 'updateTimer'
    });
    
    console.log('Alarm setup complete');
  } catch (error) {
    console.error('Error setting up alarm:', error);
  }
}

// Listen for messages from popup/webapp
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === 'updateLastActivity') {
    lastActivityTime = Date.now();
    sendResponse({ success: true });
  }
  
  if (message.action === 'updateAutoLogging') {
    console.log('Received updateAutoLogging message:', message.enabled);
    
    if (message.enabled) {
      console.log('Enabling auto-logging');
      const data = await chrome.storage.local.get(['timerLength']);
      await setupAlarm(data.timerLength || 30);
    } else {
      console.log('Disabling auto-logging, clearing alarm');
      await chrome.alarms.clear('takeSnapshot');
    }
    
    // Save the auto-logging state
    await chrome.storage.local.set({ autoLogging: message.enabled });
    console.log('Auto-logging state saved:', message.enabled);
    sendResponse({ success: true });
  }
  
  if (message.type === 'updateTimer') {
    console.log('Received updateTimer message');
    const data = await chrome.storage.local.get(['autoLogging']);
    console.log('Current auto-logging state for timer update:', data.autoLogging);
    
    if (data.autoLogging !== false && message.minutes) {
      await setupAlarm(message.minutes);
    }
  }
  
  return true;
});

// Attempt to take a snapshot
async function attemptSnapshot() {
  // Double-check auto-logging state before proceeding
  const data = await chrome.storage.local.get(['autoLogging']);
  console.log('Checking auto-logging state before snapshot:', data.autoLogging);
  
  if (data.autoLogging === false) {
    console.log('Auto-logging is disabled, skipping snapshot');
    return;
  }
  
  console.log('Attempting snapshot...');
  const currentTime = Date.now();
  
  // Skip if user has been inactive
  if (currentTime - lastActivityTime > INACTIVITY_THRESHOLD) {
    console.log('User inactive, skipping snapshot');
    return;
  }

  try {
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) {
      console.log('No active tab found');
      return;
    }

    // Skip if we're on a restricted page
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:')) {
      console.log('Restricted page, skipping snapshot');
      return;
    }

    // Take screenshot
    try {
      const screenshot = await chrome.tabs.captureVisibleTab(null, { format: 'jpeg', quality: 50 });
      
      // Double check auto-logging state again before saving
      const finalCheck = await chrome.storage.local.get(['autoLogging']);
      if (finalCheck.autoLogging === false) {
        console.log('Auto-logging disabled during snapshot, aborting');
        return;
      }
      
      // Create log entry
      const logEntry = {
        description: 'Automatic snapshot',
        url: tab.url,
        title: tab.title,
        timestamp: new Date().toISOString(),
        screenshot
      };

      // Save to storage
      const data = await chrome.storage.local.get(['logs', 'todayKarma']);
      const logs = data.logs || [];
      const todayKarma = (data.todayKarma || 0) + 1;
      
      logs.push(logEntry);
      await chrome.storage.local.set({ 
        logs,
        todayKarma,
        lastUpdate: new Date().toDateString()
      });
      
      console.log('Snapshot saved successfully');
      
      // Notify popup and webapp to update
      chrome.runtime.sendMessage({
        action: 'snapshotTaken',
        todayKarma
      });
      
    } catch (error) {
      console.error('Error capturing screenshot:', error);
    }
  } catch (error) {
    console.error('Error taking snapshot:', error);
  }
} 