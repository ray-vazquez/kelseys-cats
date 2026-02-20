// backend/src/models/CatModel.js
import { query } from "../lib/db.js";

export class CatModel {
  /**
   * Find a cat by ID (exclude soft-deleted).
   */
  static async findById(id) {
    const [rows] = await query(
      "SELECT * FROM cats WHERE id = ? AND deleted_at IS NULL",
      [id],
    );
    return rows[0] ?? null;
  }

  /**
   * Find all cats with optional filters, but WITHOUT pagination.
   * Used for CSV export or legacy compatibility.
   */
  static async findAll(filters = {}) {
    const conditions = ["deleted_at IS NULL"];
    const params = [];

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        const placeholders = filters.status.map(() => "?").join(",");
        conditions.push(`status IN (${placeholders})`);
        params.push(...filters.status);
      } else {
        conditions.push("status = ?");
        params.push(filters.status);
      }
    }

    if (filters.featured !== undefined) {
      conditions.push("featured = ?");
      params.push(filters.featured ? 1 : 0);
    }

    if (filters.senior !== undefined) {
      conditions.push("is_senior = ?");
      params.push(1);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const sql = `SELECT * FROM cats ${where} ORDER BY created_at DESC`;

    const [rows] = await query(sql, params);
    return rows;
  }

  /**
   * Find all cats with pagination.
   */
  static async findAllPaginated(filters = {}) {
    const { status, featured, senior, page = 1, limit = 12 } = filters;

    const conditions = ["deleted_at IS NULL"];
    const params = [];

    if (status) {
      if (Array.isArray(status)) {
        const placeholders = status.map(() => "?").join(",");
        conditions.push(`status IN (${placeholders})`);
        params.push(...status);
      } else {
        conditions.push("status = ?");
        params.push(status);
      }
    }

    if (featured !== undefined) {
      conditions.push("featured = ?");
      params.push(featured ? 1 : 0);
    }

    if (senior !== undefined) {
      conditions.push("is_senior = ?");
      params.push(1);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    // Count total
    const countSql = `SELECT COUNT(*) as total FROM cats ${where}`;
    const [countRows] = await query(countSql, params);
    const total = countRows[0]?.total ?? 0;

    // Sanitize limit and offset for inline use (avoid ER_WRONG_ARGUMENTS)
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Number(limit) : 12;
    const safePage = Number.isFinite(page) && page > 0 ? Number(page) : 1;
    const safeOffset = (safePage - 1) * safeLimit;

    // Fetch paginated items - inline LIMIT/OFFSET instead of bound params
    const sql = `SELECT * FROM cats ${where} ORDER BY created_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;
    const [rows] = await query(sql, params);

    return {
      items: rows,
      total,
    };
  }

  /**
   * Find all soft-deleted cats.
   */
  static async findDeleted() {
    const [rows] = await query(
      "SELECT * FROM cats WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC",
    );
    return rows;
  }

  /**
   * Restore a soft-deleted cat.
   */
  static async restore(id) {
    const [result] = await query(
      "UPDATE cats SET deleted_at = NULL WHERE id = ? AND deleted_at IS NOT NULL",
      [id],
    );
    return result.affectedRows > 0;
  }

  /**
   * Create a new cat.
   */
  static async create(data) {
    const sql = `
      INSERT INTO cats (
        name, age_years, sex, breed, bio,
        good_with_kids, good_with_cats, good_with_dogs,
        is_special_needs, is_senior, status,
        main_image_url, additional_images, featured, bonded_pair_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      data.name,
      data.age_years ?? null,
      data.sex ?? "unknown",
      data.breed ?? null,
      data.bio ?? null,
      data.good_with_kids ? 1 : 0,
      data.good_with_cats ? 1 : 0,
      data.good_with_dogs ? 1 : 0,
      data.is_special_needs ? 1 : 0,
      data.is_senior ? 1 : 0,
      data.status ?? "available",
      data.main_image_url ?? null,
      data.additional_images ?? null,
      data.featured ? 1 : 0,
      data.bonded_pair_id ?? null,
    ];

    const [result] = await query(sql, params);
    return this.findById(result.insertId);
  }

  /**
   * Update a cat by ID.
   */
  static async update(id, data) {
    const fields = [];
    const params = [];

    const allowed = [
      "name",
      "age_years",
      "sex",
      "breed",
      "bio",
      "good_with_kids",
      "good_with_cats",
      "good_with_dogs",
      "is_special_needs",
      "is_senior",
      "status",
      "main_image_url",
      "additional_images",
      "featured",
      "bonded_pair_id",
      "adoption_date",
      "adoption_story",
    ];

    allowed.forEach((key) => {
      if (key in data && data[key] !== undefined) {
        fields.push(`${key} = ?`);
        if (
          [
            "good_with_kids",
            "good_with_cats",
            "good_with_dogs",
            "is_special_needs",
            "is_senior",
            "featured",
          ].includes(key)
        ) {
          params.push(data[key] ? 1 : 0);
        } else {
          params.push(data[key]);
        }
      }
    });

    if (!fields.length) {
      return this.findById(id);
    }

    const sql = `UPDATE cats SET ${fields.join(", ")} WHERE id = ? AND deleted_at IS NULL`;
    params.push(id);

    await query(sql, params);
    return this.findById(id);
  }

  /**
   * Soft-delete a cat.
   */
  static async softDelete(id) {
    const sql =
      "UPDATE cats SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL";
    await query(sql, [id]);
  }

  /**
   * Permanently delete a cat and all associations.
   * This will cascade to cat_tags and cat_images via foreign key constraints.
   */
  static async hardDelete(id) {
    const sql = "DELETE FROM cats WHERE id = ?";
    const [result] = await query(sql, [id]);
    return result.affectedRows > 0;
  }
}
