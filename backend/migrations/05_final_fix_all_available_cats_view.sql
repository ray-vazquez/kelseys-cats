-- Migration 05: Final fix for all_available_cats view
-- This migration recreates the view with minimal required columns
-- NOTE: Adjust column names based on your actual cats table schema

DROP VIEW IF EXISTS all_available_cats;

CREATE VIEW all_available_cats AS
-- Kelsey's foster cats (Featured Fosters)
SELECT 
  c.id,
  c.name,
  -- Use age_years if it exists, otherwise NULL
  CASE 
    WHEN c.age_years IS NOT NULL THEN CONCAT(FLOOR(c.age_years), ' years')
    ELSE 'Unknown age'
  END as age,
  c.age_years,
  c.breed,
  'unknown' as gender,  -- Set default gender since column doesn't exist
  c.color,
  c.size,
  c.main_image_url,
  c.description,
  c.medical_notes,
  
  -- Boolean flags - set to FALSE since columns don't exist in cats table
  FALSE as good_with_kids,
  FALSE as good_with_cats,
  FALSE as good_with_dogs,
  
  -- Special categorization
  CASE 
    WHEN c.medical_notes IS NOT NULL AND c.medical_notes != '' THEN TRUE
    ELSE FALSE 
  END as is_special_needs,
  
  -- Detect senior cats from age or tags
  CASE 
    WHEN c.age_years >= 7 THEN TRUE
    WHEN EXISTS (
      SELECT 1 FROM cat_tags ct 
      JOIN tags t ON ct.tag_id = t.id 
      WHERE ct.cat_id = c.id 
      AND LOWER(t.name) IN ('senior', 'senior cat')
    ) THEN TRUE
    ELSE FALSE 
  END as is_senior,
  
  NULL as bonded_pair_id,
  c.adoptapet_url,
  
  -- Extract Adopt-a-Pet ID from URL for deduplication
  CASE 
    WHEN c.adoptapet_url IS NOT NULL 
    THEN SUBSTRING_INDEX(SUBSTRING_INDEX(c.adoptapet_url, '/pet/', -1), '-', 1)
    ELSE NULL 
  END as adoptapet_id,
  
  -- Badge information
  'featured_foster' as source,
  'cats' as from_table,
  TRUE as is_featured_foster,
  FALSE as is_partner_foster,
  
  -- Metadata
  c.created_at,
  c.updated_at
  
FROM cats c
WHERE c.status = 'available'

UNION ALL

-- VFV partner foster cats (Partner Homes)
SELECT 
  v.id,
  v.name,
  v.age_text as age,
  v.age_years,
  v.breed,
  CASE 
    WHEN LOWER(v.gender) = 'male' THEN 'male'
    WHEN LOWER(v.gender) = 'female' THEN 'female'
    ELSE 'unknown'
  END as gender,
  NULL as color,
  NULL as size,
  v.main_image_url,
  v.description,
  NULL as medical_notes,
  
  -- Boolean flags (not available from Petfinder scraping)
  FALSE as good_with_kids,
  FALSE as good_with_cats,
  FALSE as good_with_dogs,
  
  -- Special categorization
  FALSE as is_special_needs,
  
  -- Calculate is_senior from age_text
  CASE 
    WHEN v.age_text = 'Senior' OR v.age_text LIKE '%senior%' THEN TRUE
    WHEN v.age_years >= 7 THEN TRUE
    ELSE FALSE 
  END as is_senior,
  
  NULL as bonded_pair_id,
  
  v.petfinder_url as adoptapet_url,
  v.petfinder_id as adoptapet_id,
  
  -- Badge information
  'partner_foster' as source,
  'vfv_cats' as from_table,
  FALSE as is_featured_foster,
  TRUE as is_partner_foster,
  
  -- Metadata
  v.scraped_at as created_at,
  v.updated_at
  
FROM vfv_cats v
-- Deduplicate: Exclude partner fosters that match Kelsey's cats by adoptapet_id
WHERE v.petfinder_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM cats c 
  WHERE c.status = 'available'
  AND c.adoptapet_url IS NOT NULL
  AND SUBSTRING_INDEX(SUBSTRING_INDEX(c.adoptapet_url, '/pet/', -1), '-', 1) = v.petfinder_id
);
