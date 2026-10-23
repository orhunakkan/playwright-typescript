import type { DatabaseSync } from 'node:sqlite';
import { z } from 'zod';
import type { BoardSort } from '../../domain/board-tabs.ts';
import { SCORE_LABELS, type ScoreLabel } from '../../domain/score.ts';
import { STATUSES, type Status } from '../../domain/status.ts';
import type { ParsedJob } from '../../ingest/linkedin-email-parser.ts';
import { SqlBoolean, toId, toSqlBoolean } from './columns.ts';

// One row per LinkedIn job ID (FR-04). Repeat sightings update the counters, never add a row.

export interface JobRecord {
  id: number;
  linkedinJobId: string;
  title: string;
  company: string;
  location: string;
  url: string;
  activelyHiring: boolean;
  easyApply: boolean;
  status: Status;
  statusChangedAt: string;
  notes: string;
  score: number | null;
  scoreLabel: ScoreLabel | null;
  scoreReason: string | null;
  rubricVersion: string | null;
  scoredAt: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
  seenCount: number;
  firstRunId: number | null;
}

export interface JobScore {
  score: number;
  label: ScoreLabel;
  reason: string;
  rubricVersion: string;
  scoredAt: string;
}

export interface JobFilter {
  statuses: readonly Status[] | null; // null = every status
  minScore: number | null; // excludes unscored jobs
  text: string | null; // case-insensitive substring of title or company
  unscoredOnly: boolean;
  sort: BoardSort;
  limit: number;
  offset: number;
}

export interface JobsRepository {
  /** Inserts a job first seen at `seenAt` (the email's time) in run `runId`, with status `new` set at `createdAt`. */
  insert(job: ParsedJob, at: { runId: number | null; seenAt: string; createdAt: string }): number;
  findIdByLinkedinId(linkedinJobId: string): number | null;
  get(id: number): JobRecord | null;
  /**
   * Counts one more sighting of `job` in an email received at `seenAt`. Emails can arrive out of order, so
   * first/last seen widen to include `seenAt`, and the title, company, location and flags are taken from the
   * sighting only when it is newer than every earlier one (DEC-023). Status, notes and score are never touched.
   */
  recordSighting(id: number, job: ParsedJob, seenAt: string): void;
  updateStatus(id: number, status: Status, changedAt: string): void;
  updateNotes(id: number, notes: string): void;
  setScore(id: number, score: JobScore): void;
  /** The subset of `ids` that exist. */
  existingIds(ids: readonly number[]): Set<number>;
  list(filter: JobFilter): JobRecord[];
  count(filter: Omit<JobFilter, 'sort' | 'limit' | 'offset'>): number;
  /** The jobs first ingested in a run, best score first (FR-13). */
  topNewForRun(runId: number, limit: number): JobRecord[];
}

const Row = z.object({
  id: z.number().int(),
  linkedinJobId: z.string(),
  title: z.string(),
  company: z.string(),
  location: z.string(),
  url: z.string(),
  activelyHiring: SqlBoolean,
  easyApply: SqlBoolean,
  status: z.enum(STATUSES),
  statusChangedAt: z.string(),
  notes: z.string(),
  score: z.number().int().nullable(),
  scoreLabel: z.enum(SCORE_LABELS).nullable(),
  scoreReason: z.string().nullable(),
  rubricVersion: z.string().nullable(),
  scoredAt: z.string().nullable(),
  firstSeenAt: z.string(),
  lastSeenAt: z.string(),
  seenCount: z.number().int().positive(),
  firstRunId: z.number().int().nullable(),
});

const IdRow = z.object({ id: z.number().int() });
const CountRow = z.object({ n: z.number().int() });

const COLUMNS = `id, linkedin_job_id AS linkedinJobId, title, company, location, url,
  actively_hiring AS activelyHiring, easy_apply AS easyApply, status, status_changed_at AS statusChangedAt,
  notes, score, score_label AS scoreLabel, score_reason AS scoreReason, rubric_version AS rubricVersion,
  scored_at AS scoredAt, first_seen_at AS firstSeenAt, last_seen_at AS lastSeenAt, seen_count AS seenCount,
  first_run_id AS firstRunId`;

// One fixed WHERE clause for every filter: an unused filter is bound as NULL (or 0) and matches everything,
// so no SQL is ever built from strings. ?1 statuses (JSON array), ?2 min score, ?3 LIKE pattern, ?4 unscored only.
const FILTER = `(?1 IS NULL OR status IN (SELECT value FROM json_each(?1)))
  AND (?2 IS NULL OR score >= ?2)
  AND (?3 IS NULL OR title LIKE ?3 ESCAPE '\\' OR company LIKE ?3 ESCAPE '\\')
  AND (?4 = 0 OR score IS NULL)`;

