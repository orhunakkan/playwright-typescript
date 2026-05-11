import playwright from 'eslint-plugin-playwright';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    ...playwright.configs['flat/recommended'],
    files: ['tests/**/*.ts', 'fixtures/**/*.ts', 'utilities/**/*.ts'],
    languageOptions: {
      parser: tsParser,
    },
  },
];
