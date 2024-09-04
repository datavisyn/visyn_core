import { test, expect } from '@chromatic-com/playwright';
import { selectViolinPlot } from '../extensions/selectPlots';

// TODO: waitForEvent timeout
// test('download plot', async ({ page }) => {
//   await selectViolinPlot(page);
//   const downloadPromise = page.waitForEvent('download', { timeout: 300000 });
//   await page.getByTestId('DownloadPlotButton').click();
//   const download = await downloadPromise;
//   await download.saveAs(`playwright/download-test-results/${download.suggestedFilename()}`);
// });

test('selection in ranking should be visible in plot', async ({ page }) => {
  await selectViolinPlot(page);
  await page.locator('div:nth-child(2) > .lu-renderer-selection').click();

  await expect(page.locator('path[class="violin"]').first()).toHaveCSS('fill', 'rgb(226, 150, 9)');
  await expect(page.locator('path[class="violin"]').last()).not.toHaveCSS('fill', 'rgb(226, 150, 9)');
});

test('sort x-axis', async ({ page }) => {
  await selectViolinPlot(page);

  await page.getByTestId('SingleSelectCategorical column').click();
  await page.getByRole('option', { name: 'Breast Surgery Type Sparse' }).click();
  await page.getByTestId('MultiSelect').locator('button').first().click();

  // first click
  await page.locator('g[class="g-xtitle"]').locator('foreignObject').click();
  await expect(page.locator('g[class="xaxislayer-above"]').locator('g[class="xtick"]').first().locator('text')).toHaveText('BREAST CONSERVING');
  await expect(page.locator('g[class="xaxislayer-above"]').locator('g[class="xtick"]').nth(1).locator('text')).toHaveText('MASTECTOMY');
  await expect(page.locator('g[class="xaxislayer-above"]').locator('g[class="xtick"]').last().locator('text')).toHaveText('Unknown');

  // second click
  await page.locator('g[class="g-xtitle"]').locator('foreignObject').click();
  await expect(page.locator('g[class="xaxislayer-above"]').locator('g[class="xtick"]').first().locator('text')).toHaveText('Unknown');
  await expect(page.locator('g[class="xaxislayer-above"]').locator('g[class="xtick"]').nth(1).locator('text')).toHaveText('MASTECTOMY');
  await expect(page.locator('g[class="xaxislayer-above"]').locator('g[class="xtick"]').last().locator('text')).toHaveText('BREAST CONSERVING');

  // third click
  await page.locator('g[class="g-xtitle"]').locator('foreignObject').click();
  await expect(page.locator('g[class="xaxislayer-above"]').locator('g[class="xtick"]').first().locator('text')).toHaveText('MASTECTOMY');
  await expect(page.locator('g[class="xaxislayer-above"]').locator('g[class="xtick"]').nth(1).locator('text')).toHaveText('BREAST CONSERVING');
  await expect(page.locator('g[class="xaxislayer-above"]').locator('g[class="xtick"]').last().locator('text')).toHaveText('Unknown');
});

test('sort y-axis', async ({ page }) => {
  await selectViolinPlot(page);
  await page.getByTestId('SingleSelectCategorical column').click();
  await page.getByRole('option', { name: 'Breast Surgery Type Sparse' }).click();
  await page.getByTestId('MultiSelect').locator('button').first().click();

  // first click
  await page.locator('g[class="g-ytitle"]').locator('foreignObject').click();
  await expect(page.locator('g[class="xaxislayer-above"]').locator('g[class="xtick"]').first().locator('text')).toHaveText('Unknown');
  await expect(page.locator('g[class="xaxislayer-above"]').locator('g[class="xtick"]').nth(1).locator('text')).toHaveText('MASTECTOMY');
  await expect(page.locator('g[class="xaxislayer-above"]').locator('g[class="xtick"]').last().locator('text')).toHaveText('BREAST CONSERVING');

  // second click
  await page.locator('g[class="g-ytitle"]').locator('foreignObject').click();
  await expect(page.locator('g[class="xaxislayer-above"]').locator('g[class="xtick"]').first().locator('text')).toHaveText('BREAST CONSERVING');
  await expect(page.locator('g[class="xaxislayer-above"]').locator('g[class="xtick"]').nth(1).locator('text')).toHaveText('MASTECTOMY');
  await expect(page.locator('g[class="xaxislayer-above"]').locator('g[class="xtick"]').last().locator('text')).toHaveText('Unknown');

  // third click
  await page.locator('g[class="g-ytitle"]').locator('foreignObject').click();
  await expect(page.locator('g[class="xaxislayer-above"]').locator('g[class="xtick"]').first().locator('text')).toHaveText('MASTECTOMY');
  await expect(page.locator('g[class="xaxislayer-above"]').locator('g[class="xtick"]').nth(1).locator('text')).toHaveText('BREAST CONSERVING');
  await expect(page.locator('g[class="xaxislayer-above"]').locator('g[class="xtick"]').last().locator('text')).toHaveText('Unknown');
});
