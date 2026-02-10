// backend/src/controllers/scraper.controller.js
// Admin-only endpoints for scraping Adopt-a-Pet

import { 
  scrapeAndSavePartnerFosterCats,
  cleanupOldPartnerFosterCats,
  runFullScrape,
  stopScraper
} from '../services/adoptAPetScraper.js';
import { query } from '../lib/db.js';

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
 * GET /api/admin/scrape/stream
 * Server-Sent Events endpoint for real-time scraper logs
 * Admin only
 */
export async function streamScraperLogs(req, res) {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send log function
  const sendLog = (message, type = 'info') => {
    res.write(`data: ${JSON.stringify({ message, type, timestamp: new Date().toISOString() })}\n\n`);
  };

  try {
    sendLog('🚀 Starting full scrape cycle...', 'info');
    
    const result = await runFullScrape((log) => {
      // Log callback from scraper
      sendLog(log.message, log.type);
    });
    
    // Send final result
    sendLog('✅ Scrape completed successfully!', 'success');
    res.write(`data: ${JSON.stringify({ type: 'complete', result })}\n\n`);
  } catch (error) {
    sendLog(`❌ Error: ${error.message}`, 'error');
    res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
  } finally {
    res.end();
  }
}

/**
 * POST /api/admin/scrape/stop
 * Stop the currently running scraper
 * Admin only
 */
export async function stopScraperEndpoint(req, res, next) {
  try {
    console.log('🛑 Stop scraper requested...');
    
    const result = stopScraper();
    
    res.json({
      success: true,
      message: 'Scraper stop requested',
      data: result
    });
  } catch (error) {
    console.error('Error in stopScraperEndpoint controller:', error);
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
    // Get latest scraped cats
    const latestCats = await query(
      `SELECT 
        COUNT(*) as total_cats,
        MAX(scraped_at) as last_scraped,
        MAX(updated_at) as last_updated
      FROM vfv_cats`
    );
    
    // Get cats in Kelsey's care
    const kelseysCats = await query(
      `SELECT COUNT(*) as count
       FROM cats
       WHERE status = 'available' AND deleted_at IS NULL`
    );
    
    // Get count of old cats (not updated in 7 days)
    const oldCats = await query(
      `SELECT COUNT(*) as count
       FROM vfv_cats 
       WHERE updated_at < DATE_SUB(NOW(), INTERVAL 7 DAY)`
    );
    
    // Format last scrape time
    const lastScrapeTime = latestCats[0]?.last_updated 
      ? new Date(latestCats[0].last_updated).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
      : 'Never';
    
    res.json({
      success: true,
      totalPartnerCats: latestCats[0]?.total_cats || 0,
      catsInKelseysCare: kelseysCats[0]?.count || 0,
      lastScrapeTime: lastScrapeTime,
      oldCatsCount: oldCats[0]?.count || 0
    });
  } catch (error) {
    console.error('Error in getScraperStatus controller:', error);
    next(error);
  }
}
