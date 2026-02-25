DROP VIEW IF EXISTS all_available_cats;

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
  c.adoptapet_url,
  c.created_at,
  c.updated_at,
  NULL AS color,
  NULL AS hair_length,
  'featured_foster' AS source
FROM cats c
WHERE c.status = 'available' 
  AND c.deleted_at IS NULL

UNION ALL

SELECT 
  v.id,
  v.name,
  v.age_years,
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
  v.color,
  v.hair_length,
  'partner_foster' AS source
FROM vfv_cats v
WHERE v.adoptapet_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM cats c2 
    WHERE c2.status = 'available'
      AND c2.deleted_at IS NULL
      AND c2.adoptapet_url IS NOT NULL
      AND c2.adoptapet_url LIKE CONCAT('%', v.adoptapet_id, '%')
  );
