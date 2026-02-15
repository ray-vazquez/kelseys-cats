// Debug routes for troubleshooting
import express from 'express';
import { query } from '../lib/db.js';

const router = express.Router();

/**
 * GET /api/debug/view-columns
 * Shows the columns available in all_available_cats view
 */
router.get('/view-columns', async (req, res) => {
  try {
    const [columns] = await query(
      `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'all_available_cats' 
       ORDER BY ORDINAL_POSITION`
    );
    
    res.json({
      success: true,
      view_name: 'all_available_cats',
      columns: columns
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      sql_state: error.sqlState
    });
  }
});

/**
 * GET /api/debug/sample-cats
 * Returns raw sample cats from view
 */
router.get('/sample-cats', async (req, res) => {
  try {
    const [cats] = await query(
      'SELECT * FROM all_available_cats LIMIT 5'
    );
    
    res.json({
      success: true,
      count: cats.length,
      cats: cats
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      sql_state: error.sqlState
    });
  }
});

/**
 * GET /api/debug/test-search
 * Test search functionality
 */
router.get('/test-search', async (req, res) => {
  const { search } = req.query;
  
  try {
    const searchTerm = search || 'test';
    const [cats] = await query(
      `SELECT id, name, breed, description 
       FROM all_available_cats 
       WHERE name LIKE ? OR breed LIKE ? OR description LIKE ?
       LIMIT 10`,
      [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
    );
    
    res.json({
      success: true,
      search_term: searchTerm,
      count: cats.length,
      cats: cats
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      sql_state: error.sqlState
    });
  }
});

export default router;
