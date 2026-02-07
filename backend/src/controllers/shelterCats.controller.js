// backend/src/controllers/shelterCats.controller.js
// Controller for fetching all available cats (foster + shelter)
// Uses database storage instead of in-memory cache (much faster!)

import { getVoiceCats, scrapeAndSaveVoiceCats, cleanupOldCats } from '../services/petfinderScraper.js';
import { query } from '../lib/db.js';

/**
 * GET /api/cats/all-available
 * Returns merged list of foster cats + Voice shelter cats
 * Deduplicates by name automatically
 */
export async function getAllAvailableCats(req, res) {
  try {
    // 1. Get your foster cats from database
    const fosterCats = await query(
      `SELECT * FROM cats WHERE status = 'available' ORDER BY name ASC`
    );
    
    // 2. Get Voice shelter cats from database (fast!)
    const shelterCats = await getVoiceCats();
    
    // 3. Deduplicate: Remove shelter cats that match foster cat names
    const fosterCatNames = new Set(
      fosterCats.map(cat => cat.name.toLowerCase().trim())
    );
    
    const uniqueShelterCats = shelterCats.filter(
      cat => !fosterCatNames.has(cat.name.toLowerCase().trim())
    );
    
    // 4. Format foster cats with source indicator
    const formattedFosterCats = fosterCats.map(cat => ({
      ...cat,
      source: 'foster',
      is_foster: true
    }));
    
    // 5. Return both lists separately (frontend can decide how to display)
    res.json({
      foster_cats: formattedFosterCats,
      shelter_cats: uniqueShelterCats,
      total: formattedFosterCats.length + uniqueShelterCats.length,
      duplicates_removed: shelterCats.length - uniqueShelterCats.length
    });
    
  } catch (error) {
    console.error('Error fetching all available cats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch cats',
      message: error.message 
    });
  }
}

/**
 * GET /api/cats/shelter
 * Returns only Voice shelter cats (no deduplication)
 */
export async function getShelterCatsOnly(req, res) {
  try {
    const shelterCats = await getVoiceCats();
    
    res.json({
      items: shelterCats,
      total: shelterCats.length,
      organization: 'Voice for the Voiceless',
      source: 'database'
    });
    
  } catch (error) {
    console.error('Error fetching shelter cats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch shelter cats',
      message: error.message 
    });
  }
}

/**
 * POST /api/cats/scrape-shelter
 * Manually scrape Petfinder and save to database
 * Admin only - use this to refresh shelter cat data
 */
export async function scrapeShelterCats(req, res) {
  try {
    console.log('Starting Petfinder scrape...');
    
    // Scrape and save to database
    const result = await scrapeAndSaveVoiceCats();
    
    // Clean up old cats (likely adopted)
    const cleanup = await cleanupOldCats();
    
    res.json({
      success: true,
      message: 'Shelter cats updated',
      scraping: result,
      cleanup: cleanup
    });
    
  } catch (error) {
    console.error('Error scraping shelter cats:', error);
    res.status(500).json({ 
      error: 'Failed to scrape shelter cats',
      message: error.message 
    });
  }
}

/**
 * GET /api/cats/shelter-info
 * Get info about shelter cats in database
 */
export async function getShelterInfo(req, res) {
  try {
    const counts = await query(
      `SELECT 
        COUNT(*) as total,
        MAX(updated_at) as last_updated,
        MIN(updated_at) as oldest_update
      FROM vfv_cats`
    );
    
    const info = counts[0] || { total: 0, last_updated: null, oldest_update: null };
    
    res.json({
      total_cats: info.total,
      last_updated: info.last_updated,
      oldest_update: info.oldest_update,
      needs_refresh: info.total === 0 || 
        (info.oldest_update && new Date() - new Date(info.oldest_update) > 7 * 24 * 60 * 60 * 1000)
    });
    
  } catch (error) {
    console.error('Error getting shelter info:', error);
    res.status(500).json({ 
      error: 'Failed to get shelter info',
      message: error.message 
    });
  }
}
