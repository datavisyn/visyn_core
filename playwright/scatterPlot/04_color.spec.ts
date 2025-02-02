import { expect, takeSnapshot, test } from '@chromatic-com/playwright';

test('no color selected', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.getByTestId('SingleSelectCloseButton').last().click();
  await expect(page.getByLabel('Legend')).toBeDisabled();
  await expect(page.getByTestId('PlotLegend')).not.toBeVisible();
});

test('color selected', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('SingleSelectColor').click();
  await page.getByRole('option', { name: 'Cellularity' }).click();
  await expect(page.getByLabel('Legend')).not.toBeDisabled();

  const toggleLegend = await page.getByTestId('ToggleLegend');
  const parentElement = await toggleLegend.evaluateHandle((node) => node.parentElement);
  await parentElement.click();

  await expect(page.getByTestId('PlotLegend')).toBeVisible();
});

test('show color scale', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.getByTestId('SingleSelectColor').click();
  await page.getByRole('option', { name: 'Neoplasm Histologic Grade' }).click();
  await expect(page.getByTestId('NumericalColorButtons')).toBeVisible();

  await page.getByTestId('NumericalColorButtons').locator('div[class*="mantine-SegmentedControl-control"]').first().click();
  await takeSnapshot(page, 'scatterPlot/04_color/showColorScaleLeft', testInfo);
  await page.getByTestId('NumericalColorButtons').locator('div[class*="mantine-SegmentedControl-control"]').last().click();
  await takeSnapshot(page, 'scatterPlot/04_color/showColorScaleRight', testInfo);
});
