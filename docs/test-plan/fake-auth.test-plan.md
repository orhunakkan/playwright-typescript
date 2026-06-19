# Test Plan — Fake Auth (TAB1-21)

| Field      | Value                                                      |
| ---------- | ---------------------------------------------------------- |
| JIRA Story | [TAB1-21](https://orhunakkan.atlassian.net/browse/TAB1-21) |
| Lab URL    | https://stagecraftlabs.com/practice/fake-auth              |
| Spec file  | tests/fake-auth/fake-auth.spec.ts                          |
| POM file   | pages/fake-auth.page.ts                                    |
| Generated  | 2026-06-19                                                 |

---

## 1. Scope

**In scope:**

- Login form submission with invalid credentials (inline error assertion via role/text)
- Login form submission with valid credentials and dashboard URL assertion (`toHaveURL`)
- Unauthenticated direct navigation to protected dashboard URL (redirect enforcement)
- Full logout flow and post-logout dashboard access enforcement
- `context.storageState()` session serialization and pre-authenticated test start
- Accessibility scanning: login page load state, error state, dashboard state
- Performance budget: initial page load

**Out of scope:**

- Password reset / forgot-password flows
- Account creation / registration
- Backend session expiry / server-side token invalidation
- Load testing or concurrent session handling
- i18n / locale variants of error messages

---

## 2. Test Types

| Type                  | Applied                              |
| --------------------- | ------------------------------------ |
| Functional (positive) | ✅                                   |
| Functional (negative) | ✅                                   |
| Boundary value        | ✅                                   |
| Data-driven           | ✅ (invalid credential sets)         |
| Accessibility (axe)   | ✅ (load + error + dashboard states) |
| Non-functional (perf) | ✅ (Navigation Timing budget)        |
| Cross-browser         | ✅ (4 browsers)                      |
| Mobile / responsive   | ❌ (out of scope)                    |

---

## 3. Environments & Data

| Field         | Value                                                                         |
| ------------- | ----------------------------------------------------------------------------- |
| Target env    | Staging (stagecraftlabs.com)                                                  |
| BASE_URL      | `https://stagecraftlabs.com` (`.env`)                                         |
| Valid creds   | alice / password123 · bob / letmein                                           |
| Invalid creds | wrong / badpass · alice / wrongpass · wronguser / password123 · empty / empty |
| Auth state    | Serialized via `context.storageState()` to `fixtures/auth/fake-auth.json`     |
| Test data     | Fixed tables (no faker needed — credentials are prescribed by the lab)        |

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

| Area / Requirement                       | Likelihood | Impact | Risk | Priority |
| ---------------------------------------- | ---------- | ------ | ---- | -------- |
| Invalid login shows inline error         | H          | H      | H    | P1       |
| Valid login redirects to dashboard       | H          | H      | H    | P1       |
| Protected route enforces auth redirect   | H          | H      | H    | P1       |
| Logout clears session + blocks dashboard | M          | H      | H    | P1       |
| storageState serialization & restore     | M          | H      | H    | P1       |
| Error message uses role/text (not CSS)   | M          | M      | M    | P2       |
| Empty credentials edge case              | L          | M      | L    | P2       |
| Post-logout dashboard URL is blocked     | M          | H      | H    | P2       |
| Accessibility — error state              | M          | M      | M    | P2       |
| Accessibility — dashboard state          | L          | M      | L    | P2       |
| Performance budget                       | L          | L      | L    | P2       |

---

## 6. Entry Criteria

- [ ] Requirements extracted and prioritized (✅ Step 1 done)
- [ ] App URL reachable: `https://stagecraftlabs.com/practice/fake-auth`
- [ ] `BASE_URL` configured in `.env` (✅)
- [ ] POM exists: `pages/fake-auth.page.ts` (generated in Step 3)

---

## 7. Exit Criteria

- [ ] 100% of P1 + P2 requirements have passing automated cases
- [ ] 0 open non-flaky defects of severity ≥ High linked to TAB1-21
- [ ] Accessibility: 0 critical/serious violations (or tracked with a defect id) in all three states
- [ ] Green across all 4 configured browsers in CI
- [ ] RTM generated and up to date: `docs/rtm/fake-auth.rtm.md`

---

## 8. Deliverables

| Artifact        | Path                                  | Status               |
| --------------- | ------------------------------------- | -------------------- |
| Test Plan       | docs/test-plan/fake-auth.test-plan.md | ✅ done              |
| POM             | pages/fake-auth.page.ts               | pending              |
| Spec file       | tests/fake-auth/fake-auth.spec.ts     | pending              |
| Auth state file | fixtures/auth/fake-auth.json          | generated at runtime |
| RTM             | docs/rtm/fake-auth.rtm.md             | pending              |
| CI run          | GitHub Actions                        | pending              |

---

## 9. Schedule / Effort (lightweight)

```
requirements → test plan → POM (locator-mapper) → spec (test-case-generator)
  → run (Playwright CLI) → triage → RTM → In Review → CI → Done
```
