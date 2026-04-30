# Playwright TypeScript Test Automation Framework

> A production-style Playwright + TypeScript automation framework covering browser E2E, REST API, accessibility, visual regression, SauceDemo storage-state auth, Playwright documentation monitoring, and Artillery performance testing.

[![CI - Code Quality](https://github.com/orhunakkan/playwright-typescript/actions/workflows/code-quality.yml/badge.svg)](https://github.com/orhunakkan/playwright-typescript/actions/workflows/code-quality.yml)
[![CI - Playwright Tests](https://github.com/orhunakkan/playwright-typescript/actions/workflows/playwright-reusable.yml/badge.svg)](https://github.com/orhunakkan/playwright-typescript/actions/workflows/playwright-reusable.yml)
![Playwright](https://img.shields.io/badge/Playwright-1.59.1-2EAD33?logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-9-4B32C3?logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/Prettier-3.8-F7B93E?logo=prettier&logoColor=black)
![License](https://img.shields.io/badge/License-ISC-blue)

---

## Overview

This framework is a TypeScript reimplementation of browser automation scenarios from [_Hands-On Selenium WebDriver with Java_](https://www.oreilly.com/library/view/hands-on-selenium-webdriver/9781098109998/) by Boni García, rebuilt using modern Playwright APIs. It also includes API, accessibility, visual, documentation-monitoring, SauceDemo storage-state, and load-testing examples.

**What this demonstrates:**

- Scalable Page Object Model architecture with typed custom fixtures
- Cross-browser and mobile browser-device execution with Playwright projects
- REST API testing with serial workflows, auth-token chaining, dynamic payloads, and schema validation
- Accessibility scanning with axe-core
- Visual regression with Docker-stable baselines
- Playwright documentation link/content monitoring using JSON and text snapshots
- SauceDemo authenticated storage-state reuse
- Artillery performance testing against the Notes API
- CI quality gates and Playwright reporting artifacts

---

## Tech Stack

| Tool                                                                                                          | Version | Purpose                                     |
| ------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------- |
| [Playwright](https://playwright.dev/)                                                                         | 1.59.1  | Browser automation, API testing, assertions |
| [TypeScript](https://www.typescriptlang.org/)                                                                 | 6.0     | Strongly typed test code                    |
| [Faker.js](https://fakerjs.dev/)                                                                              | 10.4.0  | Dynamic test data generation                |
| [axe-core / @axe-core/playwright](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright) | 4.11.1  | Automated accessibility scanning            |
| [Allure](https://allurereport.org/)                                                                           | 3.6.0   | Feature/story/severity reporting            |
| [Artillery](https://www.artillery.io/)                                                                        | 2.0     | API load testing                            |
| [Docker](https://www.docker.com/)                                                                             | —       | Stable visual-regression rendering          |
| [ESLint](https://eslint.org/)                                                                                 | 9       | Static analysis with Playwright rules       |
| [Prettier](https://prettier.io/)                                                                              | 3.8     | Formatting                                  |
| [GitHub Actions](https://github.com/features/actions)                                                         | —       | CI/CD orchestration and artifact publishing |

---

## Key Features

- **31 Page Object classes** wired through `fixtures/page-fixtures/index.ts`
- **7 E2E spec files** covering core WebDriver-style interactions, browser features/APIs, POM, framework behavior, integrations, and mobile testing
- **5 REST API suites** for Notes API health checks, users, notes, happy paths, and error cases
- **Accessibility sweep** across 29 practice-site page objects with WCAG 2.1 AA axe-core defaults
- **Visual regression** for 26 practice pages with 168 committed PNG baselines
- **Playwright docs monitoring** that checks sidebar URL drift and article-content text snapshots
- **SauceDemo storage-state auth** with setup project and authenticated inventory tests
- **Artillery performance script** for Notes API load testing
- **Allure + Playwright HTML/JSON reporting** on every Playwright run
- **Environment switching** through `.env`, `.env.dev`, `.env.staging`, and `.env.prod`

---

## Project Structure

```text
playwright-typescript/
├── tests/
│   ├── api/                          # Notes REST API suites
│   ├── e2e/                          # Browser UI suites using custom page fixtures
│   ├── accessibility/                # axe-core accessibility sweep
│   ├── performance/                  # Artillery load test script
│   ├── pw-documents/                 # Playwright docs sidebar/content monitoring
│   ├── sauce/                        # SauceDemo auth setup + storage-state spec
│   └── visual-regression/            # Screenshot comparison suite
├── pages/                            # Page Object Model classes (31 pages)
├── fixtures/
│   ├── notes-api-payloads/           # API types + Faker payload generators
│   ├── page-fixtures/                # Custom Playwright fixture wiring for POM classes
│   ├── playwright-docs-links/        # Baseline sidebar links for docs monitoring
│   └── reference-snapshots/          # PNG and text baselines
├── utilities/
│   ├── a11y.ts                       # AxeBuilder wrapper
│   ├── api-schema-validator.ts       # API response-shape validation
│   ├── calculator.ts                 # Calculator helper logic
│   └── error-listeners.ts            # Console/page/network error listeners
├── config/
│   └── env.ts                        # Typed environment variable access
├── docs/                             # Local, version-matched Playwright docs
├── side-learning/                    # Standalone HTML/CSS/JS learning project
├── playwright.config.ts              # Projects, reporters, artifacts, snapshots
├── tsconfig.json
├── eslint.config.js
└── package.json
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm
- [Docker](https://www.docker.com/) for visual regression commands

### Installation

```bash
git clone https://github.com/orhunakkan/playwright-typescript.git
cd playwright-typescript
npm install
npx playwright install
```

### Environment Setup

The default `.env` and environment-specific `.env.dev`, `.env.staging`, and `.env.prod` files use public practice targets:

```env
PRACTICE_E2E_URL=https://bonigarcia.dev/selenium-webdriver-java
PRACTICE_API_URL=https://practice.expandtesting.com/notes/api
SAUCE_DEMO_URL=https://www.saucedemo.com
```

Set `TEST_ENV=dev|staging|prod` to load `.env.<environment>`; without `TEST_ENV`, Playwright loads `.env`.

---

## Running Tests

```bash
npm run test:e2e             # E2E on desktop + mobile projects
npm run test:api             # API project
npm run test:accessibility   # Accessibility project
npm run test:pw-documents    # Playwright docs monitoring
npm run test:sauce           # SauceDemo setup + storage-state tests
npm run test:perf            # Artillery load test
npm run test:visual          # Visual regression in Docker
npm run test:visual:update   # Regenerate visual baselines in Docker
```

Useful direct Playwright commands:

```bash
npx playwright test tests/e2e/ --project="Desktop Chrome"
npx playwright test tests/e2e/webdriver-fundamentals.spec.ts --project="Desktop Chrome"
npx playwright test --grep "@smoke|@critical"
npx playwright test --ui
npx playwright test --debug
npx playwright show-report
```

Visual regression should only be run with the Docker-backed npm scripts to avoid OS/font rendering drift.

---

## Code Quality

```bash
npm run typecheck       # tsc --noEmit
npm run lint:check      # eslint .
npm run lint:fix        # eslint . --fix
npm run format          # prettier --write .
npm run format:check    # prettier --check .
```

---

## Reports

Playwright is configured with four reporters:

| Reporter            | Output                                |
| ------------------- | ------------------------------------- |
| `list`              | Terminal output                       |
| `html`              | `playwright-report/index.html`        |
| `json`              | `playwright-report/test-results.json` |
| `allure-playwright` | `allure-results/`                     |

Allure commands:

```bash
npm run report:allure:serve
npm run report:allure:generate
npm run report:allure:open
```

---

## Test Coverage Summary

| Area                    | Location                                   | Coverage highlights                                                                                        |
| ----------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| E2E                     | `tests/e2e/`                               | Forms, navigation, dropdowns, hover, drag/drop, canvas, cookies, storage, frames, iframes, dialogs, mobile |
| Browser APIs            | `tests/e2e/browser-apis.spec.ts`           | Geolocation, notifications, media devices, locale switching, console/error capture                         |
| API                     | `tests/api/`                               | Health, users, notes, auth, CRUD, validation/error responses, schema checks                                |
| Accessibility           | `tests/accessibility/`                     | axe-core scans across all practice page objects                                                            |
| Visual regression       | `tests/visual-regression/`                 | Full-page screenshots with Docker-generated baselines                                                      |
| Playwright docs monitor | `tests/pw-documents/`                      | Sidebar link drift and documentation article text snapshots                                                |
| SauceDemo               | `tests/sauce/`                             | Auth setup project and storage-state reuse                                                                 |
| Performance             | `tests/performance/performance-testing.ts` | Artillery load test for the Notes API                                                                      |

---

## Architecture Notes

### Page Object Model

Page classes expose separate `locators` and `actions` objects. Specs interact through page fixtures instead of raw selectors, keeping selectors and multi-step interactions in `.page.ts` files.

### API Test Pattern

API suites import from `@playwright/test`, use Playwright's `request` fixture, generate dynamic Faker payloads, validate schemas with `expectMatchesSchema`, and use `test.describe.configure({ mode: 'serial' })` where state is shared between tests.

### Visual Regression

Baselines live under `fixtures/reference-snapshots/visual-regression.spec.ts/`. The npm scripts use `mcr.microsoft.com/playwright:v1.59.1-noble`, matching the installed Playwright version.

### Local Playwright Docs

The `docs/` directory contains a version-matched copy of Playwright documentation. Agent guidance in `.pi/skills/find-in-docs/SKILL.md` maps API and guide questions to the exact local file to read.

---

## CI/CD Pipeline

- `code-quality.yml`: typecheck, ESLint, and Prettier checks on push/PR to `main`
- `playwright-reusable.yml`: API, desktop E2E, mobile E2E, and Docker visual-regression jobs on push/PR, weekday schedule, manual dispatch, and reusable workflow calls
- Playwright HTML reports are uploaded as artifacts; visual jobs also upload `test-results/`
- Non-PR workflow runs send email summaries through the local `.github/actions/send-test-report` action

---

## Project Stats

| Metric                        | Value                                                       |
| ----------------------------- | ----------------------------------------------------------- |
| Playwright spec/setup files   | 17                                                          |
| Artillery performance scripts | 1                                                           |
| Page Object classes           | 31                                                          |
| Visual PNG baselines          | 168                                                         |
| Docs text baselines           | 194                                                         |
| Browser/device projects       | Desktop Chrome, Firefox, Edge, Mobile Safari, Mobile Chrome |

---

## Author

**Orhun Akkan**  
[GitHub](https://github.com/orhunakkan) · [LinkedIn](https://www.linkedin.com/in/orhunakkan)
