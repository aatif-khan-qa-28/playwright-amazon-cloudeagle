/**
 * Product Detail Page Locators
 */
export const ProductPageLocators = {
  /* Product identity */
  productTitle: 'span#productTitle',
  // All candidates are scoped inside the buy box (#buybox / #centerCol) to avoid
  // picking up MRP/strikethrough prices elsewhere on the page.
  // Read via evaluate(el => el.textContent) — never toBeVisible() — because
  // .a-offscreen is intentionally CSS-hidden (screen-reader text).
  productPrice: [
    // Deal / current price — "base-price" data attribute marks the paying price, not MRP
    '#buybox .apexPriceToPay .a-offscreen',
    '#buybox .a-price:not(.a-text-price) .a-offscreen', // excludes MRP (.a-text-price)
    '#corePriceDisplay_desktop_feature_div .a-price:not(.a-text-price) .a-offscreen',
    '#corePrice_feature_div .a-price:not(.a-text-price) .a-offscreen',
    '#priceblock_ourprice',
    '#priceblock_dealprice',
    '#price_inside_buybox',
    '#price',
  ].join(', '),
  productRating: 'span.a-icon-alt',
  availability: '#availability span',

  /* Quantity selector */
  quantityDropdown: '#quantity',

  /* Add-to-cart flow */
  addToCartButton: '#add-to-cart-button',

  /* Post-ATC confirmation side panel */
  addToCartConfirmation: '#NATC_SMART_WAGON_CONF_MSG_SUCCESS, #huc-v2-order-row-confirm-text',

  /* Subtotal shown in the ATC side-sheet */
  cartSubtotal: '.sw-subtotal-amount, #sw-subtotal',

  /* "Go to Cart" CTA in the ATC side-sheet */
  goToCartButton: '#sw-gtc .a-button-input, #sw-gtc input[type="submit"], #sw-gtc a[href*="/cart"]',

  /* "Buy Now" (alternative flow, not used in main spec) */
  buyNowButton: '#buy-now-button',
} as const;
