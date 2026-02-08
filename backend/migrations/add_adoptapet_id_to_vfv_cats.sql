-- Migration: Add adoptapet_id column to vfv_cats
-- Purpose: Store Adopt-a-Pet ID separately for efficient deduplication
-- Date: 2026-02-07

ALTER TABLE vfv_cats
ADD COLUMN adoptapet_id VARCHAR(50) NULL AFTER petfinder_id,
ADD COLUMN adoptapet_url TEXT NULL AFTER main_image_url;

-- Add unique index on adoptapet_id
CREATE UNIQUE INDEX idx_adoptapet_id ON vfv_cats(adoptapet_id);

-- Add index on adoptapet_url for lookups
CREATE INDEX idx_vfv_adoptapet_url ON vfv_cats(adoptapet_url(255));

-- Update petfinder_url column name to adoptapet_url (if needed)
-- Note: Check if petfinder_url exists first
ALTER TABLE vfv_cats 
CHANGE COLUMN petfinder_url temp_url TEXT;

ALTER TABLE vfv_cats
DROP COLUMN temp_url;
