import { Queue } from 'bullmq';
import { logger } from '../../core/logger.js';

const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379')
};

// Unified Queue Name
export const scraperQueue = new Queue('scraper_queue', { connection: REDIS_CONFIG });

export const QueueService = {
  /**
   * Adds a recurring scraping job for a target user.
   * Uses a custom job ID to easily identify duplicates.
   */
  addScrapeJob: async (target: string) => {
    const jobId = `scrape:${target}`;
    
    await scraperQueue.add('scrape', { target }, {
      jobId, 
      repeat: { every: 10 * 60 * 1000 } // Every 10 mins
    });
    
    logger.info({ target }, '⏰ Post Tracking Scheduled');
  },

  /**
   * Stops the scraping job for a specific target.
   */
  stopScrapeJob: async (target: string) => {
    const repeatableJobs = await scraperQueue.getRepeatableJobs();
    
    // Find and remove jobs for this target
    for (const job of repeatableJobs) {
      // Check if this job matches our target
      if (job.name === 'scrape' && job.id?.includes(target)) {
        await scraperQueue.removeRepeatableByKey(job.key);
        logger.info({ target, jobKey: job.key }, '🗑️ Removed repeatable job');
      }
    }

    // Also remove any pending jobs for this target
    const jobs = await scraperQueue.getJobs(['waiting', 'delayed', 'active']);
    for (const job of jobs) {
      if (job.name === 'scrape' && job.data.target === target) {
        await job.remove();
      }
    }

    logger.info({ target }, '🛑 Tracking Stopped');
  },
  
  clearJobs: async () => {
    await scraperQueue.drain();
    const repeatable = await scraperQueue.getRepeatableJobs();
    for (const job of repeatable) await scraperQueue.removeRepeatableByKey(job.key);
    logger.info('🛑 All Jobs Cleared');
  }
};
