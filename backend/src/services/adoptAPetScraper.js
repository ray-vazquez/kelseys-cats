// backend/src/services/adoptAPetScraper.js
// Scrapes Voice for the Voiceless cats from Adopt-a-Pet
// Saves to vfv_cats database table for fast access

import puppeteer from "puppeteer";
import { query } from "../lib/db.js";

const VFV_ADOPTAPET_URL =
  "https://www.adoptapet.com/shelter/184939-voice-for-the-voiceless-schenectady-new-york";

// Global stop flag
let shouldStop = false;

/**
 * Stop the scraper
 */
export function stopScraper() {
  shouldStop = true;
  console.log("🛑 Stop requested - scraper will halt after current operation");
  return { success: true, message: "Stop requested" };
}

/**
 * Extract Adopt-a-Pet ID from URL
 */
function extractAdoptaPetId(url) {
  if (!url) return null;
  const match = url.match(/\/pet\/(\d+)-/);
  return match ? match[1] : null;
}

/**
 * Maps age text from Adopt-a-Pet to numeric years.
 * Handles both categorical ages (Baby, Young, Adult, Senior) and numeric ages (1 year, 6 months).
 * 
 * @param {string} ageText - Raw age text from Adopt-a-Pet (e.g., "1 year", "Young", "6 months")
 * @returns {number|null} - Age in years (decimal), or null if unknown
 * 
 * Examples:
 * - "Baby" → 0.5
 * - "Young" → 2
 * - "1 year" → 1
 * - "6 months" → 0.5
 * - "18 months" → 1.5
 * - "2 years old" → 2
 * - "" → null
 * - "Unknown" → null
 */
function mapAgeToYears(ageText) {
  if (!ageText || ageText.trim() === '') return null;
  
  const normalized = ageText.toLowerCase().trim();
  
  // Handle explicit "unknown" cases
  if (normalized === 'unknown' || normalized === 'n/a') {
    return null;
  }
  
  // Try numeric parsing first
  // Pattern matches: "1 year", "6 months", "1 year 6 months", "2 years old"
  const yearMatch = normalized.match(/(\d+)\s*(?:year|yr|y)(?:s)?(?:\s+old)?/i);
  const monthMatch = normalized.match(/(\d+)\s*(?:month|mo|m)(?:s)?(?:\s+old)?/i);
  
  if (yearMatch || monthMatch) {
    let years = 0;
    
    if (yearMatch) {
      years += parseInt(yearMatch[1], 10);
    }
    
    if (monthMatch) {
      const months = parseInt(monthMatch[1], 10);
      years += months / 12;
    }
    
    // Round to 1 decimal place (e.g., 1.5 years, 0.5 years)
    return Math.round(years * 10) / 10;
  }
  
  // Fall back to category mapping (backward compatibility)
  if (normalized.includes('baby') || normalized.includes('kitten')) return 0.5;
  if (normalized.includes('young')) return 2;
  if (normalized.includes('adult')) return 5;
  if (normalized.includes('senior')) return 10;
  
  // If no match, return null
  return null;
}

/**
 * Classify species using strict guidelines
 */
