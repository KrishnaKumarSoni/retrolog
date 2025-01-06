export interface Log {
  id?: number;
  timestamp: Date;
  description: string;
  url: string;
  title: string;
  screenshot?: string;
  isAutoLog: boolean;
  karmaPoints: number;
}

export interface Settings {
  id?: number;
  karmaTarget: number;
  timerLength: number;
  autoLoggingEnabled: boolean;
  lastUpdate: Date;
  todayKarma: number;
}

export interface TimerState {
  id?: number;
  lastActivity: Date;
  nextSnapshot: Date;
  isActive: boolean;
}

export type SortOrder = 'newest' | 'oldest';
export type ViewMode = 'condensed' | 'expanded'; 