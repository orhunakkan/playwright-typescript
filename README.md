# Playwright-Typescript-Framework

## Table of Contents

- [Introduction](#introduction)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Reporting](#reporting)
- [Contributing](#contributing)

## Introduction

Compass2_Playwright is a test automation project using [Playwright](https://playwright.dev/), aimed at providing a
robust and scalable test framework for UI/API applications. This repository includes test scripts, configurations, and
utilities to facilitate end-to-end testing.

## Prerequisites

- **Node.js:** Playwright is built for Node.js, so you need to have Node.js installed. Download and install it
  from [https://nodejs.org/](https://nodejs.org/)
- Node.js (version 18.x or later)

- **npm:** npm is the package manager for Node.js and comes bundled with the Node.js installation. Ensure you have npm
  by checking its version:

  ```bash
  npm -v
  ```
- npm (version 8.x or later) or yarn

- Playwright (installed as a dependency)

## Installation

1. Clone the repository:
    ```bash
    git clone #TODO
    ```
2. Navigate to the project directory:
    ```bash
    cd Compass2_Playwright
    ```
3. Install the dependencies:
    ```bash
    npm install
    ```
   or
    ```bash
    yarn install
    ```

## Usage

### Configuration

- Configuration files are located in the root directory (e.g., `playwright.config.js`).
- Update the `env` file with necessary environment variables.

### Test Structure

- **tests**: Contains test spec files.
- **helpers**: Utility functions and helper classes.
- **locators**: JSON files for element locators.
- **pages**: Page Object Model (POM) classes representing different pages of the application.
- **payloads**: JSON payloads used in tests.
- **support**: Support files and custom commands.
- **test-results**: Directory where test results and reports are stored.

### Running Tests

To run tests, use the following command:

```bash
ENV={env_name} npx playwright test
```

**Example:** <br>
For a specific test file:

```bash 
ENV={env_name} npx playwright test tests/login.spec.js
```

### Run tests with a specific tag:

`ENV={env_name} npx playwright test --grep @{tag_name}`

### Contributing

	1.	Fork the repository.
	2.	Create a new branch (git checkout -b feature-branch).
	3.	Make your changes.
	4.	Commit your changes (git commit -m 'Add new feature').
	5.	Push to the branch (git push origin feature-branch).
	6.	Open a pull request.

## VS Code Prettier Extension Setup

### Introduction

This guide provides detailed steps for installing the Prettier - Code formatter extension in Visual Studio Code (VS
Code) and configuring it to automatically format your code whenever you save a document.

### Prerequisites

- Ensure you have Visual Studio Code installed on your system. If not, download and install it
  from [Visual Studio Code official site](https://code.visualstudio.com/).

### Installation

1. **Open Visual Studio Code.**
2. **Access the Extensions View** by clicking on the square icon on the sidebar or pressing (Win:`Ctrl+Shift+X` or
   Mac:`Cmd+Shift+X`).
3. **Search for Prettier - Code formatter** using the search bar.
4. **Find the extension** with the following details:
    - **Name:** Prettier - Code formatter
    - **Id:** esbenp.prettier-vscode
    - **Description:** Code formatter using prettier
    - **Version:** 10.4.0
    - **Publisher:** Prettier
5. **Click on the Install button** to install the extension.

### Configuration

Once the extension is installed, follow these steps to configure it to format on save:

1. **Open Settings:**
    - You can open settings by clicking on the gear icon in the lower left corner and selecting "Settings" or by
      pressing (Win:`Ctrl + ,` or Mac:`Cmd + ,`).
2. **Search for "Format" in the search bar** at the top of the Settings tab.
3. **Navigate to "Editor: Format On Save"** and check the box to enable this feature. This makes VS Code format the file
   on save using the default formatter.
4. **Set Prettier as the Default Formatter:**
    - Continue in the Settings search bar, type "Default Formatter".
    - Look for "Editor: Default Formatter" and select it.
    - From the dropdown, select `esbenp.prettier-vscode` to set Prettier as the default formatter.

### Confirm Installation

To confirm that the formatter is working:

- Open any code file (e.g., a JavaScript file).
- Make changes to the file that would normally be formatted by Prettier (e.g., incorrect indentation, spacing).
- Save the file (Win:`Ctrl + S` or Mac:`Cmd + S`). Prettier should automatically format the document according to its
  rules.

### Troubleshooting

If formatting does not occur on save:

- Check that "Editor: Format On Save" is enabled in your settings.
- Ensure there are no conflicts with other formatter extensions.
- Review the Prettier extension settings and the output console in VS Code for any specific errors.

### More Information

For more detailed information about configuring Prettier and its capabilities, visit
the [VS Marketplace](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode).