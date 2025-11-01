# Playwright + TypeScript tests

This repo contains Playwright UI and API tests. To ensure identical visual rendering across machines and CI, tests run inside a single Docker image (same locally and on GitHub Actions).

## Quick start (Docker)

1. Build the image once (pinned to your Playwright version):

```sh
docker build --build-arg PLAYWRIGHT_VERSION=1.56.1 -t playwright-tests:1.56.1 .
```

2. Run tests (artifacts saved to host):

```sh
mkdir -p playwright-report test-results snapshots
docker run --rm --ipc=host \
	-e CI=1 \
	-e ENV=https://bonigarcia.dev/selenium-webdriver-java \
	-v "$PWD/playwright-report:/work/playwright-report" \
	-v "$PWD/test-results:/work/test-results" \
	-v "$PWD/snapshots:/work/snapshots" \
	playwright-tests:1.56.1
```

Or via Docker Compose:

```sh
docker compose build
ENV=https://bonigarcia.dev/selenium-webdriver-java docker compose run --rm tests
```

## Notes

- The base URL is read from the `ENV` environment variable in `playwright.config.ts`.
- Visual snapshots live under `snapshots/` and are volume-mounted so baseline images in the repo are used and new snapshots persist.
- The same image and run pattern is used in `.github/workflows/tests.yml` to keep CI consistent with local runs.
