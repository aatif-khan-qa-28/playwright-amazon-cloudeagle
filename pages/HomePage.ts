import { expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { HomePageLocators } from '../locators/HomePageLocators';

export class HomePage extends BasePage {
  private readonly searchBox = this.page.locator(HomePageLocators.searchBox);
  private readonly searchButton = this.page.locator(HomePageLocators.searchButton);
  private readonly navLogo = this.page.locator(HomePageLocators.navLogo);
  private readonly cartCount = this.page.locator(HomePageLocators.cartCount);

  /**
   * Navigate to the homepage and assert it has fully loaded.
   * Playwright's auto-waiting handles network idle; we add an explicit
   * assertion on a visible landmark so the page is ready for interaction.
   */
  async navigate(): Promise<void> {
    // Use networkidle so CI runners (which may get redirects or bot-check pages)
    // wait for the page to fully settle before asserting landmarks.
    await this.goto('/', 'networkidle');
    // The search box is the functional landmark we actually need — assert it first.
    await expect(this.searchBox).toBeVisible({ timeout: 30_000 });
    // Nav logo covers multiple selector variants across regional Amazon pages.
    await expect(this.navLogo).toBeVisible({ timeout: 10_000 });
  }

  /**
   * Type a query into the search box and submit.
   * Clears the field first to avoid stale text from a previous search.
   */
  async searchFor(query: string): Promise<void> {
    await expect(this.searchBox).toBeEditable();
    await this.searchBox.clear();
    await this.searchBox.fill(query);
    await expect(this.searchBox).toHaveValue(query);
    await this.searchButton.click();
  }

  /** Read the badge count on the cart icon (e.g. "0"). */
  async getCartCount(): Promise<string> {
    await expect(this.cartCount).toBeVisible();
    return (await this.cartCount.textContent()) ?? '0';
  }

  /** Assert the homepage URL matches the base URL. */
  async verifyOnHomePage(): Promise<void> {
    await this.assertUrl(/amazon\.(in|com|co\.uk)/);
    await expect(this.searchBox).toBeVisible();
  }
}
