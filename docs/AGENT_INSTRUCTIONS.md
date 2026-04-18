# Agent Instructions — Generate Playwright Study Guides

## Goal

Convert every Playwright docs page snapshot into a well-structured Markdown study guide.
One source page → one `.md` file. Do NOT skip any page. Do NOT batch or summarize multiple pages into one file.

There are **194 source pages** in total. **193 files** need to be created (1 already exists — see Skip List).

---

## Source Location

All source files live under:

```
fixtures/reference-snapshots/playwright-docs-link-monitoring.spec.ts/
```

Each subfolder contains exactly one `.txt` file (e.g. `Desktop-Chrome-playwright-dev-docs-locators.txt`).
That `.txt` file is the raw scraped text of the official Playwright page. Read it to produce the study guide.

---

## Output Structure

Create files under `docs/` divided into 4 subfolders based on the URL slug in the folder name:

| URL pattern in folder name                         | Output subfolder  |
| -------------------------------------------------- | ----------------- |
| `playwright-dev-docs-api-*`                        | `docs/api/`       |
| `playwright-dev-docs-*` (anything else under docs) | `docs/guides/`    |
| `playwright-dev-mcp-*`                             | `docs/mcp/`       |
| `playwright-dev-agent-cli-*`                       | `docs/agent-cli/` |

### Deriving the output filename

Strip everything up to and including `playwright-dev-` from the URL slug at the end of the folder name,
then replace remaining `-` with `-` (keep as-is) and append `.md`.

Examples:

| Folder name ends with                        | Output file                             |
| -------------------------------------------- | --------------------------------------- |
| `playwright-dev-docs-test-retries`           | `docs/guides/test-retries.md`           |
| `playwright-dev-docs-api-class-locator`      | `docs/api/class-locator.md`             |
| `playwright-dev-mcp-introduction`            | `docs/mcp/introduction.md`              |
| `playwright-dev-agent-cli-sessions`          | `docs/agent-cli/sessions.md`            |
| `playwright-dev-docs-getting-started-vscode` | `docs/guides/getting-started-vscode.md` |

---

## Skip List

This file already exists — do NOT recreate it:

- `docs/study-test-retries.md` (covers `playwright-dev-docs-test-retries`)

---

## Markdown Format

Follow this structure for every file. Adapt section count to the content — not every page will have all sections.

```markdown
# <emoji> Playwright — <Page Title>

> **Source:** [playwright.dev/<path>](https://playwright.dev/<path>)

---

## <Section from page>

<content>

---

## <Another section>

<content>

---

## 🗂️ Quick Reference

| What | How |
| ---- | --- |
| ...  | ... |
```

### Rules

- **Title emoji:** Pick one relevant emoji for the page topic. Use it once, in the H1 only.
- **Source link:** Always include at the top, using the URL slug from the folder name.
- **Section headers:** Match the actual headings from the source page. Don't invent structure.
- **Code blocks:** Always include language hints (` ```ts `, ` ```bash `, ` ```json `). Copy code exactly — do not paraphrase or shorten.
- **Worker/flow diagrams:** Render as plain text inside fenced code blocks (no language tag).
- **Callouts:** Use `>` blockquotes for important notes, tips, and warnings from the source.
- **Quick Reference table:** Add at the bottom only if there are ≥3 distinct configurable options or commands. Skip it for pure API reference pages.
- **Bold:** Use for key terms on first use, config option names, and important constraints.
- **No invented content:** Every sentence must trace back to the source `.txt`. Do not add your own explanations.
- **No comments in code blocks:** Do not add `// note:` or similar annotations not present in the source.
- **Colorful but restrained:** One emoji per H2 section maximum. No emoji inside body text or code.

### Emoji guide (suggestions, not mandatory)

| Topic                 | Emoji |
| --------------------- | ----- |
| Configuration         | ⚙️    |
| API / Classes         | 📦    |
| Assertions            | ✅    |
| Browser / Page        | 🌐    |
| Network               | 🔌    |
| Screenshots / Visual  | 📸    |
| Debugging             | 🐛    |
| Performance           | ⚡    |
| Authentication        | 🔐    |
| Workers / Parallelism | 🔀    |
| Serial / Order        | 🔗    |
| Installation          | 📥    |
| CLI commands          | 💻    |
| Storage / Cookies     | 🗄️    |
| Tracing               | 🔍    |
| Quick Reference       | 🗂️    |
| Introduction          | 📖    |
| Retries               | 🔁    |

---

## Quality Checklist (verify before moving to the next file)

- [ ] All headings from the source page are represented
- [ ] All code examples from the source are included verbatim
- [ ] No content was invented or paraphrased beyond light structural formatting
- [ ] Output file is in the correct subfolder
- [ ] Filename matches the URL slug exactly
- [ ] Source link at the top is correct

---

## Execution Order

Process folders in this order (avoids context overload — do API reference last as it is the largest group):

1. `docs/mcp/` — 29 files
2. `docs/agent-cli/` — 16 files
3. `docs/guides/` — 86 files
4. `docs/api/` — 63 files

Work through each group fully before starting the next. After every 10 files, verify the output
folder contains the expected number of `.md` files before continuing.
