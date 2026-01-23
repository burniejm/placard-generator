import XLSX from 'xlsx';
import type { UploadedFile } from '../types.js';
import { v4 as uuidv4 } from 'uuid';

export function parseExcelFile(filePath: string, originalFilename: string): UploadedFile {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert to array of arrays, keeping empty cells
  const rawData: (string | number | undefined)[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: ''
  });

  if (rawData.length === 0) {
    throw new Error('Excel file is empty');
  }

  // First row is headers
  const headers = rawData[0].map(cell => String(cell ?? '').trim());

  // Rest is data (convert all to strings and trim)
  const data = rawData.slice(1).map(row =>
    row.map(cell => String(cell ?? '').trim())
  );

  return {
    fileId: uuidv4(),
    filename: originalFilename,
    originalPath: filePath,
    uploadedAt: new Date(),
    totalRows: data.length,
    headers,
    data
  };
}
