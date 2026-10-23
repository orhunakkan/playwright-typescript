# Agentic Job Board

A private, localhost-only job-search board for one person. LinkedIn job-alert emails are read from Gmail by the `/find-jobs` agent in Claude Code, parsed and deduplicated by this app, and scored by Claude against the owner's profile. [`PLAN.md`](PLAN.md) is the full plan; the board UI arrives in Phase 6.

## Setup

Needs Node 24 or newer.

```bash
npm ci
cp .env.example .env          # PORT=3000, DB_PATH=data/jobboard.db, LOG_LEVEL=info
```

## Running

```bash
npm start                     # serves http://127.0.0.1:3000 (never other network addresses)
```

The first start creates `data/jobboard.db`. Then load the approved profile once:

```bash
curl -s -X PUT http://127.0.0.1:3000/api/profile \
  -H "Content-Type: application/json" --data-binary @data/profile.json
```

Every endpoint is described, with a curl example, in [`docs/api.md`](docs/api.md). Stop the server with Ctrl+C: it finishes open requests and closes the database.

## Checks

```bash
npm run check                 # typecheck, lint, format, every Vitest project with coverage
npm run audit
```

See the commands table in [`CLAUDE.md`](CLAUDE.md) and the test strategy in [`docs/test-strategy.md`](docs/test-strategy.md).

## Privacy

- No automated access to linkedin.com, ever. The only LinkedIn data is the alert emails.
- Gmail is read-only: the agent may only search and read threads.
- The database, résumé and profile live in `data/`, which git ignores. Email bodies and their tracking links are never stored.
