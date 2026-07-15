import { test, expect } from '../../fixtures/index';
import AxeBuilder from '@axe-core/playwright';
import { faker } from '@faker-js/faker';

// JIRA: https://orhunakkan.atlassian.net/browse/TAB1-37 — Shadow DOM & Web Components

const URL = '/practice/shadow-dom';

// Data-driven table for AC-4 (Phase 4b): every star index → the host `value` attribute it sets
const starCases = [
  { index: 1, name: '1 star' },
  { index: 2, name: '2 stars' },
  { index: 3, name: '3 stars' },
  { index: 4, name: '4 stars' },
  { index: 5, name: '5 stars' },
];

test.describe('Shadow DOM & Web Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  // AC-1 (TAB1-37): Tests use getByRole("radio") to locate the five star buttons inside the
  // star-rating custom element's open shadow root — no explicit shadow-piercing required.
  test.describe('AC-1 — getByRole("radio") pierces the open shadow root automatically', () => {
    test('positive: all 5 star radios are located via getByRole with no shadow-piercing syntax', async ({ shadowDomPage }) => {
      await expect(shadowDomPage.starRadios).toHaveCount(5);
      await expect(shadowDomPage.star1Radio).toBeVisible();
      await expect(shadowDomPage.star5Radio).toBeVisible();
    });

    test('boundary: before any interaction, none of the 5 radios are checked', async ({ shadowDomPage }) => {
      // evaluateAll queries immediately with no auto-wait, so the star radios must already be
      // rendered — wait for the custom element's shadow root to attach before reading from it.
      await expect(shadowDomPage.starRadios).toHaveCount(5);
      const checkedStates = await shadowDomPage.starRadios.evaluateAll((radios) => radios.map((r) => r.getAttribute('aria-checked')));
      expect(checkedStates).toEqual(['false', 'false', 'false', 'false', 'false']);
    });
  });

  // AC-2 (TAB1-37): Tests use getByLabel("Your name") to find the input inside the
  // labelled-input custom element across the shadow boundary.
  test.describe('AC-2 — getByLabel("Your name") reaches across the shadow boundary', () => {
    test('positive: the name input is located by its label and accepts text', async ({ shadowDomPage }) => {
      const name = faker.person.firstName();
      await expect(shadowDomPage.nameInput).toBeVisible();
      await shadowDomPage.nameInput.fill(name);
      await expect(shadowDomPage.nameInput).toHaveValue(name);
    });

    test('negative: the name input starts empty before any interaction', async ({ shadowDomPage }) => {
      await expect(shadowDomPage.nameInput).toHaveValue('');
    });
  });

  // AC-3 (TAB1-37): Tests click a star and assert the correct radio has aria-checked="true"
  // to confirm the selection without reaching into implementation details.
  test.describe('AC-3 — clicking a star sets aria-checked="true" on the correct radio only', () => {
    test('positive: clicking the 3rd star checks only that radio', async ({ shadowDomPage }) => {
      await shadowDomPage.star3Radio.click();
      await expect(shadowDomPage.star3Radio).toHaveAttribute('aria-checked', 'true');
      await expect(shadowDomPage.star1Radio).toHaveAttribute('aria-checked', 'false');
      await expect(shadowDomPage.star5Radio).toHaveAttribute('aria-checked', 'false');
    });

    test('boundary: the first star (1) and last star (5) both report aria-checked correctly', async ({ shadowDomPage }) => {
      await shadowDomPage.star1Radio.click();
      await expect(shadowDomPage.star1Radio).toHaveAttribute('aria-checked', 'true');

      await shadowDomPage.star5Radio.click();
      await expect(shadowDomPage.star5Radio).toHaveAttribute('aria-checked', 'true');
      await expect(shadowDomPage.star1Radio).toHaveAttribute('aria-checked', 'false');
    });

    test('negative: clicking a second star switches aria-checked off the first star', async ({ shadowDomPage }) => {
      await shadowDomPage.star2Radio.click();
      await expect(shadowDomPage.star2Radio).toHaveAttribute('aria-checked', 'true');

      await shadowDomPage.star4Radio.click();
      await expect(shadowDomPage.star4Radio).toHaveAttribute('aria-checked', 'true');
      await expect(shadowDomPage.star2Radio).toHaveAttribute('aria-checked', 'false');
    });
  });

  // AC-4 (TAB1-37): Tests use locator.evaluate() to read the value attribute from the custom
  // element host and assert it matches the number of the clicked star.
  test.describe('AC-4 — locator.evaluate() reads the host value attribute', () => {
    test('negative: host value attribute is "0" before any star is clicked', async ({ shadowDomPage }) => {
      const value = await shadowDomPage.ratingWidgetHost.evaluate((el) => el.getAttribute('value'));
      expect(value).toBe('0');
    });

    for (const { index, name } of starCases) {
      test(`data-driven: clicking "${name}" sets the host value attribute to "${index}"`, async ({ shadowDomPage }) => {
        await shadowDomPage.page.getByRole('radio', { name }).click();
        const value = await shadowDomPage.ratingWidgetHost.evaluate((el) => el.getAttribute('value'));
        expect(value).toBe(String(index));
      });
    }

    test('boundary: the value attribute updates rather than accumulates when a different star is clicked afterward', async ({ shadowDomPage }) => {
      await shadowDomPage.star5Radio.click();
      let value = await shadowDomPage.ratingWidgetHost.evaluate((el) => el.getAttribute('value'));
      expect(value).toBe('5');

      await shadowDomPage.star1Radio.click();
      value = await shadowDomPage.ratingWidgetHost.evaluate((el) => el.getAttribute('value'));
      expect(value).toBe('1');
    });
  });

  // AC-5 (TAB1-37): Tests use getByText inside a shadow root and confirm it behaves
  // identically to locating text in a regular DOM node.
  test.describe('AC-5 — getByText locates text inside a shadow root like any regular DOM node', () => {
    test('positive: getByText finds the "Your name" label living inside the shadow root', async ({ shadowDomPage }) => {
      await expect(shadowDomPage.nameLabelText).toBeVisible();
      await expect(shadowDomPage.nameLabelText).toHaveText('Your name');
    });

    test('negative: getByText does not match text that does not exist anywhere on the page', async ({ page }) => {
      await expect(page.getByText('This text does not exist anywhere on the page')).toHaveCount(0);
    });
  });

  // AC-6 (TAB1-37): Tests fill the name input inside the shadow root, click Submit, and
  // assert the confirmation status becomes visible.
  test.describe('AC-6 — filling the name and submitting shows the confirmation status', () => {
    test('positive: filling the name, selecting a star, and submitting shows the confirmation message', async ({ shadowDomPage }) => {
      const name = faker.person.firstName();
      await shadowDomPage.nameInput.fill(name);
      await shadowDomPage.star4Radio.click();
      await shadowDomPage.submitButton.click();

      await expect(shadowDomPage.confirmationStatus).toBeVisible();
      await expect(shadowDomPage.confirmationStatus).toHaveText(`You rated "${name}" 4 stars.`);
    });

    test('negative: the confirmation status is empty before Submit is clicked', async ({ shadowDomPage }) => {
      await expect(shadowDomPage.confirmationStatus).toBeEmpty();
    });

    test('negative: submitting without a name or rating shows a validation prompt, not a confirmation', async ({ shadowDomPage }) => {
      await shadowDomPage.submitButton.click();
      await expect(shadowDomPage.confirmationStatus).toBeVisible();
      await expect(shadowDomPage.confirmationStatus).toHaveText('Please choose a rating and enter a name.');
    });
  });

  // Accessibility — scan load + star-selected + post-submit-confirmation states (Phase 5).
  test.describe('accessibility (WCAG 2.x, axe)', () => {
    const scan = (page: import('@playwright/test').Page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();

    test('no violations on initial page load', async ({ page }) => {
      expect((await scan(page)).violations).toEqual([]);
    });

    test('no violations after selecting a star', async ({ page, shadowDomPage }) => {
      await shadowDomPage.star3Radio.click();
      expect((await scan(page)).violations).toEqual([]);
    });

    test('no violations on the post-submit confirmation state', async ({ page, shadowDomPage }) => {
      await shadowDomPage.nameInput.fill(faker.person.firstName());
      await shadowDomPage.star2Radio.click();
      await shadowDomPage.submitButton.click();
      await expect(shadowDomPage.confirmationStatus).toBeVisible();

      expect((await scan(page)).violations).toEqual([]);
    });
  });
});

// Performance — navigates independently so timing reflects cold initial load, not post-beforeEach warm load
test.describe('performance @performance', () => {
  test('initial shadow-dom page load is within budget', async ({ page }) => {
    await page.goto(URL);
    const timing = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return { domContentLoaded: nav.domContentLoadedEventEnd, load: nav.loadEventEnd };
    });
    expect(timing.domContentLoaded).toBeLessThan(6000);
    expect(timing.load).toBeLessThan(12000);
  });
});
