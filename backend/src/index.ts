import express, { Express } from 'express';
import { Server } from 'http';
import { healthRouter } from './health.js';
import { bot } from './bot/bot.js';
import { config } from './core/config.js';
import { logger } from './core/logger.js';
import { PriceService } from './modules/crypto/price.service.js';
import { UsersService } from './modules/users/users.service.js';

class Application {
  private intervalId: NodeJS.Timeout | null = null;
  public expressApp: Express;
  private httpServer: Server | null = null;

  constructor() {
    this.expressApp = express();
    this.expressApp.use(express.json());
  }

  use(path: string, handler: any) {
    this.expressApp.use(path, handler);
  }

  async start() {
    logger.info('🤖 Starting Connor Bot System...');

    const count = await UsersService.getCount();
    logger.info({ userCount: count }, '📦 Database initialized');

    this.startJobs();

    // Start Express Server
    this.httpServer = this.expressApp.listen(config.PORT, () => {
      logger.info({ port: config.PORT }, '🌍 API Server started');
    });

    await bot.start({
      onStart: () => logger.info('✅ Telegram Bot Connected'),
    });
  }

  private startJobs() {
    logger.info('⏰ Job Scheduler: Started');
    this.broadcastJob();
    this.intervalId = setInterval(() => this.broadcastJob(), 60 * 1000);
  }

  private async broadcastJob() {
    const price = await PriceService.fetchSolanaPrice();
    if (!price) return;

    const users = await UsersService.getActiveIds();
    if (users.length === 0) return;

    logger.info({ price, targetCount: users.length }, '📢 Broadcasting Update');

    const message = `🚀 **Solana Update**\n\nPrice: **$${price}**`;
    
    await Promise.all(
      users.map(id => 
        bot.api.sendMessage(id, message, { parse_mode: 'Markdown' })
          .catch(e => logger.warn({ id, error: e.message }, 'Failed to send'))
      )
    );
  }

  stop() {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.httpServer) this.httpServer.close();
    bot.stop();
    logger.info('🛑 System Shutdown');
  }
}

const app = new Application();
app.use('/', healthRouter);
app.start().catch(err => {
  logger.fatal({ err }, 'Startup Failed');
  process.exit(1);
});

process.once('SIGINT', () => app.stop());
process.once('SIGTERM', () => app.stop());