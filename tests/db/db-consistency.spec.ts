import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { truncateAll, seedUser, seedNote, queryOne } from '../../utilities/db-client.js';
import type { NoteRow } from '../../fixtures/db-payloads/db-types.js';

test.describe.configure({ mode: 'serial' });

test.describe('DB Consistency — inserted row matches what is read back', () => {
  test.beforeEach(async () => {
    await allure.feature('DB Consistency');
    await allure.story('INSERT ↔ SELECT Round-Trip');
    await allure.severity('critical');
    await truncateAll();
  });

  test('every field written by INSERT matches the persisted DB row', async () => {
    const user = await seedUser();
    const note = await seedNote(user.id);

    const dbRow = await queryOne<NoteRow>('SELECT * FROM notes WHERE id = $1', [note.id]);

    expect(dbRow).not.toBeNull();
    expect(dbRow!.title).toBe(note.title);
    expect(dbRow!.description).toBe(note.description);
    expect(dbRow!.category).toBe(note.category);
    expect(dbRow!.completed).toBe(false);
    expect(dbRow!.user_id).toBe(user.id);
    expect(dbRow!.deleted_at).toBeNull();
  });

  test('DB contains exactly one row after a single INSERT', async () => {
    const user = await seedUser();
    await seedNote(user.id);

    const result = await queryOne<{ count: string }>('SELECT COUNT(*)::text AS count FROM notes WHERE user_id = $1', [user.id]);
    expect(parseInt(result!.count, 10)).toBe(1);
  });
});
