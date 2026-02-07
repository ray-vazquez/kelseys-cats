-- Seed data: 40 diverse cats with mixed attributes
-- Run this file to populate the cats table with sample data
-- Usage: mysql -u root -p kelseys_cats < seed-cats.sql

-- Clear existing data (optional - comment out if you want to keep existing cats)
-- DELETE FROM cats;
-- ALTER TABLE cats AUTO_INCREMENT = 1;

-- Insert 40 diverse cats
INSERT INTO cats (name, age_years, sex, breed, temperament, good_with_kids, good_with_cats, good_with_dogs, medical_notes, is_special_needs, is_senior, status, main_image_url, featured, bonded_pair_id, created_at, updated_at) VALUES

-- Young & Playful Cats (1-3 years)
('Whiskers', 3, 'male', 'Tabby', 'Playful and energetic, loves to chase toys and explore', 1, 1, 0, NULL, 0, 0, 'available', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800', 1, NULL, NOW(), NOW()),
('Luna', 2, 'female', 'Russian Blue', 'Gentle and affectionate, perfect lap cat', 1, 1, 1, NULL, 0, 0, 'available', 'https://images.unsplash.com/photo-1573865526739-10c1dd7aa1fd?w=800', 1, NULL, NOW(), NOW()),
('Felix', 2, 'male', 'Tuxedo', 'High energy acrobat, loves climbing', 0, 1, 0, NULL, 0, 0, 'available', 'https://images.unsplash.com/photo-1542652694-40abf526446e?w=800', 0, NULL, NOW(), NOW()),
('Daisy', 1, 'female', 'Calico', 'Sweet kitten with lots of personality', 1, 1, 1, NULL, 0, 0, 'available', 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800', 1, NULL, NOW(), NOW()),
('Oliver', 1, 'male', 'Orange Tabby', 'Curious kitten, loves attention', 1, 1, 1, NULL, 0, 0, 'pending', 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=800', 1, NULL, NOW(), NOW()),

-- Adult Cats (4-9 years)
('Shadow', 7, 'male', 'Domestic Shorthair', 'Independent but loving, good mouser', 0, 1, 0, NULL, 0, 0, 'available', 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800', 0, NULL, NOW(), NOW()),
('Bella', 8, 'female', 'Siamese', 'Talkative and social, loves conversation', 1, 1, 0, NULL, 0, 0, 'available', 'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=800', 0, NULL, NOW(), NOW()),
('Smokey', 5, 'male', 'Grey Domestic', 'Shy at first but very sweet', 0, 1, 0, NULL, 0, 0, 'available', 'https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=800', 0, 9, NOW(), NOW()),
('Misty', 5, 'female', 'Grey Tabby', 'Shy but curious, bonded with Smokey', 0, 1, 0, NULL, 0, 0, 'available', 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=800', 0, 8, NOW(), NOW()),
('Tiger', 6, 'male', 'Orange Tabby', 'Friendly lap cat, purrs constantly', 1, 1, 1, NULL, 0, 0, 'available', 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800', 1, NULL, NOW(), NOW()),
('Chloe', 7, 'female', 'Calico', 'Sweet and gentle soul', 1, 1, 1, NULL, 0, 0, 'available', 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=800', 0, NULL, NOW(), NOW()),
('Rocky', 9, 'male', 'Maine Coon', 'Gentle giant with a big heart', 1, 1, 1, NULL, 0, 0, 'available', 'https://images.unsplash.com/photo-1583795128727-6ec3642408f8?w=800', 0, NULL, NOW(), NOW()),
('Ginger', 4, 'female', 'Orange Persian', 'Adventurous explorer', 0, 1, 1, NULL, 0, 0, 'pending', 'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=800', 0, NULL, NOW(), NOW()),
('Oreo', 6, 'male', 'Tuxedo', 'Playful hunter, loves toys', 1, 0, 1, NULL, 0, 0, 'available', 'https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?w=800', 1, NULL, NOW(), NOW()),
('Nala', 4, 'female', 'Cream Tabby', 'Curious and intelligent', 1, 1, 0, NULL, 0, 0, 'available', 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=800', 0, NULL, NOW(), NOW()),
('Milo', 6, 'male', 'Brown Tabby', 'Easy-going and friendly', 1, 1, 1, NULL, 0, 0, 'available', 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=800', 0, NULL, NOW(), NOW()),
('Willow', 3, 'female', 'Tortoiseshell', 'Sassy diva with attitude', 0, 0, 0, NULL, 0, 0, 'hold', 'https://images.unsplash.com/photo-1506755855567-92ff770e8d00?w=800', 0, NULL, NOW(), NOW()),
('Pepper', 2, 'female', 'Black & White', 'Spunky and playful', 0, 1, 1, NULL, 0, 0, 'available', 'https://images.unsplash.com/photo-1571566882372-1598d88abd90?w=800', 0, NULL, NOW(), NOW()),
('Ruby', 7, 'female', 'Red Tabby', 'Independent outdoor enthusiast', 0, 0, 1, NULL, 0, 0, 'available', 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800', 0, NULL, NOW(), NOW()),
('Molly', 4, 'female', 'Tortoiseshell', 'Playful spirit, loves feather toys', 1, 1, 1, NULL, 0, 0, 'available', 'https://images.unsplash.com/photo-1472491235688-bdc81a63246e?w=800', 1, NULL, NOW(), NOW()),

-- Senior Cats (10+ years)
('Princess', 11, 'female', 'Ragdoll', 'Sweet and docile senior lady', 1, 1, 0, NULL, 0, 1, 'available', 'https://images.unsplash.com/photo-1548681528-6a5c45b66b42?w=800', 0, NULL, NOW(), NOW()),
('Pumpkin', 10, 'female', 'Orange Persian', 'Couch potato, loves naps', 1, 1, 0, NULL, 0, 1, 'available', 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=800', 0, NULL, NOW(), NOW()),
('Cleo', 14, 'female', 'Siamese', 'Dignified elderly queen', 1, 0, 0, NULL, 0, 1, 'hold', 'https://images.unsplash.com/photo-1580363738845-c5a76f5a5e9f?w=800', 0, NULL, NOW(), NOW()),
('Charlie', 11, 'male', 'Grey Tabby', 'Mellow gentleman, perfect senior companion', 1, 1, 1, NULL, 0, 1, 'available', 'https://images.unsplash.com/photo-1536500152107-01ab1422f932?w=800', 1, NULL, NOW(), NOW()),
('Toby', 10, 'male', 'Grey Mix', 'Cuddly senior, loves blankets', 1, 1, 1, NULL, 0, 1, 'available', 'https://images.unsplash.com/photo-1547955922-85912e223015?w=800', 0, NULL, NOW(), NOW()),
('Zoe', 11, 'female', 'Russian Blue', 'Reserved but loving companion', 1, 1, 0, NULL, 0, 1, 'available', 'https://images.unsplash.com/photo-1541599468348-e96984315921?w=800', 0, NULL, NOW(), NOW()),
('Rosie', 14, 'female', 'Calico', 'Sweet grandma cat, very gentle', 1, 0, 0, NULL, 0, 1, 'available', 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=800', 0, NULL, NOW(), NOW()),
('Chester', 12, 'male', 'Orange Tabby', 'Wise elder statesman', 1, 1, 0, NULL, 0, 1, 'available', 'https://images.unsplash.com/photo-1511044568932-338cba0ad803?w=800', 0, NULL, NOW(), NOW()),

-- Special Needs Cats
('Boots', 15, 'male', 'Maine Coon', 'Sweet senior, requires arthritis medication', 1, 0, 0, 'Arthritis - takes daily medication. Very manageable.', 1, 1, 'available', 'https://images.unsplash.com/photo-1568152950566-c1bf43f4ab28?w=800', 1, NULL, NOW(), NOW()),
('Max', 13, 'male', 'Tuxedo', 'Gentle soul with managed kidney disease', 1, 1, 1, 'Kidney disease managed with special diet. Doing great!', 1, 1, 'available', 'https://images.unsplash.com/photo-1583795128727-6ec3642408f8?w=800', 0, NULL, NOW(), NOW()),
('Simba', 12, 'male', 'Orange Tabby', 'Loving senior on thyroid medication', 1, 0, 0, 'Hyperthyroidism - takes daily medication. Very sweet boy.', 1, 1, 'available', 'https://images.unsplash.com/photo-1573865526739-10c1dd7aa1fd?w=800', 0, NULL, NOW(), NOW()),
('Sophie', 15, 'female', 'Dilute Calico', 'Partially blind but navigates well', 1, 0, 0, 'Vision impaired but does great in familiar environments.', 1, 1, 'available', 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=800', 1, NULL, NOW(), NOW()),
('Oscar', 13, 'male', 'Black Domestic', 'Wise elder with treated dental disease', 1, 1, 0, 'Dental disease treated. May need soft food.', 1, 1, 'available', 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=800', 0, NULL, NOW(), NOW()),
('Jasper', 4, 'male', 'Bengal', 'High energy, needs experienced owner', 0, 0, 0, 'Very active breed - requires lots of playtime and enrichment.', 1, 0, 'available', 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800', 1, NULL, NOW(), NOW()),

-- Additional Variety
('Snowball', 4, 'female', 'White Domestic', 'Energetic hunter and explorer', 0, 0, 1, NULL, 0, 0, 'available', 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=800', 0, NULL, NOW(), NOW()),
('Garfield', 8, 'male', 'Orange Persian', 'Lazy foodie, loves treats', 1, 1, 1, NULL, 0, 0, 'hold', 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=800', 1, NULL, NOW(), NOW()),
('Leo', 3, 'male', 'Siamese Mix', 'Vocal companion, talks a lot', 1, 1, 0, NULL, 0, 0, 'pending', 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800', 0, NULL, NOW(), NOW()),
('Lily', 2, 'female', 'White Persian', 'Princess with a sweet personality', 1, 0, 0, NULL, 0, 0, 'available', 'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=800', 1, NULL, NOW(), NOW()),
('Zeus', 5, 'male', 'Maine Coon', 'Majestic and gentle giant', 1, 1, 1, NULL, 0, 0, 'hold', 'https://images.unsplash.com/photo-1583795128727-6ec3642408f8?w=800', 0, NULL, NOW(), NOW()),
('Buddy', 6, 'male', 'Orange & White', 'Friendly greeter, loves everyone', 1, 1, 1, NULL, 0, 0, 'available', 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800', 1, NULL, NOW(), NOW()),
('Mittens', 2, 'female', 'Persian', 'Gentle and loving young cat', 1, 1, 1, NULL, 0, 0, 'pending', 'https://images.unsplash.com/photo-1548681528-6a5c45b66b42?w=800', 1, NULL, NOW(), NOW());

-- Success message
SELECT 'Successfully inserted 40 cats!' AS status;

-- Show summary
SELECT 
  status,
  COUNT(*) as count
FROM cats
WHERE deleted_at IS NULL
GROUP BY status
ORDER BY status;

SELECT 
  CASE 
    WHEN is_senior = 1 THEN 'Senior (10+ years)'
    WHEN age_years >= 7 THEN 'Adult (7-9 years)'
    WHEN age_years >= 4 THEN 'Young Adult (4-6 years)'
    ELSE 'Young (1-3 years)'
  END as age_group,
  COUNT(*) as count
FROM cats
WHERE deleted_at IS NULL
GROUP BY age_group
ORDER BY count DESC;

SELECT 
  'Special Needs' as category,
  COUNT(*) as count
FROM cats
WHERE is_special_needs = 1 AND deleted_at IS NULL
UNION ALL
SELECT 
  'Senior' as category,
  COUNT(*) as count
FROM cats
WHERE is_senior = 1 AND deleted_at IS NULL
UNION ALL
SELECT 
  'Featured' as category,
  COUNT(*) as count
FROM cats
WHERE featured = 1 AND deleted_at IS NULL;
