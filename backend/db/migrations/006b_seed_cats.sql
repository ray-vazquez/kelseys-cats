-- backend/db/migrations/006b_seed_cats.sql
-- Seed 3 cats with tags - run after 006 if cats weren't created

-- ============================================================================
-- VERIFY PREREQUISITES
-- ============================================================================

-- Check tag_categories exist
SELECT 'Checking tag_categories...' as status;
SELECT * FROM tag_categories;

-- Check tags exist
SELECT 'Checking tags...' as status;
SELECT COUNT(*) as tag_count FROM tags;

-- ============================================================================
-- ENSURE TAG CATEGORIES EXIST
-- ============================================================================

INSERT IGNORE INTO tag_categories (id, name, description) VALUES 
  (1, 'temperament', 'Personality and behavioral traits'),
  (2, 'medical', 'Medical conditions and special needs');

SELECT 'Tag categories created/verified' as status;

-- ============================================================================
-- ENSURE TAGS EXIST
-- ============================================================================

-- Temperament tags (category_id = 1)
INSERT IGNORE INTO tags (name, category_id) VALUES 
  ('Affectionate', 1),
  ('Playful', 1),
  ('Shy', 1),
  ('Vocal', 1),
  ('Independent', 1),
  ('Cuddly', 1),
  ('Social', 1),
  ('Quiet', 1),
  ('Energetic', 1),
  ('Calm', 1);

-- Medical tags (category_id = 2)
INSERT IGNORE INTO tags (name, category_id) VALUES 
  ('Chronic URI', 2),
  ('Requires daily medication', 2),
  ('Requires daily eye cleaning', 2),
  ('FIV positive', 2),
  ('Hyperthyroid', 2),
  ('Diabetes', 2),
  ('Arthritis', 2),
  ('Dental issues', 2),
  ('Requires special diet', 2),
  ('Healthy', 2);

SELECT 'Tags created/verified' as status;
SELECT COUNT(*) as total_tags FROM tags;

-- ============================================================================
-- CREATE SEED CATS
-- ============================================================================

-- Clean up any existing test cats first
DELETE FROM cats WHERE name IN ('Luna', 'Oliver', 'Bella');

SELECT 'Creating Luna...' as status;

-- Cat 1: Luna (Featured, Senior, Special Needs)
INSERT INTO cats (
  name, age_years, sex, breed, 
  good_with_kids, good_with_cats, good_with_dogs,
  is_special_needs, is_senior, status, featured,
  main_image_url,
  created_at, updated_at
) VALUES (
  'Luna', 11.0, 'female', 'Tuxedo',
  1, 1, 0,
  1, 1, 'available', 1,
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800',
  NOW(), NOW()
);

SET @luna_id = LAST_INSERT_ID();
SELECT CONCAT('Luna created with ID: ', @luna_id) as status;

-- Verify tag IDs exist before inserting
SELECT 'Luna tag IDs:' as status;
SELECT id, name FROM tags WHERE name IN ('Affectionate', 'Quiet', 'Cuddly', 'Hyperthyroid', 'Requires daily medication');

-- Luna's tags
INSERT INTO cat_tags (cat_id, tag_id) VALUES
  (@luna_id, (SELECT id FROM tags WHERE name = 'Affectionate' AND category_id = 1)),
  (@luna_id, (SELECT id FROM tags WHERE name = 'Quiet' AND category_id = 1)),
  (@luna_id, (SELECT id FROM tags WHERE name = 'Cuddly' AND category_id = 1)),
  (@luna_id, (SELECT id FROM tags WHERE name = 'Hyperthyroid' AND category_id = 2)),
  (@luna_id, (SELECT id FROM tags WHERE name = 'Requires daily medication' AND category_id = 2));

SELECT CONCAT('Luna tags added: ', ROW_COUNT()) as status;


SELECT 'Creating Oliver...' as status;