function filterParams(filter: Omit<JobFilter, 'sort' | 'limit' | 'offset'>) {
  return [
    filter.statuses === null ? null : JSON.stringify(filter.statuses),
    filter.minScore,
    filter.text === null ? null : `%${filter.text.replace(/[\\%_]/g, '\\$&')}%`,
    toSqlBoolean(filter.unscoredOnly),
  ] as const;
}

export function createJobsRepository(db: DatabaseSync): JobsRepository {
  const insertStatement = db.prepare(
    `INSERT INTO jobs (linkedin_job_id, title, company, location, url, actively_hiring, easy_apply,
                       status, status_changed_at, first_seen_at, last_seen_at, first_run_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'new', ?, ?, ?, ?)`,
  );
  const findStatement = db.prepare('SELECT id FROM jobs WHERE linkedin_job_id = ?');
  const selectStatement = db.prepare(`SELECT ${COLUMNS} FROM jobs WHERE id = ?`);
  const sightingStatement = db.prepare(
    // Every right-hand side reads the row as it was before this UPDATE, so `?1 > last_seen_at` is the old value.
    `UPDATE jobs SET
       title           = CASE WHEN ?1 > last_seen_at THEN ?2 ELSE title END,
       company         = CASE WHEN ?1 > last_seen_at THEN ?3 ELSE company END,
       location        = CASE WHEN ?1 > last_seen_at THEN ?4 ELSE location END,
       actively_hiring = CASE WHEN ?1 > last_seen_at THEN ?5 ELSE actively_hiring END,
       easy_apply      = CASE WHEN ?1 > last_seen_at THEN ?6 ELSE easy_apply END,
       seen_count      = seen_count + 1,
       first_seen_at   = min(first_seen_at, ?1),
       last_seen_at    = max(last_seen_at, ?1)
     WHERE id = ?7`,
  );
  const statusStatement = db.prepare('UPDATE jobs SET status = ?, status_changed_at = ? WHERE id = ?');
  const notesStatement = db.prepare('UPDATE jobs SET notes = ? WHERE id = ?');
  const scoreStatement = db.prepare(
    `UPDATE jobs SET score = ?, score_label = ?, score_reason = ?, rubric_version = ?, scored_at = ? WHERE id = ?`,
  );
  const existingStatement = db.prepare('SELECT id FROM jobs WHERE id IN (SELECT value FROM json_each(?))');
  const listStatement = db.prepare(
    `SELECT ${COLUMNS} FROM jobs WHERE ${FILTER}
     ORDER BY CASE WHEN ?5 = 'score' THEN score END DESC NULLS LAST,
              CASE WHEN ?5 = 'changed' THEN status_changed_at END DESC,
              first_seen_at DESC, id DESC
     LIMIT ?6 OFFSET ?7`,
  );
  const countStatement = db.prepare(`SELECT count(*) AS n FROM jobs WHERE ${FILTER}`);
  const topNewStatement = db.prepare(
    `SELECT ${COLUMNS} FROM jobs WHERE first_run_id = ?
     ORDER BY score DESC NULLS LAST, first_seen_at DESC, id DESC LIMIT ?`,
  );

  return {
    insert(job, at) {
      const result = insertStatement.run(
        job.linkedinJobId,
        job.title,
        job.company,
        job.location,
        job.url,
        toSqlBoolean(job.activelyHiring),
        toSqlBoolean(job.easyApply),
        at.createdAt,
        at.seenAt,
        at.seenAt,
        at.runId,
      );
      return toId(result.lastInsertRowid);
    },
    findIdByLinkedinId(linkedinJobId) {
      const row = findStatement.get(linkedinJobId);
      return row === undefined ? null : IdRow.parse(row).id;
    },
    get(id) {
      const row = selectStatement.get(id);
      return row === undefined ? null : Row.parse(row);
    },
    recordSighting(id, job, seenAt) {
      sightingStatement.run(
        seenAt,
        job.title,
        job.company,
        job.location,
        toSqlBoolean(job.activelyHiring),
        toSqlBoolean(job.easyApply),
        id,
      );
    },
    updateStatus(id, status, changedAt) {
      statusStatement.run(status, changedAt, id);
    },
    updateNotes(id, notes) {
      notesStatement.run(notes, id);
    },
    setScore(id, score) {
      scoreStatement.run(score.score, score.label, score.reason, score.rubricVersion, score.scoredAt, id);
    },
    existingIds(ids) {
      return new Set(existingStatement.all(JSON.stringify(ids)).map((row) => IdRow.parse(row).id));
    },
    list(filter) {
      return listStatement
        .all(...filterParams(filter), filter.sort, filter.limit, filter.offset)
        .map((row) => Row.parse(row));
    },
    count(filter) {
      return CountRow.parse(countStatement.get(...filterParams(filter))).n;
    },
    topNewForRun(runId, limit) {
      return topNewStatement.all(runId, limit).map((row) => Row.parse(row));
    },
  };
}
