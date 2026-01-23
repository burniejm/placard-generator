import { useState } from 'react';

interface RowSelectorProps {
  onAddSelection: (selection: string) => void;
  maxRow: number;
}

export default function RowSelector({ onAddSelection, maxRow }: RowSelectorProps) {
  const [startRow, setStartRow] = useState('');
  const [endRow, setEndRow] = useState('');
  const [singleRow, setSingleRow] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateRow = (value: string): boolean => {
    const num = parseInt(value, 10);
    return !isNaN(num) && num >= 2 && num <= maxRow;
  };

  const handleAddRange = () => {
    setError(null);

    if (!validateRow(startRow) || !validateRow(endRow)) {
      setError(`Row numbers must be between 2 and ${maxRow}`);
      return;
    }

    const start = parseInt(startRow, 10);
    const end = parseInt(endRow, 10);

    if (start > end) {
      setError('Start row must be less than or equal to end row');
      return;
    }

    onAddSelection(`${start}-${end}`);
    setStartRow('');
    setEndRow('');
  };

  const handleAddSingle = () => {
    setError(null);

    if (!validateRow(singleRow)) {
      setError(`Row number must be between 2 and ${maxRow}`);
      return;
    }

    onAddSelection(singleRow);
    setSingleRow('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Row Selection</h2>

      <div className="flex flex-wrap gap-6">
        {/* Range Selection */}
        <div className="flex items-end gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Start Row</label>
            <input
              type="number"
              min={2}
              max={maxRow}
              value={startRow}
              onChange={(e) => setStartRow(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, handleAddRange)}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="2"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">End Row</label>
            <input
              type="number"
              min={2}
              max={maxRow}
              value={endRow}
              onChange={(e) => setEndRow(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, handleAddRange)}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="10"
            />
          </div>
          <button
            onClick={handleAddRange}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Range
          </button>
        </div>

        <div className="border-l border-gray-200 hidden sm:block" />

        {/* Single Row Selection */}
        <div className="flex items-end gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Single Row</label>
            <input
              type="number"
              min={2}
              max={maxRow}
              value={singleRow}
              onChange={(e) => setSingleRow(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, handleAddSingle)}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="15"
            />
          </div>
          <button
            onClick={handleAddSingle}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Row
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <p className="mt-4 text-sm text-gray-500">
        Row 1 is the header. Select data rows starting from row 2. Max row: {maxRow}
      </p>
    </div>
  );
}
