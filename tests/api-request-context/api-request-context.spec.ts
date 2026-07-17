import { test, expect } from '../../fixtures/index';
import { scanWcag } from '../../utilities/accessibility';

// JIRA: https://orhunakkan.atlassian.net/browse/TAB1-24 — API Request Context
// Gap #7 (database/external state setup): request fixture for seed/cleanup without UI

const PAGE_URL = '/practice/api-request-context';
const TASKS_ENDPOINT = '/api/tasks';

// Data-driven table for negative POST cases (Phase 4b)
const invalidPostBodies = [
  { data: {}, label: 'missing title field' },
  { data: { title: '' }, label: 'empty title string' },
  { data: { notATitle: 'foo' }, label: 'wrong field name' },
];

test.describe('API Request Context', () => {
  // AC-1 (TAB1-24): Tests use the `request` fixture to call GET /api/tasks and assert the
  // response status is 200 and the body is a non-empty array
  test.describe('AC-1 — GET /api/tasks returns 200 and task array', () => {
    test('positive: status is 200 and body is an array', async ({ request }) => {
      const response = await request.get(TASKS_ENDPOINT);
      expect(response.status()).toBe(200);
      expect(Array.isArray(await response.json())).toBe(true);
    });

    test('positive: response body items conform to expected shape { id, title }', async ({ request }) => {
      const response = await request.get(TASKS_ENDPOINT);
      const body = (await response.json()) as Array<unknown>;
      for (const task of body) {
        expect(task).toMatchObject({
          id: expect.any(Number),
          title: expect.any(String),
        });
      }
    });

    test('negative: 200 status is returned regardless of whether tasks exist', async ({ request }) => {
      const response = await request.get(TASKS_ENDPOINT);
      expect(response.status()).toBe(200);
      expect(Array.isArray(await response.json())).toBe(true);
    });
  });

  // AC-2 (TAB1-24): Tests use `request.post()` in a `beforeEach` hook to create a known
  // task before the UI test navigates, guaranteeing predictable seed data
  test.describe('AC-2 — request.post() in beforeEach seeds predictable task data', () => {
    let seededTaskId = 0;
    const SEED_TITLE = 'AC2 seed — predictable data fixture';

    test.beforeEach(async ({ request }) => {
      const res = await request.post(TASKS_ENDPOINT, { data: { title: SEED_TITLE } });
      expect(res.status()).toBe(201);
      const body = await res.json();
      seededTaskId = body.id;
    });

    test.afterEach(async ({ request }) => {
      if (seededTaskId > 0) {
        await request.delete(`${TASKS_ENDPOINT}/${seededTaskId}`);
        seededTaskId = 0;
      }
    });

    test('positive: seeded task is visible in the task list UI after page load', async ({ page, apiRequestContextPage }) => {
      await page.goto(PAGE_URL);
      // .first() — parallel browser workers each seed the same title; all instances are valid
      await expect(apiRequestContextPage.taskItems.filter({ hasText: SEED_TITLE }).first()).toBeVisible();
    });

    test('negative: POST with missing title returns 4xx', async ({ request }) => {
      const res = await request.post(TASKS_ENDPOINT, { data: {} });
      expect(res.status()).toBeGreaterThanOrEqual(400);
      expect(res.status()).toBeLessThan(500);
    });
  });

  // AC-3 (TAB1-24): Tests use `request.delete()` in an `afterEach` hook to remove created
  // tasks, keeping server state clean between test runs
  test.describe('AC-3 — request.delete() in afterEach keeps server state clean', () => {
    let createdTaskId = 0;

    test.beforeEach(async ({ request }) => {
      const res = await request.post(TASKS_ENDPOINT, { data: { title: 'AC3 cleanup verification task' } });
      const body = await res.json();
      createdTaskId = body.id;
    });

    test.afterEach(async ({ request }) => {
      if (createdTaskId > 0) {
        const res = await request.delete(`${TASKS_ENDPOINT}/${createdTaskId}`);
        expect([200, 204]).toContain(res.status());
        createdTaskId = 0;
      }
    });

    test('positive: DELETE returns 200/204 and task is absent from subsequent GET', async ({ request }) => {
      const deleteRes = await request.delete(`${TASKS_ENDPOINT}/${createdTaskId}`);
      expect([200, 204]).toContain(deleteRes.status());
      const deletedId = createdTaskId;
      createdTaskId = 0;

      const getRes = await request.get(TASKS_ENDPOINT);
      const tasks = (await getRes.json()) as Array<{ id: number }>;
      expect(tasks.find((t) => t.id === deletedId)).toBeUndefined();
    });

    test('negative: DELETE with non-existent id returns 404', async ({ request }) => {
      const res = await request.delete(`${TASKS_ENDPOINT}/999999`);
      expect(res.status()).toBe(404);
    });
  });

  // AC-4 (TAB1-24): Tests write a browser-free test using only the `request` fixture to
  // create, update (PUT), and delete a task, verifying each step through response status and body
  test.describe('AC-4 — browser-free full CRUD lifecycle via request fixture', () => {
    test('positive: create → update → delete verifies the full lifecycle without a browser', async ({ request }) => {
      const createRes = await request.post(TASKS_ENDPOINT, {
        data: { title: 'AC4 browser-free lifecycle task' },
      });
      expect(createRes.status()).toBe(201);
      const created = await createRes.json();
      expect(created).toMatchObject({ id: expect.any(Number), title: 'AC4 browser-free lifecycle task' });

      const updateRes = await request.put(`${TASKS_ENDPOINT}/${created.id}`, {
        data: { title: 'AC4 updated title', done: true },
      });
      expect(updateRes.status()).toBe(200);
      const updated = await updateRes.json();
      expect(updated).toMatchObject({ id: created.id, title: 'AC4 updated title', done: true });

      const deleteRes = await request.delete(`${TASKS_ENDPOINT}/${created.id}`);
      expect([200, 204]).toContain(deleteRes.status());

      const listRes = await request.get(TASKS_ENDPOINT);
      const tasks = (await listRes.json()) as Array<{ id: number }>;
      expect(tasks.find((t) => t.id === created.id)).toBeUndefined();
    });

    test('negative: PUT to non-existent task id returns 404', async ({ request }) => {
      const res = await request.put(`${TASKS_ENDPOINT}/999999`, { data: { title: 'ghost update' } });
      expect(res.status()).toBe(404);
    });

    test('boundary: PUT with empty title returns 4xx', async ({ request }) => {
      const createRes = await request.post(TASKS_ENDPOINT, { data: { title: 'AC4 boundary PUT title' } });
      const created = await createRes.json();

      const updateRes = await request.put(`${TASKS_ENDPOINT}/${created.id}`, { data: { title: '' } });
      expect(updateRes.status()).toBeGreaterThanOrEqual(400);

      await request.delete(`${TASKS_ENDPOINT}/${created.id}`);
    });
  });

  // AC-5 (TAB1-24): Tests assert the full API contract: each operation returns the expected
  // HTTP status code and the response body matches the expected shape
  test.describe('AC-5 — full API contract: status codes and response body shape', () => {
    test('positive: POST returns 201 with body shape { id, title }', async ({ request }) => {
      const res = await request.post(TASKS_ENDPOINT, { data: { title: 'AC5 contract shape' } });
      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body).toMatchObject({ id: expect.any(Number), title: 'AC5 contract shape' });
      await request.delete(`${TASKS_ENDPOINT}/${body.id}`);
    });

    test('positive: PUT returns 200 with updated body shape', async ({ request }) => {
      const createRes = await request.post(TASKS_ENDPOINT, { data: { title: 'AC5 PUT shape' } });
      const created = await createRes.json();

      const putRes = await request.put(`${TASKS_ENDPOINT}/${created.id}`, { data: { done: true } });
      expect(putRes.status()).toBe(200);
      const updated = await putRes.json();
      expect(updated).toMatchObject({ id: created.id, done: true });

      await request.delete(`${TASKS_ENDPOINT}/${created.id}`);
    });

    for (const { data, label } of invalidPostBodies) {
      test(`negative: POST with ${label} returns 4xx`, async ({ request }) => {
        const res = await request.post(TASKS_ENDPOINT, { data });
        expect(res.status()).toBeGreaterThanOrEqual(400);
        expect(res.status()).toBeLessThan(500);
      });
    }

    test('negative: POST with extra unknown field does not return 500', async ({ request }) => {
      const res = await request.post(TASKS_ENDPOINT, {
        data: { title: 'AC5 extra field', unknownField: 'ignored' },
      });
      expect(res.status()).not.toBe(500);
      if (res.status() === 201) {
        const body = await res.json();
        await request.delete(`${TASKS_ENDPOINT}/${body.id}`);
      }
    });
  });

  // Accessibility — axe-core, page load state
  test.describe('accessibility (WCAG 2.x, axe)', () => {
    test('no violations on initial page load', async ({ page }) => {
      await page.goto(PAGE_URL);
      const results = await scanWcag(page);
      expect(results.violations).toEqual([]);
    });
  });

  // Performance @performance
  test.describe('performance @performance', () => {
    test('initial load is within budget', async ({ page }) => {
      await page.goto(PAGE_URL);
      const timing = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return { domContentLoaded: nav.domContentLoadedEventEnd, load: nav.loadEventEnd };
      });
      // Budgets are intentionally generous against a live site — tighten in a controlled env.
      expect(timing.domContentLoaded).toBeLessThan(6000);
      expect(timing.load).toBeLessThan(12000);
    });
  });
});
