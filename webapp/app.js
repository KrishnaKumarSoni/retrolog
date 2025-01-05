// Create undo notification first
const undoNotification = document.createElement('div');
undoNotification.className = 'undo-notification';
undoNotification.innerHTML = `
  <span>Log deleted</span>
  <button class="undo-button">Undo</button>
`;
document.body.appendChild(undoNotification);

// DOM Elements
const settingsButton = document.getElementById('settingsButton');
const resetButton = document.getElementById('resetButton');
const settingsModal = document.getElementById('settingsModal');
const saveSettingsButton = document.getElementById('saveSettings');
const closeSettingsButton = document.getElementById('closeSettings');
const karmaTargetInput = document.getElementById('karmaTarget');
const sortOrderSelect = document.getElementById('sortOrder');
const appContainer = document.querySelector('.app-container');
const condensedViewBtn = document.getElementById('condensedView');
const expandedViewBtn = document.getElementById('expandedView');
const timelineContainer = document.getElementById('timeline');
const autoLoggingToggle = document.getElementById('autoLogging');
const timerLengthInput = document.getElementById('timerLength');
const saveTimerButton = document.getElementById('saveTimer');
const nextSnapshotText = document.getElementById('nextSnapshot');

// State variables
let nextSnapshotTimer;
let deletedLog = null;
let deleteTimeout = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await initializeSettings();
  setLoading(true);
  loadData().finally(() => setLoading(false));
  setupEventListeners();
});

// Loading State
function setLoading(isLoading) {
  appContainer.classList.toggle('loading', isLoading);
  document.body.style.cursor = isLoading ? 'wait' : 'default';
}

// Event Listeners
function setupEventListeners() {
  settingsButton.addEventListener('click', openSettings);
  closeSettingsButton.addEventListener('click', closeSettings);
  document.getElementById('modalOverlay').addEventListener('click', closeSettings);
  saveSettingsButton.addEventListener('click', saveSettings);
  resetButton.addEventListener('click', confirmReset);
  sortOrderSelect.addEventListener('change', () => {
    setLoading(true);
    loadTimeline(sortOrderSelect.value === 'oldest')
      .finally(() => setLoading(false));
  });
  condensedViewBtn.addEventListener('click', () => toggleView('condensed'));
  expandedViewBtn.addEventListener('click', () => toggleView('expanded'));
  saveTimerButton.addEventListener('click', async () => {
    const minutes = parseInt(timerLengthInput.value);
    if (minutes >= 1 && minutes <= 120) {
      try {
        await chrome.storage.local.set({ timerLength: minutes });
        if (autoLoggingToggle.checked) {
          await chrome.runtime.sendMessage({
            type: 'updateTimer',
            minutes: minutes
          });
        }
        // Show success feedback
        saveTimerButton.textContent = '✓';
        saveTimerButton.disabled = true;
        setTimeout(() => {
          saveTimerButton.textContent = 'Save';
          saveTimerButton.disabled = false;
        }, 1500);
      } catch (error) {
        console.error('Error updating timer:', error);
        // Show error feedback
        saveTimerButton.textContent = '✗';
        setTimeout(() => {
          saveTimerButton.textContent = 'Save';
        }, 1500);
      }
    }
  });
  autoLoggingToggle.addEventListener('change', async () => {
    await chrome.storage.local.set({ autoLogging: autoLoggingToggle.checked });
    chrome.runtime.sendMessage({ 
      action: 'updateAutoLogging', 
      enabled: autoLoggingToggle.checked 
    });
    updateNextSnapshotTimer();
  });
}

// Settings Modal
function openSettings() {
  chrome.storage.local.get(['karmaTarget'], (data) => {
    karmaTargetInput.value = data.karmaTarget || 5;
    settingsModal.classList.add('visible');
  });
}

function closeSettings() {
  settingsModal.classList.remove('visible');
}

async function saveSettings() {
  setLoading(true);
  const target = parseInt(karmaTargetInput.value);
  await chrome.storage.local.set({ karmaTarget: target });
  closeSettings();
  setLoading(false);
}

// Reset Data
async function confirmReset() {
  if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
    setLoading(true);
    await chrome.storage.local.clear();
    await loadData();
    setLoading(false);
  }
}

