import pg from 'pg';
import { faker } from '@faker-js/faker';
import { config } from '../config/env.js';
import type { UserRow, NoteRow } from '../fixtures/db-payloads/db-types.js';

const { Pool } = pg;

// Module-scoped singleton — one Pool per test worker process, lazily created.
let pool: pg.Pool | null = null;

function getPool(): pg.Pool {
  if (!pool) {
    if (!config.dbHost || !config.dbName) {
      throw new Error('DB config is missing. Ensure DB_HOST, DB_NAME, DB_USER, DB_PASSWORD are set in your .env file.');
    }
    pool = new Pool({
      host: config.dbHost,
      port: config.dbPort,
      database: config.dbName,
      user: config.dbUser,
      password: config.dbPassword,
    });
  }
  return pool;
}

/** Run a query expected to return zero or one row. Returns null if no rows. */
export async function queryOne<T extends pg.QueryResultRow>(sql: string, params?: unknown[]): Promise<T | null> {
  const result = await getPool().query<T>(sql, params);
  return result.rows[0] ?? null;
}

/** Run a query expected to return multiple rows. */
export async function queryMany<T extends pg.QueryResultRow>(sql: string, params?: unknown[]): Promise<T[]> {
  const result = await getPool().query<T>(sql, params);
  return result.rows;
}

/** Run a query and return the raw QueryResult (useful for COUNT, pg_sleep, etc.). */
export async function queryRaw(sql: string, params?: unknown[]): Promise<pg.QueryResult> {
  return getPool().query(sql, params);
}

/**
 * Truncate all tables and reset sequences.
 * Notes must be truncated before users due to the FK constraint,
 * but CASCADE handles it in one statement.
 */
export async function truncateAll(): Promise<void> {
  await getPool().query('TRUNCATE TABLE notes, users RESTART IDENTITY CASCADE');
}

/** Insert a user row directly via SQL and return the created row. */
export async function seedUser(overrides?: Partial<Omit<UserRow, 'id' | 'created_at' | 'updated_at'>>): Promise<UserRow> {
  const name = overrides?.name ?? faker.person.fullName();
  const email = overrides?.email ?? faker.internet.email().toLowerCase();
  const result = await getPool().query<UserRow>('INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *', [name, email]);
  return result.rows[0];
}

/** Insert a note row directly via SQL and return the created row. */
export async function seedNote(userId: string, overrides?: Partial<Omit<NoteRow, 'id' | 'created_at' | 'updated_at' | 'user_id'>>): Promise<NoteRow> {
  const noteCategories = ['Home', 'Work', 'Personal'] as const;
  const title = overrides?.title ?? faker.lorem.sentence({ min: 3, max: 5 });
  const description = overrides?.description ?? faker.lorem.paragraph();
  const category = overrides?.category ?? faker.helpers.arrayElement(noteCategories);
  const completed = overrides?.completed ?? false;
  const result = await getPool().query<NoteRow>('INSERT INTO notes (title, description, category, completed, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *', [
    title,
    description,
    category,
    completed,
    userId,
  ]);
  return result.rows[0];
}

/** Close the pool — call in afterAll or global teardown if needed. */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
