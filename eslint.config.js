import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import playwright from 'eslint-plugin-playwright';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['playwright-report/', 'test-results/', 'reports/']),
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
]);
