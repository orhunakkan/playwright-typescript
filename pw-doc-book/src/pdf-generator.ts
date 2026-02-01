import { chromium, Browser } from 'playwright';
import * as fs from 'fs/promises';
import * as path from 'path';
import { PDFConfig } from './config/app-config.js';
import { ContentCleaner } from './utils/content-cleaner.js';
import { LinkProcessor } from './utils/link-processor.js';
import { Logger } from './utils/logger.js';
import { TOCGenerator } from './generators/toc-generator.js';
import { StyleGenerator } from './generators/style-generator.js';
import { DocPage } from './scraper.js';

export class PDFGenerator {
  private browser: Browser | null = null;

  constructor(
    private pdfConfig: PDFConfig,
    private contentCleaner: ContentCleaner,
    private linkProcessor: LinkProcessor,
    private tocGenerator: TOCGenerator,
    private styleGenerator: StyleGenerator,
    private logger: Logger
  ) {}

  async initialize(): Promise<void> {
    this.browser = await chromium.launch({ headless: true });
    this.logger.info('Browser initialized for PDF generation');
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.logger.info('Browser closed');
    }
  }

  private processContent(content: string, pageUrl: string, pageId: string, urlToIdMap: Map<string, string>): string {
    // Clean content
    let processed = this.contentCleaner.clean(content);

    // Process links
    processed = this.linkProcessor.processLinks(processed, urlToIdMap);

    return `
      <div id="${pageId}" class="page-content">
        <div class="page-header">
          <div class="page-url">${pageUrl}</div>
        </div>
        ${processed}
      </div>
      <div class="page-break"></div>
    `;
  }

  async generatePDF(pages: DocPage[], outputPath: string): Promise<void> {
    if (!this.browser) {
      await this.initialize();
    }

    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    const page = await this.browser.newPage();

    try {
      // Sort pages by order
      const sortedPages = [...pages].sort((a, b) => a.order - b.order);

      // Build URL to ID mapping
      const urlToIdMap = this.linkProcessor.buildUrlToIdMap(sortedPages);

      // Generate HTML content
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Playwright Documentation</title>
          ${this.styleGenerator.generateStyles()}
        </head>
        <body>
          ${this.tocGenerator.generate(sortedPages)}
          ${sortedPages.map((docPage, index) => this.processContent(docPage.content, docPage.url, `page-${index}`, urlToIdMap)).join('\n')}
        </body>
        </html>
      `;

      // Save HTML for debugging
      const htmlPath = outputPath.replace('.pdf', '.html');
      await fs.writeFile(htmlPath, htmlContent, 'utf-8');
      this.logger.info(`Generated HTML: ${htmlPath}`);

      // Set content and generate PDF
      await page.setContent(htmlContent, { waitUntil: 'networkidle' });

      // Ensure output directory exists
      await fs.mkdir(path.dirname(outputPath), { recursive: true });

      // Generate PDF with settings optimized for documentation
      await page.pdf({
        path: outputPath,
        format: this.pdfConfig.format,
        printBackground: this.pdfConfig.printBackground,
        margin: {
          top: this.pdfConfig.margins.top,
          right: this.pdfConfig.margins.right,
          bottom: this.pdfConfig.margins.bottom,
          left: this.pdfConfig.margins.left,
        },
        displayHeaderFooter: this.pdfConfig.displayHeaderFooter,
        preferCSSPageSize: this.pdfConfig.preferCSSPageSize,
      });

      this.logger.info(`Generated PDF: ${outputPath}`);
    } finally {
      await page.close();
    }
  }

  async generateFromFile(inputPath: string, outputPath: string): Promise<void> {
    const data = await fs.readFile(inputPath, 'utf-8');
    const pages: DocPage[] = JSON.parse(data);

    await this.initialize();
    await this.generatePDF(pages, outputPath);
    await this.close();
  }
}
