import { test, expect } from '@playwright/test';

test('select facet', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('SingleSelectFacets').click();
  await page.getByRole('option', { name: 'Breast Surgery Type' }).click();
  await expect(page.locator('g[class="xy"]')).toBeVisible();
  await expect(page.locator('g[class="x2y2"]')).toBeVisible();
  await expect(page.locator('g[class="x3y3"]')).toBeVisible();
  await page.getByTestId('SingleSelectCloseButton').click();
  await expect(page.locator('g[class="x2y2"]')).not.toBeVisible();
  await expect(page.locator('g[class="x3y3"]')).not.toBeVisible();
});
