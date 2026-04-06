import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { config } from '../../config/env.js';
import { truncateAll, seedUser, queryOne, queryMany } from '../../utilities/db-client.js';
import { xssNotePayload } from '../../fixtures/db-payloads/db-payload-generators.js';
import type { NoteRow, PostgRestNoteRow } from '../../fixtures/db-payloads/db-types.js';

// Security assertions in this file:
//   XSS payload   — stored as a literal string, not executed
//   SQL injection  — parameterised queries prevent interpretation; table survives
// Both PostgREST (prepared statements) and pg (parameterised queries) protect against SQLi.

test.describe.configure({ mode: 'serial' });

test.describe('DB Sanitization — XSS and SQL injection stored as plain text', () => {
  test.beforeEach(async () => {
    await allure.feature('DB Security');
    await allure.story('XSS and SQLi Stored as Plain Text');
    await allure.severity('critical');
    await truncateAll();
  });

  test('XSS script tag is stored verbatim in DB and returned unchanged by API', async ({ request }) => {
    const user = await seedUser();
    const payload = xssNotePayload(user.id);

    const response = await request.post(`${config.postgreStUrl}/notes`, {
      data: payload,
      headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
    });
    expect(response.status()).toBe(201);

    const [apiNote] = (await response.json()) as PostgRestNoteRow[];

    // DB must store the raw string — no HTML encoding or stripping
    const dbRow = await queryOne<NoteRow>('SELECT * FROM notes WHERE id = $1', [apiNote.id]);
    expect(dbRow!.title).toBe('<script>alert("xss")</script>');

    // API must return the same raw string (no double-encoding at the HTTP layer)
    expect(apiNote.title).toBe('<script>alert("xss")</script>');
  });

  test('SQL injection in description is stored as a literal string', async ({ request }) => {
    const user = await seedUser();
    const payload = xssNotePayload(user.id);

    const response = await request.post(`${config.postgreStUrl}/notes`, {
      data: payload,
      headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
    });
    expect(response.status()).toBe(201);

    const [apiNote] = (await response.json()) as PostgRestNoteRow[];
    const dbRow = await queryOne<NoteRow>('SELECT * FROM notes WHERE id = $1', [apiNote.id]);

    // The SQL injection string must be stored verbatim — not executed
    expect(dbRow!.description).toBe("'; DROP TABLE notes; --");
  });

  test('notes table still exists and is queryable after SQL injection attempt', async ({ request }) => {
    const user = await seedUser();
    await request.post(`${config.postgreStUrl}/notes`, {
      data: xssNotePayload(user.id),
      headers: { 'Content-Type': 'application/json' },
    });

    // If the DROP TABLE had executed, this query would throw
    const rows = await queryMany<NoteRow>('SELECT * FROM notes');
    expect(rows.length).toBeGreaterThanOrEqual(1);
  });
});
