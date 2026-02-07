// backend/src/services/petfinderScraper.js
// Scrapes Voice for the Voiceless cats from Petfinder widget
// Alternative to defunct Petfinder API

import puppeteer from 'puppeteer';

const VOICE_WIDGET_URL = 'https://www.petfinder.com/search/pets-for-adoption/?shelter_id=NY1296&type=cat';
const CACHE_EXPIRY = 6 * 3600 * 1000; // 6 hours

// In-memory cache
const cache = {
  cats: null,
  catsExpiry: 0
};

/**
 * Scrape Voice for the Voiceless cats from Petfinder search page
 * @param {Object} options
 * @param {boolean} options.forceRefresh - Force bypass cache
 * @returns {Promise<Array>} Array of cat objects
 */
export async function scrapeVoiceCats({ forceRefresh = false } = {}) {
  // Check cache
  if (!forceRefresh && cache.cats && Date.now() < cache.catsExpiry) {
    console.log('Returning cached Voice shelter cats');
    return cache.cats;
  }

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
          
          // Extract location (for petfinder_id)
          const petfinderId = url ? url.match(/\/(\d+)-/)?.[1] : null;
          
          results.push({
            name,
            age_text: age,
            age_years: parseAgeToYears(age),
            breed,
            gender,
            main_image_url: image,
            adoptapet_url: url,
            petfinder_id: petfinderId,
            source: 'voice_shelter',
            scraped_at: new Date().toISOString()
          });
          
        } catch (err) {
          console.error('Error parsing pet card:', err);
        }
      });
      
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
      
      return results;
    });
    
    await browser.close();
    
    // Cache results
    cache.cats = cats;
    cache.catsExpiry = Date.now() + CACHE_EXPIRY;
    
    console.log(`Scraped ${cats.length} cats from Voice for the Voiceless`);
    return cats;
    
  } catch (error) {
    console.error('Error scraping Petfinder:', error);
    
    if (browser) {
      await browser.close();
    }
    
    // Return cached data if available (even if expired)
    if (cache.cats) {
      console.log('Returning stale cached data due to scraping error');
      return cache.cats;
    }
    
    // Return empty array as fallback
    return [];
  }
}

/**
 * Clear cache
 */
export function clearCache() {
  cache.cats = null;
  cache.catsExpiry = 0;
  console.log('Petfinder scraper cache cleared');
}

/**
 * Get cache info
 */
export function getCacheInfo() {
  return {
    hasCachedCats: !!cache.cats,
    catsCount: cache.cats?.length || 0,
    catsExpiresIn: cache.catsExpiry > Date.now() ? cache.catsExpiry - Date.now() : 0
  };
}
