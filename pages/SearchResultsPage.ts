import { expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { SearchResultsPageLocators } from '../locators/SearchResultsPageLocators';

export class SearchResultsPage extends BasePage {
  private readonly results = this.page.locator(SearchResultsPageLocators.searchResult);

  /**
   * Assert that at least one search result card is visible —
   * confirms the SERP loaded and Amazon returned results for the query.
   */
  async verifyResultsVisible(): Promise<void> {
    await expect(this.results.first()).toBeVisible({ timeout: 20_000 });
    const count = await this.results.count();
    expect(count, 'Expected at least one search result').toBeGreaterThan(0);
  }

  /**
   * Assert that the search result page contains a specific number of results
   * (useful for smoke-testing that a search isn't broken).
   */
  async verifyMinimumResultCount(minCount: number): Promise<void> {
    await this.verifyResultsVisible();
    const count = await this.results.count();
    expect(count, `Expected at least ${minCount} results, got ${count}`).toBeGreaterThanOrEqual(
      minCount,
    );
  }

  /**
   * Assert that the SERP is in a "no results" state — used for negative testing
   * to verify Amazon handles zero-result queries correctly.
   */
  async verifyNoResults(): Promise<void> {
    const noResultsMsg = this.page.locator(
      '[data-component-type="s-no-results-section"], .s-no-results-section, h1:has-text("No results"), .a-spacing-medium:has-text("did not match any products")',
    );
    await expect(noResultsMsg.first()).toBeVisible({ timeout: 15_000 });
  }

  /**
   * Find the first result card whose text contains `productName`,
   * force the link to open in the same tab, click it, and wait for
   * the product detail page URL (/dp/).
   */
  async selectProductByName(productName: string): Promise<void> {
    const product = this.results.filter({ hasText: productName }).first();

    await expect(product, `Product card containing "${productName}" should be visible`).toBeVisible(
      {
        timeout: 15_000,
      },
    );

    const link = product.locator(SearchResultsPageLocators.productLink).first();
    await expect(link).toBeVisible();

    // Remove target="_blank" so any sponsored/external links stay in the same tab
    await link.evaluate((el: HTMLAnchorElement) => el.removeAttribute('target'));

    await link.click();
    await this.page.waitForURL(/\/dp\//, { timeout: 20_000 });
  }

  /**
   * Return the title texts of all visible result cards.
   * Useful for asserting that results are relevant to the query.
   */
  async getResultTitles(): Promise<string[]> {
    await this.verifyResultsVisible();
    const titleSpans = this.page.locator(SearchResultsPageLocators.resultTitleSpan);
    return (await titleSpans.allInnerTexts()).map((t) => t.trim()).filter(Boolean);
  }

  /**
   * Assert the current page URL contains the search query (sanity check
   * that the SERP URL reflects what was typed in the search box).
   */
  async verifySearchQuery(query: string): Promise<void> {
    await this.assertUrl(new RegExp(encodeURIComponent(query).replace(/%20/g, '[+%20]')));
  }
}