function classifySpecies(petData) {
  const {
    name = "",
    breed = "",
    species = "",
    story = "",
    imageUrl = "",
    shelterInfo = "",
    pageText = "",
  } = petData;

  const reasons = [];

  const nameLower = (name || "").toLowerCase();
  const breedLower = (breed || "").toLowerCase();
  const speciesLower = (species || "").toLowerCase();
  const storyLower = (story || "").toLowerCase();
  const imageUrlLower = (imageUrl || "").toLowerCase();
  const shelterLower = (shelterInfo || "").toLowerCase();
  const pageLower = (pageText || "").toLowerCase();

  // RULE A: Explicit species field
  const catSpeciesTerms = ["cat", "kitten", "feline"];
  const dogSpeciesTerms = ["dog", "puppy", "canine"];

  if (speciesLower) {
    if (catSpeciesTerms.some((term) => speciesLower.includes(term))) {
      reasons.push(`Species field contains "${species}"`);
      return { species: "CAT", reasoning: reasons.join("; ") };
    }
    if (dogSpeciesTerms.some((term) => speciesLower.includes(term))) {
      reasons.push(`Species field contains "${species}"`);
      return { species: "DOG", reasoning: reasons.join("; ") };
    }
  }

  // RULE B: Breed field
  const catBreedTerms = [
    "domestic shorthair", "domestic longhair", "domestic medium",
    "tabby", "calico", "tortoiseshell", "tuxedo", "siamese",
    "maine coon", "bengal", "ragdoll", "persian", "russian blue",
    "british shorthair", "sphynx", "abyssinian",
  ];
  const dogBreedTerms = [
    "labrador", "retriever", "shepherd", "bulldog", "poodle",
    "beagle", "terrier", "chihuahua", "pit bull", "husky",
    "rottweiler", "boxer", "dachshund", "corgi", "pomeranian",
    "mastiff", "collie", "spaniel", "schnauzer", "great dane",
    "shepsky", "cattle dog", "hound mix", "lab mix", "shepherd mix",
  ];

  let breedMatchesCat = catBreedTerms.some((term) => breedLower.includes(term));
  let breedMatchesDog = dogBreedTerms.some((term) => breedLower.includes(term));

  if (breedMatchesCat && !breedMatchesDog) {
    reasons.push(`Breed "${breed}" is a cat breed`);
    return { species: "CAT", reasoning: reasons.join("; ") };
  }
  if (breedMatchesDog && !breedMatchesCat) {
    reasons.push(`Breed "${breed}" is a dog breed`);
    return { species: "DOG", reasoning: reasons.join("; ") };
  }

  // RULE C: Story text
  const catPhrases = ["this cat", "the cat", "a cat", "cat who", "cat is", "sweet cat", "this kitten", "the kitten"];
  const dogPhrases = ["this dog", "the dog", "a dog", "dog who", "dog is", "sweet dog", "this puppy", "the puppy", "velcro dog", "good dog"];

  let storyMentionsCat = catPhrases.some((phrase) => storyLower.includes(phrase));
  let storyMentionsDog = dogPhrases.some((phrase) => storyLower.includes(phrase));

  if (storyMentionsCat && !storyMentionsDog) {
    reasons.push('Story explicitly refers to pet as "cat"');
    return { species: "CAT", reasoning: reasons.join("; ") };
  }
  if (storyMentionsDog && !storyMentionsCat) {
    reasons.push('Story explicitly refers to pet as "dog"');
    return { species: "DOG", reasoning: reasons.join("; ") };
  }

  // RULE D: Image URL cues
  if (imageUrlLower.includes("cat") || imageUrlLower.includes("kitten") || imageUrlLower.includes("nopetphoto_cat")) {
    reasons.push("Image URL contains cat-related keywords");
    return { species: "CAT", reasoning: reasons.join("; ") };
  }
  if (imageUrlLower.includes("dog") || imageUrlLower.includes("puppy") || imageUrlLower.includes("nopetphoto_dog")) {
    reasons.push("Image URL contains dog-related keywords");
    return { species: "DOG", reasoning: reasons.join("; ") };
  }

  // RULE E: Page text frequency
  const catMentions = (pageLower.match(/\bcat\b|\bkitten\b/g) || []).length;
  const dogMentions = (pageLower.match(/\bdog\b|\bpuppy\b/g) || []).length;

  if (catMentions > dogMentions && catMentions >= 3) {
    reasons.push(`Page text mentions "cat/kitten" ${catMentions} times vs "dog/puppy" ${dogMentions} times`);
    return { species: "CAT", reasoning: reasons.join("; ") };
  }
  if (dogMentions > catMentions && dogMentions >= 3) {
    reasons.push(`Page text mentions "dog/puppy" ${dogMentions} times vs "cat/kitten" ${catMentions} times`);
    return { species: "DOG", reasoning: reasons.join("; ") };
  }

  reasons.push("Insufficient evidence to classify species");
  return { species: "UNKNOWN", reasoning: reasons.join("; ") };
}

