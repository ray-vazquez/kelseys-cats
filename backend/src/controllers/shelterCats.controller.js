// backend/src/controllers/shelterCats.controller.js
// Controller for fetching all available cats (foster + shelter)

import { getVoiceShelterCats, clearCache, getCacheInfo } from '../services/petfinderService.js';
import { query } from '../lib/db.js';

/**
 * GET /api/cats/all-available
 * Returns merged list of foster cats + Voice shelter cats
 * Deduplicates by name automatically
 */
export async function getAllAvailableCats(req, res) {
  try {
    const { forceRefresh } = req.query;
    
    // 1. Get your foster cats from database
    const fosterCats = await query(
      `SELECT * FROM cats WHERE status = 'available' ORDER BY name ASC`
    );
    
    // 2. Get Voice shelter cats from Petfinder
    const shelterCats = await getVoiceShelterCats({ 
      forceRefresh: forceRefresh === 'true' 
    });
    
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
    const { forceRefresh } = req.query;
    
    const shelterCats = await getVoiceShelterCats({ 
      forceRefresh: forceRefresh === 'true' 
    });
    
    res.json({
      items: shelterCats,
      total: shelterCats.length,
      organization: 'Voice for the Voiceless',
      source: 'petfinder'
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
 * POST /api/cats/refresh-cache
 * Manually clear cache and force refresh
 */
export async function refreshCache(req, res) {
  try {
    clearCache();
    
    // Fetch fresh data
    const shelterCats = await getVoiceShelterCats({ forceRefresh: true });
    
    res.json({
      success: true,
      message: 'Cache refreshed',
      cats_fetched: shelterCats.length
    });
    
  } catch (error) {
    console.error('Error refreshing cache:', error);
    res.status(500).json({ 
      error: 'Failed to refresh cache',
      message: error.message 
    });
  }
}

/**
 * GET /api/cats/cache-info
 * Get cache status (for debugging)
 */
export async function getCacheStatus(req, res) {
  try {
    const info = getCacheInfo();
    res.json(info);
  } catch (error) {
    console.error('Error getting cache info:', error);
    res.status(500).json({ 
      error: 'Failed to get cache info',
      message: error.message 
    });
  }
}
