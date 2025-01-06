import { useState, useEffect } from 'react';
import { db } from '../db';
import { TimerState } from '../types';

export function useTimer() {
  const [timerState, setTimerState] = useState<TimerState | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('--:--');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadTimerState();
    const interval = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const listener = (message: any) => {
      if (message.action === 'updateTimer') {
        loadTimerState();
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  async function loadTimerState() {
    try {
      setLoading(true);
      const state = await db.getTimerState();
      setTimerState(state);
      setError(null);
      updateTimeLeft();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load timer state'));
    } finally {
      setLoading(false);
    }
  }

  function updateTimeLeft() {
    if (!timerState?.nextSnapshot || !timerState.isActive) {
      setTimeLeft('--:--');
      return;
    }

    const now = Date.now();
    const next = new Date(timerState.nextSnapshot).getTime();
    const diff = Math.max(0, next - now);

    if (diff === 0) {
      loadTimerState();
      return;
    }

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
  }

  return {
    timerState,
    timeLeft,
    loading,
    error,
    reloadTimer: loadTimerState
  };
} 