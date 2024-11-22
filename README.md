# Project Overview

This project is a comprehensive testing framework built using TypeScript and Playwright. It includes UI and API testing, providing a robust solution for end-to-end testing of web applications. There will be more tests added in the future. Please check out my other repositories for more testing frameworks.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (version 20 and up) and npm installed on your machine.
- git (version control system) installed on your machine.

## Installation

To set up the project, follow these steps:

1. Clone the repository:
    ```sh
    git clone <repository-url>
    ```

2. Navigate to the project directory:
    ```sh
    cd playwright-typescript-framework
    ```

3. Install the dependencies:
    ```sh
    npm install
    ```
4. Install Browsers:
    ```sh
    npx playwright install
    ```

## Folder Structure

The project structure is organized as follows:

- `pages/`: Page Object Model classes for UI tests.
- `tests/`: Test files for UI and API tests.
- `utilities/`: Utility functions and helpers.
- `payloads/`: JSON files containing test data.

## Running Tests

To run the tests, use the following command:
```sh
npx playwright test
```
This will run all the tests in the project.

## Writing Tests

Tests are written using Playwright and are located in the `tests/` directory. Each test file follows a specific structure:

- `sampleUI.spec.ts`: Contains UI tests using Playwright.
- `sampleAPI.spec.ts`: Contains API tests using Playwright.

## Running Tests in CI/CD

This is currently work in progress. The project will be integrated with GitHub Actions.

## Error Handling and Debugging

The project includes comprehensive error handling and debugging mechanisms. Use the following techniques to debug tests:

- Console logs
- Breakpoints in the IDE
- Debugging tools provided by the browser

## Reporting

Test results are reported using the built-in Playwright reporter. The reports provide detailed information about the test execution, including passed and failed tests.

## Troubleshooting

If you encounter any issues, refer to the following troubleshooting steps:

- Ensure that all dependencies are installed correctly.
- Verify that the browser drivers are up to date.
- Check the configuration files for any misconfigurations.
- Review the console logs for error messages.
```