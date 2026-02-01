import pg from 'pg';
import { logger } from './logger.js';

const { Pool } = pg;

export interface DbConfig {
  connectionString: string;
}

let pool: pg.Pool | null = null;

export async function initDb(config: DbConfig): Promise<pg.Pool> {
  if (pool) return pool;

  pool = new Pool({
    connectionString: config.connectionString,
  });

  pool.on('error', (err: Error) => {
    logger.error('Unexpected error on idle client', err);
  });

  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    logger.info('Database connected successfully');
  } catch (err) {
    logger.error('Database connection failed', err);
    throw err;
  }

  return pool;
}

export async function getDb(): Promise<pg.Pool> {
  if (!pool) {
    throw new Error('Database not initialized. Call initDb first.');
  }
  return pool;
}

export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('Database pool closed');
  }
}

export async function query(text: string, params?: unknown[]): Promise<pg.QueryResult> {
  const db = await getDb();
  return db.query(text, params);
}
