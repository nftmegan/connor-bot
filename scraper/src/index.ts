import { Worker } from 'bullmq';
import { ScraperService } from './core/scraper.js';

const checkProxy = () => {
  if (!process.env.PROXY_URL) {
    console.warn("⚠️  WARNING: PROXY_URL is missing.");
    console.warn("⏸️  Scraper is PAUSED. Waiting for configuration...");
    console.warn("👉  Add PROXY_URL to your docker-compose.yml or .env file and restart.");
    
    // Keep the process alive but idle (Paused)
    setInterval(() => {}, 60000); 
    return false;
  }
  return true;
};

// Start logic
if (checkProxy()) {
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
}