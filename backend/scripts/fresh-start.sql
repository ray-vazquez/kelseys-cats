-- ============================================
-- Kelsey's Cats - Fresh Database Setup
-- ============================================
-- This script creates a clean database from scratch
-- Use this when starting fresh or resetting the database
--
-- Usage: mysql -u root -p kelseys_cats < backend/scripts/fresh-start.sql
-- ============================================

-- Drop existing views first (to avoid dependency issues)
DROP VIEW IF EXISTS all_available_cats;

-- Drop existing tables (in correct order to handle foreign keys)
DROP TABLE IF EXISTS cat_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS alumni;
DROP TABLE IF EXISTS vfv_cats;
DROP TABLE IF EXISTS cats;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS schema_migrations;

-- ============================================
-- CORE TABLES
-- ============================================

-- Users table for authentication
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'viewer') DEFAULT 'viewer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Main cats table (Kelsey's Featured Fosters)
CREATE TABLE cats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  age VARCHAR(50),
  sex VARCHAR(20),
  breed VARCHAR(100),
  color VARCHAR(100),
  size ENUM('Small', 'Medium', 'Large'),
  main_image_url TEXT,
  additional_images JSON,
  good_with_kids BOOLEAN DEFAULT FALSE,
  good_with_cats BOOLEAN DEFAULT FALSE,
  good_with_dogs BOOLEAN DEFAULT FALSE,
  medical_notes TEXT,
  adoption_fee DECIMAL(10, 2),
  status ENUM('available', 'pending', 'adopted') DEFAULT 'available',
  featured BOOLEAN DEFAULT FALSE,
  intake_date DATE,
  adoption_date DATE,
  adoptapet_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_status (status),
  INDEX idx_featured (featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- VFV cats table (Partner Foster Homes)
CREATE TABLE vfv_cats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  age_text VARCHAR(20),
  age_years DECIMAL(3,1),
  breed VARCHAR(100),
  gender VARCHAR(20),
  main_image_url TEXT,
  description TEXT,
  adoptapet_id VARCHAR(50) UNIQUE,
  adoptapet_url TEXT,
  scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_name (name),
  INDEX idx_adoptapet_id (adoptapet_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tags for filtering cats
CREATE TABLE tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Cat-Tags junction table
CREATE TABLE cat_tags (
  cat_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (cat_id, tag_id),
  FOREIGN KEY (cat_id) REFERENCES cats(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Alumni table for adopted cats
CREATE TABLE alumni (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cat_id INT UNIQUE,
  adoption_story TEXT,
  adopter_name VARCHAR(100),
  adoption_date DATE,
  follow_up_date DATE,
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- UNIFIED VIEW (all available cats)
-- ============================================

CREATE VIEW all_available_cats AS

-- Kelsey's Featured Fosters
SELECT 
  c.id,
  c.name,
  NULL as age_years,
  c.age as age_text,
  c.breed,
  c.sex,
  c.main_image_url,
  NULL as temperament,
  FALSE as is_senior,
  FALSE as is_special_needs,
  NULL as bonded_pair_id,
  c.adoptapet_url,
  c.featured,
  
  -- Extract Adopt-a-Pet ID from URL
  CASE 
    WHEN c.adoptapet_url IS NOT NULL 
    THEN SUBSTRING_INDEX(SUBSTRING_INDEX(c.adoptapet_url, '/pet/', -1), '-', 1)
    ELSE NULL 
  END as adoptapet_id,
  
  'featured_foster' as source,
  'cats' as from_table,
  TRUE as is_featured_foster,
  FALSE as is_partner_foster,
  
  c.created_at,
  c.updated_at
  
FROM cats c
WHERE c.status = 'available'

UNION ALL

-- VFV Partner Foster Homes
SELECT 
  v.id,
  v.name,
  v.age_years,
  v.age_text,
  v.breed,
  v.gender as sex,
  v.main_image_url,
  v.description as temperament,
  CASE WHEN v.age_text = 'Senior' THEN TRUE ELSE FALSE END as is_senior,
  NULL as is_special_needs,
  NULL as bonded_pair_id,
  v.adoptapet_url,
  0 as featured,
  v.adoptapet_id,
  
  'partner_foster' as source,
  'vfv_cats' as from_table,
  FALSE as is_featured_foster,
  TRUE as is_partner_foster,
  
  v.scraped_at as created_at,
  v.updated_at
  
FROM vfv_cats v
WHERE v.adoptapet_id IS NOT NULL
  -- Deduplicate: Exclude if already in Kelsey's cats
  AND NOT EXISTS (
    SELECT 1 FROM cats c 
    WHERE c.status = 'available'
    AND c.adoptapet_url IS NOT NULL
    AND SUBSTRING_INDEX(SUBSTRING_INDEX(c.adoptapet_url, '/pet/', -1), '-', 1) = v.adoptapet_id
  );

-- ============================================
-- MIGRATION TRACKING
-- ============================================

CREATE TABLE schema_migrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  migration_name VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Mark this as the base migration
INSERT INTO schema_migrations (migration_name) VALUES ('00_fresh_start.sql');

SELECT '✅ Database setup complete!' AS status;
