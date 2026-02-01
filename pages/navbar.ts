import { Locator, Page } from '@playwright/test';

class NavBar {
  navBarADefaultLogo: Locator;
  navBarADefaultWhoWeServeBtn: Locator;
  navBarADefaultWhatWeDoBtn: Locator;
  navBarADefaultAboutUsBtn: Locator;
  navBarADefaultInsightsBtn: Locator;
  navBarADefaultRegionSelector: Locator;
  navBarADefaultContactUsLink: Locator;
  navBarADefaultSearchLink: Locator;
  navBarADefaultClientLoginLink: Locator;
  whoWeServeTab: Locator;
  whatWeDoTab: Locator;
  aboutUsTab: Locator;
  insightsResearchTab: Locator;
  northernTrustRegionsHeading: Locator;
  connectWithNorthernTrustText: Locator;
  searchPlaceholder: Locator;

  constructor(private page: Page) {
    this.navBarADefaultLogo = page.getByTestId('navigation_bar_a_default').getByLabel('Northern Trust Homepage');
    this.navBarADefaultWhoWeServeBtn = page.getByTestId('navigation_bar_a_default').getByRole('button', { name: 'Who We Serve' });
    this.navBarADefaultWhatWeDoBtn = page.getByTestId('navigation_bar_a_default').getByRole('button', { name: 'What We Do' });
    this.navBarADefaultAboutUsBtn = page.getByTestId('navigation_bar_a_default').getByRole('button', { name: 'About Us' });
    this.navBarADefaultInsightsBtn = page.getByTestId('navigation_bar_a_default').getByRole('button', { name: 'Insights & Research' });
    this.navBarADefaultRegionSelector = page.getByTestId('navigation_bar_a_default').getByLabel('Region');
    this.navBarADefaultContactUsLink = page.getByTestId('navigation_bar_a_default').getByRole('link', { name: 'Contact Us' });
    this.navBarADefaultSearchLink = page.getByTestId('navigation_bar_a_default').getByRole('link', { name: 'Search' });
    this.navBarADefaultClientLoginLink = page.getByTestId('navigation_bar_a_default').getByRole('link', { name: 'Client Login', exact: true });
    this.whoWeServeTab = page.getByRole('tab', { name: 'Who We Serve' });
    this.whatWeDoTab = page.getByRole('tab', { name: 'What We Do' });
    this.aboutUsTab = page.getByRole('tab', { name: 'About Us' });
    this.insightsResearchTab = page.getByRole('tab', { name: 'Insights & Research' });
    this.northernTrustRegionsHeading = page.getByRole('heading', { name: 'Northern Trust Regions' });
    this.connectWithNorthernTrustText = page.getByText('Connect with Northern Trust');
    this.searchPlaceholder = page.getByPlaceholder('Search northerntrust.com');
  }
}

export default NavBar;
