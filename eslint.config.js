import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import playwright from 'eslint-plugin-playwright';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['playwright-report/', 'test-results/', 'test-results-mcp/', 'reports/']),
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ['tests/**', 'fixtures/**', 'pages/**'],
    extends: [playwright.configs['flat/recommended']],
    rules: {
      'playwright/missing-playwright-await': 'error',
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-networkidle': 'error',
      'playwright/no-focused-test': 'error',
      'playwright/no-force-option': 'error',
      'playwright/no-element-handle': 'error',
      'playwright/prefer-web-first-assertions': 'error',
      'playwright/no-skipped-test': 'warn',
    },
  },
  {
    // Specs (generated ones included) must use our fixtures: api, workerUser, toMatchContract.
    files: ['tests/**'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [{ name: '@playwright/test', message: 'Import test/expect from fixtures/index.ts instead.', allowTypeImports: true }],
        },
      ],
    },
  },
]);
