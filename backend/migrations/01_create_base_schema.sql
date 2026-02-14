-- Migration: Create Base Schema
-- Description: Creates core tables for users, cats, tags, and alumni
-- Date: 2026-02-14

-- Users table for admin authentication
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'viewer') DEFAULT 'viewer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Cats table for adoptable cats
CREATE TABLE IF NOT EXISTS cats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  age VARCHAR(50),
  gender ENUM('Male', 'Female', 'Unknown'),
  breed VARCHAR(100),
  color VARCHAR(100),
  size ENUM('Small', 'Medium', 'Large'),
  description TEXT,
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
  source VARCHAR(50) DEFAULT 'manual',
  external_id VARCHAR(100),
  adoptapet_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tags table for filtering cats
CREATE TABLE IF NOT EXISTS tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cat-Tags junction table (many-to-many)
CREATE TABLE IF NOT EXISTS cat_tags (
  cat_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (cat_id, tag_id),
  FOREIGN KEY (cat_id) REFERENCES cats(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Alumni table for adopted cats
CREATE TABLE IF NOT EXISTS alumni (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cat_id INT UNIQUE,
  adoption_story TEXT,
  adopter_name VARCHAR(100),
  adoption_date DATE,
  follow_up_date DATE,
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cat_id) REFERENCES cats(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX idx_cats_status ON cats(status);
CREATE INDEX idx_cats_featured ON cats(featured);
CREATE INDEX idx_cats_source ON cats(source);
CREATE INDEX idx_tags_name ON tags(name);

SELECT 'Base schema created successfully' AS status;
