import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { parseExcelFile } from '../services/excelParser.js';
import { storeFile } from '../services/fileStore.js';

const router = Router();

// Ensure uploads directory exists
const UPLOADS_DIR = './uploads';
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.xlsx' || ext === '.xls') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

router.post('/', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const uploadedFile = parseExcelFile(req.file.path, req.file.originalname);
    storeFile(uploadedFile);

    // Return file info with preview of first 20 rows
    const preview = uploadedFile.data.slice(0, 20).map((row, index) => ({
      row: index + 2, // Excel row number (1 = header, 2 = first data)
      data: row
    }));

    res.json({
      success: true,
      fileId: uploadedFile.fileId,
      filename: uploadedFile.filename,
      totalRows: uploadedFile.totalRows,
      headers: uploadedFile.headers,
      preview
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process file'
    });
  }
});

export default router;
