// backend/src/routes/scraper.routes.js
// Admin routes for scraping operations

import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';
import {
  scrapeAdoptaPet,
  cleanupOldCats,
  runFullScrapeEndpoint,
  getScraperStatus
} from '../controllers/scraper.controller.js';

const router = express.Router();

// All scraper routes require admin authentication
router.use(requireAuth);
router.use(requireAdmin);

/**
 * @route   POST /api/admin/scrape/adoptapet
 * @desc    Scrape Adopt-a-Pet and save to database
 * @access  Admin only
 */
router.post('/adoptapet', scrapeAdoptaPet);

/**
 * @route   POST /api/admin/scrape/cleanup
 * @desc    Delete old partner foster cats
 * @access  Admin only
 * @body    { daysOld: number } (optional, default 7)
 */
router.post('/cleanup', cleanupOldCats);

/**
 * @route   POST /api/admin/scrape/full
 * @desc    Run full scrape cycle (scrape + cleanup)
 * @access  Admin only
 */
router.post('/full', runFullScrapeEndpoint);

/**
 * @route   GET /api/admin/scrape/status
 * @desc    Get scraping status and stats
 * @access  Admin only
 */
router.get('/status', getScraperStatus);

export default router;
