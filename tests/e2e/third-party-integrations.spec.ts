import { expect, test } from '../../fixtures/page-fixtures';
import fs from 'fs';
import { ABTestingPage } from '../../pages/ab-testing.page';
import { feature, story, severity } from 'allure-js-commons';

test.describe('Chapter 9 - Third-Party Integrations', () => {
  // ─────────────────────────────────────────────────
  //  1. Download Files
  // ─────────────────────────────────────────────────
  test.describe('Download Files', () => {
    test.beforeEach(async ({ downloadPage }) => {
      await feature('Third-Party Integrations');
      await story('Download Files');
      await severity('critical');
      await downloadPage.actions.goto();
    });

    test('should display the download files heading', { tag: ['@smoke'] }, async ({ downloadPage }) => {
      await expect(downloadPage.locators.heading).toBeVisible();
    });

    test('should have four download links', async ({ downloadPage }) => {
      await expect(downloadPage.locators.downloadLinks).toHaveCount(4);
    });

    const downloadLinkCases = [
      { linkName: 'WebDriverManager logo', href: './docs/webdrivermanager.png', filename: 'webdrivermanager.png' },
      { linkName: 'WebDriverManager doc', href: './docs/webdrivermanager.pdf', filename: 'webdrivermanager.pdf' },
      { linkName: 'Selenium-Jupiter logo', href: './docs/selenium-jupiter.png', filename: 'selenium-jupiter.png' },
      { linkName: 'Selenium-Jupiter doc', href: './docs/selenium-jupiter.pdf', filename: 'selenium-jupiter.pdf' },
    ];

    for (const { linkName, href, filename } of downloadLinkCases) {
      test(`should have ${linkName} download link`, async ({ page }) => {
        const link = page.getByRole('link', { name: linkName });
        await expect.soft(link).toBeVisible();
        await expect.soft(link).toHaveAttribute('href', href);
        await expect.soft(link).toHaveAttribute('download', filename);
      });
    }

    test('should have correct button styling on all download links', async ({ downloadPage }) => {
      const count = await downloadPage.locators.downloadLinks.count();
      for (let linkIndex = 0; linkIndex < count; linkIndex++) {
        await expect(downloadPage.locators.downloadLinks.nth(linkIndex)).toHaveClass(/btn-outline-primary/);
      }
    });

    test('should download the WebDriverManager PNG file', { tag: ['@critical'] }, async ({ downloadPage, page }, testInfo) => {
      const downloadPromise = page.waitForEvent('download');
      await downloadPage.locators.webDriverManagerLogo.click();
      const download = await downloadPromise;

      expect(download.suggestedFilename()).toBe('webdrivermanager.png');

      // Save to test-specific output path for parallel safety
      const filePath = testInfo.outputPath(download.suggestedFilename());
      await download.saveAs(filePath);
      expect(fs.existsSync(filePath)).toBe(true);
    });

    const downloadFilenameCases = [
      { linkName: 'WebDriverManager doc', filename: 'webdrivermanager.pdf' },
      { linkName: 'Selenium-Jupiter logo', filename: 'selenium-jupiter.png' },
      { linkName: 'Selenium-Jupiter doc', filename: 'selenium-jupiter.pdf' },
    ];

    for (const { linkName, filename } of downloadFilenameCases) {
      test(`should download the ${filename} file`, async ({ page }) => {
        const downloadPromise = page.waitForEvent('download');
        await page.getByRole('link', { name: linkName }).click();
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toBe(filename);
      });
    }

    test('should verify downloaded PNG file has content', async ({ downloadPage, page }, testInfo) => {
      const downloadPromise = page.waitForEvent('download');
      await downloadPage.locators.webDriverManagerLogo.click();
      const download = await downloadPromise;

      const filePath = testInfo.outputPath(download.suggestedFilename());
      await download.saveAs(filePath);

      const stats = fs.statSync(filePath);
      expect(stats.size).toBeGreaterThan(0);
    });

    test('should verify page title and copyright', async ({ downloadPage, page }) => {
      await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');
      await expect(downloadPage.locators.copyright).toBeAttached();
    });
  });

  // ─────────────────────────────────────────────────
  //  2. A/B Testing
  // ─────────────────────────────────────────────────
  test.describe('A/B Testing', () => {
    test.beforeEach(async ({ abTestingPage }) => {
      await feature('Third-Party Integrations');
      await story('A/B Testing');
      await severity('critical');
      await abTestingPage.actions.goto();
      // Content is loaded via jQuery AJAX — wait for it
      await abTestingPage.actions.waitForContent();
    });

    test('should display the A/B Testing heading', { tag: ['@smoke'] }, async ({ abTestingPage }) => {
      await expect(abTestingPage.locators.heading).toBeVisible();
    });

    test('should load either variation A or variation B', { tag: ['@critical'] }, async ({ abTestingPage }) => {
      const text = await abTestingPage.locators.contentHeading.textContent();

      // Must be one of the two variations
      expect(text === 'This is variation A' || text === 'This is variation B').toBe(true);
    });

    test('should have a paragraph of Lorem-style text', async ({ abTestingPage }) => {
      await expect(abTestingPage.locators.contentParagraph).toBeVisible();

      const text = await abTestingPage.locators.contentParagraph.textContent();
      expect(text!.length).toBeGreaterThan(50);
    });

    test('should load content into the #content div', async ({ abTestingPage }) => {
      await expect(abTestingPage.locators.contentDiv).toBeAttached();

      // Should contain a heading and a paragraph
      await expect(abTestingPage.locators.contentHeading).toBeVisible();
      await expect(abTestingPage.locators.contentParagraph).toBeVisible();
    });

    test('should show variation A content when loaded', async ({ browser }) => {
      // Mock Math.random to always return < 0.5 (variation A)
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.addInitScript(() => {
        Math.random = () => 0.1;
      });

      const abPage = new ABTestingPage(page);
      await abPage.actions.goto();
      await abPage.actions.waitForContent();

      await expect(abPage.locators.contentHeading).toHaveText('This is variation A');
      await expect(abPage.locators.contentParagraph).toContainText('Lorem ipsum');

      await context.close();
    });

    test('should show variation B content when loaded', async ({ browser }) => {
      // Mock Math.random to always return >= 0.5 (variation B)
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.addInitScript(() => {
        Math.random = () => 0.9;
      });

      const abPage = new ABTestingPage(page);
      await abPage.actions.goto();
      await abPage.actions.waitForContent();

      await expect(abPage.locators.contentHeading).toHaveText('This is variation B');

      await context.close();
    });

    test('should have the content div with correct id', async ({ abTestingPage }) => {
      await expect(abTestingPage.locators.contentDiv).toBeAttached();
      await expect(abTestingPage.locators.contentDiv).toHaveClass(/py-2/);
    });

    test('should verify page title', async ({ page }) => {
      await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');
    });

    test('should verify variation A and B have different paragraph content', async ({ browser }) => {
      // Get variation A content
      const contextA = await browser.newContext();
      const pageA = await contextA.newPage();
      await pageA.addInitScript(() => {
        Math.random = () => 0.1;
      });
      const abPageA = new ABTestingPage(pageA);
      await abPageA.actions.goto();
      await abPageA.actions.waitForContent();
      const textA = await abPageA.locators.contentParagraph.textContent();
      await contextA.close();

      // Get variation B content
      const contextB = await browser.newContext();
      const pageB = await contextB.newPage();
      await pageB.addInitScript(() => {
        Math.random = () => 0.9;
      });
      const abPageB = new ABTestingPage(pageB);
      await abPageB.actions.goto();
      await abPageB.actions.waitForContent();
      const textB = await abPageB.locators.contentParagraph.textContent();
      await contextB.close();

      // Variations should have different paragraph content
      expect(textA).not.toBe(textB);
    });
  });

  // ─────────────────────────────────────────────────
  //  3. Data Types
  // ─────────────────────────────────────────────────
  test.describe('Data Types', () => {
    test.beforeEach(async ({ dataTypesPage }) => {
      await feature('Third-Party Integrations');
      await story('Data Types');
      await severity('critical');
      await dataTypesPage.actions.goto();
    });

    test('should display the data types heading', { tag: ['@smoke'] }, async ({ dataTypesPage }) => {
      await expect(dataTypesPage.locators.heading).toBeVisible();
    });

    test('should have a First name input', async ({ dataTypesPage }) => {
      await expect.soft(dataTypesPage.locators.firstNameInput).toBeVisible();
      await expect.soft(dataTypesPage.locators.firstNameInput).toHaveAttribute('name', 'first-name');
      await expect.soft(dataTypesPage.locators.firstNameInput).toHaveAttribute('type', 'text');
    });

    test('should have a Last name input', async ({ dataTypesPage }) => {
      await expect.soft(dataTypesPage.locators.lastNameInput).toBeVisible();
      await expect.soft(dataTypesPage.locators.lastNameInput).toHaveAttribute('name', 'last-name');
    });

    test('should have an Address input', async ({ dataTypesPage }) => {
      await expect.soft(dataTypesPage.locators.addressInput).toBeVisible();
      await expect.soft(dataTypesPage.locators.addressInput).toHaveAttribute('name', 'address');
    });

    test('should have a Zip code input', async ({ dataTypesPage }) => {
      await expect.soft(dataTypesPage.locators.zipCodeInput).toBeVisible();
      await expect.soft(dataTypesPage.locators.zipCodeInput).toHaveAttribute('name', 'zip-code');
    });

    test('should have a City input', async ({ dataTypesPage }) => {
      await expect.soft(dataTypesPage.locators.cityInput).toBeVisible();
      await expect.soft(dataTypesPage.locators.cityInput).toHaveAttribute('name', 'city');
    });

    test('should have a Country input', async ({ dataTypesPage }) => {
      await expect.soft(dataTypesPage.locators.countryInput).toBeVisible();
      await expect.soft(dataTypesPage.locators.countryInput).toHaveAttribute('name', 'country');
    });

    test('should have an E-mail input', async ({ dataTypesPage }) => {
      await expect.soft(dataTypesPage.locators.emailInput).toBeVisible();
      await expect.soft(dataTypesPage.locators.emailInput).toHaveAttribute('name', 'e-mail');
      await expect.soft(dataTypesPage.locators.emailInput).toHaveAttribute('type', 'email');
    });

    test('should have a Phone number input', async ({ dataTypesPage }) => {
      await expect.soft(dataTypesPage.locators.phoneInput).toBeVisible();
      await expect.soft(dataTypesPage.locators.phoneInput).toHaveAttribute('name', 'phone');
    });

    test('should have a Job position input', async ({ dataTypesPage }) => {
      await expect.soft(dataTypesPage.locators.jobPositionInput).toBeVisible();
      await expect.soft(dataTypesPage.locators.jobPositionInput).toHaveAttribute('name', 'job-position');
    });

    test('should have a Company input', async ({ dataTypesPage }) => {
      await expect.soft(dataTypesPage.locators.companyInput).toBeVisible();
      await expect.soft(dataTypesPage.locators.companyInput).toHaveAttribute('name', 'company');
    });

    test('should have a submit button', async ({ dataTypesPage }) => {
      await expect.soft(dataTypesPage.locators.submitButton).toBeVisible();
      await expect.soft(dataTypesPage.locators.submitButton).toHaveAttribute('type', 'submit');
      await expect.soft(dataTypesPage.locators.submitButton).toHaveClass(/btn-outline-primary/);
    });

    test('should have all 10 input fields', async ({ dataTypesPage }) => {
      await expect(dataTypesPage.locators.formInputs).toHaveCount(10);
    });

    test('should have all inputs empty initially', async ({ dataTypesPage }) => {
      await expect.soft(dataTypesPage.locators.firstNameInput).toHaveValue('');
      await expect.soft(dataTypesPage.locators.lastNameInput).toHaveValue('');
      await expect.soft(dataTypesPage.locators.addressInput).toHaveValue('');
      await expect.soft(dataTypesPage.locators.zipCodeInput).toHaveValue('');
      await expect.soft(dataTypesPage.locators.cityInput).toHaveValue('');
      await expect.soft(dataTypesPage.locators.countryInput).toHaveValue('');
      await expect.soft(dataTypesPage.locators.emailInput).toHaveValue('');
      await expect.soft(dataTypesPage.locators.phoneInput).toHaveValue('');
      await expect.soft(dataTypesPage.locators.jobPositionInput).toHaveValue('');
      await expect.soft(dataTypesPage.locators.companyInput).toHaveValue('');
    });

    test('should have form with correct action and method', async ({ dataTypesPage }) => {
      await expect.soft(dataTypesPage.locators.form).toHaveAttribute('action', 'data-types-submitted.html');
      await expect.soft(dataTypesPage.locators.form).toHaveAttribute('method', 'get');
    });

    // --- Submission Tests ---
    test('should show all fields as success when all data is provided', { tag: ['@critical'] }, async ({ dataTypesPage, page }) => {
      await dataTypesPage.actions.fillAllFields({
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Main Street',
        zipCode: '12345',
        city: 'New York',
        country: 'USA',
        email: 'john.doe@example.com',
        phone: '555-1234',
        jobPosition: 'Software Engineer',
        company: 'Acme Corp',
      });

      await dataTypesPage.actions.submit();
      await expect(page).toHaveURL(/data-types-submitted\.html/);

      // All fields should show alert-success
      const fieldIds = ['first-name', 'last-name', 'address', 'zip-code', 'city', 'country', 'e-mail', 'phone', 'job-position', 'company'];
      for (const id of fieldIds) {
        await expect.soft(dataTypesPage.locators.resultField(id)).toHaveClass(/alert-success/);
      }
    });

    test('should display submitted values correctly', async ({ dataTypesPage }) => {
      await dataTypesPage.actions.fillAllFields({
        firstName: 'Jane',
        lastName: 'Smith',
        address: '456 Oak Ave',
        zipCode: '67890',
        city: 'Chicago',
        country: 'Canada',
        email: 'jane@test.com',
        phone: '999-8888',
        jobPosition: 'Designer',
        company: 'Design Co',
      });

      await dataTypesPage.actions.submit();

      await expect.soft(dataTypesPage.locators.resultField('first-name')).toHaveText('Jane');
      await expect.soft(dataTypesPage.locators.resultField('last-name')).toHaveText('Smith');
      await expect.soft(dataTypesPage.locators.resultField('address')).toHaveText('456 Oak Ave');
      await expect.soft(dataTypesPage.locators.resultField('zip-code')).toHaveText('67890');
      await expect.soft(dataTypesPage.locators.resultField('city')).toHaveText('Chicago');
      await expect.soft(dataTypesPage.locators.resultField('country')).toHaveText('Canada');
      await expect.soft(dataTypesPage.locators.resultField('e-mail')).toHaveText('jane@test.com');
      await expect.soft(dataTypesPage.locators.resultField('phone')).toHaveText('999-8888');
      await expect.soft(dataTypesPage.locators.resultField('job-position')).toHaveText('Designer');
      await expect.soft(dataTypesPage.locators.resultField('company')).toHaveText('Design Co');
    });

    test('should show all fields as danger when submitted empty', async ({ dataTypesPage, page }) => {
      await dataTypesPage.actions.submit();
      await expect(page).toHaveURL(/data-types-submitted\.html/);

      // All fields should show alert-danger with N/A
      const fieldIds = ['first-name', 'last-name', 'address', 'zip-code', 'city', 'country', 'e-mail', 'phone', 'job-position', 'company'];
      for (const id of fieldIds) {
        await expect.soft(dataTypesPage.locators.resultField(id)).toHaveClass(/alert-danger/);
        await expect.soft(dataTypesPage.locators.resultField(id)).toHaveText('N/A');
      }
    });

    test('should show mixed success and danger for partial data', async ({ dataTypesPage }) => {
      // Fill only some fields
      await dataTypesPage.locators.firstNameInput.fill('Alice');
      await dataTypesPage.locators.zipCodeInput.fill('11111');
      await dataTypesPage.locators.emailInput.fill('alice@example.com');

      await dataTypesPage.actions.submit();

      // Filled fields should be success
      await expect.soft(dataTypesPage.locators.resultField('first-name')).toHaveClass(/alert-success/);
      await expect.soft(dataTypesPage.locators.resultField('first-name')).toHaveText('Alice');
      await expect.soft(dataTypesPage.locators.resultField('zip-code')).toHaveClass(/alert-success/);
      await expect.soft(dataTypesPage.locators.resultField('e-mail')).toHaveClass(/alert-success/);

      // Empty fields should be danger
      await expect.soft(dataTypesPage.locators.resultField('last-name')).toHaveClass(/alert-danger/);
      await expect.soft(dataTypesPage.locators.resultField('last-name')).toHaveText('N/A');
      await expect.soft(dataTypesPage.locators.resultField('address')).toHaveClass(/alert-danger/);
      await expect.soft(dataTypesPage.locators.resultField('city')).toHaveClass(/alert-danger/);
      await expect.soft(dataTypesPage.locators.resultField('country')).toHaveClass(/alert-danger/);
      await expect.soft(dataTypesPage.locators.resultField('phone')).toHaveClass(/alert-danger/);
      await expect.soft(dataTypesPage.locators.resultField('job-position')).toHaveClass(/alert-danger/);
      await expect.soft(dataTypesPage.locators.resultField('company')).toHaveClass(/alert-danger/);
    });

    test('should include query parameters in the submitted URL', async ({ dataTypesPage, page }) => {
      await dataTypesPage.locators.firstNameInput.fill('Test');
      await dataTypesPage.locators.lastNameInput.fill('User');

      await dataTypesPage.actions.submit();

      await expect(page).toHaveURL(/first-name=Test/);
      await expect(page).toHaveURL(/last-name=User/);
    });

    test('should handle special characters in input', async ({ dataTypesPage }) => {
      await dataTypesPage.locators.firstNameInput.fill("O'Brien");
      await dataTypesPage.locators.addressInput.fill('123 Main St, Apt #4');

      await dataTypesPage.actions.submit();

      await expect.soft(dataTypesPage.locators.resultField('first-name')).toHaveClass(/alert-success/);
      await expect.soft(dataTypesPage.locators.resultField('first-name')).toHaveText("O'Brien");
      await expect.soft(dataTypesPage.locators.resultField('address')).toHaveClass(/alert-success/);
      await expect.soft(dataTypesPage.locators.resultField('address')).toHaveText('123 Main St, Apt #4');
    });

    test('should preserve the Data types heading on submitted page', async ({ dataTypesPage }) => {
      await dataTypesPage.actions.submit();
      await expect(dataTypesPage.locators.heading).toBeVisible();
    });

    test('should verify page title and copyright', async ({ dataTypesPage, page }) => {
      await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');
      await expect(dataTypesPage.locators.copyright).toBeAttached();
    });

    test('should submit with only email filled and verify email field is success', async ({ dataTypesPage }) => {
      // Fill only the email field
      await dataTypesPage.locators.emailInput.fill('test@example.com');

      await dataTypesPage.actions.submit();

      // Email should be success
      await expect.soft(dataTypesPage.locators.resultField('e-mail')).toHaveClass(/alert-success/);
      await expect.soft(dataTypesPage.locators.resultField('e-mail')).toHaveText('test@example.com');

      // All other fields should be danger
      await expect.soft(dataTypesPage.locators.resultField('first-name')).toHaveClass(/alert-danger/);
      await expect.soft(dataTypesPage.locators.resultField('last-name')).toHaveClass(/alert-danger/);
      await expect.soft(dataTypesPage.locators.resultField('address')).toHaveClass(/alert-danger/);
      await expect.soft(dataTypesPage.locators.resultField('city')).toHaveClass(/alert-danger/);
      await expect.soft(dataTypesPage.locators.resultField('zip-code')).toHaveClass(/alert-danger/);
      await expect.soft(dataTypesPage.locators.resultField('country')).toHaveClass(/alert-danger/);
      await expect.soft(dataTypesPage.locators.resultField('phone')).toHaveClass(/alert-danger/);
      await expect.soft(dataTypesPage.locators.resultField('job-position')).toHaveClass(/alert-danger/);
      await expect.soft(dataTypesPage.locators.resultField('company')).toHaveClass(/alert-danger/);
    });
  });

  // ─────────────────────────────────────────────────
  //  Index Page - Chapter 9 Links
  // ─────────────────────────────────────────────────
  test.describe('Index Page - Chapter 9 Links', () => {
    test.beforeEach(async ({ homePage }) => {
      await feature('Third-Party Integrations');
      await story('Chapter 9 Index');
      await severity('normal');
      await homePage.actions.goto();
    });

    test('should display the Chapter 9 section heading', async ({ homePage }) => {
      await expect(homePage.locators.chapter9Heading).toBeVisible();
    });

    test('should have all Chapter 9 links', async ({ homePage }) => {
      await expect.soft(homePage.locators.chapterLink('Download files')).toBeVisible();
      await expect.soft(homePage.locators.chapterLink('A/B Testing')).toBeVisible();
      await expect.soft(homePage.locators.chapterLink('Data types')).toBeVisible();
    });

    test('should navigate to each Chapter 9 page and back', async ({ homePage, page }) => {
      const links = [
        { name: 'Download files', url: 'download.html' },
        { name: 'A/B Testing', url: 'ab-testing.html' },
        { name: 'Data types', url: 'data-types.html' },
      ];

      for (const link of links) {
        await homePage.actions.goto();
        await homePage.locators.chapterLink(link.name).click();
        await expect(page).toHaveURL(new RegExp(link.url.replace('.', '\\.')));
        await page.goBack();
        await expect(page).toHaveURL(/index\.html/);
      }
    });
  });
});
