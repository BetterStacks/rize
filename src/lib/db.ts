import { Pool, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import ws from 'ws'
import * as tables from '@/db/schema'

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

if (!connectionString || connectionString.trim() === '') {
  throw new Error('DATABASE_URL environment variable is not set or is empty.');
}

const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
});

const db = drizzle({ client: pool, schema: tables });
export default db
