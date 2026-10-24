import { z } from 'zod';
import { TABS } from '../domain/board-tabs.ts';
import { isLabelConsistent, SCORE_LABELS } from '../domain/score.ts';
import { STATUSES } from '../domain/status.ts';
import { LINKEDIN_SESSION_STATES } from '../linkedin/session.ts';

// Every JSON API request and response shape (PLAN.md §6.1). Requests are parsed with these schemas in the
// handlers (NFR-09); the contract tests check every response against them.

const IsoTimestamp = z.iso.datetime({ offset: true });
const Count = z.number().int().nonnegative();
const Id = z.number().int().positive();

/** A whole number in a query string or path, e.g. "?limit=20" or "/api/jobs/7". */
export function intString(min: number, max: number) {
  return z
    .string()
    .regex(/^\d{1,16}$/, 'must be a whole number')
    .transform(Number)
    .pipe(z.number().int().min(min).max(max));
}

export const IdParamSchema = intString(1, Number.MAX_SAFE_INTEGER);

// --- Shared --------------------------------------------------------------------------------------------------

export const ErrorResponseSchema = z.strictObject({
  error: z.strictObject({ code: z.string().min(1), message: z.string().min(1), details: z.unknown().optional() }),
});

export const EmptyRequestSchema = z.strictObject({});

export const JobSummarySchema = z.strictObject({
  id: Id,
  linkedinJobId: z.string().regex(/^\d+$/),
  title: z.string(),
  company: z.string(),
  location: z.string(),
  // Exactly the canonical form of PLAN.md §5.3: no query string, so no tracking token can ever be served.
  url: z.string().regex(/^https:\/\/www\.linkedin\.com\/jobs\/view\/\d+\/$/),
  activelyHiring: z.boolean(),
  easyApply: z.boolean(),
  status: z.enum(STATUSES),
  statusChangedAt: IsoTimestamp,
  score: z.number().int().min(0).max(100).nullable(),
  scoreLabel: z.enum(SCORE_LABELS).nullable(),
  scoreReason: z.string().nullable(),
  firstSeenAt: IsoTimestamp,
  lastSeenAt: IsoTimestamp,
  seenCount: z.number().int().positive(),
});

export const JobDetailSchema = JobSummarySchema.extend({
  notes: z.string(),
  rubricVersion: z.string().nullable(),
  scoredAt: IsoTimestamp.nullable(),
  sightings: z.array(
    z.strictObject({ gmailMessageId: z.string(), savedSearch: z.string().nullable(), receivedAt: IsoTimestamp }),
  ),
  history: z.array(
    z.strictObject({ fromStatus: z.enum(STATUSES).nullable(), toStatus: z.enum(STATUSES), changedAt: IsoTimestamp }),
  ),
});

export const RunSummarySchema = z.strictObject({
  id: Id,
  startedAt: IsoTimestamp,
  finishedAt: IsoTimestamp.nullable(),
  emailsSeen: Count,
  emailsNew: Count,
  emailsDuplicate: Count,
  emailsUnrecognized: Count,
  jobsNew: Count,
  jobsSeenAgain: Count,
  jobsScored: Count,
  topNewJobs: z.array(JobSummarySchema).max(5),
});

// --- GET /api/health ---------------------------------------------------------------------------------------------

export const HealthResponseSchema = z.strictObject({
  status: z.literal('ok'),
  db: z.literal('ok'),
  version: z.string(),
});

// --- GET /api/linkedin/session -----------------------------------------------------------------------------------

export const LinkedInSessionResponseSchema = z.strictObject({
  status: z.enum(LINKEDIN_SESSION_STATES),
  savedAt: IsoTimestamp.nullable(),
  expiresAt: IsoTimestamp.nullable(),
});

// --- GET /api/ingest/state ---------------------------------------------------------------------------------------

export const IngestStateResponseSchema = z.strictObject({ lastEmailReceivedAt: IsoTimestamp.nullable() });

// --- POST /api/runs ----------------------------------------------------------------------------------------------

export const CreateRunResponseSchema = z.strictObject({ runId: Id });

// --- POST /api/runs/:id/emails -----------------------------------------------------------------------------------

export const IngestEmailsRequestSchema = z.strictObject({
  emails: z
    .array(
      z.strictObject({
        gmailMessageId: z.string().regex(/^[A-Za-z0-9_-]{1,100}$/, 'must be a Gmail message ID'),
        receivedAt: IsoTimestamp,
        sender: z.string().trim().min(1).max(320),
        subject: z.string().max(1000),
        plainText: z.string().max(900_000),
      }),
    )
    .min(1)
    .max(50),
});

export const IngestEmailsResponseSchema = z.strictObject({
  results: z.array(
    z.strictObject({
      gmailMessageId: z.string(),
      outcome: z.enum(['new', 'duplicate', 'unrecognized']),
      jobsFound: Count,
    }),
  ),
  newJobs: z.array(JobSummarySchema),
});

// --- POST /api/runs/:id/scores -----------------------------------------------------------------------------------

export const ScoresRequestSchema = z
  .strictObject({
    rubricVersion: z.string().trim().min(1).max(50),
    scores: z
      .array(
        z
          .strictObject({
            jobId: Id,
            score: z.number().int().min(0).max(100),
            label: z.enum(SCORE_LABELS),
            reason: z.string().trim().min(1).max(200),
          })
          .refine((entry) => isLabelConsistent(entry.score, entry.label), {
            message: 'label does not match the score band (strong ≥ 75, possible 50–74, weak < 50)',
            path: ['label'],
          }),
      )
      .min(1)
      .max(50),
  })
  .refine((body) => new Set(body.scores.map((entry) => entry.jobId)).size === body.scores.length, {
    message: 'each job may be scored only once per request',
    path: ['scores'],
  });

export const ScoresResponseSchema = z.strictObject({ stored: Count });

// --- GET /api/runs -----------------------------------------------------------------------------------------------

export const RunListQuerySchema = z.strictObject({ limit: intString(1, 100).default(20) });

export const RunListResponseSchema = z.array(RunSummarySchema);

// --- GET /api/jobs -----------------------------------------------------------------------------------------------

export const JobListQuerySchema = z
  .strictObject({
    tab: z.enum(TABS).optional(),
    minScore: intString(0, 100).optional(),
    q: z.string().trim().max(200).optional(),
    sort: z.enum(['score', 'recent']).optional(),
    unscored: z
      .enum(['true', 'false'])
      .transform((value) => value === 'true')
      .optional(),
    limit: intString(1, 100).default(50),
    offset: intString(0, 1_000_000).default(0),
  })
  .refine((query) => !(query.unscored === true && query.minScore !== undefined), {
    message: 'minScore and unscored=true exclude each other',
    path: ['unscored'],
  });

export const JobListResponseSchema = z.strictObject({ items: z.array(JobSummarySchema), total: Count });

// --- PATCH /api/jobs/:id -----------------------------------------------------------------------------------------

export const PatchJobRequestSchema = z
  .strictObject({ status: z.enum(STATUSES).optional(), notes: z.string().max(5000).optional() })
  .refine((body) => body.status !== undefined || body.notes !== undefined, { message: 'send status, notes or both' });

export type JobSummary = z.infer<typeof JobSummarySchema>;
export type JobDetail = z.infer<typeof JobDetailSchema>;
export type RunSummary = z.infer<typeof RunSummarySchema>;
