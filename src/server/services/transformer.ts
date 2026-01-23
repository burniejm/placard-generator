import { COLUMN_MAPPING, FTS_REPLACEMENT, type TransformedRow, type SelectionRange } from '../types.js';

/**
 * Check if a cell contains "FTS" (case-insensitive)
 */
export function hasFTS(value: string): boolean {
  return value.toLowerCase().includes('fts');
}

/**
 * Convert Excel serial date number to mm/dd/yyyy format
 * Excel dates are days since January 1, 1900 (with a leap year bug for 1900)
 */
export function excelDateToString(value: string): string {
  // If it's already a date string (contains /), return as-is
  if (value.includes('/')) {
    return value;
  }

  const serial = parseFloat(value);

  // If not a valid number or too small to be a date, return original
  if (isNaN(serial) || serial < 1) {
    return value;
  }

  // Excel's epoch is January 1, 1900, but Excel incorrectly treats 1900 as a leap year
  // So we need to adjust: dates after Feb 28, 1900 are off by 1
  const excelEpoch = new Date(1899, 11, 30); // Dec 30, 1899
  const date = new Date(excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000);

  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${month}/${day}/${year}`;
}

// Date Installed is at source index 1, which is at output position 10 (0-indexed)
const DATE_OUTPUT_INDEX = 10;

/**
 * Transform a single row according to column mapping and FTS logic
 */
export function transformRow(sourceRow: string[], sourceRowNumber: number): TransformedRow {
  const transformed: string[] = [];
  const contractValue = sourceRow[COLUMN_MAPPING.contractSourceIndex] ?? '';
  const rowHasFTS = hasFTS(contractValue);

  for (let i = 0; i < COLUMN_MAPPING.sourceIndices.length; i++) {
    const sourceIndex = COLUMN_MAPPING.sourceIndices[i];
    let value = sourceRow[sourceIndex] ?? '';

    // Apply FTS transformation for the contract column (last column in output)
    if (i === COLUMN_MAPPING.contractOutputIndex) {
      value = rowHasFTS ? FTS_REPLACEMENT : '';
    }

    // Convert Excel serial date to mm/dd/yyyy for Date Installed column
    if (i === DATE_OUTPUT_INDEX && value) {
      value = excelDateToString(value);
    }

    transformed.push(value);
  }

  return {
    sourceRow: sourceRowNumber,
    transformed,
    hasFTS: rowHasFTS
  };
}

/**
 * Parse selection strings into row numbers
 * Input: ["2-10", "15", "22-25"]
 * Output: [2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 22, 23, 24, 25]
 */
export function parseSelections(selections: string[]): number[] {
  const rows: number[] = [];

  for (const selection of selections) {
    if (selection.includes('-')) {
      const [startStr, endStr] = selection.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);

      if (!isNaN(start) && !isNaN(end) && start >= 2 && end >= start) {
        for (let i = start; i <= end; i++) {
          rows.push(i);
        }
      }
    } else {
      const num = parseInt(selection, 10);
      if (!isNaN(num) && num >= 2) {
        rows.push(num);
      }
    }
  }

  return rows;
}

/**
 * Transform multiple rows based on selections
 * Row numbers are Excel-style (1 = header, 2 = first data row)
 */
export function transformRows(data: string[][], selections: string[]): TransformedRow[] {
  const rowNumbers = parseSelections(selections);
  const results: TransformedRow[] = [];

  for (const rowNum of rowNumbers) {
    // Convert Excel row number to 0-indexed data array
    // Excel row 2 = data[0], Excel row 3 = data[1], etc.
    const dataIndex = rowNum - 2;

    if (dataIndex >= 0 && dataIndex < data.length) {
      results.push(transformRow(data[dataIndex], rowNum));
    }
  }

  return results;
}
