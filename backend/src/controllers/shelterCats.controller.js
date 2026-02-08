// backend/src/controllers/shelterCats.controller.js
// Controller for fetching all available cats (featured + partner fosters)
// Uses database view for unified querying with automatic deduplication

import { 
  getPartnerFosterCats, 
  scrapeAndSavePartnerFosterCats, 
  cleanupOldPartnerFosterCats 
} from '../services/adoptAPetScraper.js';
import { query } from '../lib/db.js';

/**
 * GET /api/cats/all-available
 * Returns merged list of featured foster cats + partner foster cats
 * Uses all_available_cats view for automatic deduplication
 */
export async function getAllAvailableCats(req, res) {
  try {
    // Query the unified view (handles deduplication automatically)
    const allCats = await query(
      `SELECT * FROM all_available_cats ORDER BY name ASC`
    );
    
    // Separate into featured vs partner for stats using 'source' field
    const featuredCats = allCats.filter(cat => cat.source === 'featured_foster');
    const partnerCats = allCats.filter(cat => cat.source === 'partner_foster');
    
    // Return structured response
    res.json({
      featured_foster_cats: featuredCats,
      partner_foster_cats: partnerCats,
      total: allCats.length,
      featured_count: featuredCats.length,
      partner_count: partnerCats.length
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
 * GET /api/cats/partner-fosters
 * Returns only partner foster cats (no featured fosters)
 */
export async function getPartnerFostersOnly(req, res) {
  try {
    const partnerCats = await getPartnerFosterCats();
    
    res.json({
      items: partnerCats,
      total: partnerCats.length,
      organization: 'Voice for the Voiceless',
      source: 'adoptapet_database'
    });
    
  } catch (error) {
    console.error('Error fetching partner foster cats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch partner foster cats',
      message: error.message 
    });
  }
}

/**
 * POST /api/cats/scrape-partner-fosters
 * Manually scrape Adopt-a-Pet and save to database
 * Admin only - use this to refresh partner foster cat data
 */
export async function scrapePartnerFosters(req, res) {
  try {
    console.log('Starting Adopt-a-Pet scrape...');
    
    // Scrape and save to database
    const result = await scrapeAndSavePartnerFosterCats();
    
    // Clean up old cats (likely adopted)
    const cleanup = await cleanupOldPartnerFosterCats();
    
    res.json({
      success: true,
      message: 'Partner foster cats updated from Adopt-a-Pet',
      scraping: result,
      cleanup: cleanup
    });
    
  } catch (error) {
    console.error('Error scraping partner foster cats:', error);
    res.status(500).json({ 
      error: 'Failed to scrape partner foster cats',
      message: error.message 
    });
  }
}

/**
 * GET /api/cats/partner-fosters-info
 * Get info about partner foster cats in database
 */
export async function getPartnerFostersInfo(req, res) {
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
      total_partner_fosters: info.total,
      last_updated: info.last_updated,
      oldest_update: info.oldest_update,
      needs_refresh: info.total === 0 || 
        (info.oldest_update && new Date() - new Date(info.oldest_update) > 7 * 24 * 60 * 60 * 1000)
    });
    
  } catch (error) {
    console.error('Error getting partner foster info:', error);
    res.status(500).json({ 
      error: 'Failed to get partner foster info',
      message: error.message 
    });
  }
}
