import { test, expect } from '@playwright/test';

test('no color selected', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('SingleSelectColor').locator('span[class*="InputPlaceholder-placeholder"]')).toBeVisible();
  await expect(page.getByLabel('Legend')).toBeDisabled();
  await expect(page.locator('g[class="legend"]')).not.toBeVisible();
  await expect(page.locator('div[class="js-plotly-plot"]')).toHaveScreenshot('scatterPlotInitialState.png');
});

test('color selected', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('SingleSelectColor').click();
  await page.getByRole('option', { name: 'Cellularity' }).click();
  await expect(page.getByLabel('Legend')).not.toBeDisabled();
  await expect(page.locator('g[class="legend"]')).toBeVisible();
  await expect(page.locator('div[class="js-plotly-plot"]')).toHaveScreenshot('scatterPlotWithColor.png');
});