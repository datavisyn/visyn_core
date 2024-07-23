import { test, expect } from '@playwright/test';
import { selectViolinPlot } from '../extensions/selectPlots';

test('no numerical column selected', async ({ page }) => {
  await selectViolinPlot(page);

  await page.getByTestId('MultiSelectCloseButton').click();
  await expect(page.getByRole('alert')).toBeVisible();
});

test.only('one numerical column selected', async ({ page }) => {
  await selectViolinPlot(page);
  await expect(page.getByTestId('ViolinYAxisSegmentedControl').locator('div[class*="SegmentedControl-control"]').first().locator('label')).toBeDisabled();
});

test('two numerical columns selected', async ({ page }) => {
  await selectViolinPlot(page);

  // select second numerical column
  await page.getByTestId('MultiSelect').click();
  await page.getByRole('option', { name: 'Neoplasm Histologic Grade' }).click();
  await page.getByTestId('MultiSelect').click();

  await expect(page.locator('g[class="x2y2"]')).toBeVisible();
  await expect(page.locator('g[class="g-y2title"]').locator('text')).toHaveText('Neoplasm Histologic …');
  await expect(page.getByTestId('ViolinYAxisSegmentedControl').locator('div[class*="SegmentedControl-control"]').first().locator('label')).toBeEnabled();
  await expect(page.getByTestId('SingleSelectFacets')).toBeDisabled();
});
