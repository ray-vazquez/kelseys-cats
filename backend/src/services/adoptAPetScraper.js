// backend/src/services/adoptAPetScraper.js
// Scrapes Voice for the Voiceless cats from Adopt-a-Pet
// Saves to vfv_cats database table for fast access

import puppeteer from 'puppeteer';
import { query } from '../lib/db.js';

const VFV_ADOPTAPET_URL = 'https://www.adoptapet.com/shelter/184939-voice-for-the-voiceless-schenectady-new-york';

/**
 * Extract Adopt-a-Pet ID from URL
 * Example: https://www.adoptapet.com/pet/12345678-whiskers-schenectady-ny → 12345678
 */
function extractAdoptaPetId(url) {
  if (!url) return null;
  const match = url.match(/\/pet\/(\d+)-/);
  return match ? match[1] : null;
}

/**
 * Get VFV partner foster cats from database
 * @returns {Promise<Array>} Array of cat objects
 */
export async function getPartnerFosterCats() {
  try {
    const cats = await query(
      `SELECT 
        id,
        adoptapet_id,
        name,
        age_text,
        age_years,
        breed,
        gender,
        main_image_url,
        adoptapet_url,
        description,
        scraped_at,
        'partner_foster' as source,
        'vfv_cats' as from_table,
        FALSE as is_featured_foster,
        TRUE as is_partner_foster
      FROM vfv_cats 
      ORDER BY name ASC`
    );
    
    return cats;
  } catch (error) {
    console.error('Error fetching partner foster cats from database:', error);
    return [];
  }
}

/**
 * Scrape Voice for the Voiceless cats from Adopt-a-Pet and save to database
 * This should be run manually via admin endpoint, not on every request
 * @returns {Promise<Object>} Result with counts
 */
