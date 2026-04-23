import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { truncateAll, seedUser, seedNote, queryMany, queryRaw } from '../../utilities/db-client.js';
import type { NoteRow } from '../../fixtures/db-payloads/db-types.js';

test.describe.configure({ mode: 'serial' });

test.describe('DB Pagination — LIMIT/OFFSET matches DB COUNT(*)', () => {
  let userId: string;

  test.beforeEach(async () => {
    await allure.feature('DB Pagination');
    await allure.story('LIMIT/OFFSET ↔ DB COUNT(*)');
    await allure.severity('normal');
    await truncateAll();

    const user = await seedUser();
    userId = user.id;

    for (let i = 0; i < 13; i++) {
      await seedNote(userId);
    }
  });

  test('DB COUNT(*) equals 13 after seeding', async () => {
    const result = await queryRaw('SELECT COUNT(*)::int AS total FROM notes WHERE user_id = $1', [userId]);
    expect(result.rows[0].total).toBe(13);
  });

  test('page 1 (LIMIT 5 OFFSET 0) returns 5 rows', async () => {
    const rows = await queryMany<NoteRow>('SELECT * FROM notes WHERE user_id = $1 ORDER BY created_at ASC LIMIT 5 OFFSET 0', [userId]);
    expect(rows).toHaveLength(5);
  });

  test('page 2 (LIMIT 5 OFFSET 5) returns 5 rows', async () => {
    const rows = await queryMany<NoteRow>('SELECT * FROM notes WHERE user_id = $1 ORDER BY created_at ASC LIMIT 5 OFFSET 5', [userId]);
    expect(rows).toHaveLength(5);
  });

  test('page 3 (LIMIT 5 OFFSET 10) returns 3 rows — only 13 total', async () => {
    const rows = await queryMany<NoteRow>('SELECT * FROM notes WHERE user_id = $1 ORDER BY created_at ASC LIMIT 5 OFFSET 10', [userId]);
    expect(rows).toHaveLength(3);
  });

  test('sum of all page sizes equals DB COUNT(*)', async () => {
    const dbResult = await queryRaw('SELECT COUNT(*)::int AS total FROM notes WHERE user_id = $1', [userId]);
    const dbTotal = dbResult.rows[0].total as number;

    const page1 = await queryMany<NoteRow>('SELECT * FROM notes WHERE user_id = $1 ORDER BY created_at ASC LIMIT 5 OFFSET 0', [userId]);
    const page2 = await queryMany<NoteRow>('SELECT * FROM notes WHERE user_id = $1 ORDER BY created_at ASC LIMIT 5 OFFSET 5', [userId]);
    const page3 = await queryMany<NoteRow>('SELECT * FROM notes WHERE user_id = $1 ORDER BY created_at ASC LIMIT 5 OFFSET 10', [userId]);

    expect(page1.length + page2.length + page3.length).toBe(dbTotal);
  });
});
