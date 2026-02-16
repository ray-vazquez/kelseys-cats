-- backend/db/migrations/006_clean_slate_tag_system.sql
-- Clean slate migration: remove legacy data and implement pure tag system
-- MySQL 5.7 Compatible

-- ============================================================================
-- PART 1: CLEAN EXISTING DATA
-- ============================================================================

-- Step 1: Delete all cats (cascades to cat_tags, cat_images via FK)
DELETE FROM cats;

-- Step 2: Reset auto-increment
ALTER TABLE cats AUTO_INCREMENT = 1;

-- Step 3: Clean up any orphaned records (safety)
DELETE FROM cat_tags;
DELETE FROM cat_images;


-- ============================================================================
-- PART 2: DROP LEGACY COLUMNS (SKIPPED - ALREADY DROPPED)
-- ============================================================================
-- Note: temperament and medical_notes columns have been removed in previous migration
-- Skipping to avoid errors


-- ============================================================================
-- PART 3: OPTIMIZE SCHEMA
-- ============================================================================

-- Make featured NOT NULL with proper default
ALTER TABLE cats 
  MODIFY COLUMN featured BOOLEAN NOT NULL DEFAULT FALSE;

-- Add performance indexes
-- Note: We ignore errors if indexes already exist by wrapping in stored procedure
DELIMITER $$

CREATE PROCEDURE AddIndexIfNotExists()
BEGIN
  DECLARE CONTINUE HANDLER FOR 1061 BEGIN END; -- Duplicate key name
  
  CREATE INDEX idx_cats_status ON cats(status);
  CREATE INDEX idx_cats_featured ON cats(featured);
  CREATE INDEX idx_cats_special_needs ON cats(is_special_needs);
  CREATE INDEX idx_cats_senior ON cats(is_senior);
  CREATE INDEX idx_cats_status_featured ON cats(status, featured);
  CREATE INDEX idx_tags_category ON tags(category_id);
END$$

DELIMITER ;

CALL AddIndexIfNotExists();
DROP PROCEDURE AddIndexIfNotExists;

-- Ensure FK constraints exist
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;

-- Drop and recreate FK constraints (errors ignored due to FK checks disabled)
ALTER TABLE cat_tags DROP FOREIGN KEY fk_cat_tags_tag_id;
ALTER TABLE cat_tags DROP FOREIGN KEY fk_cat_tags_cat_id;

ALTER TABLE cat_tags
  ADD CONSTRAINT fk_cat_tags_tag_id 
  FOREIGN KEY (tag_id) REFERENCES tags(id) 
  ON DELETE CASCADE;

ALTER TABLE cat_tags
  ADD CONSTRAINT fk_cat_tags_cat_id 
  FOREIGN KEY (cat_id) REFERENCES cats(id) 
  ON DELETE CASCADE;

SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;


-- ============================================================================
-- PART 4: ENSURE TAG CATEGORIES EXIST
-- ============================================================================

INSERT IGNORE INTO tag_categories (id, name, description) VALUES 
  (1, 'temperament', 'Personality and behavioral traits'),
  (2, 'medical', 'Medical conditions and special needs');


-- ============================================================================
-- PART 5: CREATE SEED TAGS
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


-- ============================================================================
-- PART 6: SEED 3 CATS WITH TAG SYSTEM
-- ============================================================================

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

-- Luna's tags
INSERT INTO cat_tags (cat_id, tag_id) VALUES
  (@luna_id, (SELECT id FROM tags WHERE name = 'Affectionate' AND category_id = 1)),
  (@luna_id, (SELECT id FROM tags WHERE name = 'Quiet' AND category_id = 1)),
  (@luna_id, (SELECT id FROM tags WHERE name = 'Cuddly' AND category_id = 1)),
  (@luna_id, (SELECT id FROM tags WHERE name = 'Hyperthyroid' AND category_id = 2)),
  (@luna_id, (SELECT id FROM tags WHERE name = 'Requires daily medication' AND category_id = 2));


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

-- Oliver's tags
INSERT INTO cat_tags (cat_id, tag_id) VALUES
  (@oliver_id, (SELECT id FROM tags WHERE name = 'Playful' AND category_id = 1)),
  (@oliver_id, (SELECT id FROM tags WHERE name = 'Energetic' AND category_id = 1)),
  (@oliver_id, (SELECT id FROM tags WHERE name = 'Social' AND category_id = 1)),
  (@oliver_id, (SELECT id FROM tags WHERE name = 'Healthy' AND category_id = 2));


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

-- Bella's tags
INSERT INTO cat_tags (cat_id, tag_id) VALUES
  (@bella_id, (SELECT id FROM tags WHERE name = 'Shy' AND category_id = 1)),
  (@bella_id, (SELECT id FROM tags WHERE name = 'Independent' AND category_id = 1)),
  (@bella_id, (SELECT id FROM tags WHERE name = 'Chronic URI' AND category_id = 2)),
  (@bella_id, (SELECT id FROM tags WHERE name = 'Requires daily eye cleaning' AND category_id = 2)),
  (@bella_id, (SELECT id FROM tags WHERE name = 'Requires special diet' AND category_id = 2));


-- ============================================================================
-- PART 7: VERIFICATION
-- ============================================================================

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
