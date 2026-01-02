// Make sure to install the 'pg' package
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as tables from '@/db/schema'

const connectionString = process.env.DATABASE_URL;

if (!connectionString || connectionString.trim() === '') {
  console.error('❌ DATABASE_URL is not defined or empty!');
  console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('AUTH')));
  throw new Error(
    'DATABASE_URL environment variable is not set or is empty. ' +
    'Please add it to your .env.local file.'
  );
}

const pool = new Pool({
  connectionString,
})

const db = drizzle({ client: pool, schema: tables })
export default db
