import { Worker } from 'bullmq';
import { ScraperService } from './core/scraper.js';
import { config } from './config.js';

console.log("🔋 Scraper Worker Initializing...");

const worker = new Worker('scraper_queue', async (job) => {
  console.log(`📥 Processing Job ${job.id}: ${job.name}`);
  
  // Logic to handle different job types if needed
  if (job.name === 'scrape_profile' || job.name === 'default') {
    const scraper = new ScraperService(job.data.target);
    await scraper.scrape();
  } else {
    console.warn(`⚠️ Unknown job type: ${job.name}`);
  }
}, { 
  connection: {
    host: config.REDIS_HOST,
    port: config.REDIS_PORT
  },
  concurrency: 1, // Run 1 browser at a time to save RAM
  settings: { backoff: { type: 'fixed', delay: 60000 } }
});

worker.on('ready', () => console.log(`✅ Connected to Redis at ${config.REDIS_HOST}:${config.REDIS_PORT}`));
worker.on('error', (err) => console.error("❌ Worker Error:", err));
worker.on('failed', (job, err) => console.error(`❌ Job ${job?.id} failed:`, err));
