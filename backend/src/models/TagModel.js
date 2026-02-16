import { query } from '../lib/db.js';

export class TagModel {
  static async findAll() {
    const [rows] = await query('SELECT * FROM tags ORDER BY name ASC');
    return rows;
  }

  static async findOrCreateByName(name, categoryId = null) {
    const [rows] = await query(
      'SELECT * FROM tags WHERE name = ? AND (category_id = ? OR (category_id IS NULL AND ? IS NULL))', 
      [name, categoryId, categoryId]
    );
    
    if (rows[0]) return rows[0];
    
    const [result] = await query(
      'INSERT INTO tags (name, category_id) VALUES (?, ?)', 
      [name, categoryId]
    );
    
    return { id: result.insertId, name, category_id: categoryId };
  }

  static async findTagsForCat(catId) {
    const sql = `
      SELECT 
        t.id, 
        t.name, 
        t.category_id,
        tc.name as category_name
      FROM tags t
      INNER JOIN cat_tags ct ON ct.tag_id = t.id
      LEFT JOIN tag_categories tc ON t.category_id = tc.id
      WHERE ct.cat_id = ?
      ORDER BY tc.name, t.name
    `;
    
    const [rows] = await query(sql, [catId]);
    
    // Filter out any nulls (safety)
    return rows.filter(tag => tag && tag.id && tag.name);
  }

  static async setTagsForCat(catId, tagNames, categoryId = null) {
    // Delete existing tags for this cat
    await query('DELETE FROM cat_tags WHERE cat_id = ?', [catId]);
    
    if (!tagNames || !Array.isArray(tagNames) || tagNames.length === 0) {
      return; // No tags to set
    }
    
    for (const name of tagNames) {
      if (!name || typeof name !== 'string' || !name.trim()) {
        continue; // Skip invalid tag names
      }
      
      const tag = await this.findOrCreateByName(name.trim(), categoryId);
      await query(
        'INSERT INTO cat_tags (cat_id, tag_id) VALUES (?, ?)', 
        [catId, tag.id]
      );
    }
  }

  static async findCatsByTags(tagNames) {
    if (!tagNames || !tagNames.length) return [];
    
    const placeholders = tagNames.map(() => '?').join(', ');
    const sql = `
      SELECT DISTINCT c.*
      FROM cats c
      INNER JOIN cat_tags ct ON c.id = ct.cat_id
      INNER JOIN tags t ON t.id = ct.tag_id
      WHERE t.name IN (${placeholders}) 
        AND c.deleted_at IS NULL
    `;
    
    const [rows] = await query(sql, tagNames);
    return rows;
  }
  
  // Get tags grouped by category for a cat
  static async findTagsForCatByCategory(catId) {
    const tags = await this.findTagsForCat(catId);
    
    const grouped = {
      temperament: [],
      medical: [],
      other: []
    };
    
    tags.forEach(tag => {
      const category = tag.category_name?.toLowerCase();
      if (category === 'temperament') {
        grouped.temperament.push(tag.name);
      } else if (category === 'medical') {
        grouped.medical.push(tag.name);
      } else {
        grouped.other.push(tag.name);
      }
    });
    
    return grouped;
  }
}
