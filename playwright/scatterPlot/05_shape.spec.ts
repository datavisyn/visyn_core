import { test, expect } from '@playwright/test';

test('no shape selected', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('SingleSelectShape').locator('span[class*="InputPlaceholder-placeholder"]')).toBeVisible();
  await expect(page.getByLabel('Legend')).toBeDisabled();
  await expect(page.locator('g[class="legend"]')).not.toBeVisible();
  await expect(page.locator('div[class="js-plotly-plot"]')).toHaveScreenshot('scatterPlotInitialState.png');
});

test('shape selected', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('SingleSelectShape').click();
  await page.getByRole('option', { name: 'Breast Surgery Type' }).click();
  await expect(page.getByLabel('Legend')).not.toBeDisabled();
  await expect(page.locator('g[class="legend"]')).toBeVisible();
  await expect(page.locator('div[class="js-plotly-plot"]')).toHaveScreenshot('scatterPlotWithShape.png');
});
