import { test, expect } from '@playwright/test';
import { selectViolinPlot } from '../extensions/selectPlots';

test('no categorical column selected', async ({ page }) => {
  /*
    TODO: test will fail due to line 15
  */
  await selectViolinPlot(page);
  await page.getByTestId('SingleSelectCloseButton').click();
  await expect(page.locator('g[class="violinlayer mlayer"]').locator('g[class="trace violins"]')).toHaveCount(1);
  await expect(page.locator('g[class="xaxislayer-above"]').locator('g[class="xtick"]').locator('text')).toHaveText('Cohort: some very long description');
  await expect(page.locator('g[class="g-ytitle"]').locator('text')).toHaveText('Cohort: some very long description');

  await expect(page.locator('g[class="g-xtitle"]').locator('foreignObject')).not.toBeVisible();
  await expect(page.locator('g[class="g-ytitle"]').locator('foreignObject')).not.toBeVisible();
});

test('one categorical column selected', async ({ page }) => {
  await selectViolinPlot(page);
  await expect(page.locator('g[class="violinlayer mlayer"]').locator('g[class="trace violins"]')).not.toHaveCount(1);
});
