import { StyleConfig } from '../config/app-config.js';
import { TitleCleaner } from '../utils/title-cleaner.js';
import { DocPage } from '../scraper.js';

export class TOCGenerator {
  constructor(
    private styleConfig: StyleConfig,
    private titleCleaner: TitleCleaner
  ) {}

  generate(pages: DocPage[]): string {
    const sortedPages = [...pages].sort((a, b) => a.order - b.order);

    // Separate API and regular docs
    const apiPages = sortedPages.filter((p) => p.url.includes('/docs/api/'));
    const regularPages = sortedPages.filter((p) => !p.url.includes('/docs/api/'));

    let tocHtml = `
      <div class="toc">
        <h1>Playwright Documentation</h1>
        <p>Interactive PDF Book</p>
        <div class="toc-content">
          <ul>
    `;

    // Add all regular docs
    if (regularPages.length > 0) {
      tocHtml += regularPages
        .map(
          (page) => `
            <li>
              <a href="#page-${sortedPages.indexOf(page)}">${this.titleCleaner.cleanTitle(page.title)}</a>
            </li>
          `
        )
        .join('');
    }

    // Add API reference section
    if (apiPages.length > 0) {
      tocHtml += `
            <li class="api-label">API Reference</li>
      `;
      tocHtml += apiPages
        .map(
          (page) => `
            <li class="api-section">
              <a href="#page-${sortedPages.indexOf(page)}">${this.titleCleaner.cleanTitle(page.title)}</a>
            </li>
          `
        )
        .join('');
    }

    tocHtml += `
          </ul>
        </div>
      </div>
      <div class="page-break"></div>
    `;

    return tocHtml;
  }
}
