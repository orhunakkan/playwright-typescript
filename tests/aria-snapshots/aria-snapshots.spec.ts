import { test, expect } from '../../fixtures/index';
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

// JIRA: https://orhunakkan.atlassian.net/browse/TAB1-22 — ARIA Snapshots

const LAB_URL = '/practice/aria-snapshots';

const scan = (page: Page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();

test.describe('ARIA Snapshots', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LAB_URL);
  });

  // AC-1 (TAB1-22): a file-based ARIA snapshot baseline of the fully-collapsed accordion is
  // generated on first run (under fixtures/reference-snapshots/) and matched on every run after.
  test.describe('AC-1 — ARIA snapshot baseline of the fully-collapsed accordion', () => {
    test('positive: ARIA snapshot of the fully-collapsed accordion matches (or generates) the baseline', async ({ ariaSnapshotsPage }) => {
      await expect(ariaSnapshotsPage.accordionRoot).toMatchAriaSnapshot();
    });

    test('negative/AC-1a: an inline template with an extra phantom section does not match the collapsed accordion', async ({ ariaSnapshotsPage }) => {
      await expect(ariaSnapshotsPage.accordionRoot).not.toMatchAriaSnapshot(`
        - heading "What is an ARIA snapshot?" [level=3]:
          - button "What is an ARIA snapshot?"
        - heading "When should I use toMatchAriaSnapshot?" [level=3]:
          - button "When should I use toMatchAriaSnapshot?"
        - heading "How is this different from getByRole?" [level=3]:
          - button "How is this different from getByRole?"
        - heading "Phantom Section" [level=3]:
          - button "Phantom Section"
      `);
    });
  });

  // AC-2 (TAB1-22): expanding one accordion section adds a region child node for its content;
  // collapsing removes it again; sibling sections are unaffected.
  test.describe('AC-2 — expanding a section updates the ARIA tree', () => {
    test('positive: expanding one section adds a region child for its content', async ({ ariaSnapshotsPage }) => {
      await ariaSnapshotsPage.accordionButton('What is an ARIA snapshot?').click();

      await expect(ariaSnapshotsPage.accordionRoot).toMatchAriaSnapshot(`
        - heading "What is an ARIA snapshot?" [level=3]:
          - button "What is an ARIA snapshot?" [expanded]
        - region "What is an ARIA snapshot?": An ARIA snapshot is a YAML representation of the full accessibility tree of a page or element. It captures roles, names, properties, and hierarchy — the information assistive technologies use to describe a UI to users.
        - heading "When should I use toMatchAriaSnapshot?" [level=3]:
          - button "When should I use toMatchAriaSnapshot?"
        - heading "How is this different from getByRole?" [level=3]:
          - button "How is this different from getByRole?"
      `);
    });

    test('negative/AC-2a: re-collapsing the section removes the region child node again', async ({ ariaSnapshotsPage }) => {
      await ariaSnapshotsPage.accordionButton('What is an ARIA snapshot?').click();
      await ariaSnapshotsPage.accordionButton('What is an ARIA snapshot?').click();

      await expect(ariaSnapshotsPage.accordionRoot).not.toMatchAriaSnapshot(`
        - heading "What is an ARIA snapshot?" [level=3]:
          - button "What is an ARIA snapshot?" [expanded]
        - region "What is an ARIA snapshot?": An ARIA snapshot is a YAML representation of the full accessibility tree of a page or element. It captures roles, names, properties, and hierarchy — the information assistive technologies use to describe a UI to users.
        - heading "When should I use toMatchAriaSnapshot?" [level=3]:
          - button "When should I use toMatchAriaSnapshot?"
        - heading "How is this different from getByRole?" [level=3]:
          - button "How is this different from getByRole?"
      `);
    });

    test('boundary/AC-2b: only the target section gains a child; sibling sections remain collapsed', async ({ ariaSnapshotsPage }) => {
      await ariaSnapshotsPage.accordionButton('What is an ARIA snapshot?').click();

      await expect(ariaSnapshotsPage.accordionButton('When should I use toMatchAriaSnapshot?')).toHaveAttribute('aria-expanded', 'false');
      await expect(ariaSnapshotsPage.accordionButton('How is this different from getByRole?')).toHaveAttribute('aria-expanded', 'false');
      await expect(ariaSnapshotsPage.accordionPanel('When should I use toMatchAriaSnapshot?')).toHaveCount(0);
      await expect(ariaSnapshotsPage.accordionPanel('How is this different from getByRole?')).toHaveCount(0);
    });
  });

  // AC-3 (TAB1-22): "/children: equal" enforces a strict child set — the template must list every
  // actual child, no more and no fewer, or the match fails.
  test.describe('AC-3 — /children: equal enforces strict child matching', () => {
    test('positive: /children: equal accepts a template listing exactly the actual child set', async ({ ariaSnapshotsPage }) => {
      await expect(ariaSnapshotsPage.accordionRoot).toMatchAriaSnapshot(`
        - /children: equal
        - heading "What is an ARIA snapshot?" [level=3]:
          - button "What is an ARIA snapshot?"
        - heading "When should I use toMatchAriaSnapshot?" [level=3]:
          - button "When should I use toMatchAriaSnapshot?"
        - heading "How is this different from getByRole?" [level=3]:
          - button "How is this different from getByRole?"
      `);
    });

    test('negative/AC-3a: /children: equal rejects a template with a missing node', async ({ ariaSnapshotsPage }) => {
      await expect(ariaSnapshotsPage.accordionRoot).not.toMatchAriaSnapshot(`
        - /children: equal
        - heading "What is an ARIA snapshot?" [level=3]:
          - button "What is an ARIA snapshot?"
        - heading "When should I use toMatchAriaSnapshot?" [level=3]:
          - button "When should I use toMatchAriaSnapshot?"
      `);
    });

    test('negative/AC-3b: /children: equal rejects a template with an extra node', async ({ ariaSnapshotsPage }) => {
      await expect(ariaSnapshotsPage.accordionRoot).not.toMatchAriaSnapshot(`
        - /children: equal
        - heading "What is an ARIA snapshot?" [level=3]:
          - button "What is an ARIA snapshot?"
        - heading "When should I use toMatchAriaSnapshot?" [level=3]:
          - button "When should I use toMatchAriaSnapshot?"
        - heading "How is this different from getByRole?" [level=3]:
          - button "How is this different from getByRole?"
        - heading "Phantom Section" [level=3]:
          - button "Phantom Section"
      `);
    });
  });

  // AC-4 (TAB1-22): aria-current="step" tracks the active wizard step through Next/Back and a
  // direct step-jump click; no other step button carries the attribute.
  test.describe('AC-4 — aria-current="step" tracks the active wizard step', () => {
    test('positive: aria-current moves to step 2 after Next and back to step 1 after Back', async ({ ariaSnapshotsPage }) => {
      await expect(ariaSnapshotsPage.wizardStepButton('1. Account')).toHaveAttribute('aria-current', 'step');

      await ariaSnapshotsPage.nextButton.click();

      await expect(ariaSnapshotsPage.wizardStepButton('2. Profile')).toHaveAttribute('aria-current', 'step');
      await expect(ariaSnapshotsPage.wizardStepButton('1. Account')).not.toHaveAttribute('aria-current', 'step');

      await ariaSnapshotsPage.backButton.click();

      await expect(ariaSnapshotsPage.wizardStepButton('1. Account')).toHaveAttribute('aria-current', 'step');
      await expect(ariaSnapshotsPage.wizardStepButton('2. Profile')).not.toHaveAttribute('aria-current', 'step');
    });

    test('negative/AC-4a: a non-current step button carries no aria-current attribute', async ({ ariaSnapshotsPage }) => {
      await expect(ariaSnapshotsPage.wizardStepButton('2. Profile')).not.toHaveAttribute('aria-current');
      await expect(ariaSnapshotsPage.wizardStepButton('3. Preferences')).not.toHaveAttribute('aria-current');
      await expect(ariaSnapshotsPage.wizardStepButton('4. Review')).not.toHaveAttribute('aria-current');
    });

    test('boundary/AC-4b: a direct step-jump click sets aria-current on the target step only', async ({ ariaSnapshotsPage }) => {
      await ariaSnapshotsPage.nextButton.click(); // → step 2
      await ariaSnapshotsPage.nextButton.click(); // → step 3
      await ariaSnapshotsPage.nextButton.click(); // → step 4

      await ariaSnapshotsPage.wizardStepButton('1. Account').click(); // direct jump back to step 1

      await expect(ariaSnapshotsPage.wizardStepButton('1. Account')).toHaveAttribute('aria-current', 'step');
      await expect(ariaSnapshotsPage.wizardStepButton('2. Profile')).not.toHaveAttribute('aria-current');
      await expect(ariaSnapshotsPage.wizardStepButton('3. Preferences')).not.toHaveAttribute('aria-current');
      await expect(ariaSnapshotsPage.wizardStepButton('4. Review')).not.toHaveAttribute('aria-current');
    });
  });

  // AC-5 (TAB1-22): a regex partial-match pattern matches the varying part of the snapshot
  // (the active step's accessible name) while the rest of the template stays a strict match.
  test.describe('AC-5 — partial-match regex pattern with strict structural hierarchy', () => {
    test('positive: a regex pattern matches the active step form name while the rest of the structure is strict', async ({ ariaSnapshotsPage }) => {
      await expect(ariaSnapshotsPage.wizardForm).toMatchAriaSnapshot(`
        - form /^(Account|Profile|Preferences|Review) step$/:
          - heading /Step \\d+/ [level=3]
          - text: Email
          - textbox "Email address":
            - /placeholder: you@example.com
          - button "Back" [disabled]
          - button "Next"
      `);
    });

    test('negative/AC-5a: the same template fails to match once the form advances to a different step', async ({ ariaSnapshotsPage }) => {
      await ariaSnapshotsPage.nextButton.click();

      await expect(ariaSnapshotsPage.wizardForm).not.toMatchAriaSnapshot(`
        - form /^(Account|Profile|Preferences|Review) step$/:
          - heading /Step \\d+/ [level=3]
          - text: Email
          - textbox "Email address":
            - /placeholder: you@example.com
          - button "Back" [disabled]
          - button "Next"
      `);
    });
  });

  // AC-6 (TAB1-22): before/after snapshots of the live announcement region show its content
  // changing predictably when an accordion section is toggled.
  test.describe('AC-6 — live announcement region content changes on accordion toggle', () => {
    test('positive: before/after ARIA snapshots of the live region reflect the accordion toggle', async ({ ariaSnapshotsPage }) => {
      await expect(ariaSnapshotsPage.liveRegionSection).toMatchAriaSnapshot(`
        - region "Challenge 3 — Live region":
          - heading "Challenge 3 — Live region" [level=2]
          - paragraph: The announcement region updates when accordion sections are toggled. Capture a snapshot that includes the live region and verify its content changes predictably.
          - text: No announcement yet
      `);

      await ariaSnapshotsPage.accordionButton('How is this different from getByRole?').click();

      await expect(ariaSnapshotsPage.liveRegionSection).toMatchAriaSnapshot(`
        - region "Challenge 3 — Live region":
          - heading "Challenge 3 — Live region" [level=2]
          - paragraph: The announcement region updates when accordion sections are toggled. Capture a snapshot that includes the live region and verify its content changes predictably.
          - text: How is this different from getByRole? expanded
      `);
    });

    test('negative/AC-6a: the live announcement region content is unchanged with no toggle action performed', async ({ ariaSnapshotsPage }) => {
      const before = await ariaSnapshotsPage.liveAnnouncement.textContent();
      const after = await ariaSnapshotsPage.liveAnnouncement.textContent();

      expect(after).toBe(before);
    });
  });

  test.describe('accessibility (WCAG 2.x, axe)', () => {
    test('no violations at initial load', async ({ page }) => {
      expect((await scan(page)).violations).toEqual([]);
    });

    test('no violations with an accordion section expanded', async ({ page, ariaSnapshotsPage }) => {
      await ariaSnapshotsPage.accordionButton('What is an ARIA snapshot?').click();

      expect((await scan(page)).violations).toEqual([]);
    });

    test('no violations after navigating the wizard to a later step', async ({ page, ariaSnapshotsPage }) => {
      await ariaSnapshotsPage.nextButton.click();
      // The step buttons run a 150ms CSS color transition on click; scanning immediately can
      // sample an in-flight blended color and report a false contrast violation. Wait for the
      // new current-step button's background to settle before scanning.
      const currentStep = ariaSnapshotsPage.wizardNav.locator('button[aria-current="step"]');
      await expect(async () => {
        const before = await currentStep.evaluate((el) => getComputedStyle(el).backgroundColor);
        await new Promise((r) => setTimeout(r, 50));
        const after = await currentStep.evaluate((el) => getComputedStyle(el).backgroundColor);
        expect(after).toBe(before);
      }).toPass({ timeout: 2000 });

      expect((await scan(page)).violations).toEqual([]);
    });
  });
});

// Performance — initial load must complete within budget
test.describe('performance @performance', () => {
  test('initial page load completes within budget', async ({ page, ariaSnapshotsPage }) => {
    const start = Date.now();

    await page.goto(LAB_URL);
    await expect(ariaSnapshotsPage.pageHeading).toBeVisible();

    expect(Date.now() - start).toBeLessThan(5000);
  });
});
