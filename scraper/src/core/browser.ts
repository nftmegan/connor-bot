import { chromium } from 'playwright-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import path from 'path';
import fs from 'fs';
import UserAgent from 'user-agents';
import { config } from '../config.js';

chromium.use(stealthPlugin());

export class BrowserEngine {
  private context: any = null;
  private userDataDir: string;

  constructor(private accountId: string = 'scraper_bot') {
    this.userDataDir = path.resolve(process.cwd(), 'sessions', accountId);
  }

  async launch(): Promise<any> {
    if (!fs.existsSync(this.userDataDir)) {
      fs.mkdirSync(this.userDataDir, { recursive: true });
    }
    
    // Mask password in logs
    const safeProxy = config.PROXY_URL.replace(/:[^:]*@/, ':****@');
    console.log(`🚀 Launching Browser (${this.accountId}) via ${safeProxy}`);

    this.context = await chromium.launchPersistentContext(this.userDataDir, {
      headless: config.HEADLESS,
      proxy: { server: config.PROXY_URL },
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080',
      ],
      viewport: { width: 1920, height: 1080 },
      userAgent: new UserAgent({ deviceCategory: 'desktop' }).toString(),
    });

    return this.context.pages()[0] || await this.context.newPage();
  }

  async close() {
    if (this.context) await this.context.close();
  }
}
