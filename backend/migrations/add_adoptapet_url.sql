-- Migration: Add adoptapet_url column to cats table
-- Purpose: Track Adopt-a-Pet profile URLs for cats listed on Voice for the Voiceless page
-- Date: 2026-02-07

ALTER TABLE cats 
ADD COLUMN adoptapet_url VARCHAR(500) NULL
COMMENT 'Full URL to cat profile on Adopt-a-Pet (e.g., https://www.adoptapet.com/pet/12345678-whiskers-schenectady-ny)';

-- Optional: Add index for faster lookups
CREATE INDEX idx_adoptapet_url ON cats(adoptapet_url);

-- Example data (uncomment to populate existing cats with URLs):
-- UPDATE cats SET adoptapet_url = 'https://www.adoptapet.com/pet/12345678-whiskers-schenectady-ny' WHERE id = 1;
-- UPDATE cats SET adoptapet_url = 'https://www.adoptapet.com/pet/87654321-luna-schenectady-ny' WHERE id = 2;
