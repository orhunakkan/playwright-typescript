import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { EmailRecord } from '../../../src/db/repositories/emails.ts';
import type { ParsedJob } from '../../../src/ingest/linkedin-email-parser.ts';
import type { Profile } from '../../../src/schemas/profile.ts';
import { createTestDatabase, type TestDatabase } from '../helpers/test-database.ts';

// Fictional data only: test data must never contain the owner's real details.
const PROFILE: Profile = {
  targetRoles: ['SDET'],
  seniority: 'senior',
  yearsExperience: 8,
  coreSkills: ['Playwright'],
  secondarySkills: [],
  locations: { remoteUS: true, hybridMetros: [], onsiteMetros: [], relocate: false },
  workAuthorization: 'US, no sponsorship needed',
  dealBreakers: [],
  excludedCompanies: [],
};

const PARSED_JOB: ParsedJob = {
  linkedinJobId: '4473592349',
  title: 'Senior QA Automation Test Engineer',
  company: 'Example Markets',
  location: 'Chicago, IL',
  url: 'https://www.linkedin.com/jobs/view/4473592349/',
  activelyHiring: true,
  easyApply: false,
};

function email(runId: number, overrides: Partial<EmailRecord> = {}): EmailRecord {
  return {
    gmailMessageId: 'msg-1',
    runId,
    receivedAt: '2026-10-22T14:10:48.000Z',
    sender: 'jobalerts-noreply@linkedin.com',
    subject: 'Alert',
    savedSearch: 'qa in United States',
    parseStatus: 'parsed',
    unrecognizedReason: null,
    jobsFound: 1,
    processedAt: '2026-10-23T12:00:00.000Z',
    ...overrides,
  };
}