export async function scrapeAndSavePartnerFosterCats() {
  let browser;
  
  try {
    console.log('Scraping Voice for the Voiceless cats from Adopt-a-Pet...');
    
    // Launch headless browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    
    // Navigate to Adopt-a-Pet shelter page
    console.log('Loading Adopt-a-Pet page...');
    await page.goto(VFV_ADOPTAPET_URL, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    // Wait for pet cards to load
    // Adopt-a-Pet uses different selectors than Petfinder
    await page.waitForSelector('.pet-card, [class*="PetCard"], .shelter-pet', {
      timeout: 15000
    });
    
    // Scroll to load lazy-loaded images
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(2000);
    
    // Extract cat data from page
    const cats = await page.evaluate(() => {
      const results = [];
      
      // Try multiple selectors for Adopt-a-Pet
      let cards = document.querySelectorAll('.pet-card');
      if (cards.length === 0) {
        cards = document.querySelectorAll('[class*="PetCard"]');
      }
      if (cards.length === 0) {
        cards = document.querySelectorAll('.shelter-pet');
      }
      if (cards.length === 0) {
        cards = document.querySelectorAll('[data-pet-id]');
      }
      
      console.log(`Found ${cards.length} pet cards`);
      
      cards.forEach(card => {
        try {
          // Extract pet link first (most reliable)
          const linkEl = card.querySelector('a[href*="/pet/"]');
          const url = linkEl?.href;
          
          if (!url) return; // Skip if no URL found
          
          // Extract pet name
          const nameEl = card.querySelector(
            '.pet-name, [class*="PetName"], h3, h2, .name'
          );
          const name = nameEl?.textContent?.trim();
          
          if (!name) return; // Skip if no name found
          
          // Extract image
          const imgEl = card.querySelector('img');
          const image = imgEl?.src || imgEl?.dataset?.src || imgEl?.dataset?.lazySrc;
          
          // Extract breed/age info
          const infoEl = card.querySelector(
            '.pet-info, [class*="PetInfo"], .breed-age, .details'
          );
          const infoText = infoEl?.textContent?.trim() || '';
          
          // Parse age
          let ageText = null;
          if (infoText.includes('Baby') || infoText.includes('Kitten')) ageText = 'Baby';
          else if (infoText.includes('Young')) ageText = 'Young';
          else if (infoText.includes('Adult')) ageText = 'Adult';
          else if (infoText.includes('Senior')) ageText = 'Senior';
          
          // Parse breed
          let breed = 'Domestic Shorthair';
          const breedMatch = infoText.match(/(\w+\s*\w*)\s*Cat/i);
          if (breedMatch) {
            breed = breedMatch[1].trim();
          }
          
          // Parse gender
          let gender = 'unknown';
          if (infoText.includes('Male')) gender = 'male';
          else if (infoText.includes('Female')) gender = 'female';
          
          // Extract Adopt-a-Pet ID from URL
          const idMatch = url.match(/\/pet\/(\d+)-/);
          const adoptapet_id = idMatch ? idMatch[1] : null;
          
          if (!adoptapet_id) return; // Skip if no ID
          
          // Helper function to map age to years
          function parseAgeToYears(ageText) {
            const ageMap = {
              'Baby': 0.5,
              'Young': 2,
              'Adult': 5,
              'Senior': 10
            };
            return ageMap[ageText] || null;
          }
          
          results.push({
            adoptapet_id,
            name,
            age_text: ageText,
            age_years: parseAgeToYears(ageText),
            breed,
            gender,
            main_image_url: image,
            adoptapet_url: url
          });
          
        } catch (err) {
          console.error('Error parsing pet card:', err);
        }
      });
      
      return results;
    });
    
    await browser.close();
    
    console.log(`Scraped ${cats.length} cats from Adopt-a-Pet`);
    
    // Save to database
    let added = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const cat of cats) {
      try {
        // Check if cat already exists (by adoptapet_id)
        const existing = await query(
          'SELECT id FROM vfv_cats WHERE adoptapet_id = ?',
          [cat.adoptapet_id]
        );
        
        if (existing.length > 0) {
          // Update existing cat
          await query(
            `UPDATE vfv_cats SET 
              name = ?,
              age_text = ?,
              age_years = ?,
              breed = ?,
              gender = ?,
              main_image_url = ?,
              adoptapet_url = ?,
              updated_at = NOW()
            WHERE id = ?`,
            [
              cat.name,
              cat.age_text,
              cat.age_years,
              cat.breed,
              cat.gender,
              cat.main_image_url,
              cat.adoptapet_url,
              existing[0].id
            ]
          );
          updated++;
        } else {
          // Check if this cat is already in Kelsey's foster care (cats table)
          // Don't add to vfv_cats if already being fostered at Kelsey's
          const inKelseysCare = await query(
            `SELECT id FROM cats 
             WHERE status = 'available' 
             AND adoptapet_url LIKE ?`,
            [`%${cat.adoptapet_id}%`]
          );
          
          if (inKelseysCare.length > 0) {
            console.log(`Skipping ${cat.name} - already in Kelsey's care`);
            skipped++;
            continue;
          }
          
          // Insert new cat
          await query(
            `INSERT INTO vfv_cats (
              adoptapet_id,
              name,
              age_text,
              age_years,
              breed,
              gender,
              main_image_url,
              adoptapet_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              cat.adoptapet_id,
              cat.name,
              cat.age_text,
              cat.age_years,
              cat.breed,
              cat.gender,
              cat.main_image_url,
              cat.adoptapet_url
            ]
          );
          added++;
        }
      } catch (err) {
        console.error(`Error saving cat ${cat.name}:`, err);
        errors++;
      }
    }
    
    console.log(`Scraping complete: ${added} added, ${updated} updated, ${skipped} skipped, ${errors} errors`);
    
    return {
      success: true,
      added,
      updated,
      skipped,
      errors,
      total: cats.length
    };
    
  } catch (error) {
    console.error('Error scraping Adopt-a-Pet:', error);
    
    if (browser) {
      await browser.close();
    }
    
    throw error;
  }
}

/**
 * Delete cats that are no longer on Adopt-a-Pet
 * (Call this after scrapeAndSavePartnerFosterCats to clean up adopted cats)
 */
export async function cleanupOldPartnerFosterCats() {
  try {
    // Delete cats older than 7 days (likely adopted)
    const result = await query(
      'DELETE FROM vfv_cats WHERE updated_at < DATE_SUB(NOW(), INTERVAL 7 DAY)'
    );
    
    return {
      success: true,
      deleted: result.affectedRows || 0
    };
  } catch (error) {
    console.error('Error cleaning up old cats:', error);
    throw error;
  }
}
