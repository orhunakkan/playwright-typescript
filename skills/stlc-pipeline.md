---
name: playwright-stlc-pipeline
description: >
  Runs the full STLC cycle for a single Stagecraft lab end-to-end without stopping for
  approval — from JIRA story to passing tests, a pushed branch, an open PR, a real GitHub
  Actions CI run, an RTM, and the story moved to Done once CI verifies this lab's tests pass
  on every browser. Merging the PR stays a manual, human step. Use this skill whenever
  the user wants to fully automate a lab, or says things like "run pipeline for TAB1-XX",
  "full cycle for Forms lab", "run stlc-pipeline", or "automate TAB1-XX end to end".
  Accepts a JIRA story key (TAB1-XX) or lab name. Skips steps already completed.
  Does NOT pause between steps — runs straight through to Done (or to a CI-failure triage
  comment if this lab's tests don't pass in CI). If the lab was already built (a
  tests/<lab-name>/<lab-name>.spec.ts file exists), the pipeline stops before Step 1 and
  reports its JIRA status + PR state instead of re-running it, unless the request says
  "regenerate" / "force re-run".

compatibility: >
  Requires ALL of the following:
  - Atlassian MCP (JIRA story fetch + transitions + comments)
  - Playwright MCP (browser navigation, screenshots, accessibility snapshot)
  - Chrome DevTools MCP (DOM queries, event listener inspection)
  - Playwright CLI (running the generated spec file)
  - GitHub CLI (`gh`, authenticated, `repo` scope) — branch push, PR creation, CI run
    polling, and artifact download
  Other agent skills invoked internally: requirement-extractor, test-plan-generator,
  locator-mapper, test-case-generator, jira-sync, test-triage, rtm-generator.
---

# Playwright STLC Pipeline

Orchestrates the full STLC cycle for one lab: requirements → POM → tests → run → triage →
branch → PR → CI → RTM → JIRA In Review → Done (verified by real CI evidence, per lab).
No checkpoints. Skips any step whose output already exists. The pipeline never merges the
PR — that stays a manual, human action.

---

## JIRA Story Map

| JIRA Key | Lab Name                     | URL Path                          |
| -------- | ---------------------------- | --------------------------------- |
| TAB1-12  | Network & API                | /practice/network-api             |
| TAB1-13  | Forms & Validation           | /practice/forms-validation        |
| TAB1-14  | Async UI                     | /practice/async-ui                |
| TAB1-15  | Accessible Locators          | /practice/accessible-locators     |
| TAB1-16  | Tables & Filtering           | /practice/tables-filtering        |
| TAB1-17  | Browser Events               | /practice/browser-events          |
| TAB1-18  | Emulation & Input            | /practice/emulation-input         |
| TAB1-19  | Debugging & Reporting        | /practice/debugging-reporting     |
| TAB1-20  | Frames & Contexts            | /practice/frames-contexts         |
| TAB1-21  | Fake Auth                    | /practice/fake-auth               |
| TAB1-22  | ARIA Snapshots               | /practice/aria-snapshots          |
| TAB1-23  | Storage State                | /practice/storage-state           |
| TAB1-24  | API Request Context          | /practice/api-request-context     |
| TAB1-25  | Clock & Timers               | /practice/clock-timers            |
| TAB1-26  | WebSocket Interception       | /practice/websocket-interception  |
| TAB1-27  | HAR Recording                | /practice/har-recording           |
| TAB1-28  | Service Workers              | /practice/service-workers         |
| TAB1-29  | Visual Regression            | /practice/visual-regression       |
| TAB1-30  | Drag & Drop                  | /practice/drag-and-drop           |
| TAB1-31  | Multi-Tab                    | /practice/multi-tab               |
| TAB1-32  | Geolocation & Permissions    | /practice/geolocation-permissions |
| TAB1-33  | Scroll & Lazy Loading        | /practice/scroll-lazy-loading     |
| TAB1-34  | Media & Locale Emulation     | /practice/media-locale            |
| TAB1-35  | Accessibility Scanning       | /practice/accessibility-scanning  |
| TAB1-36  | Locator Handlers             | /practice/locator-handlers        |
| TAB1-37  | Shadow DOM & Web Components  | /practice/shadow-dom              |
| TAB1-38  | Server-Sent Events           | /practice/server-sent-events      |
| TAB1-39  | Soft Assertions & Test Steps | /practice/soft-assertions         |
| TAB1-40  | Init Scripts & Seeding       | /practice/init-scripts            |
| TAB1-41  | Touch & Mobile Gestures      | /practice/touch-gestures          |

