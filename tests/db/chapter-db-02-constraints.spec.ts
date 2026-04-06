import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { config } from '../../config/env.js';
import { truncateAll, seedUser, queryMany } from '../../utilities/db-client.js';
import { generateDbUserPayload, generatePostgRestNotePayload } from '../../fixtures/db-payloads/db-payload-generators.js';
import type { UserRow, NoteRow } from '../../fixtures/db-payloads/db-types.js';

// PostgREST error mappings used in this file:
//   Unique constraint violation  → 409 Conflict
//   NOT NULL constraint violation → 400 Bad Request
//   CHECK constraint violation   → 400 Bad Request

test.describe.configure({ mode: 'serial' });

test.describe('DB Constraints — unique, not-null, and check enforcement', () => {
  test.beforeEach(async () => {
    await allure.feature('DB Constraints');
    await allure.story('Unique + Not-Null + Check Enforcement');
    await allure.severity('critical');
    await truncateAll();
  });

  test('duplicate email → 409, DB contains only one user row', async ({ request }) => {
    const payload = generateDbUserPayload();

    const first = await request.post(`${config.postgreStUrl}/users`, {
      data: payload,
      headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
    });
    expect(first.status()).toBe(201);

    // Attempt to insert the same email again
    const second = await request.post(`${config.postgreStUrl}/users`, {
      data: payload,
      headers: { 'Content-Type': 'application/json' },
    });
    expect(second.status()).toBe(409);

    // The DB must still hold exactly one row for this email
    const rows = await queryMany<UserRow>('SELECT * FROM users WHERE email = $1', [payload.email]);
    expect(rows).toHaveLength(1);
  });

  test('null title → 400, DB contains zero note rows', async ({ request }) => {
    const user = await seedUser();

    // Omit the required `title` field
    const response = await request.post(`${config.postgreStUrl}/notes`, {
      data: { description: 'no title', category: 'Work', user_id: user.id },
      headers: { 'Content-Type': 'application/json' },
    });
    expect(response.status()).toBe(400);

    // No partial row should have been written
    const rows = await queryMany<NoteRow>('SELECT * FROM notes WHERE user_id = $1', [user.id]);
    expect(rows).toHaveLength(0);
  });

  test('invalid category value → 400, DB contains zero note rows', async ({ request }) => {
    const user = await seedUser();
    const payload = { ...generatePostgRestNotePayload(user.id), category: 'InvalidCategory' };

    const response = await request.post(`${config.postgreStUrl}/notes`, {
      data: payload,
      headers: { 'Content-Type': 'application/json' },
    });
    expect(response.status()).toBe(400);

    const rows = await queryMany<NoteRow>('SELECT * FROM notes WHERE user_id = $1', [user.id]);
    expect(rows).toHaveLength(0);
  });
});
