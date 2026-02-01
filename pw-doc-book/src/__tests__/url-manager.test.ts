import { describe, it, expect } from 'vitest';
import { UrlManager } from '../utils/url-manager';

describe('UrlManager', () => {
  const baseUrl = 'https://playwright.dev';
  const docsPath = '/docs/';
  const urlManager = new UrlManager(baseUrl, docsPath);

  describe('isValidDocUrl', () => {
    it('should return true for valid doc URLs', () => {
      expect(urlManager.isValidDocUrl('https://playwright.dev/docs/intro')).toBe(true);
      expect(urlManager.isValidDocUrl('https://playwright.dev/docs/api/class-page')).toBe(true);
    });

    it('should return false for URLs with hash', () => {
      expect(urlManager.isValidDocUrl('https://playwright.dev/docs/intro#getting-started')).toBe(false);
    });

    it('should return false for non-doc URLs', () => {
      expect(urlManager.isValidDocUrl('https://playwright.dev/blog')).toBe(false);
      expect(urlManager.isValidDocUrl('https://example.com/docs/intro')).toBe(false);
    });

    it('should return false for invalid URLs', () => {
      expect(urlManager.isValidDocUrl('not-a-url')).toBe(false);
    });
  });

  describe('normalizeUrl', () => {
    it('should remove hash from URL', () => {
      const result = urlManager.normalizeUrl('https://playwright.dev/docs/intro#section');
      expect(result).toBe('https://playwright.dev/docs/intro');
    });

    it('should keep URL without hash unchanged', () => {
      const result = urlManager.normalizeUrl('https://playwright.dev/docs/intro');
      expect(result).toBe('https://playwright.dev/docs/intro');
    });
  });

  describe('getPathname', () => {
    it('should extract pathname from URL', () => {
      const result = urlManager.getPathname('https://playwright.dev/docs/intro');
      expect(result).toBe('/docs/intro');
    });

    it('should extract pathname from URL with hash', () => {
      const result = urlManager.getPathname('https://playwright.dev/docs/intro#section');
      expect(result).toBe('/docs/intro');
    });
  });
});
