import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as tables from '@/db/schema'

const connectionString = process.env.DATABASE_URL;

if (!connectionString || connectionString.trim() === '') {
  throw new Error('DATABASE_URL environment variable is not set or is empty.');
}

const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

const db = drizzle(pool, { schema: tables });
export default db;
