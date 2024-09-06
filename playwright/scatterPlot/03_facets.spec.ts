import { test, expect, takeSnapshot } from '@chromatic-com/playwright';

test('select facet', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.getByTestId('SingleSelectFacets').click();
  await page.getByRole('option', { name: 'Breast Surgery Type Sparse' }).click();
  await expect(page.locator('g[class="xy"]')).toBeVisible();
  await expect(page.locator('g[class="x2y2"]')).toBeVisible();
  await expect(page.locator('g[class="x3y3"]')).toBeVisible();
  await page.getByTestId('SingleSelectCloseButton').first().click();
  await expect(page.locator('g[class="x2y2"]')).not.toBeVisible();
  await expect(page.locator('g[class="x3y3"]')).not.toBeVisible();
  await takeSnapshot(page, 'scatterPlot/03_facets', testInfo);
});
