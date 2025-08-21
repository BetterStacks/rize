// Drop entire database and recreate fresh
import { Pool } from 'pg'
import 'dotenv/config'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function dropDatabase() {
  try {
    console.log('🗑️  Dropping entire database...')
    console.log('⚠️  This will delete ALL data permanently!')
    
    // Drop all tables with CASCADE to handle foreign key dependencies
    await pool.query(`
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
    `)
    
    console.log('✅ Database completely cleared!')
    console.log('🎉 Ready for fresh migration - run: npx drizzle-kit push')
    console.log('')
    console.log('All tables will be created fresh.')
    
  } catch (error) {
    console.error('Error dropping database:', error)
  } finally {
    await pool.end()
  }
}

dropDatabase()
