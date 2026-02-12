// backend/src/models/CatModel.js
import { query } from "../lib/db.js";

export class CatModel {
  /**
   * Find a single cat by id (ignores soft-deleted rows).
   */
  static async findById(id) {
    const rows = await query(
      "SELECT * FROM cats WHERE id = ? AND deleted_at IS NULL",
      [id],
    );
    if (rows[0]) {
      return this._deserializeRow(rows[0]);
    }
    return null;
  }

  /**
   * Find a single cat by id, including soft-deleted rows.
   * Used for restore functionality.
   */
  static async findByIdIncludingDeleted(id) {
    const rows = await query(
      "SELECT * FROM cats WHERE id = ?",
      [id],
    );
    if (rows[0]) {
      return this._deserializeRow(rows[0]);
    }
    return null;
  }

  /**
   * Deserialize a database row, converting JSONB fields to proper JS types.
   */
  static _deserializeRow(row) {
    if (!row) return null;
    
    // Parse additional_images if it's a string (some MySQL drivers return JSONB as string)
    if (row.additional_images && typeof row.additional_images === 'string') {
      try {
        row.additional_images = JSON.parse(row.additional_images);
      } catch (e) {
        console.error('Failed to parse additional_images:', e);
        row.additional_images = [];
      }
    }
    
    // Ensure it's an array
    if (!Array.isArray(row.additional_images)) {
      row.additional_images = [];
    }
    
    return row;
  }

  /**
   * Serialize additional_images array to JSON string for database storage.
   */
  static _serializeAdditionalImages(images) {
    if (!images) return '[]';
    if (Array.isArray(images)) {
      return JSON.stringify(images);
    }
    if (typeof images === 'string') {
      // Already a string, verify it's valid JSON
      try {
        JSON.parse(images);
        return images;
      } catch (e) {
        return '[]';
      }
    }
    return '[]';
  }

