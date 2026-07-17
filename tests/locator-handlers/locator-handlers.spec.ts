import { test, expect } from '../../fixtures/index';
import { scanWcag } from '../../utilities/accessibility';

// JIRA: https://orhunakkan.atlassian.net/browse/TAB1-36 — Locator Handlers

const URL = '/practice/locator-handlers';

test.describe('Locator Handlers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  // AC-1 (TAB1-36): Tests register page.addLocatorHandler() for the cookie-consent banner
  // (role="dialog") before navigating and confirm it auto-dismisses without manual intervention.
  test.describe('AC-1 — cookie-consent handler auto-dismisses without manual intervention', () => {
    test('positive: handler registered before navigation dismisses the Cookie Consent dialog automatically', async ({
      page,
      locatorHandlersPage,
    }) => {
      let handlerFired = false;
      await page.addLocatorHandler(locatorHandlersPage.cookieConsentDialog, async () => {
        handlerFired = true;
        await locatorHandlersPage.cookieConsentAcceptButton.click();
      });

      await page.goto(URL);
      await locatorHandlersPage.forceOverlaysCheckbox.check();

      // Drive the full checkout flow — the Cookie Consent dialog surfaces at the final
      // (Payment → Confirmation) transition. Other overlay types are not handled by this
      // handler, matching AC-1's scope to the cookie-consent banner specifically.
      await locatorHandlersPage.nextButton.click();
      await expect(locatorHandlersPage.newsletterDialog).toBeVisible();
      await locatorHandlersPage.newsletterDismissButton.click();

      await locatorHandlersPage.nextButton.click();
      await expect(locatorHandlersPage.sessionSurveyDialog).toBeVisible();
      await locatorHandlersPage.sessionSurveyDismissButton.click();

      await locatorHandlersPage.placeOrderButton.click();
      await expect(locatorHandlersPage.orderConfirmedStatus).toBeVisible();

      expect(handlerFired).toBe(true);
      await expect(locatorHandlersPage.cookieConsentDialog).not.toBeVisible();
    });

    test('negative: with no handler registered, the Cookie Consent dialog remains visible and blocks interaction underneath it', async ({
      page,
      locatorHandlersPage,
    }) => {
      await locatorHandlersPage.forceOverlaysCheckbox.check();

      await locatorHandlersPage.nextButton.click();
      await locatorHandlersPage.newsletterDismissButton.click();
      await locatorHandlersPage.nextButton.click();
      await locatorHandlersPage.sessionSurveyDismissButton.click();
      await locatorHandlersPage.placeOrderButton.click();

      await expect(locatorHandlersPage.cookieConsentDialog).toBeVisible();
      // With no handler, nothing ever dismisses it — it must still be visible after a beat,
      // proving it isn't a timed auto-dismiss toast the app clears on its own.
      await page.waitForTimeout(1000);
      await expect(locatorHandlersPage.cookieConsentDialog).toBeVisible();
    });
  });

  // AC-2 (TAB1-36): Tests enable "Force overlays every step", complete all three checkout
  // steps (Cart → Shipping → Payment → Confirmation), and assert each step advances
  // successfully despite overlays appearing on every Next click.
  test.describe('AC-2 — checkout completes across all steps with overlays forced on every click', () => {
    test('positive: registering handlers for both overlay roles lets all three steps advance without manual dismissal', async ({
      page,
      locatorHandlersPage,
    }) => {
      let dialogDismissals = 0;
      let alertDialogDismissals = 0;

      await page.addLocatorHandler(locatorHandlersPage.anyDialog, async (locator) => {
        dialogDismissals++;
        await locator.getByRole('button').click();
      });
      await page.addLocatorHandler(locatorHandlersPage.anyAlertDialog, async (locator) => {
        alertDialogDismissals++;
        await locator.getByRole('button').click();
      });

      await page.goto(URL);
      await locatorHandlersPage.forceOverlaysCheckbox.check();

      await expect(locatorHandlersPage.stepIndicator).toHaveText(/Step 1 of 3:\s*Cart/);
      await locatorHandlersPage.nextButton.click();
      await expect(locatorHandlersPage.stepIndicator).toHaveText(/Step 2 of 3:\s*Shipping/);

      await locatorHandlersPage.nextButton.click();
      await expect(locatorHandlersPage.stepIndicator).toHaveText(/Step 3 of 3:\s*Payment/);

      await locatorHandlersPage.placeOrderButton.click();
      await expect(locatorHandlersPage.orderConfirmedStatus).toBeVisible();

      // Two role="dialog" overlays (newsletter + cookie-consent) and one role="alertdialog"
      // overlay (session survey) occur across the three transitions.
      expect(dialogDismissals).toBeGreaterThanOrEqual(1);
      expect(alertDialogDismissals).toBeGreaterThanOrEqual(1);
    });

    test('negative: with "Force overlays every step" on and no handlers registered, a step fails to advance', async ({
      page,
      locatorHandlersPage,
    }) => {
      await locatorHandlersPage.forceOverlaysCheckbox.check();
      await locatorHandlersPage.nextButton.click();

      // The newsletter overlay now blocks the underlying Next button — the click below must
      // fail actionability because the modal backdrop intercepts pointer events.
      await expect(locatorHandlersPage.nextButton.click({ timeout: 2000 })).rejects.toThrow();
      await expect(locatorHandlersPage.stepIndicator).toHaveText(/Step 2 of 3:\s*Shipping/);
    });
  });

  // AC-3 (TAB1-36): Tests call page.removeLocatorHandler(locator) after step 2 and assert
  // the overlay blocks step 3 without a registered handler.
  test.describe('AC-3 — removeLocatorHandler() re-exposes blocking once a handler is removed', () => {
    test('positive: handler active through step 2, then removed, leaves step 3 blocked by the overlay', async ({ page, locatorHandlersPage }) => {
      await page.addLocatorHandler(locatorHandlersPage.anyDialog, (locator) => locatorHandlersPage.dismissOverlay(locator));
      await page.addLocatorHandler(locatorHandlersPage.anyAlertDialog, (locator) => locatorHandlersPage.dismissOverlay(locator));

      await page.goto(URL);
      await locatorHandlersPage.forceOverlaysCheckbox.check();

      // Step 1 → 2: handler active, dismisses the newsletter dialog automatically.
      await locatorHandlersPage.nextButton.click();
      await expect(locatorHandlersPage.stepIndicator).toHaveText(/Step 2 of 3:\s*Shipping/);

      // Remove both handlers after step 2, per AC-3.
      await page.removeLocatorHandler(locatorHandlersPage.anyDialog);
      await page.removeLocatorHandler(locatorHandlersPage.anyAlertDialog);

      // Step 2 → 3: the click itself still succeeds (no overlay was open at click-time) and
      // lands on step 3, but the session-survey overlay it reveals is now unhandled — with no
      // handler active, it blocks all further progress out of step 3.
      await locatorHandlersPage.nextButton.click();
      await expect(locatorHandlersPage.stepIndicator).toHaveText(/Step 3 of 3:\s*Payment/);
      await expect(locatorHandlersPage.sessionSurveyDialog).toBeVisible();

      await expect(locatorHandlersPage.placeOrderButton.click({ timeout: 2000 })).rejects.toThrow();
      await expect(locatorHandlersPage.stepIndicator).toHaveText(/Step 3 of 3:\s*Payment/);
    });
  });

  // AC-4 (TAB1-36): Tests register a handler with { times: 1 } and verify it fires exactly
  // once, leaving subsequent overlay occurrences unhandled.
  test.describe('AC-4 — { times: 1 } fires exactly once', () => {
    test('boundary: dismissal count is exactly 1 across repeated overlay occurrences, not 0 and not more than 1', async ({
      page,
      locatorHandlersPage,
    }) => {
      let fireCount = 0;
      await page.addLocatorHandler(
        locatorHandlersPage.anyDialog,
        async (locator) => {
          fireCount++;
          await locator.getByRole('button').click();
        },
        { times: 1 },
      );

      await page.goto(URL);
      await locatorHandlersPage.forceOverlaysCheckbox.check();

      // Step 1 → 2: the newsletter dialog (role="dialog") is the handler's single allotted fire.
      await locatorHandlersPage.nextButton.click();
      await expect(locatorHandlersPage.stepIndicator).toHaveText(/Step 2 of 3:\s*Shipping/);
      expect(fireCount).toBe(1);

      // Step 2 → 3: click succeeds (nothing was open at click-time); the resulting session-survey
      // alertdialog is a different role and was never in scope for this handler regardless.
      await locatorHandlersPage.nextButton.click();
      await expect(locatorHandlersPage.stepIndicator).toHaveText(/Step 3 of 3:\s*Payment/);
      await expect(locatorHandlersPage.sessionSurveyDialog).toBeVisible();
      expect(fireCount).toBe(1);

      // Dismiss the survey manually so the next click isn't blocked by it specifically —
      // isolating the assertion to whether the {times: 1} handler still fires for step 3 → 4.
      await locatorHandlersPage.sessionSurveyDismissButton.click();

      // Step 3 → 4: click succeeds and reveals the cookie-consent dialog (also role="dialog"),
      // but the handler has already exhausted its single fire — it must NOT fire again.
      await locatorHandlersPage.placeOrderButton.click();
      await expect(locatorHandlersPage.cookieConsentDialog).toBeVisible();
      expect(fireCount).toBe(1);
    });
  });

  // AC-5 (TAB1-36): Tests distinguish the role="dialog" cookie banner locator from the
  // role="alertdialog" session survey when writing handler targets.
  test.describe('AC-5 — role="dialog" vs role="alertdialog" targeting precision', () => {
    test('positive: a handler scoped to role="dialog" only ever receives dialog-role overlays', async ({ page, locatorHandlersPage }) => {
      const seenRoles = new Set<string>();
      await page.addLocatorHandler(locatorHandlersPage.anyDialog, async (locator) => {
        seenRoles.add((await locator.getAttribute('role')) ?? '');
        await locator.getByRole('button').click();
      });

      await page.goto(URL);
      await locatorHandlersPage.forceOverlaysCheckbox.check();
      await locatorHandlersPage.nextButton.click();
      await expect(locatorHandlersPage.stepIndicator).toHaveText(/Step 2 of 3:\s*Shipping/);

      expect([...seenRoles]).toEqual(['dialog']);
    });

    test('negative: a handler scoped to role="dialog" does not fire for the role="alertdialog" session survey', async ({
      page,
      locatorHandlersPage,
    }) => {
      let dialogHandlerFireCount = 0;
      await page.addLocatorHandler(locatorHandlersPage.anyDialog, async (locator) => {
        dialogHandlerFireCount++;
        await locator.getByRole('button').click();
      });

      await page.goto(URL);
      await locatorHandlersPage.forceOverlaysCheckbox.check();

      // Step 1 → 2: newsletter dialog is auto-dismissed by the role="dialog" handler.
      await locatorHandlersPage.nextButton.click();
      await expect(locatorHandlersPage.stepIndicator).toHaveText(/Step 2 of 3:\s*Shipping/);
      expect(dialogHandlerFireCount).toBe(1);

      // Step 2 → 3: click succeeds (nothing was open at click-time) and reveals the
      // session-survey alertdialog, which the role="dialog"-only handler does not match.
      await locatorHandlersPage.nextButton.click();
      await expect(locatorHandlersPage.stepIndicator).toHaveText(/Step 3 of 3:\s*Payment/);
      await expect(locatorHandlersPage.sessionSurveyDialog).toBeVisible();
      expect(dialogHandlerFireCount).toBe(1);

      // Left unhandled, the survey now blocks all further progress out of step 3.
      await expect(locatorHandlersPage.placeOrderButton.click({ timeout: 2000 })).rejects.toThrow();
      expect(dialogHandlerFireCount).toBe(1);
    });
  });

  // Accessibility — scan load + overlay-visible + post-dismiss states (Phase 5).
  test.describe('accessibility (WCAG 2.x, axe)', () => {
    test('no violations on initial page load', async ({ page }) => {
      expect((await scanWcag(page)).violations).toEqual([]);
    });

    test('no violations while an overlay dialog is visible', async ({ page, locatorHandlersPage }) => {
      await locatorHandlersPage.forceOverlaysCheckbox.check();
      await locatorHandlersPage.nextButton.click();
      await expect(locatorHandlersPage.newsletterDialog).toBeVisible();

      expect((await scanWcag(page)).violations).toEqual([]);
    });

    test('no violations after dismissing an overlay and advancing to the next step', async ({ page, locatorHandlersPage }) => {
      await locatorHandlersPage.forceOverlaysCheckbox.check();
      await locatorHandlersPage.nextButton.click();
      await locatorHandlersPage.newsletterDismissButton.click();
      await expect(locatorHandlersPage.stepIndicator).toHaveText(/Step 2 of 3:\s*Shipping/);

      expect((await scanWcag(page)).violations).toEqual([]);
    });
  });
});

// Performance — navigates independently so timing reflects cold initial load, not post-beforeEach warm load
test.describe('performance @performance', () => {
  test('initial locator-handlers page load is within budget', async ({ page }) => {
    await page.goto(URL);
    const timing = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return { domContentLoaded: nav.domContentLoadedEventEnd, load: nav.loadEventEnd };
    });
    expect(timing.domContentLoaded).toBeLessThan(6000);
    expect(timing.load).toBeLessThan(12000);
  });
});
