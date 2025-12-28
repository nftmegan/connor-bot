import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

export default defineConfig({
  // UPDATED: Point to the new "core" folder
  schema: './src/core/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'file:bot.db',
  },
});
