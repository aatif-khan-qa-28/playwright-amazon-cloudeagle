# playwright-amazon-cloudeagle

Production-ready Playwright E2E test suite for the Amazon India purchase flow, built with TypeScript, a strict three-layer Page Object Model, ESLint/Prettier, and cross-browser CI.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Environment Variables](#environment-variables)
- [Adding New Test Data](#adding-new-test-data)
- [Writing New Tests](#writing-new-tests)
- [CI/CD](#cicd)
- [Troubleshooting](#troubleshooting)

---

## Overview

Data-driven E2E suite that runs the full purchase flow for every product defined in `test-data/data.json`. Currently covers:

| Product           | Search Query    | Quantity |
| ----------------- | --------------- | -------- |
| HP Smart Tank 589 | `HP smart tank` | 2        |

**Spec:** `tests/amazon-purchase-flow.spec.ts` — Tags: `@smoke @e2e`

### Flow (11 steps, repeated per product)

| Step | Description                                                   |
| ---- | ------------------------------------------------------------- |
| 1    | Navigate to Amazon                                            |
| 2    | Search for the configured query                               |
| 3    | Verify search produces results                                |
| 4    | Select the configured product by name                         |
| 5    | Verify product page opens and capture unit price              |
| 6    | Select the configured quantity                                |
| 7    | Click "Add to cart"                                           |
| 8    | Verify cart subtotal appears and equals unit price × quantity |
| 9    | Click "Go to Cart"                                            |
| 10   | Verify Shopping Cart opens                                    |
| 11   | Verify item name and quantity in cart                         |

---

## Tech Stack

| Tool                                 | Version | Purpose                         |
| ------------------------------------ | ------- | ------------------------------- |
| [Playwright](https://playwright.dev) | ^1.59   | Browser automation & assertions |
| TypeScript                           | ES2020  | Type-safe test code             |
| dotenv                               | ^17     | Environment variable management |
| ESLint + `@typescript-eslint`        | ^8      | Static analysis & lint rules    |
| `eslint-plugin-playwright`           | ^2      | Playwright-specific lint rules  |
| Prettier                             | ^3      | Consistent code formatting      |
| GitHub Actions                       | —       | CI/CD pipeline                  |

---

## Architecture

```
Test spec (tests/amazon-purchase-flow.spec.ts)
    │  loops over testCases from test-data/data.json
    │  imports { test, expect } from fixtures/
    ▼
Custom Fixtures (fixtures/index.ts)
    │  injects typed page-object instances per test
    ▼
Page Objects (pages/*.ts)
    │  extends BasePage — shared goto/assertUrl/assertTitle
    │  imports selectors from locators/
    ▼
Locator Constants (locators/*.ts)
    │  pure as-const objects — no logic, no imports
    ▼
Utilities (utils/index.ts)
       pure TypeScript — no Playwright imports
```

### Key design decisions

**1. Three-layer POM**

- **Locators** — pure `as const` selector maps, one file per page. Single source of truth for all selectors.
- **Page Objects** — all browser interaction + assertions. Tests never touch raw Playwright locators.
- **Specs** — read like plain-English user stories via `test.step()`.

**2. `BasePage` abstract class**
All page objects extend `BasePage`, which centralises `goto()`, `assertUrl()`, and `assertTitle()`. No repeated `constructor(private readonly page: Page)` boilerplate.

**3. Custom fixture injection**
`fixtures/index.ts` extends Playwright's `test` with typed page-object properties. Every spec gets all page objects for free — no manual construction.

**4. Deep assertions everywhere**
Every browser action is immediately followed by an assertion on the resulting state. Playwright's built-in auto-retry means zero manual `waitForTimeout` calls.

**5. Data-driven via `test-data/data.json`**
All product-specific values (query, name, nameParts, quantity) live in one file. Adding a new product to the suite requires no code changes — only a new entry in `data.json`.

**6. Robust price extraction**
`getProductPrice()` uses `element.evaluate()` (not `toBeVisible()`) to read `.a-offscreen` elements that Amazon intentionally hides from the viewport but uses for screen readers. It targets only the deal/current price inside `#buybox`, explicitly excluding MRP/strikethrough elements via `:not(.a-text-price)`.

---

## Project Structure

```
playwright-amazon-cloudeagle/
├── .github/
│   └── workflows/
│       └── playwright.yml              # CI: lint → cross-browser E2E
├── fixtures/
│   └── index.ts                        # Custom fixture — injects all page objects
├── locators/
│   ├── HomePageLocators.ts
│   ├── SearchResultsPageLocators.ts
│   ├── ProductPageLocators.ts
│   └── CartPageLocators.ts             # Centralised selectors (single source of truth)
├── pages/
│   ├── BasePage.ts                     # Abstract base: goto, assertUrl, assertTitle
│   ├── HomePage.ts
│   ├── SearchResultsPage.ts
│   ├── ProductPage.ts
│   └── CartPage.ts                     # Page Objects with auto-wait & deep assertions
├── tests/
│   └── amazon-purchase-flow.spec.ts    # Data-driven E2E purchase flow
├── test-data/
│   └── data.json                       # All test inputs — add products here
├── utils/
│   └── index.ts                        # Pure helpers: currency parser, string, env, retry
├── .env                                # Local env vars (gitignored)
├── .env.example                        # Template — copy to .env before first run
├── eslint.config.js                    # ESLint flat config (TypeScript + Playwright plugins)
├── .prettierrc.json                    # Prettier formatting config
├── playwright.config.ts                # Global Playwright configuration
├── tsconfig.json                       # TypeScript compiler options
└── package.json                        # Scripts and dependencies
```

---

## Getting Started

### Prerequisites

- Node.js **24** (LTS)
- npm >= 9

### Install dependencies

```bash
npm install
```

### Install Playwright browsers

```bash
# Install all browsers (required for cross-browser runs)
npx playwright install --with-deps

# Or install only Chromium for local development
npx playwright install chromium --with-deps
```

### Configure environment

```bash
cp .env.example .env
# BASE_URL defaults to https://www.amazon.in — change if needed
```

---

## Running Tests

### By scope

| Command              | Description                                  |
| -------------------- | -------------------------------------------- |
| `npm test`           | Run all tests across all configured browsers |
| `npm run test:smoke` | Smoke suite only (`@smoke` tag)              |
| `npm run test:e2e`   | Full E2E suite (`@e2e` tag)                  |

### By browser

| Command                      | Description                            |
| ---------------------------- | -------------------------------------- |
| `npm run test:chromium`      | Chromium only                          |
| `npm run test:firefox`       | Firefox only                           |
| `npm run test:webkit`        | WebKit / Safari only                   |
| `npm run test:mobile`        | Mobile Chrome (Pixel 7 viewport)       |
| `npm run test:cross-browser` | Chromium + Firefox + WebKit in one run |

### Utilities

| Command               | Description                         |
| --------------------- | ----------------------------------- |
| `npm run test:ui`     | Open Playwright interactive UI mode |
| `npm run test:headed` | Run with visible browser window     |
| `npm run test:report` | Open the last HTML report           |

### Code quality

| Command                | Description                                  |
| ---------------------- | -------------------------------------------- |
| `npm run lint`         | Run ESLint                                   |
| `npm run lint:fix`     | Auto-fix lint issues                         |
| `npm run format`       | Format all files with Prettier               |
| `npm run format:check` | Check formatting without writing             |
| `npm run typecheck`    | TypeScript compiler check                    |
| `npm run ci:check`     | typecheck + lint + format:check (mirrors CI) |

---

## Environment Variables

| Variable   | Default                 | Description                                                            |
| ---------- | ----------------------- | ---------------------------------------------------------------------- |
| `BASE_URL` | `https://www.amazon.in` | Amazon store base URL                                                  |
| `CI`       | —                       | Set automatically by GitHub Actions; enables retries + GitHub reporter |

### GitHub Actions secrets

| Secret     | Description                             |
| ---------- | --------------------------------------- |
| `BASE_URL` | Override the store URL in CI (optional) |

---

## Adding New Test Data

Open `test-data/data.json` and add a new entry to the `testCases` array:

```json
{
  "id": "your-product-id",
  "search": { "query": "your search query" },
  "product": {
    "name": "Exact Product Name",
    "nameParts": ["Word1", "Word2"],
    "quantity": "1",
    "minExpectedResults": 5
  },
  "cart": { "expectedItemCount": 1 }
}
```

- `id` — unique identifier, appears in the test suite name
- `nameParts` — individual words used to match the product on SERP and in the cart (Amazon shows variant titles in cart, not the exact PDP name)
- `quantity` — must be a string; must not exceed Amazon's per-customer limit for that product

No code changes required.

---

## Writing New Tests

### Checklist

1. Add locators in `locators/YourPageLocators.ts`
2. Create a page object in `pages/YourPage.ts` — extend `BasePage`, import locators, expose typed methods with assertions
3. Register a fixture in `fixtures/index.ts`
4. Create a spec in `tests/your-feature.spec.ts` importing from `../fixtures`
5. Tag tests with `@smoke`, `@e2e`, etc. for filtered runs

### Example spec

```typescript
import { test, expect } from '../fixtures';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ cartPage }) => {
    await cartPage.clearCart();
  });

  test('should do something', { tag: ['@smoke', '@e2e'] }, async ({ homePage }) => {
    await test.step('Navigate', async () => {
      await homePage.navigate();
    });
  });
});
```

### Example page object

```typescript
import { expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { YourPageLocators } from '../locators/YourPageLocators';

export class YourPage extends BasePage {
  private readonly someElement = this.page.locator(YourPageLocators.someElement);

  async verifyPageLoaded(): Promise<void> {
    await this.assertUrl(/\/your-path\//);
    await expect(this.someElement).toBeVisible({ timeout: 20_000 });
  }
}
```

---

## CI/CD

The pipeline (`.github/workflows/playwright.yml`) triggers on:

1. **Every push / PR** to `main` or `master`
2. **Nightly at 02:00 UTC** — catches environment drift and external dependency failures
3. **Manual trigger** from the Actions tab — supports optional browser and tag filter inputs

### Pipeline stages

```
lint (typecheck → ESLint → Prettier)
    └── test (matrix: chromium | firefox | webkit — parallel, fail-fast: false)
```

- Node.js pinned to **24** for reproducibility
- Each browser uploads its own HTML report artifact (30-day retention)
- Screenshots, videos, and traces uploaded on failure (7-day retention)

---

## Troubleshooting

### Product not found on SERP

Amazon's search ranking changes frequently. Update `nameParts` in `data.json` to match words that reliably appear in current search results for your query.

### Cart item not matching

Amazon renders full variant titles in cart, not the short PDP name. The `verifyItemInCart()` method matches by individual words from `nameParts` — ensure at least one `namePart` word is distinctive enough to identify the product.

### Cart subtotal mismatch

`verifySubtotalIsDouble()` uses ±10 tolerance (`toBeCloseTo(expected, -1)`). For significantly different prices, widen the tolerance in [pages/CartPage.ts](pages/CartPage.ts). Note: Amazon applies deal prices at checkout which may differ from the PDP display price.

### Price reads as 0 or NaN

The price locator targets `.a-offscreen` elements inside `#buybox` excluding `.a-text-price` (MRP). If Amazon changes their DOM, inspect the live page and update `ProductPageLocators.productPrice` in [locators/ProductPageLocators.ts](locators/ProductPageLocators.ts).

### Tests pass locally but fail on CI

1. GitHub Actions runners use US/EU IPs — Amazon India may serve different content or block the request. Set the `BASE_URL` secret to a different store if needed.
2. Open the trace artifact: `npx playwright show-trace trace.zip`
3. Check the HTML report artifact uploaded by each browser job.

### `clearCart()` times out

The delete button selector may have changed. Check `CartPageLocators.deleteItemLink` in [locators/CartPageLocators.ts](locators/CartPageLocators.ts) against the live cart DOM.
