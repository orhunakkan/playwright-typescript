import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { logger } from './db/logger.js';
import { Config } from './config.js';
import * as repo from './db/repository.js';
import { DocsCrawler } from './crawler/crawler.js';
import { ContentExtractor, ContentFingerprint } from './extractors/content.js';
import { NetworkObserver } from './extractors/network.js';
import { PerformanceMetrics, PerformanceMetricsData } from './extractors/performance.js';
import { ErrorTracker } from './extractors/errors.js';
import { Reporter } from './reporter.js';
import { promises as fs } from 'fs';
import path from 'path';

interface PageMonitorResult {
  url: string;
  pageId: number;
  contentFingerprint: ContentFingerprint;
  networkObservation: any;
  performanceMetrics: PerformanceMetricsData;
  errors: any[];
  assets: any[];
}

export class MonitorService {
  private config: Config;
  private browser: Browser | null = null;
  private startTime: number = 0;
  private runId: string = '';
  private artifactsDir: string = '';

  constructor(config: Config) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    this.startTime = Date.now();
    this.runId = await repo.createRun();
    this.artifactsDir = path.join(process.cwd(), 'artifacts', this.runId);
    await fs.mkdir(this.artifactsDir, { recursive: true });
    logger.info(`Monitor initialized with run ID: ${this.runId}`);
  }

  async run(): Promise<void> {
    try {
      await this.initialize();

      // Step 1: Crawl and discover URLs
      logger.info('Starting crawl phase...');
      const crawler = new DocsCrawler(this.config);
      await crawler.init();
      const discoveredPages = await crawler.crawl({
        maxPages: this.config.maxPages,
        concurrency: this.config.concurrency,
      });
      await crawler.close();

      logger.info(`Discovered ${discoveredPages.length} pages`);

      // Step 2: Monitor each page
      logger.info('Starting monitoring phase...');
      const monitoredPages: PageMonitorResult[] = [];
      let monitoredCount = 0;

      for (let i = 0; i < discoveredPages.length; i += this.config.concurrency) {
        const batch = discoveredPages.slice(i, i + this.config.concurrency);
        const promises = batch.map((page) => this.monitorPage(page.url));

        const results = await Promise.allSettled(promises);

        for (const result of results) {
          if (result.status === 'fulfilled') {
            monitoredPages.push(result.value);
            monitoredCount++;
          } else {
            logger.error(`Failed to monitor page: ${result.reason}`);
          }
        }
      }

      logger.info(`Monitored ${monitoredCount} pages`);

      // Step 3: Detect changes
      logger.info('Detecting changes...');
      const changes = await this.detectChanges(monitoredPages);

      // Step 4: Finalize run
      const duration = Date.now() - this.startTime;
      await repo.completRun(this.runId, discoveredPages.length, monitoredCount, changes.pagesChanged, changes.pagesNew, changes.pagesMissing, changes.totalErrors, duration);

      logger.info(`Monitor run completed in ${duration}ms`);

      // Step 5: Generate HTML report
      logger.info('Generating HTML report...');
      const reporter = new Reporter();
      const reportPath = await reporter.generateHtmlReport(this.runId);
      logger.info(`HTML report generated: ${reportPath}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.error(`Monitor run failed: ${errorMsg}`);
      await repo.failRun(this.runId, errorMsg);
      throw err;
    }
  }

  private async monitorPage(url: string): Promise<PageMonitorResult> {
    let context: BrowserContext | null = null;
    let page: Page | null = null;

    try {
      if (!this.browser) {
        this.browser = await chromium.launch({
          headless: this.config.headless,
        });
      }

      context = await this.browser.newContext();
      if (!context) throw new Error('Failed to create browser context');

      page = await context.newPage();

      // Setup listeners
      const networkObserver = new NetworkObserver(page);
      const errorTracker = new ErrorTracker(page);
      await networkObserver.setupListeners();
      await errorTracker.setupListeners();

      logger.info(`Monitoring page: ${url}`);

      // Navigate to page
      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: this.config.timeout,
      });

      // Extract data
      const contentExtractor = new ContentExtractor(page);
      const contentFingerprint = await contentExtractor.extract();

      const performanceMetrics = new PerformanceMetrics(page);
      const perf = await performanceMetrics.measure();

      const networkObservation = await networkObserver.observe();
      const assets = await networkObserver.extractAssets();
      const errors = await errorTracker.getErrors();

      // Upsert page and save snapshot
      const urlSlug = new URL(url).pathname;
      const pageId = await repo.upsertPage(url, urlSlug);
      const dbRunId = (await repo.getRun(this.runId))?.id;

      await repo.insertPageSnapshot(dbRunId, pageId, url, contentFingerprint);
      await repo.insertNetworkObservation(dbRunId, pageId, url, networkObservation);
      await repo.insertPerformanceObservation(dbRunId, pageId, url, perf);
      await repo.insertAssetFingerprints(dbRunId, pageId, assets);

      if (errors.length > 0) {
        await repo.insertErrorEvents(dbRunId, pageId, errors);
      }

      return {
        url,
        pageId,
        contentFingerprint,
        networkObservation,
        performanceMetrics: perf,
        errors,
        assets,
      };
    } catch (err) {
      logger.error(`Error monitoring ${url}: ${err instanceof Error ? err.message : String(err)}`);
      throw err;
    } finally {
      if (page) await page.close();
      if (context) await context.close();
    }
  }

  private async detectChanges(monitoredPages: PageMonitorResult[]): Promise<{
    pagesChanged: number;
    pagesNew: number;
    pagesMissing: number;
    totalErrors: number;
  }> {
    const dbRun = await repo.getRun(this.runId);
    if (!dbRun) {
      return { pagesChanged: 0, pagesNew: 0, pagesMissing: 0, totalErrors: 0 };
    }

    let pagesChanged = 0;
    let pagesNew = 0;
    let totalErrors = 0;

    for (const page of monitoredPages) {
      totalErrors += page.errors.length;

      const previousSnapshot = await repo.getPreviousSnapshot(page.pageId, dbRun.id);

      if (!previousSnapshot) {
        pagesNew++;
      } else {
        // Check for changes in hashes
        if (
          previousSnapshot.text_hash !== page.contentFingerprint.textHash ||
          previousSnapshot.headings_hash !== page.contentFingerprint.headingsHash ||
          previousSnapshot.code_hash !== page.contentFingerprint.codeHash ||
          previousSnapshot.links_hash !== page.contentFingerprint.linksHash
        ) {
          pagesChanged++;

          // Save diff artifact
          await this.saveDiffArtifact(page, previousSnapshot);
        }
      }
    }

    return {
      pagesChanged,
      pagesNew,
      pagesMissing: 0,
      totalErrors,
    };
  }

  private async saveDiffArtifact(current: PageMonitorResult, previous: any): Promise<void> {
    try {
      const urlSlug = new URL(current.url).pathname.replace(/\//g, '_').slice(1);
      const pageDir = path.join(this.artifactsDir, urlSlug);
      await fs.mkdir(pageDir, { recursive: true });

      // Save snapshots
      await fs.writeFile(path.join(pageDir, 'snapshot.before.json'), JSON.stringify(JSON.parse(previous.content_snapshot), null, 2));
      await fs.writeFile(path.join(pageDir, 'snapshot.after.json'), JSON.stringify(current.contentFingerprint.snapshot, null, 2));

      // Save diff summary
      const diffSummary = this.generateDiffSummary(JSON.parse(previous.content_snapshot), current.contentFingerprint.snapshot);
      await fs.writeFile(path.join(pageDir, 'diff.md'), diffSummary);

      logger.info(`Saved diff artifact for ${current.url}`);
    } catch (err) {
      logger.warn(`Failed to save diff artifact: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  private generateDiffSummary(before: any, after: any): string {
    let summary = '# Content Diff\n\n';

    if (before.title !== after.title) {
      summary += `## Title Changed\n- Before: ${before.title}\n- After: ${after.title}\n\n`;
    }

    if (before.h1Text !== after.h1Text) {
      summary += `## H1 Changed\n- Before: ${before.h1Text}\n- After: ${after.h1Text}\n\n`;
    }

    const beforeHeadings = before.headings || [];
    const afterHeadings = after.headings || [];

    if (JSON.stringify(beforeHeadings) !== JSON.stringify(afterHeadings)) {
      summary += '## Headings Changed\n';
      summary += '### Added\n';
      for (const heading of afterHeadings) {
        if (!beforeHeadings.includes(heading)) {
          summary += `- ${heading}\n`;
        }
      }
      summary += '### Removed\n';
      for (const heading of beforeHeadings) {
        if (!afterHeadings.includes(heading)) {
          summary += `- ${heading}\n`;
        }
      }
      summary += '\n';
    }

    return summary;
  }
}
