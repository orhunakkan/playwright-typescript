import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { DatabaseSync } from 'node:sqlite';
import { z } from 'zod';
import { openDatabase } from '../../../src/db/database.ts';
import { migrate } from '../../../src/db/migrate.ts';
import { createRepositories, type Repositories } from '../../../src/db/repositories/index.ts';
import { parseEmailFile } from '../../../src/ingest/email-file.ts';
import type { IncomingEmail } from '../../../src/ingest/ingest-service.ts';

// PLAN.md §8.2: every test gets its own temporary SQLite file, deleted afterwards.

export interface TestDatabase {
  db: DatabaseSync;
  repos: Repositories;
  dir: string;
  path: string;
  close(): void;
}

export function createTestDatabase(options: { migrated?: boolean } = {}): TestDatabase {
  const dir = mkdtempSync(join(tmpdir(), 'jobboard-test-'));
  const path = join(dir, 'test.db');
  const db = openDatabase(path);
  if (options.migrated !== false) migrate(db);

  let repos: Repositories | undefined;
  return {
    db,
    // Created on first use: preparing statements needs the tables, which unmigrated tests don't have.
    get repos() {
      repos ??= createRepositories(db);
      return repos;
    },
    dir,
    path,
    close() {
      if (db.isOpen) db.close();
      rmSync(dir, { recursive: true, force: true });
    },
  };
}

const TABLES = ['runs', 'emails', 'jobs', 'sightings', 'status_history', 'profile'] as const;
type Table = (typeof TABLES)[number];
const CountRow = z.object({ n: z.number().int() });

export function countRows(db: DatabaseSync, table: Table): number {
  // `table` is one of the fixed names above, never user input.
  return CountRow.parse(db.prepare(`SELECT count(*) AS n FROM ${table}`).get()).n;
}

export function countAll(db: DatabaseSync): Record<Table, number> {
  return Object.fromEntries(TABLES.map((table) => [table, countRows(db, table)])) as Record<Table, number>;
}

// Every stored value of every table, for "this never reaches the database" checks.
export function dumpAll(db: DatabaseSync): string {
  return JSON.stringify(TABLES.map((table) => db.prepare(`SELECT * FROM ${table}`).all()));
}

export function fixtureEmail(name: string, gmailMessageId = `msg-${name}`): IncomingEmail {
  const email = parseEmailFile(readFileSync(new URL(`../../fixtures/emails/${name}`, import.meta.url), 'utf8'));
  return {
    gmailMessageId,
    receivedAt: email.date ?? '2026-10-23T00:00:00Z',
    sender: email.sender,
    subject: email.subject,
    plainText: email.plainText,
  };
}

// A clock that returns 2026-10-23T12:00:00.000Z, then one second later on each call.
export function fakeClock(start = '2026-10-23T12:00:00.000Z'): () => string {
  let time = Date.parse(start);
  return () => {
    const now = new Date(time).toISOString();
    time += 1000;
    return now;
  };
}
