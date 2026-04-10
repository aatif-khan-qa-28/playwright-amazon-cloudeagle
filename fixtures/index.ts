/**
 * Custom Playwright fixtures
 *
 * Every test that imports `{ test, expect }` from this file gets all
 * page-object instances injected automatically — no manual construction needed.
 *
 * Usage in a test file:
 *   import { test, expect } from '../fixtures';
 */

import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { SearchResultsPage } from '../pages/SearchResultsPage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';

/** Shape of our custom fixture bag */
export type PageFixtures = {
  homePage: HomePage;
  searchResultsPage: SearchResultsPage;
  productPage: ProductPage;
  cartPage: CartPage;
};

export const test = base.extend<PageFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  searchResultsPage: async ({ page }, use) => {
    await use(new SearchResultsPage(page));
  },

  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
});

export { expect };
