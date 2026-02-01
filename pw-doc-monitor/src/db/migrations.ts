import { query } from './connection.js';
import { logger } from './logger.js';

export async function migrate(): Promise<void> {
  logger.info('Starting database migrations...');

  try {
    // Create schema_migrations table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const migrations = [
      {
        name: '001_create_runs_table',
        sql: `
          CREATE TABLE IF NOT EXISTS runs (
            id SERIAL PRIMARY KEY,
            run_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
            started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP,
            status VARCHAR(50) DEFAULT 'running',
            total_pages_discovered INTEGER DEFAULT 0,
            total_pages_crawled INTEGER DEFAULT 0,
            pages_changed INTEGER DEFAULT 0,
            pages_new INTEGER DEFAULT 0,
            pages_missing INTEGER DEFAULT 0,
            total_errors INTEGER DEFAULT 0,
            total_duration_ms INTEGER,
            metadata JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
          CREATE INDEX IF NOT EXISTS idx_runs_run_id ON runs(run_id);
          CREATE INDEX IF NOT EXISTS idx_runs_started_at ON runs(started_at DESC);
          CREATE INDEX IF NOT EXISTS idx_runs_status ON runs(status);
        `,
      },
      {
        name: '002_create_pages_table',
        sql: `
          CREATE TABLE IF NOT EXISTS pages (
            id SERIAL PRIMARY KEY,
            url VARCHAR(2048) NOT NULL UNIQUE,
            url_slug VARCHAR(1024) NOT NULL,
            discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_checked_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
          CREATE INDEX IF NOT EXISTS idx_pages_url ON pages(url);
          CREATE INDEX IF NOT EXISTS idx_pages_url_slug ON pages(url_slug);
        `,
      },
      {
        name: '003_create_page_snapshots_table',
        sql: `
          CREATE TABLE IF NOT EXISTS page_snapshots (
            id SERIAL PRIMARY KEY,
            run_id INTEGER NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
            page_id INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
            url VARCHAR(2048) NOT NULL,
            title VARCHAR(1024),
            h1_text VARCHAR(1024),
            content_snapshot JSONB NOT NULL,
            text_hash VARCHAR(64),
            headings_hash VARCHAR(64),
            code_hash VARCHAR(64),
            links_hash VARCHAR(64),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
          CREATE INDEX IF NOT EXISTS idx_page_snapshots_run_id ON page_snapshots(run_id);
          CREATE INDEX IF NOT EXISTS idx_page_snapshots_page_id ON page_snapshots(page_id);
          CREATE INDEX IF NOT EXISTS idx_page_snapshots_run_page ON page_snapshots(run_id, page_id);
        `,
      },
      {
        name: '004_create_network_observations_table',
        sql: `
          CREATE TABLE IF NOT EXISTS network_observations (
            id SERIAL PRIMARY KEY,
            run_id INTEGER NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
            page_id INTEGER REFERENCES pages(id) ON DELETE SET NULL,
            url VARCHAR(2048),
            total_requests INTEGER DEFAULT 0,
            total_responses INTEGER DEFAULT 0,
            count_2xx INTEGER DEFAULT 0,
            count_3xx INTEGER DEFAULT 0,
            count_4xx INTEGER DEFAULT 0,
            count_5xx INTEGER DEFAULT 0,
            failed_requests INTEGER DEFAULT 0,
            top_failing_urls JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
          CREATE INDEX IF NOT EXISTS idx_network_observations_run_id ON network_observations(run_id);
          CREATE INDEX IF NOT EXISTS idx_network_observations_page_id ON network_observations(page_id);
        `,
      },
      {
        name: '005_create_performance_observations_table',
        sql: `
          CREATE TABLE IF NOT EXISTS performance_observations (
            id SERIAL PRIMARY KEY,
            run_id INTEGER NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
            page_id INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
            url VARCHAR(2048) NOT NULL,
            domcontentloaded_ms NUMERIC(10, 2),
            load_ms NUMERIC(10, 2),
            first_byte_ms NUMERIC(10, 2),
            resource_count INTEGER,
            total_transfer_size_bytes BIGINT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
          CREATE INDEX IF NOT EXISTS idx_performance_observations_run_id ON performance_observations(run_id);
          CREATE INDEX IF NOT EXISTS idx_performance_observations_page_id ON performance_observations(page_id);
        `,
      },
      {
        name: '006_create_asset_fingerprints_table',
        sql: `
          CREATE TABLE IF NOT EXISTS asset_fingerprints (
            id SERIAL PRIMARY KEY,
            run_id INTEGER NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
            page_id INTEGER REFERENCES pages(id) ON DELETE SET NULL,
            asset_type VARCHAR(50),
            asset_url VARCHAR(2048),
            body_hash VARCHAR(64),
            size_bytes BIGINT,
            content_type VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
          CREATE INDEX IF NOT EXISTS idx_asset_fingerprints_run_id ON asset_fingerprints(run_id);
          CREATE INDEX IF NOT EXISTS idx_asset_fingerprints_page_id ON asset_fingerprints(page_id);
          CREATE INDEX IF NOT EXISTS idx_asset_fingerprints_asset_url ON asset_fingerprints(asset_url);
        `,
      },
      {
        name: '007_create_error_events_table',
        sql: `
          CREATE TABLE IF NOT EXISTS error_events (
            id SERIAL PRIMARY KEY,
            run_id INTEGER NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
            page_id INTEGER REFERENCES pages(id) ON DELETE SET NULL,
            error_type VARCHAR(100),
            url VARCHAR(2048),
            message TEXT,
            stack_trace TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
          CREATE INDEX IF NOT EXISTS idx_error_events_run_id ON error_events(run_id);
          CREATE INDEX IF NOT EXISTS idx_error_events_page_id ON error_events(page_id);
          CREATE INDEX IF NOT EXISTS idx_error_events_error_type ON error_events(error_type);
        `,
      },
      {
        name: '008_create_change_summary_table',
        sql: `
          CREATE TABLE IF NOT EXISTS change_summaries (
            id SERIAL PRIMARY KEY,
            run_id INTEGER NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
            pages_changed INTEGER DEFAULT 0,
            pages_new INTEGER DEFAULT 0,
            pages_missing INTEGER DEFAULT 0,
            changed_pages_list JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
          CREATE INDEX IF NOT EXISTS idx_change_summaries_run_id ON change_summaries(run_id);
        `,
      },
      {
        name: '009_create_artifacts_table',
        sql: `
          CREATE TABLE IF NOT EXISTS artifacts (
            id SERIAL PRIMARY KEY,
            run_id INTEGER NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
            page_id INTEGER REFERENCES pages(id) ON DELETE SET NULL,
            artifact_type VARCHAR(100),
            local_path VARCHAR(1024),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
          CREATE INDEX IF NOT EXISTS idx_artifacts_run_id ON artifacts(run_id);
          CREATE INDEX IF NOT EXISTS idx_artifacts_page_id ON artifacts(page_id);
          CREATE INDEX IF NOT EXISTS idx_artifacts_type ON artifacts(artifact_type);
        `,
      },
    ];

    for (const migration of migrations) {
      const result = await query('SELECT * FROM schema_migrations WHERE name = $1', [migration.name]);

      if (result.rows.length === 0) {
        logger.info(`Executing migration: ${migration.name}`);
        await query(migration.sql);
        await query('INSERT INTO schema_migrations (name) VALUES ($1)', [migration.name]);
        logger.info(`Migration ${migration.name} completed`);
      } else {
        logger.info(`Migration ${migration.name} already applied`);
      }
    }

    logger.info('All migrations completed successfully');
  } catch (err) {
    logger.error('Migration failed', err);
    throw err;
  }
}
