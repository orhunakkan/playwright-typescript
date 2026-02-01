# Playwright Docs Observability Monitor

A production-quality monitoring application that continuously observes the Playwright documentation website for content changes, performance degradations, errors, and network anomalies. All data is stored in PostgreSQL for historical analysis and trend reporting.

## Features

- **Automated Crawling**: Discovers and crawls all pages under `https://playwright.dev/docs/*`
- **Content Monitoring**: Tracks changes to documentation content, headings, code blocks, and internal links
- **Network Observability**: Records request/response metrics, status codes, and failure patterns
- **Performance Metrics**: Captures load times, DOM ready times, resource counts, and transfer sizes
- **Bundle Fingerprinting**: Monitors JavaScript and CSS asset changes
- **Error Tracking**: Detects and records page errors, failed requests, and console warnings
- **Change Detection**: Compares snapshots between runs to identify what changed
- **Historical Analysis**: Stores all data in PostgreSQL for trend analysis and reporting
- **CLI Interface**: Easy-to-use commands for crawling, monitoring, and reporting

## Prerequisites

- **Node.js** (LTS version, 18+)
- **PostgreSQL** (12+) running locally
- **Windows 11** (PowerShell) or Linux/macOS with Bash

## Installation

1. **Clone and navigate to project**:

   ```bash
   cd playwright-typescript
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Create PostgreSQL database**:

   ```bash
   createdb playwright_monitor
   ```

   Or in PostgreSQL CLI:

   ```sql
   CREATE DATABASE playwright_monitor;
   ```

4. **Copy and configure environment**:

   ```bash
   cp pw-doc-monitor/.env.example pw-doc-monitor/.env
   ```

   Edit `.env` to match your PostgreSQL connection:

   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/playwright_monitor
   ```

5. **Run database migrations**:
   ```bash
   npm run monitor:migrate
   ```

> **📖 For step-by-step Windows 11 setup**, see [SETUP.md](./SETUP.md)

## Quick Start

Run the complete monitoring process with a single command:

```bash
npm run monitor
```

This will:

- Apply database migrations (if needed)
- Crawl and discover all Playwright docs pages
- Monitor each page for content, performance, network, and errors
- Store all data in PostgreSQL
- Detect changes from the previous run
- Generate HTML report in `pw-doc-monitor/monitoring-report/latest.html`

**That's it!** Open the HTML report to see the results.

---

## Advanced Usage

### Discover All Documentation Pages

```bash
npm run monitor:crawl -- --max-pages 500 --concurrency 3
```

This will crawl the Playwright docs and print all discovered page URLs.

### View Latest Report (Console)

```bash
npm run report:latest
```

Sample output:

```
# Playwright Docs Monitor - Latest Report

Run ID: 550e8400-e29b-41d4-a716-446655440000
Started: 2026-01-22T10:30:00Z
Completed: 2026-01-22T10:45:30Z
Duration: 930000ms

## Summary
- Pages Discovered: 156
- Pages Crawled: 156
- Pages Changed: 3
- Pages New: 1
- Total Errors: 0

## Top 10 Changed Pages
- https://playwright.dev/docs/api/class-browser
  - Title: Browser | Playwright
- https://playwright.dev/docs/api/class-page
  - Title: Page | Playwright

## Worst 10 Performing Pages
- https://playwright.dev/docs/intro
  - Load Time: 1240ms
  - DOM Content Loaded: 890ms
  - Resource Count: 45

## Top 10 Error URLs
(none in this example)
```

### Generate HTML Report Manually

```bash
npm run report:html
```

View the generated report at `pw-doc-monitor/monitoring-report/latest.html`

### Compare Two Runs

```bash
npm run report:diff -- --from <run-id-1> --to <run-id-2>
```

Example:

```bash
npm run report:diff -- --from 550e8400-e29b-41d4-a716-446655440000 --to 550e8400-e29b-41d4-a716-446655440001
```

### View Page History

```bash
npm run report:page -- --url https://playwright.dev/docs/intro --limit 5
```

This shows the last 5 snapshots for the specified URL with hash changes and performance metrics.

## Commands Reference

| Command           | Description                               |
| ----------------- | ----------------------------------------- |
| `npm run monitor` | **Run complete monitoring + HTML report** |

**Advanced Commands:**

| Command           | Description                  | Options                        |
| ----------------- | ---------------------------- | ------------------------------ |
| `monitor:migrate` | Apply database migrations    | -                              |
| `monitor:crawl`   | Discover docs pages          | `--max-pages`, `--concurrency` |
| `monitor:run`     | Full monitoring pass         | -                              |
| `report:latest`   | Latest run summary (console) | -                              |
| `report:html`     | Generate HTML report         | `--run-id` (optional)          |
| `report:diff`     | Compare two runs             | `--from`, `--to`               |
| `report:page`     | Page history                 | `--url` (required), `--limit`  |

## Environment Configuration

Create or edit `pw-doc-monitor/.env`:

```env
# PostgreSQL connection (required)
DATABASE_URL=postgresql://user:password@localhost:5432/playwright_monitor

# Playwright settings
HEADLESS=true                  # Run browser in headless mode
TIMEOUT=30000                  # Page load timeout (ms)

# Crawler settings
CONCURRENCY=3                  # Parallel page crawls
MAX_PAGES=500                  # Maximum pages to crawl per run
CRAWL_DEPTH=unlimited          # Max depth from entry point (or a number)

# Logging
LOG_LEVEL=info                 # error, warn, info, debug
```

## Database Schema

### Tables

