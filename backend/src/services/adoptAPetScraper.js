// backend/src/services/adoptAPetScraper.js
// Scrapes Voice for the Voiceless cats from Adopt-a-Pet
// Saves to vfv_cats database table for fast access

import puppeteer from "puppeteer";
import { query } from "../lib/db.js";

const VFV_ADOPTAPET_URL =
  "https://www.adoptapet.com/shelter/184939-voice-for-the-voiceless-schenectady-new-york";

/**
 * Extract Adopt-a-Pet ID from URL
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
 * Check if a breed name is a dog breed
 */
function isDogBreed(breed) {
  if (!breed) return false;
  const breedLower = breed.toLowerCase();
  
  const dogBreeds = [
    'shepsky', 'labrador', 'retriever', 'shepherd', 'terrier', 'beagle', 'poodle',
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
    'terrier mix', 'retriever mix', 'mixed breed dog', 'mixed dog',
    'cane corso', 'rhodesian', 'basenji', 'samoyed', 'whippet', 'greyhound',
    'american eskimo', 'chow chow', 'shar pei', 'german shepherd', 'husky mix'
  ];

  return dogBreeds.some(dogBreed => breedLower.includes(dogBreed));
}

/**
 * Parse size field to extract max weight in pounds
 * Examples: "Med. 26-60 lbs" → 60, "Small. 0-25 lbs" → 25
 */
function parseMaxWeightFromSize(sizeText) {
  if (!sizeText) return null;
  
  // Look for pattern like "26-60 lbs" or "0-25 lbs"
  const rangeMatch = sizeText.match(/(\d+)-(\d+)\s*(?:lbs|pounds)/i);
  if (rangeMatch) {
    return parseInt(rangeMatch[2], 10); // Return the max value
  }
  
  // Look for single value like "15 lbs"
  const singleMatch = sizeText.match(/(\d+)\s*(?:lbs|pounds)/i);
  if (singleMatch) {
    return parseInt(singleMatch[1], 10);
  }
  
  return null;
}

/**
 * Scrape an individual pet page to get detailed info
 */
async function scrapePetDetails(page, url, name) {
  try {
    console.log(`      🔍 Fetching details for ${name}...`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 2000));

    const details = await page.evaluate(() => {
      const result = {
        breed: null,
        weight: null,
        size: null,
        age: null,
        sex: null,
        species: null,
        story: null
      };

      // Get the full page text
      const pageText = document.body.textContent;
      const textLower = pageText.toLowerCase();

      // Find "My basic info" section
      const basicInfoSection = document.querySelector('[class*="BasicInfo"]') ||
                              document.querySelector('[class*="basic-info"]') ||
                              Array.from(document.querySelectorAll('*')).find(el => 
                                el.textContent.includes('My basic info')
                              );

      if (basicInfoSection) {
        const infoText = basicInfoSection.textContent;
        
        // Extract breed
        const breedMatch = infoText.match(/Breed[:\s]+([^\n]+)/i);
        if (breedMatch) {
          result.breed = breedMatch[1].trim();
        }

        // Extract size (which may contain weight range)
        const sizeMatch = infoText.match(/Size[:\s]+([^\n]+)/i);
        if (sizeMatch) {
          result.size = sizeMatch[1].trim();
        }

        // Extract weight
        const weightMatch = infoText.match(/Weight[:\s]+([^\n]+)/i);
        if (weightMatch && weightMatch[1].trim() !== '–' && weightMatch[1].trim() !== '-') {
          const weightText = weightMatch[1].trim();
          const weightNum = weightText.match(/(\d+)/);
          if (weightNum) {
            result.weight = parseInt(weightNum[1], 10);
          }
        }

        // Extract age
        const ageMatch = infoText.match(/Age[:\s]+([^\n]+)/i);
        if (ageMatch) {
          result.age = ageMatch[1].trim();
        }

        // Extract sex
        const sexMatch = infoText.match(/Sex[:\s]+([^\n]+)/i);
        if (sexMatch) {
          result.sex = sexMatch[1].trim().toLowerCase();
        }
      }

      // Find "My story" section - CRITICAL for species detection
      const storySection = document.querySelector('[class*="Story"]') ||
                          document.querySelector('[class*="story"]') ||
                          Array.from(document.querySelectorAll('*')).find(el => 
                            el.textContent.includes('My story') || 
                            el.textContent.includes("Here's what the humans")
                          );

      if (storySection) {
        result.story = storySection.textContent.trim();
      }

      // Look for explicit species mention anywhere on page
      if (textLower.includes('species:')) {
        const speciesMatch = pageText.match(/species[:\s]+(\w+)/i);
        if (speciesMatch) {
          result.species = speciesMatch[1].toLowerCase();
        }
      }

      return result;
    });

    return details;
  } catch (error) {
    console.error(`      ❌ Error fetching details for ${name}:`, error.message);
    return null;
  }
}

