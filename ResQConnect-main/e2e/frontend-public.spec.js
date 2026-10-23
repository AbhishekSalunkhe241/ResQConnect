import { test, expect } from '@playwright/test';

test.describe('Live Frontend Public Pages & Navigation Suite', () => {

  test('1. Homepage loads, displays hero content, and has valid title', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('/');
    await expect(page).toHaveTitle(/ResQConnect/i);

    // Hero headline and subhead
    const heroHeading = page.locator('h1');
    await expect(heroHeading).toBeVisible();
    await expect(heroHeading).toContainText(/Recovery Starts With Connection/i);

    // Key call-to-action buttons
    const ctaGetHelp = page.locator('a[href="/citizen"]').filter({ hasText: /Get Help/i }).first();
    await expect(ctaGetHelp).toBeVisible();

    const ctaVolunteer = page.locator('a[href*="/register"]').filter({ hasText: /Join as Volunteer|Volunteer/i }).first();
    await expect(ctaVolunteer).toBeVisible();

    // Capture desktop homepage screenshot
    const screenshotsDir = 'test-results/screenshots';
    await page.screenshot({ path: `${screenshotsDir}/homepage-desktop.png`, fullPage: false });

    expect(pageErrors).toHaveLength(0);
  });

  test('2. Public navigation links route correctly to main sections', async ({ page }) => {
    await page.goto('/');

    // Navigation links in header
    const navHowItWorks = page.locator('header nav, .navbar, header').locator('a[href*="/how-it-works"]').first();
    await navHowItWorks.click();
    await expect(page).toHaveURL(/.*\/how-it-works/);
    await expect(page.locator('h1, h2').first()).toBeVisible();

    const navRecovery = page.locator('header nav, .navbar, header').locator('a[href*="/recovery"]').first();
    await navRecovery.click();
    await expect(page).toHaveURL(/.*\/recovery/);
    await expect(page.locator('h1, h2').first()).toBeVisible();

    const navAbout = page.locator('header nav, .navbar, header').locator('a[href*="/about"]').first();
    await navAbout.click();
    await expect(page).toHaveURL(/.*\/about/);
    await expect(page.locator('h1, h2').first()).toBeVisible();

    const navLogin = page.locator('header nav, .navbar, header').locator('a[href*="/login"]').first();
    await navLogin.click();
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.locator('h1').filter({ hasText: /Welcome to ResQConnect/i })).toBeVisible();
  });

  test('3. Main public pages load cleanly with zero uncaught JavaScript errors', async ({ page }) => {
    const publicRoutes = ['/', '/how-it-works', '/recovery', '/analytics', '/about', '/login', '/register'];

    for (const route of publicRoutes) {
      const pageErrors = [];
      page.on('pageerror', (err) => pageErrors.push(`[${route}] ${err.message}`));

      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');
      await expect(page.locator('body')).toBeVisible();

      // Ensure no fatal page errors occurred during render
      expect(pageErrors).toEqual([]);
    }
  });

  test('4. Theme switcher toggles light and dark modes and updates HTML attribute immediately', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    const initialTheme = await html.getAttribute('data-theme') || 'light';
    const expectedTarget = initialTheme === 'dark' ? 'light' : 'dark';

    // Theme toggle button
    const themeBtn = page.locator('button[aria-label*="mode" i], button:has-text("mode"), button:has([class*="lucide-moon"]), button:has([class*="lucide-sun"])').first();
    await expect(themeBtn).toBeVisible();
    await themeBtn.click();

    // Verify data-theme attribute switched immediately
    await expect(html).toHaveAttribute('data-theme', expectedTarget);

    // Toggle back
    await themeBtn.click();
    await expect(html).toHaveAttribute('data-theme', initialTheme);
  });

  test('5. 404 Not Found page loads gracefully for non-existent routes', async ({ page }) => {
    await page.goto('/non-existent-page-path-12345');
    await expect(page.locator('h1, h2, p').filter({ hasText: /404|Page Not Found|Looking For Doesn't Exist/i }).first()).toBeVisible();

    // Contains home navigation link
    const backHome = page.locator('a[href="/"]').filter({ hasText: /Home|Back/i }).first();
    await expect(backHome).toBeVisible();
  });
});
