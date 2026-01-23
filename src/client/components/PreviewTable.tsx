interface TransformedRow {
  sourceRow: number;
  transformed: string[];
  hasFTS: boolean;
}

interface PreviewTableProps {
  rows: TransformedRow[];
  isLoading: boolean;
  onRemoveRow?: (sourceRow: number) => void;
}

const HEADERS = [
  'Location',
  '# Spr',
  'Density',
  'Area',
  'Flow',
  'Pressure',
  'Hose',
  'Occupancy',
  'Commodity',
  'Max Ht',
  'Date',
  'FTS'
];

export default function PreviewTable({ rows, isLoading, onRemoveRow }: PreviewTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
        <p className="mt-4 text-gray-600">Loading preview...</p>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        Select rows above to preview the transformed data
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">
          Preview ({rows.length} row{rows.length !== 1 ? 's' : ''} selected)
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Row
              </th>
              {HEADERS.map((header) => (
                <th
                  key={header}
                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
              {onRemoveRow && (
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.map((row, index) => (
              <tr
                key={`${row.sourceRow}-${index}`}
                className={row.hasFTS ? 'bg-green-50' : ''}
              >
                <td className="px-3 py-2 text-gray-500 font-mono text-xs">
                  {row.sourceRow}
                </td>
                {row.transformed.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={`px-3 py-2 whitespace-nowrap ${
                      cellIndex === 11 && row.hasFTS ? 'text-green-700 font-medium' : 'text-gray-900'
                    }`}
                    title={cell}
                  >
                    {cellIndex === 11 && row.hasFTS ? (
                      <span className="inline-flex items-center gap-1">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        FTS
                      </span>
                    ) : (
                      <span className="block max-w-32 truncate">
                        {cell || '-'}
                      </span>
                    )}
                  </td>
                ))}
                {onRemoveRow && (
                  <td className="px-3 py-2">
                    <button
                      onClick={() => onRemoveRow(row.sourceRow)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Remove row"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
