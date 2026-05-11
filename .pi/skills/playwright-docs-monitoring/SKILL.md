---
name: playwright-docs-monitoring
description: Run the current Playwright docs-monitoring spec, diagnose sidebar/content drift, update local docs and text snapshots only when failures are confirmed documentation changes.
---

# Skill: Playwright Docs Monitoring

Use this skill when the task is to run, triage, or fix failures from:

```text
tests/scrapper/playwright-docs-link-monitoring.spec.ts
```

This spec monitors live `playwright.dev` documentation against local baselines. It is a text and documentation workflow, not an image snapshot workflow.

---

## What This Spec Checks

### 1. Sidebar URL Drift

Source data:

```text
fixtures/playwright-docs-links/sidebar-links.json
```

For each stored source page, the test:

1. Opens the live page.
2. Waits for the `Docs sidebar` region.
3. Expands collapsed sidebar sections.
4. Collects every sidebar link.
5. Compares live links with the JSON baseline.

Failures mean:

- `URLs added`: add confirmed new URLs to the relevant array in `sidebar-links.json`.
- `URLs removed`: remove confirmed removed URLs from the relevant array in `sidebar-links.json`.

### 2. Page Content Snapshots

Source URLs are all unique URLs from `sidebar-links.json`.

For each URL, the test:

1. Opens the live page.
2. Extracts normalized text from `article:not(.yt-lite)`.
3. Compares the normalized text to a `.txt` snapshot under `fixtures/reference-snapshots/`.

Failures mean the live docs article text changed, or the page did not load into the expected docs article state.

---

## Run Command

Always run from the repository root.

```bash
npx playwright test tests/scrapper/playwright-docs-link-monitoring.spec.ts --project="Desktop Chrome"
```

The spec imports `test` and `expect` from `@playwright/test` directly. It does not use custom fixtures.

The repo config also defines `Desktop Firefox`, but this spec skips non-`Desktop Chrome` projects at runtime.

---

## Generated Failure Summary

When one or more monitored checks fail, the spec can write this file at the repository root:

```text
PW-DOCS-CHECK.md
```

It contains:

- Generation timestamp.
- Failed test count.
- A markdown table with test name, URL, expected result, and actual result.

Treat this file as a diagnostic artifact. Do not rely on it alone; inspect the Playwright failure output and relevant attached diffs before editing docs or snapshots.

---

## Failure Triage

Classify failures before changing files.

### A. Transient Network or Navigation Failure

Examples:

```text
net::ERR_CONNECTION_RESET
page.goto failed
Timeout waiting for navigation
Timeout waiting for article/sidebar
```

Action:

1. Do not update docs, JSON, or snapshots.
2. Rerun only the failed test:

   ```bash
   npx playwright test tests/scrapper/playwright-docs-link-monitoring.spec.ts --project="Desktop Chrome" --grep "<failed slug or title>"
   ```

3. If the focused rerun passes, report the failure as transient.
4. If it repeatedly fails, inspect whether the live page moved, was removed, changed structure, or returned a non-docs response.

### B. Sidebar URL Drift Failure

Failure title pattern:

```text
sidebar links match baseline - <sourcePage>
```

Action:

1. Read the assertion message for `URLs added` and `URLs removed`.
2. Confirm the live sidebar really changed.
3. Update only the relevant source page entry in:

   ```text
   fixtures/playwright-docs-links/sidebar-links.json
   ```

4. Keep JSON valid and ordered consistently with the live sidebar where practical.
5. For added URLs, map each URL to a local docs file and add or update local docs if the page belongs in the local docs set.
6. For removed URLs, remove stale text snapshots only when the URL is no longer present in any `sidebar-links.json` array.
7. Rerun the full docs-monitoring command.

### C. Page Content Snapshot Drift Failure

Failure title pattern:

```text
content unchanged - <urlSlug>
```

Action:

1. Inspect the attached `content-diff.txt` from the terminal output or HTML report.
2. Inspect the actual text file path shown in the failure, usually under:

   ```text
   test-results/
   ```

3. Map the live URL to the local markdown file under `docs/`.
4. Update the local markdown file first.
5. Run Prettier on edited markdown files.
6. Accept the matching text snapshot with a focused `--update-snapshots` run.
7. Rerun the focused test without `--update-snapshots`.
8. Rerun the full docs-monitoring command.

Do not accept a snapshot if the live change is unexplained or looks like a broken page, bot protection, an error banner, a partial load, or a network issue.

---

## URL-to-Local-Docs Mapping

| Live URL pattern                            | Local docs path         |
| ------------------------------------------- | ----------------------- |
| `https://playwright.dev/docs/api/class-foo` | `docs/api/class-foo.md` |
| `https://playwright.dev/docs/foo`           | `docs/guides/foo.md`    |
| `https://playwright.dev/mcp/foo`            | `docs/mcp/foo.md`       |
| `https://playwright.dev/agent-cli/foo`      | `docs/agent-cli/foo.md` |

Examples:

```text
https://playwright.dev/mcp/configuration-browser-extension
-> docs/mcp/configuration-browser-extension.md
```

```text
https://playwright.dev/agent-cli/commands-attach
-> docs/agent-cli/commands-attach.md
```

If only the slug is visible in the failure title, recover the URL by searching `fixtures/playwright-docs-links/sidebar-links.json` and applying the spec slug logic:

```ts
url
  .replace(/https?:\/\//, '')
  .replace(/[^a-zA-Z0-9]/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '');
```

---

## Safe Snapshot Update Procedure

Update local docs first, then update snapshots.

Focused update:

```bash
npx playwright test tests/scrapper/playwright-docs-link-monitoring.spec.ts --project="Desktop Chrome" --grep "<failed slug or exact test title>" --update-snapshots
```

Focused verification:

```bash
npx playwright test tests/scrapper/playwright-docs-link-monitoring.spec.ts --project="Desktop Chrome" --grep "<failed slug or exact test title>"
```

Full verification:

```bash
npx playwright test tests/scrapper/playwright-docs-link-monitoring.spec.ts --project="Desktop Chrome"
```

If multiple related content snapshots failed and each live docs change was reviewed, it is acceptable to update them in one focused grep pattern. Do not run a blind full `--update-snapshots` unless the full failure set has already been reviewed and all changes are intentional.

---

## Verification

For edited markdown docs:

```bash
npx prettier --check <edited-doc-files>
```

For edited JSON:

```bash
node -e "JSON.parse(require('fs').readFileSync('fixtures/playwright-docs-links/sidebar-links.json', 'utf8'))"
```

Final checks after docs-monitoring changes:

```bash
npx playwright test tests/scrapper/playwright-docs-link-monitoring.spec.ts --project="Desktop Chrome"
git diff --stat
git diff
```

The final full spec should pass. The diff should contain only expected changes to local docs, `sidebar-links.json`, and affected reference snapshots.

---

## Do Not Do

- Do not fix transient network failures by changing docs or snapshots.
- Do not run `--update-snapshots` before inspecting the failure diff.
- Do not update every snapshot blindly.
- Do not change unrelated docs.
- Do not delete local docs files unless the URL was removed and the user agrees the local page should be removed.
- Do not leave generated outputs staged as source changes.
- Do not skip the final full docs-monitoring spec run when behavior or baselines changed.
