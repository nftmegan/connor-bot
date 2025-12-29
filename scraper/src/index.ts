import { Worker } from 'bullmq';
import { ScraperService } from './core/scraper.js';

const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379')
};

const worker = new Worker('scraper_queue', async (job) => {
  if (!process.env.PROXY_URL) {
    throw new Error("Missing PROXY_URL: Scraper is on hold.");
  }
  const scraper = new ScraperService(job.data.target);
  await scraper.scrape();
}, { 
  connection: REDIS_CONFIG,
  settings: { backoff: { type: 'fixed', delay: 60000 } }
});

worker.waitUntilReady().then(() => console.log("✅ Connected to Redis"));
