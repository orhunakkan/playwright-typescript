import { test, expect } from '../../../fixtures/index.ts';

test.describe('product search', () => {
  test.beforeEach(async ({ page, isMobile }) => {
    await page.goto('/');
    // Wait for the initial catalogue: a search fired earlier can be overwritten by the slower initial
    // listing response (race found 2026-10-19, see test-harness handoff). Users see the list first.
    await expect(page.getByTestId('product-name').first()).toBeVisible();
    // On narrow viewports the search box sits inside the collapsed Filters panel, as a real user sees it
    if (isMobile) await page.getByRole('button', { name: 'Filters' }).click();
  });

  test('positive: search by name lists only matching products', { tag: '@example' }, async ({ page }) => {
    // Step: search for a term that exists in the catalogue
    await page.getByTestId('search-query').fill('pliers');
    await page.getByTestId('search-submit').click();

    // Expect: the results are for the term, at least one product, and no non-matching product
    await expect(page.getByTestId('search-caption')).toHaveText('Searched for: pliers');
    const names = page.getByTestId('product-name');
    await expect(names).not.toHaveCount(0);
    await expect(names.filter({ hasNotText: /pliers/i })).toHaveCount(0);
  });

  test('negative: a term with no matches shows the empty state', { tag: '@example' }, async ({ page }) => {
    // Step: search for a term that matches nothing
    await page.getByTestId('search-query').fill('zzqqxx-no-such-product');
    await page.getByTestId('search-submit').click();

    // Expect: the empty-state message and no product cards
    await expect(page.getByTestId('no-results')).toHaveText('There are no products found.');
    await expect(page.getByTestId('product-name')).toHaveCount(0);
  });
});
