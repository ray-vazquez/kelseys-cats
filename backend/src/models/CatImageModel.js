import { query } from '../lib/db.js';

export class CatImageModel {
  static async findByCatId(catId) {
    const sql = 'SELECT * FROM cat_images WHERE cat_id = ? ORDER BY sort_order ASC, created_at ASC';
    return query(sql, [catId]);
  }

  static async addImage(catId, imageUrl, sortOrder = 0) {
    const sql = `
      INSERT INTO cat_images (cat_id, image_url, sort_order)
      VALUES (?, ?, ?)
    `;
    const result = await query(sql, [catId, imageUrl, sortOrder]);
    const rows = await query('SELECT * FROM cat_images WHERE id = ?', [result.insertId]);
    return rows[0];
  }
}
