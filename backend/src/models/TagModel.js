// backend/src/models/TagModel.js
import { query } from "../lib/db.js";

export class TagModel {
  /**
   * Find all tags with optional category filter.
   */
  static async findAll(categoryId = null) {
    let sql = `
      SELECT t.*, tc.name as category_name
      FROM tags t
      LEFT JOIN tag_categories tc ON t.category_id = tc.id
    `;
    const params = [];

    if (categoryId) {
      sql += " WHERE t.category_id = ?";
      params.push(categoryId);
    }

    sql += " ORDER BY tc.name, t.name";

    const [rows] = await query(sql, params);
    return rows.filter(row => row.id); // Safety: filter out invalid rows
  }

  /**
   * Find tags for a specific cat.
   */
  static async findTagsForCat(catId) {
    const sql = `
      SELECT t.*, tc.name as category_name
      FROM tags t
      INNER JOIN cat_tags ct ON t.id = ct.tag_id
      LEFT JOIN tag_categories tc ON t.category_id = tc.id
      WHERE ct.cat_id = ?
      ORDER BY tc.name, t.name
    `;

    const [rows] = await query(sql, [catId]);
    return rows.filter(row => row.id); // Safety: filter out invalid rows
  }

  /**
   * Find cats that have specific tags.
   */
  static async findCatsByTags(tagNames) {
    if (!tagNames || !tagNames.length) return [];

    const placeholders = tagNames.map(() => "?").join(",");
    const sql = `
      SELECT DISTINCT c.*
      FROM cats c
      INNER JOIN cat_tags ct ON c.id = ct.cat_id
      INNER JOIN tags t ON ct.tag_id = t.id
      WHERE t.name IN (${placeholders})
        AND c.deleted_at IS NULL
    `;

    const [rows] = await query(sql, tagNames);
    return rows.filter(row => row.id); // Safety: filter out invalid rows
  }

  /**
   * Set tags for a cat (replaces existing tags).
   * Fixed: Use individual DELETE and INSERT statements instead of prepared statement
   */
  static async setTagsForCat(catId, tagNames) {
    if (!Array.isArray(tagNames)) {
      tagNames = [];
    }

    // Delete existing tags - simple query
    await query("DELETE FROM cat_tags WHERE cat_id = ?", [catId]);

    if (!tagNames.length) {
      return;
    }

    // Insert new tags one by one to avoid prepared statement issues
    for (const tagName of tagNames) {
      // Get tag ID
      const [tagRows] = await query(
        "SELECT id FROM tags WHERE name = ?",
        [tagName]
      );

      if (tagRows && tagRows[0]) {
        const tagId = tagRows[0].id;
        // Insert cat_tag
        await query(
          "INSERT IGNORE INTO cat_tags (cat_id, tag_id) VALUES (?, ?)",
          [catId, tagId]
        );
      }
    }
  }

  /**
   * Create a new tag.
   */
  static async create(name, categoryId = null) {
    const sql = "INSERT INTO tags (name, category_id) VALUES (?, ?)";
    const [result] = await query(sql, [name, categoryId]);
    return this.findById(result.insertId);
  }

  /**
   * Find tag by ID.
   */
  static async findById(id) {
    const sql = `
      SELECT t.*, tc.name as category_name
      FROM tags t
      LEFT JOIN tag_categories tc ON t.category_id = tc.id
      WHERE t.id = ?
    `;
    const [rows] = await query(sql, [id]);
    return rows[0] ?? null;
  }

  /**
   * Update a tag.
   */
  static async update(id, name, categoryId = null) {
    const sql = "UPDATE tags SET name = ?, category_id = ? WHERE id = ?";
    await query(sql, [name, categoryId, id]);
    return this.findById(id);
  }

  /**
   * Delete a tag (and remove from all cats via FK cascade).
   */
  static async delete(id) {
    await query("DELETE FROM tags WHERE id = ?", [id]);
  }

  /**
   * Find all tag categories.
   */
  static async findAllCategories() {
    const [rows] = await query(
      "SELECT * FROM tag_categories ORDER BY name"
    );
    return rows.filter(row => row.id); // Safety: filter out invalid rows
  }
}
