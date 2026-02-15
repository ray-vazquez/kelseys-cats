// backend/src/controllers/tags.controller.js
// Controller for tag management - categorized tags for temperament, medical, etc.

import { query } from '../lib/db.js';

/**
 * GET /api/tags
 * Get all tags, optionally filtered by category
 * Query params:
 * - category: temperament, medical, general (optional)
 */
export async function getAllTags(req, res) {
  try {
    const { category } = req.query;
    
    let sql = `
      SELECT 
        t.id,
        t.name,
        t.category_id,
        tc.name as category_name,
        tc.description as category_description
      FROM tags t
      LEFT JOIN tag_categories tc ON t.category_id = tc.id
    `;
    
    const params = [];
    
    if (category) {
      sql += ' WHERE tc.name = ?';
      params.push(category);
    }
    
    sql += ' ORDER BY tc.name ASC, t.name ASC';
    
    const [tags] = await query(sql, params);
    
    // Group by category for easier frontend consumption
    const grouped = tags.reduce((acc, tag) => {
      const catName = tag.category_name || 'uncategorized';
      if (!acc[catName]) {
        acc[catName] = {
          category: catName,
          description: tag.category_description,
          tags: []
        };
      }
      acc[catName].tags.push({
        id: tag.id,
        name: tag.name
      });
      return acc;
    }, {});
    
    res.json({
      tags: tags,
      grouped: Object.values(grouped)
    });
    
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ 
      error: 'Failed to fetch tags',
      message: error.message 
    });
  }
}

/**
 * GET /api/tags/categories
 * Get all tag categories
 */
export async function getTagCategories(req, res) {
  try {
    const [categories] = await query(
      'SELECT * FROM tag_categories ORDER BY name ASC'
    );
    
    res.json(categories);
    
  } catch (error) {
    console.error('Error fetching tag categories:', error);
    res.status(500).json({ 
      error: 'Failed to fetch tag categories',
      message: error.message 
    });
  }
}

/**
 * POST /api/tags
 * Create a new tag (admin only)
 * Body: { name: string, category_id: number }
 */
export async function createTag(req, res) {
  try {
    const { name, category_id } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Tag name is required' });
    }
    
    // Check if tag already exists
    const [existing] = await query(
      'SELECT * FROM tags WHERE name = ?',
      [name.trim()]
    );
    
    if (existing.length > 0) {
      return res.status(409).json({ 
        error: 'Tag already exists',
        tag: existing[0]
      });
    }
    
    // Insert new tag
    const [result] = await query(
      'INSERT INTO tags (name, category_id) VALUES (?, ?)',
      [name.trim(), category_id || null]
    );
    
    // Fetch the created tag
    const [newTag] = await query(
      `SELECT t.*, tc.name as category_name 
       FROM tags t 
       LEFT JOIN tag_categories tc ON t.category_id = tc.id 
       WHERE t.id = ?`,
      [result.insertId]
    );
    
    res.status(201).json(newTag[0]);
    
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({ 
      error: 'Failed to create tag',
      message: error.message 
    });
  }
}

/**
 * GET /api/cats/:id/tags
 * Get all tags for a specific cat, grouped by category
 */
export async function getCatTags(req, res) {
  try {
    const { id } = req.params;
    
    const [tags] = await query(
      `SELECT 
        t.id,
        t.name,
        tc.id as category_id,
        tc.name as category_name
      FROM cat_tags ct
      JOIN tags t ON ct.tag_id = t.id
      LEFT JOIN tag_categories tc ON t.category_id = tc.id
      WHERE ct.cat_id = ?
      ORDER BY tc.name ASC, t.name ASC`,
      [id]
    );
    
    // Group by category
    const grouped = tags.reduce((acc, tag) => {
      const catName = tag.category_name || 'general';
      if (!acc[catName]) {
        acc[catName] = [];
      }
      acc[catName].push({
        id: tag.id,
        name: tag.name
      });
      return acc;
    }, {});
    
    res.json({
      tags: tags,
      grouped: grouped
    });
    
  } catch (error) {
    console.error('Error fetching cat tags:', error);
    res.status(500).json({ 
      error: 'Failed to fetch cat tags',
      message: error.message 
    });
  }
}

/**
 * PUT /api/cats/:id/tags
 * Update tags for a specific cat (replaces all tags)
 * Body: { temperament: [tag_ids], medical: [tag_ids], general: [tag_ids] }
 * OR: { tag_ids: [1, 2, 3] } for simple array
 */
export async function updateCatTags(req, res) {
  try {
    const { id } = req.params;
    const body = req.body;
    
    // Support both formats: categorized object or simple array
    let tagIds = [];
    
    if (Array.isArray(body.tag_ids)) {
      // Simple array format
      tagIds = body.tag_ids;
    } else if (typeof body === 'object') {
      // Categorized format: flatten all category arrays
      tagIds = [
        ...(body.temperament || []),
        ...(body.medical || []),
        ...(body.general || [])
      ];
    }
    
    // Remove duplicates
    tagIds = [...new Set(tagIds)];
    
    // Start transaction
    await query('START TRANSACTION');
    
    try {
      // Delete existing tags for this cat
      await query('DELETE FROM cat_tags WHERE cat_id = ?', [id]);
      
      // Insert new tags
      if (tagIds.length > 0) {
        const values = tagIds.map(tagId => `(${id}, ${tagId})`).join(',');
        await query(`INSERT INTO cat_tags (cat_id, tag_id) VALUES ${values}`);
      }
      
      await query('COMMIT');
      
      // Return updated tags
      const [updatedTags] = await query(
        `SELECT t.id, t.name, tc.name as category_name
         FROM cat_tags ct
         JOIN tags t ON ct.tag_id = t.id
         LEFT JOIN tag_categories tc ON t.category_id = tc.id
         WHERE ct.cat_id = ?
         ORDER BY tc.name ASC, t.name ASC`,
        [id]
      );
      
      res.json({
        success: true,
        tags: updatedTags
      });
      
    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }
    
  } catch (error) {
    console.error('Error updating cat tags:', error);
    res.status(500).json({ 
      error: 'Failed to update cat tags',
      message: error.message 
    });
  }
}
