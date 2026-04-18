# 💬 Playwright — Dialogs

> **Source:** [playwright.dev/agent-cli/commands-dialogs](https://playwright.dev/agent-cli/commands-dialogs)

---

## Overview

Handle browser dialogs (alert, confirm, prompt) that block page interaction.

---

## Commands

| Command                  | Description                                       |
| ------------------------ | ------------------------------------------------- |
| `dialog-accept [prompt]` | Accept a dialog, optionally providing prompt text |
| `dialog-dismiss`         | Dismiss (cancel) a dialog                         |

---

## Alert dialogs

```bash
$ playwright-cli click e5
# ⚠ Dialog appeared: [alert] "Item has been deleted."

$ playwright-cli dialog-accept
```

---

## Confirm dialogs

```bash
$ playwright-cli click e10
# ⚠ Dialog appeared: [confirm] "Are you sure you want to delete this?"

# Accept (OK)
$ playwright-cli dialog-accept

# Or dismiss (Cancel)
$ playwright-cli dialog-dismiss
```

---

## Prompt dialogs

```bash
$ playwright-cli click e8
# ⚠ Dialog appeared: [prompt] "Enter your name:"

# Accept with text
$ playwright-cli dialog-accept "Alice"

# Or dismiss (cancels the prompt)
$ playwright-cli dialog-dismiss
```

---

## Workflow

When a dialog appears, other commands will report it. Handle the dialog before continuing:

```bash
$ playwright-cli click e12
# ⚠ Dialog appeared: [confirm] "Discard unsaved changes?"

$ playwright-cli dialog-accept

$ playwright-cli snapshot
# Page now shows updated state after dialog was accepted
```

---

## 🗂️ Quick Reference

| What            | How                    |
| --------------- | ---------------------- |
| Accept alert    | `dialog-accept`        |
| Accept confirm  | `dialog-accept`        |
| Dismiss confirm | `dialog-dismiss`       |
| Accept prompt   | `dialog-accept "text"` |
| Dismiss prompt  | `dialog-dismiss`       |
