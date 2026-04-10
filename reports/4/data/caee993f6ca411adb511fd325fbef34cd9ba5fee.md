# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: amazon-purchase-flow.spec.ts >> Amazon Purchase Flow — hp-smart-tank-printer >> should complete the full purchase flow for "HP Smart Tank 589"
- Location: tests/amazon-purchase-flow.spec.ts:27:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('#twotabsearchtextbox')
Expected: visible
Timeout: 30000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 30000ms
  - waiting for locator('#twotabsearchtextbox')

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - heading "Click the button below to continue shopping" [level=4] [ref=e9]
    - button "Continue shopping" [ref=e18] [cursor=pointer]
  - generic [ref=e21]:
    - link "Conditions of Use & Sale" [ref=e22] [cursor=pointer]:
      - /url: https://www.amazon.in/gp/help/customer/display.html/ref=footer_cou?ie=UTF8&nodeId=200545940
    - link "Privacy Notice" [ref=e23] [cursor=pointer]:
      - /url: https://www.amazon.in/gp/help/customer/display.html/ref=footer_privacy?ie=UTF8&nodeId=200534380
  - generic [ref=e24]: © 1996-2025, Amazon.com, Inc. or its affiliates
```

# Test source

```ts
  1  | import { expect } from '@playwright/test';
  2  | import { BasePage } from './BasePage';
  3  | import { HomePageLocators } from '../locators/HomePageLocators';
  4  | 
  5  | export class HomePage extends BasePage {
  6  |   private readonly searchBox = this.page.locator(HomePageLocators.searchBox);
  7  |   private readonly searchButton = this.page.locator(HomePageLocators.searchButton);
  8  |   private readonly navLogo = this.page.locator(HomePageLocators.navLogo);
  9  |   private readonly cartCount = this.page.locator(HomePageLocators.cartCount);
  10 | 
  11 |   /**
  12 |    * Navigate to the homepage and assert it has fully loaded.
  13 |    * Playwright's auto-waiting handles network idle; we add an explicit
  14 |    * assertion on a visible landmark so the page is ready for interaction.
  15 |    */
  16 |   async navigate(): Promise<void> {
  17 |     // Use networkidle so CI runners (which may get redirects or bot-check pages)
  18 |     // wait for the page to fully settle before asserting landmarks.
  19 |     await this.goto('/', 'domcontentloaded');
  20 |     // Search box is the functional signal that the page loaded correctly.
> 21 |     await expect(this.searchBox).toBeVisible({ timeout: 30_000 });
     |                                  ^ Error: expect(locator).toBeVisible() failed
  22 |     // Use .first() — the navLogo multi-selector can match multiple elements (strict mode violation).
  23 |     await expect(this.navLogo.first()).toBeVisible({ timeout: 10_000 });
  24 |   }
  25 | 
  26 |   /**
  27 |    * Type a query into the search box and submit.
  28 |    * Clears the field first to avoid stale text from a previous search.
  29 |    */
  30 |   async searchFor(query: string): Promise<void> {
  31 |     await expect(this.searchBox).toBeEditable();
  32 |     await this.searchBox.clear();
  33 |     await this.searchBox.fill(query);
  34 |     await expect(this.searchBox).toHaveValue(query);
  35 |     await this.searchButton.click();
  36 |   }
  37 | 
  38 |   /** Read the badge count on the cart icon (e.g. "0"). */
  39 |   async getCartCount(): Promise<string> {
  40 |     await expect(this.cartCount).toBeVisible();
  41 |     return (await this.cartCount.textContent()) ?? '0';
  42 |   }
  43 | 
  44 |   /** Assert the homepage URL matches the base URL. */
  45 |   async verifyOnHomePage(): Promise<void> {
  46 |     await this.assertUrl(/amazon\.(in|com|co\.uk)/);
  47 |     await expect(this.searchBox).toBeVisible();
  48 |   }
  49 | }
  50 | 
```