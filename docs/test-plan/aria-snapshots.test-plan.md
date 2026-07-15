# Test Plan: ARIA Snapshots

**JIRA Story:** [TAB1-22](https://orhunakkan.atlassian.net/browse/TAB1-22)
**Lab URL:** https://stagecraftlabs.com/practice/aria-snapshots
**Date:** 2026-07-12
**Author:** Orhun Akkan

---

## 1. Scope

### In Scope

- Capturing an ARIA snapshot of the Challenge 1 accordion in its fully-collapsed state via
  `expect(locator).toMatchAriaSnapshot()` (no-argument, file-based baseline) and confirming a
  baseline `.aria.yml` is written under `fixtures/reference-snapshots/` on first run
- Expanding one accordion section and asserting the tree gains a `region` child node for the
  opened panel while sibling sections remain collapsed
- `/children: equal` strict-child-matching templates, including deliberately wrong templates
  (extra/missing node) to prove the constraint rejects mismatches
- The step wizard's `aria-current="step"` attribute moving to the correct step button after
  Next/Back clicks and after a direct step-jump click
- A partial-match regex pattern in an inline snapshot template for a value that varies (the active
  step's form `aria-label`) while the surrounding structural hierarchy stays a strict match
- Before/after snapshots of the visible live-announcement region (`aria-label="Live
announcements"`), asserting its text content changes when accordion sections are toggled
- Accessibility scan across load, expanded-accordion, and wizard-navigated states

### Out of Scope

- The sr-only global status announcer (`role="status"`) — mirrors the visible live region 1:1;
  the JIRA ACs specify asserting the visible announcement region, not the duplicate sr-only node
- Manually editing a heading level in DevTools to observe the snapshot diff (guidance bullet 5 is
  an exploratory/manual exercise, not a codified assertion)
- Dark mode toggle and "Mark complete" button — unrelated to ARIA snapshot structural assertions

---

## 2. Test Objectives

| #   | Objective                                                                                           |
| --- | --------------------------------------------------------------------------------------------------- |
| 1   | A file-based ARIA snapshot baseline is generated on first run and matched on subsequent runs        |
| 2   | Expanding/collapsing an accordion section is reflected structurally in its ARIA tree                |
| 3   | `/children: equal` enforces strict child-set matching, rejecting extra or missing nodes             |
| 4   | `aria-current="step"` tracks the active wizard step through Next/Back and direct step navigation    |
| 5   | A regex partial-match pattern can match a varying value while the rest of the template stays strict |
| 6   | The visible live-announcement region's content changes predictably when accordion state changes     |

---

## 3. Browser Matrix

| Browser         | Playwright Project | Priority |
| --------------- | ------------------ | -------- |
| Chromium        | Desktop Chrome     | P1       |
| Firefox         | Desktop Firefox    | P1       |
| WebKit (Safari) | Desktop Safari     | P2       |
| Edge            | Desktop Edge       | P2       |

Source: `playwright.config.ts` — 4 desktop projects configured.

---

## 4. Environments

| Environment | Base URL                   |
| ----------- | -------------------------- |
| Default     | https://stagecraftlabs.com |
| QA          | `.env.qa` → `BASE_URL`     |
| UAT         | `.env.uat` → `BASE_URL`    |

---

## 5. Risk Table

| Risk                                                                                                                                                                                                       | Priority | Mitigation                                                                                                                                        |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| ARIA snapshot baseline is generated against Desktop Chrome locally; other engines (Firefox/WebKit) may compute subtly different implicit roles for the same semantic HTML, causing a first-CI-run mismatch | P1       | Scope templates to well-formed, standards-compliant markup (headings/buttons/forms/lists); triage per-browser CI diffs via Step 12a if they occur |
| The accordion container has no id/data-testid, so its locator is structural (`section > div`)                                                                                                              | P2       | Anchor the section via its heading's accessible name, then take the single direct `div` child — resilient to styling-class changes                |
| The active step `<form>` is fully replaced (not just its contents) on every step transition                                                                                                                | P1       | Always re-query `wizardSection.locator('form')`; never cache a form/field locator across a step change                                            |
| `/children: equal` mismatch tests must fail deterministically, not flake, when the template is deliberately wrong                                                                                          | P1       | Use `expect(locator).not.toMatchAriaSnapshot(template)` with an intentionally wrong child set                                                     |
| The live announcement region and the sr-only status duplicate the same text — only the visible one is in scope                                                                                             | P2       | Target `[aria-label="Live announcements"]` explicitly, not the generic `[role="status"]` selector                                                 |

---

## 6. Entry Criteria

- `https://stagecraftlabs.com/practice/aria-snapshots` is reachable and returns HTTP 200
- The lab exposes the accordion (Challenge 1), step wizard (Challenge 2), and live region (Challenge 3)
- `fixtures/reference-snapshots/` directory is writable for baseline generation
- `test-results/` output directory is writable

## 7. Exit Criteria

- All 6 ACs covered by at least one positive test case
- Each AC has at least one negative or boundary test where applicable
- Axe scan passes across load, expanded-accordion, and wizard-navigated states
- Performance test asserts initial load completes within budget
- All tests pass locally on Desktop Chrome
- CI run passes across all 4 configured browsers (gates story → Done)

---

## 8. Test Case Summary

| AC     | Test Cases                                                                                           | Types         |
| ------ | ---------------------------------------------------------------------------------------------------- | ------------- |
| AC-1   | ARIA snapshot of the fully-collapsed accordion matches (or generates) the baseline                   | Positive      |
| AC-1-N | An inline template with an extra phantom section does not match the collapsed accordion              | Negative      |
| AC-2   | Expanding one section adds a region child node for that section's content in the tree                | Positive      |
| AC-2-N | Re-collapsing the expanded section removes the region child node again                               | Negative      |
| AC-2-B | Only the target section's subtree gains a child; sibling sections remain childless (collapsed)       | Boundary      |
| AC-3   | `/children: equal` accepts a template listing exactly the actual child set                           | Positive      |
| AC-3-N | `/children: equal` rejects a template with an extra node                                             | Negative      |
| AC-3-N | `/children: equal` rejects a template with a missing node                                            | Negative      |
| AC-4   | `aria-current="step"` moves to step 2 after clicking Next, and to step 1 after clicking Back         | Positive      |
| AC-4-N | A non-current step button carries no `aria-current` attribute                                        | Negative      |
| AC-4-B | Direct step-jump (clicking step 1 from step 4) sets `aria-current="step"` on step 1 only             | Boundary      |
| AC-5   | A regex partial-match pattern matches the active step's varying form label while structure is strict | Positive      |
| AC-5-N | The same regex pattern fails to match once the form's structural position/content changes            | Negative      |
| AC-6   | The visible live-announcement region's content changes after toggling an accordion section           | Positive      |
| AC-6-N | The live-announcement region's content is unchanged with no toggle action performed                  | Negative      |
| A11Y   | Axe WCAG 2.1 AA scan across load, expanded-accordion, and wizard-navigated states                    | Accessibility |
| PERF   | Initial page load completes within budget                                                            | Performance   |
