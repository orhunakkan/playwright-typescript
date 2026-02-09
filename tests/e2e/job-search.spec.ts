import { test } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const authFile = path.join(process.cwd(), 'fixtures', 'linkedin-auth.json');

test.describe('LinkedIn Job Search', () => {
  test.use({
    storageState: authFile,
    viewport: { width: 1920, height: 1080 },
  });

  test('Search for QA Engineer jobs with filters', async ({ page }, testInfo) => {
    // Only run on Desktop Chrome project
    if (testInfo.project.name !== 'Desktop Chrome') {
      test.skip();
    }

    test.setTimeout(300000); // 5 minutes timeout for multiple searches

    // Check if auth file exists
    if (!fs.existsSync(authFile)) {
      throw new Error('Authentication file not found! Please run: npm run linkedin:auth');
    }

    // Job titles to search for
    const jobTitles = ['QA Engineer', 'Test Automation Engineer', 'SDET', 'Quality Engineer', 'Software Test Engineer'];

    // Set to track unique job URLs (automatically handles duplicates)
    const uniqueJobUrls = new Set<string>();

    // Search for each job title
    for (const jobTitle of jobTitles) {
      console.log(`\n\n========================================`);
      console.log(`🔍 Searching for: ${jobTitle}`);
      console.log(`========================================\n`);

      // Navigate to LinkedIn - you should already be logged in!
      await page.goto('https://www.linkedin.com/jobs/');

      console.log('Logged in successfully with saved state!');

      const secondSearchBox = page.getByRole('textbox', { name: 'Title, skill or Company' });
      await secondSearchBox.click();
      await secondSearchBox.fill(jobTitle);
      await page.waitForTimeout(3000);
      await secondSearchBox.press('Enter');

      // Wait for iframe to load
      await page.waitForTimeout(2000);

      // Apply filters inside iframe
      await page
        .frameLocator('iframe[data-testid="interop-iframe"]')
        .getByRole('button', {
          name: 'Show all filters. Clicking this button displays all available filter options.',
        })
        .click();
      await page.frameLocator('iframe[data-testid="interop-iframe"]').locator('span').filter({ hasText: 'Past 24 hours' }).first().click();
      await page.frameLocator('iframe[data-testid="interop-iframe"]').locator('span').filter({ hasText: 'Mid-Senior level' }).first().click();
      await page.frameLocator('iframe[data-testid="interop-iframe"]').locator('span').filter({ hasText: 'Full-time' }).first().click();
      await page.frameLocator('iframe[data-testid="interop-iframe"]').getByText('Contract', { exact: true }).click();
      await page.frameLocator('iframe[data-testid="interop-iframe"]').locator('span').filter({ hasText: 'Remote' }).first().click();
      await page.locator('//iframe[@data-testid="interop-iframe"]').click();

      await page.waitForTimeout(2000);

      const iframe = page.frameLocator('iframe[data-testid="interop-iframe"]');

      // Process all pages dynamically
      let pageNumber = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        console.log(`\n=== Processing Page ${pageNumber} ===`);
        console.log('Scrolling to load all job listings...');

        // Scroll down until no new jobs are loading
        let previousJobCount = 0;
        let unchangedCount = 0;
        for (let i = 0; i < 20; i++) {
          // Get all job cards
          const jobCards = await iframe.locator('.job-card-container').all();
          const currentJobCount = jobCards.length;

          console.log(`Scroll ${i + 1}: Found ${currentJobCount} jobs`);

          // Check if job count hasn't changed
          if (currentJobCount === previousJobCount && currentJobCount > 0) {
            unchangedCount++;
            console.log(`Job count unchanged (${unchangedCount}/3)`);

            // If job count hasn't changed for 3 consecutive iterations, stop
            if (unchangedCount >= 3) {
              console.log('No new jobs loading, stopping scroll');
              break;
            }
          } else {
            unchangedCount = 0;
          }

          previousJobCount = currentJobCount;

          if (jobCards.length > 0) {
            // Scroll by evaluating on the last job card to scroll its parent container
            await jobCards[jobCards.length - 1].evaluate((el) => {
              // Find the scrollable parent and scroll down
              let parent = el.parentElement;
              while (parent) {
                if (parent.scrollHeight > parent.clientHeight) {
                  parent.scrollTop = parent.scrollTop + 800;
                  break;
                }
                parent = parent.parentElement;
              }
            });
            await page.waitForTimeout(1000);
          } else {
            console.log('No job cards found yet, waiting...');
            await page.waitForTimeout(1000);
          }
        }

        // Extract job links from current page
        console.log(`\n=== Extracting jobs from Page ${pageNumber} ===`);
        const jobLinks = await iframe.locator('a.job-card-container__link').all();
        console.log(`Found ${jobLinks.length} job listings on Page ${pageNumber}`);

        for (const jobLink of jobLinks) {
          const href = await jobLink.getAttribute('href');
          if (href) {
            // Extract only the job ID from the URL
            const match = href.match(/\/jobs\/view\/(\d+)\//);
            if (match) {
              const jobId = match[1];
              const jobUrl = `https://www.linkedin.com/jobs/view/${jobId}/`;
              const previousSize = uniqueJobUrls.size;
              uniqueJobUrls.add(jobUrl);
              if (uniqueJobUrls.size > previousSize) {
                console.log(`✅ NEW: ${jobUrl}`);
              } else {
                console.log(`⏭️  DUPLICATE: ${jobUrl}`);
              }
            }
          }
        }

        // Check if there's a next page
        pageNumber++;
        const nextPageButton = iframe.getByRole('button', { name: `Page ${pageNumber}` });
        const nextButtonExists = await nextPageButton.isVisible().catch(() => false);

        if (nextButtonExists) {
          console.log(`\n=== Clicking Page ${pageNumber} ===`);
          await nextPageButton.click();
          await page.waitForTimeout(3000);
        } else {
          console.log('\nNo more pages found. All jobs extracted!');
          hasMorePages = false;
        }
      }

      console.log(`\n✅ Completed search for: ${jobTitle}`);
      console.log(`Total unique jobs so far: ${uniqueJobUrls.size}`);
    }

    // Convert Set to Array for HTML generation
    const allJobUrls = Array.from(uniqueJobUrls);

    console.log(`\n\n========================================`);
    console.log(`📊 FINAL RESULTS`);
    console.log(`========================================`);
    console.log(`Total unique job listings found: ${allJobUrls.length}`);
    console.log(`Searched titles: ${jobTitles.join(', ')}`);

    // Write all URLs to HTML file
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>LinkedIn QA Jobs - Multiple Titles</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
        }
        h1 { color: #0a66c2; }
        .searched-titles {
            background: #f3f6f8;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .searched-titles h3 {
            margin-top: 0;
            color: #666;
            font-size: 14px;
        }
        .searched-titles ul {
            margin: 5px 0;
            padding-left: 20px;
        }
        .searched-titles li {
            color: #666;
            font-size: 14px;
            margin: 3px 0;
        }
        button {
            background-color: #0a66c2;
            color: white;
            border: none;
            padding: 12px 24px;
            font-size: 16px;
            cursor: pointer;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        button:hover { background-color: #004182; }
        ul#jobList { list-style: none; padding: 0; }
        ul#jobList li { margin: 8px 0; }
        a {
            color: #0a66c2;
            text-decoration: none;
        }
        a:hover { text-decoration: underline; }
        .count { 
            color: #666; 
            margin: 10px 0;
            font-size: 18px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <h1>LinkedIn QA/Test Engineer Jobs</h1>
    <div class="searched-titles">
        <h3>SEARCHED JOB TITLES:</h3>
        <ul>
            ${jobTitles.map((title) => `<li>${title}</li>`).join('\n            ')}
        </ul>
    </div>
    <p class="count">Total unique jobs found: ${allJobUrls.length}</p>
    <button onclick="openAll()">Open All ${allJobUrls.length} Jobs</button>
    <ul id="jobList"></ul>
    <script>
        const urls = ${JSON.stringify(allJobUrls, null, 2)};
        
        function openAll() {
            urls.forEach(url => window.open(url, '_blank'));
        }
        
        // Display URLs as clickable links
        const jobList = document.getElementById('jobList');
        urls.forEach((url, index) => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = url;
            a.target = '_blank';
            a.textContent = 'Job ' + (index + 1) + ': ' + url;
            li.appendChild(a);
            jobList.appendChild(li);
        });
    </script>
</body>
</html>`;

    const htmlFile = path.join(process.cwd(), 'job-urls.html');
    fs.writeFileSync(htmlFile, htmlContent);
    console.log(`\n✅ Saved ${allJobUrls.length} unique job URLs to job-urls.html`);
    console.log('Open this file in your browser and click "Open All Jobs" button');
  });
});
