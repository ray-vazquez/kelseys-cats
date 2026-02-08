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
  await new Promise(resolve => setTimeout(resolve, 5000));

  const allCats = [];
  let pageIndex = 1;

  // Loop over pagination until no Next button
  // We rely on data-testid="pagination-container" + a Next button
  while (true) {
    console.log(`🔍 Scraping page ${pageIndex}...`);

    // Ensure cards are loaded
    await page.waitForSelector(
      '[data-testid="pet-card"], .pet-card, [class*="PetCard"]',
      { timeout: 20000 },
    );

    // Scroll to load lazy images
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await new Promise(resolve => setTimeout(resolve, 1500));

    const catsOnPage = await page.evaluate(() => {
      const results = [];

      let cards = document.querySelectorAll('[data-testid="pet-card"]');
      if (cards.length === 0) {
        cards = document.querySelectorAll(".pet-card");
      }
      if (cards.length === 0) {
        cards = document.querySelectorAll('[class*="PetCard"]');
      }

      cards.forEach((card) => {
        try {
          // Link and URL
          const linkEl = card.querySelector('a[href*="/pet/"]');
          const url = linkEl?.href;
          if (!url) return;

          // Name
          const nameEl =
            card.querySelector('[data-testid="pet-card-name"]') ||
            card.querySelector(".pet-name, h2, h3, .name");
          const name = nameEl?.textContent?.trim();
          if (!name) return;

          // Image
          const imgEl = card.querySelector("img");
          const image =
            imgEl?.src ||
            imgEl?.getAttribute("data-src") ||
            imgEl?.getAttribute("data-lazy-src");

          // Details text (age / sex / breed often live together)
          const detailsEl =
            card.querySelector('[data-testid="pet-card-details"]') ||
            card.querySelector(".pet-info, .details, .breed-age");
          const detailsText = detailsEl?.textContent?.trim() || "";

          // Age text (keep raw label; map to years server-side)
          let ageText = null;
          const ageCandidates = ["Kitten", "Baby", "Young", "Adult", "Senior"];
          for (const label of ageCandidates) {
            if (detailsText.toLowerCase().includes(label.toLowerCase())) {
              ageText = label;
              break;
            }
          }

          // Sex
          let sex = "unknown";
          if (detailsText.toLowerCase().includes("female")) sex = "female";
          else if (detailsText.toLowerCase().includes("male")) sex = "male";

          // Breed – often appears as first part before comma or linebreak
          let breed = "Domestic Shorthair";
          const breedMatch = detailsText.split(",")[0]?.trim();
          if (breedMatch && breedMatch.length > 0) {
            breed = breedMatch;
          }

          // Description (short snippet if available)
          const descEl =
            card.querySelector('[data-testid="pet-card-description"]') ||
            card.querySelector(".description, .pet-description");
          const description =
            descEl?.textContent?.trim() ||
            `${name} is a ${ageText || ""} ${sex !== "unknown" ? sex : ""} cat looking for a loving home!`.trim();

          // Adopt-a-Pet ID
          const idMatch = url.match(/\/pet\/(\d+)-/);
          const adoptapet_id = idMatch ? idMatch[1] : null;
          if (!adoptapet_id) return;

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
          console.error("Error parsing pet card:", err);
        }
      });

      return results;
    });

    console.log(`   ➕ Found ${catsOnPage.length} cats on page ${pageIndex}`);
    allCats.push(...catsOnPage);

    // Try to click "Next" in pagination
    const wentToNext = await page.evaluate(() => {
      const container = document.querySelector(
        '[data-testid="pagination-container"]',
      );
      if (!container) return false;

      // Next button might be button or anchor
      const nextBtn =
        container.querySelector('button[aria-label="Next"]') ||
        container.querySelector('a[aria-label="Next"]');

      if (!nextBtn) return false;
      const disabled =
        nextBtn.getAttribute("disabled") !== null ||
        nextBtn.getAttribute("aria-disabled") === "true";
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

    for (const cat of scrapedCats) {
      try {
        const age_years = mapAgeToYears(cat.age_text);

        // Check if cat already exists by adoptapet_id
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
          // Skip if already in Kelsey's care
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
