import { drizzle } from 'drizzle-orm/node-postgres'; // Or your specific driver
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function run() {
  try {
    console.log('Running migrations...');
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations applied successfully!');
  } catch (error) {
    console.error('CRITICAL MIGRATION ERROR:', error); // This forces the hidden error to print
  } finally {
    await pool.end();
  }
}
run();
