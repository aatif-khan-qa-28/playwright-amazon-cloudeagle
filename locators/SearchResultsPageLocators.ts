/**
 * Search Results Page Locators
 */
export const SearchResultsPageLocators = {
  /* Individual result cards */
  searchResult: '[data-component-type="s-search-result"]',

  /* Product title link — <a> wraps <h2> in Amazon's DOM, href goes via /sspa/ but contains /dp/ in the url param */
  productLink: 'a.a-link-normal:has(h2)',

  /* Result count text e.g. "1-16 of over 300 results" */
  resultsCount: '[data-component-type="s-result-info-bar"] span, .a-section.a-spacing-small .a-color-state',

  /* "Showing results for" / "Did you mean" message */
  didYouMean: '.a-color-state.a-text-bold',

  /* Product title text spans inside result cards */
  resultTitleSpan: '[data-component-type="s-search-result"] h2 span',

  /* Sort / filter controls (existence confirms SERP loaded) */
  sortDropdown: 'select.a-native-dropdown[name="s-sortby"]',
} as const;