/**
 * Scrape an individual pet page for detailed information.
 * Uses DOM-aware selectors targeting Adopt-a-Pet's .attribute-pair structure.
 */
async function scrapePetDetails(page, url, name) {
  try {
    console.log(`      🔍 Fetching details for ${name}...`);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const details = await page.evaluate(() => {
      const result = {
        // My basic info
        breed: null,
        color: null,
        age: null,
        sex: null,
        hair_length: null,
        // My details
        good_with_cats: null,
        good_with_dogs: null,
        good_with_kids: null,
        spayed_neutered: null,
        // My health
        shots_current: null,
        special_needs: null,
        // My story
        story: null,
        // For species classification
        species: null,
        shelterInfo: null,
        pageText: document.body.textContent || "",
      };

      // ── MY BASIC INFO ──
      // Each field is in a .attribute-pair div with .label and .content children
      const attributePairs = document.querySelectorAll(".attribute-pair");
      for (const pair of attributePairs) {
        const labelEl = pair.querySelector(".label");
        const contentEl = pair.querySelector(".content");
        if (!labelEl || !contentEl) continue;

        const label = labelEl.textContent.trim().toLowerCase();
        const value = contentEl.textContent.trim();

        // Skip empty or placeholder values
        if (!value || value === "–" || value === "-") continue;

        switch (label) {
          case "breed":
            result.breed = value;
            break;
          case "color":
            result.color = value;
            break;
          case "age":
            result.age = value;
            break;
          case "sex":
            result.sex = value.toLowerCase();
            break;
          case "hair length":
            result.hair_length = value.toLowerCase();
            break;
          case "species":
            result.species = value;
            break;
        }
      }

      // ── MY DETAILS & MY HEALTH ──
      // These are in .icon-list sections with <span> text inside flex items.
      // The SVG title tells us if it's a checkmark (positive) or X (negative).
      const iconItems = document.querySelectorAll(".icon-list .flex.items-center");
      for (const item of iconItems) {
        const spanEl = item.querySelector("span");
        if (!spanEl) continue;

        const text = spanEl.textContent.trim().toLowerCase();
        // Check if the icon is a positive checkmark (teal circle) vs negative
        const svgTitle = item.querySelector("svg title");
        const isPositive = svgTitle
          ? svgTitle.textContent.toLowerCase().includes("checkmark")
          : true; // Default to true if we can't determine

        if (text.includes("good with cats")) {
          result.good_with_cats = isPositive;
        } else if (text.includes("good with dogs")) {
          result.good_with_dogs = isPositive;
        } else if (text.includes("good with kids") || text.includes("good with children")) {
          result.good_with_kids = isPositive;
        } else if (text.includes("spayed") || text.includes("neutered")) {
          result.spayed_neutered = isPositive;
        } else if (text.includes("shots current") || text.includes("vaccinations")) {
          result.shots_current = isPositive;
        } else if (text.includes("special needs")) {
          result.special_needs = isPositive;
        }
      }

      // ── MY STORY ──
      // Story text is in a div after the "My story" h3, inside the same container
      const storyHeaders = document.querySelectorAll("h3");
      for (const h3 of storyHeaders) {
        if (h3.textContent.trim().toLowerCase().includes("my story")) {
          // The story text is in a sibling div with class containing break-words
          const container = h3.closest("div.container") || h3.parentElement;
          if (container) {
            const storyDiv = container.querySelector(".break-words");
            if (storyDiv) {
              const storyText = storyDiv.textContent.trim();
              // Only save if it's not the placeholder
              if (!storyText.toLowerCase().includes("this pet has no story")) {
                result.story = storyText;
              }
            }
          }
          break;
        }
      }

      // ── SHELTER INFO (for species classification) ──
      const shelterInfoEl =
        document.querySelector('[class*="shelter"]') ||
        document.querySelector('[class*="rescue"]') ||
        Array.from(document.querySelectorAll("*")).find(
          (el) =>
            el.textContent.includes("Cared for by") ||
            el.textContent.includes("Rescue") ||
            el.textContent.includes("Shelter"),
        );
      if (shelterInfoEl) {
        result.shelterInfo = shelterInfoEl.textContent.trim();
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
    const [cats] = await query(
      `SELECT 
        id, adoptapet_id, name, age_text, age_years,
        breed, color, hair_length, sex,
        good_with_cats, good_with_dogs, good_with_kids,
        spayed_neutered, shots_current, special_needs,
        main_image_url, adoptapet_url, description,
        scraped_at, updated_at,
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
  await new Promise((resolve) => setTimeout(resolve, 8000));

  const allCats = [];
  const filtered = {
    dogs: [],
    unknown: [],
    wrongShelter: [],
  };
  let pageIndex = 1;

  while (true) {
    if (shouldStop) {
      console.log("\n🛑 Stop requested - halting scraper");
      break;
    }

    console.log(`\n🔍 Scraping page ${pageIndex}...`);

    await listPage.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const petLinks = await listPage.evaluate(() => {
      const links = [];
      document.querySelectorAll('a[href*="/pet/"]').forEach((link) => {
        const url = link.href;
        if (!url || !url.includes("/pet/")) return;

        let card =
          link.closest('[data-testid="pet-card"]') ||
          link.closest(".pet-card") ||
          link.closest('div[class*="Card"]') ||
          link.closest("article") ||
          link.parentElement;

        const nameEl =
          card.querySelector('[data-testid="pet-card-name"]') ||
          card.querySelector('h2, h3, .name, [class*="name"]') ||
          link.querySelector('h2, h3, [class*="name"]');
        const name = nameEl?.textContent?.trim();
        if (!name) return;

        const imgEl = card.querySelector("img") || link.querySelector("img");
        const image =
          imgEl?.src ||
          imgEl?.getAttribute("data-src") ||
          imgEl?.getAttribute("data-lazy-src");

        const idMatch = url.match(/\/pet\/(\d+)-/);
        const adoptapet_id = idMatch ? idMatch[1] : null;
        if (!adoptapet_id) return;

        if (links.some((l) => l.adoptapet_id === adoptapet_id)) return;

        links.push({ url, name, adoptapet_id, main_image_url: image });
      });
      return links;
    });

    console.log(`   📋 Found ${petLinks.length} pets on page ${pageIndex}`);

    for (const pet of petLinks) {
      if (shouldStop) {
        console.log("\n🛑 Stop requested - halting scraper");
        break;
      }

      const details = await scrapePetDetails(detailPage, pet.url, pet.name);

      if (!details) {
        console.log(`      ⚠️ Skipping ${pet.name} - could not fetch details`);
        continue;
      }

      // FILTER 1: Must be from Voice for the Voiceless
      if (details.shelterInfo) {
        const shelterLower = details.shelterInfo.toLowerCase();
        if (
          !shelterLower.includes("voice for the voiceless") &&
          (shelterLower.includes("cared for by") ||
            shelterLower.includes("rescue") ||
            shelterLower.includes("shelter"))
        ) {
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
        pageText: details.pageText,
      });

      console.log(`      📊 ${pet.name}: ${JSON.stringify(classification)}`);

      if (classification.species === "DOG") {
        console.log(`      🐕 Filtered ${pet.name} - Classified as dog`);
        filtered.dogs.push(pet.name);
        continue;
      }

      if (classification.species === "UNKNOWN") {
        console.log(`      ❓ Filtered ${pet.name} - Cannot determine species`);
        filtered.unknown.push(pet.name);
        continue;
      }

      // It's a cat from VFV!
      console.log(`      ✅ ${pet.name} - CAT | breed=${details.breed} | color=${details.color} | age=${details.age} | sex=${details.sex}`);

      // Build description from story or generate one
      let description = details.story;
      if (!description) {
        const agePart = details.age ? `${details.age.toLowerCase()} ` : "";
        const sexPart = details.sex && details.sex !== "unknown" ? `${details.sex} ` : "";
        const breedPart = details.breed ? `${details.breed} ` : "";
        description = `${pet.name} is a ${agePart}${sexPart}${breedPart}cat available for adoption through Voice for the Voiceless.`.replace(/\s+/g, " ").trim();
      }

      allCats.push({
        adoptapet_id: pet.adoptapet_id,
        name: pet.name,
        age_text: details.age,
        breed: details.breed || "Domestic Shorthair",
        color: details.color,
        hair_length: details.hair_length,
        sex: details.sex || "unknown",
        good_with_cats: details.good_with_cats,
        good_with_dogs: details.good_with_dogs,
        good_with_kids: details.good_with_kids,
        spayed_neutered: details.spayed_neutered,
        shots_current: details.shots_current,
        special_needs: details.special_needs,
        main_image_url: pet.main_image_url,
        adoptapet_url: pet.url,
        description: description,
        classification_reasoning: classification.reasoning,
      });
    }

    if (shouldStop) break;

    console.log(`   🐈 Total cats found: ${allCats.length}`);

    const wentToNext = await listPage.evaluate(() => {
      const container =
        document.querySelector('[data-testid="pagination-container"]') ||
        document.querySelector('[class*="pagination"]') ||
        document.querySelector(".pagination");
      if (!container) return false;

      const nextBtn =
        container.querySelector('button[aria-label="Next"]') ||
        container.querySelector('a[aria-label="Next"]') ||
        Array.from(container.querySelectorAll("button, a")).find(
          (btn) =>
            btn.textContent.includes("›") ||
            btn.textContent.includes("Next") ||
            btn.getAttribute("aria-label")?.includes("Next"),
        );

      if (!nextBtn) return false;
      const disabled =
        nextBtn.getAttribute("disabled") !== null ||
        nextBtn.getAttribute("aria-disabled") === "true" ||
        nextBtn.classList.contains("disabled");
      if (disabled) return false;

      nextBtn.click();
      return true;
    });

    if (!wentToNext) {
      console.log("\n⏹ No more pages detected");
      break;
    }

    pageIndex += 1;
    await new Promise((resolve) => setTimeout(resolve, 3000));

    if (pageIndex > 10) {
      console.log("\n⚠️ Reached page limit (10)");
      break;
    }
  }

  console.log(`\n📦 Total cats scraped: ${allCats.length}`);
  console.log(`\n🚫 Filtered out:`);
  console.log(`   🐕 Dogs: ${filtered.dogs.length}${filtered.dogs.length > 0 ? " - " + filtered.dogs.join(", ") : ""}`);
  console.log(`   ❓ Unknown: ${filtered.unknown.length}${filtered.unknown.length > 0 ? " - " + filtered.unknown.join(", ") : ""}`);
  console.log(`   🏠 Wrong shelter: ${filtered.wrongShelter.length}${filtered.wrongShelter.length > 0 ? " - " + filtered.wrongShelter.join(", ") : ""}`);

  await listPage.close();
  await detailPage.close();
  return allCats;
}

/**
 * Scrape VFV cats and save to database
 */
export async function scrapeAndSavePartnerFosterCats() {
  let browser;
  shouldStop = false;

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

    try {
      await query("SELECT 1 as test");
      console.log("✅ Database connection OK");
      const [tableCheck] = await query("SELECT COUNT(*) as count FROM vfv_cats");
      console.log(`✅ vfv_cats table accessible, current count: ${tableCheck[0].count}`);
    } catch (testErr) {
      console.error("❌ Database connection test failed:", testErr);
      throw new Error("Database not accessible - aborting scrape");
    }

    for (const cat of scrapedCats) {
      if (shouldStop) {
        console.log("🛑 Stop requested - halting database save");
        break;
      }

      try {
        const age_years = mapAgeToYears(cat.age_text);

        const s = {
          adoptapet_id: cat.adoptapet_id ?? null,
          name: cat.name ?? null,
          age_text: cat.age_text ?? null,
          age_years: age_years ?? null,
          breed: cat.breed ?? null,
          color: cat.color ?? null,
          hair_length: cat.hair_length ?? null,
          sex: cat.sex ?? null,
          good_with_cats: cat.good_with_cats != null ? (cat.good_with_cats ? 1 : 0) : null,
          good_with_dogs: cat.good_with_dogs != null ? (cat.good_with_dogs ? 1 : 0) : null,
          good_with_kids: cat.good_with_kids != null ? (cat.good_with_kids ? 1 : 0) : null,
          spayed_neutered: cat.spayed_neutered != null ? (cat.spayed_neutered ? 1 : 0) : null,
          shots_current: cat.shots_current != null ? (cat.shots_current ? 1 : 0) : null,
          special_needs: cat.special_needs != null ? (cat.special_needs ? 1 : 0) : null,
          main_image_url: cat.main_image_url ?? null,
          adoptapet_url: cat.adoptapet_url ?? null,
          description: cat.description ?? null,
        };

        if (!s.adoptapet_id || !s.name) {
          console.log(`⚠️ Skipped ${cat.name || "unknown"} - missing required fields`);
          skipped++;
          continue;
        }

        const [existingRows] = await query(
          "SELECT id FROM vfv_cats WHERE adoptapet_id = ?",
          [s.adoptapet_id],
        );

        if (existingRows.length > 0) {
          await query(
            `UPDATE vfv_cats SET 
              name = ?, age_text = ?, age_years = ?,
              breed = ?, color = ?, hair_length = ?, sex = ?,
              good_with_cats = ?, good_with_dogs = ?, good_with_kids = ?,
              spayed_neutered = ?, shots_current = ?, special_needs = ?,
              main_image_url = ?, adoptapet_url = ?, description = ?,
              updated_at = NOW()
            WHERE id = ?`,
            [
              s.name, s.age_text, s.age_years,
              s.breed, s.color, s.hair_length, s.sex,
              s.good_with_cats, s.good_with_dogs, s.good_with_kids,
              s.spayed_neutered, s.shots_current, s.special_needs,
              s.main_image_url, s.adoptapet_url, s.description,
              existingRows[0].id,
            ],
          );
          updated++;
          console.log(`✏️  Updated: ${cat.name} (breed=${s.breed}, color=${s.color}, age=${s.age_text})`);
        } else {
          const [careRows] = await query(
            `SELECT id FROM cats 
             WHERE status = 'available' 
               AND deleted_at IS NULL
               AND adoptapet_url LIKE ?`,
            [`%${s.adoptapet_id}%`],
          );

          if (careRows.length > 0) {
            console.log(`⏭️  Skipped (already in Kelsey's care): ${cat.name}`);
            skipped++;
            continue;
          }

          await query(
            `INSERT INTO vfv_cats (
              adoptapet_id, name, age_text, age_years,
              breed, color, hair_length, sex,
              good_with_cats, good_with_dogs, good_with_kids,
              spayed_neutered, shots_current, special_needs,
              main_image_url, adoptapet_url, description
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              s.adoptapet_id, s.name, s.age_text, s.age_years,
              s.breed, s.color, s.hair_length, s.sex,
              s.good_with_cats, s.good_with_dogs, s.good_with_kids,
              s.spayed_neutered, s.shots_current, s.special_needs,
              s.main_image_url, s.adoptapet_url, s.description,
            ],
          );
          added++;
          console.log(`➕ Added: ${cat.name} (breed=${s.breed}, color=${s.color}, age=${s.age_text})`);
        }
      } catch (err) {
        console.error(`❌ Error saving cat ${cat.name}:`);
        console.error(`   Error message: ${err.message}`);
        console.error(`   Error code: ${err.code}`);
        console.error(`   SQL State: ${err.sqlState}`);
        errors++;
      }
    }

    const statusMsg = shouldStop ? "\n🛑 Scraping stopped by user" : "\n📊 Scraping Summary:";
    console.log(statusMsg);
    console.log(`   ➕ Added:   ${added}`);
    console.log(`   ✏️  Updated: ${updated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors:  ${errors}`);
    console.log(`   📦 Total scraped: ${scrapedCats.length}`);

    return {
      success: true,
      added, updated, skipped, errors,
      total: scrapedCats.length,
      stopped: shouldStop,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ Error scraping Adopt-a-Pet:", error);
    throw error;
  } finally {
    shouldStop = false;
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
    const [result] = await query(
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
