import { test, expect } from '@playwright/test';

const baseURL = process.env.BASE_URL ?? 'https://rinovabd.com';

test.describe('Rinova storefront visual proof', () => {
  test('desktop home is stable and public', async ({ page }) => {
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    await expect(page).toHaveTitle(/Rinova BD/i);
    await expect(page).toHaveScreenshot('storefront-home.desktop.png', {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixels: 120,
    });
  });

  test('mobile home has no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);
    await expect(page).toHaveScreenshot('storefront-home.mobile.png', {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixels: 120,
    });
  });
});

// This example intentionally does not log in, submit payment, or save auth state.
// Use a scrubbed staging fixture for protected/admin screenshots.
