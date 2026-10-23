import type { DatabaseSync } from 'node:sqlite';
import { transaction } from '../db/database.ts';
import type { Repositories } from '../db/repositories/index.ts';
import type { JobRecord } from '../db/repositories/jobs.ts';
import { canTransition, type Status } from '../domain/status.ts';

// Moves a job to a new status if §5.4 allows it, and records the change in its history (FR-08).

export class JobNotFoundError extends Error {
  override name = 'JobNotFoundError';

  constructor(jobId: number) {
    super(`job ${String(jobId)} does not exist`);
  }
}

export class InvalidTransitionError extends Error {
  override name = 'InvalidTransitionError';
  readonly from: Status;
  readonly to: Status;

  constructor(from: Status, to: Status) {
    super(`a job can't move from ${from} to ${to}`);
    this.from = from;
    this.to = to;
  }
}

export function changeJobStatus(
  db: DatabaseSync,
  repos: Repositories,
  jobId: number,
  to: Status,
  now: () => string = () => new Date().toISOString(),
): JobRecord {
  return transaction(db, () => {
    const job = repos.jobs.get(jobId);
    if (job === null) throw new JobNotFoundError(jobId);
    if (!canTransition(job.status, to)) throw new InvalidTransitionError(job.status, to);

    const changedAt = now();
    repos.jobs.updateStatus(jobId, to, changedAt);
    repos.statusHistory.insert(jobId, { fromStatus: job.status, toStatus: to, changedAt });
    return { ...job, status: to, statusChangedAt: changedAt };
  });
}
