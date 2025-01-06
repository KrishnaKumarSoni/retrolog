import React, { useState } from 'react';
import { useSettings } from '@/shared/hooks/useSettings';
import { useTimer } from '@/shared/hooks/useTimer';
import { Timeline } from './components/Timeline';
import { Activity } from './components/Activity';
import { Settings } from './components/Settings';

type View = 'timeline' | 'activity' | 'settings';

export function App() {
  const [currentView, setCurrentView] = useState<View>('timeline');
  const { settings } = useSettings();
  const { timeLeft } = useTimer();

  const renderContent = () => {
    switch (currentView) {
      case 'timeline':
        return <Timeline />;
      case 'activity':
        return <Activity />;
      case 'settings':
        return <Settings />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <img src="/icons/icon48.png" alt="RetroLog" className="w-8 h-8" />
                <span className="ml-2 text-xl font-bold">RetroLog</span>
              </div>
              <div className="ml-6 flex space-x-8">
                <button
                  onClick={() => setCurrentView('timeline')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    currentView === 'timeline'
                      ? 'border-black text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Timeline
                </button>
                <button
                  onClick={() => setCurrentView('activity')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    currentView === 'activity'
                      ? 'border-black text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Activity
                </button>
                <button
                  onClick={() => setCurrentView('settings')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    currentView === 'settings'
                      ? 'border-black text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Settings
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  <span className="font-mono">{timeLeft}</span>
                </div>
                <div className="text-sm">
                  <span className="font-mono text-xl">{settings?.todayKarma || 0}</span>
                  <span className="text-gray-500 ml-1">/ {settings?.karmaTarget || 5}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
} 