/**
 * Analyze pet details to determine if it's a dog (returns true if dog, false if cat)
 */
function isPetADog(details, name) {
  if (!details) return null; // Unknown

  const reasons = [];

  // CHECK 1: Explicit species field
  if (details.species === 'dog') {
    reasons.push('Species field says "dog"');
    return { isDog: true, reasons };
  }

  if (details.species === 'cat') {
    return { isDog: false, reasons: ['Species field says "cat"'] };
  }

  // CHECK 2: Story text mentions - MOST RELIABLE
  if (details.story) {
    const storyLower = details.story.toLowerCase();
    
    // Look for explicit dog mentions
    const dogPhrases = [
      'this dog', 'the dog', 'dogs you', 'puppy', 'puppies',
      'velcro dog', 'good dog', 'sweet dog', 'loyal dog',
      'dog who', 'dog is', 'dog was', 'dog will'
    ];
    
    const catPhrases = [
      'this cat', 'the cat', 'cats you', 'kitten', 'kittens',
      'good cat', 'sweet cat', 'cat who', 'cat is', 'cat was', 'cat will'
    ];

    const hasDogPhrase = dogPhrases.some(phrase => storyLower.includes(phrase));
    const hasCatPhrase = catPhrases.some(phrase => storyLower.includes(phrase));

    if (hasDogPhrase && !hasCatPhrase) {
      reasons.push('Story explicitly mentions "dog"');
      return { isDog: true, reasons };
    }

    if (hasCatPhrase && !hasDogPhrase) {
      return { isDog: false, reasons: ['Story explicitly mentions "cat"'] };
    }
  }

  // CHECK 3: Breed is a known dog breed
  if (details.breed && isDogBreed(details.breed)) {
    reasons.push(`Breed "${details.breed}" is a dog breed`);
    return { isDog: true, reasons };
  }

  // CHECK 4: Weight check
  if (details.weight && details.weight >= 30) {
    reasons.push(`Weight ${details.weight} lbs is too heavy for cat`);
    return { isDog: true, reasons };
  }

  // CHECK 5: Size field max weight
  if (details.size) {
    const maxWeight = parseMaxWeightFromSize(details.size);
    if (maxWeight && maxWeight >= 30) {
      reasons.push(`Size range "${details.size}" (max ${maxWeight} lbs) is too heavy for cat`);
      return { isDog: true, reasons };
    }
  }

  // If we found positive cat indicators, accept it
  const catBreeds = [
    'domestic shorthair', 'domestic longhair', 'domestic medium',
    'tabby', 'calico', 'tuxedo', 'siamese', 'persian', 'maine coon'
  ];
  
  if (details.breed) {
    const breedLower = details.breed.toLowerCase();
    if (catBreeds.some(catBreed => breedLower.includes(catBreed))) {
      return { isDog: false, reasons: [`Breed "${details.breed}" is a cat breed`] };
    }
  }

  // If weight/size is reasonable for cat
  if (details.weight && details.weight < 25) {
    return { isDog: false, reasons: [`Weight ${details.weight} lbs is typical for cat`] };
  }

  // If size range max is under 25 lbs
  if (details.size) {
    const maxWeight = parseMaxWeightFromSize(details.size);
    if (maxWeight && maxWeight < 25) {
      return { isDog: false, reasons: [`Size range max ${maxWeight} lbs is typical for cat`] };
    }
  }

  // Default: cannot determine
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
 * Scrape all pages of VFV cats from Adopt-a-Pet
 */
async function scrapeAllPages(browser) {
  const listPage = await browser.newPage();
  const detailPage = await browser.newPage();

  await listPage.setViewport({ width: 1920, height: 1080 });
  await listPage.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  );
  await detailPage.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  );

  console.log("⏳ Loading shelter page...");
  await listPage.goto(VFV_ADOPTAPET_URL, {
    waitUntil: "domcontentloaded",
    timeout: 90000,
  });

  console.log("⏳ Waiting for page to render...");
  await new Promise(resolve => setTimeout(resolve, 8000));

  const allCats = [];
  const skippedDogs = [];
  let pageIndex = 1;

  while (true) {
    console.log(`🔍 Scraping page ${pageIndex}...`);

    await listPage.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await new Promise(resolve => setTimeout(resolve, 2000));

    const petLinks = await listPage.evaluate(() => {
      const links = [];
      document.querySelectorAll('a[href*="/pet/"]').forEach(link => {
        const url = link.href;
        if (!url || !url.includes('/pet/')) return;

        let card = link.closest('[data-testid="pet-card"]') || 
                   link.closest('.pet-card') ||
                   link.closest('div[class*="Card"]') ||
                   link.closest('article') ||
                   link.parentElement;

        const nameEl = card.querySelector('[data-testid="pet-card-name"]') ||
                      card.querySelector('h2, h3, .name, [class*="name"]') ||
                      link.querySelector('h2, h3, [class*="name"]');
        const name = nameEl?.textContent?.trim();
        if (!name) return;

        const imgEl = card.querySelector('img') || link.querySelector('img');
        const image = imgEl?.src || imgEl?.getAttribute('data-src') || imgEl?.getAttribute('data-lazy-src');

        const idMatch = url.match(/\/pet\/(\d+)-/);
        const adoptapet_id = idMatch ? idMatch[1] : null;
        if (!adoptapet_id) return;

        if (links.some(l => l.adoptapet_id === adoptapet_id)) return;

        links.push({ url, name, adoptapet_id, main_image_url: image });
      });
      return links;
    });

    console.log(`   📋 Found ${petLinks.length} pets on page ${pageIndex}`);

    for (const pet of petLinks) {
      const details = await scrapePetDetails(detailPage, pet.url, pet.name);
      
      if (!details) {
        console.log(`      ⚠️ Skipping ${pet.name} - could not fetch details`);
        continue;
      }

      const analysis = isPetADog(details, pet.name);

      if (analysis === null) {
        console.log(`      ⚠️ Skipping ${pet.name} - cannot determine species`);
        continue;
      }

      if (analysis.isDog) {
        console.log(`      🐕 Filtered ${pet.name} - ${analysis.reasons.join('; ')}`);
        skippedDogs.push(pet.name);
        continue;
      }

      // It's a cat!
      console.log(`      ✅ ${pet.name} - ${analysis.reasons.join('; ')}`);
      
      allCats.push({
        adoptapet_id: pet.adoptapet_id,
        name: pet.name,
        age_text: details.age,
        breed: details.breed || 'Domestic Shorthair',
        sex: details.sex || 'unknown',
        main_image_url: pet.main_image_url,
        adoptapet_url: pet.url,
        description: `${pet.name} is a ${details.age || ''} ${details.sex !== 'unknown' ? details.sex : ''} cat available for adoption through Voice for the Voiceless.`.trim(),
      });
    }

    console.log(`   🐈 Total cats found: ${allCats.length}`);

    const wentToNext = await listPage.evaluate(() => {
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
      console.log("⏹ No more pages detected");
      break;
    }

    pageIndex += 1;
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    if (pageIndex > 10) {
      console.log("⚠️ Reached page limit (10)");
      break;
    }
  }

  console.log(`\n📦 Total cats scraped: ${allCats.length}`);
  if (skippedDogs.length > 0) {
    console.log(`🐕 Total dogs filtered: ${skippedDogs.length}`);
    console.log(`   Dogs: ${skippedDogs.join(', ')}`);
  }
  
  await listPage.close();
  await detailPage.close();
  return allCats;
}

/**
 * Scrape VFV cats and save to database
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
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Delete cats no longer on Adopt-a-Pet
 */
export async function cleanupOldPartnerFosterCats(daysOld = 7) {
  try {
    console.log(`🧹 Cleaning up partner foster cats not updated in ${daysOld} days...`);
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
