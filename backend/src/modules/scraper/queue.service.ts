import { Queue } from 'bullmq';
import { config } from '../../core/config.js';
import { logger } from '../../core/logger.js';

export const scraperQueue = new Queue('scraper_queue', {
  connection: {
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
  },
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 500,
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  },
});

scraperQueue.on('error', (err) => logger.error({ err }, '❌ Redis Queue Error'));
logger.info('🔌 Scraper Queue Connected');
