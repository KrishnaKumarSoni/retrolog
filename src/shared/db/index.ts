import Dexie, { Table } from 'dexie';
import { Log, Settings, TimerState } from '../types';

export class RetroLogDB extends Dexie {
  logs!: Table<Log>;
  settings!: Table<Settings>;
  timerStates!: Table<TimerState>;

  constructor() {
    super('retrolog');
    
    this.version(1).stores({
      logs: '++id, timestamp, isAutoLog',
      settings: '++id',
      timerStates: '++id'
    });
  }

  async getSettings(): Promise<Settings> {
    const settings = await this.settings.toArray();
    if (settings.length === 0) {
      const defaultSettings: Settings = {
        karmaTarget: 5,
        timerLength: 30,
        autoLoggingEnabled: false,
        lastUpdate: new Date(),
        todayKarma: 0
      };
      await this.settings.add(defaultSettings);
      return defaultSettings;
    }
    return settings[0];
  }

  async updateSettings(settings: Partial<Settings>): Promise<void> {
    const currentSettings = await this.getSettings();
    await this.settings.where('id').equals(currentSettings.id!).modify(settings);
  }

  async getTimerState(): Promise<TimerState> {
    const states = await this.timerStates.toArray();
    if (states.length === 0) {
      const defaultState: TimerState = {
        lastActivity: new Date(),
        nextSnapshot: new Date(),
        isActive: false
      };
      await this.timerStates.add(defaultState);
      return defaultState;
    }
    return states[0];
  }

  async updateTimerState(state: Partial<TimerState>): Promise<void> {
    const currentState = await this.getTimerState();
    await this.timerStates.where('id').equals(currentState.id!).modify(state);
  }
}

export const db = new RetroLogDB(); 