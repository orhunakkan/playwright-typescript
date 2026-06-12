---
name: playwright-test-case-generator
description: >
  Generates a complete Playwright spec file from a JIRA story's Acceptance Criteria and/or
  an existing Page Object Model. Use this skill whenever the user wants test cases written,
  wants a spec file generated, or says things like "generate tests for TAB1-XX", "write spec
  for Forms lab", "create test file from POM", or "turn ACs into tests". Accepts a JIRA story
  key (TAB1-XX) as the primary input — ACs become the test scenario titles. A POM file path
  is required for the locator bindings. Prerequisite: run locator-mapper if no POM exists.

compatibility: >
  Requires: JIRA story key (TAB1-XX) OR POM file path, plus lab URL.
  Atlassian MCP for fetching ACs. Playwright MCP for live page validation (screenshot).
  Output: .spec.ts written to tests/<lab-name>/.
---

# Playwright Test Case Generator

Generates a `.spec.ts` file where each JIRA Acceptance Criterion becomes one `test.describe()`
group containing one or more `test()` cases — positive, negative, and boundary — so the story
stays 1:1 traceable to code while the coverage reflects real test design, not happy-path only.

---

## JIRA Story Map

| JIRA Key | Lab                          | URL Path                          | Framework Gaps            |
| -------- | ---------------------------- | --------------------------------- | ------------------------- |
| TAB1-12  | Network & API                | /practice/network-api             | Gap #2 (page.route)       |
| TAB1-13  | Forms & Validation           | /practice/forms-validation        | Gap #3 (fixtures)         |
| TAB1-14  | Async UI                     | /practice/async-ui                | Gap #8 (flake/quarantine) |
| TAB1-15  | Accessible Locators          | /practice/accessible-locators     | —                         |
| TAB1-16  | Tables & Filtering           | /practice/tables-filtering        | —                         |
| TAB1-17  | Browser Events               | /practice/browser-events          | —                         |
| TAB1-18  | Emulation & Input            | /practice/emulation-input         | Gap #10 (mobile)          |
| TAB1-19  | Debugging & Reporting        | /practice/debugging-reporting     | Gap #8 (retries/tracing)  |
| TAB1-20  | Frames & Contexts            | /practice/frames-contexts         | —                         |
| TAB1-21  | Fake Auth                    | /practice/fake-auth               | Gap #1 (storageState)     |
| TAB1-22  | ARIA Snapshots               | /practice/aria-snapshots          | —                         |
| TAB1-23  | Storage State                | /practice/storage-state           | Gap #1 (storageState)     |
| TAB1-24  | API Request Context          | /practice/api-request-context     | Gap #7 (seeding)          |
| TAB1-25  | Clock & Timers               | /practice/clock-timers            | —                         |
| TAB1-26  | WebSocket Interception       | /practice/websocket-interception  | Gap #2 (route)            |
| TAB1-27  | HAR Recording                | /practice/har-recording           | Gap #2 (route)            |
| TAB1-28  | Service Workers              | /practice/service-workers         | Gap #2 (route)            |
| TAB1-29  | Visual Regression            | /practice/visual-regression       | —                         |
| TAB1-30  | Drag & Drop                  | /practice/drag-and-drop           | —                         |
| TAB1-31  | Multi-Tab                    | /practice/multi-tab               | —                         |
| TAB1-32  | Geolocation & Permissions    | /practice/geolocation-permissions | —                         |
| TAB1-33  | Scroll & Lazy Loading        | /practice/scroll-lazy-loading     | Gap #2 (route)            |
| TAB1-34  | Media & Locale Emulation     | /practice/media-locale            | —                         |
| TAB1-35  | Accessibility Scanning       | /practice/accessibility-scanning  | —                         |
| TAB1-36  | Locator Handlers             | /practice/locator-handlers        | —                         |
| TAB1-37  | Shadow DOM & Web Components  | /practice/shadow-dom              | —                         |
| TAB1-38  | Server-Sent Events           | /practice/server-sent-events      | Gap #2 (route)            |
| TAB1-39  | Soft Assertions & Test Steps | /practice/soft-assertions         | —                         |
| TAB1-40  | Init Scripts & Seeding       | /practice/init-scripts            | —                         |
| TAB1-41  | Touch & Mobile Gestures      | /practice/touch-gestures          | Gap #10 (mobile)          |

