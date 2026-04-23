import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { config } from '../../config/env.js';
import { truncateAll, seedUser, seedNote, queryMany, queryOne } from '../../utilities/db-client.js';
import type { UserRow, NoteRow } from '../../fixtures/db-payloads/db-types.js';

// PostgREST idioms used in this file:
//   DELETE /users?id=eq.{uuid}  → 204 No Content (no response body)
//   The notes table has ON DELETE CASCADE on user_id → users(id)

test.describe.configure({ mode: 'serial' });

test.describe('DB Cascade — ON DELETE CASCADE propagates to child rows', () => {
  test.beforeEach(async () => {
    await allure.feature('DB Integrity');
    await allure.story('ON DELETE CASCADE');
    await allure.severity('critical');
    await truncateAll();
  });

  test('deleting a user removes all their notes from the DB', async ({ request }) => {
    const user = await seedUser();

    // Seed 3 notes belonging to this user
    await seedNote(user.id);
    await seedNote(user.id);
    await seedNote(user.id);

    // Verify the notes exist before deletion
    const before = await queryMany<NoteRow>('SELECT * FROM notes WHERE user_id = $1', [user.id]);
    expect(before).toHaveLength(3);

    // DELETE via PostgREST — filter syntax: ?id=eq.{value}
    const response = await request.delete(`${config.postgreStUrl}/users?id=eq.${user.id}`);
    expect(response.status()).toBe(204);

    // User row must be gone
    const deletedUser = await queryOne<UserRow>('SELECT * FROM users WHERE id = $1', [user.id]);
    expect(deletedUser).toBeNull();

    // All associated notes must be gone (cascade)
    const after = await queryMany<NoteRow>('SELECT * FROM notes WHERE user_id = $1', [user.id]);
    expect(after).toHaveLength(0);
  });

  test('deleting one user does not affect notes belonging to another user', async ({ request }) => {
    const userA = await seedUser();
    const userB = await seedUser();

    await seedNote(userA.id);
    await seedNote(userB.id);
    await seedNote(userB.id);

    // Delete only userA
    const response = await request.delete(`${config.postgreStUrl}/users?id=eq.${userA.id}`);
    expect(response.status()).toBe(204);

    // userB's notes must be untouched
    const remaining = await queryMany<NoteRow>('SELECT * FROM notes WHERE user_id = $1', [userB.id]);
    expect(remaining).toHaveLength(2);
  });
});
