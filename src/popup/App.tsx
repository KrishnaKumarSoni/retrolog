import React, { useState } from 'react';
import { useSettings } from '@/shared/hooks/useSettings';
import { useTimer } from '@/shared/hooks/useTimer';
import { useLogs } from '@/shared/hooks/useLogs';

export function App() {
  const [description, setDescription] = useState('');
  const { settings } = useSettings();
  const { timeLeft } = useTimer();
  const { createLog } = useLogs();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    try {
      setIsLoading(true);
      await createLog(description.trim());
      setDescription('');
    } finally {
      setIsLoading(false);
    }
  };

  const openWebApp = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('webapp/index.html') });
  };

  return (
    <div className="w-96 p-4 bg-white">
      <div className="flex items-center mb-4">
        <img src="/icons/icon48.png" alt="RetroLog" className="w-8 h-8 mr-2" />
        <h1 className="text-xl font-bold">RetroLog</h1>
      </div>

      <div className="mb-4 p-3 bg-gray-50 rounded">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-2xl font-mono">{settings?.todayKarma || 0}</span>
            <span className="text-gray-500 ml-1">/ {settings?.karmaTarget || 5}</span>
          </div>
          <div className="text-sm text-gray-500 font-mono">{timeLeft}</div>
        </div>
        <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-black transition-all duration-300"
            style={{ 
              width: `${Math.min(100, ((settings?.todayKarma || 0) / (settings?.karmaTarget || 5)) * 100)}%`
            }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What did you just accomplish?"
          className="w-full p-2 mb-2 border border-gray-200 rounded focus:outline-none focus:border-black"
          maxLength={100}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !description.trim()}
          className="w-full p-2 bg-black text-white rounded hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Logging...' : 'Log'}
        </button>
      </form>

      <button
        onClick={openWebApp}
        className="w-full p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
      >
        View Retros
      </button>
    </div>
  );
} 