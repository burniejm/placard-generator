import { Router } from 'express';
import { getFile } from '../services/fileStore.js';
import { transformRows } from '../services/transformer.js';
import { toCSV, generateFilename } from '../services/csvWriter.js';
import { addHistoryEntry } from '../services/historyStore.js';

const router = Router();

router.post('/', (req, res) => {
  try {
    const { fileId, selections } = req.body;

    if (!fileId || !selections || !Array.isArray(selections)) {
      return res.status(400).json({
        success: false,
        error: 'fileId and selections array are required'
      });
    }

    const file = getFile(fileId);
    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found. Please upload again.'
      });
    }

    const transformedRows = transformRows(file.data, selections);

    if (transformedRows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid rows selected'
      });
    }

    const csvContent = toCSV(transformedRows);
    const filename = generateFilename();

    // Save to history
    addHistoryEntry(
      file.filename,
      selections,
      transformedRows.length,
      filename,
      csvContent
    );

    // Send CSV file
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Generate error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate CSV'
    });
  }
});

export default router;
