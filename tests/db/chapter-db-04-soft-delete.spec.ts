import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { config } from '../../config/env.js';
import { truncateAll, seedUser, seedNote, queryOne, queryMany } from '../../utilities/db-client.js';
import type { NoteRow, PostgRestNoteRow } from '../../fixtures/db-payloads/db-types.js';

// Soft-delete pattern:
//   PATCH /notes?id=eq.{uuid}  sets deleted_at — row remains in the `notes` table
//   GET   /active_notes         excludes rows where deleted_at IS NOT NULL (via DB view)
//   GET   /notes                shows all rows including soft-deleted ones

test.describe.configure({ mode: 'serial' });

test.describe('DB Soft Delete — tombstone pattern via deleted_at', () => {
  test.beforeEach(async () => {
    await allure.feature('DB Soft Delete');
    await allure.story('Tombstone Pattern via deleted_at');
    await allure.severity('normal');
    await truncateAll();
  });

  test('soft-deleting a note sets deleted_at but keeps the row in the DB', async ({ request }) => {
    const user = await seedUser();
    const note = await seedNote(user.id);

    // Soft-delete: set deleted_at to now via PATCH
    const patchResponse = await request.patch(`${config.postgreStUrl}/notes?id=eq.${note.id}`, {
      data: { deleted_at: new Date().toISOString() },
      headers: { 'Content-Type': 'application/json' },
    });
    expect(patchResponse.status()).toBe(204);

    // Row must still exist in the notes table
    const dbRow = await queryOne<NoteRow>('SELECT * FROM notes WHERE id = $1', [note.id]);
    expect(dbRow).not.toBeNull();
    expect(dbRow!.deleted_at).not.toBeNull();
  });

  test('soft-deleted note is excluded from active_notes view', async ({ request }) => {
    const user = await seedUser();
    const note1 = await seedNote(user.id);
    const note2 = await seedNote(user.id);

    // Soft-delete note1 only
    await request.patch(`${config.postgreStUrl}/notes?id=eq.${note1.id}`, {
      data: { deleted_at: new Date().toISOString() },
      headers: { 'Content-Type': 'application/json' },
    });

    // active_notes view should return only note2
    const viewResponse = await request.get(`${config.postgreStUrl}/active_notes?user_id=eq.${user.id}`);
    expect(viewResponse.status()).toBe(200);
    const activeNotes = (await viewResponse.json()) as PostgRestNoteRow[];
    expect(activeNotes).toHaveLength(1);
    expect(activeNotes[0].id).toBe(note2.id);
  });

  test('raw notes table still contains both rows after soft-delete', async ({ request }) => {
    const user = await seedUser();
    const note1 = await seedNote(user.id);
    await seedNote(user.id);

    await request.patch(`${config.postgreStUrl}/notes?id=eq.${note1.id}`, {
      data: { deleted_at: new Date().toISOString() },
      headers: { 'Content-Type': 'application/json' },
    });

    // The raw table shows all rows — useful for recovery / audit
    const allRows = await queryMany<NoteRow>('SELECT * FROM notes WHERE user_id = $1', [user.id]);
    expect(allRows).toHaveLength(2);

    const tombstoned = allRows.find((r) => r.id === note1.id);
    expect(tombstoned!.deleted_at).not.toBeNull();
  });
});
