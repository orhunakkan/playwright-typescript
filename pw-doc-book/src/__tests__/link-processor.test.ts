import { describe, it, expect } from 'vitest';
import { LinkProcessor } from '../utils/link-processor';
import { UrlManager } from '../utils/url-manager';

describe('LinkProcessor', () => {
  const urlManager = new UrlManager('https://playwright.dev', '/docs/');
  const linkProcessor = new LinkProcessor(urlManager);

  describe('buildUrlToIdMap', () => {
    it('should create URL to ID mapping', () => {
      const pages = [
        { url: 'https://playwright.dev/docs/intro', order: 0 },
        { url: 'https://playwright.dev/docs/api/class-page', order: 1 },
      ];

      const map = linkProcessor.buildUrlToIdMap(pages);

      expect(map.get('/docs/intro')).toBe('page-0');
      expect(map.get('/docs/api/class-page')).toBe('page-1');
      expect(map.size).toBe(2);
    });

    it('should handle empty pages array', () => {
      const map = linkProcessor.buildUrlToIdMap([]);
      expect(map.size).toBe(0);
    });
  });

  describe('processLinks', () => {
    const urlToIdMap = new Map([
      ['/docs/intro', 'page-0'],
      ['/docs/api/class-page', 'page-1'],
    ]);

    it('should convert internal doc links to anchors', () => {
      const html = '<a href="/docs/intro">Intro</a>';
      const result = linkProcessor.processLinks(html, urlToIdMap);
      expect(result).toContain('href="#page-0"');
    });

    it('should preserve links to external pages', () => {
      const html = '<a href="/docs/not-in-map">External</a>';
      const result = linkProcessor.processLinks(html, urlToIdMap);
      expect(result).toContain('href="https://playwright.dev/docs/not-in-map"');
    });

    it('should handle links with hash fragments', () => {
      const html = '<a href="/docs/intro#section">Intro</a>';
      const result = linkProcessor.processLinks(html, urlToIdMap);
      expect(result).toContain('href="#page-0#section"');
    });

    it('should convert absolute playwright.dev links', () => {
      const html = '<a href="https://playwright.dev/docs/intro">Intro</a>';
      const result = linkProcessor.processLinks(html, urlToIdMap);
      expect(result).toContain('href="#page-0"');
    });

    it('should preserve content without links', () => {
      const html = '<p>No links here</p>';
      const result = linkProcessor.processLinks(html, urlToIdMap);
      expect(result).toBe(html);
    });
  });
});