---

## ⛔ Pre-flight — Resolve Input

Scan the prompt for a JIRA key (`TAB1-\d+`) or a lab name matching the map above.
Resolve to: JIRA key + lab name + URL path + POM path + spec path.

**If nothing resolves → STOP:**

> ⛔ Provide a JIRA story key (e.g. `TAB1-13`) or a lab name (e.g. `Forms & Validation`).

---

## ⛔ Pre-flight — Tool Check

Verify ALL five tools are available before executing any step:

| Tool                | Required For                                                |
| ------------------- | ----------------------------------------------------------- |
| Atlassian MCP       | JIRA reads, comments, transitions                           |
| Playwright MCP      | Browser navigation, screenshots                             |
| Chrome DevTools MCP | DOM and event listener inspection                           |
| Playwright CLI      | Running the spec file                                       |
| GitHub CLI (`gh`)   | Branch push, PR creation, CI run polling, artifact download |

Confirm `gh` is authenticated (`gh auth status`) — an installed-but-unauthenticated CLI counts
as missing.

**If any tool is missing → STOP and list exactly which tools are absent.**
Do not attempt to proceed with missing tools — partial execution will produce incomplete artifacts.

---

## ⛔ Pre-flight — Already-Done Check

A `tests/<lab-name>/` folder containing `<lab-name>.spec.ts` is ground truth that this lab was
already built — it can't be fooled by a manually-edited JIRA status the way a status-only check
can, and it needs no JIRA round-trip to evaluate.

1. Check the local filesystem: does `tests/<lab-name>/<lab-name>.spec.ts` exist?
   - **No → proceed normally to Step 1.** Nothing to guard against.
2. **Yes** → this lab has already been built. Gather status signals before stopping:
   - JIRA status via Atlassian MCP (`getJiraIssue`, `status` field)
   - PR state via `gh pr list --head stlc/<lab-name> --state all --json number,url,state`
3. **STOP by default** and print:

```
⛔ TAB1-XX (<Lab Name>) already has a generated spec at tests/<lab-name>/<lab-name>.spec.ts.
   JIRA status: <status>
   PR: #<N> <state> (<url>)   — or "no PR found" if none exists
   Nothing to do — the pipeline will not regenerate or re-run this lab automatically.
   To proceed anyway, say "regenerate <lab>" or "force re-run <lab>".
```

**Exception — proceed instead of stopping:** if the user's original request already contains
override language (`regenerate`, `force re-run`, `redo`, `re-run anyway`, or similar), skip the
stop and continue into Step 1. The normal per-step skip conditions still apply (Steps 1b/3/3.5/5
will still skip whatever artifacts already exist unless the user separately says "regenerate POM"
/ "regenerate spec" per the Re-run Behaviour section) — this exception only bypasses the full-stop,
it does not force regeneration of already-existing files.

---

## Pipeline Execution

Print a pipeline header at the start:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 STLC Pipeline — <Lab Name> (<JIRA Key>)
 Started: <timestamp>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Then execute each step in order. Print a one-line status at the start and end of each step:
`▶ Step N — <name>` and `✅ Step N done` (or `⏭ Step N skipped — <reason>`).

---

### Step 1 — Fetch Requirements (requirement-extractor)

Execute all phases from `requirement-extractor`:

1. Fetch story `TAB1-XX` via Atlassian MCP
2. Extract all Acceptance Criteria bullets verbatim; number them AC-1 … AC-N
3. Derive the implied negative & boundary sub-requirements per AC (requirement-extractor Phase A2)
4. Tag each requirement `[P1/P2/P3]`; always append the performance + all-states a11y requirements
5. Print the requirements list

**No skip condition** — always extract. The requirements drive Step 1b (test plan) and Step 5 (spec).

---

### Step 1b — Generate Test Plan (test-plan-generator)

**Skip if:** `docs/test-plan/<lab-name>.test-plan.md` already exists
→ print `⏭ Step 1b skipped — test plan already exists`.

**Otherwise**, execute `test-plan-generator`: derive scope, the browser matrix (from
`playwright.config.ts`), environments (`.env*`), a risk table (P1→P3), and entry/exit criteria.
Write `docs/test-plan/<lab-name>.test-plan.md`. The exit criteria defined here govern Step 9
(In Review) and Step 12b (Done).

