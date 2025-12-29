import { z } from 'zod';

const envSchema = z.object({
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().default(6379),
  HEADLESS: z.enum(['true', 'false']).default('true').transform((val) => val === 'true'),
  // Proxy is mandatory for the worker
  PROXY_URL: z.string().min(1, "PROXY_URL is required for Scraper Worker"),
});

const processEnv = envSchema.safeParse(process.env);
if (!processEnv.success) {
  console.error("❌ [Scraper] Invalid configuration:", processEnv.error.format());
  process.exit(1);
}
export const config = processEnv.data;
