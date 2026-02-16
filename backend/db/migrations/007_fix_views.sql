-- backend/db/migrations/007_fix_views.sql
-- Recreate views that referenced dropped columns

-- Drop the broken view
DROP VIEW IF EXISTS all_available_cats;

-- Recreate the view without temperament and medical_notes
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
  -- Get tags as JSON array
  COALESCE(
    JSON_ARRAYAGG(
      JSON_OBJECT(
        'id', t.id,
        'name', t.name,
        'category_id', t.category_id
      )
    ),
    JSON_ARRAY()
  ) as tags
FROM cats c
LEFT JOIN cat_tags ct ON c.id = ct.cat_id
LEFT JOIN tags t ON ct.tag_id = t.id
WHERE c.status = 'available'
GROUP BY c.id;

-- Verify the view works
SELECT 'View recreated successfully' as status;
SELECT COUNT(*) as available_cats FROM all_available_cats;
