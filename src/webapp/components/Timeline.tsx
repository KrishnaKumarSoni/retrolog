import React, { useState } from 'react';
import { Log } from '@/shared/types';
import { useLogs } from '@/shared/hooks/useLogs';

export function Timeline() {
  const { logs, updateLogDescription, deleteLog } = useLogs();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  const handleEdit = (log: Log) => {
    setEditingId(log.id!);
    setEditText(log.description);
  };

  const handleSave = async (id: number) => {
    await updateLogDescription(id, editText.trim());
    setEditingId(null);
    setEditText('');
  };

  const handleDelete = async (id: number) => {
    await deleteLog(id);
  };

  const groupedLogs = logs.reduce((groups, log) => {
    const date = new Date(log.timestamp).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(log);
    return groups;
  }, {} as Record<string, Log[]>);

  return (
    <div className="space-y-8">
      {Object.entries(groupedLogs).map(([date, logs]) => (
        <div key={date} className="space-y-4">
          <h2 className="text-lg font-semibold">{date}</h2>
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="bg-white p-4 border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {editingId === log.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="flex-1 p-1 border border-gray-300 rounded focus:outline-none focus:border-black"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSave(log.id!)}
                          className="px-2 py-1 text-sm bg-black text-white rounded hover:bg-gray-800"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="group flex items-start">
                        <p className="flex-1">{log.description}</p>
                        <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(log)}
                            className="text-sm text-gray-500 hover:text-gray-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(log.id!)}
                            className="ml-2 text-sm text-gray-500 hover:text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                    {log.isAutoLog && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                        automatic log
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <a
                    href={log.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gray-700"
                  >
                    {log.title}
                  </a>
                </div>
                {log.screenshot && (
                  <img
                    src={log.screenshot}
                    alt="Screenshot"
                    className="mt-4 w-full h-auto rounded border border-gray-200"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 