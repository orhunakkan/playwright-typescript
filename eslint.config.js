import { fileURLToPath } from 'node:url';
import tsParser from '@typescript-eslint/parser';
import playwright from 'eslint-plugin-playwright';

const playwrightConfig = playwright.configs['flat/recommended'];

export default [
  {
    ...playwrightConfig,
    files: ['tests/**/*.ts'],
    languageOptions: {
      ...playwrightConfig.languageOptions,
      parser: tsParser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: fileURLToPath(new URL('.', import.meta.url)),
      },
    },
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        before: 'readonly',
        after: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
  },
];
