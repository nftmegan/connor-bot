import { chromium } from 'playwright-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import path from 'path';
import fs from 'fs';
import UserAgent from 'user-agents';

// Apply Stealth Plugin
chromium.use(stealthPlugin());

export class BrowserEngine {
  private browser: any = null;
  private context: any = null;
  private page: any = null;
  private userDataDir: string;

  constructor(private accountId: string = 'scraper_bot') {
    this.userDataDir = path.resolve(process.cwd(), 'sessions', accountId);
  }

  async launch(): Promise<any> {
    if (!fs.existsSync(this.userDataDir)) {
      fs.mkdirSync(this.userDataDir, { recursive: true });
    }

    const userAgent = new UserAgent({ deviceCategory: 'desktop' }).toString();

    console.log(`🚀 Launching Stealth Browser (${this.accountId})...`);

    // Launch Persistent Context with Stealth
    this.context = await chromium.launchPersistentContext(this.userDataDir, {
      channel: 'chromium',
      headless: process.env.HEADLESS !== 'false',
      viewport: null, // Allow window to size itself
      userAgent: userAgent,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--start-maximized',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certifcate-errors',
        '--ignore-certifcate-errors-spki-list',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
      ignoreDefaultArgs: ['--enable-automation'],
    });

    this.page = this.context.pages()[0] || await this.context.newPage();

    // Extra manual stealth patches just in case
    await this.page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      // @ts-ignore
      window.navigator.chrome = { runtime: {} };
    });

    return this.page;
  }

  async close() {
    if (this.context) await this.context.close();
  }
}
