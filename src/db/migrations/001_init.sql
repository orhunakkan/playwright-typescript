-- Initial schema (PLAN.md §5.1). All timestamps are ISO-8601 UTC strings.
-- schema_migrations uses IF NOT EXISTS because migrate.ts may look for it before this file has run.

CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);

CREATE TABLE profile (
  id          INTEGER PRIMARY KEY CHECK (id = 1),   -- single row
  data        TEXT NOT NULL,                        -- JSON, validated by Zod
  updated_at  TEXT NOT NULL
);

CREATE TABLE runs (
  id                    INTEGER PRIMARY KEY,
  started_at            TEXT NOT NULL,
  finished_at           TEXT,
  emails_seen           INTEGER NOT NULL DEFAULT 0,
  emails_new            INTEGER NOT NULL DEFAULT 0,
  emails_duplicate      INTEGER NOT NULL DEFAULT 0,
  emails_unrecognized   INTEGER NOT NULL DEFAULT 0,
  jobs_new              INTEGER NOT NULL DEFAULT 0,
  jobs_seen_again       INTEGER NOT NULL DEFAULT 0,
  jobs_scored           INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE emails (
  gmail_message_id     TEXT PRIMARY KEY,
  run_id               INTEGER NOT NULL REFERENCES runs(id),
  received_at          TEXT NOT NULL,
  sender               TEXT NOT NULL,
  subject              TEXT NOT NULL,
  saved_search         TEXT,
  parse_status         TEXT NOT NULL CHECK (parse_status IN ('parsed','unrecognized')),
  unrecognized_reason  TEXT,                -- why the parser gave up (FR-12), shown on /runs
  jobs_found           INTEGER NOT NULL DEFAULT 0,
  processed_at         TEXT NOT NULL,
  CHECK ((parse_status = 'unrecognized') = (unrecognized_reason IS NOT NULL))
);
CREATE INDEX idx_emails_received ON emails(received_at DESC);

CREATE TABLE jobs (
  id                INTEGER PRIMARY KEY,
  linkedin_job_id   TEXT NOT NULL UNIQUE,
  title             TEXT NOT NULL,
  company           TEXT NOT NULL,
  location          TEXT NOT NULL,
  url               TEXT NOT NULL,          -- canonical: https://www.linkedin.com/jobs/view/<id>/
  actively_hiring   INTEGER NOT NULL DEFAULT 0 CHECK (actively_hiring IN (0, 1)),
  easy_apply        INTEGER NOT NULL DEFAULT 0 CHECK (easy_apply IN (0, 1)),
  status            TEXT NOT NULL DEFAULT 'new'
                    CHECK (status IN ('new','saved','applied','interviewing','offer','rejected','dismissed')),
  status_changed_at TEXT NOT NULL,
  notes             TEXT NOT NULL DEFAULT '',
  score             INTEGER CHECK (score BETWEEN 0 AND 100),
  score_label       TEXT CHECK (score_label IN ('strong','possible','weak')),
  score_reason      TEXT,
  rubric_version    TEXT,
  scored_at         TEXT,
  first_seen_at     TEXT NOT NULL,
  last_seen_at      TEXT NOT NULL,
  seen_count        INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX idx_jobs_status_score ON jobs(status, score DESC);
CREATE INDEX idx_jobs_first_seen ON jobs(first_seen_at DESC);

CREATE TABLE sightings (
  job_id            INTEGER NOT NULL REFERENCES jobs(id),
  gmail_message_id  TEXT NOT NULL REFERENCES emails(gmail_message_id),
  saved_search      TEXT,
  PRIMARY KEY (job_id, gmail_message_id)
);

CREATE TABLE status_history (
  id          INTEGER PRIMARY KEY,
  job_id      INTEGER NOT NULL REFERENCES jobs(id),
  from_status TEXT,
  to_status   TEXT NOT NULL,
  changed_at  TEXT NOT NULL
);
CREATE INDEX idx_status_history_job ON status_history(job_id);
