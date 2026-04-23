import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { faker } from '@faker-js/faker';
import { truncateAll, seedUser, queryMany, queryRaw } from '../../utilities/db-client.js';
import type { UserRow, NoteRow } from '../../fixtures/db-payloads/db-types.js';

test.describe.configure({ mode: 'serial' });

test.describe('DB Constraints — unique, not-null, and check enforcement', () => {
  test.beforeEach(async () => {
    await allure.feature('DB Constraints');
    await allure.story('Unique + Not-Null + Check Enforcement');
    await allure.severity('critical');
    await truncateAll();
  });

  test('duplicate email → unique violation (23505), DB contains only one user row', async () => {
    const name = faker.person.fullName();
    const email = faker.internet.email().toLowerCase();

    await queryRaw('INSERT INTO users (name, email) VALUES ($1, $2)', [name, email]);

    let pgCode: string | undefined;
    try {
      await queryRaw('INSERT INTO users (name, email) VALUES ($1, $2)', [name, email]);
    } catch (err: any) {
      pgCode = err.code;
    }

    expect(pgCode).toBe('23505');

    const rows = await queryMany<UserRow>('SELECT * FROM users WHERE email = $1', [email]);
    expect(rows).toHaveLength(1);
  });

  test('null title → not-null violation (23502), DB contains zero note rows', async () => {
    const user = await seedUser();

    let pgCode: string | undefined;
    try {
      await queryRaw('INSERT INTO notes (title, category, user_id) VALUES (NULL, $1, $2)', ['Work', user.id]);
    } catch (err: any) {
      pgCode = err.code;
    }

    expect(pgCode).toBe('23502');

    const rows = await queryMany<NoteRow>('SELECT * FROM notes WHERE user_id = $1', [user.id]);
    expect(rows).toHaveLength(0);
  });

  test('invalid category value → check violation (23514), DB contains zero note rows', async () => {
    const user = await seedUser();

    let pgCode: string | undefined;
    try {
      await queryRaw('INSERT INTO notes (title, category, user_id) VALUES ($1, $2, $3)', ['Test note', 'InvalidCategory', user.id]);
    } catch (err: any) {
      pgCode = err.code;
    }

    expect(pgCode).toBe('23514');

    const rows = await queryMany<NoteRow>('SELECT * FROM notes WHERE user_id = $1', [user.id]);
    expect(rows).toHaveLength(0);
  });
});
