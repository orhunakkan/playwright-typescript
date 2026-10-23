import { transaction } from '../db/database.ts';
import type { JobRecord } from '../db/repositories/jobs.ts';
import { defaultSortForTab, statusesForTab } from '../domain/board-tabs.ts';
import { ok, parseInput, queryObject } from '../http/respond.ts';
import type { ApiRequest, Route } from '../http/router.ts';
import { changeJobStatus, JobNotFoundError } from '../jobs/status-service.ts';
import { IdParamSchema, JobListQuerySchema, PatchJobRequestSchema } from '../schemas/api.ts';
import type { AppContext } from './context.ts';
import { toJobDetail, toJobSummary } from './views.ts';

// The board's data (FR-07 to FR-10): list with tab/filters/sort, job detail, status and notes changes.
export function jobRoutes(ctx: AppContext): Route[] {
  const { db, repos } = ctx;

  function findJob(request: ApiRequest): JobRecord {
    const jobId = parseInput(IdParamSchema, request.params['id'], 'job ID');
    const job = repos.jobs.get(jobId);
    if (job === null) throw new JobNotFoundError(jobId);
    return job;
  }

  return [
    {
      method: 'GET',
      path: '/api/jobs',
      handler: (request) => {
        const query = parseInput(JobListQuerySchema, queryObject(request.query), 'query string');
        const filter = {
          statuses: query.tab === undefined ? null : statusesForTab(query.tab),
          minScore: query.minScore ?? null,
          text: query.q === undefined || query.q === '' ? null : query.q,
          unscoredOnly: query.unscored ?? false,
        };
        const items = repos.jobs.list({
          ...filter,
          sort: query.sort ?? defaultSortForTab(query.tab ?? null),
          limit: query.limit,
          offset: query.offset,
        });
        return ok({ items: items.map(toJobSummary), total: repos.jobs.count(filter) });
      },
    },
    {
      method: 'GET',
      path: '/api/jobs/:id',
      handler: (request) => ok(toJobDetail(findJob(request), repos)),
    },
    {
      method: 'PATCH',
      path: '/api/jobs/:id',
      handler: (request) => {
        const job = findJob(request);
        const changes = parseInput(PatchJobRequestSchema, request.body);

        // Status and notes change together or not at all: an invalid transition also drops the notes.
        return transaction(db, () => {
          if (changes.status !== undefined) changeJobStatus(db, repos, job.id, changes.status, ctx.now);
          if (changes.notes !== undefined) repos.jobs.updateNotes(job.id, changes.notes);
          return ok(toJobDetail(repos.jobs.get(job.id) ?? job, repos));
        });
      },
    },
  ];
}
