import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  BOT_TOKEN: z.string().min(1, "Bot Token is required"),
  DATABASE_URL: z.string().default("file:bot.db"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3000),
  // Add Redis configuration
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().default(6379),
});

const processEnv = envSchema.safeParse(process.env);

if (!processEnv.success) {
  console.error("❌ Invalid environment variables:", processEnv.error.format());
  process.exit(1);
}

export const config = processEnv.data;