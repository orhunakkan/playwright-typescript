# Playwright TypeScript Test Automation Framework

A comprehensive test automation framework built with **Playwright** and **TypeScript** for both E2E (End-to-End) and API testing, featuring modern best practices, code quality tools, and multiple test types.

## 🚀 Features

- **Dual Testing Support**: Both E2E UI tests and API tests in a single framework
- **TypeScript**: Full TypeScript support for type safety and better development experience
- **Page Object Model**: Clean, maintainable test structure using Page Object patterns
- **Multiple Test Types**:
  - **Smoke Tests**: Quick validation of critical functionality
  - **Regression Tests**: Comprehensive test coverage for feature validation
  - **Visual Regression Tests**: Screenshot comparison for UI consistency
  - **API Tests**: Complete REST API testing suite
- **Dynamic Test Data**: Faker.js integration for realistic test data generation
- **Error Logging**: Comprehensive error tracking for console, network, and page errors
- **Multi-Environment Support**: Easy configuration for different environments (dev, qa, uat, prod)
- **Code Quality**: ESLint + Prettier integration for consistent code formatting
- **CI/CD Ready**: Optimized for continuous integration pipelines

## 📁 Project Structure

```
playwright-typescript/
├── eslint.config.js              # ESLint configuration
├── package.json                  # Dependencies and scripts
├── playwright.config.ts          # Playwright configuration
├── README.md                     # This file
├── pages/                        # Page Object Models
│   ├── hands-on-app-web-form.ts  # Web form page objects
│   └── heroku-app-home-page.ts   # Home page objects
├── playwright-report/            # HTML test reports
├── screenshots/                  # Visual regression screenshots
├── tests/                        # Test files
│   ├── api/                      # API tests
│   │   ├── authentication/       # Auth API tests
│   │   ├── categories/           # Categories API tests
│   │   ├── health/               # Health check API tests
│   │   ├── statistics/           # Statistics API tests
│   │   ├── todos/                # Todos API tests
│   │   └── users/                # User management API tests
│   └── e2e/                      # End-to-End UI tests
│       ├── hands-on-app-web-form.spec.ts
│       ├── heroku-app-regression.spec.ts
│       ├── heroku-app-smoke.spec.ts
│       └── heroku-app-visual-regression.spec.ts
└── utilities/                    # Helper utilities
    ├── dynamic-content.ts        # Faker.js data generation
    ├── environments.ts           # Environment configuration
    └── error-logger.ts           # Error logging utilities
```

## 🛠️ Prerequisites

Before getting started, ensure you have the following installed:

- **Node.js** (version 16 or higher)
- **npm** or **yarn** package manager
- **Git** (for version control)

## ⚡ Quick Start

### 1. Clone the Repository

```powershell
git clone <repository-url>
cd playwright-typescript
```

### 2. Install Dependencies

```powershell
npm install
```

This will install all required dependencies including:

- Playwright browsers
- TypeScript
- Testing framework
- Code quality tools (ESLint, Prettier)
- Faker.js for test data generation

### 3. Install Playwright Browsers

```powershell
npx playwright install
```

## 🔧 Configuration

### Environment Configuration

The framework supports multiple environments configured in `utilities/environments.ts`:

- **dev**: Development environment
- **qa**: Quality Assurance environment
- **uat**: User Acceptance Testing environment
- **prod**: Production environment

To run tests against a specific environment:

```powershell
$env:env="qa"; npx playwright test
```

### Playwright Configuration

Key configuration options in `playwright.config.ts`:

- **Timeout**: 30 seconds per test
- **Retries**: 1 retry in CI, 0 locally
- **Parallel Execution**: Fully parallel test execution
- **Screenshot**: Only on failure
- **Video**: Retained on failure
- **Browser**: Desktop Edge (configurable)

## 🧪 Test Types & Execution

### E2E (End-to-End) Tests

#### Smoke Tests

Quick validation of critical user journeys:

```powershell
npm run smoke
```

#### Regression Tests

Comprehensive feature testing:

```powershell
npm run regression
```

#### Visual Regression Tests

Screenshot comparison testing:

```powershell
npx playwright test tests/e2e/heroku-app-visual-regression.spec.ts
```

#### Individual E2E Tests

```powershell
# Web form testing
npx playwright test tests/e2e/hands-on-app-web-form.spec.ts

# Home page validation
npx playwright test tests/e2e/heroku-app-regression.spec.ts
```

### API Tests

The framework includes comprehensive API testing for a Todo application:

#### Authentication Tests

```powershell
npx playwright test tests/api/authentication/
```

#### Feature API Tests

```powershell
# Categories management
npx playwright test tests/api/categories/

# Todo items management
npx playwright test tests/api/todos/

# User management
npx playwright test tests/api/users/

# Application statistics
npx playwright test tests/api/statistics/

# Health checks
npx playwright test tests/api/health/
```

