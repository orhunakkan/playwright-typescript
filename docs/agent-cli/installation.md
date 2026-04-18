# 📦 Playwright — Installation

> **Source:** [playwright.dev/agent-cli/installation](https://playwright.dev/agent-cli/installation)

---

## Prerequisites

- **Node.js** 20 or newer
- A coding agent: **Claude Code**, **GitHub Copilot**, or similar

---

## Global installation

```bash
npm install -g @playwright/cli@latest
playwright-cli --help
```

---

## Local installation (npx)

```bash
npx playwright-cli --help
```

---

## Installing browsers

The CLI downloads a browser automatically on first use. To install explicitly:

```bash
playwright-cli install-browser # install default (chromium)
playwright-cli install-browser firefox # install specific browser
playwright-cli install-browser --with-deps # install with system dependencies
```

### Install options

| Flag           | Description                                    |
| -------------- | ---------------------------------------------- |
| `--with-deps`  | Install system dependencies (Linux)            |
| `--dry-run`    | Preview what would be installed                |
| `--list`       | List available browsers from all installations |
| `--force`      | Force reinstall even if already present        |
| `--only-shell` | Only install Chromium headless shell           |
| `--no-shell`   | Skip Chromium headless shell                   |

---

## Installing skills

Coding agents like **Claude Code** and **GitHub Copilot** can use locally installed skills for richer context about available commands:

```bash
playwright-cli install --skills
```

### Skills-less operation

You can also point your agent at the CLI directly and let it discover commands on its own:

```
Test the "add todo" flow on https://demo.playwright.dev/todomvc using playwright-cli.
Check playwright-cli --help for available commands.
```

---

## Environment setup

Configure your coding agent to use a specific session:

```bash
PLAYWRIGHT_CLI_SESSION=todo-app claude .
```

---

## Next steps

- **Quick Start** — try the CLI hands-on
- **Snapshots** — how element refs work
- **Capabilities** — network mocking, storage, testing, and more
- **Configuration** — headless mode, browser selection, profiles

---

## 🗂️ Quick Reference

| What            | How                                       |
| --------------- | ----------------------------------------- |
| Global install  | `npm install -g @playwright/cli@latest`   |
| Local install   | `npx playwright-cli --help`               |
| Install browser | `playwright-cli install-browser`          |
| Install skills  | `playwright-cli install --skills`         |
| Set session     | `PLAYWRIGHT_CLI_SESSION=<name> <command>` |
