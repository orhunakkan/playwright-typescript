import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { truncateAll, seedUser, seedNote, queryOne, queryMany, queryRaw } from '../../utilities/db-client.js';
import type { NoteRow } from '../../fixtures/db-payloads/db-types.js';

test.describe.configure({ mode: 'serial' });

test.describe('DB Soft Delete — tombstone pattern via deleted_at', () => {
  test.beforeEach(async () => {
    await allure.feature('DB Soft Delete');
    await allure.story('Tombstone Pattern via deleted_at');
    await allure.severity('normal');
    await truncateAll();
  });

  test('soft-deleting a note sets deleted_at but keeps the row in the DB', async () => {
    const user = await seedUser();
    const note = await seedNote(user.id);

    await queryRaw('UPDATE notes SET deleted_at = now() WHERE id = $1', [note.id]);

    const dbRow = await queryOne<NoteRow>('SELECT * FROM notes WHERE id = $1', [note.id]);
    expect(dbRow).not.toBeNull();
    expect(dbRow!.deleted_at).not.toBeNull();
  });

  test('soft-deleted note is excluded from active_notes view', async () => {
    const user = await seedUser();
    const note1 = await seedNote(user.id);
    const note2 = await seedNote(user.id);

    await queryRaw('UPDATE notes SET deleted_at = now() WHERE id = $1', [note1.id]);

    const activeNotes = await queryMany<NoteRow>('SELECT * FROM active_notes WHERE user_id = $1', [user.id]);
    expect(activeNotes).toHaveLength(1);
    expect(activeNotes[0].id).toBe(note2.id);
  });

  test('raw notes table still contains both rows after soft-delete', async () => {
    const user = await seedUser();
    const note1 = await seedNote(user.id);
    await seedNote(user.id);

    await queryRaw('UPDATE notes SET deleted_at = now() WHERE id = $1', [note1.id]);

    const allRows = await queryMany<NoteRow>('SELECT * FROM notes WHERE user_id = $1', [user.id]);
    expect(allRows).toHaveLength(2);

    const tombstoned = allRows.find((r) => r.id === note1.id);
    expect(tombstoned!.deleted_at).not.toBeNull();
  });
});
