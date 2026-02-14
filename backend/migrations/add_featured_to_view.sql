-- Migration: Add featured column to all_available_cats view
-- Purpose: Include featured flag from cats table so homepage can filter spotlighted cats
-- Date: 2026-02-13 (Updated 2026-02-13 - simplified to handle missing columns)

-- Drop and recreate view with correct schema
DROP VIEW IF EXISTS all_available_cats;

-- Check if vfv_cats table exists and has required columns
SET @vfv_table_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'vfv_cats'
);

SET @gender_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'vfv_cats' AND COLUMN_NAME = 'gender'
);

SET @description_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'vfv_cats' AND COLUMN_NAME = 'description'
);

-- Create view based on whether vfv_cats is ready
SET @create_view_sql = IF(
  @vfv_table_exists > 0 AND @gender_exists > 0 AND @description_exists > 0,
  -- Full view with both tables
  '
CREATE VIEW all_available_cats AS
SELECT 
  c.id,
  c.name,
  c.age_years,
  c.breed,
  c.sex,
  c.main_image_url,
  c.temperament,
  c.is_senior,
  c.is_special_needs,
  c.bonded_pair_id,
  c.adoptapet_url,
  c.featured,
  CASE 
    WHEN c.adoptapet_url IS NOT NULL 
    THEN SUBSTRING_INDEX(SUBSTRING_INDEX(c.adoptapet_url, \'/pet/\', -1), \'-\', 1)
    ELSE NULL 
  END as adoptapet_id,
  \'featured_foster\' as source,
  \'cats\' as from_table,
  TRUE as is_featured_foster,
  FALSE as is_partner_foster,
  c.created_at,
  c.updated_at
FROM cats c
WHERE c.status = \'available\' AND c.deleted_at IS NULL

UNION ALL

SELECT 
  v.id,
  v.name,
  v.age_years,
  v.breed,
  v.gender as sex,
  v.main_image_url,
  v.description as temperament,
  CASE WHEN v.age_text = \'Senior\' THEN TRUE ELSE FALSE END as is_senior,
  NULL as is_special_needs,
  NULL as bonded_pair_id,
  NULL as adoptapet_url,
  0 as featured,
  v.petfinder_id as adoptapet_id,
  \'partner_foster\' as source,
  \'vfv_cats\' as from_table,
  FALSE as is_featured_foster,
  TRUE as is_partner_foster,
  v.scraped_at as created_at,
  v.updated_at
FROM vfv_cats v
WHERE NOT EXISTS (
  SELECT 1 FROM cats c 
  WHERE c.status = \'available\'
  AND c.deleted_at IS NULL 
  AND c.adoptapet_url IS NOT NULL
  AND SUBSTRING_INDEX(SUBSTRING_INDEX(c.adoptapet_url, \'/pet/\', -1), \'-\', 1) = v.petfinder_id
)',
  -- Simple view with just cats table
  '
CREATE VIEW all_available_cats AS
SELECT 
  c.id,
  c.name,
  c.age_years,
  c.breed,
  c.sex,
  c.main_image_url,
  c.temperament,
  c.is_senior,
  c.is_special_needs,
  c.bonded_pair_id,
  c.adoptapet_url,
  c.featured,
  CASE 
    WHEN c.adoptapet_url IS NOT NULL 
    THEN SUBSTRING_INDEX(SUBSTRING_INDEX(c.adoptapet_url, \'/pet/\', -1), \'-\', 1)
    ELSE NULL 
  END as adoptapet_id,
  \'featured_foster\' as source,
  \'cats\' as from_table,
  TRUE as is_featured_foster,
  FALSE as is_partner_foster,
  c.created_at,
  c.updated_at
FROM cats c
WHERE c.status = \'available\' AND c.deleted_at IS NULL'
);

PREPARE create_stmt FROM @create_view_sql;
EXECUTE create_stmt;
DEALLOCATE PREPARE create_stmt;
