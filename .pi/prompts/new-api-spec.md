# Prompt: Create a New API Spec

Use this template when asked to write tests for a REST API endpoint. API specs live in `tests/api/`, import from `@playwright/test` directly, and use the `request` fixture.

---

## Full Template

Replace every `<!-- REPLACE: ... -->` placeholder with real values.

```ts
import { test, expect } from '@playwright/test';
import { feature, story, severity } from 'allure-js-commons';
import { config } from '../../config/env';
import {
  contentTypeHeaders,
  getAuthHeaders,
  generateRegisterPayload,
  generateLoginPayload,
} from '../../fixtures/notes-api-payloads/shared-request-payloads';
// Import entity-specific payload generators if needed:
// import { generateNotePayload } from '../../fixtures/notes-api-payloads/notes-request-payloads';
import type { ApiResponse, <!-- REPLACE: ResponseDataType --> } from '../../fixtures/notes-api-payloads/api-types';
import {
  expectMatchesSchema,
  <!-- REPLACE: RelevantSchema -->,
  ErrorResponseSchema,
} from '../../utilities/api-schema-validator';

// Serial mode is required when tests share state (token, resource IDs, etc.)
test.describe.configure({ mode: 'serial' });

test.describe('<!-- REPLACE: Domain --> <!-- REPLACE: Feature --> API <!-- REPLACE: Happy Path | Error Cases -->', { tag: ['@critical'] }, () => {
  test.beforeEach(async () => {
    await feature('<!-- REPLACE: Allure feature label, e.g. Notes API -->');
    await story('<!-- REPLACE: Allure story label, e.g. Note Management – Happy Path -->');
    await severity('<!-- REPLACE: critical | normal | minor | trivial -->');
  });

  // ── Shared state threaded across serial tests ──────────────────────────────
  let authToken = '';
  let createdResourceId = '';

  const registerPayload = generateRegisterPayload();
  const loginPayload = generateLoginPayload(registerPayload.email, registerPayload.password);

  // ── URLs ───────────────────────────────────────────────────────────────────
  const baseUrl = config.apiUrl;
  const loginUrl = `${baseUrl}/users/login`;
  const <!-- REPLACE: resourceUrl --> = `${baseUrl}/<!-- REPLACE: endpoint-path -->`;

  // ── Setup: register + login to obtain a token ──────────────────────────────
  // Include this block only if the endpoints under test require authentication.
  test('should register and login to obtain auth token', async ({ request }) => {
    await request.post(`${baseUrl}/users/register`, {
      data: registerPayload,
      headers: contentTypeHeaders,
    });

    const loginResponse = await request.post(loginUrl, {
      data: loginPayload,
      headers: contentTypeHeaders,
    });

    const loginBody = (await loginResponse.json()) as ApiResponse<{ token: string }>;
    expect(loginResponse.status()).toBe(200);
    authToken = loginBody.data.token;
    expect(authToken).toBeTruthy();
  });

  // ── Happy path: create a resource ─────────────────────────────────────────
  test('should create a <!-- REPLACE: resource name --> successfully', async ({ request }) => {
    const response = await request.post(<!-- REPLACE: resourceUrl -->, {
      data: <!-- REPLACE: payload object or generator call -->,
      headers: getAuthHeaders(authToken),
    });

    const body = (await response.json()) as ApiResponse<<!-- REPLACE: ResponseDataType -->>;
    expect(response.status()).toBe(201);
    expect(body).toHaveProperty('success', true);
    expect(body).toHaveProperty('status', 201);
    expect(body).toHaveProperty('message', '<!-- REPLACE: expected success message -->');
    expect(body).toHaveProperty('data');
    expectMatchesSchema(body.data, <!-- REPLACE: RelevantSchema -->, 'create <!-- REPLACE: resource --> data');

    createdResourceId = body.data.id;
    expect(createdResourceId).toBeTruthy();
  });

  // ── Happy path: read a resource ────────────────────────────────────────────
  test('should get the <!-- REPLACE: resource name --> by ID', async ({ request }) => {
    const response = await request.get(`${<!-- REPLACE: resourceUrl -->}/${createdResourceId}`, {
      headers: getAuthHeaders(authToken),
    });

    const body = (await response.json()) as ApiResponse<<!-- REPLACE: ResponseDataType -->>;
    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('success', true);
    expectMatchesSchema(body.data, <!-- REPLACE: RelevantSchema -->, 'get <!-- REPLACE: resource --> data');
  });

  // ── Happy path: update a resource ──────────────────────────────────────────
  test('should update the <!-- REPLACE: resource name --> successfully', async ({ request }) => {
    const updatePayload = <!-- REPLACE: update payload object or generator call -->;

    const response = await request.patch(`${<!-- REPLACE: resourceUrl -->}/${createdResourceId}`, {
      data: updatePayload,
      headers: getAuthHeaders(authToken),
    });

    const body = (await response.json()) as ApiResponse<<!-- REPLACE: ResponseDataType -->>;
    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('success', true);
    expectMatchesSchema(body.data, <!-- REPLACE: RelevantSchema -->, 'update <!-- REPLACE: resource --> data');
  });

  // ── Happy path: delete a resource ──────────────────────────────────────────
  test('should delete the <!-- REPLACE: resource name --> successfully', async ({ request }) => {
    const response = await request.delete(`${<!-- REPLACE: resourceUrl -->}/${createdResourceId}`, {
      headers: getAuthHeaders(authToken),
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('success', true);
  });

  // ── Error: 401 on protected endpoint without token ─────────────────────────
  test('should return 401 when accessing without an auth token', async ({ request }) => {
    const response = await request.get(<!-- REPLACE: resourceUrl -->, {
      headers: contentTypeHeaders,
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expectMatchesSchema(body, ErrorResponseSchema, '401 error response');
    expect(body).toHaveProperty('success', false);
  });
});
```

---

## Rules to Follow

### Serial Mode

- Always add `test.describe.configure({ mode: 'serial' })` at the top — even for error-only specs, because the error tests often need a setup test (login, create resource) to run first.

### Auth Token Threading

- Declare `let authToken = ''` outside the tests (but inside `test.describe`).
- Assign it inside the login/setup test.
- Use `getAuthHeaders(authToken)` for all subsequent protected requests.
- This pattern mirrors the existing `notes-users-all-flow.spec.ts` and `notes-notes-all-flow.spec.ts`.

### Schema Validation

- Always call `expectMatchesSchema(body.data, SomeSchema, 'context label')` before asserting individual fields.
- This catches undocumented API additions (extra keys) and removals (missing keys).
- For list endpoints, use `expectArrayMatchesSchema(body.data, SomeSchema)`.

### Status Codes

- Assert `response.status()` explicitly on every test — not just `body.success`.
- Common codes: `200` (GET/PATCH/DELETE success), `201` (POST create), `400` (validation), `401` (unauthenticated), `404` (not found).

### Payload Generators

- Import from `fixtures/notes-api-payloads/` — never hardcode test data.
- Available generators: `generateRegisterPayload()`, `generateLoginPayload(email, pw)`, `generateUpdateProfilePayload(name)`, `generateNotePayload()` (check the relevant file for what exists).

---

## Verification

Run the spec against the API Tests project:

```bash
npx playwright test tests/api/<your-spec>.spec.ts --project="API Tests"
```