---

### Step 2 — State Check

Check local filesystem (no tools needed):

- Does `pages/<lab-name>.page.ts` exist? → set `HAS_POM = true/false`
- Does `tests/<lab-name>/<lab-name>.spec.ts` exist? → set `HAS_SPEC = true/false`

Print:

```
  POM:  ✅ exists  /  ❌ missing
  Spec: ✅ exists  /  ❌ missing
```

---

### Step 3 — Generate POM (locator-mapper)

**Skip if:** `HAS_POM = true` → print `⏭ Step 3 skipped — POM already exists`

**If skipped:** proceed to Step 4.

**Otherwise**, execute all phases from `locator-mapper`:

1. Navigate to `https://stagecraftlabs.com<url-path>` via Playwright MCP
2. Screenshot + accessibility snapshot
3. Chrome DevTools MCP: query all interactive selectors + validation constraints + event listeners
4. Build locator priority ranking for each element
5. Generate and write `pages/<lab-name>.page.ts` (include file inputs + dynamically-injected
   error/success regions; treat aria-describedby-anchor ids as semantic, not fragile)
6. Print audit summary incl. the coverage-completeness check — every discovered element is mapped

---

### Step 3.5 — Register Fixture (fixtures/index.ts)

**Skip if:** `fixtures/index.ts` already contains an import for `<LabName>Page` from the generated POM.
→ print `⏭ Step 3.5 skipped — fixture already registered`

**Otherwise:**

1. Read `fixtures/index.ts`
2. Add the import at the top of the file:
   ```typescript
   import { <LabName>Page } from '../pages/<lab-name>.page';
   ```
3. Add the fixture type entry inside the `Fixtures` type block:
   ```typescript
   <labFixture>: <LabName>Page;
   ```
4. Add the fixture implementation inside the `test.extend<Fixtures>({...})` block:
   ```typescript
   <labFixture>: async ({ page }, use) => {
     await use(new <LabName>Page(page));
   },
   ```
5. Write the updated `fixtures/index.ts`
6. Print: `✅ Step 3.5 done — <labFixture> registered in fixtures/index.ts`

**Name derivation:** camelCase the lab name for the fixture key and PascalCase for the class name.
Example: `forms-validation` → fixture key `formsValidationPage`, class `FormsValidationPage`.

---

### Step 4 — Mark In Progress (jira-sync operation 1)

**Skip if:** JIRA story status is already `In Progress`, `In Review`, or `Done`
→ print `⏭ Step 4 skipped — story already at <status>`

**Otherwise:**

1. Fetch current story status via Atlassian MCP
2. Transition to `In Progress`
3. Post comment:

```
🚧 STLC Pipeline started (<timestamp>)

POM: pages/<lab-name>.page.ts — ✅ generated / ⏭ already existed
Spec: tests/<lab-name>/<lab-name>.spec.ts — pending generation
Pipeline running end-to-end (no manual checkpoints).
```

---

### Step 5 — Generate Spec (test-case-generator)

**Skip if:** `HAS_SPEC = true` → print `⏭ Step 5 skipped — spec already exists`

**If skipped:** proceed to Step 6.

**Otherwise**, execute all phases from `test-case-generator`:

1. Use the ACs + derived negative/boundary requirements from Step 1 (do not re-fetch)
2. Read `pages/<lab-name>.page.ts`
3. Map each AC → one `test.describe()` containing positive + negative + boundary + data-driven
   cases (Phase 4) — **NOT** a single happy-path `test()` per AC
