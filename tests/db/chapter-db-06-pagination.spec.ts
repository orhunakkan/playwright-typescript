import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { config } from '../../config/env.js';
import { truncateAll, seedUser, seedNote, queryRaw } from '../../utilities/db-client.js';
import type { PostgRestNoteRow } from '../../fixtures/db-payloads/db-types.js';

// PostgREST pagination idioms used in this file:
//   Range: 0-4            — request rows 0 through 4 (inclusive, 5 rows)
//   Prefer: count=exact   — forces PostgREST to run COUNT(*) and include total
//   Response status 206   — partial content (when Range header is used)
//   Content-Range: 0-4/13 — format: <from>-<to>/<total>

test.describe.configure({ mode: 'serial' });

test.describe('DB Pagination — Range headers match DB COUNT(*)', () => {
  let userId: string;

  test.beforeEach(async () => {
    await allure.feature('DB Pagination');
    await allure.story('Range Headers ↔ DB COUNT(*)');
    await allure.severity('normal');
    await truncateAll();

    const user = await seedUser();
    userId = user.id;

    // Seed exactly 13 notes so we get predictable page boundaries
    for (let i = 0; i < 13; i++) {
      await seedNote(userId);
    }
  });

  test('DB COUNT(*) equals 13 after seeding', async () => {
    const result = await queryRaw('SELECT COUNT(*)::int AS total FROM notes WHERE user_id = $1', [userId]);
    expect(result.rows[0].total).toBe(13);
  });

  test('page 1 (rows 0–4) returns 5 rows and correct Content-Range total', async ({ request }) => {
    const response = await request.get(`${config.postgreStUrl}/notes?user_id=eq.${userId}&order=created_at.asc`, {
      headers: { Range: '0-4', Prefer: 'count=exact' },
    });

    expect(response.status()).toBe(206);

    const body = (await response.json()) as PostgRestNoteRow[];
    expect(body).toHaveLength(5);

    // Parse Content-Range: "0-4/13"
    const contentRange = response.headers()['content-range'];
    const total = parseInt(contentRange.split('/')[1], 10);
    expect(total).toBe(13);
  });

  test('page 2 (rows 5–9) returns 5 rows', async ({ request }) => {
    const response = await request.get(`${config.postgreStUrl}/notes?user_id=eq.${userId}&order=created_at.asc`, {
      headers: { Range: '5-9', Prefer: 'count=exact' },
    });

    expect(response.status()).toBe(206);
    const body = (await response.json()) as PostgRestNoteRow[];
    expect(body).toHaveLength(5);
  });

  test('page 3 (rows 10–14) returns 3 rows — only 13 total', async ({ request }) => {
    const response = await request.get(`${config.postgreStUrl}/notes?user_id=eq.${userId}&order=created_at.asc`, {
      headers: { Range: '10-14', Prefer: 'count=exact' },
    });

    // PostgREST returns 206 even for the last partial page
    expect(response.status()).toBe(206);
    const body = (await response.json()) as PostgRestNoteRow[];
    expect(body).toHaveLength(3);
  });

  test('sum of all page sizes equals DB COUNT(*)', async ({ request }) => {
    const dbResult = await queryRaw('SELECT COUNT(*)::int AS total FROM notes WHERE user_id = $1', [userId]);
    const dbTotal = dbResult.rows[0].total as number;

    const page1 = await request.get(`${config.postgreStUrl}/notes?user_id=eq.${userId}&order=created_at.asc`, {
      headers: { Range: '0-4', Prefer: 'count=exact' },
    });
    const page2 = await request.get(`${config.postgreStUrl}/notes?user_id=eq.${userId}&order=created_at.asc`, {
      headers: { Range: '5-9', Prefer: 'count=exact' },
    });
    const page3 = await request.get(`${config.postgreStUrl}/notes?user_id=eq.${userId}&order=created_at.asc`, {
      headers: { Range: '10-14', Prefer: 'count=exact' },
    });

    const p1 = ((await page1.json()) as PostgRestNoteRow[]).length;
    const p2 = ((await page2.json()) as PostgRestNoteRow[]).length;
    const p3 = ((await page3.json()) as PostgRestNoteRow[]).length;

    expect(p1 + p2 + p3).toBe(dbTotal);
  });
});
