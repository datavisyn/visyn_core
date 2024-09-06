import { test, expect } from '@chromatic-com/playwright';
import { selectBoxPlot } from '../extensions/selectPlots';

test('download', async ({ page }) => {
  await selectBoxPlot(page);
  const downloadPromise = page.waitForEvent('download', { timeout: 300000 });
  await page.getByTestId('DownloadPlotButton').click();
  const download = await downloadPromise;
  await download.saveAs(`playwright/download-test-results/${download.suggestedFilename()}`);
});

test('sort x-axis', async ({ page }) => {
  await selectBoxPlot(page);

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
  await selectBoxPlot(page);

  // first click
  await page.locator('g[class="g-ytitle"]').locator('foreignObject').click();
  await expect(page.locator('g[class="xaxislayer-above"]').locator('g[class="xtick"]').first().locator('text')).toHaveText('BREAST CONSERVING');
  await expect(page.locator('g[class="xaxislayer-above"]').locator('g[class="xtick"]').nth(1).locator('text')).toHaveText('MASTECTOMY');
  await expect(page.locator('g[class="xaxislayer-above"]').locator('g[class="xtick"]').last().locator('text')).toHaveText('Unknown');

  // second click
  await page.locator('g[class="g-ytitle"]').locator('foreignObject').click();
  await expect(page.locator('g[class="xaxislayer-above"]').locator('g[class="xtick"]').first().locator('text')).toHaveText('Unknown');
  await expect(page.locator('g[class="xaxislayer-above"]').locator('g[class="xtick"]').nth(1).locator('text')).toHaveText('MASTECTOMY');
  await expect(page.locator('g[class="xaxislayer-above"]').locator('g[class="xtick"]').last().locator('text')).toHaveText('BREAST CONSERVING');

  // third click
  await page.locator('g[class="g-ytitle"]').locator('foreignObject').click();
  await expect(page.locator('g[class="xaxislayer-above"]').locator('g[class="xtick"]').first().locator('text')).toHaveText('MASTECTOMY');
  await expect(page.locator('g[class="xaxislayer-above"]').locator('g[class="xtick"]').nth(1).locator('text')).toHaveText('BREAST CONSERVING');
  await expect(page.locator('g[class="xaxislayer-above"]').locator('g[class="xtick"]').last().locator('text')).toHaveText('Unknown');
});

test('selection in ranking should be visible in plot', async ({ page }) => {
  await selectBoxPlot(page);

  // select lines in ranking
  for (let index = 3; index <= 6; index++) {
    page.locator('div[class*="lu-renderer-selection"]').nth(index).click();
  }

  await expect(page.locator('g[class="subplot xy"]').locator('path[class="box"]').last()).toHaveCSS('fill', 'rgb(226, 150, 9)');
  await expect(page.locator('g[class="subplot x2y2"]').locator('path[class="box"]').last()).toHaveCSS('fill', 'rgb(226, 150, 9)');
});
