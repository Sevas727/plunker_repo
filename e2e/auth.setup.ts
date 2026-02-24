import { test as setup, expect } from '@playwright/test';

const USER_FILE = 'e2e/.auth/user.json';

setup('authenticate as user', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@fedotov.dev');
  await page.getByLabel('Password').fill('123456');
  await page.getByRole('button', { name: /log in/i }).click();

  // Wait for redirect to /todos
  await expect(page).toHaveURL(/\/todos/);

  await page.context().storageState({ path: USER_FILE });
});
