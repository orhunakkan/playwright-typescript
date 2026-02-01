import tsParser from '@typescript-eslint/parser';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import playwright from 'eslint-plugin-playwright';
import typescript from '@typescript-eslint/eslint-plugin';

export default defineConfig([
    {
        ignores: ['playwright-report/**'],
    },
    {
        files: ['tests/**/*.ts'],
        plugins: {
            playwright: playwright,
            '@typescript-eslint': typescript,
        },
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
        },
        rules: {
            'playwright/expect-expect': 'error',
            'playwright/max-expects': ['error', { max: 1 }],
            'playwright/max-nested-describe': ['error', { max: 1 }],
            'playwright/missing-playwright-await': 'error',
            'playwright/no-commented-out-tests': 'error',
            'playwright/no-conditional-expect': 'error',
            'playwright/no-conditional-in-test': 'error',
            'playwright/no-duplicate-hooks': 'error',
            'playwright/no-element-handle': 'error',
            'playwright/no-eval': 'error',
            'playwright/no-focused-test': 'error',
            'playwright/no-force-option': 'error',
            'playwright/no-get-by-title': 'error',
            'playwright/no-nested-step': 'error',
            'playwright/no-networkidle': 'error',
            'playwright/no-nth-methods': 'error',
            'playwright/no-page-pause': 'error',
            'playwright/no-raw-locators': [
                'error',
                {
                    allowed: [
                        // page.locator(svg) is allowed because currently, it is only way to switch to child svg element from a parent element.
                        'svg',
                        // Below are the class attributes for the spacer componenets.
                        // This are allowed because currently, there is no recommended way to locate these (i.e. getByClassName) other than page.locator(.prem-spacer--xl)
                        '.prem-spacer--xxxl',
                        '.prem-spacer--xxl',
                        '.prem-spacer--xl',
                        '.prem-spacer--large',
                        '.prem-spacer--regular',
                        '.prem-spacer--small',
                        '.prem-spacer--xs',
                        '.prem-spacer--xxs',
                    ],
                },
            ],
            'playwright/no-skipped-test': 'error',
            'playwright/no-slowed-test': 'error',
            'playwright/no-standalone-expect': 'error',
            'playwright/no-unsafe-references': 'error',
            'playwright/no-unsafe-references': 'error',
            'playwright/no-useless-await': 'error',
            'playwright/no-useless-not': 'error',
            'playwright/no-wait-for-selector': 'error',
            'playwright/no-wait-for-timeout': 'error',
            'playwright/prefer-comparison-matcher': 'error',
            'playwright/prefer-equality-matcher': 'error',
            'playwright/prefer-hooks-in-order': 'error',
            'playwright/prefer-hooks-on-top': 'error',
            'playwright/prefer-lowercase-title': 'error',
            'playwright/prefer-native-locators': 'error',
            'playwright/prefer-strict-equal': 'error',
            'playwright/prefer-to-be': 'error',
            'playwright/prefer-to-contain': 'error',
            'playwright/prefer-to-have-count': 'error',
            'playwright/prefer-to-have-length': 'error',
            'playwright/prefer-web-first-assertions': 'error',
            'playwright/require-to-throw-message': 'error',
            'playwright/require-top-level-describe': 'error',
            'playwright/valid-describe-callback': 'error',
            'playwright/valid-expect-in-promise': 'error',
            'playwright/valid-expect': 'error',
            'playwright/valid-title': 'error',
        },
    },
    {
        files: ['utilities/**/*.ts'],
        plugins: {
            '@typescript-eslint': typescript,
        },
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
        },
    },
    tseslint.configs.recommended,
]);