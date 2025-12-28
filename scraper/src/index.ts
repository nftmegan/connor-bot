import { Worker } from 'bullmq';
import { ScraperService } from './core/scraper.js';

const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379')
};

console.log("👷 Scraper Worker Started. Waiting for jobs on 'scraper_queue'...");

const worker = new Worker('scraper_queue', async (job) => {
  console.log(`🚀 Processing Job: ${job.name} for @${job.data.target}`);
  
  try {
    const scraper = new ScraperService(job.data.target);
    await scraper.scrape();
    console.log("✅ Job Complete");
  } catch (error) {
    console.error("❌ Job Execution Error:", error);
    throw error;
  }
}, { connection: REDIS_CONFIG });

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  await worker.close();
  process.exit(0);
});
