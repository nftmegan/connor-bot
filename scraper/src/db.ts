import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema.js';

// Docker Volume Path is the source of truth
const url = process.env.DATABASE_URL || 'file:../backend/bot.db';

const client = createClient({ url });
export const db = drizzle(client, { schema });
