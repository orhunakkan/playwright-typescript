export interface ScraperConfig {
  baseUrl: string;
  docsPath: string;
  startUrl: string;
  maxRetries: number;
  retryDelay: number;
  timeout: number;
  headless: boolean;
}

export interface PDFConfig {
  format: 'A4' | 'Letter';
  margins: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  printBackground: boolean;
  preferCSSPageSize: boolean;
  displayHeaderFooter: boolean;
}

export interface StyleConfig {
  backgroundColor: string;
  textColor: string;
  codeBackgroundColor: string;
  codeTextColor: string;
  linkColor: string;
  columnCount: number;
  columnGap: string;
}

export interface OutputConfig {
  outputDir: string;
  scrapedDataFile: string;
  pdfFile: string;
  htmlFile: string;
}

export interface AppConfig {
  scraper: ScraperConfig;
  pdf: PDFConfig;
  style: StyleConfig;
  output: OutputConfig;
}

export const defaultConfig: AppConfig = {
  scraper: {
    baseUrl: 'https://playwright.dev',
    docsPath: '/docs/',
    startUrl: 'https://playwright.dev/docs/intro',
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 10000,
    headless: true,
  },
  pdf: {
    format: 'A4',
    margins: {
      top: '50px',
      right: '50px',
      bottom: '50px',
      left: '50px',
    },
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: false,
  },
  style: {
    backgroundColor: '#1b1b1d',
    textColor: '#d4d4d4',
    codeBackgroundColor: '#2d2d30',
    codeTextColor: '#e8e8e8',
    linkColor: '#4fc3f7',
    columnCount: 3,
    columnGap: '25px',
  },
  output: {
    outputDir: 'output',
    scrapedDataFile: 'scraped-data.json',
    pdfFile: 'playwright-documentation.pdf',
    htmlFile: 'playwright-documentation.html',
  },
};
