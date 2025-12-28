import { Menu } from '@grammyjs/menu';
import { PriceService } from '../modules/crypto/price.service.js';
import { QueueService } from '../modules/queue/queue.producer.js';

export const mainMenu = new Menu('main-menu')
  .text('💰 SOL Price', async (ctx) => {
    const price = await PriceService.fetchSolanaPrice();
    await ctx.reply(price ? `💎 SOL: **$${price}**` : '⚠️ Error', { parse_mode: 'Markdown' });
  })
  .row()
  .text('🟢 Start Tracking @elonmusk', async (ctx) => {
    await QueueService.addScrapeJob('elonmusk');
    await ctx.reply('🕵️ Tracking started for **@elonmusk**.', { parse_mode: 'Markdown' });
  })
  .text('🔴 Stop Tracking', async (ctx) => {
    await QueueService.stopScrapeJob('elonmusk');
    await ctx.reply('🛑 Tracking stopped.');
  })
  .row()
  .text('ℹ️ Status', (ctx) => ctx.reply('✅ Bot & Scraper Online.'));
