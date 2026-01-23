import { useEffect, useState } from 'react';

interface HistoryEntry {
  id: string;
  timestamp: string;
  originalFilename: string;
  rowsSelected: string[];
  totalRowsOutput: number;
}

interface HistoryPanelProps {
  onClose: () => void;
}

export default function HistoryPanel({ onClose }: HistoryPanelProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/history');
      const data = await response.json();
      if (data.success) {
        setHistory(data.history);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const response = await fetch(`/api/history/${id}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const filename = response.headers.get('Content-Disposition')
          ?.split('filename=')[1]?.replace(/"/g, '') || 'placards.csv';

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      }
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
        <p className="mt-4 text-gray-600">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Export History</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600">{error}</div>
      )}

      {history.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No export history yet. Generate some CSVs to see them here.
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {history.map((entry) => (
            <div key={entry.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-800">{entry.originalFilename}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(entry.timestamp)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {entry.totalRowsOutput} rows | Selections: {entry.rowsSelected.join(', ')}
                  </p>
                </div>
                <button
                  onClick={() => handleDownload(entry.id)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
