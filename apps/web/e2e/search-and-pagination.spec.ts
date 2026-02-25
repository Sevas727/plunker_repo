import { test, expect } from '@playwright/test';

// These tests use the authenticated user storageState from setup
// User is user@fedotov.dev — sees only their own todos:
//   'Deploy to AWS', 'Implement dark mode', 'Configure Kubernetes',
//   'Build REST API', 'Improve accessibility'
// With ITEMS_PER_PAGE=6, all 5 fit on one page (no pagination for this user)

test.describe('Search and Pagination', () => {
  test('search input is present and updates URL', async ({ page }) => {
    await page.goto('/todos');

    const searchInput = page.getByPlaceholder('Search todos...');
    await expect(searchInput).toBeVisible();

    // Type a search term
    await searchInput.fill('Deploy');

    // Wait for debounce (300ms) and URL update
    await expect(page).toHaveURL(/query=Deploy/, { timeout: 5_000 });
  });

  test('search filters todos by title', async ({ page }) => {
    await page.goto('/todos');
    await expect(page.locator('h1', { hasText: 'Todos' })).toBeVisible();

    const searchInput = page.getByPlaceholder('Search todos...');
    await searchInput.fill('Deploy');

    await expect(page).toHaveURL(/query=Deploy/, { timeout: 5_000 });

    // Should show the matching todo in the table (desktop viewport)
    await expect(page.locator('table').getByText('Deploy to AWS')).toBeVisible({ timeout: 10_000 });

    // Other todos should not be visible
    await expect(page.locator('table').getByText('Implement dark mode')).not.toBeVisible();
  });

  test('search for non-existent term shows empty results', async ({ page }) => {
    await page.goto('/todos');

    const searchInput = page.getByPlaceholder('Search todos...');
    await searchInput.fill('xyznonexistent999');

    await expect(page).toHaveURL(/query=xyznonexistent999/, { timeout: 5_000 });

    // Wait for results to load
    await page.waitForTimeout(1500);

    // Known user todos should not be visible
    await expect(page.getByText('Deploy to AWS')).not.toBeVisible();
    await expect(page.getByText('Build REST API')).not.toBeVisible();
  });

  test('clearing search shows more results', async ({ page }) => {
    // Start with a search filter that returns 1 result
    await page.goto('/todos?query=Deploy');

    await expect(page.locator('table').getByText('Deploy to AWS')).toBeVisible({ timeout: 10_000 });

    // Count filtered rows (should be 1)
    const filteredCount = await page.locator('table tbody tr').count();

    // Clear the search
    const searchInput = page.getByPlaceholder('Search todos...');
    await searchInput.click();
    await searchInput.fill('');

    // URL should no longer have query=Deploy
    await expect(page).not.toHaveURL(/query=Deploy/, { timeout: 10_000 });

    // After clearing, the table should show more rows than the filtered view
    await expect(async () => {
      const allCount = await page.locator('table tbody tr').count();
      expect(allCount).toBeGreaterThan(filteredCount);
    }).toPass({ timeout: 15_000 });
  });

  test('search resets page to 1', async ({ page }) => {
    // Even if navigating to page 2 (which may not exist for this user),
    // searching should reset the page param
    await page.goto('/todos?page=2');

    const searchInput = page.getByPlaceholder('Search todos...');
    await searchInput.fill('REST');

    await expect(page).toHaveURL(/query=REST/, { timeout: 5_000 });

    // The page param should be 1 or absent
    const url = new URL(page.url());
    const pageParam = url.searchParams.get('page');
    expect(!pageParam || pageParam === '1').toBeTruthy();
  });

  test('search is case-insensitive', async ({ page }) => {
    await page.goto('/todos');

    const searchInput = page.getByPlaceholder('Search todos...');
    await searchInput.fill('deploy');

    await expect(page).toHaveURL(/query=deploy/, { timeout: 5_000 });

    // Should still find the todo (SQL ILIKE is case-insensitive)
    await expect(page.locator('table').getByText('Deploy to AWS')).toBeVisible({ timeout: 10_000 });
  });
});
