import { z } from 'zod';

// Node 24 Native Env loading used
const envSchema = z.object({
  BOT_TOKEN: z.string().min(1, "Bot Token is required"),
  DATABASE_URL: z.string().default("file:bot.db"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3000),
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().default(6379),
  // Centralized Proxy Config
  PROXY_URL: z.string().optional().describe("HTTP Proxy URL (http://user:pass@host:port)"),
});

const processEnv = envSchema.safeParse(process.env);

if (!processEnv.success) {
  console.error("❌ Invalid environment variables:", processEnv.error.format());
  process.exit(1);
}

export const config = processEnv.data;
