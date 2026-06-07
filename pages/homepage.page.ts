import { Page, Locator } from '@playwright/test';

export class HomePage {
  // ── Links ───────────────────────────────────────────────
  readonly accessibleLocatorsLink: Locator;
  readonly formsAndValidationLink: Locator;
  readonly tablesAndFilteringLink: Locator;
  readonly asyncUiLink: Locator;
  readonly networkAndApiLink: Locator;
  readonly fakeAuthLink: Locator;
  readonly browserEventsLink: Locator;
  readonly framesAndContextsLink: Locator;
  readonly emulationAndInputLink: Locator;
  readonly debuggingAndReportingLink: Locator;
  readonly webSocketInterceptionLink: Locator;
  readonly ariaSnapshotsLink: Locator;
  readonly clockAndTimersLink: Locator;
  readonly apiRequestContextLink: Locator;
  readonly storageStateLink: Locator;
  readonly visualRegressionLink: Locator;
  readonly dragAndDropLink: Locator;
  readonly harRecordingLink: Locator;
  readonly multiTabLink: Locator;
  readonly serviceWorkersLink: Locator;
  readonly geolocationAndPermissionsLink: Locator;
  readonly locatorHandlersLink: Locator;
  readonly mediaAndLocaleEmulationLink: Locator;
  readonly scrollAndLazyLoadingLink: Locator;
  readonly accessibilityScanningLink: Locator;
  readonly shadowDomAndWebComponentsLink: Locator;
  readonly touchAndMobileGesturesLink: Locator;
  readonly initScriptsAndSeedingLink: Locator;
  readonly serverSentEventsLink: Locator;
  readonly softAssertionsAndTestStepsLink: Locator;

  constructor(page: Page) {
    // ── Links ─────────────────────────────────────────────
    this.accessibleLocatorsLink = page.getByRole('link', { name: 'Accessible Locators' });
    this.formsAndValidationLink = page.getByRole('link', { name: 'Forms & Validation' });
    this.tablesAndFilteringLink = page.getByRole('link', { name: 'Tables & Filtering' });
    this.asyncUiLink = page.getByRole('link', { name: 'Async UI' });
    this.networkAndApiLink = page.getByRole('link', { name: 'Network & API' });
    this.fakeAuthLink = page.getByRole('link', { name: 'Fake Auth' });
    this.browserEventsLink = page.getByRole('link', { name: 'Browser Events' });
    this.framesAndContextsLink = page.getByRole('link', { name: 'Frames & Contexts' });
    this.emulationAndInputLink = page.getByRole('link', { name: 'Emulation & Input' });
    this.debuggingAndReportingLink = page.getByRole('link', { name: 'Debugging & Reporting' });
    this.webSocketInterceptionLink = page.getByRole('link', { name: 'WebSocket Interception' });
    this.ariaSnapshotsLink = page.getByRole('link', { name: 'ARIA Snapshots' });
    this.clockAndTimersLink = page.getByRole('link', { name: 'Clock & Timers' });
    this.apiRequestContextLink = page.getByRole('link', { name: 'API Request Context' });
    this.storageStateLink = page.getByRole('link', { name: 'Storage State' });
    this.visualRegressionLink = page.getByRole('link', { name: 'Visual Regression' });
    this.dragAndDropLink = page.getByRole('link', { name: 'Drag & Drop' });
    this.harRecordingLink = page.getByRole('link', { name: 'HAR Recording' });
    this.multiTabLink = page.getByRole('link', { name: 'Multi-Tab' });
    this.serviceWorkersLink = page.getByRole('link', { name: 'Service Workers' });
    this.geolocationAndPermissionsLink = page.getByRole('link', {
      name: 'Geolocation & Permissions',
    });
    this.locatorHandlersLink = page.getByRole('link', { name: 'Locator Handlers' });
    this.mediaAndLocaleEmulationLink = page.getByRole('link', { name: 'Media & Locale Emulation' });
    this.scrollAndLazyLoadingLink = page.getByRole('link', { name: 'Scroll & Lazy Loading' });
    this.accessibilityScanningLink = page.getByRole('link', { name: 'Accessibility Scanning' });
    this.shadowDomAndWebComponentsLink = page.getByRole('link', {
      name: 'Shadow DOM & Web Components',
    });
    this.touchAndMobileGesturesLink = page.getByRole('link', { name: 'Touch & Mobile Gestures' });
    this.initScriptsAndSeedingLink = page.getByRole('link', { name: 'Init Scripts & Seeding' });
    this.serverSentEventsLink = page.getByRole('link', { name: 'Server-Sent Events' });
    this.softAssertionsAndTestStepsLink = page.getByRole('link', {
      name: 'Soft Assertions & Test Steps',
    });
  }
}
