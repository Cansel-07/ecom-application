import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard - Product Creation', () => {
  test('should successfully fill the form and create a new product', async ({ page }) => {
    
    await page.route('**/api/upload', async (route) => {
      await route.fulfill({ json: { url: 'https://mock-image.com/test.jpg' } });
    });

    await page.route('**/api/products', async (route) => {
      await route.fulfill({ json: { success: true } });
    });

    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();

    const titleInput = page.getByPlaceholder('e.g. Wireless Headphones');
    await titleInput.click();
    await titleInput.pressSequentially('E2E Test Product', { delay: 50 });
    
    await page.getByPlaceholder('Product description...').fill('This is a test product created by Playwright.');
    await page.getByPlaceholder('99.99').fill('199.99');

    await page.locator('input[type="file"]').setInputFiles({
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer: Buffer.from('fake-image-content-for-testing')
    });

    await page.getByRole('button', { name: 'Create Product' }).click();

    await expect(page.getByText('Success! Product created in Stripe and Database.')).toBeVisible({ timeout: 15000 });
  });
});