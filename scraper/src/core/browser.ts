import { chromium } from 'playwright-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import path from 'path';
import fs from 'fs';
import UserAgent from 'user-agents';

// Apply Stealth Plugin
chromium.use(stealthPlugin());

export class BrowserEngine {
  private context: any = null;
  private userDataDir: string;

  constructor(private accountId: string = 'scraper_bot') {
    this.userDataDir = path.resolve(process.cwd(), 'sessions', accountId);
  }

  async launch(): Promise<any> {
    try {
      if (!fs.existsSync(this.userDataDir)) {
        fs.mkdirSync(this.userDataDir, { recursive: true });
      }

      const userAgent = new UserAgent({ deviceCategory: 'desktop' }).toString();
      const proxyUrl = process.env.PROXY_URL; 

      console.log(`🚀 Launching Stealth Browser (${this.accountId})...`);
      if (proxyUrl) {
         console.log(`🌐 Using Proxy: ${proxyUrl.replace(/:[^:]*@/, ':****@')}`);
      }

      this.context = await chromium.launchPersistentContext(this.userDataDir, {
        // Fix: Removed "channel: 'chrome'" to use the bundled Docker Chromium
        headless: process.env.HEADLESS !== 'false',
        viewport: { width: 1920, height: 1080 },
        userAgent: userAgent,
        proxy: proxyUrl ? { server: proxyUrl } : undefined,
        args: [
          '--disable-blink-features=AutomationControlled',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage', // Vital for Docker
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920,1080',
        ],
        ignoreDefaultArgs: ['--enable-automation'],
        acceptDownloads: false,
        bypassCSP: true,
      });

      const page = this.context.pages()[0] || await this.context.newPage();

      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Upgrade-Insecure-Requests': '1',
      });

      return page;
    } catch (error) {
      console.error('❌ Failed to launch browser:', error);
      throw error;
    }
  }

  async close() {
    try {
      if (this.context) await this.context.close();
    } catch (error) {
      console.error('❌ Error closing browser:', error);
    }
  }
}