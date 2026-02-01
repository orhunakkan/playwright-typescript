# Playwright Documentation to PDF

This application scrapes the official Playwright documentation and converts it into an interactive PDF book, preserving the dark theme styling and all hyperlinks.

## Features

- 🌐 **Complete Documentation Scraping**: Crawls all pages from the Playwright documentation (138+ pages)
- 🎨 **Dark Theme Preserved**: Maintains the Playwright documentation's dark mode appearance with improved code visibility
- 🔗 **Interactive Links**: All internal and external links are preserved and working in the PDF
- 📚 **Smart Table of Contents**: 3-column layout with automatic separation of regular docs and API reference
- 🧹 **Clean Content**: Removes navigation elements, broken images, and unnecessary icons
- 💾 **Intermediate Caching**: Saves scraped data as JSON for faster regeneration
- 🧪 **Unit Tested**: Comprehensive test coverage with Vitest for core utilities
- 🏗️ **Modular Architecture**: Dependency injection, configuration management, and structured logging
- 🔄 **Resilience**: Automatic retry logic with exponential backoff for failed requests

## Installation

Dependencies are managed in the parent `package.json`. Make sure you've run:

```bash
npm install
```

## Usage

### Run the complete process (scrape + generate PDF):

```bash
npm run doc-to-pdf
```

### Or run individual steps:

**Scrape documentation only:**

```bash
npm run doc-scrape
```

**Generate PDF from scraped data:**

```bash
npm run doc-generate
```

**Run unit tests:**

```bash
npm test
```

## Output

The application generates files in the `pw-doc-book/output/` directory:

- `scraped-data.json` - Raw scraped content from documentation pages
- `playwright-documentation.html` - HTML version for preview/debugging
- `playwright-documentation.pdf` - Final interactive PDF book

## Configuration

All application settings are centralized in `src/config/app-config.ts` with the following configurable sections:

- **ScraperConfig**: Retry attempts, timeout, and request delays
- **PDFConfig**: Margins, format (A4), and print backgrounds
- **StyleConfig**: Colors, fonts, columns for the PDF layout
- **OutputConfig**: File paths for output files

To modify behavior, update the `defaultConfig` object in `src/config/app-config.ts`.

## Styling

The PDF styling is configured in `src/pdf-generator.ts` in the `getPlaywrightStyles()` method. It includes:

- Dark background (#1b1b1d) with proper book margins (50px)
- Enhanced syntax highlighting colors for better code readability
- Code block styling with light text for visibility
- Table formatting optimized for dark theme
- Link colors (#4fc3f7) that work both internally and externally
- 3-column table of contents with visual column separators

## Architecture

The application follows clean architecture principles with separation of concerns:

### Core Modules

- **`src/scraper.ts`**: Main scraper using dependency injection and retry logic
- **`src/pdf-generator.ts`**: PDF generation with content cleaning and link processing
- **`src/config/app-config.ts`**: Centralized configuration management
- **`src/utils/`**: Modular utilities for specific concerns:
  - `url-manager.ts` - URL validation and normalization
  - `logger.ts` - Structured logging with context
  - `retry.ts` - Automatic retry with exponential backoff
  - `content-cleaner.ts` - HTML content sanitization
  - `link-processor.ts` - Internal/external link conversion
  - `title-cleaner.ts` - Page title cleanup
- **`src/generators/`**: PDF generation helpers:
  - `toc-generator.ts` - Table of contents generation
  - `style-generator.ts` - CSS styling for the PDF
- **`src/__tests__/`**: Unit tests covering all utilities (27 tests)

### Design Patterns

- **Dependency Injection**: All classes receive dependencies via constructor
- **Modular Design**: Each utility has a single responsibility
- **Configuration Management**: All settings in one centralized location
- **Error Handling**: Retry logic with exponential backoff for resilience
- **Structured Logging**: Context-aware logging for debugging

## Testing

Run the test suite with:

```bash
npm test
```

Current test coverage (27 tests):

- URL Manager: URL validation and normalization
- Title Cleaner: Title text processing
- Content Cleaner: HTML content sanitization
- Link Processor: Link conversion and URL mapping

Tests are written with Vitest and can be extended for additional modules.

## How It Works

1. **Scraper** (`src/scraper.ts`):
   - Starts from the intro page (https://playwright.dev/docs/intro)
   - Uses retry logic with exponential backoff for resilience
   - Extracts HTML content and finds all documentation links
   - Recursively visits all unique documentation pages
   - Saves page content, title, and URL in order
   - Logs structured information about progress and errors

2. **Content Processing** (`src/pdf-generator.ts`):
   - Uses `ContentCleaner` to remove images, navigation, and unnecessary elements
   - Uses `TitleCleaner` to normalize page titles
   - Uses `LinkProcessor` to convert internal doc links to PDF anchors
   - Preserves external links for reference
   - Tracks and reports any processing issues

3. **PDF Generation** (`src/pdf-generator.ts`):
   - Uses `TOCGenerator` to create a 3-column table of contents
   - Distinguishes API reference pages from regular documentation
   - Uses `StyleGenerator` to apply Playwright's dark theme with enhanced readability
   - Generates PDF with proper book margins (50px) and syntax highlighting
   - Uses Playwright's PDF generation with print backgrounds

## Technical Details

- **TypeScript**: Fully typed for better development experience
- **Playwright**: Used for both scraping and PDF generation
- **ESM Modules**: Uses ES module syntax
- **Headless Browser**: Runs efficiently in headless mode

## Limitations

- PDF links work best in modern PDF readers (Adobe Acrobat, Chrome, Edge)
- Documentation scraping may take a few minutes for 138+ pages
- Some dynamically-loaded content may not be captured
- External links in PDF open in new tabs/windows depending on PDF reader

## Customization

To customize the appearance, edit the CSS in `src/pdf-generator.ts`. The styles are designed to match Playwright's documentation theme but can be adjusted to your preferences.

## License

ISC
