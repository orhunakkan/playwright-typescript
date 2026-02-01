import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs/promises';
import * as path from 'path';
import { ScraperConfig } from './config/app-config.js';
import { UrlManager } from './utils/url-manager.js';
import { Logger } from './utils/logger.js';
import { retryAsync } from './utils/retry.js';

export interface DocPage {
  url: string;
  title: string;
  content: string;
  order: number;
}

export class PlaywrightDocScraper {
  private browser: Browser | null = null;
  private visitedUrls: Set<string> = new Set();
  private pages: DocPage[] = [];
  private failedPages: Array<{ url: string; error: string }> = [];

  constructor(
    private config: ScraperConfig,
    private urlManager: UrlManager,
    private logger: Logger
  ) {}

  async initialize(): Promise<void> {
    this.browser = await chromium.launch({ headless: this.config.headless });
    this.logger.info('Browser initialized');
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.logger.info('Browser closed');
    }
  }

  async scrapePage(url: string, order: number): Promise<void> {
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    const normalizedUrl = this.urlManager.normalizeUrl(url);

    if (this.visitedUrls.has(normalizedUrl)) {
      return;
    }

    this.logger.info(`Scraping: ${normalizedUrl}`);
    this.visitedUrls.add(normalizedUrl);

    const page = await this.browser.newPage();

    try {
      await retryAsync(
        async () => {
          await page.goto(normalizedUrl, {
            waitUntil: 'networkidle',
            timeout: this.config.timeout,
          });
          await page.waitForSelector('article', { timeout: this.config.timeout });
        },
        {
          maxRetries: this.config.maxRetries,
          retryDelay: this.config.retryDelay,
          logger: this.logger,
        },
        `Scraping ${normalizedUrl}`
      );

      // Get page title
      const title = await page.title();

      // Get the main content
      const content = await page.evaluate(() => {
        const article = document.querySelector('article');
        if (!article) return '';
        const clone = article.cloneNode(true) as HTMLElement;
        return clone.outerHTML;
      });

      // Store page data
      this.pages.push({
        url: normalizedUrl,
        title,
        content,
        order,
      });

      // Find all documentation links
      const links = await page.evaluate((docsPath) => {
        const anchors = Array.from(document.querySelectorAll('a[href]'));
        return anchors.map((a) => (a as HTMLAnchorElement).href).filter((href) => href.includes(docsPath));
      }, this.config.docsPath);

      // Recursively scrape linked pages
      const uniqueLinks = [...new Set(links)];
      for (let i = 0; i < uniqueLinks.length; i++) {
        const link = uniqueLinks[i];
        if (this.urlManager.isValidDocUrl(link)) {
          try {
            await this.scrapePage(link, this.pages.length);
          } catch (error) {
            this.logger.error(`Failed to scrape linked page: ${link}`, error);
            this.failedPages.push({
              url: link,
              error: (error as Error).message,
            });
          }
        }
      }
    } catch (error) {
      this.logger.error(`Error scraping ${normalizedUrl}`, error);
      this.failedPages.push({
        url: normalizedUrl,
        error: (error as Error).message,
      });
      throw error;
    } finally {
      await page.close();
    }
  }

  async scrapeAll(startUrl: string): Promise<DocPage[]> {
    await this.initialize();

    try {
      await this.scrapePage(startUrl, 0);
      this.logger.info(`Scraped ${this.pages.length} pages successfully`);

      if (this.failedPages.length > 0) {
        this.logger.warn(`Failed to scrape ${this.failedPages.length} pages`, this.failedPages);
      }

      return this.pages;
    } finally {
      await this.close();
    }
  }

  async saveToFile(outputPath: string): Promise<void> {
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(this.pages, null, 2), 'utf-8');
    this.logger.info(`Saved scraped data to ${outputPath}`);
  }

  getPages(): DocPage[] {
    return this.pages;
  }

  getFailedPages(): Array<{ url: string; error: string }> {
    return this.failedPages;
  }
}
