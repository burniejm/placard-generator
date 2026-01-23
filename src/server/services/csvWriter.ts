import type { TransformedRow } from '../types.js';

/**
 * Escape a CSV field according to RFC 4180
 * - Fields containing commas, quotes, or newlines must be quoted
 * - Quotes within fields must be doubled
 */
function escapeField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Convert transformed rows to CSV string
 * No headers, just data rows
 */
export function toCSV(rows: TransformedRow[]): string {
  const lines: string[] = [];

  for (const row of rows) {
    const escapedFields = row.transformed.map(escapeField);
    lines.push(escapedFields.join(','));
  }

  return lines.join('\r\n');
}

/**
 * Generate a timestamped filename for the CSV
 */
export function generateFilename(): string {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0].replace(/:/g, '');
  return `placards_${date}_${time}.csv`;
}
