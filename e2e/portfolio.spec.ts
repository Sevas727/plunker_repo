import { test, expect } from '@playwright/test';

// Portfolio pages are public — no authentication required
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Home Page', () => {
  test('renders hero section with name and description', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('FULL-STACK DEVELOPER')).toBeVisible();
    await expect(page.getByText('Fedotov Vsevolod')).toBeVisible();
    await expect(page.getByText(/Building scalable web & mobile applications/)).toBeVisible();
  });

  test('hero has GitHub link', async ({ page }) => {
    await page.goto('/');

    const githubLink = page.getByRole('link', {
      name: /github\.com\/Sevas727\/plunker_repo/,
    });
    await expect(githubLink).toBeVisible();
    await expect(githubLink).toHaveAttribute('href', 'https://github.com/Sevas727/plunker_repo');
  });

  test('hero has Contact Me and View Todo Demo buttons', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('link', { name: 'Contact Me' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'View Todo Demo' })).toBeVisible();
  });

  test('renders PORTFOLIO section with project count', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('PORTFOLIO')).toBeVisible();
    await expect(page.locator('h2', { hasText: 'Projects' })).toBeVisible();
    // Should show project count badge (e.g. "14 projects")
    await expect(page.getByText(/\d+ projects/)).toBeVisible();
  });

  test('renders project cards in grid', async ({ page }) => {
    await page.goto('/');

    // At least some known project titles should be visible
    await expect(page.locator('h3', { hasText: 'Hoglands' })).toBeVisible();
  });

  test('project card links to project detail page', async ({ page }) => {
    await page.goto('/');

    // Click on Hoglands project card (via stretched link with aria-label)
    await page.getByRole('link', { name: 'Hoglands', exact: true }).click();

    await expect(page).toHaveURL(/\/projects\/hoglands/, { timeout: 10_000 });
    await expect(page.locator('h1', { hasText: 'Hoglands' })).toBeVisible();
  });
});

test.describe('Project Detail Page', () => {
  test('displays project title, tags, and year', async ({ page }) => {
    await page.goto('/projects/hoglands');

    await expect(page.locator('h1', { hasText: 'Hoglands' })).toBeVisible();
    // Year badge
    await expect(page.getByText('2023', { exact: true })).toBeVisible();
    // Tags — use Badge elements to avoid matching MDX body text
    const tagsContainer = page.locator('.flex.flex-wrap.gap-2');
    await expect(tagsContainer.getByText('Unity')).toBeVisible();
    await expect(tagsContainer.getByText('C#')).toBeVisible();
  });

  test('has Back to all projects link', async ({ page }) => {
    await page.goto('/projects/hoglands');

    const backLink = page.getByRole('link', { name: /Back to all projects/ });
    await expect(backLink).toBeVisible();

    await backLink.click();
    await expect(page).toHaveURL(/\/#projects/, { timeout: 10_000 });
  });

  test('shows YouTube embed for project with video', async ({ page }) => {
    await page.goto('/projects/hoglands');

    // "Video" heading
    await expect(page.locator('h2', { hasText: 'Video' })).toBeVisible();

    // YouTube iframe should be present
    const iframe = page.locator('iframe[src*="youtube.com/embed"]');
    await expect(iframe).toBeVisible({ timeout: 10_000 });
    await expect(iframe).toHaveAttribute('src', /Qz9TE3hfl70/);
  });

  test('shows Steam link for Hoglands', async ({ page }) => {
    await page.goto('/projects/hoglands');

    const steamLink = page.getByRole('link', { name: /Steam/ });
    await expect(steamLink).toBeVisible();
    await expect(steamLink).toHaveAttribute('href', /store\.steampowered\.com/);
    await expect(steamLink).toHaveAttribute('target', '_blank');
  });

  test('shows image gallery (screenshots) for project with images', async ({ page }) => {
    await page.goto('/projects/hoglands');

    // "Screenshots" heading
    await expect(page.locator('h2', { hasText: 'Screenshots' })).toBeVisible();

    // Gallery thumbnail buttons should be visible
    const thumbnails = page.getByRole('button', {
      name: /View Hoglands screenshot/,
    });
    await expect(thumbnails.first()).toBeVisible();

    // Should have 13 thumbnails
    await expect(thumbnails).toHaveCount(13);
  });

  test('image gallery lightbox opens on thumbnail click', async ({ page }) => {
    await page.goto('/projects/hoglands');

    // Click first thumbnail — use exact: true to avoid matching screenshot 10-13
    await page.getByRole('button', { name: 'View Hoglands screenshot 1', exact: true }).click();

    // Lightbox dialog should appear
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Counter should show "1 / 13"
    await expect(page.getByText('1 / 13')).toBeVisible();
  });

  test('lightbox navigation works', async ({ page }) => {
    await page.goto('/projects/hoglands');

    // Open lightbox at first image
    await page.getByRole('button', { name: 'View Hoglands screenshot 1', exact: true }).click();
    await expect(page.getByText('1 / 13')).toBeVisible();

    // Click Next
    await page.getByLabel('Next image').click();
    await expect(page.getByText('2 / 13')).toBeVisible();

    // Click Previous
    await page.getByLabel('Previous image').click();
    await expect(page.getByText('1 / 13')).toBeVisible();
  });

  test('lightbox closes on close button', async ({ page }) => {
    await page.goto('/projects/hoglands');

    await page.getByRole('button', { name: 'View Hoglands screenshot 1', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Close
    await page.getByLabel('Close gallery').click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('shows Google Play link for Pigs Wars', async ({ page }) => {
    await page.goto('/projects/pigs-wars');

    const gpLink = page.getByRole('link', { name: /Google Play/ });
    await expect(gpLink).toBeVisible();
    await expect(gpLink).toHaveAttribute('href', /play\.google\.com/);
  });

  test('shows MDX content (article body)', async ({ page }) => {
    await page.goto('/projects/hoglands');

    // MDX content should render in article
    const article = page.locator('article');
    await expect(article).toBeVisible();

    // Should contain overview heading from MDX
    await expect(article.getByText('Overview')).toBeVisible();
  });

  test('returns 404 for non-existent project', async ({ page }) => {
    const response = await page.goto('/projects/nonexistent-project-xyz');
    expect(response?.status()).toBe(404);
  });
});
