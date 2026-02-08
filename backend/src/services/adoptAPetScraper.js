// backend/src/services/adoptAPetScraper.js
// Scrapes Voice for the Voiceless cats from Adopt-a-Pet
// Saves to vfv_cats database table for fast access

import puppeteer from "puppeteer";
import { query } from "../lib/db.js";

const VFV_ADOPTAPET_URL =
  "https://www.adoptapet.com/shelter/184939-voice-for-the-voiceless-schenectady-new-york";

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
 * Helper: map Adopt-a-Pet age text → numeric years
 */
function mapAgeToYears(ageText) {
  if (!ageText) return null;
  const t = ageText.toLowerCase();

  if (t.includes("baby") || t.includes("kitten")) return 0.5;
  if (t.includes("young")) return 2;
  if (t.includes("adult")) return 5;
  if (t.includes("senior")) return 10;

  return null;
}

/**
 * Get VFV partner foster cats from database
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
        sex,
        main_image_url,
        adoptapet_url,
        description,
        scraped_at,
        updated_at,
        'partner_foster' as source,
        'vfv_cats' as from_table
      FROM vfv_cats 
      ORDER BY name ASC`,
    );
    return cats;
  } catch (error) {
    console.error("Error fetching partner foster cats from database:", error);
    return [];
  }
}

/**
 * Scrape all pages of VFV cats from Adopt-a-Pet and return an array of cat objects
 */
