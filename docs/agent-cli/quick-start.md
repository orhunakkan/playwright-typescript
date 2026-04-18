# ⚡ Playwright — Quick Start

> **Source:** [playwright.dev/agent-cli/quick-start](https://playwright.dev/agent-cli/quick-start)

---

## Interactive demo

Try asking your coding agent:

```
Use playwright skills to test https://demo.playwright.dev/todomvc/.
Take screenshots for all successful and failing scenarios.
```

---

## Manual walkthrough

Run commands manually to see how the CLI works:

```bash
playwright-cli open https://demo.playwright.dev/todomvc/ --headed
playwright-cli type "Buy groceries"
playwright-cli press Enter
playwright-cli type "Water flowers"
playwright-cli press Enter
playwright-cli check e21
playwright-cli screenshot
```

---

## Understanding the output

After each command, the CLI outputs a snapshot of the current page state:

```
### Page
- Page URL: https://demo.playwright.dev/todomvc/#/
- Page Title: React - TodoMVC

### Snapshot
[Snapshot](.playwright-cli/page-2026-02-14T19-22-42-679Z.yml)
```

The snapshot file contains the **accessibility tree** with **element refs** that can be used for subsequent commands.

---

## Core workflow

Every interaction follows this pattern:

1. **Open** — `playwright-cli open <url>` opens a URL
2. **Snapshot** — each command returns the accessibility tree with element refs
3. **Interact** — use refs to click, type, or fill
4. **Re-snapshot** — each action returns updated state with new refs

---

## What's next

- See all **Commands**
- Learn about **Snapshots** in detail
- Set up **Sessions** for isolated browser instances

---

## 🗂️ Quick Reference

| What             | How                                     |
| ---------------- | --------------------------------------- |
| Open browser     | `playwright-cli open <url>`             |
| View snapshot    | Check output after each command         |
| Interactive test | Use refs from snapshot for next command |
| Take screenshot  | `playwright-cli screenshot`             |
