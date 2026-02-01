import { PlaywrightDocScraper } from './scraper.js';
import { PDFGenerator } from './pdf-generator.js';
import { defaultConfig } from './config/app-config.js';
import { UrlManager } from './utils/url-manager.js';
import { Logger } from './utils/logger.js';
import { ContentCleaner } from './utils/content-cleaner.js';
import { LinkProcessor } from './utils/link-processor.js';
import { TitleCleaner } from './utils/title-cleaner.js';
import { TOCGenerator } from './generators/toc-generator.js';
import { StyleGenerator } from './generators/style-generator.js';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const config = defaultConfig;
  const outputDir = path.join(__dirname, '..', config.output.outputDir);
  const scrapedDataPath = path.join(outputDir, config.output.scrapedDataFile);
  const pdfOutputPath = path.join(outputDir, config.output.pdfFile);

  console.log('🚀 Starting Playwright Documentation to PDF conversion...\n');

  try {
    // Step 1: Scrape all documentation pages
    console.log('📄 Step 1: Scraping documentation pages...');

    const scraperLogger = new Logger('Scraper');
    const urlManager = new UrlManager(config.scraper.baseUrl, config.scraper.docsPath);
    const scraper = new PlaywrightDocScraper(config.scraper, urlManager, scraperLogger);

    const pages = await scraper.scrapeAll(config.scraper.startUrl);
    await scraper.saveToFile(scrapedDataPath);

    const failedPages = scraper.getFailedPages();
    console.log(`✅ Scraped ${pages.length} pages\n`);
    if (failedPages.length > 0) {
      console.log(`⚠️  Warning: ${failedPages.length} pages failed to scrape\n`);
    }

    // Step 2: Generate PDF
    console.log('📚 Step 2: Generating PDF...');

    const pdfLogger = new Logger('PDFGenerator');
    const contentCleaner = new ContentCleaner();
    const linkProcessor = new LinkProcessor(urlManager);
    const titleCleaner = new TitleCleaner();
    const tocGenerator = new TOCGenerator(config.style, titleCleaner);
    const styleGenerator = new StyleGenerator(config.style, config.pdf);

    const pdfGenerator = new PDFGenerator(config.pdf, contentCleaner, linkProcessor, tocGenerator, styleGenerator, pdfLogger);

    await pdfGenerator.generatePDF(pages, pdfOutputPath);
    console.log('✅ PDF generation complete\n');

    console.log('🎉 Success!');
    console.log(`📁 Scraped data: ${scrapedDataPath}`);
    console.log(`📖 PDF output: ${pdfOutputPath}`);
    console.log(`🌐 HTML preview: ${pdfOutputPath.replace('.pdf', '.html')}`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