async function scrapeAllPages(browser) {
  const page = await browser.newPage();

  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  );

  console.log("⏳ Loading shelter page...");
  await page.goto(VFV_ADOPTAPET_URL, {
    waitUntil: "domcontentloaded",
    timeout: 90000,
  });

  // Wait for page to render
  console.log("⏳ Waiting for page to render...");
  await new Promise(resolve => setTimeout(resolve, 8000));

  // DEBUG: Take screenshot
  await page.screenshot({ path: 'debug-adoptapet.png', fullPage: true });
  console.log("📸 Screenshot saved to debug-adoptapet.png");

  // DEBUG: Log what's actually on the page
  const debugInfo = await page.evaluate(() => {
    const html = document.body.innerHTML.substring(0, 5000);
    const testIds = Array.from(document.querySelectorAll('[data-testid]')).map(el => el.getAttribute('data-testid'));
    const classes = Array.from(document.querySelectorAll('[class*="card"], [class*="Card"], [class*="pet"], [class*="Pet"]')).map(el => el.className).slice(0, 20);
    
    return {
      title: document.title,
      hasDataTestId: testIds.length > 0,
      testIds: testIds.slice(0, 10),
      cardClasses: classes,
      firstDivs: Array.from(document.querySelectorAll('div')).slice(0, 5).map(d => d.className)
    };
  });

  console.log("🔍 DEBUG INFO:");
  console.log("   Title:", debugInfo.title);
  console.log("   Has data-testid:", debugInfo.hasDataTestId);
  console.log("   Sample testIds:", debugInfo.testIds);
  console.log("   Card-like classes:", debugInfo.cardClasses.slice(0, 5));
  console.log("   First div classes:", debugInfo.firstDivs);

  const allCats = [];
  let pageIndex = 1;

  // Loop over pagination until no Next button
  while (true) {
    console.log(`🔍 Scraping page ${pageIndex}...`);

    // Try multiple selector strategies
    let cards = [];
    
    // Strategy 1: data-testid
    cards = await page.$$('[data-testid="pet-card"]');
    console.log(`   Selector [data-testid="pet-card"]: ${cards.length} cards`);
    
    if (cards.length === 0) {
      // Strategy 2: class="pet-card"
      cards = await page.$$('.pet-card');
      console.log(`   Selector .pet-card: ${cards.length} cards`);
    }
    
    if (cards.length === 0) {
      // Strategy 3: any div with 'card' in class
      cards = await page.$$('div[class*="Card"]');
      console.log(`   Selector div[class*="Card"]: ${cards.length} cards`);
    }

    if (cards.length === 0) {
      // Strategy 4: links to /pet/
      const petLinks = await page.$$('a[href*="/pet/"]');
      console.log(`   Found ${petLinks.length} pet links`);
      
      if (petLinks.length === 0) {
        console.log("❌ No pet cards or links found. Check debug-adoptapet.png");
        break;
      }
    }

    // Scroll to load lazy images
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await new Promise(resolve => setTimeout(resolve, 1500));

    const catsOnPage = await page.evaluate(() => {
      const results = [];

      // Find all links to pet pages
      const petLinks = document.querySelectorAll('a[href*="/pet/"]');
      
      petLinks.forEach((link) => {
        try {
          const url = link.href;
          if (!url) return;

          // Try to find parent card container
          let card = link.closest('[data-testid="pet-card"]') || 
                     link.closest('.pet-card') ||
                     link.closest('div[class*="Card"]') ||
                     link.closest('article') ||
                     link.parentElement;

          // Name - try multiple approaches
          const nameEl = card.querySelector('[data-testid="pet-card-name"]') ||
                        card.querySelector('h2, h3, .name, [class*="name"]') ||
                        link.querySelector('h2, h3, [class*="name"]');
          const name = nameEl?.textContent?.trim();
          if (!name) return;

          // Image
          const imgEl = card.querySelector('img') || link.querySelector('img');
          const image = imgEl?.src || imgEl?.getAttribute('data-src') || imgEl?.getAttribute('data-lazy-src');

          // Get all text from card
          const cardText = card?.textContent?.trim() || '';

          // Age
          let ageText = null;
          const ageCandidates = ['Kitten', 'Baby', 'Young', 'Adult', 'Senior'];
          for (const label of ageCandidates) {
            if (cardText.toLowerCase().includes(label.toLowerCase())) {
              ageText = label;
              break;
            }
          }

          // Sex
          let sex = 'unknown';
          if (cardText.toLowerCase().includes('female')) sex = 'female';
          else if (cardText.toLowerCase().includes('male')) sex = 'male';

          // Breed
          let breed = 'Domestic Shorthair';
          const breedMatch = cardText.split(',')[0]?.trim();
          if (breedMatch && breedMatch.length > 0 && breedMatch.length < 50) {
            breed = breedMatch;
          }

          // Description
          const description = `${name} is a ${ageText || ''} ${sex !== 'unknown' ? sex : ''} cat looking for a loving home!`.trim();

          // ID
          const idMatch = url.match(/\/pet\/(\d+)-/);
          const adoptapet_id = idMatch ? idMatch[1] : null;
          if (!adoptapet_id) return;

          // Avoid duplicates
          if (results.some(r => r.adoptapet_id === adoptapet_id)) return;

          results.push({
            adoptapet_id,
            name,
            age_text: ageText,
            breed,
            sex,
            main_image_url: image,
            adoptapet_url: url,
            description,
          });
        } catch (err) {
          console.error('Error parsing pet card:', err);
        }
      });

      return results;
    });

    console.log(`   ➕ Found ${catsOnPage.length} cats on page ${pageIndex}`);
    allCats.push(...catsOnPage);

    // Try to click "Next" in pagination
    const wentToNext = await page.evaluate(() => {
      const container = document.querySelector('[data-testid="pagination-container"]') ||
                       document.querySelector('[class*="pagination"]') ||
                       document.querySelector('.pagination');
      if (!container) return false;

      const nextBtn = container.querySelector('button[aria-label="Next"]') ||
                     container.querySelector('a[aria-label="Next"]') ||
                     container.querySelector('button:last-child') ||
                     container.querySelector('a:last-child');

      if (!nextBtn) return false;
      const disabled = nextBtn.getAttribute('disabled') !== null ||
                      nextBtn.getAttribute('aria-disabled') === 'true';
      if (disabled) return false;

      nextBtn.click();
      return true;
    });

    if (!wentToNext) {
      console.log("⏹ No more pages detected, stopping pagination loop");
      break;
    }

    pageIndex += 1;
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Safety: max 10 pages
    if (pageIndex > 10) {
      console.log("⚠️  Reached page limit (10), stopping");
      break;
    }
  }

  console.log(`📦 Total cats scraped across all pages: ${allCats.length}`);
  await page.close();
  return allCats;
}

