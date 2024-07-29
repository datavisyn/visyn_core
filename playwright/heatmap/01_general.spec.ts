import { test, expect } from '@playwright/test';
import { selectHeatmap } from '../extensions/selectPlots';

test('download', async ({ page }) => {
  await selectHeatmap(page);
  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('DownloadPlotButton').click();
  const download = await downloadPromise;
  await download.saveAs(`./download-test-results/01-general/${new Date().toISOString}/${download.suggestedFilename()}`);
});

test('sort x-axis', async ({ page }) => {
  await selectHeatmap(page);

  // first click
  await page.getByTestId('idXAxis').getByTestId('SortingButton').click();
  await expect(page.getByTestId('XAxisLabel0')).toHaveText('Unknown');
  await expect(page.getByTestId('XAxisLabel1')).toHaveText('BREAST CONSERVING');
  await expect(page.getByTestId('XAxisLabel2')).toHaveText('MASTECTOMY');

  // second click
  await page.getByTestId('idXAxis').getByTestId('SortingButton').click();
  await expect(page.getByTestId('XAxisLabel0')).toHaveText('MASTECTOMY');
  await expect(page.getByTestId('XAxisLabel1')).toHaveText('BREAST CONSERVING');
  await expect(page.getByTestId('XAxisLabel2')).toHaveText('Unknown');

  // third click
  await page.getByTestId('idXAxis').getByTestId('SortingButton').click();
  await expect(page.getByTestId('XAxisLabel0')).toHaveText('Unknown');
  await expect(page.getByTestId('XAxisLabel1')).toHaveText('BREAST CONSERVING');
  await expect(page.getByTestId('XAxisLabel2')).toHaveText('MASTECTOMY');
});

test('sort y-axis', async ({ page }) => {
  await selectHeatmap(page);

  // first click
  await page.getByTestId('idYAxis').getByTestId('SortingButton').click();
  await expect(page.getByTestId('YAxisLabel0')).toHaveText('Unknown');
  await expect(page.getByTestId('YAxisLabel1')).toHaveText('High');
  await expect(page.getByTestId('YAxisLabel2')).toHaveText('Low');
  await expect(page.getByTestId('YAxisLabel3')).toHaveText('Moderate');

  // second click
  await page.getByTestId('idYAxis').getByTestId('SortingButton').click();
  await expect(page.getByTestId('YAxisLabel0')).toHaveText('Moderate');
  await expect(page.getByTestId('YAxisLabel1')).toHaveText('Low');
  await expect(page.getByTestId('YAxisLabel2')).toHaveText('High');
  await expect(page.getByTestId('YAxisLabel3')).toHaveText('Unknown');

  // third click
  await page.getByTestId('idYAxis').getByTestId('SortingButton').click();
  await expect(page.getByTestId('YAxisLabel0')).toHaveText('Unknown');
  await expect(page.getByTestId('YAxisLabel1')).toHaveText('High');
  await expect(page.getByTestId('YAxisLabel2')).toHaveText('Low');
  await expect(page.getByTestId('YAxisLabel3')).toHaveText('Moderate');
});

test('selection in ranking should be visible in plot', async ({ page }) => {
  await selectHeatmap(page);

  // select lines in ranking
  for (let index = 3; index <= 6; index++) {
    await page.locator('div[class*="lu-renderer-selection"]').nth(index).click();
  }

  await expect(page.locator('rect[class="css-rvf4eq"]').nth(9)).toHaveCSS('stroke', 'rgb(226, 150, 9)');
  await expect(page.locator('rect[class="css-rvf4eq"]').nth(11)).toHaveCSS('stroke', 'rgb(226, 150, 9)');
});