---

## ⛔ Guardrail — JIRA Key or POM Required

Scan the prompt for:

- A JIRA key `TAB1-\d+` → resolve to lab name and URL from the map above
- A lab name matching the map → resolve to JIRA key
- A POM file path (`.page.ts`) → read it directly
- A full URL → look up JIRA key from the map

**If none → STOP:**

> ⛔ Provide a JIRA story key (e.g. `TAB1-13`), a lab name, or a POM file path.
> All three resolve to the same spec — pick whichever you have.

---

## ⛔ Guardrail — POM Must Exist

Before generating a spec, verify that `pages/<lab-name>.page.ts` exists.

**If POM not found → STOP:**

> ⛔ No POM found for `<lab-name>`. Run `locator-mapper` on
> `https://stagecraftlabs.com<url-path>` first, then re-run this skill.

---

## Phase 1 — Fetch JIRA Acceptance Criteria

If Atlassian MCP is available:

1. Fetch the story: `cloudId: orhunakkan.atlassian.net`, `issueIdOrKey: TAB1-XX`
2. Extract all Acceptance Criteria bullets verbatim
3. Number them: AC-1, AC-2, ... AC-N

If Atlassian MCP is not available:

- Fall back to Phase 2 (POM-driven generation) and note the missing ACs in a TODO comment

---

## Phase 2 — Read the POM

Read `pages/<lab-name>.page.ts` in full.

Build a locator inventory:

```
{ inputs: [...], buttons: [...], links: [...], dropdowns: [...], images: [...], status: [...] }
```

Identify any framework gap patterns this lab needs (from the map table).

---

## Phase 3 — Live Validation (if Playwright MCP available)

Navigate to `https://stagecraftlabs.com<url-path>` and take a screenshot to confirm the
page loads and matches the POM. If the page requires login, ask for credentials or a
`storageState` path.

---

## Phase 4 — Map ACs to Test Blocks

**One `test.describe()` per AC — NOT one `test()` per AC.** Each AC becomes a `describe`
group whose title carries the `AC-N (TAB1-XX)` tag, and inside it you write _every case the
AC implies_: the positive (happy) path plus the negative and boundary cases derived below.
A bare happy-path-only AC is a generation failure — re-derive the cases.

```typescript
// AC-2 (TAB1-XX): Blurring a required field without input shows an inline validation error
test.describe('AC-2 — required-field validation on blur', () => {
  test('positive: valid input clears the error', async ({ formsValidationPage }) => {
    /* ... */
  });
  test('negative: empty blur shows the inline error', async ({ formsValidationPage }) => {
    /* ... */
  });
  test('boundary: 1 char fails, 2 chars passes', async ({ formsValidationPage }) => {
    /* ... */
  });
});
```

**Case derivation — mandatory.** For each AC, enumerate cases before writing code:

| Trigger in the AC text                              | Cases you MUST generate                                                                      |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| "required" / "must be filled"                       | positive (filled) **and** negative (empty → error)                                           |
| "valid <format>" (email, phone, URL)                | positive (valid) **and** negative (malformed → error), data-driven over a table              |
| "at least N" / "max N" / "between N and M"          | boundary value analysis: N-1 (fail), N (pass), M (pass), M+1 (fail)                          |
| "enabled / disabled" gating                         | positive (all valid → enabled) **and** negative (each single field missing → still disabled) |
| "shows <success>"                                   | positive (success appears) **and** the inverse (does not appear before submit)               |
| a specific Playwright API (`selectOption`, `check`) | use exactly that API; assert the resulting state                                             |

Use **equivalence partitioning** (one representative per valid/invalid class) and
**boundary-value analysis** (edges of every numeric/length constraint). Every error locator
declared in the POM must be asserted by at least one negative case — unused error locators
mean the AC is under-covered.

**Title convention:** `describe` title = `AC-N — <short theme>`; each `test` title states the
case and its expectation (`negative: malformed email shows error`). Keep the full AC text as a
comment above the `describe`.

