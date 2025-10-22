import {expect, test} from '@playwright/test';

test.describe('Homepage URL validation', () => {
  test.beforeEach('should go to homepage', async ({page}) => {
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');
  })

  test('should verify its URL', async ({page}) => {
    expect(await page.title()).toEqual('Hands-On Selenium WebDriver with Java');
  })

  test('visual regression test', async ({page}) => {
    await expect(page).toHaveScreenshot({fullPage: true});
  })
})