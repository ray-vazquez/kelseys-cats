-- Migration: Add adoptapet_id column to vfv_cats
-- Purpose: Store Adopt-a-Pet ID separately for efficient deduplication
-- Date: 2026-02-07
-- Updated: 2026-02-14 - Simplified for MySQL compatibility

-- Add adoptapet_id column (safe to run multiple times)
ALTER TABLE vfv_cats
ADD COLUMN adoptapet_id VARCHAR(50) NULL;
