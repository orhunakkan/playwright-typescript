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

  console.log('🚀 Generating PDF from scraped data...\n');

  try {
    const logger = new Logger('PDFGenerator');
    const urlManager = new UrlManager(config.scraper.baseUrl, config.scraper.docsPath);
    const contentCleaner = new ContentCleaner();
    const linkProcessor = new LinkProcessor(urlManager);
    const titleCleaner = new TitleCleaner();
    const tocGenerator = new TOCGenerator(config.style, titleCleaner);
    const styleGenerator = new StyleGenerator(config.style, config.pdf);

    const pdfGenerator = new PDFGenerator(config.pdf, contentCleaner, linkProcessor, tocGenerator, styleGenerator, logger);

    await pdfGenerator.generateFromFile(scrapedDataPath, pdfOutputPath);

    console.log('\n✅ PDF generation complete!');
    console.log(`📖 PDF: ${pdfOutputPath}`);
    console.log(`🌐 HTML: ${pdfOutputPath.replace('.pdf', '.html')}`);
  } catch (error) {
    console.error('❌ Error:', error);
    if (error instanceof Error && error.message.includes('ENOENT')) {
      console.error('\n💡 Tip: Run scraper first with: npm run doc-scrape');
    }
    process.exit(1);
  }
}

main();