/**
 * Scrape VFV cats and save to vfv_cats
 */
export async function scrapeAndSavePartnerFosterCats() {
  let browser;

  try {
    console.log("🤖 Scraping Voice for the Voiceless cats from Adopt-a-Pet...");
    console.log(`📍 URL: ${VFV_ADOPTAPET_URL}`);

    browser = await puppeteer.launch({
      headless: false, // DEBUG: Run with visible browser
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
      ],
    });

    const scrapedCats = await scrapeAllPages(browser);

    let added = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const cat of scrapedCats) {
      try {
        const age_years = mapAgeToYears(cat.age_text);

        const existing = await query(
          "SELECT id FROM vfv_cats WHERE adoptapet_id = ?",
          [cat.adoptapet_id],
        );

        if (existing.length > 0) {
          await query(
            `UPDATE vfv_cats SET 
              name = ?,
              age_text = ?,
              age_years = ?,
              breed = ?,
              sex = ?,
              main_image_url = ?,
              adoptapet_url = ?,
              description = ?,
              updated_at = NOW()
             WHERE id = ?`,
            [
              cat.name,
              cat.age_text,
              age_years,
              cat.breed,
              cat.sex,
              cat.main_image_url,
              cat.adoptapet_url,
              cat.description,
              existing[0].id,
            ],
          );
          updated++;
          console.log(`✏️  Updated: ${cat.name}`);
        } else {
          const inKelseysCare = await query(
            `SELECT id FROM cats 
             WHERE status = 'available' 
               AND deleted_at IS NULL
               AND adoptapet_url LIKE ?`,
            [`%${cat.adoptapet_id}%`],
          );

          if (inKelseysCare.length > 0) {
            console.log(`⏭️  Skipped (already in Kelsey's care): ${cat.name}`);
            skipped++;
            continue;
          }

          await query(
            `INSERT INTO vfv_cats (
              adoptapet_id,
              name,
              age_text,
              age_years,
              breed,
              sex,
              main_image_url,
              adoptapet_url,
              description
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              cat.adoptapet_id,
              cat.name,
              cat.age_text,
              age_years,
              cat.breed,
              cat.sex,
              cat.main_image_url,
              cat.adoptapet_url,
              cat.description,
            ],
          );
          added++;
          console.log(`➕ Added: ${cat.name}`);
        }
      } catch (err) {
        console.error(`❌ Error saving cat ${cat.name}:`, err);
        errors++;
      }
    }

    console.log("\n📊 Scraping Summary:");
    console.log(`   ➕ Added:   ${added}`);
    console.log(`   ✏️  Updated: ${updated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors:  ${errors}`);
    console.log(`   📦 Total scraped: ${scrapedCats.length}`);

    return {
      success: true,
      added,
      updated,
      skipped,
      errors,
      total: scrapedCats.length,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ Error scraping Adopt-a-Pet:", error);
    if (browser) {
      await browser.close();
    }
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Delete cats that are no longer on Adopt-a-Pet
 */
export async function cleanupOldPartnerFosterCats(daysOld = 7) {
  try {
    console.log(
      `🧹 Cleaning up partner foster cats not updated in ${daysOld} days...`,
    );
    const result = await query(
      "DELETE FROM vfv_cats WHERE updated_at < DATE_SUB(NOW(), INTERVAL ? DAY)",
      [daysOld],
    );
    const deleted = result.affectedRows || 0;
    console.log(`   🗑️  Deleted ${deleted} old cats`);

    return { success: true, deleted, daysOld };
  } catch (error) {
    console.error("❌ Error cleaning up old cats:", error);
    throw error;
  }
}

/**
 * Run full scrape: scrape new cats + cleanup old ones
 */
export async function runFullScrape() {
  try {
    console.log("🚀 Starting full scrape cycle...\n");
    const scrapeResult = await scrapeAndSavePartnerFosterCats();
    const cleanupResult = await cleanupOldPartnerFosterCats(7);

    console.log("\n✅ Full scrape completed successfully!");
    return {
      success: true,
      scrape: scrapeResult,
      cleanup: cleanupResult,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ Full scrape failed:", error);
    throw error;
  }
}
