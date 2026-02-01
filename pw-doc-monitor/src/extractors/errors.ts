import { Page } from 'playwright';
import { logger } from '../db/logger.js';

export interface ErrorEvent {
  errorType: string;
  url?: string;
  message: string;
  stackTrace?: string;
}

export class ErrorTracker {
  private page: Page;
  private errors: ErrorEvent[] = [];

  constructor(page: Page) {
    this.page = page;
  }

  async setupListeners(): Promise<void> {
    this.page.on('pageerror', (error) => {
      this.errors.push({
        errorType: 'pageerror',
        message: error.message,
        stackTrace: error.stack,
      });
      logger.debug(`Page error: ${error.message}`);
    });

    this.page.on('requestfailed', (request) => {
      this.errors.push({
        errorType: 'requestfailed',
        url: request.url(),
        message: request.failure()?.errorText || 'Unknown error',
      });
      logger.debug(`Request failed: ${request.url()}`);
    });

    await this.page.evaluateHandle(() => {
      const errors: ErrorEvent[] = [];

      (window as any).addEventListener('error', (event: any) => {
        errors.push({
          errorType: 'window:error',
          message: event.message || 'Unknown error',
        });
      });

      (window as any).addEventListener('unhandledrejection', (event: any) => {
        errors.push({
          errorType: 'unhandledrejection',
          message: event.reason?.message || String(event.reason),
        });
      });

      // Store errors in window for later retrieval
      (window as any).__pageErrors = errors;
    });
  }

  async getErrors(): Promise<ErrorEvent[]> {
    try {
      const collectedErrors = await this.page.evaluate(() => {
        return (window as any).__pageErrors || [];
      });
      return [...this.errors, ...collectedErrors];
    } catch {
      return this.errors;
    }
  }
}
