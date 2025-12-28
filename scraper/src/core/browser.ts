import { chromium } from 'playwright-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import path from 'path';
import fs from 'fs';
import UserAgent from 'user-agents';

// Apply Stealth Plugin
chromium.use(stealthPlugin());

export class BrowserEngine {
  private context: any = null;
  private page: any = null;
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

      console.log(`🚀 Launching Stealth Browser (${this.accountId})...`);

      // Launch Persistent Context with Stealth - Using Chrome for Testing[citation:3]
      this.context = await chromium.launchPersistentContext(this.userDataDir, {
        channel: 'chrome',  // Using Chrome for Testing instead of Chromium
        headless: process.env.HEADLESS !== 'false',
        viewport: { width: 1920, height: 1080 },
        userAgent: userAgent,
        args: [
          '--disable-blink-features=AutomationControlled',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-infobars',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920,1080',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
          '--disable-site-isolation-trials',
        ],
        ignoreDefaultArgs: ['--enable-automation'],
        acceptDownloads: false,
        bypassCSP: true,
      });

      this.page = this.context.pages()[0] || await this.context.newPage();

      // Modern stealth patches
      await this.page.addInitScript(() => {
        // Remove webdriver property
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
        });

        // Override permissions
        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters) => (
          parameters.name === 'notifications' ?
            Promise.resolve({ state: Notification.permission }) :
            originalQuery(parameters)
        );

        // Mock plugins
        Object.defineProperty(navigator, 'plugins', {
          get: () => [1, 2, 3, 4, 5],
        });

        // Mock languages
        Object.defineProperty(navigator, 'languages', {
          get: () => ['en-US', 'en'],
        });

        // Mock chrome runtime
        if (!window.chrome) {
          // @ts-ignore
          window.chrome = {
            runtime: {},
          };
        }

        // Override console.debug to hide automation
        const originalDebug = console.debug;
        console.debug = function(...args) {
          if (args.some(arg => typeof arg === 'string' && 
              (arg.includes('automation') || arg.includes('WebDriver')))) {
            return;
          }
          return originalDebug.apply(console, args);
        };
      });

      // Set extra HTTP headers
      await this.page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      });

      // Set viewport
      await this.page.setViewportSize({ width: 1920, height: 1080 });

      return this.page;
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
