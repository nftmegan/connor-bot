import { scraperQueue } from './queue.service.js';
import { logger } from '../../core/logger.js';
import { db } from '../../core/db/index.js';
import { posts } from '../../core/db/schema.js';
import { eq, desc } from 'drizzle-orm';

export class ScraperService {
  constructor(private targetAccount: string) {}

  // DISPATCHER: Sends job to Redis
  async scrape() {
    const jobId = `scrape-${this.targetAccount}-${Date.now()}`;
    logger.info({ account: this.targetAccount, jobId }, '📤 Dispatching Scrape Job');

    try {
      await scraperQueue.add('scrape_profile', {
        target: this.targetAccount,
        initiatedAt: new Date().toISOString()
      }, { jobId });

      return { status: 'queued', jobId };
    } catch (error: any) {
      logger.error({ err: error.message }, '❌ Failed to dispatch job');
      throw error;
    }
  }

  // READER: Reads results from DB
  async getLatestPosts() {
    return db.select().from(posts)
      .where(eq(posts.author, this.targetAccount))
      .orderBy(desc(posts.createdAt))
      .limit(10);
  }
}
