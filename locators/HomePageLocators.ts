/**
 * Home Page Locators
 * Prefer ARIA / data-* selectors over fragile CSS classes.
 */
export const HomePageLocators = {
  /* Search bar */
  searchBox: '#twotabsearchtextbox',
  searchButton: '#nav-search-submit-button',

  /* Nav */
  navLogo: '#nav-logo-sprites',
  cartCount: '#nav-cart-count',
  accountMenu: '#nav-link-accountList',

  /* Deals / homepage widgets (used for "page loaded" assertion) */
  heroCarousel: '#desktop-banner, #centerized-widget-FeaturedCategories, .a-carousel-row',
} as const;
