import { Router } from 'express';
import { getHistory, getCSVContent } from '../services/historyStore.js';

const router = Router();

// Get all history entries
router.get('/', (req, res) => {
  try {
    const history = getHistory();
    res.json({ success: true, history });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch history'
    });
  }
});

// Download a specific history entry
router.get('/:id/download', (req, res) => {
  try {
    const { id } = req.params;
    const result = getCSVContent(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'History entry not found'
      });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(result.content);
  } catch (error) {
    console.error('History download error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to download file'
    });
  }
});

export default router;
