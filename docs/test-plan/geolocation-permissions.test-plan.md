# Test Plan — Geolocation & Permissions (TAB1-32)

| Field      | Value                                                               |
| ---------- | -------------------------------------------------------------------- |
| JIRA Story | [TAB1-32](https://orhunakkan.atlassian.net/browse/TAB1-32)          |
| Lab URL    | https://stagecraftlabs.com/practice/geolocation-permissions          |
| Spec file  | tests/geolocation-permissions/geolocation-permissions.spec.ts        |
| POM file   | pages/geolocation-permissions.page.ts                                |
| Generated  | 2026-07-13                                                            |

---

## 1. Scope

**In scope:**

- `context.grantPermissions(["geolocation"])` + `context.setGeolocation({ latitude, longitude })` before clicking "Find Cafés Near Me"; asserting the café list renders asynchronously
- Default-blocked geolocation (no grant) — asserting the `role="alert"` error message appears
- `context.grantPermissions(["clipboard-read", "clipboard-write"])` combined grant before clipboard panel interaction
- "Copy Share Link" → success status message → "Paste" → pasted URL visible in the read-only input
- `context.clearPermissions()` after each permission-sensitive test to prevent grant leakage across tests
- Accessibility scanning across load / error (blocked permission) / success (café results, clipboard success) states
- Performance budget on initial page load

**Out of scope:**

- Real device GPS hardware behavior (Playwright's `setGeolocation` is a browser-level mock, not hardware)
- Actual OS clipboard integration beyond what Playwright's CDP-backed clipboard permissions expose
- Permission prompt UI chrome itself (Playwright bypasses the native prompt via `grantPermissions`)
- Other permission types not covered by this lab (camera, microphone, notifications)

---

## 2. Test Types

| Type                  | Applied                                                |
| ---------------------- | ------------------------------------------------------- |
| Functional (positive)  | ✅                                                      |
| Functional (negative)  | ✅                                                      |
| Boundary value         | ✅ (coordinate extremes, permission scope combinations)  |
| Data-driven            | ✅ (coordinate sets for boundary cases)                  |
| Accessibility (axe)    | ✅ (load + error + success states)                       |
| Non-functional (perf)  | ✅ (Navigation Timing budget)                            |
| Cross-browser          | ✅ (4 browsers)                                          |
| Mobile / responsive    | ❌ (out of scope)                                        |

---

## 3. Environments & Data

| Field         | Value                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------ |
| Target env    | Staging (stagecraftlabs.com)                                                              |
| BASE_URL      | `https://stagecraftlabs.com` (`.env`)                                                     |
| Permissions   | `geolocation`, `clipboard-read`, `clipboard-write` — granted/cleared per-context via CDP  |
| Geolocation   | Mocked coordinates via `context.setGeolocation({ latitude, longitude })`                  |
| Test data     | Fixed representative coordinates + boundary coordinate pairs (no faker — lat/long need to resolve to plausible café results) |

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

| Area / Requirement                                                          | Likelihood | Impact | Risk | Priority |
| ------------------------------------------------------------------------------ | ---------- | ------ | ---- | -------- |
| Granted geolocation + coordinates → café list renders asynchronously            | H          | H      | H    | P1       |
| Blocked geolocation (default) → `role="alert"` error appears                    | H          | H      | H    | P1       |
| Combined clipboard-read + clipboard-write grant → clipboard panel usable        | H          | H      | H    | P1       |
| Copy Share Link → success message → Paste → pasted URL visible                  | H          | H      | H    | P1       |
| `clearPermissions()` prevents grant leakage across tests                        | M          | H      | H    | P1       |
| Boundary coordinates (poles, antimeridian, 0,0) don't crash the café search      | L          | M      | L    | P2       |
| Partial clipboard grant (read only) does not silently succeed on paste          | M          | M      | M    | P2       |
| Accessibility — load / error / success states                                   | L          | M      | L    | P2       |
| Performance budget                                                              | L          | L      | L    | P2       |

---

## 6. Entry Criteria

- [ ] Requirements extracted and prioritized (✅ Step 1 done)
- [ ] App URL reachable: `https://stagecraftlabs.com/practice/geolocation-permissions`
- [ ] `BASE_URL` configured in `.env` (✅)
- [ ] POM exists: `pages/geolocation-permissions.page.ts` (generated in Step 3)

---

## 7. Exit Criteria

- [ ] 100% of P1 + P2 requirements have passing automated cases
- [ ] 0 open non-flaky defects of severity ≥ High linked to TAB1-32
- [ ] Accessibility: 0 critical/serious violations (or tracked with a defect id) in all three states
- [ ] Green across all 4 configured browsers in CI
- [ ] RTM generated and up to date: `docs/rtm/geolocation-permissions.rtm.md`

---

## 8. Deliverables

| Artifact  | Path                                                            | Status               |
| ---------- | ----------------------------------------------------------------- | --------------------- |
| Test Plan | docs/test-plan/geolocation-permissions.test-plan.md                | ✅ done              |
| POM       | pages/geolocation-permissions.page.ts                               | pending               |
| Spec file | tests/geolocation-permissions/geolocation-permissions.spec.ts       | pending               |
| RTM       | docs/rtm/geolocation-permissions.rtm.md                             | pending               |
| CI run    | GitHub Actions                                                     | pending               |

---

## 9. Schedule / Effort (lightweight)

```
requirements → test plan → POM (locator-mapper) → spec (test-case-generator)
  → run (Playwright CLI) → triage → RTM → In Review → CI → Done
```