describe('repositories', () => {
  let test: TestDatabase;
  beforeEach(() => {
    test = createTestDatabase();
  });
  afterEach(() => {
    test.close();
  });

  describe('profile', () => {
    it('FR-01: is empty until a profile is stored', () => {
      expect(test.repos.profile.get()).toBeNull();
    });

    it('FR-01: stores the profile and replaces it on the next put', () => {
      test.repos.profile.put(PROFILE, '2026-10-23T12:00:00.000Z');
      test.repos.profile.put({ ...PROFILE, yearsExperience: 9 }, '2026-10-23T13:00:00.000Z');

      expect(test.repos.profile.get()).toEqual({ ...PROFILE, yearsExperience: 9 });
      expect(test.db.prepare('SELECT count(*) AS n, max(updated_at) AS at FROM profile').get()).toEqual({
        n: 1,
        at: '2026-10-23T13:00:00.000Z',
      });
    });

    it('FR-01: refuses to store an invalid profile', () => {
      expect(() => {
        test.repos.profile.put({ ...PROFILE, coreSkills: [] }, '2026-10-23T12:00:00.000Z');
      }).toThrow();
      expect(test.repos.profile.get()).toBeNull();
    });

    it('FR-01: refuses to read back a profile that no longer validates', () => {
      test.db.prepare("INSERT INTO profile (id, data, updated_at) VALUES (1, '{\"targetRoles\":[]}', 'x')").run();

      expect(() => test.repos.profile.get()).toThrow();
    });
  });

  describe('runs', () => {
    it('FR-11: creates a run with zeroed counters', () => {
      const id = test.repos.runs.create('2026-10-23T12:00:00.000Z');

      expect(test.repos.runs.get(id)).toEqual({
        id,
        startedAt: '2026-10-23T12:00:00.000Z',
        finishedAt: null,
        emailsSeen: 0,
        emailsNew: 0,
        emailsDuplicate: 0,
        emailsUnrecognized: 0,
        jobsNew: 0,
        jobsSeenAgain: 0,
        jobsScored: 0,
      });
    });

    it('FR-11: adds to the counters and finishes the run', () => {
      const id = test.repos.runs.create('2026-10-23T12:00:00.000Z');

      test.repos.runs.addCounts(id, { emailsSeen: 2, emailsNew: 1, jobsNew: 6 });
      test.repos.runs.addCounts(id, { emailsSeen: 1, emailsDuplicate: 1, jobsScored: 3 });
      test.repos.runs.addCounts(id, { emailsUnrecognized: 1, jobsSeenAgain: 2 });
      test.repos.runs.finish(id, '2026-10-23T12:05:00.000Z');

      expect(test.repos.runs.get(id)).toMatchObject({
        finishedAt: '2026-10-23T12:05:00.000Z',
        emailsSeen: 3,
        emailsNew: 1,
        emailsDuplicate: 1,
        emailsUnrecognized: 1,
        jobsNew: 6,
        jobsSeenAgain: 2,
        jobsScored: 3,
      });
    });

    it('FR-11: returns null for an unknown run', () => {
      expect(test.repos.runs.get(999)).toBeNull();
    });
  });

  describe('emails', () => {
    it('FR-05: stores an email and reports that it exists', () => {
      const runId = test.repos.runs.create('2026-10-23T12:00:00.000Z');

      expect(test.repos.emails.exists('msg-1')).toBe(false);
      test.repos.emails.insert(email(runId));

      expect(test.repos.emails.exists('msg-1')).toBe(true);
      expect(test.repos.emails.get('msg-1')).toEqual(email(runId));
      expect(test.repos.emails.get('msg-2')).toBeNull();
    });

    it('FR-05: the same Gmail message can never be stored twice', () => {
      const runId = test.repos.runs.create('2026-10-23T12:00:00.000Z');
      test.repos.emails.insert(email(runId));

      expect(() => {
        test.repos.emails.insert(email(runId));
      }).toThrow(/UNIQUE constraint failed/);
    });

    it('FR-12: an unrecognized email must carry its reason, and a parsed one must not', () => {
      const runId = test.repos.runs.create('2026-10-23T12:00:00.000Z');

      expect(() => {
        test.repos.emails.insert(email(runId, { parseStatus: 'unrecognized', unrecognizedReason: null }));
      }).toThrow(/CHECK constraint failed/);
      expect(() => {
        test.repos.emails.insert(email(runId, { unrecognizedReason: 'why' }));
      }).toThrow(/CHECK constraint failed/);
    });

    it('FR-05: an email must belong to an existing run', () => {
      expect(() => {
        test.repos.emails.insert(email(999));
      }).toThrow(/FOREIGN KEY constraint failed/);
    });

    it('FR-12: lists only unrecognized emails, newest first, up to the limit', () => {
      const runId = test.repos.runs.create('2026-10-23T12:00:00.000Z');
      const bad = (id: string, receivedAt: string) =>
        email(runId, {
          gmailMessageId: id,
          receivedAt,
          parseStatus: 'unrecognized',
          unrecognizedReason: 'unknown email format',
          savedSearch: null,
          jobsFound: 0,
        });
      test.repos.emails.insert(email(runId, { gmailMessageId: 'ok', receivedAt: '2026-10-22T18:00:00.000Z' }));
      test.repos.emails.insert(bad('old', '2026-10-20T10:00:00.000Z'));
      test.repos.emails.insert(bad('new', '2026-10-22T10:00:00.000Z'));
      test.repos.emails.insert(bad('mid', '2026-10-21T10:00:00.000Z'));

      expect(test.repos.emails.listUnrecognized(10).map((row) => row.gmailMessageId)).toEqual(['new', 'mid', 'old']);
      expect(test.repos.emails.listUnrecognized(1)).toEqual([bad('new', '2026-10-22T10:00:00.000Z')]);
    });
  });

  describe('jobs', () => {
    it('FR-04: inserts a new job with status new and one sighting counted', () => {
      const id = test.repos.jobs.insert(PARSED_JOB, {
        runId: null,
        seenAt: '2026-10-22T14:10:48.000Z',
        createdAt: '2026-10-23T12:00:00.000Z',
      });

      expect(test.repos.jobs.findIdByLinkedinId('4473592349')).toBe(id);
      expect(test.repos.jobs.get(id)).toEqual({
        id,
        ...PARSED_JOB,
        status: 'new',
        statusChangedAt: '2026-10-23T12:00:00.000Z',
        notes: '',
        score: null,
        scoreLabel: null,
        scoreReason: null,
        rubricVersion: null,
        scoredAt: null,
        firstSeenAt: '2026-10-22T14:10:48.000Z',
        lastSeenAt: '2026-10-22T14:10:48.000Z',
        seenCount: 1,
        firstRunId: null,
      });
    });

    it('FR-04: returns null for an unknown job', () => {
      expect(test.repos.jobs.findIdByLinkedinId('1')).toBeNull();
      expect(test.repos.jobs.get(999)).toBeNull();
    });

    it('FR-04: a second job with the same LinkedIn ID is refused', () => {
      test.repos.jobs.insert(PARSED_JOB, {
        runId: null,
        seenAt: '2026-10-22T14:10:48.000Z',
        createdAt: '2026-10-23T12:00:00.000Z',
      });

      expect(() =>
        test.repos.jobs.insert(PARSED_JOB, {
          runId: null,
          seenAt: '2026-10-22T15:00:00.000Z',
          createdAt: '2026-10-23T12:00:00.000Z',
        }),
      ).toThrow(/UNIQUE constraint failed: jobs.linkedin_job_id/);
    });

    it('FR-04: repeat sightings count up and widen first/last seen, whatever order they arrive in', () => {
      const id = test.repos.jobs.insert(PARSED_JOB, {
        runId: null,
        seenAt: '2026-10-22T14:00:00.000Z',
        createdAt: '2026-10-23T12:00:00.000Z',
      });

      test.repos.jobs.recordSighting(id, PARSED_JOB, '2026-10-21T09:00:00.000Z');
      test.repos.jobs.recordSighting(id, PARSED_JOB, '2026-10-23T08:00:00.000Z');
      test.repos.jobs.recordSighting(id, PARSED_JOB, '2026-10-22T10:00:00.000Z');

      expect(test.repos.jobs.get(id)).toMatchObject({
        seenCount: 4,
        firstSeenAt: '2026-10-21T09:00:00.000Z',
        lastSeenAt: '2026-10-23T08:00:00.000Z',
      });
    });

    it('FR-04: a newer sighting refreshes the title, company, location and flags (DEC-023)', () => {
      const id = test.repos.jobs.insert(PARSED_JOB, {
        runId: null,
        seenAt: '2026-10-21T09:00:00.000Z',
        createdAt: '2026-10-23T12:00:00.000Z',
      });
      const newer = {
        ...PARSED_JOB,
        title: 'Senior QA Automation Engineer (Remote)',
        company: 'Example Markets Inc.',
        location: 'United States',
        activelyHiring: false,
        easyApply: true,
      };

      test.repos.jobs.recordSighting(id, newer, '2026-10-23T08:00:00.000Z');

      expect(test.repos.jobs.get(id)).toMatchObject({
        title: 'Senior QA Automation Engineer (Remote)',
        company: 'Example Markets Inc.',
        location: 'United States',
        activelyHiring: false,
        easyApply: true,
        lastSeenAt: '2026-10-23T08:00:00.000Z',
      });
    });

    it('FR-04: an older sighting arriving late, or one at the same time, keeps the current details (DEC-023)', () => {
      const id = test.repos.jobs.insert(PARSED_JOB, {
        runId: null,
        seenAt: '2026-10-22T14:00:00.000Z',
        createdAt: '2026-10-23T12:00:00.000Z',
      });
      const stale = {
        ...PARSED_JOB,
        title: 'Old title',
        company: 'Old Co',
        location: 'Nowhere',
        activelyHiring: false,
      };

      test.repos.jobs.recordSighting(id, stale, '2026-10-21T09:00:00.000Z');
      test.repos.jobs.recordSighting(id, stale, '2026-10-22T14:00:00.000Z');

      expect(test.repos.jobs.get(id)).toMatchObject({
        title: PARSED_JOB.title,
        company: PARSED_JOB.company,
        location: PARSED_JOB.location,
        activelyHiring: true,
        seenCount: 3,
        firstSeenAt: '2026-10-21T09:00:00.000Z',
      });
    });

    it('FR-04: a newer sighting never touches status, notes or score (DEC-023)', () => {
      const id = test.repos.jobs.insert(PARSED_JOB, {
        runId: null,
        seenAt: '2026-10-21T09:00:00.000Z',
        createdAt: '2026-10-23T12:00:00.000Z',
      });
      test.repos.jobs.updateStatus(id, 'applied', '2026-10-23T13:00:00.000Z');
      test.db.prepare("UPDATE jobs SET notes = 'called them', score = 88, score_label = 'strong' WHERE id = ?").run(id);

      test.repos.jobs.recordSighting(id, { ...PARSED_JOB, title: 'New title' }, '2026-10-24T08:00:00.000Z');

      expect(test.repos.jobs.get(id)).toMatchObject({
        title: 'New title',
        status: 'applied',
        statusChangedAt: '2026-10-23T13:00:00.000Z',
        notes: 'called them',
        score: 88,
        scoreLabel: 'strong',
      });
    });

    it('FR-08: updates the status and its timestamp', () => {
      const id = test.repos.jobs.insert(PARSED_JOB, {
        runId: null,
        seenAt: '2026-10-22T14:00:00.000Z',
        createdAt: '2026-10-23T12:00:00.000Z',
      });

      test.repos.jobs.updateStatus(id, 'saved', '2026-10-23T13:00:00.000Z');

      expect(test.repos.jobs.get(id)).toMatchObject({ status: 'saved', statusChangedAt: '2026-10-23T13:00:00.000Z' });
    });

    it('FR-08: the database itself refuses an unknown status', () => {
      const id = test.repos.jobs.insert(PARSED_JOB, {
        runId: null,
        seenAt: '2026-10-22T14:00:00.000Z',
        createdAt: '2026-10-23T12:00:00.000Z',
      });

      expect(() => test.db.prepare("UPDATE jobs SET status = 'hired' WHERE id = ?").run(id)).toThrow(
        /CHECK constraint failed/,
      );
    });

    it('FR-06: the database itself refuses a score outside 0–100', () => {
      const id = test.repos.jobs.insert(PARSED_JOB, {
        runId: null,
        seenAt: '2026-10-22T14:00:00.000Z',
        createdAt: '2026-10-23T12:00:00.000Z',
      });

      expect(() => test.db.prepare('UPDATE jobs SET score = 101 WHERE id = ?').run(id)).toThrow(
        /CHECK constraint failed/,
      );
    });
  });

  describe('sightings and status history', () => {
    it('FR-10: lists a job’s sightings by email time, with their saved search', () => {
      const runId = test.repos.runs.create('2026-10-23T12:00:00.000Z');
      const jobId = test.repos.jobs.insert(PARSED_JOB, {
        runId: null,
        seenAt: '2026-10-22T14:00:00.000Z',
        createdAt: '2026-10-23T12:00:00.000Z',
      });
      test.repos.emails.insert(email(runId, { gmailMessageId: 'later', receivedAt: '2026-10-23T08:00:00.000Z' }));
      test.repos.emails.insert(email(runId, { gmailMessageId: 'earlier', receivedAt: '2026-10-21T08:00:00.000Z' }));

      test.repos.sightings.insert(jobId, 'later', 'search B');
      test.repos.sightings.insert(jobId, 'earlier', null);

      expect(test.repos.sightings.listForJob(jobId)).toEqual([
        { gmailMessageId: 'earlier', savedSearch: null, receivedAt: '2026-10-21T08:00:00.000Z' },
        { gmailMessageId: 'later', savedSearch: 'search B', receivedAt: '2026-10-23T08:00:00.000Z' },
      ]);
      expect(test.repos.sightings.listForJob(999)).toEqual([]);
    });

    it('FR-04: a sighting must point at a stored job and email', () => {
      expect(() => {
        test.repos.sightings.insert(999, 'missing', null);
      }).toThrow(/FOREIGN KEY constraint failed/);
    });

    it('FR-08: lists a job’s status changes in the order they happened', () => {
      const jobId = test.repos.jobs.insert(PARSED_JOB, {
        runId: null,
        seenAt: '2026-10-22T14:00:00.000Z',
        createdAt: '2026-10-23T12:00:00.000Z',
      });

      test.repos.statusHistory.insert(jobId, {
        fromStatus: null,
        toStatus: 'new',
        changedAt: '2026-10-23T12:00:00.000Z',
      });
      test.repos.statusHistory.insert(jobId, {
        fromStatus: 'new',
        toStatus: 'saved',
        changedAt: '2026-10-23T12:00:00.000Z',
      });

      expect(test.repos.statusHistory.listForJob(jobId)).toEqual([
        { fromStatus: null, toStatus: 'new', changedAt: '2026-10-23T12:00:00.000Z' },
        { fromStatus: 'new', toStatus: 'saved', changedAt: '2026-10-23T12:00:00.000Z' },
      ]);
    });
  });
});
