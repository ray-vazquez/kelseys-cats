import { query } from '../lib/db.js';

export class TagModel {
  static async findAll() {
    return query('SELECT * FROM tags ORDER BY name ASC');
  }

  static async findOrCreateByName(name) {
    const rows = await query('SELECT * FROM tags WHERE name = ?', [name]);
    if (rows[0]) return rows[0];
    const result = await query('INSERT INTO tags (name) VALUES (?)', [name]);
    return { id: result.insertId, name };
  }

  static async findTagsForCat(catId) {
    const sql = `
      SELECT t.* FROM tags t
      JOIN cat_tags ct ON ct.tag_id = t.id
      WHERE ct.cat_id = ?
    `;
    return query(sql, [catId]);
  }

  static async setTagsForCat(catId, tagNames) {
    await query('DELETE FROM cat_tags WHERE cat_id = ?', [catId]);
    for (const name of tagNames) {
      const tag = await this.findOrCreateByName(name.trim());
      await query('INSERT INTO cat_tags (cat_id, tag_id) VALUES (?, ?)', [catId, tag.id]);
    }
  }

  static async findCatsByTags(tagNames) {
    if (!tagNames || !tagNames.length) return [];
    const placeholders = tagNames.map(() => '?').join(', ');
    const sql = `
      SELECT DISTINCT c.*
      FROM cats c
      JOIN cat_tags ct ON c.id = ct.cat_id
      JOIN tags t ON t.id = ct.tag_id
      WHERE t.name IN (${placeholders}) AND c.deleted_at IS NULL
    `;
    return query(sql, tagNames);
  }
}
