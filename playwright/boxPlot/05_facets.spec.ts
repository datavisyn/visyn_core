import { test, expect } from '@chromatic-com/playwright';
import { selectBoxPlot } from '../extensions/selectPlots';

test('facet selected', async ({ page }) => {
  await selectBoxPlot(page);
  await page.getByTestId('MultiSelect').locator('span[class*="Pill-root"]').last().locator('button').click();
  await page.getByTestId('SingleSelectCloseButton').click();

  await page.getByTestId('SingleSelectFacets').click();
  await page.getByRole('option', { name: 'Breast Surgery Type Sparse' }).click();
  await expect(page.locator('g[class="xy"]')).toBeVisible();
  await expect(page.locator('g[class="x2y2"]')).toBeVisible();
  await expect(page.locator('g[class="x3y3"]')).toBeVisible();
  await expect(page.getByTestId('ViolinYAxisSegmentedControl').locator('div[class*="SegmentedControl-control"]').first().locator('input')).toBeEnabled();
});
