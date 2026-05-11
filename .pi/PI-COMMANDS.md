# Pi CLI Reference

This file reflects the local `pi` CLI help observed in this repo, not an interactive slash-command catalog.

Verified locally on 2026-05-11:

```bash
pi --version
# 0.74.0
```

---

## Basic Usage

```bash
pi [options] [@files...] [messages...]
```

Common modes:

```bash
pi
pi "List all .ts files in tests/"
pi @README.md "Summarize this file"
pi --print "List all .ts files in tests/"
pi --continue "What did we discuss?"
pi --resume
```

---

## Package Commands

```bash
pi install <source> [-l]
pi remove <source> [-l]
pi uninstall <source> [-l]
pi update [source|self|pi]
pi list
pi config
pi <command> --help
```

Use these for Pi extensions and package resources, not for Playwright project tests.

---

## Model and Provider Options

```bash
pi --provider <name>
pi --model <pattern>
pi --models <patterns>
pi --thinking <off|minimal|low|medium|high|xhigh>
```

Examples:

```bash
pi --model openai/gpt-4o "Help me refactor this code"
pi --model sonnet:high "Solve this complex problem"
pi --models claude-sonnet,claude-haiku,gpt-4o
pi --models "github-copilot/*"
```

---

## Tool and Resource Options

```bash
pi --no-tools
pi --no-builtin-tools
pi --tools read,grep,find,ls
pi --extension <path>
pi --no-extensions
pi --skill <path>
pi --no-skills
pi --prompt-template <path>
pi --no-prompt-templates
pi --theme <path>
pi --no-themes
pi --no-context-files
```

Read-only review example:

```bash
pi --tools read,grep,find,ls --print "Review the code in tests/"
```

---

## Session Options

```bash
pi --continue
pi --resume
pi --session <path|id>
pi --fork <path|id>
pi --session-dir <dir>
pi --no-session
pi --export <file>
```

Examples:

```bash
pi --export ~/.pi/agent/sessions/--path--/session.jsonl
pi --export session.jsonl output.html
```

---

## Other Useful Options

```bash
pi --mode text
pi --mode json
pi --mode rpc
pi --api-key <key>
pi --system-prompt <text>
pi --append-system-prompt <text-or-file>
pi --list-models [search]
pi --verbose
pi --offline
pi --help
pi --version
```

Extensions can register additional flags, such as plan-mode flags.

---

## Relevant Environment Variables

Provider credentials:

```text
ANTHROPIC_API_KEY
ANTHROPIC_OAUTH_TOKEN
OPENAI_API_KEY
AZURE_OPENAI_API_KEY
DEEPSEEK_API_KEY
GEMINI_API_KEY
GROQ_API_KEY
XAI_API_KEY
OPENROUTER_API_KEY
```

Pi configuration:

```text
PI_CODING_AGENT_DIR
PI_CODING_AGENT_SESSION_DIR
PI_PACKAGE_DIR
PI_OFFLINE
PI_TELEMETRY
PI_SHARE_VIEWER_URL
```

Run `pi --help` for the full current list.

---

## Built-in Tool Names

```text
read   - Read file contents
bash   - Execute shell commands
edit   - Edit files with find/replace
write  - Write files
grep   - Search file contents
find   - Find files by glob pattern
ls     - List directory contents
```
