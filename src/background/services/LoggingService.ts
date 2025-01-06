import { db } from '@/shared/db';
import { Log } from '@/shared/types';
import { timerService } from './TimerService';

export class LoggingService {
  async createManualLog(description: string): Promise<void> {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) {
        throw new Error('No active tab found');
      }

      const screenshot = await this.captureScreenshot();
      const log: Log = {
        timestamp: new Date(),
        description,
        url: tab.url!,
        title: tab.title!,
        screenshot,
        isAutoLog: false,
        karmaPoints: 1
      };

      await db.logs.add(log);
      await this.updateKarmaPoints();
    } catch (error) {
      console.error('Error creating manual log:', error);
      throw error;
    }
  }

  async createAutoLog(): Promise<void> {
    try {
      // Check if user is active
      if (!await timerService.isUserActive()) {
        console.log('User inactive, skipping auto-log');
        return;
      }

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) {
        throw new Error('No active tab found');
      }

      // Skip restricted pages
      if (this.isRestrictedPage(tab.url!)) {
        console.log('Restricted page, skipping auto-log');
        return;
      }

      const screenshot = await this.captureScreenshot();
      const log: Log = {
        timestamp: new Date(),
        description: 'Automatic snapshot',
        url: tab.url!,
        title: tab.title!,
        screenshot,
        isAutoLog: true,
        karmaPoints: 1
      };

      await db.logs.add(log);
      await this.updateKarmaPoints();
    } catch (error) {
      console.error('Error creating auto log:', error);
    }
  }

  async updateLogDescription(id: number, description: string): Promise<void> {
    await db.logs.update(id, { description });
  }

  async deleteLog(id: number): Promise<void> {
    try {
      const log = await db.logs.get(id);
      if (!log) {
        throw new Error(`Log with ID ${id} not found`);
      }
      
      await db.logs.delete(id);
      await this.updateKarmaPoints();
    } catch (error) {
      console.error('Error deleting log:', error);
      throw error;
    }
  }

  private async captureScreenshot(): Promise<string | undefined> {
    try {
      const currentWindow = await chrome.windows.getCurrent();
      const options = { format: 'jpeg' as const, quality: 50 };
      const dataUrl = await chrome.tabs.captureVisibleTab(currentWindow.id!, options);
      return dataUrl;
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      return undefined;
    }
  }

  private isRestrictedPage(url: string): boolean {
    return url.startsWith('chrome://') || 
           url.startsWith('edge://') || 
           url.startsWith('about:');
  }

  private async updateKarmaPoints(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayLogs = await db.logs
      .where('timestamp')
      .aboveOrEqual(today)
      .toArray();

    const todayKarma = todayLogs.reduce((sum, log) => sum + log.karmaPoints, 0);
    
    try {
      const views = chrome.extension.getViews({ type: 'popup' });
      if (views.length > 0) {
        await chrome.runtime.sendMessage({
          action: 'updateKarma',
          karma: todayKarma
        });
      }
    } catch (error) {
      console.log('UI not available for karma update');
    }
  }
}

export const loggingService = new LoggingService(); 