import { chromium } from '@playwright/test';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function saveLinkedInAuth() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to LinkedIn login
  await page.goto('https://www.linkedin.com/login');

  // Wait for user to manually log in
  console.log('Please log in manually in the browser window...');
  console.log('Waiting for navigation to LinkedIn feed/home page...');

  // Wait for successful login (adjust URL pattern as needed)
  await page.waitForURL('**/feed/**', { timeout: 300000 }); // 5 min timeout

  console.log('Login successful! Saving authentication state...');

  // Save the authentication state
  const authFile = path.join(__dirname, '..', 'fixtures', 'linkedin-auth.json');
  await context.storageState({ path: authFile });

  console.log(`Authentication state saved to: ${authFile}`);
  console.log('You can now close the browser.');

  await browser.close();
}

saveLinkedInAuth().catch(console.error);
