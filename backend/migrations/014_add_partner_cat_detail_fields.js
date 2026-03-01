// backend/migrations/014_add_partner_cat_detail_fields.js
// Add fields needed for partner cat detail pages to all_available_cats view:
// - age_text (for display)
// - spayed_neutered, shots_current, color, hair_length (metadata)

export async function up(db) {
  console.log('🔄 Updating all_available_cats view with partner cat detail fields...');
  
  // Drop existing view
  await db.query(`DROP VIEW IF EXISTS all_available_cats`);

  // Recreate with all fields needed for detail pages
  await db.query(`
    CREATE VIEW all_available_cats AS

    -- Kelsey's Featured Fosters (from cats table)
    SELECT 
      c.id,
      c.name,
      c.age_years,
      NULL AS age_text,
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
      NULL AS spayed_neutered,
      NULL AS shots_current,
      NULL AS color,
      NULL AS hair_length,
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
      v.age_text,
      v.sex,
      v.breed,
      v.description AS bio,
      v.good_with_kids,
      v.good_with_cats,
      v.good_with_dogs,
      v.special_needs AS is_special_needs,
      CASE WHEN v.age_text = 'Senior' THEN 1 ELSE 0 END AS is_senior,
      'available' AS status,
      0 AS featured,
      v.main_image_url,
      v.adoptapet_url,
      v.spayed_neutered,
      v.shots_current,
      v.color,
      v.hair_length,
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

  console.log('✅ Updated all_available_cats view with partner cat detail fields');
}

export async function down(db) {
  console.log('🔄 Rolling back all_available_cats view...');
  
  // Rollback to migration 013 version (without new fields)
  await db.query(`DROP VIEW IF EXISTS all_available_cats`);

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
      AND NOT EXISTS (
        SELECT 1 FROM cats c2 
        WHERE c2.status = 'available'
          AND c2.deleted_at IS NULL
          AND c2.adoptapet_url IS NOT NULL
          AND c2.adoptapet_url LIKE CONCAT('%', v.adoptapet_id, '%')
      )
  `);

  console.log('✅ Rolled back all_available_cats view to migration 013 version');
}
