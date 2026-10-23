import { CreateRunResponseSchema, IngestEmailsResponseSchema, type JobSummary } from '../../src/schemas/api.ts';
import { fixtureEmail } from './fixtures.ts';
import type { TestApp } from './test-app.ts';

// Loads the three sanitized fixtures through the API, as /find-jobs would: 18 new jobs in one open run.
export async function seedBoard(t: TestApp): Promise<{ runId: number; jobs: JobSummary[] }> {
  const { runId } = CreateRunResponseSchema.parse((await t.post('/api/runs')).body);
  const response = await t.post(`/api/runs/${String(runId)}/emails`, {
    emails: [
      fixtureEmail('digest-test-automation.txt', 'msgdigestta'),
      fixtureEmail('digest-senior-qa.txt', 'msgdigestsq'),
      fixtureEmail('recommendations.txt', 'msgrecs'),
    ],
  });
  return { runId, jobs: IngestEmailsResponseSchema.parse(response.body).newJobs };
}

export function jobAt(jobs: readonly JobSummary[], company: string): JobSummary {
  const job = jobs.find((candidate) => candidate.company === company);
  if (job === undefined) throw new Error(`no seeded job at ${company}`);
  return job;
}
