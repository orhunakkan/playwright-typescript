# Lint error triage — `npm run lint`

## Context

`npm run lint` reports **170 problems: 151 errors, 19 warnings**. Per the user's request, only the 151 **errors** are in scope (the 19 warnings are all `playwright/no-skipped-test` and are excluded). Errors break down into 12 rule categories. This plan orders them cheapest → most expensive to fix, based on reading representative call sites for every category (not just the rule name), and documents which buckets are likely false positives or intentional code that the linter is misfiring on. Those buckets are flagged below for a per-case decision during implementation rather than a blanket policy.

## Triage order (cheap → expensive)

### 1. Auto-fixable, safe — 57 errors

- **`no-useless-not` (55 errors, 15 files)** — `not.toBeVisible()` → `toBeHidden()` etc. Confirmed the rule ships a real fixer (`node_modules/eslint-plugin-playwright/dist/index.cjs:2661`) that only swaps the matcher name; semantically identical.
- **`consistent-spacing-between-blocks` (2 errors, `geolocation-permissions.spec.ts:98,201`)** — missing blank line before a statement; whitespace-only fixer.
- **Action:** run `eslint . --fix`, then review the diff (should be pure matcher renames + blank lines) and re-run lint to confirm both rules drop to 0.

### 2. Cheap, one-line manual swap — 2 errors

- **`prefer-to-have-count` (2 errors, `drag-and-drop.spec.ts:34-35`)** — `expect(await locator.count()).toBe(n)` style → `expect(locator).toHaveCount(n)`. No fixer ships for this rule despite metadata, but the transform is mechanical and low-risk.

### 3. Medium — mechanical pattern, needs a per-site check — 20 errors

- **`prefer-web-first-assertions` (20 errors, 8 files)** — `.textContent()` / `.getAttribute()` / `.allTextContents()` → `toHaveText()` / `toHaveAttribute()`. 11 of the 20 are clustered in `soft-assertions.spec.ts` (good single focused pass). For each site, confirm the captured value isn't reused elsewhere in the test body before converting — a couple of assertions with transformed/compared strings will need the comparison logic reshaped, not just the call swapped.

### 4. Medium-high — likely false positive, needs rule understanding — 6 errors

- **`prefer-locator` (6 errors, all `tables-filtering.spec.ts`)** — Traced the rule's `isPageMethod` heuristic (`index.cjs:401-415`): it flags any call whose object/method name matches `/(^(page|frame)|(Page|Frame)$)/`. The page object's `pageButton()` method (returns a `Locator`) starts with "page", and the fixture `tablesFilteringPage` ends in "Page" — both trip the regex even though nothing here is a raw `Page`/`Frame` call. **Flagged for a per-case decision**: rename `pageButton` to dodge the heuristic, or suppress with a justified `eslint-disable-next-line`.

### 5. Higher — right replacement wait varies per call site — 14 + 12 errors

- **`no-wait-for-timeout` (14 errors, 7 files)** — each needs a real wait condition (`toBeVisible()`, `waitForResponse()`, `expect.poll()`, etc.) substituted for the fixed sleep. Most are ordinary "wait for UI to settle" cases. One exception is flagged for a per-case call: `network-api.spec.ts:127` waits 300ms to prove a POST request was _not_ fired after a force-click on a disabled button — proving a negative is inherently hard to express as a locator assertion.
- **`no-networkidle` (12 errors, all `accessibility-scanning.spec.ts`)** — every site carries an existing comment explaining the wait is deliberate ("axe's color-contrast/image-alt checks are flaky against a pre-hydration DOM snapshot — waiting for network idle... is what makes the violation set deterministic"). **Flagged for a per-case decision**: rewriting these risks reintroducing axe flakiness and needs verification (re-running the a11y scans) rather than a mechanical swap, or the whole bucket could be suppressed with the existing rationale.

### 6. Most expensive — test-design decisions, some likely false positives — 20 + 12 + 7 + 1 errors

- **`no-conditional-expect` + `no-conditional-in-test` (20 + 12 = 32 errors, 8 files)** — genuine runtime branching on scraped page data (e.g. `if (genreOptions.length < 2) return;` in `accessible-locators.spec.ts`). A real fix means either guaranteeing deterministic fixture data so the branch disappears, or splitting into separate deterministic test cases — a per-test design call, not a mechanical lint fix. Do this bucket last, file by file.
- **`no-standalone-expect` (7 errors, `custom-assertions.spec.ts:174-201`)** — traced this to a rule limitation: the `expect()` calls are inside test functions created via `mergeTests()` (`mergedTest`, `reverseMergedTest`, `pricingTest`), which the rule's `isTypeOfFnCall(..., ["test"])` check doesn't recognize as `test`. **Flagged for a per-case decision**: likely a justified suppression rather than restructuring, since the expects are already correctly scoped inside test bodies.
- **`no-force-option` (1 error, `network-api.spec.ts:125`)** — `addButton.click({ force: true })` on a disabled button is the deliberate point of that test (verifying no network request fires from a disabled control). **Flagged for a per-case decision**: likely a justified suppression.

## Verification

After each bucket, re-run `npm run lint` and confirm:

- The target rule's error count drops to 0 (or to the agreed suppressed count).
- No new errors/warnings appear (a bad manual edit, e.g. a botched `toHaveText()` swap, often surfaces as a TypeScript or different-rule error).
- For buckets 5-6 in particular, run the affected spec files (`npx playwright test <file>`) after editing, since these are the categories most likely to change runtime behavior, not just syntax.
