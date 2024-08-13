import { test, expect, takeSnapshot } from '@chromatic-com/playwright';
import { selectHeatmap } from '../extensions/selectPlots';

test('blue color scale', async ({ page }, testInfo) => {
  await selectHeatmap(page);
  await takeSnapshot(page, 'heatmap/03_colorScale/blue', testInfo);

  await expect(page.getByTestId('ColorLegendScale0')).toHaveText('0.00');
  await expect(page.getByTestId('ColorLegendScale4')).toHaveText('694');
  await expect(page.locator('rect[class="css-rvf4eq"]').first()).toHaveCSS('fill', 'rgb(195, 233, 255)');
});

test('orange color scale', async ({ page }, testInfo) => {
  await selectHeatmap(page);

  await page.getByTestId('NumericalColorButtons').locator('div[class*="SegmentedControl-control"]').locator('label').first().click();
  await takeSnapshot(page, 'heatmap/03_colorScale/orange', testInfo);

  await expect(page.getByTestId('ColorLegendScale0')).toHaveText('8.00');
  await expect(page.getByTestId('ColorLegendScale4')).toHaveText('694');
  await expect(page.locator('rect[class="css-rvf4eq"]').first()).toHaveCSS('fill', 'rgb(134, 26, 10)');
});
