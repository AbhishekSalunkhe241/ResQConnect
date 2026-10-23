import { test, expect } from '@playwright/test';

test.describe('Responsive Layout & Viewport Verification Suite', () => {

  test('1. Desktop layout (1280x720) renders complete desktop navigation without horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');

    // Desktop nav links visible
    const nav = page.locator('header nav, .navbar');
    await expect(nav).toBeVisible();

    // Verify page has no unwanted horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    // Verify key action cards are rendered side-by-side or in responsive grid
    const heroButtons = page.locator('h1').locator('..').locator('a, button');
    await expect(heroButtons.first()).toBeVisible();
  });

  test('2. Mobile layout (375x667) adapts gracefully with mobile menu drawer and no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Verify hero is visible
    await expect(page.locator('h1')).toBeVisible();

    // Verify mobile page width does not induce horizontal scroll on document
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth + 5;
    });
    expect(hasHorizontalOverflow).toBe(false);

    // Capture mobile homepage screenshot
    const screenshotsDir = 'test-results/screenshots';
    await page.screenshot({ path: `${screenshotsDir}/homepage-mobile.png`, fullPage: false });

    // Mobile menu toggle button is visible
    const mobileMenuBtn = page.locator('.mobile-toggle-btn, button[aria-label*="Navigation Menu" i]').first();
    await expect(mobileMenuBtn).toBeVisible();

    // Open mobile menu drawer
    await mobileMenuBtn.click();

    // Drawer links should be visible inside mobile drawer container
    const drawerLink = page.locator('.animate-fade-in a[href*="/how-it-works"]').first();
    await expect(drawerLink).toBeVisible();

    // Theme toggle inside mobile drawer is visible
    const mobileThemeToggle = page.locator('.animate-fade-in').locator('button[aria-label*="mode" i], button:has-text("mode"), button:has([class*="lucide-moon"]), button:has([class*="lucide-sun"])').first();
    await expect(mobileThemeToggle).toBeVisible();

    // Close mobile menu drawer
    await mobileMenuBtn.click();
    await expect(drawerLink).toBeHidden();
  });

  test('3. Mobile login form (375x667) scales cleanly and touch inputs are full-width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');

    const emailInput = page.getByPlaceholder('name@example.com');
    await expect(emailInput).toBeVisible();

    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();

    // Ensure inputs are appropriately sized for mobile touch
    const btnBox = await submitBtn.boundingBox();
    expect(btnBox).not.toBeNull();
    expect(btnBox.width).toBeGreaterThan(250);
    expect(btnBox.height).toBeGreaterThan(36);
  });
});
