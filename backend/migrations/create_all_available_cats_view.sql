-- Migration: Create all_available_cats view
-- Purpose: Unified view of foster cats with proper badge distinction
-- Date: 2026-02-07
-- Updated: 2026-02-14 - Fixed to use actual column names

-- Drop view if exists (for updates)
DROP VIEW IF EXISTS all_available_cats;

-- Create unified view
CREATE VIEW all_available_cats AS

-- Kelsey's foster cats (Featured Fosters)
SELECT 
  c.id,
  c.name,
  NULL as age_years,
  c.breed,
  c.sex as gender,
  c.main_image_url,
  NULL as description,
  FALSE as is_senior,
  FALSE as is_special_needs,
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
  v.age_years,
  v.breed,
  v.gender,
  v.main_image_url,
  v.description,
  
  -- Calculate is_senior from age_text
  CASE WHEN v.age_text = 'Senior' THEN TRUE ELSE FALSE END as is_senior,
  
  NULL as is_special_needs,
  NULL as bonded_pair_id,
  
  v.adoptapet_url,
  v.adoptapet_id,
  
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
WHERE v.adoptapet_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM cats c 
  WHERE c.status = 'available' 
  AND c.adoptapet_url IS NOT NULL
  AND SUBSTRING_INDEX(SUBSTRING_INDEX(c.adoptapet_url, '/pet/', -1), '-', 1) = v.adoptapet_id
);
