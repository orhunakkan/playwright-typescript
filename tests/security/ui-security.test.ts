import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { IngestEmailsResponseSchema } from '../../src/schemas/api.ts';
import { seedBoard } from '../helpers/seed-board.ts';
import { startTestApp, type TestApp } from '../helpers/test-app.ts';

// PLAN.md §8.1 type 6 for the HTML pages (Phase 6): hostile text from emails and from the owner's own input is
// escaped on every page, form posts from other sites are refused, and pages never carry script.

const HOSTILE_TITLE = '<script>alert(1)</script>';
const HOSTILE_COMPANY = '<img src=x onerror=alert(2)>';

describe('HTML page security', () => {
  let t: TestApp;
  let jobId: number;

  beforeEach(async () => {
    t = await startTestApp();
    const { runId } = await seedBoard(t);
    const response = await t.post(`/api/runs/${String(runId)}/emails`, {
      emails: [
        {
          gmailMessageId: 'msgxss',
          receivedAt: '2026-10-23T10:00:00Z',
          sender: 'jobalerts-noreply@linkedin.com',
          subject: '"><svg onload=alert(3)>',
          plainText: `Your job alert for <b>qa</b>\nNew jobs match your preferences.\n\n${HOSTILE_TITLE}\n${HOSTILE_COMPANY}\n" onmouseover="alert(4)\nView job: https://www.linkedin.com/comm/jobs/view/77/`,
        },
        {
          gmailMessageId: 'msgodd',
          receivedAt: '2026-10-23T11:00:00Z',
          sender: 'jobs-noreply@linkedin.com',
          subject: '<script>alert(5)</script>',
          plainText: 'not an alert',
        },
      ],
    });
    const [job] = IngestEmailsResponseSchema.parse(response.body).newJobs;
    jobId = job?.id ?? 0;
    await t.post(`/api/runs/${String(runId)}/scores`, {
      rubricVersion: 'triage-v1',
      scores: [{ jobId, score: 80, label: 'strong', reason: '<iframe src=//evil.example>' }],
    });
    await t.form(`/jobs/${String(jobId)}/notes`, { notes: '</textarea><script>alert(6)</script>' });
    await t.call('PUT', '/api/profile', {
      targetRoles: ['<script>alert(7)</script>'],
      seniority: 'senior',
      yearsExperience: 8,
      coreSkills: ['<b>x</b>'],
      secondarySkills: [],
      locations: { remoteUS: true, hybridMetros: ['<i>y</i>'], onsiteMetros: [], relocate: false },
      workAuthorization: '"><script>alert(8)</script>',
      dealBreakers: [],
      excludedCompanies: [],
    });
  });
  afterEach(async () => {
    await t.close();
  });

  const pages = () => [
    '/',
    '/?q=script',
    `/?changed=${String(jobId)}`,
    `/jobs/${String(jobId)}`,
    `/jobs/${String(jobId)}?notes=saved`,
    '/runs',
    '/profile',
  ];

  it('NFR-07: hostile text from emails, scores, notes and the profile is escaped on every page', async () => {
    for (const path of pages()) {
      const { text } = await t.get(path);

      // Escaped text may still read "onerror=" or "onmouseover"; it is only dangerous as real markup.
      expect(text, path).not.toMatch(/<script|<img|<svg|<iframe|<b>|<i>|<\/textarea><|<[^>]*\son[a-z]+=/i);
    }

    expect((await t.get('/?q=script')).text).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect((await t.get(`/jobs/${String(jobId)}`)).text).toContain('&lt;/textarea&gt;&lt;script&gt;alert(6)');
    expect((await t.get('/runs')).text).toContain('&lt;script&gt;alert(5)&lt;/script&gt;');
    expect((await t.get('/profile')).text).toContain('&quot;&gt;&lt;script&gt;alert(8)');
  });

  it('NFR-07: a hostile search term is escaped where the form shows it again', async () => {
    const { text } = await t.get(`/?q=${encodeURIComponent('"><script>alert(9)</script>')}`);

    expect(text).toContain('value="&quot;&gt;&lt;script&gt;alert(9)&lt;/script&gt;"');
    expect(text).not.toContain('<script');
  });

  it('DEC-006: no page carries script, inline handlers or inline styles', async () => {
    for (const path of pages()) {
      const { text } = await t.get(path);

      expect(text, path).not.toMatch(/<script|<[^>]*\s(?:on[a-z]+|style)=/i);
    }
  });

  it('NFR-01: every page has the security headers, and the CSP allows no inline code', async () => {
    for (const path of pages()) {
      const response = await t.raw({ path });

      expect(response.headers, path).toMatchObject({
        'x-content-type-options': 'nosniff',
        'referrer-policy': 'same-origin',
        'x-frame-options': 'DENY',
        'cache-control': 'no-store',
      });
      expect(response.headers['content-security-policy']).toBe(
        "default-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
      );
    }
  });

  it('NFR-03: every LinkedIn link opens in a new tab without an opener or referrer', async () => {
    for (const path of ['/', `/jobs/${String(jobId)}`]) {
      const links = (await t.get(path)).text.match(/<a [^>]*linkedin\.com[^>]*>/g) ?? [];

      expect(links.length, path).toBeGreaterThan(0);
      for (const link of links) {
        expect(link).toMatch(/href="https:\/\/www\.linkedin\.com\/jobs\/view\/\d+\/"/);
        expect(link).toContain('rel="noopener noreferrer"');
      }
    }
  });

  it.each<[string, Record<string, string>]>([
    ['a foreign Origin', { Origin: 'http://evil.example' }],
    ['Sec-Fetch-Site: cross-site', { 'Sec-Fetch-Site': 'cross-site', Origin: 'http://evil.example' }],
    ['an opaque "null" Origin', { Origin: 'null', 'Sec-Fetch-Site': 'cross-site' }],
  ])('NFR-01: a form post with %s is refused with 403 and changes nothing', async (_case, headers) => {
    const status = await t.form(`/jobs/${String(jobId)}/status`, { status: 'dismissed' }, headers);
    const notes = await t.form(`/jobs/${String(jobId)}/notes`, { notes: 'pwned' }, headers);

    expect(status.status).toBe(403);
    expect(notes.status).toBe(403);
    expect(status.text).toContain('Requests from other sites are not allowed');
    expect((await t.get(`/api/jobs/${String(jobId)}`)).body).toMatchObject({
      status: 'new',
      notes: '</textarea><script>alert(6)</script>',
    });
  });

  it.each([
    '/static/..%2fpackage.json',
    '/static/%2e%2e%2fsrc%2fmain.ts',
    '/static/..%5C..%5C.env',
    '/static/app.css%00.txt',
    '/static/APP.CSS',
    '/public/app.css',
  ])('NFR-08: %s is 404, never a file', async (path) => {
    const response = await t.raw({ path });

    expect(response.status).toBe(404);
    expect(response.text).not.toMatch(/"dependencies"|startApp|DB_PATH|prefers-color-scheme/);
  });
});
