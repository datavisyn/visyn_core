import { test, expect } from '@playwright/test';
import { selectViolinPlot } from '../extensions/selectPlots';

test('download plot', async ({ page }) => {
  await selectViolinPlot(page);
  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('DownloadPlotButton').click();
  const download = await downloadPromise;
  await download.saveAs(`./download-test-results/01-general/${new Date().toISOString}/${download.suggestedFilename()}`);
});

test('selection in ranking should be visible in plot', async ({ page }) => {
  await selectViolinPlot(page);

  // select lines in ranking
  for (let index = 3; index <= 6; index++) {
    await page.locator('div[class*="lu-renderer-selection"]').nth(index).click();
  }

  await expect(page.locator('path[class="violin"]').first()).toHaveCSS('fill', 'rgb(226, 150, 9)');
  await expect(page.locator('path[class="violin"]').nth(1)).not.toHaveCSS('fill', 'rgb(226, 150, 9)');
  await expect(page.locator('path[class="violin"]').last()).not.toHaveCSS('fill', 'rgb(226, 150, 9)');
});

test('sort x-axis', async ({ page }) => {
  await selectViolinPlot(page);

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

  // first click
  await page.locator('g[class="g-ytitle"]').locator('foreignObject').click();
  await expect(page.locator('g[class="xaxislayer-above"]').locator('g[class="xtick"]').first().locator('text')).toHaveText('Unknown');
  await expect(page.locator('g[class="xaxislayer-above"]').locator('g[class="xtick"]').nth(1).locator('text')).toHaveText('BREAST CONSERVING');
  await expect(page.locator('g[class="xaxislayer-above"]').locator('g[class="xtick"]').last().locator('text')).toHaveText('MASTECTOMY');

  // second click
  await page.locator('g[class="g-ytitle"]').locator('foreignObject').click();
  await expect(page.locator('g[class="xaxislayer-above"]').locator('g[class="xtick"]').first().locator('text')).toHaveText('MASTECTOMY');
  await expect(page.locator('g[class="xaxislayer-above"]').locator('g[class="xtick"]').nth(1).locator('text')).toHaveText('BREAST CONSERVING');
  await expect(page.locator('g[class="xaxislayer-above"]').locator('g[class="xtick"]').last().locator('text')).toHaveText('Unknown');

  // third click
  await page.locator('g[class="g-ytitle"]').locator('foreignObject').click();
  await expect(page.locator('g[class="xaxislayer-above"]').locator('g[class="xtick"]').first().locator('text')).toHaveText('MASTECTOMY');
  await expect(page.locator('g[class="xaxislayer-above"]').locator('g[class="xtick"]').nth(1).locator('text')).toHaveText('BREAST CONSERVING');
  await expect(page.locator('g[class="xaxislayer-above"]').locator('g[class="xtick"]').last().locator('text')).toHaveText('Unknown');
});
