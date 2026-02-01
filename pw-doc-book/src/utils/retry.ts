import { Logger } from './logger.js';

export interface RetryOptions {
  maxRetries: number;
  retryDelay: number;
  logger?: Logger;
}

export async function retryAsync<T>(fn: () => Promise<T>, options: RetryOptions, context: string = 'operation'): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < options.maxRetries) {
        if (options.logger) {
          options.logger.warn(`${context} failed (attempt ${attempt}/${options.maxRetries}), retrying...`, { error: lastError.message });
        }
        await sleep(options.retryDelay * attempt); // Exponential backoff
      }
    }
  }

  throw new Error(`${context} failed after ${options.maxRetries} attempts: ${lastError?.message}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
