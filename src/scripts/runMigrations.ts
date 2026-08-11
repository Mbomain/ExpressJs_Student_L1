import pool from '../configuration/database';
import fs from 'fs';
import path from 'path';

const runMigrations = async () => {
  try {
    const migrationsDir = path.join(__dirname, '../../migrations');
    const files = fs.readdirSync(migrationsDir).sort();

    for (const file of files) {
      if (file.endsWith('.sql')) {
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');

        console.log(`Running migration: ${file}`);
        await pool.query(sql);
        console.log(`Migration ${file} completed`);
      }
    }

    console.log('All migrations completed successfully');
    await pool.end();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
