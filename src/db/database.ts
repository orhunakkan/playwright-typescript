import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

// Opens the SQLite file at DB_PATH (PLAN.md Phase 3), creating its folder if needed.
export function openDatabase(path: string): DatabaseSync {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });

  const db = new DatabaseSync(path);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
  return db;
}

// Runs `work` in one transaction: commit on return, roll back on throw.
// Called while a transaction is already open, it joins that transaction instead of nesting.
export function transaction<T>(db: DatabaseSync, work: () => T): T {
  if (db.isTransaction) return work();

  db.exec('BEGIN IMMEDIATE');
  try {
    const result = work();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}
