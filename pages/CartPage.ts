import { expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { CartPageLocators } from '../locators/CartPageLocators';
import { parseCurrencyAmount } from '../utils';

export class CartPage extends BasePage {
  private readonly cartHeading = this.page.locator(CartPageLocators.cartHeading);
  private readonly cartItems = this.page.locator(CartPageLocators.cartItem);
  private readonly orderSubtotal = this.page.locator(CartPageLocators.orderSubtotal);
  private readonly emptyCartMessage = this.page.locator(CartPageLocators.emptyCartMessage);

  /**
   * Assert we are on the Shopping Cart page:
   * - URL contains /cart
   * - "Shopping Cart" heading is visible
   * - Cart is NOT empty
   */
  async verifyShoppingCartOpen(): Promise<void> {
    await this.assertUrl(/\/cart/, 20_000);
    await expect(this.cartHeading).toBeVisible({ timeout: 15_000 });
    await expect(this.emptyCartMessage).not.toBeVisible();
  }

  /**
   * Assert that the cart is empty (used as a negative assertion after clearCart
   * or for the empty-cart negative test scenario).
   */
  async verifyCartIsEmpty(): Promise<void> {
    await this.assertUrl(/\/cart/, 20_000);
    await expect(this.emptyCartMessage).toBeVisible({ timeout: 15_000 });
  }

  /**
   * Assert that a cart line item matching any fragment of `productName` is present
   * and that its quantity field shows the expected value.
   *
   * Amazon renders full variant titles in the cart (e.g. "PUMA | Melanite Slip On Men's
   * Sneakers | Black-White | 8UK") which rarely matches the short PDP title exactly.
   * We split productName into words and match if ANY word appears in the item text.
   */
  async verifyItemInCart(productName: string, expectedQuantity: string): Promise<void> {
    // Build a regex that matches any word from the product name (case-insensitive)
    const words = productName.split(/\s+/).filter((w) => w.length > 2); // skip tiny words
    const pattern = new RegExp(words.join('|'), 'i');
    const item = this.cartItems.filter({ hasText: pattern }).first();
    await expect(item, `Cart item matching "${productName}" should be visible`).toBeVisible({
      timeout: 15_000,
    });

    // Amazon renders quantity as a hidden <input type="number"> — do NOT assert visibility.
    // inputValue() works on hidden inputs; evaluate() reads the DOM value directly.
    const qtyField = item.locator(CartPageLocators.itemQuantity).first();
    const actualQty = await qtyField.evaluate(
      (el: HTMLInputElement | HTMLSelectElement) => el.value,
    );

    expect(actualQty.trim(), `Expected quantity ${expectedQuantity}, got ${actualQty}`).toBe(
      expectedQuantity,
    );
  }

  /**
   * Return the number of distinct line items in the cart.
   */
  async getCartItemCount(): Promise<number> {
    await expect(this.cartHeading).toBeVisible();
    return this.cartItems.count();
  }

  /**
   * Return the order subtotal as a numeric amount (strips currency symbols).
   */
  async getOrderSubtotal(): Promise<number> {
    await expect(this.orderSubtotal.first()).toBeVisible({ timeout: 10_000 });
    const raw = (await this.orderSubtotal.first().textContent()) ?? '';
    return parseCurrencyAmount(raw);
  }

  /**
   * Assert that the order subtotal is a positive number (sanity check
   * that the price section rendered correctly).
   */
  async verifySubtotalIsPositive(): Promise<void> {
    const amount = await this.getOrderSubtotal();
    expect(amount, 'Cart order subtotal should be a positive number').toBeGreaterThan(0);
  }

  /**
   * Assert the cart contains exactly `count` distinct line items.
   * Uses [data-asin] nodes only to avoid counting Amazon's hidden/placeholder rows.
   */
  async verifyItemCount(count: number): Promise<void> {
    await expect(this.cartHeading).toBeVisible();
    const actual = await this.page.locator(CartPageLocators.activeCartItem).count();
    expect(actual, `Expected ${count} cart item(s), found ${actual}`).toBe(count);
  }

  /**
   * Assert the cart subtotal equals unitPrice × quantity (within ±10 for rounding).
   */
  async verifySubtotalIsDouble(unitPrice: number, quantity: number): Promise<void> {
    const subtotal = await this.getOrderSubtotal();
    const expected = unitPrice * quantity;
    expect(
      subtotal,
      `Subtotal ₹${subtotal} should equal unit price ₹${unitPrice} × ${quantity} = ₹${expected}`,
    ).toBeCloseTo(expected, -1); // tolerance of ±10 to handle minor price fluctuations
  }

  /**
   * Navigate to the cart and delete all items so the test starts with a clean slate.
   * Uses waitForResponse instead of arbitrary sleep() to detect when each delete settles.
   * Safe to call even if the cart is already empty.
   */
  async clearCart(): Promise<void> {
    await this.goto('/cart', 'domcontentloaded');

    const deleteButtons = this.page.locator(CartPageLocators.deleteItemLink);

    while ((await deleteButtons.count()) > 0) {
      // Wait for the cart-update network response so we know the DOM has refreshed
      await Promise.all([
        this.page.waitForResponse(
          (res) =>
            res.url().includes('/cart') &&
            (res.status() === 200 || res.status() === 302),
          { timeout: 10_000 },
        ),
        deleteButtons.first().click(),
      ]);
    }
  }
}
