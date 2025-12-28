import { Page } from 'playwright';
import { BrowserEngine } from './browser.engine.js';
import { logger } from '../../core/logger.js';
import { db } from '../../core/db/index.js';
import { posts, snapshots } from '../../core/db/schema.js';
import { eq } from 'drizzle-orm';

export class ScraperService {
  private engine: BrowserEngine;

  constructor(private targetAccount: string) {
    this.engine = new BrowserEngine({ accountId: 'main_scraper' });
  }

  async scrape() {
    logger.info(`🕵️ Starting surveillance on @${this.targetAccount}`);
    const page = await this.engine.launch();

    try {
      await page.goto(`https://x.com/${this.targetAccount}`, { waitUntil: 'domcontentloaded' });
      
      // Basic login check
      if (page.url().includes('login')) {
        logger.warn('🔒 Login Wall detected. Manual intervention required?');
        // Simple logic: if headless, we might fail here. 
        // For production, you'd manage cookies better.
      }

      await page.waitForTimeout(3000);

      // Scroll and Scrape
      for (let i = 0; i < 3; i++) {
        await page.keyboard.press('j'); // Next post
        await page.waitForTimeout(2000);
        await this.processActivePost(page);
      }

    } catch (error: any) {
      logger.error({ err: error.message }, 'Scrape cycle failed');
    } finally {
      await this.engine.close();
    }
  }

  private async processActivePost(page: Page) {
    try {
      const data = await page.evaluate(() => {
        const article = document.querySelector('article[data-testid="tweet"]');
        if (!article) return null;

        const getText = (sel: string) => article.querySelector(sel)?.textContent || '';
        const getMetric = (label: string) => {
           const el = article.querySelector(`[aria-label*="${label}"]`);
           return el?.getAttribute('aria-label')?.split(' ')[0] || "0";
        };

        const link = article.querySelector('a[href*="/status/"]')?.getAttribute('href');
        const id = link?.split('/status/')[1];

        if (!id) return null;

        return {
          id,
          content: getText('[data-testid="tweetText"]'),
          replies: getMetric('replies'),
          reposts: getMetric('reposts'),
          likes: getMetric('likes'),
          views: getText('a[href*="/analytics"]'), 
        };
      });

      if (data) await this.saveData(data);

    } catch (e) { /* ignore DOM errors */ }
  }

  private async saveData(raw: any) {
    const parse = (str: string) => {
      if (!str) return 0;
      let n = parseFloat(str.replace(/,/g, ''));
      if (str.toUpperCase().includes('K')) n *= 1000;
      if (str.toUpperCase().includes('M')) n *= 1000000;
      return Math.floor(n);
    };

    const clean = {
      id: raw.id,
      content: raw.text,
      author: this.targetAccount,
      views: parse(raw.views),
      likes: parse(raw.likes),
      reposts: parse(raw.reposts),
      replies: parse(raw.replies),
      updatedAt: new Date().toISOString()
    };

    // Upsert Post
    await db.insert(posts).values(clean)
      .onConflictDoUpdate({ 
        target: posts.id, 
        set: { ...clean, lastScraped: new Date().toISOString() } 
      });

    // Add Snapshot
    await db.insert(snapshots).values({
      postId: clean.id,
      ...clean
    });

    logger.info({ id: clean.id, likes: clean.likes }, '💾 Post Saved');
  }
}
