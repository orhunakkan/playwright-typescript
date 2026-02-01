// import { test, expect } from '@playwright/test';
// import { acceptCookiesBeforeSession } from '../../utilities/cookies';
// import { skipIfNotSilentProduction } from '../../utilities/skip-test';
// import { expectedPageLoadTime, waitForDomStability } from '../../utilities/page-load-time';
// import NavBar from '../../pages/navbar';

// const pagePath = '/united-states/test/qa/nt-com/navbar';

// test.describe('navBar A tests', () => {
//   let navBar: NavBar;

//   test.beforeEach(async ({ page, context }) => {
//     await acceptCookiesBeforeSession(context);
//     await page.goto(pagePath);
//     navBar = new NavBar(page);
//   });

//   test('navBar A northern Trust logo Functional Test', async ({ page }) => {
//     await expect(navBar.navBarADefaultLogo).toBeVisible();
//   });

//   test('navBar A northern Trust logo navigates to home page upon click', async ({ page }) => {
//     await navBar.navBarADefaultLogo.click();
//     const pageUrl = page.url();
//     const expectedUrl = `${process.env.ENV}/united-states/home`;
//     expect(pageUrl).toStrictEqual(expectedUrl);
//   });

//   test('navBar A who We Serve Functional Test', async ({ page }) => {
//     await navBar.navBarADefaultWhoWeServeBtn.click();
//     await expect(navBar.whoWeServeTab).toBeVisible();
//   });

//   test('navBar A what We Do Functional Test', async ({ page }) => {
//     await navBar.navBarADefaultWhatWeDoBtn.click();
//     await expect(navBar.whatWeDoTab).toBeVisible();
//   });

//   test('navBar A about Us Functional Test', async ({ page }) => {
//     await navBar.navBarADefaultAboutUsBtn.click();
//     await expect(navBar.aboutUsTab).toBeVisible();
//   });

//   test('navBar A insights & Research Functional Test', async ({ page }) => {
//     await navBar.navBarADefaultInsightsBtn.click();
//     await expect(navBar.insightsResearchTab).toBeVisible();
//   });

//   test('navBar A region selector icon opens Region Selector', async ({ page }) => {
//     await navBar.navBarADefaultRegionSelector.click();
//     await expect(navBar.northernTrustRegionsHeading).toBeVisible();
//   });

//   test('navBar A clicks navigate to contact us page', async ({ page }) => {
//     await navBar.navBarADefaultContactUsLink.click();
//     await navBar.connectWithNorthernTrustText.isVisible();
//     expect(page.url()).toContain('contact-us');
//   });

//   test('navBar A search clicks navigate to search page', async ({ page }) => {
//     await navBar.navBarADefaultSearchLink.click();
//     await navBar.searchPlaceholder.isVisible();
//     expect(page.url()).toContain('search');
//   });

//   test('navBar A validate client login', async ({ page }) => {
//     await navBar.navBarADefaultClientLoginLink.click();
//     await page.waitForURL(/https:\/\/login(uat)?\.ntrs\.com/);
//     expect(page.url()).toContain('login');
//   });

//   test('navbar A visual regression test', async ({ page }) => {
//     await waitForDomStability(page);
//     await expect(page).toHaveScreenshot();
//   });

//   test('navbar A page load time test', async ({ page }) => {
//     await skipIfNotSilentProduction();
//     await expectedPageLoadTime(page, pagePath);
//   });
// });
