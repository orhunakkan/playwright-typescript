# Playwright TypeScript Framework

## Overview

This project is a Playwright-based testing framework written in TypeScript. It is designed to run end-to-end tests across different browsers and devices, ensuring the reliability and performance of web applications.

## Features

- **Cross-browser Testing**: Supports Chromium, Firefox, and WebKit.
- **Mobile Device Testing**: Includes configurations for testing on mobile devices like Pixel 7 and iPhone 15.
- **Parallel Execution**: Tests can be run in parallel to speed up the testing process.
- **Retry Mechanism**: Automatically retries failed tests to improve test reliability.
- **HTML Reporting**: Generates detailed HTML reports for test results.
- **Environment Configuration**: Easily switch between different environments using environment variables.

## Project Structure

- `tests/`: Contains all the test files.
- `sampleAPI.spec.ts`: Placeholder for API tests.
- `samplePage.ts`: Placeholder for page object models.
- `samplePayload.json`: Placeholder for JSON payloads used in tests.
- `sampleUI.spec.ts`: Placeholder for UI tests.
- `sampleUtility.ts`: Placeholder for utility functions.

## Configuration

The framework is configured using `playwright.config.ts`. Key configurations include:

- **Test Directory**: `./tests`
- **Snapshot Path Template**: `{testDir}/{testFileDir}/snapshots/{testFileName}-{projectName}{ext}`
- **Timeout**: 60 seconds per test
- **Parallel Execution**: Enabled
- **Retries**: 3 retries in CI environment
- **Workers**: 1 worker in CI environment
- **Reporter**: HTML

## Installation

To install the dependencies, run:

```bash
npm install
```

To install the dependencies, run:

```bash
npm playwright test
```