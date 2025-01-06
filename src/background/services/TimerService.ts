import { db } from '@/shared/db';
import { Settings, TimerState } from '@/shared/types';

export class TimerService {
  private static INACTIVITY_THRESHOLD = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.initialize();
  }

  private async initialize() {
    const settings = await db.getSettings();
    if (settings.autoLoggingEnabled) {
      await this.setupAlarm(settings.timerLength);
    }
  }

  async setupAlarm(minutes: number): Promise<void> {
    try {
      console.log('Setting up alarm for', minutes, 'minutes');
      
      // Clear any existing alarm first
      await chrome.alarms.clear('takeSnapshot');
      
      // Check auto-logging state
      const settings = await db.getSettings();
      if (!settings.autoLoggingEnabled) {
        console.log('Auto-logging is disabled, not creating alarm');
        return;
      }
      
      // Create new alarm
      await chrome.alarms.create('takeSnapshot', {
        periodInMinutes: minutes
      });
      
      // Update timer state
      const nextSnapshot = new Date(Date.now() + minutes * 60 * 1000);
      await db.updateTimerState({ nextSnapshot, isActive: true });
      
      // Notify UI if available
      try {
        const views = chrome.extension.getViews({ type: 'popup' });
        if (views.length > 0) {
          await chrome.runtime.sendMessage({ action: 'updateTimer' });
        }
      } catch (error) {
        console.log('UI not available for timer update');
      }
      
      console.log('Alarm setup complete');
    } catch (error) {
      console.error('Error setting up alarm:', error);
    }
  }

  async updateLastActivity(): Promise<void> {
    await db.updateTimerState({ lastActivity: new Date() });
  }

  async isUserActive(): Promise<boolean> {
    const state = await db.getTimerState();
    return Date.now() - state.lastActivity.getTime() < TimerService.INACTIVITY_THRESHOLD;
  }

  async toggleAutoLogging(enabled: boolean): Promise<void> {
    const settings = await db.getSettings();
    await db.updateSettings({ autoLoggingEnabled: enabled });
    
    if (enabled) {
      await this.setupAlarm(settings.timerLength);
    } else {
      await chrome.alarms.clear('takeSnapshot');
      await db.updateTimerState({ isActive: false });
    }
  }

  async updateTimerLength(minutes: number): Promise<void> {
    const settings = await db.getSettings();
    await db.updateSettings({ timerLength: minutes });
    
    if (settings.autoLoggingEnabled) {
      await this.setupAlarm(minutes);
    }
  }
}

export const timerService = new TimerService(); 