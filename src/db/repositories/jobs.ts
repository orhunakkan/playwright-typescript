import type { DatabaseSync } from 'node:sqlite';
import { z } from 'zod';
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
}

export interface JobsRepository {
  /** Inserts a job first seen at `seenAt` (the email's time), with status `new` set at `createdAt`. */
  insert(job: ParsedJob, seenAt: string, createdAt: string): number;
  findIdByLinkedinId(linkedinJobId: string): number | null;
  get(id: number): JobRecord | null;
  /**
   * Counts one more sighting of `job` in an email received at `seenAt`. Emails can arrive out of order, so
   * first/last seen widen to include `seenAt`, and the title, company, location and flags are taken from the
   * sighting only when it is newer than every earlier one (DEC-023). Status, notes and score are never touched.
   */
  recordSighting(id: number, job: ParsedJob, seenAt: string): void;
  updateStatus(id: number, status: Status, changedAt: string): void;
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
});

const IdRow = z.object({ id: z.number().int() });

export function createJobsRepository(db: DatabaseSync): JobsRepository {
  const insertStatement = db.prepare(
    `INSERT INTO jobs (linkedin_job_id, title, company, location, url, actively_hiring, easy_apply,
                       status, status_changed_at, first_seen_at, last_seen_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'new', ?, ?, ?)`,
  );
  const findStatement = db.prepare('SELECT id FROM jobs WHERE linkedin_job_id = ?');
  const selectStatement = db.prepare(
    `SELECT id, linkedin_job_id AS linkedinJobId, title, company, location, url,
            actively_hiring AS activelyHiring, easy_apply AS easyApply, status, status_changed_at AS statusChangedAt,
            notes, score, score_label AS scoreLabel, score_reason AS scoreReason, rubric_version AS rubricVersion,
            scored_at AS scoredAt, first_seen_at AS firstSeenAt, last_seen_at AS lastSeenAt, seen_count AS seenCount
     FROM jobs WHERE id = ?`,
  );
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

  return {
    insert(job, seenAt, createdAt) {
      const result = insertStatement.run(
        job.linkedinJobId,
        job.title,
        job.company,
        job.location,
        job.url,
        toSqlBoolean(job.activelyHiring),
        toSqlBoolean(job.easyApply),
        createdAt,
        seenAt,
        seenAt,
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
  };
}
