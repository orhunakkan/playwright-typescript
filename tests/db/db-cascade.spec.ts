import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { truncateAll, seedUser, seedNote, queryMany, queryOne, queryRaw } from '../../utilities/db-client.js';
import type { UserRow, NoteRow } from '../../fixtures/db-payloads/db-types.js';

test.describe.configure({ mode: 'serial' });

test.describe('DB Cascade — ON DELETE CASCADE propagates to child rows', () => {
  test.beforeEach(async () => {
    await allure.feature('DB Integrity');
    await allure.story('ON DELETE CASCADE');
    await allure.severity('critical');
    await truncateAll();
  });

  test('deleting a user removes all their notes from the DB', async () => {
    const user = await seedUser();
    await seedNote(user.id);
    await seedNote(user.id);
    await seedNote(user.id);

    const before = await queryMany<NoteRow>('SELECT * FROM notes WHERE user_id = $1', [user.id]);
    expect(before).toHaveLength(3);

    await queryRaw('DELETE FROM users WHERE id = $1', [user.id]);

    const deletedUser = await queryOne<UserRow>('SELECT * FROM users WHERE id = $1', [user.id]);
    expect(deletedUser).toBeNull();

    const after = await queryMany<NoteRow>('SELECT * FROM notes WHERE user_id = $1', [user.id]);
    expect(after).toHaveLength(0);
  });

  test('deleting one user does not affect notes belonging to another user', async () => {
    const userA = await seedUser();
    const userB = await seedUser();

    await seedNote(userA.id);
    await seedNote(userB.id);
    await seedNote(userB.id);

    await queryRaw('DELETE FROM users WHERE id = $1', [userA.id]);

    const remaining = await queryMany<NoteRow>('SELECT * FROM notes WHERE user_id = $1', [userB.id]);
    expect(remaining).toHaveLength(2);
  });
});
