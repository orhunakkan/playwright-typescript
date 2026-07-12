# Test Plan — Storage State (TAB1-23)

| Field      | Value                                                       |
| ---------- | ------------------------------------------------------------ |
| JIRA Story | [TAB1-23](https://orhunakkan.atlassian.net/browse/TAB1-23)  |
| Lab URL    | https://stagecraftlabs.com/practice/storage-state            |
| Spec file  | tests/storage-state/storage-state.spec.ts                    |
| POM file   | pages/storage-state.page.ts                                  |
| Generated  | 2026-07-12                                                    |

---

## 1. Scope

**In scope:**

- UI login as alice (admin) and `context.storageState({ path })` session serialization
- `browser.newContext({ storageState })` restoring a session without repeating UI login
- Two-role storage state files (admin, user) loaded into isolated parallel contexts, asserting role-specific UI (Admin panel visibility, role badge)
- `request` fixture (browser-free) authentication via `POST /api/auth/login`, capturing state with `request.storageState()`, and reusing that state in a real browser context
- Fresh, storage-state-less context showing the unauthenticated view (contrast case)
- Session persistence across a page reload within the same context
- Accessibility scanning: unauthenticated state, admin-authenticated state, user-authenticated state
- Performance budget: initial page load

**Out of scope:**

- Password reset / account creation flows (covered by other labs)
- Full login-form validation (covered by TAB1-21 Fake Auth)
- `context.addCookies` (mentioned as a covered API on the lab page, but the lab's guidance and challenge only exercise `storageState`/`newContext` — no UI affordance requires manual cookie injection)
- Storage state file expiry / rotation policies in a real CI pipeline
- Load testing or concurrent-session-at-scale handling

---

## 2. Test Types

| Type                  | Applied                                                    |
| --------------------- | ----------------------------------------------------------- |
| Functional (positive) | ✅                                                          |
| Functional (negative) | ✅                                                          |
| Boundary value        | ✅                                                          |
| Data-driven           | ❌ (fixed two-role credential set, not a data table)        |
| Accessibility (axe)   | ✅ (unauthenticated + admin + user states)                  |
| Non-functional (perf) | ✅ (Navigation Timing budget)                                |
| Cross-browser         | ✅ (4 browsers)                                              |
| Mobile / responsive   | ❌ (out of scope)                                            |

---

## 3. Environments & Data

| Field         | Value                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------ |
| Target env    | Staging (stagecraftlabs.com)                                                              |
| BASE_URL      | `https://stagecraftlabs.com` (`.env`)                                                      |
| Valid creds   | alice / password123 (admin) · bob / letmein (user)                                        |
| Login API     | `POST /api/auth/login` `{ username, password }` → 200 `{ id, username, displayName, role }` + session cookie, or 401 `{ error }` |
| Session check | `GET /api/auth/me` → 200 authenticated user, or 401 `{ error: "Not authenticated" }`       |
| Auth state    | Serialized via `context.storageState()` / `request.storageState()` to per-AC files under `fixtures/auth/` (kept isolated per describe block since `fullyParallel: true` can schedule blocks on different workers) |
| Test data     | Fixed credential pairs (no faker — credentials are prescribed by the lab)                  |

---

## 4. Browser / Device Matrix

| Browser         | Project name    |
| --------------- | --------------- |
| Desktop Chrome  | Desktop Chrome  |
| Desktop Firefox | Desktop Firefox |
| Desktop Edge    | Desktop Edge    |
| Desktop Safari  | Desktop Safari  |

_(Source: `playwright.config.ts` projects[])_

---

## 5. Risk Assessment & Priority

| Area / Requirement                                             | Likelihood | Impact | Risk | Priority |
| ---------------------------------------------------------------- | ---------- | ------ | ---- | -------- |
| UI login + `context.storageState()` writes a valid session file | H          | H      | H    | P1       |
| `browser.newContext({ storageState })` restores session, no login| H          | H      | H    | P1       |
| Two-role contexts show role-specific UI in isolation              | M          | H      | H    | P1       |
| Fresh/no-state context shows unauthenticated view                 | H          | H      | H    | P1       |
| Session persists across reload in the same context                | M          | M      | M    | P1       |
| `request` fixture auth + `request.storageState()` capture         | M          | M      | M    | P2       |
| Captured `request` state usable by a real browser context         | M          | M      | M    | P2       |
| Invalid credentials (UI and API) never produce a valid session    | M          | H      | H    | P2       |
| Loading a nonexistent storage state path fails predictably        | L          | M      | L    | P2       |
| Accessibility — unauthenticated / admin / user states             | L          | M      | L    | P2       |
| Performance budget                                                | L          | L      | L    | P2       |

---

## 6. Entry Criteria

- [ ] Requirements extracted and prioritized (✅ Step 1 done)
- [ ] App URL reachable: `https://stagecraftlabs.com/practice/storage-state`
- [ ] Login flow reachable: `https://stagecraftlabs.com/practice/fake-auth`
- [ ] `BASE_URL` configured in `.env` (✅)
- [ ] POM exists: `pages/storage-state.page.ts` (generated in Step 3)

---

## 7. Exit Criteria

- [ ] 100% of P1 + P2 requirements have passing automated cases
- [ ] 0 open non-flaky defects of severity ≥ High linked to TAB1-23
- [ ] Accessibility: 0 critical/serious violations (or tracked with a defect id) in all three states
- [ ] Green across all 4 configured browsers in CI
- [ ] RTM generated and up to date: `docs/rtm/storage-state.rtm.md`

---

## 8. Deliverables

| Artifact        | Path                                        | Status               |
| ---------------- | -------------------------------------------- | -------------------- |
| Test Plan        | docs/test-plan/storage-state.test-plan.md    | ✅ done              |
| POM              | pages/storage-state.page.ts                  | pending              |
| Spec file        | tests/storage-state/storage-state.spec.ts    | pending              |
| Auth state files | fixtures/auth/ss-*.json                      | generated at runtime |
| RTM              | docs/rtm/storage-state.rtm.md                | pending              |
| CI run           | GitHub Actions                               | pending              |

---

## 9. Schedule / Effort (lightweight)

```
requirements → test plan → POM (locator-mapper) → spec (test-case-generator)
  → run (Playwright CLI) → triage → RTM → In Review → CI → Done
```
