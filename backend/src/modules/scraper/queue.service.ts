import { Queue, Worker } from 'bullmq';
import { logger } from '../../core/logger.js';
import { ScraperService } from './scraper.service.js';

const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379')
};

export const scraperQueue = new Queue('x-scraper', { connection: REDIS_CONFIG });

const worker = new Worker('x-scraper', async (job) => {
  logger.info({ target: job.data.target }, '👷 Worker Started');
  const scraper = new ScraperService(job.data.target);
  await scraper.scrape();
}, { connection: REDIS_CONFIG });

export const QueueService = {
  addJob: async (target: string) => {
    await scraperQueue.add('scrape', { target }, {
      repeat: { every: 10 * 60 * 1000 } // Every 10 mins
    });
    logger.info({ target }, '⏰ Job Scheduled');
  },
  
  clearJobs: async () => {
    await scraperQueue.drain();
    const repeatable = await scraperQueue.getRepeatableJobs();
    for (const job of repeatable) await scraperQueue.removeRepeatableByKey(job.key);
    logger.info('🛑 Queue Cleared');
  }
};
