import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.use({ storageState: { cookies: [], origins: [] } }); // unauthenticated

  test('redirects unauthenticated user from /todos to /login', async ({ page }) => {
    await page.goto('/todos');
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test('login page renders correctly', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Please log in to continue.')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /log in/i })).toBeVisible();
    // "Register" link inside the form
    await expect(page.getByRole('main').getByRole('link', { name: /register/i })).toBeVisible();
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('wrong@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: /log in/i }).click();

    await expect(page.getByText(/invalid credentials/i)).toBeVisible({ timeout: 15_000 });
  });

  test('successful login redirects to /todos', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('user@fedotov.dev');
    await page.getByLabel('Password').fill('123456');
    await page.getByRole('button', { name: /log in/i }).click();

    await expect(page).toHaveURL(/\/todos/, { timeout: 20_000 });
    await expect(page.locator('h1', { hasText: 'Todos' })).toBeVisible();
  });

  test('register page renders correctly', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByText('Create an account')).toBeVisible();
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /register/i })).toBeVisible();
  });

  test('redirects authenticated user from /login to /todos', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: 'e2e/.auth/user.json',
    });
    const page = await context.newPage();

    await page.goto('/login');
    await expect(page).toHaveURL(/\/todos/, { timeout: 10_000 });

    await context.close();
  });
});
