import { eq, sql } from 'drizzle-orm';
import { db } from '../../core/db/index.js';
import { users } from '../../core/db/schema.js';
import { logger } from '../../core/logger.js';

export const UsersService = {
  register: async (telegramId: number, username?: string) => {
    try {
      await db.insert(users).values({
        telegramId,
        username,
      }).onConflictDoUpdate({
        target: users.telegramId,
        set: { username, isActive: true }
      });
      logger.info({ telegramId }, 'User registered/updated');
    } catch (error) {
      logger.error({ error, telegramId }, 'Failed to register user');
    }
  },

  getActiveIds: async () => {
    const results = await db.query.users.findMany({
      where: eq(users.isActive, true),
      columns: { telegramId: true }
    });
    return results.map(u => u.telegramId);
  },

  getCount: async () => {
    const [result] = await db.select({ count: sql`count(*)` }).from(users);
    return Number(result.count);
  }
};
