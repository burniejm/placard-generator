import { Router } from 'express';
import { getFile } from '../services/fileStore.js';
import { transformRows } from '../services/transformer.js';

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

    res.json({
      success: true,
      rows: transformedRows
    });
  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate preview'
    });
  }
});

export default router;
