/**
 * Shopping Cart Page Locators
 */
export const CartPageLocators = {
  /* Cart heading */
  cartHeading: 'h1:has-text("Shopping Cart"), h2:has-text("Shopping Cart")',

  /* Individual cart line items */
  cartItem: '.sc-list-item[data-asin], .sc-list-item-content',

  /* Quantity input/dropdown inside a cart item */
  itemQuantity: '.sc-quantity-textfield, select[name="quantity"]',

  /* Cart subtotal on the right-hand summary panel */
  orderSubtotal: '#sc-subtotal-amount-activecart span, .sc-price-sign',

  /* "Proceed to Buy" CTA */
  proceedToBuyButton: 'input[name="proceedToRetailCheckout"], #sc-buy-box-ptc-button input',

  /* Empty cart state */
  emptyCartMessage: '.sc-your-amazon-cart-is-empty, h2:has-text("Your Amazon Cart is empty")',

  /* Delete / save-for-later links */
  deleteItemLink: 'input[value="Delete"], [data-action="delete"]',

  /* Active cart line items (excludes hidden/placeholder rows) */
  activeCartItem: '.sc-list-item[data-asin]',
} as const;
