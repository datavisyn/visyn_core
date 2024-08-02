import { test, expect } from '@chromatic-com/playwright';
import { selectViolinPlot } from '../extensions/selectPlots';

test('no overlay', async ({ page }) => {
  await selectViolinPlot(page);
  await page.getByTestId('ViolinOverlaySegmentedControl').locator('div[class*="SegmentedControl-control"]').first().click();

  await expect(page.locator('g[class="violinlayer mlayer"]').locator('g[class="trace violins"]').first().locator('path[class="box"]')).not.toBeVisible();
  await expect(page.locator('g[class="violinlayer mlayer"]').locator('g[class="trace violins"]').first().locator('g[class="points"]')).not.toBeVisible();
});

test('box overlay', async ({ page }) => {
  await selectViolinPlot(page);
  await page.getByTestId('ViolinOverlaySegmentedControl').locator('div[class*="SegmentedControl-control"]').nth(1).click();

  await expect(page.locator('g[class="violinlayer mlayer"]').locator('g[class="trace violins"]').first().locator('path[class="box"]')).toBeVisible();
});

test('strip overlay', async ({ page }) => {
  await selectViolinPlot(page);
  await page.getByTestId('ViolinOverlaySegmentedControl').locator('div[class*="SegmentedControl-control"]').last().click();

  await expect(page.locator('g[class="violinlayer mlayer"]').locator('g[class="trace violins"]').first().locator('g[class="points"]')).toBeVisible();
});
