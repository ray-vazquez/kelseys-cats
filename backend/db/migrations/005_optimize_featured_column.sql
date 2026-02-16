-- backend/db/migrations/005_optimize_featured_column.sql
-- Optimize featured column to proper BOOLEAN type

-- Make featured NOT NULL with proper default
ALTER TABLE cats 
  MODIFY COLUMN featured BOOLEAN NOT NULL DEFAULT FALSE;

-- Update any NULL values (safety check)
UPDATE cats SET featured = FALSE WHERE featured IS NULL;
