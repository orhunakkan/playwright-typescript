import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { appliedVersions, loadMigrations, migrate, MigrationError } from '../../../src/db/migrate.ts';
import { createTestDatabase, type TestDatabase } from '../helpers/test-database.ts';

const EXPECTED_TABLES = ['emails', 'jobs', 'profile', 'runs', 'schema_migrations', 'sightings', 'status_history'];
const EXPECTED_INDEXES = [
  'idx_emails_received',
  'idx_jobs_first_run',
  'idx_jobs_first_seen',
  'idx_jobs_status_score',
  'idx_status_history_job',
];

describe('migrate', () => {
  let test: TestDatabase;
  afterEach(() => {
    test.close();
  });

  function names(type: 'table' | 'index'): string[] {
    return test.db
      .prepare("SELECT name FROM sqlite_master WHERE type = ? AND name NOT LIKE 'sqlite_%' ORDER BY name")
      .all(type)
      .map((row) => String(row['name']));
  }

  function migrationsDir(files: Record<string, string>): URL {
    const dir = join(test.dir, 'migrations');
    mkdirSync(dir);
    for (const [name, sql] of Object.entries(files)) writeFileSync(join(dir, name), sql);
    return pathToFileURL(`${dir}/`);
  }

  it('FR-04: builds the whole schema from an empty database', () => {
    test = createTestDatabase({ migrated: false });

    const applied = migrate(test.db, loadMigrations(), () => '2026-10-23T12:00:00.000Z');

    expect(applied).toEqual([1, 2]);
    expect(names('table')).toEqual(EXPECTED_TABLES);
    expect(names('index')).toEqual(EXPECTED_INDEXES);
    expect(test.db.prepare('SELECT version, applied_at FROM schema_migrations').all()).toEqual([
      { version: 1, applied_at: '2026-10-23T12:00:00.000Z' },
      { version: 2, applied_at: '2026-10-23T12:00:00.000Z' },
    ]);
  });

  it('FR-04: upgrading a database built on 001 keeps its jobs, with no first run recorded', () => {
    test = createTestDatabase({ migrated: false });
    const migrations = loadMigrations();
    migrate(test.db, migrations.slice(0, 1));
    test.db.exec(`INSERT INTO jobs (linkedin_job_id, title, company, location, url, status_changed_at,
                                    first_seen_at, last_seen_at)
                  VALUES ('1', 'SDET', 'Example Co', 'Remote', 'https://www.linkedin.com/jobs/view/1/', 'x', 'x', 'x')`);

    expect(migrate(test.db, migrations)).toEqual([2]);
    expect(test.db.prepare('SELECT title, first_run_id FROM jobs').all()).toEqual([
      { title: 'SDET', first_run_id: null },
    ]);
  });

  it('FR-05: running it again is a no-op', () => {
    test = createTestDatabase();

    expect(migrate(test.db)).toEqual([]);
    expect(appliedVersions(test.db)).toEqual([1, 2]);
  });

  it('FR-05: an empty database has no applied versions', () => {
    test = createTestDatabase({ migrated: false });

    expect(appliedVersions(test.db)).toEqual([]);
  });

  it('FR-05: applies only the versions that are missing, in order', () => {
    test = createTestDatabase({ migrated: false });
    const dir = migrationsDir({
      '002_second.sql': 'CREATE TABLE b (x INTEGER);',
      '001_first.sql':
        'CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL); CREATE TABLE a (x INTEGER);',
      'README.md': 'not a migration',
    });
    const migrations = loadMigrations(dir);

    expect(migrations.map((m) => m.name)).toEqual(['001_first.sql', '002_second.sql']);
    expect(migrate(test.db, migrations.slice(0, 1))).toEqual([1]);
    expect(migrate(test.db, migrations)).toEqual([2]);
    expect(appliedVersions(test.db)).toEqual([1, 2]);
  });

  it('FR-05: a failing migration leaves no trace', () => {
    test = createTestDatabase({ migrated: false });
    const dir = migrationsDir({
      '001_first.sql':
        'CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);',
      '002_broken.sql': 'CREATE TABLE half (x INTEGER); THIS IS NOT SQL;',
    });

    expect(() => migrate(test.db, loadMigrations(dir))).toThrow();

    expect(appliedVersions(test.db)).toEqual([1]);
    expect(names('table')).toEqual(['schema_migrations']);
  });

  it.each([
    [{ '001_ok.sql': '', 'second.sql': '' }, 'migration file name must look like 001_name.sql: second.sql'],
    [{ '001_ok.sql': '', '003_gap.sql': '' }, 'without gaps; found 003_gap.sql'],
    [{ '001_a.sql': '', '001_b.sql': '' }, 'without gaps; found 001_b.sql'],
  ])('FR-05: rejects a bad set of migration files', (files, message) => {
    test = createTestDatabase({ migrated: false });
    const dir = migrationsDir(files);

    expect(() => loadMigrations(dir)).toThrow(MigrationError);
    expect(() => loadMigrations(dir)).toThrow(message);
  });
});
