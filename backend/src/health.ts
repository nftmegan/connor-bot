import { Router } from 'express';
import { db } from './core/db/index.js';
import { logger } from './core/logger.js';

const router = Router();

router.get('/health', async (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    checks: {
      database: 'pending',
      redis: 'pending',
      memory: 'pending',
    },
  };

  try {
    // Check database
    await db.execute('SELECT 1');
    healthcheck.checks.database = 'healthy';
  } catch (error) {
    healthcheck.checks.database = 'unhealthy';
    logger.error({ error }, 'Database health check failed');
  }

  // Check memory
  const used = process.memoryUsage();
  healthcheck.checks.memory = {
    rss: `${Math.round(used.rss / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
    external: `${Math.round(used.external / 1024 / 1024)}MB`,
  };

  const allHealthy = Object.values(healthcheck.checks).every(
    check => check === 'healthy' || typeof check === 'object'
  );

  res.status(allHealthy ? 200 : 503).json(healthcheck);
});

router.get('/metrics', (req, res) => {
  const metrics = {
    nodejs: {
      version: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: process.memoryUsage(),
      uptime: process.uptime(),
    },
    system: {
      cpus: require('os').cpus().length,
      freemem: require('os').freemem(),
      totalmem: require('os').totalmem(),
      loadavg: require('os').loadavg(),
    },
  };

  res.json(metrics);
});

export { router as healthRouter };
