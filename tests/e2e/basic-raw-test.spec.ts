import {expect, test} from '@playwright/test';

test.describe('Homepage URL validation', () => {
  test('should go to homepage and verify its URL', async ({page}) => {
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');
    expect(await page.title()).toEqual('Hands-On Selenium WebDriver with Java');
  })
})