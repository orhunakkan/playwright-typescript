# Test Plan — Init Scripts & Seeding (TAB1-40)

| Field      | Value                                                       |
| ---------- | ------------------------------------------------------------ |
| JIRA Story | [TAB1-40](https://orhunakkan.atlassian.net/browse/TAB1-40)  |
| Lab URL    | https://stagecraftlabs.com/practice/init-scripts             |
| Spec file  | tests/init-scripts/init-scripts.spec.ts                      |
| POM file   | pages/init-scripts.page.ts                                   |
| Generated  | 2026-07-14                                                    |

---

## 1. Scope

**In scope:**

- `page.addInitScript` injecting `window.__FLAGS__ = { betaFeature: true }` before navigation, gating the feature flag banner
- `page.addInitScript` stubbing `Math.random` to a fixed value, driving the deterministic Lucky Number widget
- `page.addInitScript` seeding `localStorage.setItem("onboarded", "true")` before navigation to suppress the onboarding modal
- `context.addInitScript` seeding localStorage once per context and confirming persistence to a second page opened from the same context
- Contrast case: a fresh page from a *different* context does not inherit another context's seed
- Ordering proof: seeding localStorage *after* `page.goto` does not retroactively suppress an already-rendered modal
- Accessibility scanning across load, seeded/suppressed, and control/modal-present states
- Performance budget on initial page load with init scripts attached

**Out of scope:**

- Non-init-script means of setting flags/storage (e.g. UI toggles) — this lab is scoped to `addInitScript` APIs only
- Cookie-based seeding (`context.addCookies`) — not exercised by this lab
- Server-side feature flag persistence / flag rollout logic
- Cross-session persistence beyond a single browser context lifetime

---

## 2. Test Types

| Type                  | Applied                                                    |
| --------------------- | ----------------------------------------------------------- |
| Functional (positive) | ✅                                                          |
| Functional (negative) | ✅                                                          |
| Boundary value        | ✅                                                          |
| Data-driven           | ❌ (fixed init-script payloads, not a data table)            |
| Accessibility (axe)   | ✅ (load + seeded/suppressed + control/modal-present states) |
| Non-functional (perf) | ✅ (Navigation Timing budget)                                |
| Cross-browser         | ✅ (4 browsers)                                              |
| Mobile / responsive   | ❌ (out of scope)                                            |

---

## 3. Environments & Data

| Field         | Value                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------ |
| Target env    | Staging (stagecraftlabs.com)                                                              |
| BASE_URL      | `https://stagecraftlabs.com` (`.env`)                                                      |
| Lab path      | `/practice/init-scripts`                                                                   |
| Init payloads | `window.__FLAGS__ = { betaFeature: true }`, `Math.random` stub → `0.42`, `localStorage.onboarded = "true"` |
| Test data     | Fixed literals prescribed by the lab (no faker — deterministic values are the point of the lab) |

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

| Area / Requirement                                                         | Likelihood | Impact | Risk | Priority |
| ---------------------------------------------------------------------------- | ---------- | ------ | ---- | -------- |
| `page.addInitScript` flag injection shows the beta banner                    | H          | H      | H    | P1       |
| Without the flag script, banner is absent (control)                          | M          | M      | M    | P2       |
| `Math.random` stub drives the Lucky Number widget to `42`                    | H          | H      | H    | P1       |
| Stub value stable across repeated reads in the same page                     | L          | M      | L    | P3       |
| `page.addInitScript` localStorage seed suppresses onboarding modal           | H          | H      | H    | P1       |
| Without the seed, onboarding modal is present (control)                      | H          | H      | H    | P1       |
| `onboarded="false"` does not suppress the modal (exact-match boundary)       | L          | M      | L    | P3       |
| `context.addInitScript` seed persists to a fresh page in the same context    | M          | H      | H    | P1       |
| A fresh page from a *different* context does not see the seed                | M          | H      | H    | P2       |
| Multiple pages from the same context all share the seeded state              | L          | M      | L    | P3       |
| Late localStorage seed (post-`goto`) does not suppress an already-rendered modal | H       | H      | H    | P1       |
| Accessibility — load / seeded / control states                               | L          | M      | L    | P2       |
| Performance budget                                                           | L          | L      | L    | P2       |

---

## 6. Entry Criteria

- [ ] Requirements extracted and prioritized (✅ Step 1 done)
- [ ] App URL reachable: `https://stagecraftlabs.com/practice/init-scripts`
- [ ] `BASE_URL` configured in `.env` (✅)
- [ ] POM exists: `pages/init-scripts.page.ts` (generated in Step 3)

---

## 7. Exit Criteria

- [ ] 100% of P1 + P2 requirements have passing automated cases
- [ ] 0 open non-flaky defects of severity ≥ High linked to TAB1-40
- [ ] Accessibility: 0 critical/serious violations (or tracked with a defect id) in all three states
- [ ] Green across all 4 configured browsers in CI
- [ ] RTM generated and up to date: `docs/rtm/init-scripts.rtm.md`

---

## 8. Deliverables

| Artifact   | Path                                     | Status               |
| ---------- | ------------------------------------------ | --------------------- |
| Test Plan  | docs/test-plan/init-scripts.test-plan.md  | ✅ done               |
| POM        | pages/init-scripts.page.ts                | pending               |
| Spec file  | tests/init-scripts/init-scripts.spec.ts   | pending               |
| RTM        | docs/rtm/init-scripts.rtm.md              | pending               |
| CI run     | GitHub Actions                             | pending               |

---

## 9. Schedule / Effort (lightweight)

```
requirements → test plan → POM (locator-mapper) → spec (test-case-generator)
  → run (Playwright CLI) → triage → RTM → In Review → CI → Done
```