---

## Phase 4b — Test Data Strategy

Do not hardcode and repeat literals. Build data at the top of the spec:

- **Valid data** → `@faker-js/faker` (if in `package.json`): `faker.person.fullName()`,
  `faker.internet.email()`. Generate once into a `const` so assertions can reference it.
- **Invalid / boundary data** → a typed case table iterated with `for...of` to emit one
  `test()` per row (data-driven), e.g.:

```typescript
const invalidEmails = [
  { value: 'not-an-email', label: 'missing @' },
  { value: 'a@b', label: 'no TLD' },
  { value: '@example.com', label: 'no local part' },
];
for (const { value, label } of invalidEmails) {
  test(`negative: rejects email (${label})`, async ({ formsValidationPage }) => {
    /* ... */
  });
}
```

- **Shared setup** (e.g. "fill all valid fields") → a single helper or fixture method, called
  from each case. Never copy-paste the fill sequence across tests.

---

**Framework pattern application:**

| Lab Type              | Add to spec                                                                                                                                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gap #1 (storageState) | `test.use({ storageState: AUTH_STATE_PATH })` stub with TODO                                                                                                                                                  |
| Gap #2 (page.route)   | Import and use `mockApiResponse` from `utilities/route-helpers.ts` (if exists); else TODO comment                                                                                                             |
| Gap #3 (fixtures)     | Import `test`/`expect` from `fixtures/index` and consume the POM fixture (e.g. `formsValidationPage`); if `fixtures/index.ts` is missing, leave the TODO comment AND fall back to `new <ClassName>Page(page)` |
| Gap #8 (flake)        | Wrap timing-sensitive ACs in `expect(locator).toPass()`                                                                                                                                                       |
| Gap #10 (mobile)      | Add `test.use({ ...devices['iPhone 14'] })` stub                                                                                                                                                              |

If the required framework file doesn't exist, add:

```typescript
// TODO: run framework-scaffolder for gap #N to enable <pattern>
```

---

## Phase 5 — Always Append Accessibility Tests (multi-state)

Scan a11y in **every meaningful UI state**, not just on load — load-only scans miss the
violations that appear in error and success states (those are where forms most often break:
contrast on colored banners, focus loss, unlabeled live regions). Generate one `test()` per
state the lab can reach:

```typescript
test.describe('accessibility (WCAG 2.x, axe)', () => {
  const scan = (page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();

  test('no violations on initial page load', async ({ page }) => {
    expect((await scan(page)).violations).toEqual([]);
  });

  test('no violations while validation errors are displayed', async ({ page, <labFixture> }) => {
    // drive the page into its error state, then scan
    expect((await scan(page)).violations).toEqual([]);
  });

  test('no violations on the success / result state', async ({ page, <labFixture> }) => {
    // drive the page into its success state, then scan
    expect((await scan(page)).violations).toEqual([]);
  });
});
```

**Handling a real violation found by a state scan:** do NOT delete the scan or weaken it to
load-only. Treat it as a found defect — keep the scan, filter out _only_ the specific tracked
violation (e.g. `results.violations.filter((v) => v.id !== 'color-contrast')`) with a comment
referencing the defect/RTM row, and let `test-triage` log it (Phase 3 defect lifecycle). This
keeps the suite green while the bug stays visible and tracked.

Only include these if `@axe-core/playwright` is in `package.json`. If absent, add a TODO comment.

---

## Phase 5b — Append a Non-Functional (Performance) Check

Cover at least one non-functional dimension beyond a11y. Emit a **performance-budget** test
that reads the Navigation Timing API and asserts generous, stable budgets. Tag it
`@performance` so it can be split out of the gating run when needed:

// NOTE: do NOT add page.goto(URL) here — beforeEach already navigates once.
// Adding a second goto measures warm/cached load time, not cold initial load.
test.describe('performance @performance', () => {
test('initial load is within budget', async ({ page }) => {
const timing = await page.evaluate(() => {
const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
return { domContentLoaded: nav.domContentLoadedEventEnd, load: nav.loadEventEnd };
});
// Budgets are intentionally generous so they don't flake against a live site;
// tighten them when running in a controlled performance environment.
expect(timing.domContentLoaded).toBeLessThan(6000);
expect(timing.load).toBeLessThan(12000);
});
});

