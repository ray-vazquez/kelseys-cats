// backend/src/migrations/012_add_bio_to_view.js

export async function up(db) {
  // Drop and recreate the view with bio column added
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

  console.log("✅ Updated all_available_cats view to include bio column");
}

export async function down(db) {
  // Rollback: recreate view without bio column
  await db.query(`DROP VIEW IF EXISTS all_available_cats`);

  await db.query(`
    CREATE VIEW all_available_cats AS
    SELECT 
      c.id,
      c.name,
      c.age_years,
      c.sex,
      c.breed,
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

  console.log("✅ Rolled back all_available_cats view (removed bio column)");
}
