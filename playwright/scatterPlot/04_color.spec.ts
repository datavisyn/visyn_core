import { test, expect, takeSnapshot, ChromaticConfig } from '@chromatic-com/playwright';

test.only('no color selected', async ({ page }, testInfo) => {
  test.use({ delay: 1000 });
  await page.goto('/');
  await expect(page.getByTestId('SingleSelectColor').locator('span[class*="InputPlaceholder-placeholder"]')).toBeVisible();
  await expect(page.getByLabel('Legend')).toBeDisabled();
  await expect(page.locator('g[class="legend"]')).not.toBeVisible();
  // delay chromatic snapshot for 300 ms
  await page.waitForTimeout(300);
  await takeSnapshot(page, 'Scatter Plot: no color selected', testInfo);
  //await expect(page.locator('div[class="js-plotly-plot"]')).toHaveScreenshot('scatterPlotInitialState.png');
});

test('color selected', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('SingleSelectColor').click();
  await page.getByRole('option', { name: 'Cellularity' }).click();
  await expect(page.getByLabel('Legend')).not.toBeDisabled();
  await expect(page.locator('g[class="legend"]')).toBeVisible();
  await expect(page.locator('div[class="js-plotly-plot"]')).toHaveScreenshot('scatterPlotWithColor.png');
});

test('show color scale', async ({ page }) => {
  /*
      TODO: test will fail due to line 27
  */

  await page.goto('/');
  await page.getByTestId('SingleSelectColor').click();
  await page.getByRole('option', { name: 'Neoplasm Histologic Grade' }).click();
  await expect(page.getByTestId('NumericalColorButtons')).toBeVisible();

  //TODO: check both color scales
});
