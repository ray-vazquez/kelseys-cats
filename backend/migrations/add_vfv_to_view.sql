-- Migration: Add VFV cats to all_available_cats view
-- Purpose: Extend the view to include Voice for the Voiceless partner foster cats
-- Date: 2026-02-13
-- Prerequisites: create_vfv_cats_table.sql must be run first
-- Note: Only run this after vfv_cats table is fully set up with gender and description columns

DROP VIEW IF EXISTS all_available_cats;

CREATE VIEW all_available_cats AS

-- Kelsey's foster cats (Featured Fosters)
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
  AND c.deleted_at IS NULL

UNION ALL

-- VFV partner foster cats (Partner Homes)
SELECT 
  v.id,
  v.name,
  v.age_years,
  v.breed,
  v.gender as sex,
  v.main_image_url,
  v.description as temperament,
  
  -- Calculate is_senior from age_text
  CASE WHEN v.age_text = 'Senior' THEN TRUE ELSE FALSE END as is_senior,
  
  NULL as is_special_needs,
  NULL as bonded_pair_id,
  NULL as adoptapet_url,
  0 as featured,
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

-- Deduplicate: Exclude partner fosters that match Kelsey's cats
WHERE NOT EXISTS (
  SELECT 1 FROM cats c 
  WHERE c.status = 'available'
  AND c.deleted_at IS NULL 
  AND c.adoptapet_url IS NOT NULL
  AND SUBSTRING_INDEX(SUBSTRING_INDEX(c.adoptapet_url, '/pet/', -1), '-', 1) = v.petfinder_id
);
