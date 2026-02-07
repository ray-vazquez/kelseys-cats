-- Migration: Create vfv_cats table
-- Purpose: Store scraped Voice for the Voiceless cats in database (faster than scraping on every request)
-- Date: 2026-02-07

CREATE TABLE IF NOT EXISTS vfv_cats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  petfinder_id VARCHAR(50) UNIQUE,
  name VARCHAR(100) NOT NULL,
  age_text VARCHAR(20),
  age_years DECIMAL(3,1),
  breed VARCHAR(100),
  gender VARCHAR(20),
  main_image_url TEXT,
  petfinder_url TEXT,
  description TEXT,
  scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_name (name),
  INDEX idx_scraped_at (scraped_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add comment
ALTER TABLE vfv_cats COMMENT = 'Voice for the Voiceless shelter cats (scraped from Petfinder)';
