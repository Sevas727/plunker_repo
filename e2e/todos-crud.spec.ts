import { test, expect } from '@playwright/test';

// These tests use the authenticated user storageState from setup
// The user is user@fedotov.dev (regular user) who sees only their own todos

test.describe('Todos CRUD', () => {
  test.describe.configure({ mode: 'serial' });

  let uniqueTitle: string;
  let updatedTitle: string;

  test.beforeAll(() => {
    uniqueTitle = `E2E Todo ${Date.now()}`;
    updatedTitle = `Updated ${uniqueTitle}`;
  });

  test('displays todos dashboard with cards', async ({ page }) => {
    await page.goto('/todos');
    await expect(page.locator('h1', { hasText: 'Todos' })).toBeVisible();

    // Dashboard cards should be visible (look for card headings)
    await expect(page.locator('h3', { hasText: 'Total Todos' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Pending' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Completed' })).toBeVisible();
  });

  test('navigates to create form and back', async ({ page }) => {
    await page.goto('/todos');

    // Click "Create Todo" link
    await page.getByRole('link', { name: /create todo/i }).click();
    await expect(page).toHaveURL(/\/todos\/create/, { timeout: 10_000 });

    // Click "Cancel" to go back
    await page.getByRole('link', { name: /cancel/i }).click();
    await expect(page).toHaveURL(/\/todos$/);
  });

  test('create form has required title field', async ({ page }) => {
    await page.goto('/todos/create');
    const titleInput = page.getByLabel('Title');
    await expect(titleInput).toBeVisible();
    await expect(titleInput).toHaveAttribute('required', '');
  });

  test('creates a new todo', async ({ page }) => {
    await page.goto('/todos/create');

    await page.getByLabel('Title').fill(uniqueTitle);
    await page.getByLabel('Description').fill('Created by Playwright E2E test');
    await page.getByRole('button', { name: /create todo/i }).click();

    // Should redirect back to /todos
    await expect(page).toHaveURL(/\/todos/, { timeout: 20_000 });

    // New todo should appear in the table (desktop viewport)
    await expect(page.locator('table').getByText(uniqueTitle)).toBeVisible({ timeout: 10_000 });
  });

  test('edits an existing todo', async ({ page }) => {
    await page.goto('/todos');

    // Wait for our todo to be visible in the table
    await expect(page.locator('table').getByText(uniqueTitle)).toBeVisible({ timeout: 10_000 });

    // Find the edit link in the table row (desktop) or card (mobile)
    const desktopEditLink = page
      .locator('tr', { has: page.getByText(uniqueTitle, { exact: true }) })
      .getByRole('link')
      .first();

    const mobileEditLink = page
      .locator('div.rounded-md.bg-white', { has: page.getByText(uniqueTitle, { exact: true }) })
      .getByRole('link')
      .first();

    if (await desktopEditLink.isVisible()) {
      await desktopEditLink.click();
    } else {
      await mobileEditLink.click();
    }

    await expect(page).toHaveURL(/\/todos\/.*\/edit/, { timeout: 10_000 });

    // Clear and update the title
    const titleInput = page.getByLabel('Title');
    await titleInput.clear();
    await titleInput.fill(updatedTitle);

    // Set status to completed
    await page.getByLabel('Completed').check();

    await page.getByRole('button', { name: /update todo/i }).click();

    // Should redirect back to /todos
    await expect(page).toHaveURL(/\/todos/, { timeout: 20_000 });

    // Updated title should be visible in the table
    await expect(page.locator('table').getByText(updatedTitle)).toBeVisible({ timeout: 10_000 });
  });

  test('deletes a todo', async ({ page }) => {
    await page.goto('/todos');

    // Wait for our updated todo to be visible in the table
    await expect(page.locator('table').getByText(updatedTitle)).toBeVisible({ timeout: 10_000 });

    // Find the delete button in the table row or card
    const desktopDeleteBtn = page
      .locator('tr', { has: page.getByText(updatedTitle, { exact: true }) })
      .getByRole('button', { name: /delete/i });

    const mobileDeleteBtn = page
      .locator('div.rounded-md.bg-white', { has: page.getByText(updatedTitle, { exact: true }) })
      .getByRole('button', { name: /delete/i });

    if (await desktopDeleteBtn.isVisible()) {
      await desktopDeleteBtn.click();
    } else {
      await mobileDeleteBtn.click();
    }

    // Wait for the todo to disappear from the table
    await expect(page.locator('table').getByText(updatedTitle)).not.toBeVisible({
      timeout: 15_000,
    });
  });
});
