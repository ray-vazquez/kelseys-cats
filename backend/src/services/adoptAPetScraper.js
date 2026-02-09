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
 * Classify species using strict guidelines
 * Returns: { species: "CAT" | "DOG" | "UNKNOWN", reasoning: string }
 */
function classifySpecies(petData) {
  const {
    name = '',
    breed = '',
    species = '',
    story = '',
    imageUrl = '',
    shelterInfo = '',
    pageText = ''
  } = petData;

  const reasons = [];

  // Normalize all text to lowercase for comparison
  const nameLower = name.toLowerCase();
  const breedLower = breed.toLowerCase();
  const speciesLower = species.toLowerCase();
  const storyLower = story.toLowerCase();
  const imageUrlLower = imageUrl.toLowerCase();
  const shelterLower = shelterInfo.toLowerCase();
  const pageLower = pageText.toLowerCase();

  // RULE A: Explicit species field
  const catSpeciesTerms = ['cat', 'kitten', 'feline'];
  const dogSpeciesTerms = ['dog', 'puppy', 'canine'];

  if (speciesLower) {
    if (catSpeciesTerms.some(term => speciesLower.includes(term))) {
      reasons.push(`Species field contains "${species}"`);
      return { species: 'CAT', reasoning: reasons.join('; ') };
    }
    if (dogSpeciesTerms.some(term => speciesLower.includes(term))) {
      reasons.push(`Species field contains "${species}"`);
      return { species: 'DOG', reasoning: reasons.join('; ') };
    }
  }

  // RULE B: Strong text signals in breed, story, name
  const catBreedTerms = [
    'domestic shorthair', 'domestic longhair', 'domestic medium',
    'tabby', 'calico', 'tortoiseshell', 'tuxedo',
    'siamese', 'maine coon', 'bengal', 'ragdoll', 'persian',
    'russian blue', 'british shorthair', 'sphynx', 'abyssinian'
  ];

  const dogBreedTerms = [
    'labrador', 'retriever', 'shepherd', 'bulldog', 'poodle',
    'beagle', 'terrier', 'chihuahua', 'pit bull', 'husky',
    'rottweiler', 'boxer', 'dachshund', 'corgi', 'pomeranian',
    'mastiff', 'collie', 'spaniel', 'schnauzer', 'great dane',
    'shepsky', 'cattle dog', 'hound mix', 'lab mix', 'shepherd mix'
  ];

  const catTextTerms = ['cat', 'kitten', 'feline'];
  const dogTextTerms = ['dog', 'puppy', 'canine'];

  // Check breed field
  let breedMatchesCat = catBreedTerms.some(term => breedLower.includes(term));
  let breedMatchesDog = dogBreedTerms.some(term => breedLower.includes(term));

  if (breedMatchesCat && !breedMatchesDog) {
    reasons.push(`Breed "${breed}" is a cat breed`);
    return { species: 'CAT', reasoning: reasons.join('; ') };
  }

  if (breedMatchesDog && !breedMatchesCat) {
    reasons.push(`Breed "${breed}" is a dog breed`);
    return { species: 'DOG', reasoning: reasons.join('; ') };
  }

  // Check story text for explicit species mentions
  const catPhrases = [
    'this cat', 'the cat', 'a cat', 'cat who', 'cat is', 'sweet cat',
    'this kitten', 'the kitten'
  ];
  const dogPhrases = [
    'this dog', 'the dog', 'a dog', 'dog who', 'dog is', 'sweet dog',
    'this puppy', 'the puppy', 'velcro dog', 'good dog'
  ];

  let storyMentionsCat = catPhrases.some(phrase => storyLower.includes(phrase));
  let storyMentionsDog = dogPhrases.some(phrase => storyLower.includes(phrase));

  if (storyMentionsCat && !storyMentionsDog) {
    reasons.push('Story explicitly refers to pet as "cat"');
    return { species: 'CAT', reasoning: reasons.join('; ') };
  }

  if (storyMentionsDog && !storyMentionsCat) {
    reasons.push('Story explicitly refers to pet as "dog"');
    return { species: 'DOG', reasoning: reasons.join('; ') };
  }

  // RULE C: Image URL cues
  if (imageUrlLower.includes('cat') || imageUrlLower.includes('kitten') || imageUrlLower.includes('nopetphoto_cat')) {
    reasons.push('Image URL contains cat-related keywords');
    return { species: 'CAT', reasoning: reasons.join('; ') };
  }

  if (imageUrlLower.includes('dog') || imageUrlLower.includes('puppy') || imageUrlLower.includes('nopetphoto_dog')) {
    reasons.push('Image URL contains dog-related keywords');
    return { species: 'DOG', reasoning: reasons.join('; ') };
  }

  // Check page text for general cat/dog mentions (weaker signal)
  const catMentions = (pageLower.match(/\bcat\b|\bkitten\b/g) || []).length;
  const dogMentions = (pageLower.match(/\bdog\b|\bpuppy\b/g) || []).length;

  if (catMentions > dogMentions && catMentions >= 3) {
    reasons.push(`Page text mentions "cat/kitten" ${catMentions} times vs "dog/puppy" ${dogMentions} times`);
    return { species: 'CAT', reasoning: reasons.join('; ') };
  }

  if (dogMentions > catMentions && dogMentions >= 3) {
    reasons.push(`Page text mentions "dog/puppy" ${dogMentions} times vs "cat/kitten" ${catMentions} times`);
    return { species: 'DOG', reasoning: reasons.join('; ') };
  }

  // RULE E: Ambiguity - cannot determine
  reasons.push('Insufficient evidence to classify species');
  return { species: 'UNKNOWN', reasoning: reasons.join('; ') };
}

