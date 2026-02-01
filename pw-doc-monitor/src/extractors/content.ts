import { createHash } from 'crypto';
import { Page } from 'playwright';
import { logger } from '../db/logger.js';

export interface ContentSnapshot {
  title: string;
  h1Text: string;
  headings: string[];
  mainText: string;
  codeBlocks: Array<{
    code: string;
    language?: string;
  }>;
  internalLinks: string[];
}

export interface ContentFingerprint {
  textHash: string;
  headingsHash: string;
  codeHash: string;
  linksHash: string;
  snapshot: ContentSnapshot;
}

export class ContentExtractor {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private hashString(str: string): string {
    return createHash('sha256').update(str).digest('hex');
  }

  async extract(): Promise<ContentFingerprint> {
    try {
      const title = await this.page.title();
      const h1Text = await this.extractH1();
      const headings = await this.extractHeadings();
      const mainText = await this.extractMainText();
      const codeBlocks = await this.extractCodeBlocks();
      const internalLinks = await this.extractInternalLinks();

      const snapshot: ContentSnapshot = {
        title,
        h1Text,
        headings,
        mainText,
        codeBlocks,
        internalLinks,
      };

      const fingerprint: ContentFingerprint = {
        textHash: this.hashString(mainText),
        headingsHash: this.hashString(JSON.stringify(headings)),
        codeHash: this.hashString(codeBlocks.map((b) => b.code).join('\n---\n')),
        linksHash: this.hashString(JSON.stringify(internalLinks.sort())),
        snapshot,
      };

      return fingerprint;
    } catch (err) {
      logger.error(`Failed to extract content: ${err instanceof Error ? err.message : String(err)}`);
      throw err;
    }
  }

  private async extractH1(): Promise<string> {
    try {
      const h1 = await this.page.locator('main h1').first();
      if (h1) {
        return (await h1.textContent()) || '';
      }
    } catch {
      // Ignore if not found
    }
    return '';
  }

  private async extractHeadings(): Promise<string[]> {
    try {
      const main = this.page.locator('main');
      if (!main) return [];

      const headings: string[] = [];
      const h2s = await main.locator('h2').all();
      for (const h2 of h2s) {
        const text = await h2.textContent();
        if (text) headings.push(text.trim());
      }

      const h3s = await main.locator('h3').all();
      for (const h3 of h3s) {
        const text = await h3.textContent();
        if (text) headings.push(text.trim());
      }

      return headings;
    } catch {
      return [];
    }
  }

  private async extractMainText(): Promise<string> {
    try {
      const main = this.page.locator('main');
      if (main) {
        const text = await main.textContent();
        if (text) {
          return text
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.length > 0)
            .join('\n');
        }
      }
    } catch {
      // Ignore if not found
    }
    return '';
  }

  private async extractCodeBlocks(): Promise<Array<{ code: string; language?: string }>> {
    try {
      const codeBlocks: Array<{ code: string; language?: string }> = [];
      const preElements = await this.page.locator('pre').all();

      for (const pre of preElements) {
        try {
          const codeEl = pre.locator('code').first();
          const text = await codeEl.textContent();
          const classList = await codeEl.evaluate((el) => el.className);

          let language: string | undefined;
          if (classList && typeof classList === 'string') {
            const langMatch = classList.match(/language-(\w+)/);
            if (langMatch) {
              language = langMatch[1];
            }
          }

          if (text) {
            codeBlocks.push({
              code: text,
              language,
            });
          }
        } catch {
          // Ignore individual code block extraction errors
        }
      }

      return codeBlocks;
    } catch {
      return [];
    }
  }

  private async extractInternalLinks(): Promise<string[]> {
    try {
      const main = this.page.locator('main');
      if (!main) return [];

      const links = await main.locator('a[href*="/docs/"]').all();
      const hrefs: string[] = [];

      for (const link of links) {
        const href = await link.getAttribute('href');
        if (href && href.startsWith('/docs/')) {
          // Normalize: remove hash and trailing slash
          const normalized = href.split('#')[0].replace(/\/$/, '');
          if (normalized && !hrefs.includes(normalized)) {
            hrefs.push(normalized);
          }
        }
      }

      return hrefs.sort();
    } catch {
      return [];
    }
  }
}
