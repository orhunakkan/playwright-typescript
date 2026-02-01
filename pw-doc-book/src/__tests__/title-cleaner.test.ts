import { describe, it, expect } from 'vitest';
import { TitleCleaner } from '../utils/title-cleaner';

describe('TitleCleaner', () => {
  const titleCleaner = new TitleCleaner();

  describe('cleanTitle', () => {
    it('should remove "| Playwright" suffix', () => {
      expect(titleCleaner.cleanTitle('Installation | Playwright')).toBe('Installation');
      expect(titleCleaner.cleanTitle('Getting Started | Playwright')).toBe('Getting Started');
    });

    it('should handle titles without suffix', () => {
      expect(titleCleaner.cleanTitle('Installation')).toBe('Installation');
      expect(titleCleaner.cleanTitle('API Reference')).toBe('API Reference');
    });

    it('should handle case insensitive matching', () => {
      expect(titleCleaner.cleanTitle('Test | playwright')).toBe('Test');
      expect(titleCleaner.cleanTitle('Test | PLAYWRIGHT')).toBe('Test');
    });

    it('should handle extra whitespace', () => {
      expect(titleCleaner.cleanTitle('Test  |  Playwright  ')).toBe('Test');
      expect(titleCleaner.cleanTitle('  Test | Playwright')).toBe('Test');
    });

    it('should handle empty string', () => {
      expect(titleCleaner.cleanTitle('')).toBe('');
    });
  });
});
