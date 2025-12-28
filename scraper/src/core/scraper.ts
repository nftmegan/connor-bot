import { Page } from 'playwright';
import { BrowserEngine } from './browser.js';
import { db } from '../db.js';
import { posts, snapshots } from '../schema.js';
import { sql } from 'drizzle-orm';

export class ScraperService {
  private engine: BrowserEngine;

  constructor(private targetAccount: string) {
    this.engine = new BrowserEngine();
  }

  async scrape() {
    console.log(`🕵️ Starting surveillance on @${this.targetAccount}`);
    const page = await this.engine.launch();

    try {
      await page.goto(`https://x.com/${this.targetAccount}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);

      // Simple Login Check
      if (page.url().includes('login')) {
        console.warn('🔒 Login Wall Detected. If headless, this may fail.');
      }

      // Scroll & Scrape
      for (let i = 0; i < 3; i++) {
        await page.keyboard.press('j'); // Next tweet shortcut
        await page.waitForTimeout(2000);
        await this.processVisibleTweet(page);
      }

    } catch (e: any) {
      console.error('❌ Scrape Error:', e.message);
    } finally {
      await this.engine.close();
    }
  }

  private async processVisibleTweet(page: Page) {
    try {
      const data = await page.evaluate(() => {
        const article = document.querySelector('article[data-testid="tweet"]');
        if (!article) return null;

        const getText = (s: string) => article.querySelector(s)?.textContent || '';
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
          likes: getMetric('likes'),
          reposts: getMetric('reposts'),
          replies: getMetric('replies'),
          views: getText('a[href*="/analytics"]')
        };
      });

      if (data) await this.saveData(data);

    } catch (e) {}
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
      content: raw.content,
      author: this.targetAccount,
      views: parse(raw.views),
      likes: parse(raw.likes),
      reposts: parse(raw.reposts),
      replies: parse(raw.replies),
      updatedAt: new Date().toISOString() // Drizzle SQLite text date
    };

    // Upsert Post
    await db.insert(posts).values(clean)
      .onConflictDoUpdate({ target: posts.id, set: { ...clean, lastScraped: new Date().toISOString() } });

    // Snapshot
    await db.insert(snapshots).values({
      postId: clean.id,
      ...clean
    });

    console.log(`💾 Saved Post ${clean.id} | Likes: ${clean.likes}`);
  }
}
