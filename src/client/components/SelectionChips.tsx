interface SelectionChipsProps {
  selections: string[];
  onRemove: (index: number) => void;
  onClearAll: () => void;
}

export default function SelectionChips({ selections, onRemove, onClearAll }: SelectionChipsProps) {
  if (selections.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-600 mr-2">Selected:</span>
        {selections.map((selection, index) => (
          <span
            key={`${selection}-${index}`}
            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
          >
            {selection.includes('-') ? `Rows ${selection}` : `Row ${selection}`}
            <button
              onClick={() => onRemove(index)}
              className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-blue-200 transition-colors"
              aria-label={`Remove selection ${selection}`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
        <button
          onClick={onClearAll}
          className="ml-2 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-full transition-colors"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
