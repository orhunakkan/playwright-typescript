import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { truncateAll, seedUser, seedNote, queryOne, queryRaw } from '../../utilities/db-client.js';
import type { NoteRow } from '../../fixtures/db-payloads/db-types.js';

// pg_sleep(1) ties the wait to the DB clock, making timestamp comparisons
// deterministic even in slow environments.

test.describe.configure({ mode: 'serial' });

test.describe('DB Audit Trail — created_at / updated_at trigger accuracy', () => {
  test.beforeEach(async () => {
    await allure.feature('DB Audit Trail');
    await allure.story('created_at / updated_at Trigger Accuracy');
    await allure.severity('normal');
    await truncateAll();
  });

  test('created_at and updated_at are set within the INSERT window', async () => {
    const user = await seedUser();

    const beforeCreate = new Date();
    const note = await seedNote(user.id);
    const afterCreate = new Date();

    const dbRow = await queryOne<NoteRow>('SELECT * FROM notes WHERE id = $1', [note.id]);
    expect(dbRow).not.toBeNull();

    expect(dbRow!.created_at.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
    expect(dbRow!.created_at.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    expect(dbRow!.updated_at.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
    expect(dbRow!.updated_at.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
  });

  test('updated_at advances after UPDATE; created_at remains unchanged', async () => {
    const user = await seedUser();
    const note = await seedNote(user.id);

    const dbBefore = await queryOne<NoteRow>('SELECT * FROM notes WHERE id = $1', [note.id]);

    await queryRaw('SELECT pg_sleep(1)');

    await queryRaw('UPDATE notes SET title = $1 WHERE id = $2', ['Updated title for audit trail test', note.id]);

    const dbAfter = await queryOne<NoteRow>('SELECT * FROM notes WHERE id = $1', [note.id]);

    expect(dbAfter!.updated_at.getTime()).toBeGreaterThan(dbBefore!.updated_at.getTime());
    expect(dbAfter!.created_at.getTime()).toBe(dbBefore!.created_at.getTime());
    expect(dbAfter!.title).toBe('Updated title for audit trail test');
  });

  test('updated_at on users table advances after UPDATE', async () => {
    const user = await seedUser();

    await queryRaw('SELECT pg_sleep(1)');

    await queryRaw('UPDATE users SET name = $1 WHERE id = $2', ['Updated Name', user.id]);

    const dbAfter = await queryOne<{ created_at: Date; updated_at: Date }>('SELECT created_at, updated_at FROM users WHERE id = $1', [user.id]);

    expect(dbAfter!.updated_at.getTime()).toBeGreaterThan(user.updated_at.getTime());
    expect(dbAfter!.created_at.getTime()).toBe(user.created_at.getTime());
  });
});
