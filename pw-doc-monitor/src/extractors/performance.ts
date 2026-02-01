import { Page } from 'playwright';
import { logger } from '../db/logger.js';

export interface PerformanceMetricsData {
  domcontentloadedMs?: number;
  loadMs?: number;
  firstByteMs?: number;
  resourceCount?: number;
  totalTransferSizeBytes?: number;
}

export class PerformanceMetrics {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async measure(): Promise<PerformanceMetricsData> {
    try {
      const metrics = await this.page.evaluate(() => {
        const perf = (window as any).performance?.timing;
        const navigationEntries = (window as any).performance?.getEntriesByType?.('navigation');
        const navigation = navigationEntries?.[0];

        if (!perf) {
          return {
            domcontentloaded: 0,
            load: 0,
            firstByte: 0,
            navigationTiming: null,
          };
        }

        const domcontentloaded = perf.domContentLoadedEventEnd - perf.navigationStart;
        const load = perf.loadEventEnd - perf.navigationStart;
        const firstByte = perf.responseStart - perf.navigationStart;

        return {
          domcontentloaded,
          load,
          firstByte,
          navigationTiming: navigation,
        };
      });

      const resourceList = await this.page.evaluate(() => {
        const resources = (window as any).performance?.getEntriesByType?.('resource') || [];
        let totalSize = 0;
        for (const resource of resources) {
          const transferSize = (resource as any)?.transferSize;
          if (transferSize) {
            totalSize += transferSize;
          }
        }
        return {
          count: resources.length,
          totalSize,
        };
      });

      return {
        domcontentloadedMs: metrics.domcontentloaded || undefined,
        loadMs: metrics.load || undefined,
        firstByteMs: metrics.firstByte || undefined,
        resourceCount: resourceList.count,
        totalTransferSizeBytes: resourceList.totalSize,
      };
    } catch (err) {
      logger.warn(`Failed to measure performance: ${err instanceof Error ? err.message : String(err)}`);
      return {};
    }
  }
}
