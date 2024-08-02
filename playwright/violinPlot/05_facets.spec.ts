import { test, expect } from '@chromatic-com/playwright';
import { selectViolinPlot } from '../extensions/selectPlots';

test('facets selected', async ({ page }) => {
  await selectViolinPlot(page);
  await page.getByTestId('SingleSelectFacets').click();
  await page.getByRole('option', { name: 'Cellularity' }).click();

  await expect(page.locator('g[class="xy"]')).toBeVisible();
  await expect(page.locator('g[class="x2y2"]')).toBeVisible();
  await expect(page.locator('g[class="x3y3"]')).toBeVisible();
  await expect(page.locator('g[class="x4y4"]')).toBeVisible();
});

test('facets selected and sorting', async ({ page }) => {
  await selectViolinPlot(page);
  await page.getByTestId('SingleSelectFacets').click();
  await page.getByRole('option', { name: 'Cellularity' }).click();

  await page.locator('g[class="g-xtitle"]').locator('foreignObject').click();
  await expect(page.locator('g[class="g-xtitle"]').locator('svg')).toHaveCSS('fill', 'rgb(226, 150, 9)');
  await expect(page.locator('g[class="g-x2title"]').locator('svg')).toHaveCSS('fill', 'rgb(226, 150, 9)');
  await expect(page.locator('g[class="g-x3title"]').locator('svg')).toHaveCSS('fill', 'rgb(226, 150, 9)');
  await expect(page.locator('g[class="g-x4title"]').locator('svg')).toHaveCSS('fill', 'rgb(226, 150, 9)');
});
