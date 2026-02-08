// backend/src/controllers/scraper.controller.js
// Admin-only endpoints for scraping Adopt-a-Pet

import { 
  scrapeAndSavePartnerFosterCats,
  cleanupOldPartnerFosterCats,
  runFullScrape
} from '../services/adoptAPetScraper.js';

/**
 * POST /api/admin/scrape/adoptapet
 * Scrape Adopt-a-Pet and save to vfv_cats table
 * Admin only
 */
export async function scrapeAdoptaPet(req, res, next) {
  try {
    console.log('🚀 Starting Adopt-a-Pet scrape...');
    
    const result = await scrapeAndSavePartnerFosterCats();
    
    res.json({
      success: true,
      message: 'Scraping completed successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in scrapeAdoptaPet controller:', error);
    next(error);
  }
}

/**
 * POST /api/admin/scrape/cleanup
 * Delete old partner foster cats (not updated in 7 days)
 * Admin only
 */
export async function cleanupOldCats(req, res, next) {
  try {
    const daysOld = parseInt(req.body?.daysOld || '7', 10);
    
    console.log(`🧹 Starting cleanup (${daysOld} days)...`);
    
    const result = await cleanupOldPartnerFosterCats(daysOld);
    
    res.json({
      success: true,
      message: `Cleanup completed: ${result.deleted} cats removed`,
      data: result
    });
  } catch (error) {
    console.error('Error in cleanupOldCats controller:', error);
    next(error);
  }
}

/**
 * POST /api/admin/scrape/full
 * Run full scrape cycle: scrape + cleanup
 * Admin only
 */
export async function runFullScrapeEndpoint(req, res, next) {
  try {
    console.log('🚀 Starting full scrape cycle...');
    
    const result = await runFullScrape();
    
    res.json({
      success: true,
      message: 'Full scrape cycle completed successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in runFullScrapeEndpoint controller:', error);
    next(error);
  }
}

/**
 * GET /api/admin/scrape/status
 * Get scraping status and last run info
 * Admin only
 */
export async function getScraperStatus(req, res, next) {
  try {
    const { query } = await import('../lib/db.js');
    
    // Get latest scraped cats
    const latestCats = await query(
      `SELECT 
        COUNT(*) as total_cats,
        MAX(scraped_at) as last_scraped,
        MAX(updated_at) as last_updated
      FROM vfv_cats`
    );
    
    // Get count of old cats (not updated in 7 days)
    const oldCats = await query(
      `SELECT COUNT(*) as count
       FROM vfv_cats 
       WHERE updated_at < DATE_SUB(NOW(), INTERVAL 7 DAY)`
    );
    
    res.json({
      success: true,
      data: {
        total_partner_cats: latestCats[0]?.total_cats || 0,
        last_scraped: latestCats[0]?.last_scraped,
        last_updated: latestCats[0]?.last_updated,
        old_cats_count: oldCats[0]?.count || 0,
        old_cats_threshold: 7 // days
      }
    });
  } catch (error) {
    console.error('Error in getScraperStatus controller:', error);
    next(error);
  }
}
