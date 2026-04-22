export interface UploadedFile {
  fileId: string;
  filename: string;
  originalPath: string;
  uploadedAt: Date;
  totalRows: number;
  headers: string[];
  data: string[][];
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  originalFilename: string;
  rowsSelected: string[];
  totalRowsOutput: number;
  outputFilename: string;
  outputFileContent: string;
}

export interface TransformedRow {
  sourceRow: number;
  transformed: string[];
  hasFTS: boolean;
}

export interface SelectionRange {
  start: number;
  end: number;
}

// Column mapping: source index -> output position
// Output order: Location, # Sprinklers, Density, Area, Flow Rate, Pressure, Hose Stream, Occupancy, Commodity, Max Height, Date, Contract
export const COLUMN_MAPPING = {
  sourceIndices: [4, 6, 7, 11, 12, 13, 14, 8, 9, 10, 2, 3],
  outputHeaders: [
    'Location',
    '# Sprinklers',
    'Density (GPM/SQFT)',
    'Area of Discharge (SQFT)',
    'Water Flow Rate (GPM)',
    'Residual Pressure (PSI)',
    'Hose Stream Allowance (GPM)',
    'Occupancy Classification',
    'Commodity Classification',
    'Max Storage Height',
    'Date Installed',
    'Contract'
  ],
  contractSourceIndex: 2,
  contractOutputIndex: 11
};

export const FTS_REPLACEMENT = 'www.firetechsystems.com\n(318) 688-8800';
