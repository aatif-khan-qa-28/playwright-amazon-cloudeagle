/**
 * Home Page Locators
 * Prefer ARIA / data-* selectors over fragile CSS classes.
 */
export const HomePageLocators = {
  /* Search bar */
  searchBox: '#twotabsearchtextbox',
  searchButton: '#nav-search-submit-button',

  /* Nav — multiple selectors cover different Amazon regional/bot-check layouts */
  navLogo: '#nav-logo-sprites, #nav-logo, .nav-logo-link, [aria-label="Amazon"], #navbar',
  cartCount: '#nav-cart-count',
  accountMenu: '#nav-link-accountList',

  /* Deals / homepage widgets (used for "page loaded" assertion) */
  heroCarousel: '#desktop-banner, #centerized-widget-FeaturedCategories, .a-carousel-row',
} as const;