4. Build test data: faker for valid values, typed tables for invalid/boundary (Phase 4b)
5. Import `test`/`expect` from `fixtures/index` and consume the POM fixture (Gap #3)
6. Append multi-state accessibility scans (load + error + success, Phase 5) and a
   `@performance` budget test (Phase 5b)
7. Write `tests/<lab-name>/<lab-name>.spec.ts`; print case-type counts (P/N/B/D/A11y/Perf)

---

### Step 6 — Run Tests (Playwright CLI)

Execute:

```
npx playwright test tests/<lab-name>/<lab-name>.spec.ts --reporter=json,list
```

Capture the exit code and output.

- **Exit 0** (all pass): set `RUN_RESULT = pass`
- **Exit non-zero** (failures exist): set `RUN_RESULT = fail`

---

### Step 7 — Triage or Celebrate

**If `RUN_RESULT = fail`**, execute all phases from `test-triage`:

1. Parse the JSON report
2. Categorize each failure (Selector / Logic / Environment / Flaky / Accessibility)
3. Print triage table
4. Post a JIRA comment on `TAB1-XX` with the failure summary (triage Phase 4)
5. File & link defects for defect-worthy failures — Logic / Accessibility / persistent Selector →
   `createJiraIssue` (Bug) + `createIssueLink` to the story; record in the RTM (triage Phase 4b).
   Flaky → quarantine, Environment → infra task — neither files a product Bug.
6. **Do NOT transition story status** — leave at `In Progress`

Print:

```
⚠️  Pipeline completed with failures.
    Fix the issues above and re-run the pipeline — it will skip Steps 1–5
    (artifacts already exist) and go straight to Step 6.
```

**If `RUN_RESULT = pass`**, print the pass summary and proceed to Step 8.

---

### Step 8 — Push Branch & Open PR (git + GitHub CLI)

**Skip if:** an open PR already exists for this lab —
`gh pr list --head stlc/<lab-name> --state open --json number,url,headRefName`.

- If found: reuse it. If any generated file changed since its last commit, stage + commit +
  `git push` to the same branch (fires a `synchronize` event → a fresh CI run).
  → print `⏭ Step 8 skipped — reusing open PR #<N> (<url>)` or
  `✅ Step 8 done — pushed new commit to existing PR #<N>`.
- If the branch exists locally/remotely but no PR is open (a prior run was aborted before PR
  creation), checkout the branch and proceed from sub-step 6 below.

**Otherwise:**

1. Refresh the RTM now, so it ships with the PR: run `rtm-generator` for `TAB1-XX` →
   writes `docs/rtm/<lab-name>.rtm.md`
2. Create the branch from `main`: `git checkout -b stlc/<lab-name>`
3. Stage only the generated paths — never `git add -A`:
   ```
   git add pages/<lab-name>.page.ts fixtures/index.ts tests/<lab-name>/<lab-name>.spec.ts \
     docs/test-plan/<lab-name>.test-plan.md docs/rtm/<lab-name>.rtm.md
   ```
4. Commit: `feat: add <Lab Name> lab tests and POM (TAB1-XX)`
5. Push: `git push -u origin stlc/<lab-name>`
6. Open the PR:
   ```
   gh pr create --base main --head stlc/<lab-name> \
     --title "feat: add <Lab Name> lab tests and POM (TAB1-XX)" \
     --body "<AC coverage summary, test counts, RTM link, 'Refs TAB1-XX'>"
   ```
7. Record the PR number and URL — later steps and JIRA comments reference it.

---

### Step 9 — Transition to In Review (jira-sync operation 3)

**Only reached if `RUN_RESULT = pass` locally.** A local pass is **not** CI evidence, so this
step moves the story to `In Review`, not `Done` — Done is only reached in Step 12b once real
CI evidence exists.

1. Fetch available transitions via Atlassian MCP
2. Transition `TAB1-XX` → `In Review`
3. Post comment (includes the PR link from Step 8):

```
🔍 In Review — Local Tests Passing (<timestamp>)

Spec: tests/<lab-name>/<lab-name>.spec.ts
Tests: X / X passing locally (<project run>)
RTM: docs/rtm/<lab-name>.rtm.md
PR: <PR URL from Step 8>
Open defects: <N>  (from triage Phase 4b — must be 0 non-flaky to reach Done)
All JIRA ACs covered:
  ✅ AC-1: <text>
  ...
Pending: GitHub Actions CI run on PR #<N> to confirm → then Done.
```

---

### Step 10 — Wait for CI

The workflow (`.github/workflows/playwright.yml`) scopes PRs from an `stlc/<lab-name>` branch to
`npx playwright test --project="<project>" tests/<lab-name>` — only this lab's spec runs, not the
full suite. Pushes to `main` (post-merge) and non-`stlc/*` branches still run the full suite as a
regression net. This makes Step 10 fast and immune to unrelated pre-existing failures elsewhere
in the repo.

1. Resolve the workflow run for the PR's branch:
   ```
   gh run list --branch stlc/<lab-name> --workflow=playwright.yml --limit 1 \
     --json databaseId,status,conclusion,headSha
   ```
2. Block until it finishes: `gh run watch <databaseId> --exit-status`. Even scoped to one lab, a
   fresh 4-browser install can take a few minutes — run this via Bash with `run_in_background` if
   a single call risks exceeding the tool timeout.
3. Record the overall run conclusion, but do **not** gate Done on it alone — Step 11 determines
   the lab-specific result. Even with scoped CI, a job can still fail for infra reasons unrelated
   to this lab's tests; a failure there must not block this lab's Done.

---

### Step 11 — Parse Lab-Specific CI Result

The workflow already uploads a `playwright-report-<project>` artifact per browser, containing
`playwright-report/results.json` from the repo's existing JSON reporter — no workflow or
`playwright.config.ts` changes are needed.

For each of the 4 projects (`Desktop Chrome`, `Desktop Firefox`, `Desktop Edge`, `Desktop Safari`):

1. `gh run download <databaseId> -n "playwright-report-<project>" -D <tmp-dir>/<project>`
2. Read `<tmp-dir>/<project>/playwright-report/results.json`
3. Walk `suites` recursively to find specs whose `file` matches
   `tests/<lab-name>/<lab-name>.spec.ts`
4. Confirm every test in that spec file has a final `status` of `expected`/`passed`

Set `CI_LAB_RESULT = pass` only if every project confirms all of this lab's tests passed.
Otherwise `CI_LAB_RESULT = fail` — record exactly which project(s)/test(s) failed.

This filter-by-spec-file logic stays in place even though CI is now scoped per-lab: it is a cheap
safety net for the rare case a run isn't scoped (workflow_dispatch, a non-`stlc/*` branch, or a
future workflow change), and it costs nothing when the report already only contains this lab's
tests.

