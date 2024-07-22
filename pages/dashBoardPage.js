import { expect } from '@playwright/test';
import locators from '../locators/locators.json';

export class DashBoardPage {
  constructor(page) {
    this.page = page;
  }

  async verifyHeader() {
    await this.page.waitForLoadState('load');
    // Wait for a specific element on the main page that indicates a successful login
    await this.page.getByText('Aspirion Compass').waitFor();
    expect(await this.page.getByRole('menuitem')).toContainText(
      'Aspirion Compass',
    );
  }

  async verifyUserRole(user) {
    await this.page.getByRole('button', { name: 'USER' }).click();
    await expect(this.page.getByRole('menu')).toContainText(user);
  }

  async goOfflineAndVerifyNoNetworkMessage() {
    await this.page.evaluate(() => {
      window.dispatchEvent(new Event('offline'));
    });
    await expect(this.page.getByRole('alert')).toBeVisible();
    await expect(this.page.getByRole('alert')).toContainText('No Internet');
  }

  async goOnlineAndVerifyNoNetworkMessageNotExist() {
    await this.page.evaluate(() => {
      window.dispatchEvent(new Event('online'));
    });
    await expect(this.page.getByRole('alert')).not.toBeVisible();
  }

  async clickOtherActions() {
    await this.page.getByText('OTHER ACTIONS').click();
    await expect(
      this.page.getByText('Create new bucketEdit this'),
    ).toBeVisible();
  }

  async clickCreateBucket() {
    await this.page.getByText('Create new bucket').click();
    await expect(
      this.page.getByRole('heading', { name: 'Create bucket' }),
    ).toBeVisible();
  }

  async fillCreateBucketDetails(name, serviceLine) {
    await this.page.getByLabel('Name').click();
    await this.page.getByLabel('Name').fill(name);
    await this.page.getByText('Select...').first().click();
    await this.page.getByRole('option', { name: 'Service Line' }).click();
    await this.page.locator('.custom_select__input-container').click();
    await this.page.getByRole('option', { name: serviceLine }).click();
  }

  async clickCreateButton() {
    await this.page.getByRole('button', { name: 'CREATE' }).click();
    await expect(this.page.getByText('Bucket created.')).toBeVisible();
  }

  async editBucket(name) {
    await this.page.getByRole('button', { name: 'SELECT BUCKET' }).click();
    await this.page.getByRole('button', { name: name }).click();
    await this.page.getByRole('button', { name: 'OTHER ACTIONS' }).click();
    await this.page.getByRole('menuitem', { name: 'Edit this bucket' }).click();
    await this.page.getByLabel('Name').click();
    await this.page.getByLabel('Name').fill(name + ' 002');
    await this.page.getByRole('button', { name: 'SAVE', exact: true }).click();
    await expect(this.page.getByText('Bucket updated.')).toBeVisible();
  }

  async deleteBucket() {
    await this.page.getByRole('button', { name: 'OTHER ACTIONS' }).click();
    await this.page
      .getByRole('menuitem', { name: 'Delete this bucket' })
      .click();
    await expect(
      this.page.getByRole('heading', { name: 'This bucket was deleted. Any' }),
    ).toBeVisible();
    await expect(
      this.page.getByRole('button', { name: 'UNDELETE BUCKET' }),
    ).toBeVisible();
  }

  async clickOnPreviewButtonAndVerify(expectedServiceLineText) {
    await this.page
      .getByRole('button', { name: 'PREVIEW' })
      .click({ delay: 1000 });
    await expect(this.page.getByText('Testing')).toBeVisible();
    await expect(this.page.getByText('Testing')).toBeVisible();
    await expect(
      this.page.locator(locators.homePage.compassIDLoadingSkeleton).first(),
    ).not.toBeVisible();
    // Locate all cells in the Service Line column
    const serviceLineCells = await this.page.locator('td:nth-child(6)');

    // Get the text content of each cell
    const serviceLineTexts = await serviceLineCells.allTextContents();

    // Check that all cells have the same text
    const allSame = serviceLineTexts.every(
      (text) => text === expectedServiceLineText,
    );

    // Assert that all rows have the same service line
    expect(allSame).toBe(true);
  }

  async verifyPreviewPanel() {
    await expect(
      this.page.getByText(
        'MetadataName11/30Sort ByAdmission date by newestShare with (optional)QueryAll',
      ),
    ).toBeVisible();
  }
}
