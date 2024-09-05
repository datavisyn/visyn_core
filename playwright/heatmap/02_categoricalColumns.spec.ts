import { test, expect } from '@chromatic-com/playwright';
import { selectHeatmap } from '../extensions/selectPlots';

test('none and one categorical column selected', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('SelectVisualizationType').click();
  await page.getByRole('option', { name: 'Heatmap plot' }).click();

  // no categorical column selected
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByTestId('NumericalColorButtons')).not.toBeVisible();

  // one categorical column selected
  await page.getByTestId('MultiSelect').click();
  await page.getByRole('option', { name: 'Breast Surgery Type Sparse' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByTestId('NumericalColorButtons')).not.toBeVisible();
});

test('two categorical columns selected', async ({ page }) => {
  await selectHeatmap(page);
  await expect(page.getByTestId('idXAxis').locator('p')).toHaveText('Cellularity');
  await expect(page.getByTestId('idYAxis').locator('p')).toHaveText('Breast Surgery Type Sparse');
});

test('no more than two categorical columns selected', async ({ page }) => {
  await selectHeatmap(page);
  await expect(page.getByTestId('MultiSelect').locator('span[class*="Pill-root"]')).toHaveCount(2);
  await page.getByTestId('MultiSelect').click();
  await page.getByRole('option', { name: 'Chemotherapy Sparse' }).click();
  await expect(page.getByTestId('MultiSelect').locator('span[class*="Pill-root"]')).toHaveCount(2);
});
