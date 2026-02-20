// backend/src/controllers/tags.controller.js
// Controller for tag management - categorized tags for temperament, medical, etc.

import pool, { query } from "../lib/db.js";

/**
 * GET /api/tags
 * Get all tags, optionally filtered by category
 * Query params:
 * - category: temperament, medical, general (optional)
 */
export async function getAllTags(req, res) {
  try {
    // ✅ FIXED: req.query (not req.pool)
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
      sql += " WHERE tc.name = ?";
      params.push(category);
    }

    sql += " ORDER BY tc.name ASC, t.name ASC";

    // ✅ FIXED: Use query() helper function
    const [tags] = await query(sql, params);

    // Group by category for easier frontend consumption
    const grouped = tags.reduce((acc, tag) => {
      const catName = tag.category_name || "uncategorized";
      if (!acc[catName]) {
        acc[catName] = {
          category: catName,
          description: tag.category_description,
          tags: [],
        };
      }
      acc[catName].tags.push({
        id: tag.id,
        name: tag.name,
      });
      return acc;
    }, {});

    res.json({
      tags: tags,
      grouped: Object.values(grouped),
    });
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({
      error: "Failed to fetch tags",
      message: error.message,
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
      "SELECT * FROM tag_categories ORDER BY name ASC",
    );

    res.json(categories);
  } catch (error) {
    console.error("Error fetching tag categories:", error);
    res.status(500).json({
      error: "Failed to fetch tag categories",
      message: error.message,
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
      return res.status(400).json({ error: "Tag name is required" });
    }

    // Check if tag already exists
    const [existing] = await query("SELECT * FROM tags WHERE name = ?", [
      name.trim(),
    ]);

    if (existing.length > 0) {
      return res.status(409).json({
        error: "Tag already exists",
        tag: existing[0],
      });
    }

    // Insert new tag
    const [result] = await query(
      "INSERT INTO tags (name, category_id) VALUES (?, ?)",
      [name.trim(), category_id || null],
    );

    // Fetch the created tag
    const [newTag] = await query(
      `SELECT t.*, tc.name as category_name 
       FROM tags t 
       LEFT JOIN tag_categories tc ON t.category_id = tc.id 
       WHERE t.id = ?`,
      [result.insertId],
    );

    res.status(201).json(newTag[0]);
  } catch (error) {
    console.error("Error creating tag:", error);
    res.status(500).json({
      error: "Failed to create tag",
      message: error.message,
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

    // ✅ FIXED: Use query() helper function (not pool())
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
      [id],
    );

    // Group by category
    const grouped = tags.reduce((acc, tag) => {
      const catName = tag.category_name || "general";
      if (!acc[catName]) {
        acc[catName] = [];
      }
      acc[catName].push({
        id: tag.id,
        name: tag.name,
      });
      return acc;
    }, {});

    res.json({
      tags: tags,
      grouped: grouped,
    });
  } catch (error) {
    console.error("Error fetching cat tags:", error);
    res.status(500).json({
      error: "Failed to fetch cat tags",
      message: error.message,
    });
  }
}

/**
 * PUT /api/cats/:id/tags
 * Update tags for a specific cat (replaces all tags)
 * Body: { temperament: [tag_ids], medical: [tag_ids], general: [tag_ids] }
 */
export async function updateCatTags(req, res) {
  // ✅ Get dedicated connection from pool for transaction
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const body = req.body;

    console.log("=== TAG UPDATE DEBUG ===");
    console.log("Cat ID:", id);
    console.log("Request body:", JSON.stringify(body, null, 2));

    // Support both formats: categorized object or simple array
    let tagIds = [];

    if (Array.isArray(body.tag_ids)) {
      tagIds = body.tag_ids;
    } else if (typeof body === "object") {
      tagIds = [
        ...(body.temperament || []),
        ...(body.medical || []),
        ...(body.general || []),
      ];
    }

    // Remove duplicates and ensure integers
    tagIds = [...new Set(tagIds)]
      .map((id) => parseInt(id))
      .filter((id) => !isNaN(id));
    console.log("Processed tag IDs:", tagIds);

    // ✅ Use connection-based transaction API
    await connection.beginTransaction();
    console.log("Transaction started");

    try {
      // Delete existing tags for this cat
      await connection.query("DELETE FROM cat_tags WHERE cat_id = ?", [id]);
      console.log("Deleted existing tags");

      // Insert new tags using proper bulk insert syntax
      if (tagIds.length > 0) {
        const values = tagIds.map((tagId) => [parseInt(id), tagId]);
        await connection.query(
          "INSERT INTO cat_tags (cat_id, tag_id) VALUES ?",
          [values],
        );
        console.log("Inserted new tags:", values);
      }

      await connection.commit();
      console.log("Transaction committed");

      // Return updated tags
      const [updatedTags] = await connection.query(
        `SELECT t.id, t.name, tc.name as category_name
         FROM cat_tags ct
         JOIN tags t ON ct.tag_id = t.id
         LEFT JOIN tag_categories tc ON t.category_id = tc.id
         WHERE ct.cat_id = ?
         ORDER BY tc.name ASC, t.name ASC`,
        [id],
      );

      res.json({
        success: true,
        tags: updatedTags,
        count: updatedTags.length,
      });
    } catch (err) {
      console.error("Transaction error:", err);
      await connection.rollback();
      console.log("Transaction rolled back");
      throw err;
    }
  } catch (error) {
    console.error("Error updating cat tags:", error);
    res.status(500).json({
      error: "Failed to update cat tags",
      message: error.message,
    });
  } finally {
    // ✅ CRITICAL - Always release connection back to pool
    connection.release();
    console.log("Connection released");
  }
}
