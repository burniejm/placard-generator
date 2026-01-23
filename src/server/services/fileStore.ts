import type { UploadedFile } from '../types.js';

// In-memory store for uploaded files
// Files are cleared after 1 hour of inactivity
const fileStore = new Map<string, UploadedFile>();
const EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export function storeFile(file: UploadedFile): void {
  fileStore.set(file.fileId, file);

  // Schedule cleanup
  setTimeout(() => {
    fileStore.delete(file.fileId);
  }, EXPIRY_MS);
}

export function getFile(fileId: string): UploadedFile | undefined {
  return fileStore.get(fileId);
}

export function deleteFile(fileId: string): boolean {
  return fileStore.delete(fileId);
}
