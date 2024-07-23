import { test, expect } from '@playwright/test';
import { selectViolinPlot } from '../extensions/selectPlots';

test('no numerical column selected', async ({ page }) => {
  await selectViolinPlot(page);

  await page.getByTestId('MultiSelectCloseButton').click();
  await expect(page.getByRole('alert')).toBeVisible();
});

test.only('one numerical column selected', async ({ page }) => {
  await selectViolinPlot(page);
  await expect(page.getByTestId('ViolinYAxisSegmentedControl').locator('div[class*="SegmentedControl-control"]').first()).toBeDisabled();
});
