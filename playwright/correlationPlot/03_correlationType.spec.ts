import { test, expect } from '@chromatic-com/playwright';
import { selectCorrelationPlot } from '../extensions/selectPlots';

test('pearson correlation', async ({ page }) => {
  await selectCorrelationPlot(page);
  await page.getByTestId('CorrelationTypeSelect').locator('div[class*="SegmentedControl-control"]').first().click();

  await expect(page.getByTestId('CorrelationPairR')).toHaveText('r: −0.0996');
  await expect(page.getByTestId('CorrelationPairCircle')).toHaveCSS('fill', 'rgb(246, 218, 204)');
});

test('spearman correlation', async ({ page }) => {
  await selectCorrelationPlot(page);
  await page.getByTestId('CorrelationTypeSelect').locator('div[class*="SegmentedControl-control"]').nth(1).click();

  await expect(page.getByTestId('CorrelationPairR')).toHaveText('r: −0.0849');
  await expect(page.getByTestId('CorrelationPairCircle')).toHaveCSS('fill', 'rgb(246, 222, 210)');
});