- **runs**: Each monitoring execution
- **pages**: Unique documentation URLs
- **page_snapshots**: Content fingerprints per page per run
- **network_observations**: Network metrics per page per run
- **performance_observations**: Load times and resource metrics
- **asset_fingerprints**: JS/CSS bundle hashes and sizes
- **error_events**: Console errors, failed requests, etc.
- **artifacts**: Links to stored diff files and screenshots
- **schema_migrations**: Migration tracking

All tables include proper indices for query performance.

## Artifacts

When changes are detected, artifacts are saved to:

```
artifacts/<run-id>/<page-slug>/
  ├── snapshot.before.json    # Previous content snapshot
  ├── snapshot.after.json     # Current content snapshot
  └── diff.md                 # Human-readable change summary
```

## Development

### Build TypeScript

```bash
npm run monitor:build
```

### Development Mode (with auto-rebuild)

```bash
npm run monitor:dev
```

### Project Structure

```
pw-doc-monitor/
├── src/
│   ├── cli.ts                # CLI entry point
│   ├── index.ts              # Default entry point
│   ├── config.ts             # Configuration loader
│   ├── monitor.ts            # Main monitoring orchestration
│   ├── reporter.ts           # Report generation
│   ├── crawler/
│   │   └── crawler.ts        # URL discovery and crawling
│   ├── extractors/
│   │   ├── content.ts        # DOM content extraction
│   │   ├── network.ts        # Network monitoring
│   │   ├── performance.ts    # Performance metrics
│   │   └── errors.ts         # Error tracking
│   └── db/
│       ├── connection.ts     # Database pool
│       ├── logger.ts         # Winston logger
│       ├── migrations.ts     # Schema migrations
│       └── repository.ts     # Data persistence
├── dist/                     # Compiled JavaScript (generated)
├── .env.example              # Environment template
└── tsconfig.json             # TypeScript configuration
```

## How It Works

### Monitoring Workflow

1. **Initialization**: Create a new run record and artifacts directory
2. **Crawling**: Start from `/docs/intro` and discover all `/docs/*` pages using BFS
3. **Monitoring**: For each discovered page:
   - Extract and hash content (title, headings, code blocks, links)
   - Record network metrics (request/response counts, failures)
   - Measure performance (DOMContentLoaded, Load, First Byte)
   - Track JavaScript and CSS assets
   - Capture console errors and failed requests
4. **Change Detection**: Compare current snapshots to previous run:
   - Hash-based comparison (fast)
   - Generate markdown diffs for changed pages
   - Save artifacts to disk
5. **Finalization**: Update run record with summary stats

### URL Normalization

All URLs are normalized to prevent duplicates:

- Enforce `https://playwright.dev` origin
- Remove hash fragments (`#`)
- Remove trailing slashes
- Only include `/docs/` paths

### Content Fingerprinting

For each page, four hashes are computed:

- **text_hash**: SHA256 of main text content (detects prose changes)
- **headings_hash**: SHA256 of h2/h3 outline (detects structure changes)
- **code_hash**: SHA256 of code blocks (detects code example changes)
- **links_hash**: SHA256 of internal links list (detects navigation changes)

### Concurrency

- Browser: Single instance per monitor run
- Pages: Crawled in parallel batches (configurable)
- Network: Observed per page (automatic)
- DB writes: Sequential (transactional per run)

## Extending the Monitor

### Add Custom Content Extractors

Edit `src/extractors/content.ts` and add new extraction methods to `ContentExtractor`.

### Change Error Detection Rules

Modify `src/extractors/errors.ts` to capture additional error types.

### Customize Reporting

Add new report types to `src/reporter.ts` using the query functions in `src/db/repository.ts`.

### Schedule Regular Runs

Use your OS's task scheduler:

**Windows (PowerShell)**:

```powershell
$trigger = New-JobTrigger -Daily -At 2am
$action = New-ScheduledJobOption -RunElevated
Register-ScheduledJob -Trigger $trigger -TaskName "PlaywrightMonitor" -ScriptBlock {
  cd C:\Users\orhun\quality-development-journey
  npm --prefix playwright-typescript run monitor:run
}
```

**Linux/macOS (cron)**:

```bash
0 2 * * * cd /path/to/project && npm --prefix playwright-typescript run monitor:run
```

## Troubleshooting

### Database Connection Error

Verify PostgreSQL is running:

```bash
psql -U postgres -d postgres -c "SELECT 1"
```

Check `DATABASE_URL` in `.env` is correct.

### Migration Fails

Check logs:

```bash
cat combined.log
```

Manually verify the database exists:

```bash
psql -l
```

### Crawler Hangs

Increase the `TIMEOUT` value in `.env`:

```env
TIMEOUT=60000
```

Reduce `CONCURRENCY`:

```env
CONCURRENCY=2
```

### No Errors in Report

The app catches errors gracefully. Check logs:

```bash
tail -f error.log
```

## Performance Tips

1. **First Run**: Set `MAX_PAGES=50` for testing
2. **Headless**: Keep `HEADLESS=true` for faster execution
3. **Concurrency**: Balance between speed and system resources (3-6 typical)
4. **Network**: Ensure stable internet for reliable metrics

## Known Limitations

- Does not monitor JavaScript frameworks' client-side rendering (captures what's served)
- Asset fingerprinting limited to assets < 1MB
- Diff generation is basic (does not show line-by-line diffs)
- No visualization dashboard (CLI reports only)

## Future Enhancements

- [ ] Web dashboard for visual reporting
- [ ] Line-by-line diff viewer
- [ ] Performance regression detection
- [ ] Screenshot capture on changes
- [ ] Trace recording for failed pages
- [ ] API endpoint for programmatic access
- [ ] Comparison charts and trends

## License

ISC

## Author

Built for high-quality observability of Playwright documentation.
