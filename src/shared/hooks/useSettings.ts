import { useState, useEffect } from 'react';
import { db } from '../db';
import { Settings } from '../types';

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      const data = await db.getSettings();
      setSettings(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load settings'));
    } finally {
      setLoading(false);
    }
  }

  async function updateSettings(updates: Partial<Settings>) {
    try {
      await db.updateSettings(updates);
      await loadSettings();
      
      // Send message to background script if auto-logging or timer settings changed
      if ('autoLoggingEnabled' in updates) {
        chrome.runtime.sendMessage({
          action: 'updateAutoLogging',
          enabled: updates.autoLoggingEnabled
        });
      }
      
      if ('timerLength' in updates) {
        chrome.runtime.sendMessage({
          action: 'updateTimer',
          minutes: updates.timerLength
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update settings'));
      throw err;
    }
  }

  return {
    settings,
    loading,
    error,
    updateSettings,
    reloadSettings: loadSettings
  };
} 