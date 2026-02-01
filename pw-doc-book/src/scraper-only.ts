import { PlaywrightDocScraper } from './scraper.js';
import { defaultConfig } from './config/app-config.js';
import { UrlManager } from './utils/url-manager.js';
import { Logger } from './utils/logger.js';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const config = defaultConfig;
  const outputDir = path.join(__dirname, '..', config.output.outputDir);
  const scrapedDataPath = path.join(outputDir, config.output.scrapedDataFile);

  console.log('🚀 Scraping Playwright Documentation...\n');

  try {
    const logger = new Logger('Scraper');
    const urlManager = new UrlManager(config.scraper.baseUrl, config.scraper.docsPath);
    const scraper = new PlaywrightDocScraper(config.scraper, urlManager, logger);

    const pages = await scraper.scrapeAll(config.scraper.startUrl);
    await scraper.saveToFile(scrapedDataPath);

    const failedPages = scraper.getFailedPages();

    console.log('\n✅ Scraping complete!');
    console.log(`📁 Output: ${scrapedDataPath}`);
    console.log(`📄 Total pages: ${pages.length}`);

    if (failedPages.length > 0) {
      console.log(`⚠️  Failed pages: ${failedPages.length}`);
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
