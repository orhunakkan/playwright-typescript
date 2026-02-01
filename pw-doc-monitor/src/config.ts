import dotenv from 'dotenv';
import { logger } from './db/logger.js';

dotenv.config();

export interface Config {
  databaseUrl: string;
  headless: boolean;
  timeout: number;
  concurrency: number;
  maxPages: number;
  crawlDepth: number | 'unlimited';
  logLevel: string;
}

export function loadConfig(): Config {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    logger.error('DATABASE_URL environment variable is not set');
    throw new Error('DATABASE_URL is required');
  }

  return {
    databaseUrl,
    headless: process.env.HEADLESS !== 'false',
    timeout: parseInt(process.env.TIMEOUT || '30000', 10),
    concurrency: parseInt(process.env.CONCURRENCY || '3', 10),
    maxPages: parseInt(process.env.MAX_PAGES || '500', 10),
    crawlDepth: process.env.CRAWL_DEPTH === 'unlimited' ? 'unlimited' : parseInt(process.env.CRAWL_DEPTH || '50', 10),
    logLevel: process.env.LOG_LEVEL || 'info',
  };
}
