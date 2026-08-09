import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard - Product Management', () => {
  test('should display products, verify update button, and successfully delete a product', async ({ page }) => {
    
    await page.route('**/api/products', async (route) => {
      await route.fulfill({
        json: { products: [{ id: '1', title: 'E2E Target Product' }] }
      });
    });

    await page.route('**/api/products/1', async (route) => {
      await route.fulfill({ status: 200 });
    });

    await page.goto('/admin/products');

    await expect(page.getByText('E2E Target Product')).toBeVisible();

    const updateButton = page.getByRole('button', { name: 'Update' });
    await expect(updateButton).toBeVisible();

    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toBe('Product deleted successfully');
      await dialog.accept();
    });

    const deleteButton = page.getByRole('button', { name: 'Delete' });
    await deleteButton.click();

    await expect(page.getByText('E2E Target Product')).not.toBeVisible();
  });
});