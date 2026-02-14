-- Migration: Add featured column to all_available_cats view
-- Purpose: Include featured flag from cats table so homepage can filter spotlighted cats
-- Date: 2026-02-13 (Simplified to cats table only)
-- Note: This creates a working view immediately. VFV cats integration can be added later.

DROP VIEW IF EXISTS all_available_cats;

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
  AND c.deleted_at IS NULL;