---

### Step 12a — CI-Failure Triage (only if `CI_LAB_RESULT = fail`)

Reuse `test-triage`'s categorization phases, sourcing failures from the downloaded CI JSON
report instead of a local run:

1. Categorize each CI-specific failure (Selector / Logic / Environment / Flaky / Accessibility)
2. Post a JIRA comment on `TAB1-XX` with the CI run URL and per-browser failure summary
3. File & link defects per the same rules as Step 7 (triage Phase 4b)
4. **Do NOT transition story status** — leave at `In Review`

Print:

```
⚠️  Pipeline completed — local tests passed but CI failed for this lab.
    PR #<N>: <url>
    Fix the issues above, push to the same branch, and re-run the pipeline —
    it will reuse PR #<N> (Step 8) and jump straight to Step 10.
```

---

### Step 12b — Transition to Done (only if `CI_LAB_RESULT = pass`)

jira-sync operation 4, triggered by real evidence — never a self-reported yes/no:

1. Confirm no non-flaky defect from Phase 4b (local or CI) is open
2. Transition `TAB1-XX` → `Done`
3. Post comment:

```
✅ Done — CI Verified (<timestamp>)

PR: <PR URL> (open — merge is a manual step, not performed by this pipeline)
CI run: <run URL> — all 4 browsers passing for this lab
STLC closure: JIRA ACs → POM → spec → RTM → CI green across all browsers.
Open blocking defects: 0
```

Never transition to Done while a non-flaky defect linked to the story is still open, and never
merge the PR — that decision belongs to a human reviewer.

---

### Step 13 — Pipeline Report

Print the final report regardless of pass/fail:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 STLC Pipeline Report — <Lab Name> (<JIRA Key>)
 Finished: <timestamp>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Step 1   Fetch Requirements    ✅  X ACs retrieved
 Step 1b  Generate Test Plan    ✅ written  /  ⏭ skipped (exists)
 Step 2   State Check           ✅  POM: <exists/missing>  Spec: <exists/missing>
 Step 3   Generate POM          ✅ generated  /  ⏭ skipped
 Step 3.5 Register Fixture      ✅ registered  /  ⏭ skipped (already present)
 Step 4   Mark In Progress      ✅ transitioned  /  ⏭ skipped
 Step 5   Generate Spec         ✅ X tests written  /  ⏭ skipped
 Step 6   Run Tests             ✅ X/X passing  /  ❌ X failures
 Step 7   Triage                ✅ all green  /  ⚠️ X failures (Bugs filed, JIRA comment posted)
 Step 8   Push Branch & Open PR ✅ PR #<N> opened  /  ⏭ reused existing PR #<N>
 Step 9   Transition to Review  ✅ TAB1-XX → In Review (+ PR link)  /  ⏭ skipped (failures pending)
 Step 10  Wait for CI           ✅ run <id> concluded <conclusion>
 Step 11  Parse Lab CI Result   ✅ X/X browsers passing for this lab  /  ❌ failed on <project(s)>
 Step 12  Done or CI Triage     ✅ TAB1-XX → Done  /  ⚠️ CI-failure triage (Bugs filed, JIRA comment posted)

 PR: <PR URL> — open, unmerged (merge is a manual step)
 Outcome: ✅ DONE — CI verified per-browser for this lab  /
          ⚠️ CI FAILURES — fix, push to PR branch, re-run (resumes at Step 10)  /
          ⚠️ LOCAL FAILURES — re-run after fixes (resumes at Step 6)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Re-run Behaviour

