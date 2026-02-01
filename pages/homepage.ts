import { Locator, Page } from '@playwright/test';

class HomePage {
  chapter3Card: Locator;
  chapter4Card: Locator;
  chapter5Card: Locator;
  chapter7Card: Locator;
  chapter8Card: Locator;
  chapter9Card: Locator;

  constructor(private page: Page) {
    this.chapter3Card = page.getByText('Chapter 3. WebDriver Fundamentals Web form Navigation Dropdown menu Mouse over');
    this.chapter4Card = page.getByText('Chapter 4. Browser-Agnostic Features Long page Infinite scroll Shadow DOM');
    this.chapter5Card = page.getByText('Chapter 5. Browser-Specific Manipulation Geolocation Notifications Get user');
    this.chapter7Card = page.getByText('Chapter 7. The Page Object Model (POM) Login form Slow login');
    this.chapter8Card = page.getByText('Chapter 8. Testing Framework Specifics Random calculator');
    this.chapter9Card = page.getByText('Chapter 9. Third-Party Integrations Download files A/B Testing Data types');
  }
}

export default HomePage;
