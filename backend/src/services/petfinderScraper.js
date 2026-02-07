// backend/src/services/petfinderScraper.js
// Scrapes Voice for the Voiceless cats from Petfinder widget
// Saves to vfv_cats database table for fast access

import puppeteer from 'puppeteer';
import { query } from '../lib/db.js';

const VOICE_WIDGET_URL = 'https://www.petfinder.com/search/pets-for-adoption/?shelter_id=NY1296&type=cat';

/**
 * Get Voice for the Voiceless cats from database
 * @returns {Promise<Array>} Array of cat objects
 */
export async function getVoiceCats() {
  try {
    const cats = await query(
      `SELECT 
        id,
        petfinder_id,
        name,
        age_text,
        age_years,
        breed,
        gender,
        main_image_url,
        petfinder_url as adoptapet_url,
        description,
        scraped_at,
        'voice_shelter' as source
      FROM vfv_cats 
      ORDER BY name ASC`
    );
    
    return cats.map(cat => ({
      ...cat,
      petfinder_data: {
        age_text: cat.age_text,
        gender: cat.gender
      }
    }));
  } catch (error) {
    console.error('Error fetching Voice cats from database:', error);
    return [];
  }
}

/**
 * Scrape Voice for the Voiceless cats from Petfinder and save to database
 * This should be run manually via admin endpoint, not on every request
 * @returns {Promise<Object>} Result with counts
 */
export async function scrapeAndSaveVoiceCats() {
  let browser;
  
  try {
    console.log('Scraping Voice for the Voiceless cats from Petfinder...');
    
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
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    );
    
    // Navigate to Petfinder search for Voice shelter
    await page.goto(VOICE_WIDGET_URL, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    // Wait for pet cards to load
    await page.waitForSelector('[data-test="Pet_List_Card"], .petCard', {
      timeout: 10000
    });
    
    // Extract cat data from page
    const cats = await page.evaluate(() => {
      const results = [];
      
      // Try modern selector first
      let cards = document.querySelectorAll('[data-test="Pet_List_Card"]');
      
      // Fallback to older selector
      if (cards.length === 0) {
        cards = document.querySelectorAll('.petCard, .petResult, [class*="pet-card"]');
      }
      
      cards.forEach(card => {
        try {
          // Extract pet name
          const nameEl = card.querySelector(
            '[data-test="Pet_Name"], .petCard-name, .pet-name, h2, h3'
          );
          const name = nameEl?.textContent?.trim();
          
          if (!name) return; // Skip if no name found
          
          // Extract image
          const imgEl = card.querySelector('img');
          const image = imgEl?.src || imgEl?.dataset?.src;
          
          // Extract URL
          const linkEl = card.querySelector('a');
          const url = linkEl?.href;
          
          // Extract age/breed info
          const infoEls = card.querySelectorAll(
            '[data-test="Pet_Info"], .petCard-info, .pet-info, .u-vr2x'
          );
          
          let age = null;
          let breed = 'Domestic Shorthair';
          let gender = 'unknown';
          
          infoEls.forEach(el => {
            const text = el.textContent.trim();
            
            // Parse age
            if (text.includes('Baby') || text.includes('Kitten')) age = 'Baby';
            else if (text.includes('Young')) age = 'Young';
            else if (text.includes('Adult')) age = 'Adult';
            else if (text.includes('Senior')) age = 'Senior';
            
            // Parse gender
            if (text.includes('Male')) gender = 'male';
            else if (text.includes('Female')) gender = 'female';
            
            // Parse breed (usually longer text)
            if (text.length > 10 && !text.includes('years') && !text.includes('months')) {
              breed = text;
            }
          });
          
          // Extract petfinder ID from URL
          const petfinderId = url ? url.match(/\/(\d+)-/)?.[1] : null;
          
          // Helper function (runs in browser context)
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
            petfinder_id: petfinderId,
            name,
            age_text: age,
            age_years: parseAgeToYears(age),
            breed,
            gender,
            main_image_url: image,
            petfinder_url: url
          });
          
        } catch (err) {
          console.error('Error parsing pet card:', err);
        }
      });
      
      return results;
    });
    
    await browser.close();
    
    // Save to database
    let added = 0;
    let updated = 0;
    let errors = 0;
    
    for (const cat of cats) {
      try {
        // Check if cat already exists
        const existing = await query(
          'SELECT id FROM vfv_cats WHERE petfinder_id = ? OR name = ?',
          [cat.petfinder_id, cat.name]
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
              petfinder_url = ?,
              updated_at = NOW()
            WHERE id = ?`,
            [
              cat.name,
              cat.age_text,
              cat.age_years,
              cat.breed,
              cat.gender,
              cat.main_image_url,
              cat.petfinder_url,
              existing[0].id
            ]
          );
          updated++;
        } else {
          // Insert new cat
          await query(
            `INSERT INTO vfv_cats (
              petfinder_id,
              name,
              age_text,
              age_years,
              breed,
              gender,
              main_image_url,
              petfinder_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              cat.petfinder_id,
              cat.name,
              cat.age_text,
              cat.age_years,
              cat.breed,
              cat.gender,
              cat.main_image_url,
              cat.petfinder_url
            ]
          );
          added++;
        }
      } catch (err) {
        console.error(`Error saving cat ${cat.name}:`, err);
        errors++;
      }
    }
    
    console.log(`Scraping complete: ${added} added, ${updated} updated, ${errors} errors`);
    
    return {
      success: true,
      added,
      updated,
      errors,
      total: cats.length
    };
    
  } catch (error) {
    console.error('Error scraping Petfinder:', error);
    
    if (browser) {
      await browser.close();
    }
    
    throw error;
  }
}

/**
 * Delete cats that are no longer on Petfinder
 * (Call this after scrapeAndSaveVoiceCats to clean up adopted cats)
 */
export async function cleanupOldCats() {
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