#### Run All API Tests

```powershell
npx playwright test tests/api/
```

### Run All Tests

```powershell
npx playwright test
```

## 📊 Test Reports

### HTML Reports

After test execution, view detailed reports:

```powershell
npx playwright show-report
```

Reports include:

- Test execution summary
- Screenshots and videos for failures
- Detailed error logs
- Performance metrics

### Visual Regression Reports

Visual comparison reports are generated automatically and stored in:

- `screenshots/` - Baseline screenshots
- `playwright-report/` - Comparison results

## 🎯 Page Object Model

The framework uses the Page Object Model pattern for maintainable test code:

### Example: Web Form Page Object

```typescript
export class WebFormPage {
  constructor(private page: Page) {}

  get headingPracticeSite() {
    return this.page.getByRole('heading', { name: 'Practice site' });
  }

  get textInput() {
    return this.page.getByRole('textbox', { name: 'Text input' });
  }

  get submitButton() {
    return this.page.getByRole('button', { name: 'Submit' });
  }
}
```

### Using Page Objects in Tests

```typescript
test('should fill out the form and submit', async ({ page }) => {
  const webFormPage = new WebFormPage(page);

  await webFormPage.textInput.fill(generateDynamicTextInput());
  await webFormPage.submitButton.click();
  await expect(webFormPage.headingFormSubmitted).toBeVisible();
});
```

## 🎲 Dynamic Test Data

The framework generates realistic test data using Faker.js:

```typescript
// Generate dynamic content
const textInput = generateDynamicTextInput(); // "LOREM IPSUM DOLOR"
const password = generateDynamicPasswordInput(); // "aB3$mK9#vL2@"
const textArea = generateDynamicTextArea(); // Multi-paragraph text
```

## 🔍 Error Logging & Debugging

### Comprehensive Error Tracking

The framework captures and logs:

- **Console Errors**: Browser console errors
- **Network Errors**: Failed HTTP requests
- **Page Errors**: Uncaught JavaScript exceptions

### Usage in Tests

```typescript
test.beforeEach(async ({ page }) => {
  await logConsoleErrors(page);
  await logNetworkErrors(page);
  await logPageErrors(page);
});
```

### Debug Mode

Run tests with debugging:

```powershell
npx playwright test --debug
```

## 🎨 Code Quality

### Linting & Formatting

```powershell
# Check code formatting
npm run format:check

# Fix code formatting
npm run format

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

### Code Quality Standards

- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **TypeScript**: Type safety
- **Consistent naming**: CamelCase for variables/functions, PascalCase for classes

## 🔧 Advanced Usage

### Custom Test Tags

Use tags to organize and run specific test groups:

```typescript
test.describe('Feature Tests', { tag: '@regression' }, () => {
  // Tests marked with @regression tag
});
```

Run tagged tests:

```powershell
npm run regression  # Runs @regression tagged tests
```

### Environment Variables

Set environment-specific variables:

```powershell
# Windows PowerShell
$env:env="qa"
$env:CI="true"

# Run tests
npx playwright test
```

### Parallel Execution

Configure parallel execution in `playwright.config.ts`:

```typescript
workers: process.env.CI ? 4 : undefined,  // 4 workers in CI, unlimited locally
fullyParallel: true,                       // Enable parallel execution
```

### Test Timeouts

Configure timeouts for different scenarios:

```typescript
test.setTimeout(60000); // 60 second timeout for specific test
```

## 🚀 CI/CD Integration

### GitHub Actions Example

```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
      - name: Run Playwright tests
        run: npm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## 🐛 Troubleshooting

### Common Issues

1. **Browser Installation Issues**

   ```powershell
   npx playwright install --with-deps
   ```

2. **Test Timeouts**
   - Increase timeout in `playwright.config.ts`
   - Check network connectivity
   - Verify application responsiveness

3. **Visual Regression Failures**
   - Update baseline screenshots: `npx playwright test --update-snapshots`
   - Check for environment differences

4. **API Test Failures**
   - Verify API server is running on `localhost:3000`
   - Check API endpoint availability
   - Validate test data and authentication

### Debug Commands

```powershell
# Run tests in headed mode
npx playwright test --headed

# Run specific test with debug
npx playwright test tests/e2e/heroku-app-smoke.spec.ts --debug

# Generate test report
npx playwright show-report
```

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Faker.js Documentation](https://fakerjs.dev/)
- [ESLint Documentation](https://eslint.org/)
- [Prettier Documentation](https://prettier.io/)

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Add tests for new features
3. Update documentation as needed
4. Run linting and formatting before committing:
   ```powershell
   npm run lint:fix && npm run format
   ```

## 📄 License

This project is licensed under the ISC License.

---

**Happy Testing! 🎉**

For questions or support, please check the issues section or contact the maintainer.
