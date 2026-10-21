/**
 * PostgreSQL connection pool.
 *
 * Works with any PostgreSQL provider (local, Supabase, Neon, RDS): only
 * DATABASE_URL has to be set. The pool is created lazily so that build
 * steps and unit tests never open a connection by accident.
 */

import { Pool, PoolClient, QueryResultRow } from 'pg';

const globalForPg = globalThis as unknown as { chatformPool?: Pool };

export function hasDatabaseConfig(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is not set. Copy .env.example to .env.local and point it at your PostgreSQL database.'
    );
  }
  return new Pool({
    connectionString,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    max: Number(process.env.DATABASE_POOL_MAX) || 10,
  });
}

export function getPool(): Pool {
  if (!globalForPg.chatformPool) {
    globalForPg.chatformPool = createPool();
  }
  return globalForPg.chatformPool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const result = await getPool().query<T>(text, params);
  return result.rows;
}

export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
