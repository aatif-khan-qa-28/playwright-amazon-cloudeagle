import { Page, expect } from '@playwright/test';

/**
 * Base class for all Page Objects.
 *
 * Centralises:
 *   - The `page` dependency (avoids repeating `constructor(private readonly page: Page)` everywhere)
 *   - Common navigation helpers
 *   - Shared assertion utilities (URL pattern, title, load state)
 *
 * All Page Objects extend this class and call `super(page)`.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /**
   * Navigate to a path relative to `baseURL` and wait for the DOM to be ready.
   * Override in subclasses that need custom waitUntil behaviour.
   */
  protected async goto(path: string, waitUntil: 'domcontentloaded' | 'load' | 'networkidle' = 'domcontentloaded'): Promise<void> {
    await this.page.goto(path, { waitUntil });
  }

  /**
   * Assert the current URL matches the given pattern.
   */
  protected async assertUrl(pattern: string | RegExp, timeout = 20_000): Promise<void> {
    await expect(this.page).toHaveURL(pattern, { timeout });
  }

  /**
   * Assert the page <title> contains the given text.
   */
  protected async assertTitle(text: string | RegExp): Promise<void> {
    await expect(this.page).toHaveTitle(text);
  }

  /**
   * Return the current page URL.
   */
  get currentUrl(): string {
    return this.page.url();
  }
}