-- Cat 2: Oliver (Featured, No Special Needs)
INSERT INTO cats (
  name, age_years, sex, breed,
  good_with_kids, good_with_cats, good_with_dogs,
  is_special_needs, is_senior, status, featured,
  main_image_url,
  created_at, updated_at
) VALUES (
  'Oliver', 3.0, 'male', 'Domestic Shorthair',
  1, 1, 1,
  0, 0, 'available', 1,
  'https://images.unsplash.com/photo-1573865526739-10c1dd7e1bf8?w=800',
  NOW(), NOW()
);

SET @oliver_id = LAST_INSERT_ID();
SELECT CONCAT('Oliver created with ID: ', @oliver_id) as status;

-- Oliver's tags
INSERT INTO cat_tags (cat_id, tag_id) VALUES
  (@oliver_id, (SELECT id FROM tags WHERE name = 'Playful' AND category_id = 1)),
  (@oliver_id, (SELECT id FROM tags WHERE name = 'Energetic' AND category_id = 1)),
  (@oliver_id, (SELECT id FROM tags WHERE name = 'Social' AND category_id = 1)),
  (@oliver_id, (SELECT id FROM tags WHERE name = 'Healthy' AND category_id = 2));

SELECT CONCAT('Oliver tags added: ', ROW_COUNT()) as status;


SELECT 'Creating Bella...' as status;

-- Cat 3: Bella (Not Featured, Special Needs)
INSERT INTO cats (
  name, age_years, sex, breed,
  good_with_kids, good_with_cats, good_with_dogs,
  is_special_needs, is_senior, status, featured,
  main_image_url,
  created_at, updated_at
) VALUES (
  'Bella', 5.0, 'female', 'Persian Mix',
  0, 1, 0,
  1, 0, 'available', 0,
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800',
  NOW(), NOW()
);

SET @bella_id = LAST_INSERT_ID();
SELECT CONCAT('Bella created with ID: ', @bella_id) as status;

-- Bella's tags
INSERT INTO cat_tags (cat_id, tag_id) VALUES
  (@bella_id, (SELECT id FROM tags WHERE name = 'Shy' AND category_id = 1)),
  (@bella_id, (SELECT id FROM tags WHERE name = 'Independent' AND category_id = 1)),
  (@bella_id, (SELECT id FROM tags WHERE name = 'Chronic URI' AND category_id = 2)),
  (@bella_id, (SELECT id FROM tags WHERE name = 'Requires daily eye cleaning' AND category_id = 2)),
  (@bella_id, (SELECT id FROM tags WHERE name = 'Requires special diet' AND category_id = 2));

SELECT CONCAT('Bella tags added: ', ROW_COUNT()) as status;


-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT '=== VERIFICATION RESULTS ===' as status;

-- Verify cats created
SELECT 
  'Cats created' as check_type,
  COUNT(*) as count,
  GROUP_CONCAT(name ORDER BY name) as names
FROM cats;

-- Verify tags assigned
SELECT 
  c.name as cat_name,
  COUNT(ct.tag_id) as tag_count,
  GROUP_CONCAT(t.name ORDER BY tc.name, t.name SEPARATOR ', ') as tags
FROM cats c
LEFT JOIN cat_tags ct ON c.id = ct.cat_id
LEFT JOIN tags t ON ct.tag_id = t.id
LEFT JOIN tag_categories tc ON t.category_id = tc.id
GROUP BY c.id, c.name
ORDER BY c.name;

-- Verify no orphaned records
SELECT 
  'Orphaned tag check' as check_type,
  COUNT(*) as orphaned_count
FROM cat_tags ct
LEFT JOIN tags t ON ct.tag_id = t.id
WHERE t.id IS NULL;

-- Verify featured cats
SELECT 
  'Featured cats' as check_type,
  COUNT(*) as count,
  GROUP_CONCAT(name) as names
FROM cats 
WHERE featured = 1;

SELECT '=== SEED COMPLETE ===' as status;
