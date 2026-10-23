import type { DatabaseSync } from 'node:sqlite';
import { z } from 'zod';

// One row per Gmail message ever ingested (FR-05, FR-12). Email bodies are never stored:
// they contain one-time login tokens.

export const PARSE_STATUSES = ['parsed', 'unrecognized'] as const;

export type ParseStatus = (typeof PARSE_STATUSES)[number];

export interface EmailRecord {
  gmailMessageId: string;
  runId: number;
  receivedAt: string;
  sender: string;
  subject: string;
  savedSearch: string | null;
  parseStatus: ParseStatus;
  unrecognizedReason: string | null;
  jobsFound: number;
  processedAt: string;
}

export interface EmailsRepository {
  exists(gmailMessageId: string): boolean;
  insert(email: EmailRecord): void;
  get(gmailMessageId: string): EmailRecord | null;
  /** The newest receivedAt of any stored email, where the next /find-jobs run resumes (FR-02). */
  latestReceivedAt(): string | null;
}

const Row = z.object({
  gmailMessageId: z.string(),
  runId: z.number().int(),
  receivedAt: z.string(),
  sender: z.string(),
  subject: z.string(),
  savedSearch: z.string().nullable(),
  parseStatus: z.enum(PARSE_STATUSES),
  unrecognizedReason: z.string().nullable(),
  jobsFound: z.number().int().nonnegative(),
  processedAt: z.string(),
});

const LatestRow = z.object({ at: z.string().nullable() });

export function createEmailsRepository(db: DatabaseSync): EmailsRepository {
  const existsStatement = db.prepare('SELECT 1 FROM emails WHERE gmail_message_id = ?');
  const insertStatement = db.prepare(
    `INSERT INTO emails (gmail_message_id, run_id, received_at, sender, subject, saved_search, parse_status,
                         unrecognized_reason, jobs_found, processed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const latestStatement = db.prepare('SELECT max(received_at) AS at FROM emails');
  const selectStatement = db.prepare(
    `SELECT gmail_message_id AS gmailMessageId, run_id AS runId, received_at AS receivedAt, sender, subject,
            saved_search AS savedSearch, parse_status AS parseStatus, unrecognized_reason AS unrecognizedReason,
            jobs_found AS jobsFound, processed_at AS processedAt
     FROM emails WHERE gmail_message_id = ?`,
  );

  return {
    exists(gmailMessageId) {
      return existsStatement.get(gmailMessageId) !== undefined;
    },
    insert(email) {
      insertStatement.run(
        email.gmailMessageId,
        email.runId,
        email.receivedAt,
        email.sender,
        email.subject,
        email.savedSearch,
        email.parseStatus,
        email.unrecognizedReason,
        email.jobsFound,
        email.processedAt,
      );
    },
    get(gmailMessageId) {
      const row = selectStatement.get(gmailMessageId);
      return row === undefined ? null : Row.parse(row);
    },
    latestReceivedAt() {
      return LatestRow.parse(latestStatement.get()).at;
    },
  };
}
