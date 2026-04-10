import { expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { ProductPageLocators } from '../locators/ProductPageLocators';
import { parseCurrencyAmount } from '../utils';

export class ProductPage extends BasePage {
  private readonly productTitle = this.page.locator(ProductPageLocators.productTitle);
  private readonly productPrice = this.page.locator(ProductPageLocators.productPrice);
  private readonly availability = this.page.locator(ProductPageLocators.availability);
  private readonly quantityDropdown = this.page.locator(ProductPageLocators.quantityDropdown);
  private readonly addToCartButton = this.page.locator(ProductPageLocators.addToCartButton);
  private readonly addToCartConfirmation = this.page.locator(ProductPageLocators.addToCartConfirmation);
  private readonly cartSubtotal = this.page.locator(ProductPageLocators.cartSubtotal);
  private readonly goToCartButton = this.page.locator(ProductPageLocators.goToCartButton);

  /**
   * Assert we landed on a product detail page:
   * - URL contains /dp/
   * - Product title is visible and non-empty
   * - Add-to-cart button is visible (implies item is purchasable)
   */
  async verifyProductPageOpen(): Promise<void> {
    await this.assertUrl(/\/dp\//);
    await expect(this.productTitle).toBeVisible({ timeout: 20_000 });
    const title = await this.productTitle.textContent();
    expect(title?.trim().length, 'Product title should not be empty').toBeGreaterThan(0);
    await expect(this.addToCartButton).toBeVisible();
  }

  /**
   * Assert the product is currently out of stock by checking the availability section.
   */
  async verifyOutOfStock(): Promise<void> {
    await expect(this.availability).toBeVisible({ timeout: 15_000 });
    const text = (await this.availability.textContent()) ?? '';
    expect(
      text.toLowerCase(),
      `Expected "Currently unavailable" availability, got: "${text}"`,
    ).toMatch(/currently unavailable|out of stock/i);
    await expect(this.addToCartButton).not.toBeVisible();
  }

  /**
   * Assert the page title contains the given fragment (case-insensitive).
   */
  async verifyProductTitleContains(fragment: string): Promise<void> {
    await expect(this.productTitle).toContainText(fragment, { ignoreCase: true });
  }

  /**
   * Return the raw product title string.
   */
  async getProductTitle(): Promise<string> {
    await expect(this.productTitle).toBeVisible();
    return (await this.productTitle.textContent())?.trim() ?? '';
  }

  /**
   * Return the displayed price as a positive number.
   *
   * Amazon renders prices differently across categories (electronics vs. apparel/fashion).
   * Many price elements use `.a-offscreen` which is intentionally CSS-hidden (it exists
   * for screen readers). `toBeVisible()` would always fail on these — we must read them
   * via `evaluate()` which reads the DOM regardless of visibility.
   *
   * Strategy: wait for at least one candidate to be attached to the DOM, then iterate
   * all matches in priority order and return the first that parses to a positive number.
   */
  async getProductPrice(): Promise<number> {
    // Wait for at least one candidate to exist in the DOM (attached, not necessarily visible)
    await this.productPrice.first().waitFor({ state: 'attached', timeout: 15_000 });

    const count = await this.productPrice.count();
    for (let i = 0; i < count; i++) {
      const el = this.productPrice.nth(i);
      // Use evaluate() so CSS-hidden (.a-offscreen) elements are read correctly
      const raw = await el.evaluate((node: Element) => node.textContent ?? '');
      const value = parseCurrencyAmount(raw.trim());
      if (Number.isFinite(value) && value > 0) {
        return value;
      }
    }

    const allTexts = await this.productPrice.evaluateAll((nodes: Element[]) =>
      nodes.map((n) => n.textContent?.trim() ?? ''),
    );
    throw new Error(
      `Could not extract a valid positive price from the product page.\n` +
      `Candidates found (${allTexts.length}): ${JSON.stringify(allTexts)}`,
    );
  }

  /**
   * Select a quantity from the dropdown and assert it was applied.
   */
  async selectQuantity(quantity: string): Promise<void> {
    await expect(this.quantityDropdown).toBeVisible();
    await this.quantityDropdown.selectOption(quantity);
    await expect(this.quantityDropdown).toHaveValue(quantity);
  }

  /**
   * Click "Add to Cart" and wait for the confirmation message to appear
   * so we know Amazon accepted the request before we proceed.
   */
  async clickAddToCart(): Promise<void> {
    await expect(this.addToCartButton).toBeEnabled();
    await this.addToCartButton.click();
    await expect(this.addToCartConfirmation.or(this.cartSubtotal).first()).toBeVisible({
      timeout: 20_000,
    });
  }

  /**
   * Read the subtotal from the ATC side-sheet.
   * Returns the raw string (e.g. "₹14,990") and asserts it's non-empty.
   */
  async getCartSubtotal(): Promise<string> {
    await expect(this.cartSubtotal.first()).toBeVisible({ timeout: 15_000 });
    const text = (await this.cartSubtotal.first().textContent())?.trim() ?? '';
    expect(text.length, 'Cart subtotal should not be empty').toBeGreaterThan(0);
    return text;
  }

  /**
   * Assert the subtotal is a positive amount (numeric sanity check).
   */
  async verifySubtotalIsPositive(): Promise<void> {
    const raw = await this.getCartSubtotal();
    const amount = parseCurrencyAmount(raw);
    expect(amount, `Subtotal "${raw}" should parse to a positive number`).toBeGreaterThan(0);
  }

  /**
   * Click "Go to Cart" in the ATC side-sheet and wait for cart page navigation.
   */
  async clickGoToCart(): Promise<void> {
    await expect(this.goToCartButton.first()).toBeVisible({ timeout: 15_000 });
    await this.goToCartButton.first().click();
    await this.page.waitForURL(/\/cart/, { timeout: 20_000 });
  }
}
