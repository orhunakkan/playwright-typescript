import type { DatabaseSync } from 'node:sqlite';
import { z } from 'zod';
import { STATUSES, type Status } from '../../domain/status.ts';

// Every status change, including the creation of a job as `new` (from = null) (FR-08).

export interface StatusChange {
  fromStatus: Status | null;
  toStatus: Status;
  changedAt: string;
}

export interface StatusHistoryRepository {
  insert(jobId: number, change: StatusChange): void;
  listForJob(jobId: number): StatusChange[];
}

const Row = z.object({
  fromStatus: z.enum(STATUSES).nullable(),
  toStatus: z.enum(STATUSES),
  changedAt: z.string(),
});

export function createStatusHistoryRepository(db: DatabaseSync): StatusHistoryRepository {
  const insertStatement = db.prepare(
    'INSERT INTO status_history (job_id, from_status, to_status, changed_at) VALUES (?, ?, ?, ?)',
  );
  const listStatement = db.prepare(
    `SELECT from_status AS fromStatus, to_status AS toStatus, changed_at AS changedAt
     FROM status_history WHERE job_id = ? ORDER BY id`,
  );

  return {
    insert(jobId, change) {
      insertStatement.run(jobId, change.fromStatus, change.toStatus, change.changedAt);
    },
    listForJob(jobId) {
      return listStatement.all(jobId).map((row) => Row.parse(row));
    },
  };
}
