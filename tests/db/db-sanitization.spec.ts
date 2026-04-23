import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { truncateAll, seedUser, queryOne, queryMany, queryRaw } from '../../utilities/db-client.js';
import type { NoteRow } from '../../fixtures/db-payloads/db-types.js';

test.describe.configure({ mode: 'serial' });

test.describe('DB Sanitization — XSS and SQL injection stored as plain text', () => {
  test.beforeEach(async () => {
    await allure.feature('DB Security');
    await allure.story('XSS and SQLi Stored as Plain Text');
    await allure.severity('critical');
    await truncateAll();
  });

  test('XSS script tag is stored verbatim via parameterized query', async () => {
    const user = await seedUser();
    const xssTitle = '<script>alert("xss")</script>';

    const result = await queryRaw('INSERT INTO notes (title, category, user_id) VALUES ($1, $2, $3) RETURNING id', [xssTitle, 'Work', user.id]);
    const insertedId = result.rows[0].id;

    const dbRow = await queryOne<NoteRow>('SELECT * FROM notes WHERE id = $1', [insertedId]);
    expect(dbRow!.title).toBe(xssTitle);
  });

  test('SQL injection in description is stored as a literal string', async () => {
    const user = await seedUser();
    const sqliDescription = "'; DROP TABLE notes; --";

    const result = await queryRaw('INSERT INTO notes (title, description, category, user_id) VALUES ($1, $2, $3, $4) RETURNING id', ['Test note', sqliDescription, 'Personal', user.id]);
    const insertedId = result.rows[0].id;

    const dbRow = await queryOne<NoteRow>('SELECT * FROM notes WHERE id = $1', [insertedId]);
    expect(dbRow!.description).toBe(sqliDescription);
  });

  test('notes table still exists and is queryable after SQL injection attempt', async () => {
    const user = await seedUser();

    await queryRaw('INSERT INTO notes (title, description, category, user_id) VALUES ($1, $2, $3, $4)', ['Test note', "'; DROP TABLE notes; --", 'Home', user.id]);

    const rows = await queryMany<NoteRow>('SELECT * FROM notes');
    expect(rows.length).toBeGreaterThanOrEqual(1);
  });
});
