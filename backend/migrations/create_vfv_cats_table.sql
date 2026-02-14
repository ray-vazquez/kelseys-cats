-- Migration: Create vfv_cats table
-- Purpose: Store scraped Voice for the Voiceless cats in database (faster than scraping on every request)
-- Date: 2026-02-07 (Updated 2026-02-13)

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS vfv_cats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  petfinder_id VARCHAR(50) UNIQUE,
  name VARCHAR(100) NOT NULL,
  age_text VARCHAR(20),
  age_years DECIMAL(3,1),
  breed VARCHAR(100),
  gender VARCHAR(20),
  main_image_url TEXT,
  petfinder_url TEXT,
  description TEXT,
  scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_name (name),
  INDEX idx_scraped_at (scraped_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add gender column if it doesn't exist (for existing tables)
SET @column_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'vfv_cats' 
  AND COLUMN_NAME = 'gender'
);

SET @sql = IF(
  @column_exists = 0,
  'ALTER TABLE vfv_cats ADD COLUMN gender VARCHAR(20) AFTER breed',
  'SELECT "gender column already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add petfinder_url column if it doesn't exist (for existing tables)
SET @column_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'vfv_cats' 
  AND COLUMN_NAME = 'petfinder_url'
);

SET @sql = IF(
  @column_exists = 0,
  'ALTER TABLE vfv_cats ADD COLUMN petfinder_url TEXT AFTER main_image_url',
  'SELECT "petfinder_url column already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add description column if it doesn't exist (for existing tables)
SET @column_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'vfv_cats' 
  AND COLUMN_NAME = 'description'
);

SET @sql = IF(
  @column_exists = 0,
  'ALTER TABLE vfv_cats ADD COLUMN description TEXT AFTER petfinder_url',
  'SELECT "description column already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add table comment
ALTER TABLE vfv_cats COMMENT = 'Voice for the Voiceless shelter cats (scraped from Petfinder)';
