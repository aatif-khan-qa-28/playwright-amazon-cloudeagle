/**
 * Feature: Amazon Purchase Flow — Data-Driven
 *
 * Assignment scenario (environment-agnostic), executed for each entry in
 * test-data/data.json so the same 11-step flow validates multiple products
 * without duplicating test code:
 *
 *   1.  Navigate to Amazon
 *   2.  Search for the configured query
 *   3.  Verify search produces results
 *   4.  Select the configured product by name
 *   5.  Verify product page opens
 *   6.  Select the configured quantity
 *   7.  Click "Add to cart"
 *   8.  Verify cart subtotal appears and verify the price
 *   9.  Click "Go to Cart"
 *   10. Verify Shopping Cart opens
 *   11. Verify items in cart — item name and quantity
 */

import { test, expect } from '../fixtures';
import { testCases } from '../test-data/data.json';
import { containsIgnoreCase, parseCurrencyAmount } from '../utils';

for (const td of testCases) {
  test.describe(`Amazon Purchase Flow — ${td.id}`, () => {
    // Guarantee a clean cart before every run so prior state never bleeds in
    test.beforeEach(async ({ cartPage }) => {
      await cartPage.clearCart();
    });

    test(
      `should complete the full purchase flow for "${td.product.name}"`,
      { tag: ['@smoke', '@e2e'] },
      async ({ homePage, searchResultsPage, productPage, cartPage }) => {
        // ── Step 1: Navigate to Amazon ──────────────────────────────────────
        await test.step('Navigate to Amazon homepage', async () => {
          await homePage.navigate();
          await homePage.verifyOnHomePage();
        });

        // ── Step 2: Search ──────────────────────────────────────────────────
        await test.step(`Search for "${td.search.query}"`, async () => {
          await homePage.searchFor(td.search.query);
        });

        // ── Step 3: Verify search produces results ──────────────────────────
        await test.step('Verify search produces results', async () => {
          await searchResultsPage.verifyResultsVisible();
          await searchResultsPage.verifyMinimumResultCount(td.product.minExpectedResults);

          const titles = await searchResultsPage.getResultTitles();
          const hasRelevantResult = titles.some((t) =>
            td.product.nameParts.some((part) => containsIgnoreCase(t, part)),
          );
          expect(
            hasRelevantResult,
            `Expected at least one SERP result to contain one of: ${td.product.nameParts.join(', ')}.\nTitles found:\n${titles.slice(0, 5).join('\n')}`,
          ).toBe(true);
        });

        // ── Step 4: Select product ──────────────────────────────────────────
        await test.step(`Select product: "${td.product.name}"`, async () => {
          await searchResultsPage.selectProductByName(td.product.name, td.product.nameParts);
        });

        // ── Step 5: Verify product page opens ──────────────────────────────
        let unitPrice: number = 0;
        await test.step('Verify product page opens', async () => {
          await productPage.verifyProductPageOpen();

          const productTitle = await productPage.getProductTitle();
          unitPrice = await productPage.getProductPrice();

          const nameMatch = td.product.nameParts.some((part) =>
            containsIgnoreCase(productTitle, part),
          );
          expect(
            nameMatch,
            `Product title "${productTitle}" should contain one of: ${td.product.nameParts.join(', ')}`,
          ).toBe(true);

          expect(
            Number.isFinite(unitPrice) && unitPrice > 0,
            `Product price should be a positive number, got: ${unitPrice}`,
          ).toBe(true);
        });

        // ── Step 6: Select quantity ─────────────────────────────────────────
        await test.step(`Select quantity: ${td.product.quantity}`, async () => {
          await productPage.selectQuantity(td.product.quantity);
        });

        // ── Step 7: Click "Add to cart" ─────────────────────────────────────
        await test.step('Click "Add to cart"', async () => {
          await productPage.clickAddToCart();
        });

        // ── Step 8: Verify cart subtotal appears and verify the price ────────
        await test.step('Verify cart subtotal appears and verify the price', async () => {
          const subtotalText = await productPage.getCartSubtotal();
          const subtotalAmount = parseCurrencyAmount(subtotalText);

          expect(
            Number.isFinite(subtotalAmount) && subtotalAmount > 0,
            `Cart subtotal "${subtotalText}" should parse to a positive number`,
          ).toBe(true);

          const expectedSubtotal = unitPrice * parseInt(td.product.quantity, 10);
          expect(
            subtotalAmount,
            `Subtotal ₹${subtotalAmount} should equal ₹${unitPrice} × ${td.product.quantity} = ₹${expectedSubtotal}`,
          ).toBeCloseTo(expectedSubtotal, -1);
        });

        // ── Step 9: Click "Go to Cart" ──────────────────────────────────────
        await test.step('Click "Go to Cart"', async () => {
          await productPage.clickGoToCart();
        });

        // ── Step 10: Verify Shopping Cart opens ─────────────────────────────
        await test.step('Verify Shopping Cart opens', async () => {
          await cartPage.verifyShoppingCartOpen();
          await cartPage.verifyItemCount(td.cart.expectedItemCount);
        });

        // ── Step 11: Verify items in cart — name and quantity ────────────────
        await test.step(`Verify cart contains "${td.product.name}" with quantity ${td.product.quantity}`, async () => {
          await cartPage.verifyItemInCart(td.product.name, td.product.quantity);
          await cartPage.verifySubtotalIsDouble(unitPrice, parseInt(td.product.quantity, 10));
        });
      },
    );
  });
}
