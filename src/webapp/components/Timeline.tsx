import React, { useState } from 'react';
import { useLogs } from '@/shared/hooks/useLogs';
import { Log } from '@/shared/types';

export function Timeline() {
  const { logs, updateLogDescription, deleteLog } = useLogs();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleEdit = (log: Log) => {
    setEditingId(log.id!);
    setEditText(log.description);
  };

  const handleSave = async (id: number) => {
    try {
      await updateLogDescription(id, editText.trim());
      setEditingId(null);
      setEditText('');
    } catch (error) {
      console.error('Error updating log:', error);
    }
  };

  const handleDelete = async (log: Log) => {
    if (typeof log.id !== 'number') {
      setDeleteError('Invalid log ID');
      return;
    }

    try {
      setDeleteError(null);
      await deleteLog(log.id);
    } catch (error) {
      console.error('Error deleting log:', error);
      setDeleteError('Failed to delete log');
    }
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
      {deleteError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {deleteError}
        </div>
      )}
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
                            onClick={() => handleDelete(log)}
                            className="ml-2 text-sm text-gray-500 hover:text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="mt-2 text-sm text-gray-500">
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      {log.isAutoLog && (
                        <span className="ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                          Automatic Log
                        </span>
                      )}
                    </div>
                    {log.url && (
                      <a
                        href={log.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 block text-sm text-gray-600 hover:text-black"
                      >
                        {log.title || log.url}
                      </a>
                    )}
                    {log.screenshot && (
                      <img
                        src={log.screenshot}
                        alt="Screenshot"
                        className="mt-2 max-w-full h-auto rounded"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 