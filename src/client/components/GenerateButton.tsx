interface GenerateButtonProps {
  onClick: () => void;
  disabled: boolean;
  rowCount: number;
}

export default function GenerateButton({ onClick, disabled, rowCount }: GenerateButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full py-4 rounded-lg text-lg font-semibold transition-colors
        flex items-center justify-center gap-2
        ${disabled
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-green-600 text-white hover:bg-green-700'
        }
      `}
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Generate CSV{rowCount > 0 ? ` (${rowCount} rows)` : ''}
    </button>
  );
}
