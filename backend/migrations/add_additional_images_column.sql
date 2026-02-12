-- Migration: Add additional_images column to cats table
-- Description: Adds support for storing multiple images per cat as JSON array
-- Date: 2026-02-12

-- Add the additional_images column to store an array of image URLs
ALTER TABLE cats 
ADD COLUMN IF NOT EXISTS additional_images JSONB DEFAULT '[]'::jsonb;

-- Add a comment to document the column
COMMENT ON COLUMN cats.additional_images IS 'Array of additional image URLs for the cat (excluding main_image_url). Stored as JSONB array of strings.';

-- Create an index on the JSONB column for better query performance
CREATE INDEX IF NOT EXISTS idx_cats_additional_images ON cats USING GIN (additional_images);

-- Example usage:
-- UPDATE cats SET additional_images = '["https://example.com/cat1.jpg", "https://example.com/cat2.jpg"]'::jsonb WHERE id = 1;
