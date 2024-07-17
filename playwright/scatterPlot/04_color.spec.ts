import { test, expect } from '@playwright/test';

test('no color selected', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByLabel('Legend')).toBeDisabled();
  await expect(page.locator('div[class="js-plotly-plot"]')).toHaveScreenshot('scatterPlotNoColor.png');
});

test.only('color selected', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('SingleSelectColor').click();
  await page.getByRole('option', { name: 'Cellularity' }).click();
  await expect(page.getByLabel('Legend')).not.toBeDisabled();
  await page.pause();
  await expect(page.locator('div[class="js-plotly-plot"]')).toHaveScreenshot('scatterPlotWithColor.png');
});
