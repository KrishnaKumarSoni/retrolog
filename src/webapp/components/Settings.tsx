import React, { useState } from 'react';
import { useSettings } from '@/shared/hooks/useSettings';

export function Settings() {
  const { settings, updateSettings } = useSettings();
  const [timerLength, setTimerLength] = useState(settings?.timerLength || 30);
  const [karmaTarget, setKarmaTarget] = useState(settings?.karmaTarget || 5);
  const [autoLogging, setAutoLogging] = useState(settings?.autoLoggingEnabled || false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateSettings({
        timerLength,
        karmaTarget,
        autoLoggingEnabled: autoLogging,
        lastUpdate: new Date()
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-gray-200 divide-y divide-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-medium">Timer Settings</h3>
          <p className="mt-1 text-sm text-gray-500">
            Configure how often RetroLog should automatically capture your activity.
          </p>
          <div className="mt-6 space-y-6">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={autoLogging}
                  onChange={(e) => setAutoLogging(e.target.checked)}
                  className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                />
                <span className="ml-2">Enable automatic logging</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Timer interval (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={timerLength}
                onChange={(e) => setTimerLength(Number(e.target.value))}
                disabled={!autoLogging}
                className="mt-1 block w-full border-gray-300 rounded-sm shadow-sm focus:border-black focus:ring-black disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-medium">Karma Settings</h3>
          <p className="mt-1 text-sm text-gray-500">
            Set your daily karma target to track your productivity goals.
          </p>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700">
              Daily karma target
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={karmaTarget}
              onChange={(e) => setKarmaTarget(Number(e.target.value))}
              className="mt-1 block w-full border-gray-300 rounded-sm shadow-sm focus:border-black focus:ring-black"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-black text-white rounded-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
} 