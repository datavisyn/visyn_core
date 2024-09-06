import { test, expect } from '@chromatic-com/playwright';
import { selectCorrelationPlot } from '../extensions/selectPlots';

test('p-value linear', async ({ page }) => {
  await selectCorrelationPlot(page);
  await page.getByTestId('PValueScaleTypeSelect').locator('div[class*="SegmentedControl-control"]').first().click();
});

test('p-value log', async ({ page }) => {
  await selectCorrelationPlot(page);
  await page.getByTestId('PValueScaleTypeSelect').locator('div[class*="SegmentedControl-control"]').last().click();
});
