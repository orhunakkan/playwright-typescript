import { expect, test } from '@playwright/test';
import fs from 'fs';
import { DownloadPage } from '../../pages/download.page';
import { ABTestingPage } from '../../pages/ab-testing.page';
import { DataTypesPage } from '../../pages/data-types.page';
import { HomePage } from '../../pages/home.page';

test.describe('Chapter 9 - Third-Party Integrations', () => {
  // ─────────────────────────────────────────────────
  //  1. Download Files
  // ─────────────────────────────────────────────────
  test.describe('Download Files', () => {
    test.beforeEach(async ({ page }) => {
      const downloadPage = new DownloadPage(page);
      await downloadPage.actions.goto();
    });

    test('should display the download files heading', async ({ page }) => {
      const downloadPage = new DownloadPage(page);
      await expect(downloadPage.locators.heading).toBeVisible();
    });

    test('should have four download links', async ({ page }) => {
      const downloadPage = new DownloadPage(page);
      await expect(downloadPage.locators.downloadLinks).toHaveCount(4);
    });

    test('should have WebDriverManager logo download link', async ({ page }) => {
      const downloadPage = new DownloadPage(page);
      await expect(downloadPage.locators.webDriverManagerLogo).toBeVisible();
      await expect(downloadPage.locators.webDriverManagerLogo).toHaveAttribute('href', './docs/webdrivermanager.png');
      await expect(downloadPage.locators.webDriverManagerLogo).toHaveAttribute('download', 'webdrivermanager.png');
    });

    test('should have WebDriverManager doc download link', async ({ page }) => {
      const downloadPage = new DownloadPage(page);
      await expect(downloadPage.locators.webDriverManagerDoc).toBeVisible();
      await expect(downloadPage.locators.webDriverManagerDoc).toHaveAttribute('href', './docs/webdrivermanager.pdf');
      await expect(downloadPage.locators.webDriverManagerDoc).toHaveAttribute('download', 'webdrivermanager.pdf');
    });

    test('should have Selenium-Jupiter logo download link', async ({ page }) => {
      const downloadPage = new DownloadPage(page);
      await expect(downloadPage.locators.seleniumJupiterLogo).toBeVisible();
      await expect(downloadPage.locators.seleniumJupiterLogo).toHaveAttribute('href', './docs/selenium-jupiter.png');
      await expect(downloadPage.locators.seleniumJupiterLogo).toHaveAttribute('download', 'selenium-jupiter.png');
    });

    test('should have Selenium-Jupiter doc download link', async ({ page }) => {
      const downloadPage = new DownloadPage(page);
      await expect(downloadPage.locators.seleniumJupiterDoc).toBeVisible();
      await expect(downloadPage.locators.seleniumJupiterDoc).toHaveAttribute('href', './docs/selenium-jupiter.pdf');
      await expect(downloadPage.locators.seleniumJupiterDoc).toHaveAttribute('download', 'selenium-jupiter.pdf');
    });

    test('should have correct button styling on all download links', async ({ page }) => {
      const downloadPage = new DownloadPage(page);
      const count = await downloadPage.locators.downloadLinks.count();
      for (let linkIndex = 0; linkIndex < count; linkIndex++) {
        await expect(downloadPage.locators.downloadLinks.nth(linkIndex)).toHaveClass(/btn-outline-primary/);
      }
    });

    test('should download the WebDriverManager PNG file', async ({ page }, testInfo) => {
      const downloadPage = new DownloadPage(page);
      const downloadPromise = page.waitForEvent('download');
      await downloadPage.locators.webDriverManagerLogo.click();
      const download = await downloadPromise;

      expect(download.suggestedFilename()).toBe('webdrivermanager.png');

      // Save to test-specific output path for parallel safety
      const filePath = testInfo.outputPath(download.suggestedFilename());
      await download.saveAs(filePath);
      expect(fs.existsSync(filePath)).toBe(true);
    });

    test('should download the WebDriverManager PDF file', async ({ page }) => {
      const downloadPage = new DownloadPage(page);
      const downloadPromise = page.waitForEvent('download');
      await downloadPage.locators.webDriverManagerDoc.click();
      const download = await downloadPromise;

      expect(download.suggestedFilename()).toBe('webdrivermanager.pdf');
    });

    test('should download the Selenium-Jupiter PNG file', async ({ page }) => {
      const downloadPage = new DownloadPage(page);
      const downloadPromise = page.waitForEvent('download');
      await downloadPage.locators.seleniumJupiterLogo.click();
      const download = await downloadPromise;

      expect(download.suggestedFilename()).toBe('selenium-jupiter.png');
    });

    test('should download the Selenium-Jupiter PDF file', async ({ page }) => {
      const downloadPage = new DownloadPage(page);
      const downloadPromise = page.waitForEvent('download');
      await downloadPage.locators.seleniumJupiterDoc.click();
      const download = await downloadPromise;

      expect(download.suggestedFilename()).toBe('selenium-jupiter.pdf');
    });

    test('should verify downloaded PNG file has content', async ({ page }, testInfo) => {
      const downloadPage = new DownloadPage(page);
      const downloadPromise = page.waitForEvent('download');
      await downloadPage.locators.webDriverManagerLogo.click();
      const download = await downloadPromise;

      const filePath = testInfo.outputPath(download.suggestedFilename());
      await download.saveAs(filePath);

      const stats = fs.statSync(filePath);
      expect(stats.size).toBeGreaterThan(0);
    });

    test('should verify page title and copyright', async ({ page }) => {
      const downloadPage = new DownloadPage(page);
      await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');
      await expect(downloadPage.locators.copyright).toBeAttached();
    });
  });

  // ─────────────────────────────────────────────────
  //  2. A/B Testing
  // ─────────────────────────────────────────────────
  test.describe('A/B Testing', () => {
    test.beforeEach(async ({ page }) => {
      const abPage = new ABTestingPage(page);
      await abPage.actions.goto();
      // Content is loaded via jQuery AJAX — wait for it
      await abPage.actions.waitForContent();
    });

    test('should display the A/B Testing heading', async ({ page }) => {
      const abPage = new ABTestingPage(page);
      await expect(abPage.locators.heading).toBeVisible();
    });

    test('should load either variation A or variation B', async ({ page }) => {
      const abPage = new ABTestingPage(page);
      const text = await abPage.locators.contentHeading.textContent();

      // Must be one of the two variations
      expect(text === 'This is variation A' || text === 'This is variation B').toBe(true);
    });

    test('should have a paragraph of Lorem-style text', async ({ page }) => {
      const abPage = new ABTestingPage(page);
      await expect(abPage.locators.contentParagraph).toBeVisible();

      const text = await abPage.locators.contentParagraph.textContent();
      expect(text!.length).toBeGreaterThan(50);
    });

    test('should load content into the #content div', async ({ page }) => {
      const abPage = new ABTestingPage(page);
      await expect(abPage.locators.contentDiv).toBeAttached();

      // Should contain a heading and a paragraph
      await expect(abPage.locators.contentHeading).toBeVisible();
      await expect(abPage.locators.contentParagraph).toBeVisible();
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

    test('should have the content div with correct id', async ({ page }) => {
      const abPage = new ABTestingPage(page);
      await expect(abPage.locators.contentDiv).toBeAttached();
      await expect(abPage.locators.contentDiv).toHaveClass(/py-2/);
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
    test.beforeEach(async ({ page }) => {
      const dataPage = new DataTypesPage(page);
      await dataPage.actions.goto();
    });

    test('should display the data types heading', async ({ page }) => {
      const dataPage = new DataTypesPage(page);
      await expect(dataPage.locators.heading).toBeVisible();
    });

    test('should have a First name input', async ({ page }) => {
      const dataPage = new DataTypesPage(page);
      await expect(dataPage.locators.firstNameInput).toBeVisible();
      await expect(dataPage.locators.firstNameInput).toHaveAttribute('name', 'first-name');
      await expect(dataPage.locators.firstNameInput).toHaveAttribute('type', 'text');
    });

    test('should have a Last name input', async ({ page }) => {
      const dataPage = new DataTypesPage(page);
      await expect(dataPage.locators.lastNameInput).toBeVisible();
      await expect(dataPage.locators.lastNameInput).toHaveAttribute('name', 'last-name');
    });

    test('should have an Address input', async ({ page }) => {
      const dataPage = new DataTypesPage(page);
      await expect(dataPage.locators.addressInput).toBeVisible();
      await expect(dataPage.locators.addressInput).toHaveAttribute('name', 'address');
    });

    test('should have a Zip code input', async ({ page }) => {
      const dataPage = new DataTypesPage(page);
      await expect(dataPage.locators.zipCodeInput).toBeVisible();
      await expect(dataPage.locators.zipCodeInput).toHaveAttribute('name', 'zip-code');
    });

    test('should have a City input', async ({ page }) => {
      const dataPage = new DataTypesPage(page);
      await expect(dataPage.locators.cityInput).toBeVisible();
      await expect(dataPage.locators.cityInput).toHaveAttribute('name', 'city');
    });

    test('should have a Country input', async ({ page }) => {
      const dataPage = new DataTypesPage(page);
      await expect(dataPage.locators.countryInput).toBeVisible();
      await expect(dataPage.locators.countryInput).toHaveAttribute('name', 'country');
    });

    test('should have an E-mail input', async ({ page }) => {
      const dataPage = new DataTypesPage(page);
      await expect(dataPage.locators.emailInput).toBeVisible();
      await expect(dataPage.locators.emailInput).toHaveAttribute('name', 'e-mail');
      await expect(dataPage.locators.emailInput).toHaveAttribute('type', 'email');
    });

    test('should have a Phone number input', async ({ page }) => {
      const dataPage = new DataTypesPage(page);
      await expect(dataPage.locators.phoneInput).toBeVisible();
      await expect(dataPage.locators.phoneInput).toHaveAttribute('name', 'phone');
    });

    test('should have a Job position input', async ({ page }) => {
      const dataPage = new DataTypesPage(page);
      await expect(dataPage.locators.jobPositionInput).toBeVisible();
      await expect(dataPage.locators.jobPositionInput).toHaveAttribute('name', 'job-position');
    });

    test('should have a Company input', async ({ page }) => {
      const dataPage = new DataTypesPage(page);
      await expect(dataPage.locators.companyInput).toBeVisible();
      await expect(dataPage.locators.companyInput).toHaveAttribute('name', 'company');
    });

    test('should have a submit button', async ({ page }) => {
      const dataPage = new DataTypesPage(page);
      await expect(dataPage.locators.submitButton).toBeVisible();
      await expect(dataPage.locators.submitButton).toHaveAttribute('type', 'submit');
      await expect(dataPage.locators.submitButton).toHaveClass(/btn-outline-primary/);
    });

    test('should have all 10 input fields', async ({ page }) => {
      const dataPage = new DataTypesPage(page);
      await expect(dataPage.locators.formInputs).toHaveCount(10);
    });

    test('should have all inputs empty initially', async ({ page }) => {
      const dataPage = new DataTypesPage(page);
      await expect(dataPage.locators.firstNameInput).toHaveValue('');
      await expect(dataPage.locators.lastNameInput).toHaveValue('');
      await expect(dataPage.locators.addressInput).toHaveValue('');
      await expect(dataPage.locators.zipCodeInput).toHaveValue('');
      await expect(dataPage.locators.cityInput).toHaveValue('');
      await expect(dataPage.locators.countryInput).toHaveValue('');
      await expect(dataPage.locators.emailInput).toHaveValue('');
      await expect(dataPage.locators.phoneInput).toHaveValue('');
      await expect(dataPage.locators.jobPositionInput).toHaveValue('');
      await expect(dataPage.locators.companyInput).toHaveValue('');
    });

    test('should have form with correct action and method', async ({ page }) => {
      const dataPage = new DataTypesPage(page);
      await expect(dataPage.locators.form).toHaveAttribute('action', 'data-types-submitted.html');
      await expect(dataPage.locators.form).toHaveAttribute('method', 'get');
    });

    // --- Submission Tests ---
    test('should show all fields as success when all data is provided', async ({ page }) => {
      const dataPage = new DataTypesPage(page);
      await dataPage.actions.fillAllFields({
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

      await dataPage.actions.submit();
      await expect(page).toHaveURL(/data-types-submitted\.html/);

      // All fields should show alert-success
      const fieldIds = ['first-name', 'last-name', 'address', 'zip-code', 'city', 'country', 'e-mail', 'phone', 'job-position', 'company'];
      for (const id of fieldIds) {
        await expect(dataPage.locators.resultField(id)).toHaveClass(/alert-success/);
      }
    });

    test('should display submitted values correctly', async ({ page }) => {
      const dataPage = new DataTypesPage(page);
      await dataPage.actions.fillAllFields({
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

      await dataPage.actions.submit();

      await expect(dataPage.locators.resultField('first-name')).toHaveText('Jane');
      await expect(dataPage.locators.resultField('last-name')).toHaveText('Smith');
      await expect(dataPage.locators.resultField('address')).toHaveText('456 Oak Ave');
      await expect(dataPage.locators.resultField('zip-code')).toHaveText('67890');
      await expect(dataPage.locators.resultField('city')).toHaveText('Chicago');
      await expect(dataPage.locators.resultField('country')).toHaveText('Canada');
      await expect(dataPage.locators.resultField('e-mail')).toHaveText('jane@test.com');
      await expect(dataPage.locators.resultField('phone')).toHaveText('999-8888');
      await expect(dataPage.locators.resultField('job-position')).toHaveText('Designer');
      await expect(dataPage.locators.resultField('company')).toHaveText('Design Co');
    });

    test('should show all fields as danger when submitted empty', async ({ page }) => {
      const dataPage = new DataTypesPage(page);
      await dataPage.actions.submit();
      await expect(page).toHaveURL(/data-types-submitted\.html/);

      // All fields should show alert-danger with N/A
      const fieldIds = ['first-name', 'last-name', 'address', 'zip-code', 'city', 'country', 'e-mail', 'phone', 'job-position', 'company'];
      for (const id of fieldIds) {
        await expect(dataPage.locators.resultField(id)).toHaveClass(/alert-danger/);
        await expect(dataPage.locators.resultField(id)).toHaveText('N/A');
      }
    });

    test('should show mixed success and danger for partial data', async ({ page }) => {
      const dataPage = new DataTypesPage(page);
      // Fill only some fields
      await dataPage.locators.firstNameInput.fill('Alice');
      await dataPage.locators.zipCodeInput.fill('11111');
      await dataPage.locators.emailInput.fill('alice@example.com');

      await dataPage.actions.submit();

      // Filled fields should be success
      await expect(dataPage.locators.resultField('first-name')).toHaveClass(/alert-success/);
      await expect(dataPage.locators.resultField('first-name')).toHaveText('Alice');
      await expect(dataPage.locators.resultField('zip-code')).toHaveClass(/alert-success/);
      await expect(dataPage.locators.resultField('e-mail')).toHaveClass(/alert-success/);

      // Empty fields should be danger
      await expect(dataPage.locators.resultField('last-name')).toHaveClass(/alert-danger/);
      await expect(dataPage.locators.resultField('last-name')).toHaveText('N/A');
      await expect(dataPage.locators.resultField('address')).toHaveClass(/alert-danger/);
      await expect(dataPage.locators.resultField('city')).toHaveClass(/alert-danger/);
      await expect(dataPage.locators.resultField('country')).toHaveClass(/alert-danger/);
      await expect(dataPage.locators.resultField('phone')).toHaveClass(/alert-danger/);
      await expect(dataPage.locators.resultField('job-position')).toHaveClass(/alert-danger/);
      await expect(dataPage.locators.resultField('company')).toHaveClass(/alert-danger/);
    });

    test('should include query parameters in the submitted URL', async ({ page }) => {
      const dataPage = new DataTypesPage(page);
      await dataPage.locators.firstNameInput.fill('Test');
      await dataPage.locators.lastNameInput.fill('User');

      await dataPage.actions.submit();

      await expect(page).toHaveURL(/first-name=Test/);
      await expect(page).toHaveURL(/last-name=User/);
    });

    test('should handle special characters in input', async ({ page }) => {
      const dataPage = new DataTypesPage(page);
      await dataPage.locators.firstNameInput.fill("O'Brien");
      await dataPage.locators.addressInput.fill('123 Main St, Apt #4');

      await dataPage.actions.submit();

      await expect(dataPage.locators.resultField('first-name')).toHaveClass(/alert-success/);
      await expect(dataPage.locators.resultField('first-name')).toHaveText("O'Brien");
      await expect(dataPage.locators.resultField('address')).toHaveClass(/alert-success/);
      await expect(dataPage.locators.resultField('address')).toHaveText('123 Main St, Apt #4');
    });

    test('should preserve the Data types heading on submitted page', async ({ page }) => {
      const dataPage = new DataTypesPage(page);
      await dataPage.actions.submit();
      await expect(dataPage.locators.heading).toBeVisible();
    });

    test('should verify page title and copyright', async ({ page }) => {
      const dataPage = new DataTypesPage(page);
      await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');
      await expect(dataPage.locators.copyright).toBeAttached();
    });

    test('should submit with only email filled and verify email field is success', async ({ page }) => {
      const dataPage = new DataTypesPage(page);
      // Fill only the email field
      await dataPage.locators.emailInput.fill('test@example.com');

      await dataPage.actions.submit();

      // Email should be success
      await expect(dataPage.locators.resultField('e-mail')).toHaveClass(/alert-success/);
      await expect(dataPage.locators.resultField('e-mail')).toHaveText('test@example.com');

      // All other fields should be danger
      await expect(dataPage.locators.resultField('first-name')).toHaveClass(/alert-danger/);
      await expect(dataPage.locators.resultField('last-name')).toHaveClass(/alert-danger/);
      await expect(dataPage.locators.resultField('address')).toHaveClass(/alert-danger/);
      await expect(dataPage.locators.resultField('city')).toHaveClass(/alert-danger/);
      await expect(dataPage.locators.resultField('zip-code')).toHaveClass(/alert-danger/);
      await expect(dataPage.locators.resultField('country')).toHaveClass(/alert-danger/);
      await expect(dataPage.locators.resultField('phone')).toHaveClass(/alert-danger/);
      await expect(dataPage.locators.resultField('job-position')).toHaveClass(/alert-danger/);
      await expect(dataPage.locators.resultField('company')).toHaveClass(/alert-danger/);
    });
  });

  // ─────────────────────────────────────────────────
  //  Index Page - Chapter 9 Links
  // ─────────────────────────────────────────────────
  test.describe('Index Page - Chapter 9 Links', () => {
    test('should display the Chapter 9 section heading', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.actions.goto();
      await expect(homePage.locators.chapter9Heading).toBeVisible();
    });

    test('should have all Chapter 9 links', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.actions.goto();

      await expect(homePage.locators.chapterLink('Download files')).toBeVisible();
      await expect(homePage.locators.chapterLink('A/B Testing')).toBeVisible();
      await expect(homePage.locators.chapterLink('Data types')).toBeVisible();
    });

    test('should navigate to each Chapter 9 page and back', async ({ page }) => {
      const homePage = new HomePage(page);
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
