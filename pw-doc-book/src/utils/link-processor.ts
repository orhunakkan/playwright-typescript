import { UrlManager } from './url-manager.js';

export class LinkProcessor {
  constructor(private urlManager: UrlManager) {}

  processLinks(content: string, urlToIdMap: Map<string, string>): string {
    let processed = content;

    // Convert internal doc links to PDF anchors
    processed = processed.replace(/href="\/docs\/([^"#]+)(#[^"]+)?"/g, (match, docPath, hash) => {
      const fullPath = `/docs/${docPath}`;
      const targetId = urlToIdMap.get(fullPath);
      if (targetId) {
        return `href="#${targetId}${hash || ''}"`;
      }
      // If not found in our pages, keep as external link
      return `href="https://playwright.dev/docs/${docPath}${hash || ''}"`;
    });

    // Handle absolute playwright.dev links
    processed = processed.replace(/href="https:\/\/playwright\.dev\/docs\/([^"#]+)(#[^"]+)?"/g, (match, docPath, hash) => {
      const fullPath = `/docs/${docPath}`;
      const targetId = urlToIdMap.get(fullPath);
      if (targetId) {
        return `href="#${targetId}${hash || ''}"`;
      }
      return match;
    });

    return processed;
  }

  buildUrlToIdMap(pages: Array<{ url: string; order: number }>): Map<string, string> {
    const urlMap = new Map<string, string>();
    pages.forEach((page, index) => {
      const docPath = this.urlManager.getPathname(page.url);
      urlMap.set(docPath, `page-${index}`);
    });
    return urlMap;
  }
}
