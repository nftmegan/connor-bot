import { Bot, Context } from 'grammy';
import { config } from '../core/config.js';
import { logger } from '../core/logger.js';
import { UsersService } from '../modules/users/users.service.js';
import { mainMenu } from './menus.js';

// Define Custom Context if needed later
export type MyContext = Context;

export const bot = new Bot<MyContext>(config.BOT_TOKEN);

// 1. Install Plugins
bot.use(mainMenu);

// 2. Commands
bot.command('start', async (ctx) => {
  if (ctx.from?.id) {
    await UsersService.register(ctx.from.id, ctx.from.username);
  }
  await ctx.reply('🚀 **Welcome to Connor Bot!**\n\nYou are now subscribed to Solana updates.', {
    parse_mode: 'Markdown',
    reply_markup: mainMenu,
  });
});

// 3. Error Handling
bot.catch((err) => {
  logger.error({ err }, 'Global Bot Error');
});
