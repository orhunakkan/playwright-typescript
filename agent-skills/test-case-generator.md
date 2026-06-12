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

Generates a `.spec.ts` file where each JIRA Acceptance Criterion becomes one named `test()`
block — directly traceable from story to code.

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

**One `test()` per AC.** Use the AC text (trimmed) as the test title:

```typescript
// AC-1 (TAB1-XX): Tests locate elements exclusively using getByRole, getByLabel...
test('locates elements using only semantic locators — no CSS or XPath', async ({ page }) => {
  // Implementation driven by the AC and POM locators
});
```

**Title convention:** Derive a concise human-readable title from the AC text (50 chars max).
Keep the full AC text as a comment above the test for traceability.

**For each AC, implement the test body using POM locators:**

- Use the matching locators from Phase 2 to implement the action
- Derive the assertion from the AC's expected outcome clause
- If the AC references a specific Playwright API (e.g. `locator.filter`, `expect.poll`),
  use exactly that API

**Framework pattern application:**

| Lab Type              | Add to spec                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| Gap #1 (storageState) | `test.use({ storageState: AUTH_STATE_PATH })` stub with TODO                                      |
| Gap #2 (page.route)   | Import and use `mockApiResponse` from `utilities/route-helpers.ts` (if exists); else TODO comment |
| Gap #3 (fixtures)     | Import `test` from `fixtures/index.ts` (if exists); else TODO comment                             |
| Gap #8 (flake)        | Wrap timing-sensitive ACs in `expect(locator).toPass()`                                           |
| Gap #10 (mobile)      | Add `test.use({ ...devices['iPhone 14'] })` stub                                                  |

If the required framework file doesn't exist, add:

```typescript
// TODO: run framework-scaffolder for gap #N to enable <pattern>
```

---

## Phase 5 — Always Append Accessibility Test

```typescript
test('has no critical accessibility violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations).toEqual([]);
});
```

Only include if `@axe-core/playwright` is in `package.json`. If absent, add a TODO comment.

---

## Phase 6 — Assemble the File

```typescript
import { test, expect } from '@playwright/test'; // or from '../../fixtures/index' if fixtures exist
import AxeBuilder from '@axe-core/playwright';
import { <ClassName>Page } from '../../pages/<lab-name>.page';

// JIRA: https://orhunakkan.atlassian.net/browse/TAB1-XX — <Lab Name>

test.describe('<Lab Name>', () => {
  let labPage: <ClassName>Page;

  test.beforeEach(async ({ page }) => {
    labPage = new <ClassName>Page(page);
    await page.goto('/practice/<lab-path>');
  });

  // AC-1 (TAB1-XX): <full AC text verbatim>
  test('<derived title>', async ({ page }) => {
    // ...
  });

  // AC-2 (TAB1-XX): <full AC text verbatim>
  test('<derived title>', async ({ page }) => {
    // ...
  });

  // ... one test per AC ...

  test('has no critical accessibility violations', async ({ page }) => {
    // ...
  });
});
```

**Output path:** `tests/<lab-name>/<lab-name>.spec.ts`

---

## Phase 7 — Summary

```
✅ Generated: tests/<lab-name>/<lab-name>.spec.ts
   ├─ JIRA story: TAB1-XX
   ├─ X test blocks (1 per AC + 1 accessibility)
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
5. Map each AC → one test() with AC as comment + derived title
6. Apply framework patterns (or TODO-comment them)
7. Append axe-core accessibility test
8. Write tests/<lab-name>/<lab-name>.spec.ts
9. Print summary with JIRA link + next steps
```
