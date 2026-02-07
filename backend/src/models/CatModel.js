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
    return rows[0] || null;
  }

  /**
   * Non-paginated list (kept for any internal uses).
   * Filters:
   *  - status: 'available'|'pending'|'hold'|'alumni'
   *  - featured: boolean
   *  - senior: boolean (age_years >= 10)
   */
  static async findAll(filters = {}) {
    const conditions = ["deleted_at IS NULL"];
    const params = [];

    if (filters.status) {
      conditions.push("status = ?");
      params.push(filters.status);
    }
    if (filters.featured !== undefined) {
      conditions.push("featured = ?");
      params.push(filters.featured ? 1 : 0);
    }
    if (filters.senior) {
      conditions.push("age_years >= ?");
      params.push(10);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const sql = `SELECT * FROM cats ${where} ORDER BY created_at DESC`;

    return query(sql, params);
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
      conditions.push("status = ?");
      params.push(filters.status);
    }

    // Add featured filter support
    if (filters.featured !== undefined) {
      conditions.push("featured = ?");
      params.push(filters.featured ? 1 : 0);
    }

    // Add senior filter support
    if (filters.senior) {
      conditions.push("age_years >= ?");
      params.push(10);
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

    const items = await query(listSql, params);
    const [countRow] = await query(countSql, params);

    return { items, total: countRow.count };
  }

  /**
   * Create a new cat row.
   * Accepts either snake_case or the existing camelCase keys and maps them.
   */
  static async create(data) {
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
        status,
        main_image_url,
        featured,
        bonded_pair_id,
        adoption_date,
        adoption_story
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      data.name,
      data.age_years ?? data.ageyears ?? null,
      data.sex ?? "unknown",
      data.breed ?? null,
      data.temperament ?? null,
      data.good_with_kids ?? (data.goodwithkids ? 1 : 0),
      data.good_with_cats ?? (data.goodwithcats ? 1 : 0),
      data.good_with_dogs ?? (data.goodwithdogs ? 1 : 0),
      data.medical_notes ?? data.medicalnotes ?? null,
      data.is_special_needs ?? (data.isspecialneeds ? 1 : 0),
      data.status ?? "available",
      data.main_image_url ?? data.mainimageurl ?? null,
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
   */
  static async update(id, data) {
    const fields = [];
    const params = [];

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
      status: "status",
      main_image_url: "main_image_url",
      mainimageurl: "main_image_url",
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

        // Boolean / tinyint flags
        if (
          [
            "good_with_kids",
            "goodwithkids",
            "good_with_cats",
            "goodwithcats",
            "good_with_dogs",
            "goodwithdogs",
            "is_special_needs",
            "isspecialneeds",
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
}
