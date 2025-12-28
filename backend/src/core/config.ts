import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  BOT_TOKEN: z.string().min(1, "Bot Token is required"),
  // Default to local relative path for dev; Docker overrides this via ENV
  DATABASE_URL: z.string().default("file:bot.db"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const processEnv = envSchema.safeParse(process.env);

if (!processEnv.success) {
  console.error("❌ Invalid environment variables:", processEnv.error.format());
  process.exit(1);
}

export const config = processEnv.data;
