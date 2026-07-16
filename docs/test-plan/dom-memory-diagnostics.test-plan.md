# Test Plan — Memory & DOM Leak Diagnostics (TAB1-63)

## 1. Scope

In scope: spawning a batch of auto-dismissing toasts and asserting the "graveyard" (retained,
detached-but-referenced DOM node) count via `expect.poll` / `locator.count`; proving that
`page.requestGC()` alone does not release reachable-but-unused nodes; proving that clicking
"Clear leaked nodes" (removing the last JS reference) is the actual fix, returning the graveyard
count to 0; tracking the active-toast count through its full spawn → dismiss lifecycle; a
general-purpose repeated mount/unmount leak check via `document.querySelectorAll('*').length`
before/after a cycle.

Out of scope: real browser heap-snapshot diffing (`take_heapsnapshot` — used only as an optional
manual aid, not asserted on in specs), memory profiling of the whole page beyond the lab's own
counters, server-side memory, non-Chromium CDP-specific leak tooling, load/performance testing
beyond the standard budget check.

## 2. Test types

Functional (positive / negative / boundary / data-driven) — applies.
Accessibility (axe, all states) — applies.
Non-functional (performance budget) — applies.
Cross-browser — applies, with one caveat: `page.requestGC()` is a Chromium DevTools Protocol
capability (`Page.requestGC` via CDP). It runs under Chromium-based projects (Desktop Chrome,
Desktop Edge). Firefox/WebKit lack a CDP-exposed forced-GC hook, so `page.requestGC()` calls on
those projects are expected to no-op or reject depending on installed Playwright behavior — this
is verified live during POM/spec generation and documented as a known-gap rather than assumed.

## 3. Environments & data

Target env: production lab site, `BASE_URL=https://stagecraftlabs.com` (from `.env`).
Test data strategy: no form data — the lab is interaction/counter-driven (spawn count, graveyard
count, active-toast count, total DOM node count). No faker data needed; assertions are on
numeric counters read via `locator.count()` and `page.evaluate()`. No auth/seed needs.

## 4. Browser / device matrix

Desktop Chrome · Desktop Firefox · Desktop Edge · Desktop Safari (from `playwright.config.ts`
`projects[]`).

## 5. Risk assessment & priority

| Area / Requirement                                                   | Likelihood | Impact | Risk | Priority |
| -------------------------------------------------------------------- | ---------- | ------ | ---- | -------- |
| Spawn 50 toasts → graveyard count reaches 50 after auto-dismiss      | M          | H      | H    | P1       |
| Graveyard count is 0 before any dismissal has occurred               | L          | M      | M    | P2       |
| `requestGC()` does not reduce graveyard count (reachable nodes)      | M          | H      | H    | P1       |
| "Clear leaked nodes" returns graveyard count to 0                    | M          | H      | H    | P1       |
| "Clear leaked nodes" is a safe no-op when graveyard is already empty | L          | L      | L    | P2       |
| Active-toast count matches spawned count pre-dismissal, 0 post       | M          | H      | H    | P1       |
| Active/graveyard counts scale correctly for a smaller batch size     | L          | M      | M    | P2       |
| No unbounded DOM node growth across repeated mount/unmount cycles    | M          | H      | H    | P1       |
| Accessibility — all rendered states                                  | L          | H      | M    | P1       |
| Performance budget                                                   | L          | M      | L    | P2       |

## 6. Entry criteria

- Requirements extracted and prioritized (requirement-extractor done)
- POM exists for the lab (locator-mapper done)
- App URL reachable; `BASE_URL` configured

## 7. Exit criteria

- 100% of P1 + P2 requirements have passing automated cases
- 0 open non-flaky defects of severity ≥ High linked to the story
- Accessibility: 0 critical/serious violations (or tracked + accepted with a defect id)
- Green across the full browser matrix in CI (Chromium-only behavior for `requestGC()` documented,
  not treated as a cross-browser failure if the app itself degrades gracefully)
- RTM generated and up to date

## 8. Deliverables

`tests/dom-memory-diagnostics/dom-memory-diagnostics.spec.ts` · POM
(`pages/dom-memory-diagnostics.page.ts`) · RTM (`docs/rtm/dom-memory-diagnostics.rtm.md`) ·
this plan · CI run

## 9. Schedule / effort (lightweight)

requirements → plan → POM → spec → local run → triage → PR/CI → RTM refresh → review → done
