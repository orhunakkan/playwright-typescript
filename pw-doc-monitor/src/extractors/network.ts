import { createHash } from 'crypto';
import { Page, Response } from 'playwright';
import { logger } from '../db/logger.js';

export interface NetworkObservation {
  totalRequests: number;
  totalResponses: number;
  count2xx: number;
  count3xx: number;
  count4xx: number;
  count5xx: number;
  failedRequests: number;
  topFailingUrls: Array<{ url: string; status: number; count: number }>;
}

export interface AssetFingerprint {
  assetType: 'script' | 'stylesheet';
  assetUrl: string;
  bodyHash?: string;
  sizeBytes?: number;
  contentType?: string;
}

export class NetworkObserver {
  private page: Page;
  private responses: Map<string, Response> = new Map();
  private failedUrls: Map<string, number> = new Map();
  private requestCount = 0;
  private responseCount = 0;
  private failedCount = 0;

  constructor(page: Page) {
    this.page = page;
  }

  async setupListeners(): Promise<void> {
    this.page.on('response', (response) => {
      const status = response.status();
      const url = response.url();
      this.responses.set(url, response);
      this.responseCount++;

      if (status >= 400) {
        this.failedUrls.set(url, (this.failedUrls.get(url) || 0) + 1);
      }
    });

    this.page.on('requestfailed', (request) => {
      this.failedCount++;
      const url = request.url();
      this.failedUrls.set(url, (this.failedUrls.get(url) || 0) + 1);
    });

    this.page.on('request', () => {
      this.requestCount++;
    });
  }

  async observe(): Promise<NetworkObservation> {
    let count2xx = 0,
      count3xx = 0,
      count4xx = 0,
      count5xx = 0;

    for (const response of this.responses.values()) {
      const status = response.status();
      if (status >= 200 && status < 300) count2xx++;
      else if (status >= 300 && status < 400) count3xx++;
      else if (status >= 400 && status < 500) count4xx++;
      else if (status >= 500) count5xx++;
    }

    const topFailingUrls = Array.from(this.failedUrls.entries())
      .map(([url, count]) => {
        const response = this.responses.get(url);
        return {
          url,
          status: response?.status() || 0,
          count,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalRequests: this.requestCount,
      totalResponses: this.responseCount,
      count2xx,
      count3xx,
      count4xx,
      count5xx,
      failedRequests: this.failedCount,
      topFailingUrls,
    };
  }

  async extractAssets(): Promise<AssetFingerprint[]> {
    try {
      const assets: AssetFingerprint[] = [];

      // Extract scripts
      const scripts = await this.page.locator('script[src]').all();
      for (const script of scripts) {
        const src = await script.getAttribute('src');
        if (src) {
          const absoluteUrl = this.resolveUrl(src);
          assets.push({
            assetType: 'script',
            assetUrl: absoluteUrl,
          });
        }
      }

      // Extract stylesheets
      const links = await this.page.locator('link[rel="stylesheet"]').all();
      for (const link of links) {
        const href = await link.getAttribute('href');
        if (href) {
          const absoluteUrl = this.resolveUrl(href);
          assets.push({
            assetType: 'stylesheet',
            assetUrl: absoluteUrl,
          });
        }
      }

      // Fetch asset content and compute hashes
      for (const asset of assets) {
        try {
          const response = this.responses.get(asset.assetUrl);
          if (response) {
            asset.contentType = response.headers()['content-type'];
            const buffer = await response.body();
            if (buffer && buffer.length < 1024 * 1024) {
              // Only hash if < 1MB
              asset.bodyHash = createHash('sha256').update(buffer).digest('hex');
              asset.sizeBytes = buffer.length;
            } else {
              asset.sizeBytes = buffer?.length || 0;
            }
          }
        } catch (err) {
          logger.debug(`Failed to fetch asset ${asset.assetUrl}: ${err instanceof Error ? err.message : String(err)}`);
        }
      }

      return assets;
    } catch (err) {
      logger.error(`Failed to extract assets: ${err instanceof Error ? err.message : String(err)}`);
      return [];
    }
  }

  private resolveUrl(url: string): string {
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) {
      const pageUrl = new URL(this.page.url());
      return `${pageUrl.protocol}//${pageUrl.host}${url}`;
    }
    const pageUrl = new URL(this.page.url());
    return new URL(url, pageUrl.href).href;
  }
}
