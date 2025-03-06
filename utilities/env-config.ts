import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

/**
 * Environment configuration utility
 */
export class EnvConfig {
  /**
   * Get the base URL based on the current environment
   * @returns The base URL for the current environment
   */
  static getBaseUrl(): string {
    const environment = (process.env.ENVIRONMENT || 'qa').toLowerCase();
    
    switch (environment) {
      case 'qa':
        return process.env.QA_URL || 'https://practice.cydeo.com';
      case 'staging':
        return process.env.STAGING_URL || 'https://staging.practice.cydeo.com';
      case 'prod':
        return process.env.PROD_URL || 'https://prod.practice.cydeo.com';
      default:
        return process.env.QA_URL || 'https://practice.cydeo.com';
    }
  }

  /**
   * Get the current environment name
   * @returns The name of the current environment
   */
  static getEnvironment(): string {
    return (process.env.ENVIRONMENT || 'qa').toLowerCase();
  }

  /**
   * Get any environment variable by key
   * @param key - The environment variable key
   * @param defaultValue - Default value if the key is not found
   * @returns The value of the environment variable or the default value
   */
  static get(key: string, defaultValue: string = ''): string {
    return process.env[key] || defaultValue;
  }
}