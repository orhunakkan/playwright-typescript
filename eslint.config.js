import playwright from 'eslint-plugin-playwright';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },
  {
    files: ['tests/**/*.ts', 'tests/**/*.tsx'],
    ...playwright.configs['flat/recommended'],
    rules: {},
  },
];
