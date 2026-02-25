// backend/migrations/013_fix_all_available_cats_view_union.js
// Fix: all_available_cats view was only querying `cats` table.
// Migration 012 accidentally dropped the UNION with vfv_cats.
// This restores the UNION ALL so partner fosters appear in /api/cats/all-available.

export async function up(db) {
  // Drop the broken single-table view
  await db.query(`DROP VIEW IF EXISTS all_available_cats`);

  // Recreate as UNION ALL of featured fosters + partner fosters
  await db.query(`
    CREATE VIEW all_available_cats AS

    -- Kelsey's Featured Fosters (from cats table)
    SELECT 
      c.id,
      c.name,
      c.age_years,
      c.sex,
      c.breed,
      c.bio,
      c.good_with_kids,
      c.good_with_cats,
      c.good_with_dogs,
      c.is_special_needs,
      c.is_senior,
      c.status,
      c.featured,
      c.main_image_url,
      c.adoptapet_url,
      c.created_at,
      c.updated_at,
      'featured_foster' AS source
    FROM cats c
    WHERE c.status = 'available' 
      AND c.deleted_at IS NULL

    UNION ALL

    -- VFV Partner Foster Cats (from vfv_cats table)
    SELECT 
      v.id,
      v.name,
      v.age_years,
      v.sex,
      v.breed,
      v.description AS bio,
      NULL AS good_with_kids,
      NULL AS good_with_cats,
      NULL AS good_with_dogs,
      NULL AS is_special_needs,
      CASE WHEN v.age_text = 'Senior' THEN 1 ELSE 0 END AS is_senior,
      'available' AS status,
      0 AS featured,
      v.main_image_url,
      v.adoptapet_url,
      v.scraped_at AS created_at,
      v.updated_at,
      'partner_foster' AS source
    FROM vfv_cats v
    WHERE v.adoptapet_id IS NOT NULL
      -- Deduplicate: exclude VFV cats already in Kelsey's care
      AND NOT EXISTS (
        SELECT 1 FROM cats c2 
        WHERE c2.status = 'available'
          AND c2.deleted_at IS NULL
          AND c2.adoptapet_url IS NOT NULL
          AND c2.adoptapet_url LIKE CONCAT('%', v.adoptapet_id, '%')
      )
  `);

  console.log("✅ Fixed all_available_cats view — now includes vfv_cats via UNION ALL");
}

export async function down(db) {
  // Rollback to the migration 012 version (single-table, cats only)
  await db.query(`DROP VIEW IF EXISTS all_available_cats`);

  await db.query(`
    CREATE VIEW all_available_cats AS
    SELECT 
      c.id,
      c.name,
      c.age_years,
      c.sex,
      c.breed,
      c.bio,
      c.good_with_kids,
      c.good_with_cats,
      c.good_with_dogs,
      c.is_special_needs,
      c.is_senior,
      c.status,
      c.featured,
      c.main_image_url,
      c.created_at,
      c.updated_at,
      CASE 
        WHEN c.featured = 1 THEN 'featured_foster' 
        ELSE 'partner_foster' 
      END AS source
    FROM cats c
    WHERE c.status = 'available' 
      AND c.deleted_at IS NULL
  `);

  console.log("✅ Rolled back all_available_cats view to single-table version");
}