  /**
   * Non-paginated list (kept for any internal uses).
   * Filters:
   *  - status: 'available'|'pending'|'hold'|'alumni' or array of statuses
   *  - featured: boolean
   *  - senior: boolean (uses is_senior column)
   */
  static async findAll(filters = {}) {
    const conditions = ["deleted_at IS NULL"];
    const params = [];

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        // Multiple statuses - use IN clause
        const placeholders = filters.status.map(() => '?').join(',');
        conditions.push(`status IN (${placeholders})`);
        params.push(...filters.status);
      } else {
        // Single status
        conditions.push("status = ?");
        params.push(filters.status);
      }
    }
    if (filters.featured !== undefined) {
      conditions.push("featured = ?");
      params.push(filters.featured ? 1 : 0);
    }
    if (filters.senior) {
      conditions.push("is_senior = ?");
      params.push(1);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const sql = `SELECT * FROM cats ${where} ORDER BY created_at DESC`;

    const rows = await query(sql, params);
    return rows.map(row => this._deserializeRow(row));
  }

  /**
   * Find all soft-deleted cats.
   * Returns: array of deleted cat objects with deletion timestamp
   */
  static async findDeleted() {
    const sql = `
      SELECT * FROM cats 
      WHERE deleted_at IS NOT NULL 
      ORDER BY deleted_at DESC
    `;
    const rows = await query(sql);
    return rows.map(row => this._deserializeRow(row));
  }

  /**
   * Paginated list.
   * Same filters as findAll, plus:
   *  - page (1-based, default 1)
   *  - limit (default 12)
   *
   * Returns: { items, total }
   */

  static async findAllPaginated(filters = {}) {
    const conditions = ["deleted_at IS NULL"];
    const params = [];

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        // Multiple statuses - use IN clause
        const placeholders = filters.status.map(() => '?').join(',');
        conditions.push(`status IN (${placeholders})`);
        params.push(...filters.status);
      } else {
        // Single status
        conditions.push("status = ?");
        params.push(filters.status);
      }
    }

    // Add featured filter support
    if (filters.featured !== undefined) {
      conditions.push("featured = ?");
      params.push(filters.featured ? 1 : 0);
    }

    // Add senior filter support - use is_senior column
    if (filters.senior) {
      conditions.push("is_senior = ?");
      params.push(1);
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    const rawPage = filters.page ?? 1;
    const rawLimit = filters.limit ?? 12;
    const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
    const limit = Number.isInteger(rawLimit) && rawLimit > 0 ? rawLimit : 12;
    const offset = (page - 1) * limit;

    // IMPORTANT: interpolate limit/offset as integers, not placeholders
    const listSql = `
    SELECT *
    FROM cats
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

    console.log("listSql:", listSql.trim(), "params:", params);

    const countSql = `
    SELECT COUNT(*) AS count
    FROM cats
    ${whereClause}
  `;

    const rows = await query(listSql, params);
    const items = rows.map(row => this._deserializeRow(row));
    const [countRow] = await query(countSql, params);

    return { items, total: countRow.count };
  }

  /**
   * Auto-compute is_senior based on age_years.
   * Returns 1 if age_years >= 10, otherwise 0.
   */
  static _computeIsSenior(ageYears) {
    if (ageYears === null || ageYears === undefined) {
      return 0;
    }
    return ageYears >= 10 ? 1 : 0;
  }

  /**
   * Create a new cat row.
   * Accepts either snake_case or the existing camelCase keys and maps them.
   * Auto-sets is_senior based on age_years if not explicitly provided.
   */
  static async create(data) {
    const ageYears = data.age_years ?? data.ageyears ?? null;
    const isSenior = data.is_senior !== undefined 
      ? (data.is_senior ? 1 : 0)
      : (data.issenior !== undefined ? (data.issenior ? 1 : 0) : this._computeIsSenior(ageYears));

    const sql = `
      INSERT INTO cats (
        name,
        age_years,
        sex,
        breed,
        temperament,
        good_with_kids,
        good_with_cats,
        good_with_dogs,
        medical_notes,
        is_special_needs,
        is_senior,
        status,
        main_image_url,
        additional_images,
        featured,
        bonded_pair_id,
        adoption_date,
        adoption_story
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      data.name,
      ageYears,
      data.sex ?? "unknown",
      data.breed ?? null,
      data.temperament ?? null,
      data.good_with_kids ?? (data.goodwithkids ? 1 : 0),
      data.good_with_cats ?? (data.goodwithcats ? 1 : 0),
      data.good_with_dogs ?? (data.goodwithdogs ? 1 : 0),
      data.medical_notes ?? data.medicalnotes ?? null,
      data.is_special_needs ?? (data.isspecialneeds ? 1 : 0),
      isSenior,
      data.status ?? "available",
      data.main_image_url ?? data.mainimageurl ?? null,
      this._serializeAdditionalImages(data.additional_images ?? data.additionalimages),
      data.featured ? 1 : 0,
      data.bonded_pair_id ?? data.bondedpairid ?? null,
      data.adoption_date ?? null,
      data.adoption_story ?? null,
    ];

    const result = await query(sql, params);
    return this.findById(result.insertId);
  }

  /**
   * Update an existing cat.
   * Accepts both camelCase and snake_case keys and maps them to DB columns.
   * Auto-updates is_senior if age_years changes (unless is_senior is explicitly set).
   */
  static async update(id, data) {
    const fields = [];
    const params = [];

    // Determine if we need to auto-update is_senior
    let autoUpdateIsSenior = false;
    let computedIsSenior = null;
    
    if ((data.age_years !== undefined || data.ageyears !== undefined) && 
        data.is_senior === undefined && data.issenior === undefined) {
      // Age is being updated but is_senior is not explicitly provided
      const ageYears = data.age_years ?? data.ageyears;
      computedIsSenior = this._computeIsSenior(ageYears);
      autoUpdateIsSenior = true;
    }

    // Map from input keys to DB column names
    const mapping = {
      name: "name",
      age_years: "age_years",
      ageyears: "age_years",
      sex: "sex",
      breed: "breed",
      temperament: "temperament",
      good_with_kids: "good_with_kids",
      goodwithkids: "good_with_kids",
      good_with_cats: "good_with_cats",
      goodwithcats: "good_with_cats",
      good_with_dogs: "good_with_dogs",
      goodwithdogs: "good_with_dogs",
      medical_notes: "medical_notes",
      medicalnotes: "medical_notes",
      is_special_needs: "is_special_needs",
      isspecialneeds: "is_special_needs",
      is_senior: "is_senior",
      issenior: "is_senior",
      status: "status",
      main_image_url: "main_image_url",
      mainimageurl: "main_image_url",
      additional_images: "additional_images",
      additionalimages: "additional_images",
      featured: "featured",
      bonded_pair_id: "bonded_pair_id",
      bondedpairid: "bonded_pair_id",
      adoption_date: "adoption_date",
      adoptiondate: "adoption_date",
      adoption_story: "adoption_story",
      adoptionstory: "adoption_story",
    };

    Object.entries(mapping).forEach(([inputKey, column]) => {
      if (Object.prototype.hasOwnProperty.call(data, inputKey)) {
        const value = data[inputKey];
        
        // Skip undefined values - they should not be in the query
        if (value === undefined) {
          return;
        }

        fields.push(`${column} = ?`);

        // Handle additional_images JSONB field
        if (column === 'additional_images') {
          params.push(this._serializeAdditionalImages(value));
        }
        // Boolean / tinyint flags
        else if (
          [
            "good_with_kids",
            "goodwithkids",
            "good_with_cats",
            "goodwithcats",
            "good_with_dogs",
            "goodwithdogs",
            "is_special_needs",
            "isspecialneeds",
            "is_senior",
            "issenior",
            "featured",
          ].includes(inputKey)
        ) {
          params.push(value ? 1 : 0);
        } else {
          // Convert undefined to null just in case
          params.push(value === undefined ? null : value);
        }
      }
    });

    // Add auto-computed is_senior if age changed and is_senior wasn't explicit
    if (autoUpdateIsSenior && !fields.some(f => f.startsWith('is_senior'))) {
      fields.push('is_senior = ?');
      params.push(computedIsSenior);
    }

    if (!fields.length) {
      return this.findById(id);
    }

    const sql = `
      UPDATE cats
      SET ${fields.join(", ")}
      WHERE id = ? AND deleted_at IS NULL
    `;
    params.push(id);

    // Final safety check - ensure no undefined values in params
    const cleanParams = params.map(p => p === undefined ? null : p);

    console.log('UPDATE SQL:', sql);
    console.log('UPDATE PARAMS:', cleanParams);

    await query(sql, cleanParams);
    return this.findById(id);
  }

  /**
   * Soft-delete a cat by setting deleted_at.
   */
  static async softDelete(id) {
    const sql = `
      UPDATE cats
      SET deleted_at = NOW()
      WHERE id = ? AND deleted_at IS NULL
    `;
    await query(sql, [id]);
  }

  /**
   * Restore a soft-deleted cat by clearing deleted_at.
   */
  static async restore(id) {
    const sql = `
      UPDATE cats
      SET deleted_at = NULL
      WHERE id = ? AND deleted_at IS NOT NULL
    `;
    const result = await query(sql, [id]);
    
    // Return the restored cat
    if (result.affectedRows > 0) {
      return this.findById(id);
    }
    return null;
  }
}
