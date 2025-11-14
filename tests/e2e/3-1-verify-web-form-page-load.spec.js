/* global describe, it, before, after */

import { Builder, By, until } from 'selenium-webdriver';
import { expect } from 'chai';

describe('Web Form Testing', () => {
  let driver;

  before(async () => {
    driver = await new Builder().forBrowser('chrome').build();
  });

  after(async () => {
    await driver.quit();
  });

  it('Verify Web Form Page Load', async () => {
    // 1. Navigate to https://bonigarcia.dev/selenium-webdriver-java/index.html
    await driver.get('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 2. Locate the "Chapter 3. WebDriver Fundamentals" section
    // 3. Click on "Web form" link
    const webFormLink = await driver.findElement(By.linkText('Web form'));
    await webFormLink.click();

    // Verify page navigates to web-form.html
    await driver.wait(until.urlContains('web-form.html'), 5000);
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).to.match(/.*web-form\.html/);

    // Verify page title displays "Hands-On Selenium WebDriver with Java"
    const title = await driver.getTitle();
    expect(title).to.equal('Hands-On Selenium WebDriver with Java');

    // Verify "Web form" heading is visible
    const heading = await driver.findElement(By.css('.display-6'));
    expect(await heading.isDisplayed()).to.be.true;
    const headingText = await heading.getText();
    expect(headingText).to.equal('Web form');

    // Verify all form elements are present and visible
    const textInput = await driver.findElement(By.id('my-text-id'));
    expect(await textInput.isDisplayed()).to.be.true;

    const passwordInput = await driver.findElement(By.name('my-password'));
    expect(await passwordInput.isDisplayed()).to.be.true;

    const textarea = await driver.findElement(By.name('my-textarea'));
    expect(await textarea.isDisplayed()).to.be.true;

    const disabledInput = await driver.findElement(By.name('my-disabled'));
    expect(await disabledInput.isDisplayed()).to.be.true;

    const readonlyInput = await driver.findElement(By.name('my-readonly'));
    expect(await readonlyInput.isDisplayed()).to.be.true;

    const dropdown = await driver.findElement(By.name('my-select'));
    expect(await dropdown.isDisplayed()).to.be.true;

    const checkedCheckbox = await driver.findElement(By.id('my-check-1'));
    expect(await checkedCheckbox.isDisplayed()).to.be.true;

    const defaultCheckbox = await driver.findElement(By.id('my-check-2'));
    expect(await defaultCheckbox.isDisplayed()).to.be.true;

    const checkedRadio = await driver.findElement(By.id('my-radio-1'));
    expect(await checkedRadio.isDisplayed()).to.be.true;

    const defaultRadio = await driver.findElement(By.id('my-radio-2'));
    expect(await defaultRadio.isDisplayed()).to.be.true;

    const submitButton = await driver.findElement(By.css('button[type="submit"]'));
    expect(await submitButton.isDisplayed()).to.be.true;
  });
});