import { expect, test } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'https://bonigarcia.dev/selenium-webdriver-java';

test.describe('Chapter 9 - Third-Party Integrations', () => {
  // ─────────────────────────────────────────────────
  //  1. Download Files
  // ─────────────────────────────────────────────────
  test.describe('Download Files', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/download.html`);
    });

    test('should display the download files heading', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Download files' })).toBeVisible();
    });

    test('should have four download links', async ({ page }) => {
      const downloadLinks = page.locator('a[download]');
      await expect(downloadLinks).toHaveCount(4);
    });

    test('should have WebDriverManager logo download link', async ({ page }) => {
      const link = page.getByRole('link', { name: 'WebDriverManager logo' });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', './docs/webdrivermanager.png');
      await expect(link).toHaveAttribute('download', 'webdrivermanager.png');
    });

    test('should have WebDriverManager doc download link', async ({ page }) => {
      const link = page.getByRole('link', { name: 'WebDriverManager doc' });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', './docs/webdrivermanager.pdf');
      await expect(link).toHaveAttribute('download', 'webdrivermanager.pdf');
    });

    test('should have Selenium-Jupiter logo download link', async ({ page }) => {
      const link = page.getByRole('link', { name: 'Selenium-Jupiter logo' });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', './docs/selenium-jupiter.png');
      await expect(link).toHaveAttribute('download', 'selenium-jupiter.png');
    });

    test('should have Selenium-Jupiter doc download link', async ({ page }) => {
      const link = page.getByRole('link', { name: 'Selenium-Jupiter doc' });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', './docs/selenium-jupiter.pdf');
      await expect(link).toHaveAttribute('download', 'selenium-jupiter.pdf');
    });

    test('should have correct button styling on all download links', async ({ page }) => {
      const downloadLinks = page.locator('a[download]');
      const count = await downloadLinks.count();
      for (let i = 0; i < count; i++) {
        await expect(downloadLinks.nth(i)).toHaveClass(/btn-outline-primary/);
      }
    });

    test('should download the WebDriverManager PNG file', async ({ page }) => {
      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('link', { name: 'WebDriverManager logo' }).click();
      const download = await downloadPromise;

      expect(download.suggestedFilename()).toBe('webdrivermanager.png');

      // Save and verify file exists
      const filePath = path.join('test-results', download.suggestedFilename());
      await download.saveAs(filePath);
      expect(fs.existsSync(filePath)).toBe(true);

      // Clean up
      fs.unlinkSync(filePath);
    });

    test('should download the WebDriverManager PDF file', async ({ page }) => {
      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('link', { name: 'WebDriverManager doc' }).click();
      const download = await downloadPromise;

      expect(download.suggestedFilename()).toBe('webdrivermanager.pdf');
    });

    test('should download the Selenium-Jupiter PNG file', async ({ page }) => {
      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('link', { name: 'Selenium-Jupiter logo' }).click();
      const download = await downloadPromise;

      expect(download.suggestedFilename()).toBe('selenium-jupiter.png');
    });

    test('should download the Selenium-Jupiter PDF file', async ({ page }) => {
      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('link', { name: 'Selenium-Jupiter doc' }).click();
      const download = await downloadPromise;

      expect(download.suggestedFilename()).toBe('selenium-jupiter.pdf');
    });

    test('should verify downloaded PNG file has content', async ({ page }) => {
      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('link', { name: 'WebDriverManager logo' }).click();
      const download = await downloadPromise;

      const filePath = path.join('test-results', 'verify-' + download.suggestedFilename());
      await download.saveAs(filePath);

      const stats = fs.statSync(filePath);
      expect(stats.size).toBeGreaterThan(0);

      // Clean up
      fs.unlinkSync(filePath);
    });

    test('should verify page title and copyright', async ({ page }) => {
      await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');
      await expect(page.getByText('Copyright © 2021-2025')).toBeAttached();
    });
  });

  // ─────────────────────────────────────────────────
  //  2. A/B Testing
  // ─────────────────────────────────────────────────
  test.describe('A/B Testing', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/ab-testing.html`);
      // Content is loaded via jQuery AJAX — wait for it
      await page.locator('#content h6').waitFor();
    });

    test('should display the A/B Testing heading', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'A/B Testing' })).toBeVisible();
    });

    test('should load either variation A or variation B', async ({ page }) => {
      const heading = page.locator('#content h6');
      const text = await heading.textContent();

      // Must be one of the two variations
      expect(text === 'This is variation A' || text === 'This is variation B').toBe(true);
    });

    test('should have a paragraph of Lorem-style text', async ({ page }) => {
      const paragraph = page.locator('#content p.lead');
      await expect(paragraph).toBeVisible();

      const text = await paragraph.textContent();
      expect(text!.length).toBeGreaterThan(50);
    });

    test('should load content into the #content div', async ({ page }) => {
      const content = page.locator('#content');
      await expect(content).toBeAttached();

      // Should contain a heading and a paragraph
      await expect(content.locator('h6')).toBeVisible();
      await expect(content.locator('p.lead')).toBeVisible();
    });

    test('should show variation A content when loaded', async ({ browser }) => {
      // Mock Math.random to always return < 0.5 (variation A)
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.addInitScript(() => {
        Math.random = () => 0.1;
      });

      await page.goto(`${BASE_URL}/ab-testing.html`);
      await page.locator('#content h6').waitFor();

      await expect(page.locator('#content h6')).toHaveText('This is variation A');
      await expect(page.locator('#content p.lead')).toContainText('Lorem ipsum');

      await context.close();
    });

    test('should show variation B content when loaded', async ({ browser }) => {
      // Mock Math.random to always return >= 0.5 (variation B)
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.addInitScript(() => {
        Math.random = () => 0.9;
      });

      await page.goto(`${BASE_URL}/ab-testing.html`);
      await page.locator('#content h6').waitFor();

      await expect(page.locator('#content h6')).toHaveText('This is variation B');

      await context.close();
    });

    test('should have the content div with correct id', async ({ page }) => {
      const content = page.locator('#content');
      await expect(content).toBeAttached();
      await expect(content).toHaveClass(/py-2/);
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
      await pageA.goto(`${BASE_URL}/ab-testing.html`);
      await pageA.locator('#content p.lead').waitFor();
      const textA = await pageA.locator('#content p.lead').textContent();
      await contextA.close();

      // Get variation B content
      const contextB = await browser.newContext();
      const pageB = await contextB.newPage();
      await pageB.addInitScript(() => {
        Math.random = () => 0.9;
      });
      await pageB.goto(`${BASE_URL}/ab-testing.html`);
      await pageB.locator('#content p.lead').waitFor();
      const textB = await pageB.locator('#content p.lead').textContent();
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
      await page.goto(`${BASE_URL}/data-types.html`);
    });

    test('should display the data types heading', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Data types' })).toBeVisible();
    });

    test('should have a First name input', async ({ page }) => {
      const input = page.getByLabel('First name');
      await expect(input).toBeVisible();
      await expect(input).toHaveAttribute('name', 'first-name');
      await expect(input).toHaveAttribute('type', 'text');
    });

    test('should have a Last name input', async ({ page }) => {
      const input = page.getByLabel('Last name');
      await expect(input).toBeVisible();
      await expect(input).toHaveAttribute('name', 'last-name');
    });

    test('should have an Address input', async ({ page }) => {
      const input = page.getByLabel('Address');
      await expect(input).toBeVisible();
      await expect(input).toHaveAttribute('name', 'address');
    });

    test('should have a Zip code input', async ({ page }) => {
      const input = page.getByLabel('Zip code');
      await expect(input).toBeVisible();
      await expect(input).toHaveAttribute('name', 'zip-code');
    });

    test('should have a City input', async ({ page }) => {
      const input = page.getByLabel('City');
      await expect(input).toBeVisible();
      await expect(input).toHaveAttribute('name', 'city');
    });

    test('should have a Country input', async ({ page }) => {
      const input = page.getByLabel('Country');
      await expect(input).toBeVisible();
      await expect(input).toHaveAttribute('name', 'country');
    });

    test('should have an E-mail input', async ({ page }) => {
      const input = page.getByLabel('E-mail');
      await expect(input).toBeVisible();
      await expect(input).toHaveAttribute('name', 'e-mail');
      await expect(input).toHaveAttribute('type', 'email');
    });

    test('should have a Phone number input', async ({ page }) => {
      const input = page.getByLabel('Phone number');
      await expect(input).toBeVisible();
      await expect(input).toHaveAttribute('name', 'phone');
    });

    test('should have a Job position input', async ({ page }) => {
      const input = page.getByLabel('Job position');
      await expect(input).toBeVisible();
      await expect(input).toHaveAttribute('name', 'job-position');
    });

    test('should have a Company input', async ({ page }) => {
      const input = page.getByLabel('Company');
      await expect(input).toBeVisible();
      await expect(input).toHaveAttribute('name', 'company');
    });

    test('should have a submit button', async ({ page }) => {
      const button = page.getByRole('button', { name: 'Submit' });
      await expect(button).toBeVisible();
      await expect(button).toHaveAttribute('type', 'submit');
      await expect(button).toHaveClass(/btn-outline-primary/);
    });

    test('should have all 10 input fields', async ({ page }) => {
      const inputs = page.locator('form input.form-control');
      await expect(inputs).toHaveCount(10);
    });

    test('should have all inputs empty initially', async ({ page }) => {
      const fields = ['First name', 'Last name', 'Address', 'Zip code', 'City', 'Country', 'E-mail', 'Phone number', 'Job position', 'Company'];
      for (const field of fields) {
        await expect(page.getByLabel(field)).toHaveValue('');
      }
    });

    test('should have form with correct action and method', async ({ page }) => {
      const form = page.locator('form');
      await expect(form).toHaveAttribute('action', 'data-types-submitted.html');
      await expect(form).toHaveAttribute('method', 'get');
    });

    // --- Submission Tests ---
    test('should show all fields as success when all data is provided', async ({ page }) => {
      await page.getByLabel('First name').fill('John');
      await page.getByLabel('Last name').fill('Doe');
      await page.getByLabel('Address').fill('123 Main Street');
      await page.getByLabel('Zip code').fill('12345');
      await page.getByLabel('City').fill('New York');
      await page.getByLabel('Country').fill('USA');
      await page.getByLabel('E-mail').fill('john.doe@example.com');
      await page.getByLabel('Phone number').fill('555-1234');
      await page.getByLabel('Job position').fill('Software Engineer');
      await page.getByLabel('Company').fill('Acme Corp');

      await page.getByRole('button', { name: 'Submit' }).click();
      await expect(page).toHaveURL(/data-types-submitted\.html/);

      // All fields should show alert-success
      const fieldIds = ['first-name', 'last-name', 'address', 'zip-code', 'city', 'country', 'e-mail', 'phone', 'job-position', 'company'];
      for (const id of fieldIds) {
        await expect(page.locator(`#${id}`)).toHaveClass(/alert-success/);
      }
    });

    test('should display submitted values correctly', async ({ page }) => {
      await page.getByLabel('First name').fill('Jane');
      await page.getByLabel('Last name').fill('Smith');
      await page.getByLabel('Address').fill('456 Oak Ave');
      await page.getByLabel('Zip code').fill('67890');
      await page.getByLabel('City').fill('Chicago');
      await page.getByLabel('Country').fill('Canada');
      await page.getByLabel('E-mail').fill('jane@test.com');
      await page.getByLabel('Phone number').fill('999-8888');
      await page.getByLabel('Job position').fill('Designer');
      await page.getByLabel('Company').fill('Design Co');

      await page.getByRole('button', { name: 'Submit' }).click();

      await expect(page.locator('#first-name')).toHaveText('Jane');
      await expect(page.locator('#last-name')).toHaveText('Smith');
      await expect(page.locator('#address')).toHaveText('456 Oak Ave');
      await expect(page.locator('#zip-code')).toHaveText('67890');
      await expect(page.locator('#city')).toHaveText('Chicago');
      await expect(page.locator('#country')).toHaveText('Canada');
      await expect(page.locator('#e-mail')).toHaveText('jane@test.com');
      await expect(page.locator('#phone')).toHaveText('999-8888');
      await expect(page.locator('#job-position')).toHaveText('Designer');
      await expect(page.locator('#company')).toHaveText('Design Co');
    });

    test('should show all fields as danger when submitted empty', async ({ page }) => {
      await page.getByRole('button', { name: 'Submit' }).click();
      await expect(page).toHaveURL(/data-types-submitted\.html/);

      // All fields should show alert-danger with N/A
      const fieldIds = ['first-name', 'last-name', 'address', 'zip-code', 'city', 'country', 'e-mail', 'phone', 'job-position', 'company'];
      for (const id of fieldIds) {
        await expect(page.locator(`#${id}`)).toHaveClass(/alert-danger/);
        await expect(page.locator(`#${id}`)).toHaveText('N/A');
      }
    });

    test('should show mixed success and danger for partial data', async ({ page }) => {
      // Fill only some fields
      await page.getByLabel('First name').fill('Alice');
      await page.getByLabel('Zip code').fill('11111');
      await page.getByLabel('E-mail').fill('alice@example.com');

      await page.getByRole('button', { name: 'Submit' }).click();

      // Filled fields should be success
      await expect(page.locator('#first-name')).toHaveClass(/alert-success/);
      await expect(page.locator('#first-name')).toHaveText('Alice');
      await expect(page.locator('#zip-code')).toHaveClass(/alert-success/);
      await expect(page.locator('#e-mail')).toHaveClass(/alert-success/);

      // Empty fields should be danger
      await expect(page.locator('#last-name')).toHaveClass(/alert-danger/);
      await expect(page.locator('#last-name')).toHaveText('N/A');
      await expect(page.locator('#address')).toHaveClass(/alert-danger/);
      await expect(page.locator('#city')).toHaveClass(/alert-danger/);
      await expect(page.locator('#country')).toHaveClass(/alert-danger/);
      await expect(page.locator('#phone')).toHaveClass(/alert-danger/);
      await expect(page.locator('#job-position')).toHaveClass(/alert-danger/);
      await expect(page.locator('#company')).toHaveClass(/alert-danger/);
    });

    test('should include query parameters in the submitted URL', async ({ page }) => {
      await page.getByLabel('First name').fill('Test');
      await page.getByLabel('Last name').fill('User');

      await page.getByRole('button', { name: 'Submit' }).click();

      await expect(page).toHaveURL(/first-name=Test/);
      await expect(page).toHaveURL(/last-name=User/);
    });

    test('should handle special characters in input', async ({ page }) => {
      await page.getByLabel('First name').fill("O'Brien");
      await page.getByLabel('Address').fill('123 Main St, Apt #4');

      await page.getByRole('button', { name: 'Submit' }).click();

      await expect(page.locator('#first-name')).toHaveClass(/alert-success/);
      await expect(page.locator('#first-name')).toHaveText("O'Brien");
      await expect(page.locator('#address')).toHaveClass(/alert-success/);
      await expect(page.locator('#address')).toHaveText('123 Main St, Apt #4');
    });

    test('should preserve the Data types heading on submitted page', async ({ page }) => {
      await page.getByRole('button', { name: 'Submit' }).click();
      await expect(page.getByRole('heading', { name: 'Data types' })).toBeVisible();
    });

    test('should verify page title and copyright', async ({ page }) => {
      await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');
      await expect(page.getByText('Copyright © 2021-2025')).toBeAttached();
    });

    test('should submit with only email filled and verify email field is success', async ({ page }) => {
      // Fill only the email field
      await page.getByLabel('E-mail').fill('test@example.com');

      await page.getByRole('button', { name: 'Submit' }).click();

      // Email should be success
      await expect(page.locator('#e-mail')).toHaveClass(/alert-success/);
      await expect(page.locator('#e-mail')).toHaveText('test@example.com');

      // All other fields should be danger
      await expect(page.locator('#first-name')).toHaveClass(/alert-danger/);
      await expect(page.locator('#last-name')).toHaveClass(/alert-danger/);
      await expect(page.locator('#address')).toHaveClass(/alert-danger/);
      await expect(page.locator('#city')).toHaveClass(/alert-danger/);
      await expect(page.locator('#zip-code')).toHaveClass(/alert-danger/);
      await expect(page.locator('#country')).toHaveClass(/alert-danger/);
      await expect(page.locator('#phone')).toHaveClass(/alert-danger/);
      await expect(page.locator('#job-position')).toHaveClass(/alert-danger/);
      await expect(page.locator('#company')).toHaveClass(/alert-danger/);
    });
  });

  // ─────────────────────────────────────────────────
  //  Index Page - Chapter 9 Links
  // ─────────────────────────────────────────────────
  test.describe('Index Page - Chapter 9 Links', () => {
    test('should display the Chapter 9 section heading', async ({ page }) => {
      await page.goto(`${BASE_URL}/index.html`);
      await expect(page.getByRole('heading', { name: 'Chapter 9. Third-Party Integrations' })).toBeVisible();
    });

    test('should have all Chapter 9 links', async ({ page }) => {
      await page.goto(`${BASE_URL}/index.html`);

      await expect(page.getByRole('link', { name: 'Download files' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'A/B Testing' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Data types' })).toBeVisible();
    });

    test('should navigate to each Chapter 9 page and back', async ({ page }) => {
      const links = [
        { name: 'Download files', url: 'download.html' },
        { name: 'A/B Testing', url: 'ab-testing.html' },
        { name: 'Data types', url: 'data-types.html' },
      ];

      for (const link of links) {
        await page.goto(`${BASE_URL}/index.html`);
        await page.getByRole('link', { name: link.name }).click();
        await expect(page).toHaveURL(new RegExp(link.url.replace('.', '\\.')));
        await page.goBack();
        await expect(page).toHaveURL(/index\.html/);
      }
    });
  });
});
