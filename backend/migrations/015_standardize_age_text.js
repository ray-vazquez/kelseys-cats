// backend/migrations/015_standardize_age_text.js
// Migration 015: Standardize on age_text, drop age_years completely
// Affects: cats table, vfv_cats table, all_available_cats view
// Date: March 1, 2026
// Part of: Age display regression fix

export async function up(db) {
  console.log("🔄 Migration 015: Standardizing age_text across all tables...");

  // ============================================================================
  // STEP 1: Add age_text to cats table
  // ============================================================================
  console.log("  → Adding age_text column to cats table...");
  await db.query(`
    ALTER TABLE cats 
    ADD COLUMN age_text VARCHAR(50) AFTER name
  `);

  // ============================================================================
  // STEP 2: Backfill age_text from age_years
  // ============================================================================
  console.log("  → Backfilling age_text from age_years...");
  await db.query(`
    UPDATE cats 
    SET age_text = CASE
        WHEN age_years IS NULL THEN NULL
        WHEN age_years < 1 THEN 'Kitten'
        WHEN age_years >= 1 AND age_years < 3 THEN 'Young'
        WHEN age_years >= 3 AND age_years < 10 THEN 'Adult'
        WHEN age_years >= 10 THEN 'Senior'
        ELSE NULL
    END
    WHERE age_text IS NULL
  `);

  // ============================================================================
  // STEP 3: Drop age_years from cats table
  // ============================================================================
  console.log("  → Dropping age_years column from cats table...");
  await db.query(`
    ALTER TABLE cats 
    DROP COLUMN age_years
  `);

  // ============================================================================
  // STEP 4: Drop age_years from vfv_cats table
  // ============================================================================
  console.log("  → Dropping age_years column from vfv_cats table...");
  await db.query(`
    ALTER TABLE vfv_cats 
    DROP COLUMN age_years
  `);

  // ============================================================================
  // STEP 5: Recreate all_available_cats view without age_years
  // ============================================================================
  console.log("  → Recreating all_available_cats view...");
  await db.query(`DROP VIEW IF EXISTS all_available_cats`);

  await db.query(`
    CREATE VIEW all_available_cats AS

    -- Kelsey's Featured Fosters (from cats table)
    SELECT 
      c.id,
      c.name,
      c.age_text,
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

  // ============================================================================
  // STEP 6: Verification
  // ============================================================================
  console.log("  → Verifying migration...");
  
  const [catCounts] = await db.query(`
    SELECT 
      SUM(CASE WHEN age_text IS NOT NULL THEN 1 ELSE 0 END) as with_age,
      SUM(CASE WHEN age_text IS NULL THEN 1 ELSE 0 END) as without_age,
      COUNT(*) as total
    FROM cats
  `);
  
  console.log(`    ✓ Cats with age_text: ${catCounts[0].with_age}`);
  console.log(`    ✓ Cats without age_text: ${catCounts[0].without_age}`);
  console.log(`    ✓ Total cats: ${catCounts[0].total}`);

  const [ageDistribution] = await db.query(`
    SELECT age_text, COUNT(*) as count 
    FROM cats 
    WHERE age_text IS NOT NULL
    GROUP BY age_text
  `);
  
  console.log("    ✓ Age distribution:");
  ageDistribution.forEach(row => {
    console.log(`      - ${row.age_text}: ${row.count}`);
  });

  console.log("✅ Migration 015 complete - age_text standardized!");
}

export async function down(db) {
  console.log("🔄 Rolling back Migration 015...");

  // Add age_years back to cats table
  console.log("  → Adding age_years column back to cats table...");
  await db.query(`
    ALTER TABLE cats 
    ADD COLUMN age_years DECIMAL(4,1) AFTER name
  `);

  // Restore numeric ages (approximate reverse mapping)
  console.log("  → Restoring age_years from age_text...");
  await db.query(`
    UPDATE cats 
    SET age_years = CASE
        WHEN age_text = 'Kitten' THEN 0.5
        WHEN age_text = 'Young' THEN 2.0
        WHEN age_text = 'Adult' THEN 5.0
        WHEN age_text = 'Senior' THEN 10.0
        ELSE NULL
    END
  `);

  // Drop age_text from cats
  console.log("  → Dropping age_text column from cats table...");
  await db.query(`
    ALTER TABLE cats 
    DROP COLUMN age_text
  `);

  // Add age_years back to vfv_cats
  console.log("  → Adding age_years column back to vfv_cats table...");
  await db.query(`
    ALTER TABLE vfv_cats 
    ADD COLUMN age_years DECIMAL(4,2) AFTER age_text
  `);

  // Recreate old view with age_years
  console.log("  → Recreating all_available_cats view with age_years...");
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

  console.log("✅ Rollback complete - restored age_years!");
}
