# Defect log

Every defect found while building the Agentic Job Board (PLAN.md Phase 8 task 2), in the owner's `DEF-###` format. Numbering continues after DEF-001 to DEF-004, which this repository's older history already uses for an earlier project. Severity follows [`test-strategy.md`](test-strategy.md) §10. Each fix comes with a regression test that fails before the fix and passes after it.

## Summary

| ID      | Title                                                                 | Severity | Found by                | Status | Fix commit |
| ------- | --------------------------------------------------------------------- | -------- | ----------------------- | ------ | ---------- |
| DEF-005 | `prettier --check` fails on a fresh Windows checkout                  | Medium   | Static gate (Phase 0)   | Fixed  | `8e47927`  |
| DEF-006 | Coverage gate can't pass: database code counted at 0 %                | Medium   | Coverage gate (Phase 3) | Fixed  | `792d2f2`  |
| DEF-007 | A repeat sighting keeps a job's old title, location and flags         | Medium   | Owner review (CP-3)     | Fixed  | `5a61ef1`  |
| DEF-008 | "1 school alum" can be stored as a job's location                     | Medium   | Live run (Phase 5)      | Fixed  | `73578ee`  |
| DEF-009 | Every board form is refused with 403 in a real browser                | High     | E2E suite (Phase 6)     | Fixed  | `02e20f9`  |
| DEF-010 | The return-path guard lets dot segments collapse into `//`            | Low      | Code review (Phase 6)   | Fixed  | `5767497`  |
| DEF-011 | A board page past the end shows "No new jobs" while jobs exist        | Medium   | Code review (Phase 6)   | Fixed  | `5767497`  |
| DEF-012 | Status notices are not announced, and focus is lost after a form post | Low      | Code review (Phase 6)   | Fixed  | `5767497`  |
| DEF-013 | Every card's buttons and LinkedIn link have the same accessible name  | Low      | Code review (Phase 6)   | Fixed  | `5767497`  |

Open defects: none.

## Details

### DEF-005: `prettier --check` fails on a fresh Windows checkout

- **Severity:** Medium (a quality gate fails for reasons unrelated to the code)
- **Steps:** clone the repository on Windows with `core.autocrlf=true`, run `npm ci`, then `npm run format:check`.
- **Expected:** every file passes.
- **Actual:** every file is reported, because Git checked them out with CRLF line endings and Prettier expects LF.
- **Fix:** `.gitattributes` forces LF on checkout (DEC-014). **Status:** Fixed in `8e47927`.

### DEF-006: Coverage gate can't pass: database code counted at 0 %

- **Severity:** Medium
- **Steps:** run `npm run test:unit` with coverage after Phase 3.
- **Expected:** the coverage thresholds of PLAN.md §8.3 reflect how well the code is tested.
- **Actual:** overall line coverage was 39 % and the ingest service 0 %, because database code is tested in the integration project, which unit-only coverage ignores.
- **Fix:** coverage is measured over every Vitest project together (`npm run test:coverage`); the thresholds are unchanged (DEC-021). **Status:** Fixed in `792d2f2`.

### DEF-007: A repeat sighting keeps a job's old title, location and flags

- **Severity:** Medium
- **Steps:** ingest an email with a job, then a newer email where the same job shows "This company is actively hiring".
- **Expected:** the board shows the current flags.
- **Actual:** only the first sighting's details were kept.
- **Fix:** a sighting from a newer email refreshes the title, company, location and flags; an older one only widens first and last seen (DEC-023). **Status:** Fixed in `5a61ef1`.

### DEF-008: "1 school alum" can be stored as a job's location

- **Severity:** Medium
- **Steps:** ingest a digest where a job block has no location line and the insight line `1 school alum`.
- **Expected:** the location is empty.
- **Actual:** the location is `1 school alum`. The parser knew `N company alum(ni)` but not this newer school variant, first seen in the owner's emails on 2026-10-22 during the Phase 5 live run.
- **Fix:** the insight pattern accepts `company` or `school` alumni lines; unit tests cover both. **Status:** Fixed in `73578ee`.

### DEF-009: Every board form is refused with 403 in a real browser

- **Severity:** High (FR-08 and FR-09 can't be used from the UI)
- **Steps:** open the board in Chromium and click **Save** on a card.
- **Expected:** the job moves to Saved.
- **Actual:** a 403 "Requests from other sites are not allowed" page. With `Referrer-Policy: no-referrer`, browsers send `Origin: null` on the app's own form posts, and the cross-site guard correctly refuses a null origin. The API tests didn't catch it because they set headers by hand; the E2E suite did.
- **Fix:** `Referrer-Policy: same-origin` (DEC-029). Links to other sites still send no referrer. **Status:** Fixed in `02e20f9`.

### DEF-010: The return-path guard lets dot segments collapse into `//`

- **Severity:** Low (not exploitable: the route reparses the result and redirects to a local path)
- **Steps:** call `safeReturnPath('/.//evil.example', '/x')`.
- **Expected:** `/x` (refused).
- **Actual:** `//evil.example`, a protocol-relative URL, because URL parsing removes the `.` segment after the check.
- **Fix:** the parsed path is checked again. Unit tests cover `/.//`, `/a/..//` and `/%2e%2e//`. **Status:** Fixed in `5767497`.

### DEF-011: A board page past the end shows "No new jobs" while jobs exist

- **Severity:** Medium
- **Steps:** with 51 new jobs, open page 2 and dismiss its only job.
- **Expected:** the board shows the last page that has jobs.
- **Actual:** an empty page with "No new jobs. Run /find-jobs…" and no pager.
- **Fix:** the page number is clamped to the last page (DEC-030). **Status:** Fixed in `5767497`.

### DEF-012: Status notices are not announced, and focus is lost after a form post

- **Severity:** Low (accessibility, NFR-06)
- **Steps:** with a screen reader, dismiss a card in the middle of the board.
- **Expected:** the result is announced, and focus lands near where the user was.
- **Actual:** a `role="status"` message on a freshly loaded page is not announced, and focus goes back to the top of the page.
- **Fix:** redirects end in `#notice`, and the notice can take focus; an E2E test checks that it does. **Status:** Fixed in `5767497`.

### DEF-013: Every card's buttons and LinkedIn link have the same accessible name

- **Severity:** Low (accessibility, NFR-06)
- **Steps:** list the board's buttons with a screen reader.
- **Expected:** each button says which job it acts on.
- **Actual:** dozens of identical "Save", "Dismiss" and "Open on LinkedIn" entries.
- **Fix:** each button and link carries the job title in visually hidden text. **Status:** Fixed in `5767497`.
