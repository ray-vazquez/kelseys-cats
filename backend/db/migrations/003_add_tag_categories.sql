-- Migration: Add tag categories for structured temperament and medical notes
-- This migration creates a category system for tags and seeds common options

-- Step 1: Create tag_categories table
CREATE TABLE IF NOT EXISTS tag_categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Step 2: Seed tag categories first (needed for foreign key reference)
INSERT INTO tag_categories (name, description) VALUES
('temperament', 'Personality and behavior traits'),
('medical', 'Medical conditions and health needs'),
('general', 'General tags and characteristics')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- Step 3: Add category_id to tags table (check if column exists first)
-- MySQL doesn't support IF NOT EXISTS for ALTER TABLE, so we handle it gracefully
SET @col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'tags' 
    AND COLUMN_NAME = 'category_id'
);

-- Only add column if it doesn't exist
SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE tags ADD COLUMN category_id INT UNSIGNED NULL',
  'SELECT "Column category_id already exists" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 4: Add foreign key constraint (check if it exists first)
SET @fk_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'tags' 
    AND CONSTRAINT_NAME = 'fk_tag_category'
);

SET @sql = IF(@fk_exists = 0,
  'ALTER TABLE tags ADD CONSTRAINT fk_tag_category FOREIGN KEY (category_id) REFERENCES tag_categories(id) ON DELETE SET NULL',
  'SELECT "Foreign key fk_tag_category already exists" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 5: Get category IDs for tag insertion
SET @temp_cat_id = (SELECT id FROM tag_categories WHERE name = 'temperament');
SET @med_cat_id = (SELECT id FROM tag_categories WHERE name = 'medical');

-- Step 6: Insert temperament tags
INSERT INTO tags (name, category_id) VALUES
('Affectionate', @temp_cat_id),
('Shy', @temp_cat_id),
('Playful', @temp_cat_id),
('Calm', @temp_cat_id),
('Independent', @temp_cat_id),
('Vocal', @temp_cat_id),
('Curious', @temp_cat_id),
('Gentle', @temp_cat_id),
('Energetic', @temp_cat_id),
('Lap Cat', @temp_cat_id),
('Social', @temp_cat_id),
('Timid', @temp_cat_id),
('Confident', @temp_cat_id),
('Friendly', @temp_cat_id),
('Reserved', @temp_cat_id),
('Adventurous', @temp_cat_id),
('Cuddly', @temp_cat_id),
('Mellow', @temp_cat_id),
('Talkative', @temp_cat_id),
('Quiet', @temp_cat_id)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id);

-- Step 7: Insert medical condition tags
INSERT INTO tags (name, category_id) VALUES
('FIV+', @med_cat_id),
('FeLV+', @med_cat_id),
('Hyperthyroid', @med_cat_id),
('Diabetes', @med_cat_id),
('Asthma', @med_cat_id),
('Kidney Disease', @med_cat_id),
('Heart Murmur', @med_cat_id),
('Dental Issues', @med_cat_id),
('Allergies', @med_cat_id),
('Special Diet', @med_cat_id),
('Medication Required', @med_cat_id),
('Chronic Condition', @med_cat_id),
('Vision Impaired', @med_cat_id),
('Hearing Impaired', @med_cat_id),
('Mobility Issues', @med_cat_id),
('Arthritis', @med_cat_id),
('Upper Respiratory', @med_cat_id),
('Skin Condition', @med_cat_id),
('Weight Management', @med_cat_id),
('Senior Care', @med_cat_id)
ON DUPLICATE KEY UPDATE category_id=VALUES(category_id);

-- Success message
SELECT 
  'Migration completed successfully!' AS status,
  (SELECT COUNT(*) FROM tag_categories) AS categories_count,
  (SELECT COUNT(*) FROM tags WHERE category_id IS NOT NULL) AS categorized_tags_count;