When the pipeline is re-run on the same lab after fixing **local** failures:

- Step 1b is skipped (test plan exists)
- Step 3 is skipped (POM exists)
- Step 5 is skipped (spec exists)
- Execution jumps straight to Step 6 → 7 → 8

When re-run after fixing a **CI-specific** failure (Step 12a triage, local run already passed):

- Steps 1b/3/5 are skipped as above
- Step 8 is skipped — reuses the existing open PR, pushing the fix as a new commit
  (this alone re-triggers CI via the PR's `synchronize` event)
- Step 9 is skipped if the story is already `In Review`
- Execution jumps straight to Step 10 → 11 → 12

To force regeneration of the POM or spec, the user must explicitly delete the file
or say "regenerate POM" / "regenerate spec" before re-running.

---

## Abort Conditions

Stop the pipeline immediately (do not proceed to the next step) if:

| Condition                                                     | Message                                                                 |
| ------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Pre-flight tool check fails                                   | List missing tools; full stop                                           |
| Lab already built (spec exists) and no override language used | Print JIRA status + PR state; full stop (see Already-Done Check)        |
| `gh` CLI missing or unauthenticated                           | Report `gh auth status` output; full stop                               |
| JIRA story not found                                          | Confirm the key is correct; full stop                                   |
| Lab URL returns 404 or auth wall                              | Report URL issue; full stop                                             |
| `npx playwright test` command not found                       | Check Node/npm setup; full stop                                         |
| `pages/` or `tests/` directory missing                        | Confirm project root; full stop                                         |
| `git push` / `gh pr create` fails                             | Report the error (auth, branch protection, conflicts); full stop        |
| CI run fails to start / GitHub API unreachable                | Log the error; leave story at `In Review`; never assume pass; full stop |

For all other errors (a single test failure, a POM audit flag, a flaky failure): log and
continue — do not abort the pipeline.

---

## Quick-Start Prompt Template

```
User says: "run stlc-pipeline for TAB1-13"

1. Resolve: TAB1-13 → Forms & Validation → /practice/forms-validation
2. Pre-flight: verify Atlassian MCP + Playwright MCP + Chrome DevTools MCP + Playwright CLI + gh CLI
2.5. Pre-flight: Already-Done Check — if tests/forms-validation/forms-validation.spec.ts exists
     and the request has no override language, print JIRA status + PR state and full stop
3. Step 1: fetch ACs from JIRA TAB1-13
4. Step 1b: generate Test Plan (skip if it exists)
5. Step 2: check POM + spec existence
6. Step 3: locator-mapper (skip if POM exists)
6.5. Step 3.5: register fixture in fixtures/index.ts (skip if already present)
7. Step 4: jira-sync → In Progress (skip if already past To Do)
8. Step 5: test-case-generator from TAB1-13 ACs (skip if spec exists)
9. Step 6: npx playwright test tests/forms-validation/forms-validation.spec.ts
10. Step 7: triage failures + file/link Bugs + JIRA comment (or celebrate if all pass)
11. Step 8: refresh RTM, push stlc/forms-validation branch, gh pr create (skip/reuse if PR open)
12. Step 9: jira-sync → In Review (comment includes PR link)
13. Step 10: gh run watch — block until the PR's CI run finishes
14. Step 11: gh run download per browser, parse results.json for this lab's spec file
15. Step 12: CI_LAB_RESULT pass → jira-sync → Done (with CI evidence) / fail → CI-failure triage, stay In Review
16. Step 13: print pipeline report (includes PR URL, left open for manual review/merge)
```
