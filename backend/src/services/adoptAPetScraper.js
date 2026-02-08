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

  const allCats = [];
  const skippedDogs = [];
  let pageIndex = 1;

  // Loop over pagination until no Next button
  while (true) {
    console.log(`🔍 Scraping page ${pageIndex}...`);

    // Scroll to load lazy images
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await new Promise(resolve => setTimeout(resolve, 2000));

    const pageResults = await page.evaluate(() => {
      const results = [];
      const dogs = [];

      // Common dog breed keywords
      const dogBreeds = [
        'labrador', 'retriever', 'shepherd', 'terrier', 'beagle', 'poodle',
        'bulldog', 'husky', 'chihuahua', 'corgi', 'pitbull', 'pit bull',
        'rottweiler', 'boxer', 'dachshund', 'pomeranian', 'shih tzu',
        'doberman', 'mastiff', 'collie', 'pointer', 'spaniel', 'setter',
        'schnauzer', 'great dane', 'malamute', 'akita', 'aussie',
        'australian', 'border collie', 'cattle dog', 'hound', 'pug',
        'dalmatian', 'weimaraner', 'vizsla', 'newfoundland', 'saint bernard',
        'bernese', 'bichon', 'cocker', 'springer', 'yorkshire', 'maltese',
        'havanese', 'papillon', 'cavalier', 'boston terrier', 'french bulldog',
        'english bulldog', 'american bulldog', 'staffordshire', 'bull terrier',
        'american pit', 'pit mix', 'lab mix', 'shepherd mix', 'hound mix',
        'terrier mix', 'retriever mix', 'mixed breed dog', 'mixed dog'
      ];

      // Find all links to pet pages
      const petLinks = document.querySelectorAll('a[href*="/pet/"]');
      
      petLinks.forEach((link) => {
        try {
          const url = link.href;
          if (!url || !url.includes('/pet/')) return;

          // Try to find parent card container
          let card = link.closest('[data-testid="pet-card"]') || 
                     link.closest('.pet-card') ||
                     link.closest('div[class*="Card"]') ||
                     link.closest('article') ||
                     link.parentElement;

          // Check all data attributes for species info
          const cardHTML = card.outerHTML || '';
          const cardAttrs = Array.from(card.attributes || []).map(a => `${a.name}=${a.value}`).join(' ');

          // Name
          const nameEl = card.querySelector('[data-testid="pet-card-name"]') ||
                        card.querySelector('h2, h3, .name, [class*="name"]') ||
                        link.querySelector('h2, h3, [class*="name"]');
          const name = nameEl?.textContent?.trim();
          if (!name) return;

          // Get all text from card for analysis
          const cardText = card?.textContent?.trim() || '';
          const urlLower = url.toLowerCase();
          const nameLower = name.toLowerCase();
          const textLower = cardText.toLowerCase();
          const htmlLower = cardHTML.toLowerCase();
          const attrsLower = cardAttrs.toLowerCase();

          // STRICT FILTER: Check for dog indicators
          const hasDogInURL = urlLower.includes('-dog-') || 
                             urlLower.includes('/dog/') ||
                             urlLower.includes('species=dog') ||
                             urlLower.includes('type=dog');

          const hasDogInHTML = htmlLower.includes('species="dog"') ||
                              htmlLower.includes('species=dog') ||
                              htmlLower.includes('data-species="dog"') ||
                              htmlLower.includes('pettype="dog"') ||
                              htmlLower.includes('data-type="dog"');

          const hasDogInAttrs = attrsLower.includes('dog');

          // Check for dog breed keywords
          const hasDogBreed = dogBreeds.some(breed => 
            textLower.includes(breed) || nameLower.includes(breed)
          );

          // Check for explicit species mentions
          const hasSpeciesText = textLower.includes('species:') ||
                                textLower.includes('animal type:') ||
                                textLower.includes('pet type:');

          let speciesIsDog = false;
          if (hasSpeciesText) {
            // Extract species from text like "Species: Dog" or "Animal Type: Dog"
            const speciesMatch = textLower.match(/(?:species|animal type|pet type)\s*:?\s*(\w+)/);
            if (speciesMatch && speciesMatch[1] === 'dog') {
              speciesIsDog = true;
            }
          }

          // If ANY dog indicator is found, skip it
          if (hasDogInURL || hasDogInHTML || hasDogInAttrs || hasDogBreed || speciesIsDog) {
            dogs.push(name);
            return;
          }

          // POSITIVE FILTER: Must have cat indicators
          const hasCatInURL = urlLower.includes('-cat-') || 
                             urlLower.includes('/cat/') ||
                             urlLower.includes('species=cat') ||
                             urlLower.includes('type=cat');

          const hasCatInHTML = htmlLower.includes('species="cat"') ||
                              htmlLower.includes('species=cat') ||
                              htmlLower.includes('data-species="cat"') ||
                              htmlLower.includes('pettype="cat"') ||
                              htmlLower.includes('data-type="cat"');

          const catBreeds = [
            'domestic shorthair', 'domestic longhair', 'domestic medium',
            'tabby', 'calico', 'tuxedo', 'siamese', 'persian', 'maine coon',
            'ragdoll', 'bengal', 'russian blue', 'british shorthair',
            'scottish fold', 'sphynx', 'abyssinian', 'oriental', 'burmese',
            'tonkinese', 'birman', 'himalayan', 'exotic shorthair', 'manx',
            'devon rex', 'cornish rex', 'american shorthair', 'norwegian forest',
            'kitten', 'cat mix', 'mixed breed cat'
          ];

          const hasCatBreed = catBreeds.some(breed => textLower.includes(breed));

          let speciesIsCat = false;
          if (hasSpeciesText) {
            const speciesMatch = textLower.match(/(?:species|animal type|pet type)\s*:?\s*(\w+)/);
            if (speciesMatch && speciesMatch[1] === 'cat') {
              speciesIsCat = true;
            }
          }

          // Must have at least ONE cat indicator
          const isCat = hasCatInURL || hasCatInHTML || hasCatBreed || speciesIsCat || textLower.includes('cat');

          if (!isCat) {
            console.log(`⚠️ Skipping ${name} - no cat indicators found`);
            return;
          }

          // Image
          const imgEl = card.querySelector('img') || link.querySelector('img');
          const image = imgEl?.src || imgEl?.getAttribute('data-src') || imgEl?.getAttribute('data-lazy-src');

          // Age
          let ageText = null;
          const ageCandidates = ['Kitten', 'Baby', 'Young', 'Adult', 'Senior'];
          for (const label of ageCandidates) {
            if (textLower.includes(label.toLowerCase())) {
              ageText = label;
              break;
            }
          }

          // Sex
          let sex = 'unknown';
          if (textLower.includes('female')) sex = 'female';
          else if (textLower.includes('male')) sex = 'male';

          // Breed - look for cat breeds
          let breed = 'Domestic Shorthair';
          if (textLower.includes('domestic shorthair')) breed = 'Domestic Shorthair';
          else if (textLower.includes('domestic longhair')) breed = 'Domestic Longhair';
          else if (textLower.includes('domestic medium')) breed = 'Domestic Medium Hair';
          else if (textLower.includes('tabby')) breed = 'Tabby';
          else if (textLower.includes('siamese')) breed = 'Siamese';
          else if (textLower.includes('maine coon')) breed = 'Maine Coon';
          else if (textLower.includes('persian')) breed = 'Persian';
          else if (textLower.includes('ragdoll')) breed = 'Ragdoll';
          else if (textLower.includes('bengal')) breed = 'Bengal';
          else if (textLower.includes('calico')) breed = 'Calico';
          else if (textLower.includes('tuxedo')) breed = 'Tuxedo';

          // Description
          const description = `${name} is a ${ageText || ''} ${sex !== 'unknown' ? sex : ''} cat available for adoption through Voice for the Voiceless.`.trim();

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

      return { cats: results, dogs };
    });

    const catsOnPage = pageResults.cats;
    const dogsOnPage = pageResults.dogs;

    console.log(`   🐈 Found ${catsOnPage.length} cats on page ${pageIndex}`);
    if (dogsOnPage.length > 0) {
      console.log(`   🐕 Filtered out ${dogsOnPage.length} dogs: ${dogsOnPage.join(', ')}`);
      skippedDogs.push(...dogsOnPage);
    }
    
    allCats.push(...catsOnPage);

    // Try to click "Next" in pagination
    const wentToNext = await page.evaluate(() => {
      const container = document.querySelector('[data-testid="pagination-container"]') ||
                       document.querySelector('[class*="pagination"]') ||
                       document.querySelector('.pagination');
      if (!container) return false;

      const nextBtn = container.querySelector('button[aria-label="Next"]') ||
                     container.querySelector('a[aria-label="Next"]') ||
                     Array.from(container.querySelectorAll('button, a')).find(btn => 
                       btn.textContent.includes('›') || 
                       btn.textContent.includes('Next') ||
                       btn.getAttribute('aria-label')?.includes('Next')
                     );

      if (!nextBtn) return false;
      const disabled = nextBtn.getAttribute('disabled') !== null ||
                      nextBtn.getAttribute('aria-disabled') === 'true' ||
                      nextBtn.classList.contains('disabled');
      if (disabled) return false;

      nextBtn.click();
      return true;
    });

    if (!wentToNext) {
      console.log("⏹ No more pages detected, stopping pagination loop");
      break;
    }

    pageIndex += 1;
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Safety: max 10 pages
    if (pageIndex > 10) {
      console.log("⚠️  Reached page limit (10), stopping");
      break;
    }
  }

  console.log(`\n📦 Total cats scraped across all pages: ${allCats.length}`);
  if (skippedDogs.length > 0) {
    console.log(`🐕 Total dogs filtered out: ${skippedDogs.length}`);
  }
  
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
      headless: "new",
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

    console.log(`\n💾 Saving ${scrapedCats.length} cats to database...`);

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
