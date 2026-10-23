import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Calculates relative luminance from RGB array according to WCAG 2.1 specs
 */
function getRelativeLuminance([r, g, b]) {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculates WCAG 2.1 contrast ratio between two [r, g, b] colors
 */
function getContrastRatio(rgb1, rgb2) {
  const l1 = getRelativeLuminance(rgb1);
  const l2 = getRelativeLuminance(rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Parses CSS rgb/rgba string into [r, g, b] array
 */
function parseRgb(colorStr) {
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!match) return [0, 0, 0];
  return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10)];
}

test.describe('Authentication & Contrast Verification Suite', () => {

  test('1. Login page loads all intended demo roles and form controls', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('h1').filter({ hasText: /Welcome to ResQConnect/i })).toBeVisible();

    // Verify all 4 demo persona selector buttons exist
    const citizenRoleBtn = page.locator('button').filter({ hasText: /Citizen/i }).first();
    const volunteerRoleBtn = page.locator('button').filter({ hasText: /Volunteer/i }).first();
    const ngoRoleBtn = page.locator('button').filter({ hasText: /Relief NGO/i }).first();
    const adminRoleBtn = page.locator('button').filter({ hasText: /Admin/i }).first();

    await expect(citizenRoleBtn).toBeVisible();
    await expect(volunteerRoleBtn).toBeVisible();
    await expect(ngoRoleBtn).toBeVisible();
    await expect(adminRoleBtn).toBeVisible();

    // Form inputs exist
    await expect(page.getByPlaceholder('name@example.com')).toBeVisible();
    await expect(page.getByPlaceholder('••••••••')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('2. Invalid login submission is safely rejected with descriptive error banner', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('name@example.com').fill('nonexistent_user@example.com');
    await page.getByPlaceholder('••••••••').fill('WrongPassword999!');

    await page.locator('button[type="submit"]').click();

    // Rejection can be 401 Invalid credentials or 429 Throttled, both indicate proper rejection
    const errorAlert = page.locator('div').filter({ hasText: /Invalid email or password|Too many authentication attempts/i }).first();
    await expect(errorAlert).toBeVisible({ timeout: 15000 });
  });

  test('3. Notifications screen theme contrast verification in Light and Dark modes', async ({ page }) => {
    // Ensure screenshot directory exists
    const screenshotsDir = path.resolve('test-results/screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    // Navigate to notifications screen
    await page.goto('/citizen/notifications');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').filter({ hasText: /Notifications/i }).first()).toBeVisible();

    // Ensure light mode is active for baseline check
    const html = page.locator('html');
    const currentTheme = await html.getAttribute('data-theme');
    if (currentTheme === 'dark') {
      const toggle = page.locator('button[aria-label*="mode" i], button:has-text("mode"), button:has([class*="lucide-moon"]), button:has([class*="lucide-sun"])').first();
      await toggle.click();
      await expect(html).toHaveAttribute('data-theme', 'light');
    }

    // Settle entry fade-in animations before capture
    await page.waitForTimeout(500);

    // Verify Light Mode Header Contrast
    const lightHeading = page.locator('h1').filter({ hasText: /Notifications & Alerts/i }).first();
    const lightStyles = await lightHeading.evaluate((el) => {
      const comp = window.getComputedStyle(el);
      const bg = window.getComputedStyle(document.body).backgroundColor;
      return { color: comp.color, bg };
    });
    const lightHeadingRgb = parseRgb(lightStyles.color);
    const lightBgRgb = parseRgb(lightStyles.bg);
    const lightContrast = getContrastRatio(lightHeadingRgb, lightBgRgb);
    console.log(`[Light Mode Header Contrast]: ${lightContrast.toFixed(2)}:1`);
    expect(lightContrast).toBeGreaterThanOrEqual(4.5);

    // Capture Light Mode Screenshot
    const lightScreenshotPath = path.join(screenshotsDir, 'notifications-light.png');
    await page.screenshot({ path: lightScreenshotPath, fullPage: false });
    expect(fs.existsSync(lightScreenshotPath)).toBe(true);

    // Switch to Dark Mode
    const themeToggle = page.locator('button[aria-label*="mode" i], button:has-text("mode"), button:has([class*="lucide-moon"]), button:has([class*="lucide-sun"])').first();
    await themeToggle.click();
    await expect(html).toHaveAttribute('data-theme', 'dark');

    // Wait for CSS transitions to settle
    await page.waitForTimeout(500);

    // Verify Dark Mode Header Contrast
    const heading = page.locator('h1').filter({ hasText: /Notifications & Alerts/i }).first();
    await expect(heading).toBeVisible();

    const headingStyles = await heading.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      const parentBg = window.getComputedStyle(document.body).backgroundColor;
      return {
        color: computed.color,
        bg: parentBg,
      };
    });

    const headingRgb = parseRgb(headingStyles.color);
    const bgRgb = parseRgb(headingStyles.bg);
    const darkContrast = getContrastRatio(headingRgb, bgRgb);
    console.log(`[Dark Mode Header Contrast]: ${darkContrast.toFixed(2)}:1`);
    expect(darkContrast).toBeGreaterThanOrEqual(4.5);

    // Verify Active Filter Tab Contrast in Dark Mode
    const activeTab = page.locator('button:has-text("All (")').first();
    await expect(activeTab).toBeVisible();

    const tabStyles = await activeTab.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        backgroundColor: computed.backgroundColor,
        color: computed.color,
      };
    });

    const tabBgRgb = parseRgb(tabStyles.backgroundColor);
    const tabColorRgb = parseRgb(tabStyles.color);

    // Ensure active tab in dark mode does NOT have a blinding white/light-blue background
    const isTabHardcodedLight = tabBgRgb[0] > 230 && tabBgRgb[1] > 240 && tabBgRgb[2] > 240;
    expect(isTabHardcodedLight).toBe(false);

    const tabContrast = getContrastRatio(tabColorRgb, tabBgRgb);
    console.log(`[Dark Mode Active Tab Contrast]: ${tabContrast.toFixed(2)}:1`);
    expect(tabContrast).toBeGreaterThanOrEqual(3.5);

    // Verify Notification Bell Control in Topbar
    const bellBtn = page.locator('.notification-bell-btn, button:has([class*="lucide-bell"])').first();
    await expect(bellBtn).toBeVisible();

    const bellStyles = await bellBtn.evaluate((el) => {
      const comp = window.getComputedStyle(el);
      return {
        backgroundColor: comp.backgroundColor,
        borderColor: comp.borderColor,
      };
    });
    expect(bellStyles).toBeDefined();

    // Capture Dark Mode Screenshot
    const darkScreenshotPath = path.join(screenshotsDir, 'notifications-dark.png');
    await page.screenshot({ path: darkScreenshotPath, fullPage: false });
    expect(fs.existsSync(darkScreenshotPath)).toBe(true);

    // Verify Sidebar Active Item text is visible (not invisible dark-on-dark)
    const sidebarActiveItem = page.locator('aside a.active, aside nav a[style*="font-weight"]').first();
    if (await sidebarActiveItem.count() > 0) {
      const itemColor = await sidebarActiveItem.evaluate((el) => window.getComputedStyle(el).color);
      const itemRgb = parseRgb(itemColor);
      // Ensure active item is bright (e.g. #FFFFFF or bright text)
      expect(itemRgb[0] + itemRgb[1] + itemRgb[2]).toBeGreaterThan(300);
    }
  });
});
