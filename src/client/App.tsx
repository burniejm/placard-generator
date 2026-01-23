import { useState } from 'react';
import FileUpload from './components/FileUpload';
import RowSelector from './components/RowSelector';
import SelectionChips from './components/SelectionChips';
import PreviewTable from './components/PreviewTable';
import GenerateButton from './components/GenerateButton';
import HistoryPanel from './components/HistoryPanel';

interface UploadResponse {
  fileId: string;
  filename: string;
  totalRows: number;
  headers: string[];
}

interface TransformedRow {
  sourceRow: number;
  transformed: string[];
  hasFTS: boolean;
}

export default function App() {
  const [uploadData, setUploadData] = useState<UploadResponse | null>(null);
  const [selections, setSelections] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<TransformedRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleUploadSuccess = (data: UploadResponse) => {
    setUploadData(data);
    setSelections([]);
    setPreviewRows([]);
  };

  const handleClear = () => {
    setUploadData(null);
    setSelections([]);
    setPreviewRows([]);
  };

  const handleAddSelection = (selection: string) => {
    const newSelections = [...selections, selection];
    setSelections(newSelections);
    fetchPreview(newSelections);
  };

  const handleRemoveSelection = (index: number) => {
    const newSelections = selections.filter((_, i) => i !== index);
    setSelections(newSelections);
    if (newSelections.length > 0) {
      fetchPreview(newSelections);
    } else {
      setPreviewRows([]);
    }
  };

  const handleClearAllSelections = () => {
    setSelections([]);
    setPreviewRows([]);
  };

  const handleRemoveRow = (sourceRow: number) => {
    // Expand all selections to individual rows, remove the target row
    const expandedRows: number[] = [];
    for (const sel of selections) {
      if (sel.includes('-')) {
        const [start, end] = sel.split('-').map(Number);
        for (let i = start; i <= end; i++) {
          expandedRows.push(i);
        }
      } else {
        expandedRows.push(Number(sel));
      }
    }

    // Remove the target row
    const filteredRows = expandedRows.filter(r => r !== sourceRow);

    if (filteredRows.length === 0) {
      setSelections([]);
      setPreviewRows([]);
      return;
    }

    // Convert back to selection strings (as individual rows for simplicity)
    const newSelections = filteredRows.map(r => String(r));
    setSelections(newSelections);
    fetchPreview(newSelections);
  };

  const fetchPreview = async (sels: string[]) => {
    if (!uploadData) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: uploadData.fileId,
          selections: sels
        })
      });
      const data = await response.json();
      if (data.success) {
        setPreviewRows(data.rows);
      }
    } catch (error) {
      console.error('Preview error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!uploadData || selections.length === 0) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: uploadData.fileId,
          selections
        })
      });

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
    } catch (error) {
      console.error('Generate error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Placard Generator</h1>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
          >
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
        </div>

        {showHistory ? (
          <HistoryPanel onClose={() => setShowHistory(false)} />
        ) : (
          <div className="space-y-6">
            <FileUpload
              onUploadSuccess={handleUploadSuccess}
              onClear={handleClear}
              uploadedFile={uploadData?.filename}
              totalRows={uploadData?.totalRows}
            />

            {uploadData && (
              <>
                <RowSelector
                  onAddSelection={handleAddSelection}
                  maxRow={uploadData.totalRows + 1}
                />

                <SelectionChips
                  selections={selections}
                  onRemove={handleRemoveSelection}
                  onClearAll={handleClearAllSelections}
                />

                <PreviewTable
                  rows={previewRows}
                  isLoading={isLoading}
                  onRemoveRow={handleRemoveRow}
                />

                <GenerateButton
                  onClick={handleGenerate}
                  disabled={selections.length === 0 || isLoading}
                  rowCount={previewRows.length}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
