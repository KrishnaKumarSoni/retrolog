// DOM Elements
const taskInput = document.getElementById('task-input');
const logButton = document.getElementById('log-button');
const openWebappButton = document.getElementById('open-webapp');
const currentKarma = document.getElementById('current-karma');
const karmaTarget = document.getElementById('karma-target');
const progressFill = document.getElementById('progress-fill');
const container = document.querySelector('.container');
const nextSnapshotText = document.getElementById('next-snapshot');

// Constants
const DEFAULT_KARMA_TARGET = 5;
let nextSnapshotTimer;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  setLoading(true);
  await loadKarmaData();
  setupEventListeners();
  updateNextSnapshotTimer();
  setLoading(false);
});

// Event Listeners
function setupEventListeners() {
  logButton.addEventListener('click', handleLogTask);
  openWebappButton.addEventListener('click', openWebApp);
  taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogTask();
  });
}

// Loading State
function setLoading(isLoading) {
  container.classList.toggle('loading', isLoading);
}

// Load karma data
async function loadKarmaData() {
  const data = await chrome.storage.local.get(['karmaTarget', 'todayKarma', 'lastUpdate']);
  const today = new Date().toDateString();
  
  if (data.lastUpdate !== today) {
    await chrome.storage.local.set({
      todayKarma: 0,
      lastUpdate: today
    });
    updateKarmaDisplay(0);
  } else {
    updateKarmaDisplay(data.todayKarma || 0);
  }
  
  karmaTarget.textContent = data.karmaTarget || DEFAULT_KARMA_TARGET;
}

// Update next snapshot timer
function updateNextSnapshotTimer() {
  chrome.storage.local.get(['autoLogging'], function(data) {
    if (data.autoLogging === false) {
      nextSnapshotText.textContent = 'Auto-logging disabled';
      if (nextSnapshotTimer) clearInterval(nextSnapshotTimer);
      return;
    }

    chrome.alarms.get('takeSnapshot').then(alarm => {
      if (!alarm) {
        nextSnapshotText.textContent = 'Timer not available';
        return;
      }

      const updateTimer = () => {
        const now = Date.now();
        const next = alarm.scheduledTime;
        const diff = Math.max(0, next - now);
        
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        
        nextSnapshotText.textContent = `Next snapshot in: ${minutes}:${seconds.toString().padStart(2, '0')}`;
      };

      updateTimer();
      if (nextSnapshotTimer) clearInterval(nextSnapshotTimer);
      nextSnapshotTimer = setInterval(updateTimer, 1000);
    }).catch(error => {
      console.error('Error getting alarm:', error);
      nextSnapshotText.textContent = 'Timer not available';
    });
  });
}

// Listen for messages from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateTimer') {
    updateNextSnapshotTimer();
  }
  return true;
});

// Update karma display
function updateKarmaDisplay(count) {
  const oldCount = parseInt(currentKarma.textContent);
  currentKarma.textContent = count;
  
  if (count > oldCount) {
    currentKarma.classList.add('success-animation');
    setTimeout(() => {
      currentKarma.classList.remove('success-animation');
    }, 500);
  }
  
  const target = parseInt(karmaTarget.textContent);
  const percentage = Math.min((count / target) * 100, 100);
  progressFill.style.width = `${percentage}%`;
}

// Handle logging a task
async function handleLogTask() {
  if (!taskInput.value.trim()) return;

  setLoading(true);

  try {
    const timestamp = new Date().toISOString();
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Capture screenshot
    const screenshot = await chrome.tabs.captureVisibleTab(null, { format: 'jpeg', quality: 50 });
    
    // Create log entry
    const logEntry = {
      description: taskInput.value.trim(),
      url: tab.url,
      title: tab.title,
      timestamp,
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

    // Update UI
    updateKarmaDisplay(todayKarma);
    taskInput.value = '';
    
    // Show success feedback
    logButton.classList.add('success-animation');
    setTimeout(() => {
      logButton.classList.remove('success-animation');
    }, 500);

  } catch (error) {
    console.error('Error logging task:', error);
  } finally {
    setLoading(false);
  }
}

// Open web app
function openWebApp() {
  chrome.tabs.create({ url: 'webapp/index.html' });
} 