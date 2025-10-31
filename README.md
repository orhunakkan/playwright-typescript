# Playwright + Docker

This project is set up to run Playwright tests inside Docker using the official Playwright image. It also includes a GitHub Actions workflow to execute tests in the same container on every push/PR.

## Local: Run with Docker

Build the image:

```bash
docker build -t pw-tests .
```

Run tests (with shared memory and reports persisted on host):

```bash
docker run --rm --ipc=host \
	-v "$PWD/playwright-report:/app/playwright-report" \
	-v "$PWD/test-results:/app/test-results" \
	pw-tests
```

Or use Docker Compose:

```bash
docker compose up --build
```

Optional base URL env (read by `playwright.config.ts`):

```bash
docker run --rm --ipc=host \
	-e ENV=https://bonigarcia.dev/selenium-webdriver-java \
	-v "$PWD/playwright-report:/app/playwright-report" \
	-v "$PWD/test-results:/app/test-results" \
	pw-tests
```

Run UI mode via Docker (expose a port from the container):

```bash
docker run --rm -it --ipc=host -p 9323:9323 pw-tests \
	npx playwright test --ui --ui-port=9323
```

Notes:
- The image `mcr.microsoft.com/playwright:v1.56.1-jammy` includes browsers and system deps needed to run tests.
- Reports are written to `./playwright-report` and `./test-results` on the host.

## Local: Run without Docker

```bash
npm ci
npx playwright install
sudo npx playwright install-deps # one-time system libraries
npm test
```

Show the report:

```bash
npx playwright show-report
```

## CI: GitHub Actions (Docker)

The workflow `.github/workflows/playwright-docker.yml` runs tests in the official Playwright image on push and pull requests and uploads the HTML report as an artifact.

