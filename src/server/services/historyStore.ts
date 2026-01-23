import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { HistoryEntry } from '../types.js';

const DATA_DIR = process.env.DATA_DIR || './data';
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readHistory(): HistoryEntry[] {
  ensureDataDir();
  if (!fs.existsSync(HISTORY_FILE)) {
    return [];
  }
  try {
    const content = fs.readFileSync(HISTORY_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

function writeHistory(history: HistoryEntry[]): void {
  ensureDataDir();
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

export function addHistoryEntry(
  originalFilename: string,
  rowsSelected: string[],
  totalRowsOutput: number,
  outputFilename: string,
  csvContent: string
): HistoryEntry {
  const entry: HistoryEntry = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    originalFilename,
    rowsSelected,
    totalRowsOutput,
    outputFilename,
    outputFileContent: Buffer.from(csvContent).toString('base64')
  };

  const history = readHistory();
  history.unshift(entry); // Add to beginning (newest first)

  // Keep only last 100 entries
  if (history.length > 100) {
    history.splice(100);
  }

  writeHistory(history);
  return entry;
}

export function getHistory(): Omit<HistoryEntry, 'outputFileContent'>[] {
  return readHistory().map(({ outputFileContent, ...rest }) => rest);
}

export function getHistoryEntry(id: string): HistoryEntry | null {
  const history = readHistory();
  return history.find(entry => entry.id === id) || null;
}

export function getCSVContent(id: string): { content: string; filename: string } | null {
  const entry = getHistoryEntry(id);
  if (!entry) return null;

  return {
    content: Buffer.from(entry.outputFileContent, 'base64').toString('utf-8'),
    filename: entry.outputFilename
  };
}
