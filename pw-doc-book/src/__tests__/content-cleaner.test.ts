import { describe, it, expect } from 'vitest';
import { ContentCleaner } from '../utils/content-cleaner';

describe('ContentCleaner', () => {
  const cleaner = new ContentCleaner();

  describe('clean', () => {
    it('should remove img tags', () => {
      const html = '<p>Text</p><img src="test.jpg" /><p>More text</p>';
      const result = cleaner.clean(html);
      expect(result).not.toContain('<img');
      expect(result).toContain('<p>Text</p>');
      expect(result).toContain('<p>More text</p>');
    });

    it('should remove nav elements', () => {
      const html = '<nav class="menu">Nav</nav><p>Content</p>';
      const result = cleaner.clean(html);
      expect(result).not.toContain('<nav');
      expect(result).toContain('<p>Content</p>');
    });

    it('should remove aside elements', () => {
      const html = '<aside>Sidebar</aside><p>Main</p>';
      const result = cleaner.clean(html);
      expect(result).not.toContain('<aside');
      expect(result).toContain('<p>Main</p>');
    });

    it('should remove svg elements', () => {
      const html = '<p>Text</p><svg><path d="..."/></svg><p>More</p>';
      const result = cleaner.clean(html);
      expect(result).not.toContain('<svg');
      expect(result).toContain('<p>Text</p>');
    });

    it('should remove script tags', () => {
      const html = '<p>Text</p><script>alert("test")</script><p>More</p>';
      const result = cleaner.clean(html);
      expect(result).not.toContain('<script');
      expect(result).not.toContain('alert');
      expect(result).toContain('<p>Text</p>');
    });

    it('should preserve valid content', () => {
      const html = '<h1>Title</h1><p>Paragraph</p><code>code</code>';
      const result = cleaner.clean(html);
      expect(result).toContain('<h1>Title</h1>');
      expect(result).toContain('<p>Paragraph</p>');
      expect(result).toContain('<code>code</code>');
    });

    it('should handle empty string', () => {
      const result = cleaner.clean('');
      expect(result).toBe('');
    });
  });
});
