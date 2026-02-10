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
  console.log('🛑 Stop requested - scraper will halt after current operation');
  return { success: true, message: 'Stop requested' };
}

// ... rest of the file stays the same ...
// (keeping existing code to avoid making file too long)
