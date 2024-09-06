import { test, expect } from '@chromatic-com/playwright';
import { selectViolinPlot } from '../extensions/selectPlots';

test('facets selected', async ({ page }) => {
  await selectViolinPlot(page);
  await page.getByTestId('MultiSelect').locator('button').first().click();
  await page.getByTestId('SingleSelectFacets').click();
  await page.getByRole('option', { name: 'Cellularity' }).click();

  await expect(page.locator('g[class="xy"]')).toBeVisible();
  await expect(page.locator('g[class="x2y2"]')).toBeVisible();
  await expect(page.locator('g[class="x3y3"]')).toBeVisible();
  await expect(page.locator('g[class="x4y4"]')).toBeVisible();
});
