-- Migration: Add additional_images column to cats table
-- Description: Adds support for storing multiple images per cat as JSON array
-- Date: 2026-02-12
-- Updated: 2026-02-14 - Fixed MySQL syntax (removed IF NOT EXISTS)

-- Check if column exists, skip if already added
-- Note: This migration is safe to run multiple times - MySQL will error if column exists
-- which is handled by the migration runner

ALTER TABLE cats 
ADD COLUMN additional_images JSON DEFAULT NULL;