/**
 * Scrape an individual pet page for detailed information
 */
async function scrapePetDetails(page, url, name) {
  try {
    console.log(`      🔍 Fetching details for ${name}...`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 2000));

    const details = await page.evaluate(() => {
      const result = {
        breed: null,
        age: null,
        sex: null,
        species: null,
        story: null,
        shelterInfo: null,
        pageText: document.body.textContent
      };

      // Find "My basic info" section
      const basicInfoSection = Array.from(document.querySelectorAll('*')).find(el => 
        el.textContent.includes('My basic info')
      );

      if (basicInfoSection) {
        const infoText = basicInfoSection.textContent;
        
        // Extract breed
        const breedMatch = infoText.match(/Breed[:\s]+([^\n]+)/i);
        if (breedMatch) result.breed = breedMatch[1].trim();

        // Extract age
        const ageMatch = infoText.match(/Age[:\s]+([^\n]+)/i);
        if (ageMatch) result.age = ageMatch[1].trim();

        // Extract sex
        const sexMatch = infoText.match(/Sex[:\s]+([^\n]+)/i);
        if (sexMatch) result.sex = sexMatch[1].trim().toLowerCase();
      }

      // Find "My story" section
      const storySection = Array.from(document.querySelectorAll('*')).find(el => 
        el.textContent.includes('My story') || el.textContent.includes("Here's what the humans")
      );

      if (storySection) {
        result.story = storySection.textContent.trim();
      }

      // Look for shelter/rescue organization info
      const shelterInfoEl = document.querySelector('[class*="shelter"]') ||
                           document.querySelector('[class*="rescue"]') ||
                           Array.from(document.querySelectorAll('*')).find(el => 
                             el.textContent.includes('Cared for by') ||
                             el.textContent.includes('Rescue') ||
                             el.textContent.includes('Shelter')
                           );

      if (shelterInfoEl) {
        result.shelterInfo = shelterInfoEl.textContent.trim();
      }

      // Look for explicit species field
      const speciesMatch = document.body.textContent.match(/Species[:\s]+(\w+)/i);
      if (speciesMatch) {
        result.species = speciesMatch[1];
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
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );
  await detailPage.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );

  console.log("⏳ Loading shelter page...");
  await listPage.goto(VFV_ADOPTAPET_URL, {
    waitUntil: "domcontentloaded",
    timeout: 90000,
  });

  console.log("⏳ Waiting for page to render...");
  await new Promise(resolve => setTimeout(resolve, 8000));

  const allCats = [];
  const filtered = {
    dogs: [],
    unknown: [],
    wrongShelter: []
  };
  let pageIndex = 1;

  while (true) {
    console.log(`\n🔍 Scraping page ${pageIndex}...`);

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

      // FILTER 1: Must be from Voice for the Voiceless
      if (details.shelterInfo) {
        const shelterLower = details.shelterInfo.toLowerCase();
        if (!shelterLower.includes('voice for the voiceless') && 
            (shelterLower.includes('cared for by') || 
             shelterLower.includes('rescue') || 
             shelterLower.includes('shelter'))) {
          console.log(`      🚫 Filtered ${pet.name} - Wrong shelter: ${details.shelterInfo.substring(0, 60)}...`);
          filtered.wrongShelter.push(pet.name);
          continue;
        }
      }

      // FILTER 2: Classify species
      const classification = classifySpecies({
        name: pet.name,
        breed: details.breed,
        species: details.species,
        story: details.story,
        imageUrl: pet.main_image_url,
        shelterInfo: details.shelterInfo,
        pageText: details.pageText
      });

      console.log(`      📊 ${pet.name}: ${JSON.stringify(classification)}`);

      if (classification.species === 'DOG') {
        console.log(`      🐕 Filtered ${pet.name} - Classified as dog`);
        filtered.dogs.push(pet.name);
        continue;
      }

      if (classification.species === 'UNKNOWN') {
        console.log(`      ❓ Filtered ${pet.name} - Cannot determine species`);
        filtered.unknown.push(pet.name);
        continue;
      }

      // It's a cat from VFV!
      console.log(`      ✅ ${pet.name} - Classified as CAT`);
      
      allCats.push({
        adoptapet_id: pet.adoptapet_id,
        name: pet.name,
        age_text: details.age,
        breed: details.breed || 'Domestic Shorthair',
        sex: details.sex || 'unknown',
        main_image_url: pet.main_image_url,
        adoptapet_url: pet.url,
        description: `${pet.name} is a ${details.age || ''} ${details.sex !== 'unknown' ? details.sex : ''} cat available for adoption through Voice for the Voiceless.`.trim(),
        classification_reasoning: classification.reasoning
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
      console.log("\n⏹ No more pages detected");
      break;
    }

    pageIndex += 1;
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    if (pageIndex > 10) {
      console.log("\n⚠️ Reached page limit (10)");
      break;
    }
  }

  console.log(`\n📦 Total cats scraped: ${allCats.length}`);
  console.log(`\n🚫 Filtered out:`);
  console.log(`   🐕 Dogs: ${filtered.dogs.length}${filtered.dogs.length > 0 ? ' - ' + filtered.dogs.join(', ') : ''}`);
  console.log(`   ❓ Unknown: ${filtered.unknown.length}${filtered.unknown.length > 0 ? ' - ' + filtered.unknown.join(', ') : ''}`);
  console.log(`   🏠 Wrong shelter: ${filtered.wrongShelter.length}${filtered.wrongShelter.length > 0 ? ' - ' + filtered.wrongShelter.join(', ') : ''}`);
  
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
 * Run full scrape: scrape cats + cleanup
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
