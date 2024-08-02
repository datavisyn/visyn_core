import { test, expect } from '@chromatic-com/playwright';
import { selectBoxPlot } from '../extensions/selectPlots';

test('no overlay', async ({ page }) => {
  await selectBoxPlot(page);

  await page.getByTestId('ViolinOverlaySegmentedControl').locator('div[class*="SegmentedControl-control"]').first().click();

  await expect(page.locator('g[class="boxlayer mlayer"]').locator('g[class="trace boxes"]').first().locator('g[class="points"]')).not.toBeVisible();
});

test('strip overlay', async ({ page }) => {
  await selectBoxPlot(page);

  await page.getByTestId('ViolinOverlaySegmentedControl').locator('div[class*="SegmentedControl-control"]').last().click();

  await expect(page.locator('g[class="boxlayer mlayer"]').locator('g[class="trace boxes"]').first().locator('g[class="points"]')).toBeVisible();
});
