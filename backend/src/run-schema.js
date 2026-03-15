import dotenv from 'dotenv';
import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { Pool } = pkg;

async function runSchema() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  try {
    await pool.query(sql);
    console.log('Schema applied successfully. Tables: accounts, invoices, payments, vouchers.');
  } catch (err) {
    console.error('Schema error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSchema();
