// backend/src/services/cronService.js
// Scheduled tasks for automated scraping

import cron from 'node-cron';
import { runFullScrape } from './adoptAPetScraper.js';

let isScrapingRunning = false;

/**
 * Run scraping job
 * Prevents overlapping runs
 */
async function runScrapingJob() {
  if (isScrapingRunning) {
    console.log('⏳ Scraping already in progress, skipping this run');
    return;
  }

  isScrapingRunning = true;
  
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🕒 Scheduled scrape starting at', new Date().toLocaleString());
    console.log('='.repeat(60) + '\n');
    
    const result = await runFullScrape();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Scheduled scrape completed successfully');
    console.log(`   ➕ Added: ${result.scrape.added}`);
    console.log(`   ✏️  Updated: ${result.scrape.updated}`);
    console.log(`   🗑️  Deleted: ${result.cleanup.deleted}`);
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ Scheduled scrape failed:', error.message);
    console.error('='.repeat(60) + '\n');
  } finally {
    isScrapingRunning = false;
  }
}

/**
 * Initialize cron jobs
 */
export function initCronJobs() {
  // Run full scrape daily at 3 AM
  // Cron format: second minute hour day month dayOfWeek
  const dailyScrapeJob = cron.schedule(
    '0 0 3 * * *', // Every day at 3:00 AM
    runScrapingJob,
    {
      scheduled: true,
      timezone: 'America/New_York' // EST/EDT
    }
  );
  
  console.log('✅ Cron jobs initialized:');
  console.log('   🕒 Daily scrape: Every day at 3:00 AM EST');
  console.log('   🐈 Partner foster cats will be auto-updated');
  
  // Optional: Run immediately on startup (comment out if not desired)
  // Useful for testing or ensuring fresh data on server restart
  if (process.env.SCRAPE_ON_STARTUP === 'true') {
    console.log('\n🚀 Running initial scrape on startup...');
    setTimeout(() => {
      runScrapingJob();
    }, 5000); // Wait 5 seconds after startup
  }
  
  return {
    dailyScrapeJob
  };
}

/**
 * Stop all cron jobs
 */
export function stopCronJobs() {
  cron.getTasks().forEach((task) => task.stop());
  console.log('⛔ All cron jobs stopped');
}
