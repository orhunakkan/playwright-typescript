import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { truncateAll, seedUser, seedNote, queryMany, queryOne } from '../../utilities/db-client.js';
import type { NoteRow, UserRow } from '../../fixtures/db-payloads/db-types.js';

// This spec is deliberately meta: it proves that the truncateAll() call in
// beforeEach provides genuine test isolation — no state bleeds between tests.
// Each test independently verifies it starts from a clean slate.

test.describe.configure({ mode: 'serial' });

test.describe('DB Test Isolation — beforeEach truncation prevents state bleed', () => {
  test.beforeEach(async () => {
    await allure.feature('DB Test Isolation');
    await allure.story('beforeEach Truncate Prevents Bleed');
    await allure.severity('normal');
    await truncateAll();
  });

  test('test 1 — inserts a user and confirms count is 1', async () => {
    const countBefore = await queryOne<{ count: string }>('SELECT COUNT(*)::text AS count FROM users');
    expect(parseInt(countBefore!.count, 10)).toBe(0);

    await seedUser();

    const countAfter = await queryOne<{ count: string }>('SELECT COUNT(*)::text AS count FROM users');
    expect(parseInt(countAfter!.count, 10)).toBe(1);
  });

  test('test 2 — starts with zero users (data from test 1 was truncated)', async () => {
    const count = await queryOne<{ count: string }>('SELECT COUNT(*)::text AS count FROM users');
    expect(parseInt(count!.count, 10)).toBe(0);

    await seedUser();

    const countAfter = await queryOne<{ count: string }>('SELECT COUNT(*)::text AS count FROM users');
    expect(parseInt(countAfter!.count, 10)).toBe(1);
  });

  test('test 3 — inserts a user with 5 notes; counts are independent of prior tests', async () => {
    const userCount = await queryOne<{ count: string }>('SELECT COUNT(*)::text AS count FROM users');
    expect(parseInt(userCount!.count, 10)).toBe(0);

    const user = await seedUser();
    for (let i = 0; i < 5; i++) {
      await seedNote(user.id);
    }

    const notes = await queryMany<NoteRow>('SELECT * FROM notes WHERE user_id = $1', [user.id]);
    expect(notes).toHaveLength(5);
  });

  test('test 4 — starts with zero notes (data from test 3 was truncated)', async () => {
    const count = await queryOne<{ count: string }>('SELECT COUNT(*)::text AS count FROM notes');
    expect(parseInt(count!.count, 10)).toBe(0);

    const users = await queryMany<UserRow>('SELECT * FROM users');
    expect(users).toHaveLength(0);
  });
});
