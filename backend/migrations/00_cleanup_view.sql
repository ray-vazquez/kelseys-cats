-- Migration: Cleanup old all_available_cats view
-- Purpose: Force drop the old view to ensure fresh creation
-- Date: 2026-02-13
-- Note: Run this first if you're getting column errors

-- Drop the view if it exists (force)
DROP VIEW IF EXISTS all_available_cats;

-- Verify it's gone
SELECT 'Old view dropped successfully' AS status;