// Load Data
async function loadData() {
  const data = await chrome.storage.local.get(['logs']);
  updateKarmaStats(data.logs || []);
  renderActivityGraph(data.logs || []);
  await loadTimeline(false);
}

// Update Karma Stats
function updateKarmaStats(logs) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

  const todayCount = logs.filter(log => new Date(log.timestamp) >= today).length;
  const weekCount = logs.filter(log => new Date(log.timestamp) >= weekAgo).length;
  const monthCount = logs.filter(log => new Date(log.timestamp) >= monthAgo).length;

  animateNumber('todayKarma', todayCount);
  animateNumber('weekKarma', weekCount);
  animateNumber('monthKarma', monthCount);
}

// Animate number
function animateNumber(elementId, target) {
  const element = document.getElementById(elementId);
  const start = parseInt(element.textContent);
  const duration = 1000;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const current = Math.round(start + (target - start) * progress);
    element.textContent = current;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// Activity Graph
function renderActivityGraph(logs) {
  const graphContainer = document.getElementById('activityGraph');
  graphContainer.innerHTML = '';

  // Create month labels container
  const monthLabels = document.createElement('div');
  monthLabels.className = 'month-labels';
  graphContainer.appendChild(monthLabels);

  // Create activity grid
  const grid = document.createElement('div');
  grid.className = 'activity-grid';
  
  // Process data
  const today = new Date();
  const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
  
  // Create date map for the past year
  const activityMap = new Map();
  const months = new Set();
  
  for (let d = new Date(yearAgo); d <= today; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    activityMap.set(dateStr, 0);
    months.add(d.toLocaleString('default', { month: 'short' }));
  }

  // Count activities per day
  logs.forEach(log => {
    const date = log.timestamp.split('T')[0];
    if (activityMap.has(date)) {
      activityMap.set(date, Math.min(5, activityMap.get(date) + 1));
    }
  });

  // Add month labels
  const uniqueMonths = [...months];
  uniqueMonths.forEach(month => {
    const monthLabel = document.createElement('span');
    monthLabel.textContent = month;
    monthLabels.appendChild(monthLabel);
  });

  // Create grid cells
  Array.from(activityMap.entries()).forEach(([date, count]) => {
    const cell = document.createElement('div');
    cell.className = 'activity-cell';
    cell.setAttribute('data-count', count);
    cell.title = `${date}: ${count} activities`;
    grid.appendChild(cell);
  });

  graphContainer.appendChild(grid);
}

// Toggle View
function toggleView(view) {
  timelineContainer.className = view;
  condensedViewBtn.classList.toggle('active', view === 'condensed');
  expandedViewBtn.classList.toggle('active', view === 'expanded');
}

// Timeline
async function loadTimeline(oldestFirst) {
  const timelineContainer = document.getElementById('timeline');
  const data = await chrome.storage.local.get(['logs']);
  const logs = data.logs || [];

  // Sort logs
  logs.sort((a, b) => {
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);
    return oldestFirst ? dateA - dateB : dateB - dateA;
  });

  // Clear timeline
  timelineContainer.innerHTML = '';

  // Group logs by date
  const groupedLogs = {};
  logs.forEach(log => {
    const date = new Date(log.timestamp).toLocaleDateString();
    if (!groupedLogs[date]) {
      groupedLogs[date] = [];
    }
    groupedLogs[date].push(log);
  });

  // Create timeline items
  let taskNumber = oldestFirst ? 1 : logs.length;
  
  Object.entries(groupedLogs).forEach(([date, dayLogs], groupIndex) => {
    const dateGroup = document.createElement('div');
    dateGroup.className = 'timeline-date-group';
    
    const dateHeader = document.createElement('div');
    dateHeader.className = 'timeline-date-header';
    dateHeader.textContent = date;
    dateGroup.appendChild(dateHeader);

    dayLogs.forEach((log, index) => {
      const item = document.createElement('div');
      item.className = 'timeline-item';
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';
      
      const time = new Date(log.timestamp).toLocaleTimeString();
      const currentNumber = oldestFirst ? taskNumber++ : taskNumber--;
      const isAutoLog = log.description === 'Automatic snapshot';
      
      item.innerHTML = `
        <div class="task-number">#${currentNumber}</div>
        <div class="time">${time}</div>
        <div class="content">
          ${isAutoLog ? `
            <div class="auto-log-input-container">
              <input type="text" class="auto-log-input" placeholder="What was happening here?" value="${log.description === 'Automatic snapshot' ? '' : log.description}">
              <button class="save-edit-button">Save</button>
            </div>
          ` : `
            <div class="task-description">${log.description}</div>
          `}
          <div class="task-meta">
            <a href="${log.url}" target="_blank" class="task-url" title="${log.title}">
              <svg viewBox="0 0 24 24" class="url-icon">
                <path d="M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z"/>
              </svg>
              ${log.title}
            </a>
            ${isAutoLog ? '<span class="auto-log-label">Automatic Log</span>' : ''}
          </div>
          ${log.screenshot ? `<img src="${log.screenshot}" alt="Screenshot" class="task-screenshot">` : ''}
        </div>
        <button class="delete-button" title="Delete log">
          <svg viewBox="0 0 24 24">
            <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
          </svg>
        </button>
      `;
      
      // Add event listeners
      const deleteButton = item.querySelector('.delete-button');
      deleteButton.addEventListener('click', () => deleteLog(currentNumber - 1, logs));
      
      if (isAutoLog) {
        const input = item.querySelector('.auto-log-input');
        const saveButton = item.querySelector('.save-edit-button');
        
        input.value = log.description === 'Automatic snapshot' ? '' : log.description;
        
        saveButton.addEventListener('click', () => {
          if (input.value.trim()) {
            saveDescription(currentNumber - 1, input.value.trim(), logs);
          }
        });
        
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter' && input.value.trim()) {
            saveDescription(currentNumber - 1, input.value.trim(), logs);
          }
        });
      }
      
      dateGroup.appendChild(item);

      // Animate entry
      setTimeout(() => {
        item.style.transition = 'all 0.3s ease';
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, (groupIndex * dayLogs.length + index) * 50);
    });

    timelineContainer.appendChild(dateGroup);
  });
} 

