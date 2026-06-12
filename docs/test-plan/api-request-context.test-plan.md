# Test Plan — API Request Context (TAB1-24)

## 1. Scope

**In scope:**

- Playwright `request` fixture (`APIRequestContext`) for GET, POST, PUT, DELETE on `/api/tasks`
- `beforeEach` / `afterEach` hook patterns using API calls for data seed and cleanup
- Browser-free (API-only) test pattern — no `page.goto()` required
- Full API contract validation: HTTP status codes + response body shape
- UI verification: seeded tasks appear correctly in the task list
- Accessibility (axe-core) on page load
- Performance budget on page load

**Out of scope:**

- Backend internals / database layer
- Authentication / JWT token management (endpoints are public on the practice server)
- Pagination or large-dataset performance
- i18n / locale handling
- Mobile-specific gestures (API tests are layout-independent)

---

## 2. Test Types

| Type                                                      | Applied |
| --------------------------------------------------------- | ------- |
| Functional — positive / negative / boundary / data-driven | ✅      |
| API contract (status codes + response body shape)         | ✅      |
| Accessibility — axe-core, page-load state                 | ✅      |
| Non-functional — performance budget                       | ✅      |
| Cross-browser                                             | ✅      |

---

## 3. Environments & Data

| Environment | BASE_URL                       | Source     |
| ----------- | ------------------------------ | ---------- |
| dev         | https://stagecraftlabs.com     | `.env`     |
| qa          | https://qa-stagecraftlabs.com  | `.env.qa`  |
| uat         | https://uat-stagecraftlabs.com | `.env.uat` |

Switch environments with `ENV=qa npx playwright test ...`.

**Test data strategy:**

- Valid task titles: fixed descriptive strings (e.g. `'AC2 seed — predictable data fixture'`)
- Invalid POST bodies: typed case table — `{}` / `{ title: '' }` / `{ notATitle: 'foo' }`
- Boundary: `{ title: '' }` on PUT; non-existent id `999999` for PUT/DELETE

**Auth:** none required — all `/api/tasks` endpoints are public on the practice server.

---

## 4. Browser / Device Matrix

_(from `playwright.config.ts` `projects[]`)_

| Project         | Device          |
| --------------- | --------------- |
| Desktop Chrome  | Desktop Chrome  |
| Desktop Firefox | Desktop Firefox |
| Desktop Edge    | Desktop Edge    |
| Desktop Safari  | Desktop Safari  |

---

## 5. Risk Assessment & Priority

| Area / Requirement                            | Likelihood | Impact | Risk | Priority |
| --------------------------------------------- | ---------- | ------ | ---- | -------- |
| GET /api/tasks → 200 + array                  | L          | H      | M    | P1       |
| POST seeds task in beforeEach                 | L          | H      | M    | P1       |
| DELETE cleans up in afterEach                 | L          | H      | M    | P1       |
| Browser-free CRUD lifecycle (POST→PUT→DELETE) | M          | H      | H    | P1       |
| Full API contract (status + body shape)       | M          | H      | H    | P1       |
| POST invalid body → 4xx                       | M          | H      | H    | P2       |
| DELETE non-existent id → 404                  | L          | M      | L    | P2       |
| PUT non-existent id → 404                     | L          | M      | L    | P2       |
| PUT empty title → 4xx                         | M          | M      | M    | P2       |
| POST extra unknown field → no 500             | L          | M      | L    | P2       |
| Accessibility (axe, page load)                | L          | M      | M    | P2       |
| Performance budget (page load)                | L          | L      | L    | P3       |

---

## 6. Entry Criteria

- Requirements extracted and prioritized (requirement-extractor done)
- POM exists: `pages/api-request-context.page.ts`
- App URL reachable; `BASE_URL` configured in `.env`
- API endpoints confirmed accessible at `BASE_URL/api/tasks`
- `@axe-core/playwright` and `@faker-js/faker` present in `package.json`

---

## 7. Exit Criteria

- 100% of P1 + P2 requirements have passing automated cases
- 0 open non-flaky defects of severity ≥ High linked to TAB1-24
- Accessibility: 0 critical/serious axe violations on page load
- Tests green across all 4 browser projects in CI
- RTM generated and up to date: `docs/rtm/api-request-context.rtm.md`

---

## 8. Deliverables

| Artifact          | Path                                                    |
| ----------------- | ------------------------------------------------------- |
| Spec file         | `tests/api-request-context/api-request-context.spec.ts` |
| Page Object Model | `pages/api-request-context.page.ts`                     |
| RTM               | `docs/rtm/api-request-context.rtm.md`                   |
| Test Plan         | `docs/test-plan/api-request-context.test-plan.md`       |
| CI run            | GitHub Actions                                          |

---

## 9. Schedule / Effort

requirements → plan → POM → spec → run → triage → RTM → In Review → CI → Done
