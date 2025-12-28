import { chromium, BrowserContext, Page } from 'playwright';
import path from 'path';
import fs from 'fs';
import { logger } from '../../core/logger.js';

interface BrowserConfig {
  accountId: string;
  headless?: boolean;
}

export class BrowserEngine {
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private userDataDir: string;

  constructor(private config: BrowserConfig) {
    this.userDataDir = path.resolve(process.cwd(), 'sessions', config.accountId);
  }

  async launch(): Promise<Page> {
    if (!fs.existsSync(this.userDataDir)) {
      fs.mkdirSync(this.userDataDir, { recursive: true });
    }

    logger.info({ account: this.config.accountId }, '🚀 Launching Browser Engine');

    this.context = await chromium.launchPersistentContext(this.userDataDir, {
      headless: this.config.headless ?? true,
      viewport: null,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--start-maximized',
        '--no-sandbox',
        '--disable-infobars',
        '--disable-setuid-sandbox'
      ],
    });

    this.page = this.context.pages()[0] || await this.context.newPage();

    // Stealth Patch
    await this.page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    return this.page;
  }

  async close() {
    if (this.context) await this.context.close();
  }
}
