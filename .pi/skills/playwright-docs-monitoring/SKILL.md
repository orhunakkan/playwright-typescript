---
name: playwright-docs-monitoring
description: Run the Playwright docs monitoring spec, diagnose sidebar/content drift, update local docs and reference snapshots only when failures are confirmed documentation changes.
---

# Skill: Playwright Docs Monitoring

Use this skill when the task is to run or fix failures from:

```text
tests/pw-documents/playwright-docs-link-monitoring.spec.ts
```

This spec monitors live `playwright.dev` documentation against local baselines. It is a text/documentation workflow, not visual regression. Do **not** use Docker visual snapshot commands for this spec.

---

## What This Spec Checks

The spec has two independent checks.

### 1. Sidebar URL Drift

Source data:

```text
fixtures/playwright-docs-links/sidebar-links.json
```

For each stored source page, the test opens the live page, expands the docs sidebar, collects sidebar links, and compares them with the JSON baseline.

Failures mean:

- `URLs added` — add the URL to the relevant array in `sidebar-links.json`.
- `URLs removed` — remove the URL from the relevant array in `sidebar-links.json`.

### 2. Page Content Snapshots

Source URLs are all unique URLs from `sidebar-links.json`.

For each URL, the test opens the live page, extracts normalized text from:

```text
article:not(.yt-lite)
```

and compares it to text snapshots in:

```text
fixtures/reference-snapshots/playwright-docs-link-monitoring.spec.ts/
```

Failures mean the live docs article text changed. If the change is valid, update the matching local markdown file under `docs/`, then accept the corresponding text snapshot.

---

## Run Command

Always run from the repository root.

```bash
npx playwright test tests/pw-documents/playwright-docs-link-monitoring.spec.ts --project="Desktop Chrome"
```

This spec intentionally imports `test` and `expect` from `@playwright/test`; it does not use page-object fixtures.

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

1. Do **not** update docs, JSON, or snapshots.
2. Rerun only the failed test with `--grep`:

   ```bash
   npx playwright test tests/pw-documents/playwright-docs-link-monitoring.spec.ts --project="Desktop Chrome" --grep "<failed slug or title>"
   ```

3. If the focused rerun passes, report it as transient.
4. If it repeatedly fails, inspect whether the live page moved, was removed, or has changed structure before editing baselines.

### B. Sidebar URL Drift Failure

Failure title pattern:

```text
sidebar links match baseline — <sourcePage>
```

Action:

1. Read the assertion message for `URLs added` and `URLs removed`.
2. Update only the relevant source page entry in:

   ```text
   fixtures/playwright-docs-links/sidebar-links.json
   ```

3. Keep JSON valid and sorted consistently with the live sidebar order when possible.
4. For added URLs, map each URL to a local docs file and add/update local docs if the page is part of the local docs set.
5. For removed URLs, remove stale reference snapshot files for URLs that are no longer present in any `sidebar-links.json` array.
6. Run the full docs-monitoring spec after the JSON/docs changes.

### C. Page Content Snapshot Drift Failure

Failure title pattern:

```text
content unchanged — <urlSlug>
```

Action:

1. Inspect the attached `content-diff.txt` in the terminal output or HTML report.
2. Inspect the actual text file path shown in the failure, usually:

   ```text
   test-results/<failure-folder>/<slug>-actual.txt
   ```

3. Map the live URL to the local markdown file under `docs/`.
4. Update the local markdown file first.
5. Run Prettier on edited markdown files.
6. Accept the matching text snapshot with a focused `--update-snapshots` run.
7. Rerun the full spec without `--update-snapshots`.

Do **not** accept a snapshot if the live change is unexplained or looks like a broken page, bot protection, error banner, partial load, or network issue.

---

## URL-to-Local-Docs Mapping

Use these mappings to find the local markdown file.

| Live URL pattern                            | Local docs path         |
| ------------------------------------------- | ----------------------- |
| `https://playwright.dev/docs/api/class-foo` | `docs/api/class-foo.md` |
| `https://playwright.dev/docs/foo`           | `docs/guides/foo.md`    |
| `https://playwright.dev/mcp/foo`            | `docs/mcp/foo.md`       |
| `https://playwright.dev/agent-cli/foo`      | `docs/agent-cli/foo.md` |

Examples:

```text
https://playwright.dev/mcp/configuration-browser-extension
→ docs/mcp/configuration-browser-extension.md
```

```text
https://playwright.dev/agent-cli/commands-attach
→ docs/agent-cli/commands-attach.md
```

If only the slug is visible in the failure title, recover the URL by searching `fixtures/playwright-docs-links/sidebar-links.json` and applying the spec's slug logic:

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

Preferred focused command:

```bash
npx playwright test tests/pw-documents/playwright-docs-link-monitoring.spec.ts --project="Desktop Chrome" --grep "<failed slug or exact test title>" --update-snapshots
```

Then verify with the full non-update run:

```bash
npx playwright test tests/pw-documents/playwright-docs-link-monitoring.spec.ts --project="Desktop Chrome"
```

If multiple related content snapshots failed and each live docs change was reviewed, it is acceptable to update them in one focused grep pattern. Do not run a blind full `--update-snapshots` unless the full failure set has already been reviewed and all changes are intentional.

---

## Verification

After making changes, run the relevant checks.

For edited markdown docs:

```bash
npx prettier --check <edited-doc-files>
```

For edited JSON:

```bash
node -e "JSON.parse(require('fs').readFileSync('fixtures/playwright-docs-links/sidebar-links.json', 'utf8'))"
```

Final required verification:

```bash
npx playwright test tests/pw-documents/playwright-docs-link-monitoring.spec.ts --project="Desktop Chrome"
git diff --stat
git diff
```

The final full spec must pass. The diff should contain only expected changes to local docs, `sidebar-links.json`, and affected reference snapshots.

---

## Do Not Do

- Do not fix transient network failures by changing docs or snapshots.
- Do not run `--update-snapshots` before inspecting the failure diff.
- Do not update every snapshot blindly.
- Do not change unrelated docs.
- Do not delete local docs files unless the URL was removed and the user agrees the local page should be removed.
- Do not leave `test-results/`, `playwright-report/`, or `allure-results/` changes staged as source changes.
- Do not skip the final full docs-monitoring spec run.
