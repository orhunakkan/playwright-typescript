import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { config } from '../../config/env.js';
import { truncateAll, seedUser, queryOne } from '../../utilities/db-client.js';
import { generatePostgRestNotePayload } from '../../fixtures/db-payloads/db-payload-generators.js';
import type { NoteRow, PostgRestNoteRow } from '../../fixtures/db-payloads/db-types.js';

// PostgREST idioms used in this file:
//   POST /notes + Prefer: return=representation  → 201 + [row]
//   GET  /notes?id=eq.{uuid}                     → 200 + [row]

test.describe.configure({ mode: 'serial' });

test.describe('DB Consistency — API response matches DB row', () => {
  test.beforeEach(async () => {
    await allure.feature('DB Consistency');
    await allure.story('PostgREST ↔ DB Row Consistency');
    await allure.severity('critical');
    await truncateAll();
  });

  test('POST /notes — every response field matches the persisted DB row', async ({ request }) => {
    const user = await seedUser();
    const payload = generatePostgRestNotePayload(user.id);

    // ── HTTP call ──────────────────────────────────────────────────────────
    const response = await request.post(`${config.postgreStUrl}/notes`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        // Tell PostgREST to return the inserted row instead of an empty 201
        Prefer: 'return=representation',
      },
    });

    expect(response.status()).toBe(201);

    // PostgREST always returns an array even for single-row inserts
    const [apiNote] = (await response.json()) as PostgRestNoteRow[];
    expect(apiNote).toBeDefined();

    // ── Direct DB assertion ────────────────────────────────────────────────
    const dbRow = await queryOne<NoteRow>('SELECT * FROM notes WHERE id = $1', [apiNote.id]);

    expect(dbRow).not.toBeNull();
    expect(dbRow!.title).toBe(payload.title);
    expect(dbRow!.description).toBe(payload.description);
    expect(dbRow!.category).toBe(payload.category);
    expect(dbRow!.completed).toBe(false);
    expect(dbRow!.user_id).toBe(user.id);
    expect(dbRow!.deleted_at).toBeNull();

    // API response must also match the DB row (no transformation in between)
    expect(apiNote.title).toBe(dbRow!.title);
    expect(apiNote.description).toBe(dbRow!.description);
    expect(apiNote.category).toBe(dbRow!.category);
    expect(apiNote.completed).toBe(dbRow!.completed);
    expect(apiNote.user_id).toBe(dbRow!.user_id);
  });

  test('DB contains exactly one row after a single POST /notes', async ({ request }) => {
    const user = await seedUser();
    const payload = generatePostgRestNotePayload(user.id);

    await request.post(`${config.postgreStUrl}/notes`, {
      data: payload,
      headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
    });

    const result = await queryOne<{ count: string }>('SELECT COUNT(*)::text AS count FROM notes WHERE user_id = $1', [user.id]);
    expect(parseInt(result!.count, 10)).toBe(1);
  });
});
