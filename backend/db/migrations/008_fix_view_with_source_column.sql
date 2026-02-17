-- backend/db/migrations/008_fix_view_with_source_column.sql
-- Fix broken all_available_cats view after schema changes
-- Issue: Missing 'source' column, broken JSON_ARRAYAGG, references to dropped columns

-- Drop the broken view
DROP VIEW IF EXISTS all_available_cats;

-- Recreate view without JSON aggregation (tags fetched separately by backend)
CREATE VIEW all_available_cats AS
SELECT 
  c.id,
  c.name,
  c.age_years,
  c.age_months,
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
  -- Add source column for controller filtering (featured_foster vs partner_foster)
  CASE 
    WHEN c.featured = 1 THEN 'featured_foster'
    ELSE 'partner_foster'
  END as source
FROM cats c
WHERE c.status = 'available' 
  AND c.deleted_at IS NULL;

-- Verify the view works
SELECT 'View recreated successfully' as status;
SELECT COUNT(*) as available_cats, SUM(featured) as featured_count FROM all_available_cats;
SELECT id, name, source FROM all_available_cats ORDER BY name LIMIT 5;