// Update next snapshot timer
function updateNextSnapshotTimer() {
  if (!autoLoggingToggle.checked) {
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
}

// Listen for messages from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateTimer') {
    updateNextSnapshotTimer();
  }
  if (message.action === 'snapshotTaken') {
    loadData(); // Refresh the data when a snapshot is taken
  }
  return true;
});

// Add this to your existing initialization
async function initializeSettings() {
  const data = await chrome.storage.local.get(['autoLogging', 'timerLength']);
  autoLoggingToggle.checked = data.autoLogging !== false;
  timerLengthInput.value = data.timerLength || 30;
  updateNextSnapshotTimer();
}

// Handle undo
undoNotification.querySelector('.undo-button').addEventListener('click', async () => {
  if (!deletedLog) return;
  
  // Get current logs
  const data = await chrome.storage.local.get(['logs']);
  const logs = data.logs || [];
  
  // Add the log back
  logs.push(deletedLog);
  
  // Sort by timestamp
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Save to storage
  await chrome.storage.local.set({ logs });
  
  // Clear undo state
  deletedLog = null;
  if (deleteTimeout) clearTimeout(deleteTimeout);
  undoNotification.classList.remove('visible');
  
  // Refresh the view
  await loadData();
});

// Handle log deletion
async function deleteLog(logId, logs) {
  const logIndex = logs.findIndex((log, index) => index === logId);
  if (logIndex === -1) return;

  // Store the deleted log
  deletedLog = logs[logIndex];
  
  // Remove log from storage
  logs.splice(logIndex, 1);
  await chrome.storage.local.set({ logs });
  
  // Show undo notification
  undoNotification.classList.add('visible');
  
  // Clear any existing timeout
  if (deleteTimeout) clearTimeout(deleteTimeout);
  
  // Set new timeout
  deleteTimeout = setTimeout(async () => {
    undoNotification.classList.remove('visible');
    deletedLog = null;
  }, 3000);
  
  // Refresh the view
  await loadData();
}

// Handle description edit
async function saveDescription(logId, newDescription, logs) {
  const logIndex = logs.findIndex((log, index) => index === logId);
  if (logIndex === -1) return;
  
  // Update description
  logs[logIndex].description = newDescription;
  
  // Save to storage
  await chrome.storage.local.set({ logs });
  
  // Refresh the view
  await loadData();
} 