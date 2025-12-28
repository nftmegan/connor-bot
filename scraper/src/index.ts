import { Worker } from 'bullmq';
import { ScraperService } from './core/scraper.js';

const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379')
};

console.log("👷 Scraper Worker Started. Waiting for jobs...");

const worker = new Worker('scraper_queue', async (job) => {
  console.log(`🚀 Processing Job: ${job.name} for @${job.data.target}`);
  const scraper = new ScraperService(job.data.target);
  await scraper.scrape();
  console.log("✅ Job Complete");
}, { connection: REDIS_CONFIG });

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});