````

**Budget guidance:** absolute wall-clock budgets against a public site are noisy — keep them
loose in the CI gate, and reserve tight thresholds for a controlled env. For a deeper audit
(Core Web Vitals, opportunities), run a **Lighthouse audit via the Chrome DevTools MCP**
(`lighthouse_audit` / `performance_*` tools) on demand rather than as a hard gate.

Record the performance case in the RTM under a non-functional (`NF`) requirement row.

---

## Phase 6 — Assemble the File

```typescript
// Prefer the fixtures import when fixtures/index.ts exists; else import from '@playwright/test'
import { test, expect } from '../../fixtures/index';
import AxeBuilder from '@axe-core/playwright';
import { faker } from '@faker-js/faker'; // only if used for valid data

// JIRA: https://orhunakkan.atlassian.net/browse/TAB1-XX — <Lab Name>

const URL = '/practice/<lab-path>';

// Data-driven tables for negative / boundary cases (Phase 4b)
const <invalidCases> = [/* { value, label } rows */];

test.describe('<Lab Name>', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  // AC-1 (TAB1-XX): <full AC text verbatim>
  test.describe('AC-1 — <short theme>', () => {
    test('positive: <case>', async ({ <labFixture> }) => {
      // ...
    });
    test('negative: <case>', async ({ <labFixture> }) => {
      // ...
    });
    // boundary / data-driven cases as derived in Phase 4
  });

  // AC-2 (TAB1-XX): <full AC text verbatim>
  test.describe('AC-2 — <short theme>', () => {
    // positive + negative + boundary cases
  });

  // ... one describe per AC ...

  // Accessibility — scan load + each rendered state (see Phase 5)
  test.describe('accessibility', () => {
    test('no WCAG 2.x violations on page load', async ({ page }) => {
      // ...
    });
  });
});
````

**Output path:** `tests/<lab-name>/<lab-name>.spec.ts`

---

## Phase 7 — Summary

```
✅ Generated: tests/<lab-name>/<lab-name>.spec.ts
   ├─ JIRA story: TAB1-XX
   ├─ N AC describe-groups → M total cases (positive / negative / boundary)
   ├─ Negative + boundary cases: <count>  (0 is a failure — re-derive)
   ├─ Framework patterns applied: <list or "none">
   └─ TODOs: <count> framework scaffolds pending

Next steps:
  1. Run: npx playwright test tests/<lab-name>
  2. If failures: run test-triage
  3. When all green: run jira-sync to transition TAB1-XX to "In Review"
```

---

## Edge Cases

| Situation                                               | Handling                                                                           |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Atlassian MCP unavailable                               | Generate tests from POM locator types only; add TODO comments for each AC          |
| AC references a specific Playwright API not yet learned | Implement a skeleton with the API name in a comment; don't fabricate behavior      |
| AC says "Tests are isolated"                            | Implement as an `afterEach` cleanup or `test.use` isolation, not a standalone test |
| AC describes a negative outcome                         | Still one test per AC — the assertion just uses `not.toBeVisible()` etc.           |
| Very long AC text (100+ chars)                          | Truncate title to 50 chars; keep full AC as comment                                |

---

## Quick-Start Prompt Template

```
1. Resolve input → JIRA key + POM path + URL path
2. Fetch ACs via Atlassian MCP (TAB1-XX)
3. Read POM — build locator inventory
4. Navigate to live URL — screenshot confirmation (Playwright MCP)
5. For each AC → derive positive + negative + boundary cases (Phase 4 table); one describe per AC
6. Build test data (faker for valid, typed tables for invalid/boundary — Phase 4b)
7. Apply framework patterns: import from fixtures/index if present (or TODO-comment them)
8. Append axe-core accessibility tests (load + each rendered state)
9. Write tests/<lab-name>/<lab-name>.spec.ts
10. Print summary with JIRA link + case counts + next steps
```
