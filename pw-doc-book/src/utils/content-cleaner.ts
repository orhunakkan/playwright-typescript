export class ContentCleaner {
  clean(content: string): string {
    let processed = content;

    // Remove all img tags
    processed = processed.replace(/<img[^>]*>/gi, '');

    // Remove navigation elements
    processed = processed.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '');

    // Remove "On this page" sections
    processed = processed.replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '');

    // Remove divs with class containing "toc" or "sidebar" or "breadcrumb"
    processed = processed.replace(/<div[^>]*class="[^"]*(?:toc|sidebar|breadcrumb)[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');

    // Remove SVG elements (icons)
    processed = processed.replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '');

    // Remove all icon elements
    processed = processed.replace(/<(?:i|span|button)[^>]*(?:class="[^"]*(?:icon|note|warn|info)[^"]*"|aria-label)[^>]*>[\s\S]*?<\/(?:i|span|button)>/gi, '');

    // Remove script tags
    processed = processed.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

    return processed;
  }
}
