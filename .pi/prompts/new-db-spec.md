# Prompt: Create a New DB Spec

Use this template when asked to write direct SQL / database-layer tests. DB specs live in `tests/db/`, always call `truncateAll()` in `beforeEach`, and use the `db-client.ts` utility functions.

---

## Full Template

Replace every `<!-- REPLACE: ... -->` placeholder with real values.

```ts
import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';
import {
  truncateAll,
  seedUser,
  seedNote,
  queryOne,
  queryMany,
  queryRaw,
} from '../../utilities/db-client.js';
import type { UserRow, NoteRow } from '../../fixtures/db-payloads/db-types.js';

// Serial mode ensures tests share seeded data deterministically
// and don't interfere with each other's row counts.
test.describe.configure({ mode: 'serial' });

test.describe('DB <!-- REPLACE: Category --> — <!-- REPLACE: What is being verified -->', () => {
  test.beforeEach(async () => {
    await allure.feature('<!-- REPLACE: Allure feature, e.g. DB Soft Delete -->');
    await allure.story('<!-- REPLACE: Allure story label -->');
    await allure.severity('<!-- REPLACE: critical | normal | minor | trivial -->');
    // Always truncate before every test — guarantees a clean slate regardless of order.
    await truncateAll();
  });

  // ── Test: assert a row property immediately after INSERT ───────────────────
  test('<!-- REPLACE: describe what the row state should be after INSERT -->', async () => {
    // Arrange: seed the required rows
    const user = await seedUser();
    const note = await seedNote(user.id, {
      // Optional overrides — only specify what matters to this test
      // title: 'Specific title',
      // completed: true,
    });

    // Act: query the row back from the DB
    const dbRow = await queryOne<NoteRow>('SELECT * FROM notes WHERE id = $1', [note.id]);

    // Assert
    expect(dbRow).not.toBeNull();
    expect(dbRow!.<!-- REPLACE: column -->).<!-- REPLACE: matcher -->;
  });

  // ── Test: assert behaviour after an UPDATE ─────────────────────────────────
  test('<!-- REPLACE: describe what should change after UPDATE -->', async () => {
    // Arrange
    const user = await seedUser();
    const note = await seedNote(user.id);

    const before = await queryOne<NoteRow>('SELECT * FROM notes WHERE id = $1', [note.id]);

    // Optional: wait for the DB clock to advance (useful for timestamp comparisons)
    // await queryRaw('SELECT pg_sleep(1)');

    // Act: perform the UPDATE
    await queryRaw('UPDATE notes SET <!-- REPLACE: column --> = $1 WHERE id = $2', [
      '<!-- REPLACE: new value -->',
      note.id,
    ]);

    // Assert: read back and verify the change
    const after = await queryOne<NoteRow>('SELECT * FROM notes WHERE id = $1', [note.id]);

    expect(after!.<!-- REPLACE: column -->).<!-- REPLACE: matcher -->;
    // If testing updated_at advancement, also assert created_at is unchanged:
    // expect(after!.created_at.getTime()).toBe(before!.created_at.getTime());
  });

  // ── Test: assert COUNT / aggregate results ─────────────────────────────────
  test('<!-- REPLACE: describe the count or aggregate expectation -->', async () => {
    // Arrange: seed multiple rows
    const user = await seedUser();
    const noteCount = <!-- REPLACE: number of notes to seed -->;
    for (let i = 0; i < noteCount; i++) {
      await seedNote(user.id);
    }

    // Act: COUNT via queryRaw
    const result = await queryRaw(
      'SELECT COUNT(*) FROM notes WHERE user_id = $1',
      [user.id],
    );

    // Assert
    const count = parseInt(result.rows[0].count as string, 10);
    expect(count).toBe(noteCount);
  });

  // ── Test: assert CASCADE / constraint behaviour ────────────────────────────
  test('<!-- REPLACE: describe cascade or constraint -->', async () => {
    // Arrange
    const user = await seedUser();
    await seedNote(user.id);

    // Act: delete the parent row
    await queryRaw('DELETE FROM users WHERE id = $1', [user.id]);

    // Assert: child rows are also gone (CASCADE)
    const remainingNotes = await queryMany<NoteRow>(
      'SELECT * FROM notes WHERE user_id = $1',
      [user.id],
    );
    expect(remainingNotes).toHaveLength(0);
  });
});
```

---

## Rules to Follow

### Imports: Always Use `.js` Extension

DB specs use ES module resolution. All local imports in `tests/db/` must include the `.js` extension:

```ts
import { truncateAll } from '../../utilities/db-client.js';
import type { NoteRow } from '../../fixtures/db-payloads/db-types.js';
```

E2E and API spec imports do not need `.js` — this applies only to DB specs.

### `truncateAll()` in Every `beforeEach`

- Truncates `notes` and `users` tables with `RESTART IDENTITY CASCADE`.
- Notes are deleted first due to the foreign-key constraint, but CASCADE handles this in one statement.
- This is non-negotiable — even if a test appears self-contained, it must start from a clean DB.

### `pg_sleep` for Timestamp Tests

When testing that `updated_at` advances after an UPDATE, use `await queryRaw('SELECT pg_sleep(1)')` between the INSERT and UPDATE to force a measurable time difference. Without this, timestamps may be identical depending on DB clock precision.

### Available Utility Functions

| Function       | Signature                                                                                                 | Returns                   |
| -------------- | --------------------------------------------------------------------------------------------------------- | ------------------------- |
| `truncateAll`  | `()`                                                                                                      | `Promise<void>`           |
| `seedUser`     | `(overrides?: Partial<Omit<UserRow, 'id' \| 'created_at' \| 'updated_at'>>)`                              | `Promise<UserRow>`        |
| `seedNote`     | `(userId: string, overrides?: Partial<Omit<NoteRow, 'id' \| 'created_at' \| 'updated_at' \| 'user_id'>>)` | `Promise<NoteRow>`        |
| `queryOne<T>`  | `(sql: string, params?: unknown[])`                                                                       | `Promise<T \| null>`      |
| `queryMany<T>` | `(sql: string, params?: unknown[])`                                                                       | `Promise<T[]>`            |
| `queryRaw`     | `(sql: string, params?: unknown[])`                                                                       | `Promise<pg.QueryResult>` |
| `closePool`    | `()`                                                                                                      | `Promise<void>`           |

### Type Mapping (pg → TypeScript)

- `TIMESTAMPTZ` → `Date` (pg maps automatically — compare with `.getTime()`)
- `BOOLEAN` → `boolean`
- `TEXT` / `VARCHAR` → `string`
- `INTEGER` / `SERIAL` → `number`

### COUNT Queries

`COUNT(*)` returns a string in node-postgres, not a number. Always parse:

```ts
const count = parseInt(result.rows[0].count as string, 10);
```

### Seeding Overrides

Use `seedUser` and `seedNote` overrides to control only what is relevant to the test — leave everything else as faker defaults:

```ts
// Only fix the category — faker generates everything else
const note = await seedNote(user.id, { category: 'Work', completed: true });
```

---

## Verification

Run DB tests with a single worker (required — DB tests must not run in parallel):

```bash
npm run test:db
# or explicitly:
npx playwright test --project="DB Tests" --workers=1
```

Run a single DB spec file:

```bash
npx playwright test tests/db/<your-spec>.spec.ts --project="DB Tests" --workers=1
```
