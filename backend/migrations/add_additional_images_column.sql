-- Migration: Add additional_images column to cats table
-- Description: Adds support for storing multiple images per cat as JSON array
-- Date: 2026-02-12
-- Updated: 2026-02-14 - Fixed for MySQL syntax

-- Add the additional_images column to store an array of image URLs (MySQL JSON type)
ALTER TABLE cats 
ADD COLUMN IF NOT EXISTS additional_images JSON DEFAULT NULL;

-- Note: MySQL doesn't support COMMENT ON COLUMN syntax
-- Column is documented in schema documentation

-- Note: MySQL doesn't need GIN indexes for JSON columns
-- JSON functions work efficiently without special indexes

-- Example usage:
-- UPDATE cats SET additional_images = JSON_ARRAY('https://example.com/cat1.jpg', 'https://example.com/cat2.jpg') WHERE id = 1;
