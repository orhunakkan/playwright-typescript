import { test } from '@playwright/test';

/**
 * Skips the test if the environment is not set to silent production.
 * This ensures tests only run in the specified production environment.
 *
 * @function skipIfNotSilentProduction
 * @returns {Promise<void>} A promise that resolves when the skip condition is checked.
 * - This returns undefined when the environment is NOT silent production.
 */
export async function skipIfNotSilentProduction() {
  if (process.env.ENV !== 'https://corporate.northerntrust.com') {
    test.skip();
  }
}
