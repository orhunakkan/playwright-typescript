import { type Config, type Scenario, type VUContext, type VUEvents, type PlaywrightEngineTestParam } from 'artillery';
import { type Page } from 'playwright';

const E2E_URL = process.env.PRACTICE_E2E_URL!;

export const config: Config = {
  target: E2E_URL,
  engines: {
    playwright: {
      extendedMetrics: true,
      aggregateByName: true,
    },
  },
  phases: [
    { name: 'warm-up', duration: 20, arrivalRate: 1 },
    { name: 'ramp-up', duration: 40, arrivalRate: 1, rampTo: 3 },
    { name: 'sustained', duration: 60, arrivalRate: 3 },
  ],
};

export const scenarios: Scenario[] = [
  {
    name: 'Home Page Load',
    engine: 'playwright',
    testFunction: homePageFlow,
  },
  {
    name: 'Web Form Submission',
    engine: 'playwright',
    testFunction: webFormFlow,
  },
];

async function homePageFlow(page: Page, _vuContext: VUContext, _events: VUEvents, { step }: PlaywrightEngineTestParam): Promise<void> {
  await step('navigate_home', async () => {
    await page.goto(E2E_URL);
  });

  await step('verify_heading', async () => {
    await page.getByRole('heading').first().waitFor();
  });
}

async function webFormFlow(page: Page, _vuContext: VUContext, _events: VUEvents, { step }: PlaywrightEngineTestParam): Promise<void> {
  await step('navigate_form', async () => {
    await page.goto(`${E2E_URL}/web-form.html`);
  });

  await step('fill_and_submit', async () => {
    await page.getByLabel('Text Input').fill('Artillery load test');
    await page.getByRole('button', { name: 'Submit' }).click();
  });

  await step('verify_submitted', async () => {
    await page.getByText('Received!').waitFor();
  });
}
