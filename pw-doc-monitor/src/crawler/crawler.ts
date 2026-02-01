import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { logger } from '../db/logger.js';
import { Config } from '../config.js';

interface CrawledPage {
  url: string;
  urlSlug: string;
}

interface CrawlerOptions {
  maxPages: number;
  concurrency: number;
  depth?: number;
}

export class DocsCrawler {
  private browser: Browser | null = null;
  private visitedUrls: Set<string> = new Set();
  private discoveredUrls: Set<string> = new Set();
  private baseUrl = 'https://playwright.dev';
  private docsPath = '/docs';
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  async init(): Promise<void> {
    this.browser = await chromium.launch({
      headless: this.config.headless,
    });
    logger.info('Browser launched');
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      logger.info('Browser closed');
    }
  }

  private normalizeUrl(url: string): string {
    // Remove hash fragments
    let normalized = url.split('#')[0];

    // Ensure it starts with protocol
    if (!normalized.startsWith('http')) {
      if (normalized.startsWith('/')) {
        normalized = this.baseUrl + normalized;
      } else {
        normalized = this.baseUrl + '/' + normalized;
      }
    }

    // Ensure it's the correct origin
    if (!normalized.startsWith(this.baseUrl)) {
      return '';
    }

    // Remove trailing slash for consistency
    normalized = normalized.replace(/\/$/, '');

    return normalized;
  }

  private urlToSlug(url: string): string {
    const parsed = new URL(url);
    let slug = parsed.pathname;
    if (parsed.search) {
      slug += parsed.search;
    }
    return slug;
  }

  private isDocsUrl(url: string): boolean {
    const normalized = this.normalizeUrl(url);
    if (!normalized) return false;
    const pathname = new URL(normalized).pathname;
    return pathname.startsWith(this.docsPath);
  }

  async crawl(options: CrawlerOptions): Promise<CrawledPage[]> {
    const { maxPages, concurrency } = options;

    if (!this.browser) {
      await this.init();
    }

    const startUrl = `${this.baseUrl}${this.docsPath}/intro`;
    const queue: string[] = [startUrl];
    const discovered: CrawledPage[] = [];

    while (queue.length > 0 && discovered.length < maxPages) {
      // Process up to `concurrency` pages in parallel
      const batch = queue.splice(0, concurrency);
      const promises = batch.map((url) => this.crawlPage(url));

      const results = await Promise.allSettled(promises);

      for (const result of results) {
        if (result.status === 'fulfilled') {
          const { page, newUrls } = result.value;

          if (!this.visitedUrls.has(page)) {
            this.visitedUrls.add(page);
            discovered.push({
              url: page,
              urlSlug: this.urlToSlug(page),
            });
          }

          // Add newly discovered URLs to queue
          for (const newUrl of newUrls) {
            const normalized = this.normalizeUrl(newUrl);
            if (normalized && !this.visitedUrls.has(normalized) && !this.discoveredUrls.has(normalized)) {
              this.discoveredUrls.add(normalized);
              queue.push(normalized);
            }
          }
        } else {
          logger.error(`Failed to crawl page: ${result.reason}`);
        }
      }
    }

    logger.info(`Crawl completed. Discovered ${discovered.length} pages`);
    return discovered;
  }

  private async crawlPage(url: string): Promise<{ page: string; newUrls: string[] }> {
    let context: BrowserContext | null = null;
    let page: Page | null = null;

    try {
      if (!this.browser) throw new Error('Browser not initialized');

      context = await this.browser.newContext();
      if (!context) throw new Error('Failed to create browser context');

      page = await context.newPage();

      const normalized = this.normalizeUrl(url);
      logger.info(`Crawling: ${normalized}`);

      const navigationResponse = await page.goto(normalized, {
        waitUntil: 'networkidle',
        timeout: this.config.timeout,
      });

      if (!navigationResponse || !navigationResponse.ok()) {
        logger.warn(`Failed to load ${normalized}: ${navigationResponse?.status()}`);
        return { page: normalized, newUrls: [] };
      }

      // Extract internal docs links
      const links = await page.locator('a[href*="/docs/"]').all();
      const newUrls: string[] = [];

      for (const link of links) {
        const href = await link.getAttribute('href');
        if (href && this.isDocsUrl(href)) {
          const normalized = this.normalizeUrl(href);
          if (normalized) {
            newUrls.push(normalized);
          }
        }
      }

      return { page: normalized, newUrls };
    } catch (err) {
      logger.error(`Error crawling ${url}: ${err instanceof Error ? err.message : String(err)}`);
      return { page: this.normalizeUrl(url), newUrls: [] };
    } finally {
      if (page) await page.close();
      if (context) await context.close();
    }
  }
}
