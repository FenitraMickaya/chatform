/**
 * Applies the database schema.
 *
 *   npm run db:migrate
 *
 * Creates the target database if it does not exist yet, then applies
 * db/schema.sql (idempotent).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set. Copy .env.example to .env.local first.');
  process.exit(1);
}
const DATABASE_URL: string = connectionString;

function targetDatabase(): string {
  try {
    const parsed = new URL(DATABASE_URL);
    const name = parsed.pathname.replace(/^\//, '');
    return name || 'formpulse';
  } catch {
    return 'formpulse';
  }
}

async function ensureDatabaseExists(): Promise<void> {
  const dbName = targetDatabase();
  const adminUrl = new URL(DATABASE_URL);
  adminUrl.pathname = '/postgres';

  const admin = new Client({ connectionString: adminUrl.toString() });
  await admin.connect();
  try {
    const existing = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (existing.rowCount === 0) {
      // Identifiers cannot be parameterised: the name comes from our own config.
      await admin.query(`CREATE DATABASE "${dbName.replace(/"/g, '""')}"`);
      console.log(`[migrate] Created database "${dbName}".`);
    } else {
      console.log(`[migrate] Database "${dbName}" already exists.`);
    }
  } finally {
    await admin.end();
  }
}

async function applySchema(): Promise<void> {
  const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf-8');

  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    await client.query(sql);
    console.log('[migrate] Schema applied.');
  } finally {
    await client.end();
  }
}

async function main() {
  await ensureDatabaseExists();
  await applySchema();
  console.log('[migrate] Done.');
}

main().catch((err) => {
  console.error('[migrate] Failed:', err.message);
  process.exit(1);
});
