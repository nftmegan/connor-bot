import { Bot } from 'grammy';
import { config } from './config.js';
import { StoreService } from './services/store.service.js';

export const bot = new Bot(config.botToken);

bot.command('start', async (ctx) => {
  if (ctx.from?.id) {
    await StoreService.registerUser(ctx.from.id, ctx.from.username);
  }
  await ctx.reply('Welcome! You are now registered to receive updates.');
});

bot.on('message:text', async (ctx) => {
  await ctx.reply(`You said: ${ctx.message.text}`);
});