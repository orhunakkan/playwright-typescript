import { defineConfig } from '@eslint/config';
import playwright from 'eslint-plugin-playwright';

export default defineConfig([
  {
    files: ['tests/**'],
    extends: [playwright.configs['flat/recommended']],
    rules: {},
  },
]);
