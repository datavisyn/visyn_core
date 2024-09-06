import { test, expect } from '@chromatic-com/playwright';
import { selectViolinPlot } from '../extensions/selectPlots';

/*
    TODO: test will fail due to line 15
  */
// test('no categorical column selected', async ({ page }) => {
//   await selectViolinPlot(page);
//   await page.getByTestId('SingleSelectCloseButton').click();
//   await expect(page.locator('g[class="violinlayer mlayer"]').locator('g[class="trace violins"]')).toHaveCount(1);
//   await expect(page.locator('g[class="xaxislayer-above"]').locator('g[class="xtick"]').locator('text')).toHaveText('Cohort: some very long description');
//   await expect(page.locator('g[class="g-ytitle"]').locator('text')).toHaveText('Cohort: some very long description');

//   await expect(page.locator('g[class="g-xtitle"]').locator('foreignObject')).not.toBeVisible();
//   await expect(page.locator('g[class="g-ytitle"]').locator('foreignObject')).not.toBeVisible();
// });

test('one categorical column selected', async ({ page }) => {
  await selectViolinPlot(page);
  await page.getByTestId('SingleSelectCategorical column').click();
  await page.getByRole('option', { name: 'Breast Surgery Type Sparse' }).locator('div').first().click();
  await expect(page.locator('g[class="violinlayer mlayer"]').locator('g[class="trace violins"]')).not.toHaveCount(1);
  await page.waitForTimeout(1000);
});
