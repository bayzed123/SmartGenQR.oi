---
title: "11. Playwright Testing and Screenshot Proof"
description: "Rinova BD browser testing, visual regression, screenshot mapping, evidence naming, and secret-safe proof workflow."
order: 12
---

# 11. Playwright Testing and Screenshot Proof

## Why screenshot proof matters

A feature can pass a code review while still failing visually, responsively, or in a real browser. Playwright should verify both behavior and visual output. Its visual comparison API can create a baseline on first run and compare later runs with `toHaveScreenshot()`.[1]

> Generate and review screenshots in the same browser/OS configuration used for baselines. Rendering can vary across operating systems, browser versions, fonts, hardware, and headless settings.[1]

## Test surfaces

| Surface | Screenshots |
|---|---|
| Public home | Desktop and mobile, banner, featured products, chat launcher |
| Category/search | Filtered results, empty state, product cards |
| Product detail | Gallery, stock state, reviews, add-to-bag |
| Bag/checkout | Empty bag, populated bag, validation, quote, error |
| Confirmation/track | Safe order confirmation and tracking states |
| Admin overview | Metrics, alerts, responsive sidebar |
| Admin catalogue | Table, editor, media, validation |
| Admin order | Timeline, payment state, status action, confirmation dialog |
| Admin assistant | Loading, grounded answer, error/fallback, permission scope |

## Screenshot naming map

```text
screenshots/
  storefront-home.desktop.png
  storefront-home.mobile.png
  storefront-search-filtered.desktop.png
  storefront-product-detail.mobile.png
  storefront-checkout-validation.desktop.png
  admin-overview.desktop.png
  admin-order-payment-unknown.desktop.png
  admin-assistant-grounded.desktop.png
  admin-assistant-unauthorized.mobile.png
```

Each screenshot should have a matching test name and a short evidence note. Never include real customer names, phone numbers, addresses, payment references, secrets, session cookies, or signed URLs in screenshots.

## Playwright setup example

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: process.env.BASE_URL ?? 'http://127.0.0.1:8787',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'chromium-mobile', use: { ...devices['iPhone 13'] } },
  ],
});
```

## Functional test examples

```ts
import { test, expect } from '@playwright/test';

test('customer sees verified product cards in chat', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /chat/i }).click();
  await page.getByRole('textbox', { name: /message/i }).fill('I need a gentle cleanser');
  await page.getByRole('button', { name: /send/i }).click();
  await expect(page.getByTestId('chat-product-card').first()).toBeVisible();
  await expect(page.getByTestId('chat-message').last()).not.toContainText('api_key');
});

test('admin route rejects anonymous access', async ({ request }) => {
  const response = await request.post('/api/admin/chat', {
    data: { messages: [{ role: 'user', content: 'Show low stock' }] },
  });
  expect([401, 403]).toContain(response.status());
});
```

## Visual proof examples

```ts
import { test, expect } from '@playwright/test';

test('home visual baseline', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('storefront-home.desktop.png', {
    animations: 'disabled',
    caret: 'hide',
    maxDiffPixels: 120,
  });
});
```

Use a screenshot stylesheet or stable fixtures to hide timestamps, rotating banners, random visitor IDs, analytics widgets, and external provider content. Update a baseline only after a human reviews the diff.

## Mapping proof

A screenshot is proof only when it maps to a requirement. Maintain a mapping table:

| Requirement | Test | Screenshot/evidence |
|---|---|---|
| Public customer cannot see admin content | `customer-no-admin.spec.ts` | `customer-safe-navigation.desktop.png` |
| Product card uses current server data | `product-card-price.spec.ts` | `storefront-product-detail.mobile.png` |
| Admin metrics show range/source | `admin-overview.spec.ts` | `admin-overview.desktop.png` |
| Order unknown state is visible | `admin-order-status.spec.ts` | `admin-order-payment-unknown.desktop.png` |
| Customer chat avoids internal sources | `chat-boundary.spec.ts` | `admin-assistant-unauthorized.mobile.png` |
| Keyboard focus is visible | `accessibility.spec.ts` | Focus trace and screenshot |

## CI sequence

```bash
pnpm install --frozen-lockfile
pnpm test
npx playwright install --with-deps chromium
BASE_URL=https://staging.example.test npx playwright test
```

Do not put production credentials in CI logs. Use CI secret storage and a scrubbed staging dataset. Upload traces and screenshots only when they contain no private data. Keep approved baseline images in the repository or secure artifact store according to the project’s policy.

## References

[1]: https://playwright.dev/docs/test-snapshots "Playwright visual comparisons"
[2]: https://playwright.dev/docs/test-assertions "Playwright assertions"
