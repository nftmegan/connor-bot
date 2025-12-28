import { sqliteTable, int, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// --- TELEGRAM USERS ---
export const users = sqliteTable('users', {
  id: int('id').primaryKey({ autoIncrement: true }),
  telegramId: int('telegram_id').unique().notNull(),
  username: text('username'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  isActive: int('is_active', { mode: 'boolean' }).default(true),
});

// --- SCRAPED POSTS ---
export const posts = sqliteTable('posts', {
  id: text('id').primaryKey(), // The X Post ID
  content: text('content'),
  author: text('author').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  lastScraped: text('last_scraped'),
  
  // Metrics
  views: int('views').default(0),
  likes: int('likes').default(0),
  reposts: int('reposts').default(0),
  replies: int('replies').default(0),
});

// --- METRIC SNAPSHOTS (History) ---
export const snapshots = sqliteTable('snapshots', {
  id: int('id').primaryKey({ autoIncrement: true }),
  postId: text('post_id').references(() => posts.id, { onDelete: 'cascade' }),
  timestamp: text('timestamp').default(sql`CURRENT_TIMESTAMP`).notNull(),
  
  views: int('views'),
  likes: int('likes'),
  reposts: int('reposts'),
  replies: int('replies'),
});
