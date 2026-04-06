import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { config } from '../../config/env.js';
import { truncateAll, seedUser, queryOne, queryRaw } from '../../utilities/db-client.js';
import { generatePostgRestNotePayload } from '../../fixtures/db-payloads/db-payload-generators.js';
import type { NoteRow, PostgRestNoteRow } from '../../fixtures/db-payloads/db-types.js';

// Audit trail assertions in this file:
//   created_at — set on INSERT, never changes on UPDATE (DB trigger does not touch it)
//   updated_at — set on INSERT, advanced on UPDATE by the set_updated_at() trigger
//
// pg_sleep(1) is used instead of setTimeout to tie the wait to the DB clock,
// making the timestamp comparison deterministic even in slow CI environments.

test.describe.configure({ mode: 'serial' });

test.describe('DB Audit Trail — created_at / updated_at trigger accuracy', () => {
  test.beforeEach(async () => {
    await allure.feature('DB Audit Trail');
    await allure.story('created_at / updated_at Trigger Accuracy');
    await allure.severity('normal');
    await truncateAll();
  });

  test('created_at and updated_at are set within the request window on INSERT', async ({ request }) => {
    const user = await seedUser();
    const payload = generatePostgRestNotePayload(user.id);

    const beforeCreate = new Date();

    const response = await request.post(`${config.postgreStUrl}/notes`, {
      data: payload,
      headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
    });
    expect(response.status()).toBe(201);

    const afterCreate = new Date();
    const [apiNote] = (await response.json()) as PostgRestNoteRow[];

    const dbRow = await queryOne<NoteRow>('SELECT * FROM notes WHERE id = $1', [apiNote.id]);
    expect(dbRow).not.toBeNull();

    // Timestamps must fall within the request window (tolerates network latency)
    expect(dbRow!.created_at.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
    expect(dbRow!.created_at.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    expect(dbRow!.updated_at.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
    expect(dbRow!.updated_at.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
  });

  test('updated_at advances after PATCH; created_at remains unchanged', async ({ request }) => {
    const user = await seedUser();
    const payload = generatePostgRestNotePayload(user.id);

    const createResponse = await request.post(`${config.postgreStUrl}/notes`, {
      data: payload,
      headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
    });
    const [apiNote] = (await createResponse.json()) as PostgRestNoteRow[];
    const dbBefore = await queryOne<NoteRow>('SELECT * FROM notes WHERE id = $1', [apiNote.id]);

    // Use pg_sleep to advance the DB clock by 1 second — more reliable than
    // setTimeout in slow CI environments because it ties the wait to the DB clock.
    await queryRaw('SELECT pg_sleep(1)');

    const patchResponse = await request.patch(`${config.postgreStUrl}/notes?id=eq.${apiNote.id}`, {
      data: { title: 'Updated title for audit trail test' },
      headers: { 'Content-Type': 'application/json' },
    });
    expect(patchResponse.status()).toBe(204);

    const dbAfter = await queryOne<NoteRow>('SELECT * FROM notes WHERE id = $1', [apiNote.id]);

    // updated_at must have advanced
    expect(dbAfter!.updated_at.getTime()).toBeGreaterThan(dbBefore!.updated_at.getTime());

    // created_at must not have changed
    expect(dbAfter!.created_at.getTime()).toBe(dbBefore!.created_at.getTime());

    // The title change must be persisted
    expect(dbAfter!.title).toBe('Updated title for audit trail test');
  });

  test('updated_at on users table advances after PATCH', async ({ request }) => {
    const user = await seedUser();

    await queryRaw('SELECT pg_sleep(1)');

    const patchResponse = await request.patch(`${config.postgreStUrl}/users?id=eq.${user.id}`, {
      data: { name: 'Updated Name' },
      headers: { 'Content-Type': 'application/json' },
    });
    expect(patchResponse.status()).toBe(204);

    const dbAfter = await queryOne<{ created_at: Date; updated_at: Date }>('SELECT created_at, updated_at FROM users WHERE id = $1', [user.id]);

    expect(dbAfter!.updated_at.getTime()).toBeGreaterThan(user.updated_at.getTime());
    expect(dbAfter!.created_at.getTime()).toBe(user.created_at.getTime());
  });
});
