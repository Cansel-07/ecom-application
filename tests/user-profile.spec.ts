import { test, expect } from '@playwright/test';

test.describe('Standard User - Profile and Orders', () => {
  test('should display user profile and order history for a logged-in user', async ({ page }) => {
    
    await page.route('**/api/orders**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'ORD-987654321',
            totalAmount: 149.99,
            createdAt: new Date().toISOString(),
            items: [{ id: 'item-1', quantity: 1 }],
          },
        ]),
      });
    });

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sub: 'auth0|testuser123',
          email: 'testuser@example.com',
          name: 'Test User',
        }),
      });
    });

    await page.goto('/profile');

    await expect(page.getByRole('heading', { name: 'User Profile' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Order History' })).toBeVisible();
  });
});