import { useState, useEffect } from 'react';
import { db } from '../db';
import { Log, SortOrder } from '../types';

export function useLogs(sortOrder: SortOrder = 'newest') {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadLogs();
  }, [sortOrder]);

  async function loadLogs() {
    try {
      setLoading(true);
      let query = db.logs.orderBy('timestamp');
      
      if (sortOrder === 'newest') {
        query = query.reverse();
      }
      
      const data = await query.toArray();
      setLogs(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load logs'));
    } finally {
      setLoading(false);
    }
  }

  async function createLog(description: string) {
    try {
      await chrome.runtime.sendMessage({
        action: 'createLog',
        description
      });
      await loadLogs();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create log'));
      throw err;
    }
  }

  async function updateLogDescription(id: number, description: string) {
    try {
      await chrome.runtime.sendMessage({
        action: 'updateLogDescription',
        id,
        description
      });
      await loadLogs();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update log'));
      throw err;
    }
  }

  async function deleteLog(id: number) {
    try {
      await chrome.runtime.sendMessage({
        action: 'deleteLog',
        id
      });
      await loadLogs();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete log'));
      throw err;
    }
  }

  return {
    logs,
    loading,
    error,
    createLog,
    updateLogDescription,
    deleteLog,
    reloadLogs: loadLogs
  };
} 