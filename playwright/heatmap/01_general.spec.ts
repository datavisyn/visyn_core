import { test, expect } from '@chromatic-com/playwright';
import { selectHeatmap } from '../extensions/selectPlots';

test('download', async ({ page }) => {
  await selectHeatmap(page);
  const downloadPromise = page.waitForEvent('download', { timeout: 300000 });
  await page.getByTestId('DownloadPlotButton').click();
  const download = await downloadPromise;
  await download.saveAs(`playwright/download-test-results/${download.suggestedFilename()}`);
});

test('sort x-axis', async ({ page }) => {
  await selectHeatmap(page);

  // first click
  await page.getByTestId('idXAxis').getByTestId('SortingButton').click();
  await expect(page.getByTestId('XAxisLabel0')).toHaveText('Unknown');
  await expect(page.getByTestId('XAxisLabel1')).toHaveText('High');
  await expect(page.getByTestId('XAxisLabel2')).toHaveText('Low');
  await expect(page.getByTestId('XAxisLabel3')).toHaveText('Moderate');

  // second click
  await page.getByTestId('idXAxis').getByTestId('SortingButton').click();
  await expect(page.getByTestId('XAxisLabel0')).toHaveText('Moderate');
  await expect(page.getByTestId('XAxisLabel1')).toHaveText('Low');
  await expect(page.getByTestId('XAxisLabel2')).toHaveText('High');
  await expect(page.getByTestId('XAxisLabel3')).toHaveText('Unknown');

  // third click
  await page.getByTestId('idXAxis').getByTestId('SortingButton').click();
  await expect(page.getByTestId('XAxisLabel0')).toHaveText('Unknown');
  await expect(page.getByTestId('XAxisLabel1')).toHaveText('High');
  await expect(page.getByTestId('XAxisLabel2')).toHaveText('Low');
  await expect(page.getByTestId('XAxisLabel3')).toHaveText('Moderate');
});

test('sort y-axis', async ({ page }) => {
  await selectHeatmap(page);

  // first click
  await page.getByTestId('idYAxis').getByTestId('SortingButton').click();
  await expect(page.getByTestId('YAxisLabel0')).toHaveText('Unknown');
  await expect(page.getByTestId('YAxisLabel1')).toHaveText('BREAST CONSERVING');
  await expect(page.getByTestId('YAxisLabel2')).toHaveText('MASTECTOMY');

  // second click
  await page.getByTestId('idYAxis').getByTestId('SortingButton').click();
  await expect(page.getByTestId('YAxisLabel0')).toHaveText('MASTECTOMY');
  await expect(page.getByTestId('YAxisLabel1')).toHaveText('BREAST CONSERVING');
  await expect(page.getByTestId('YAxisLabel2')).toHaveText('Unknown');

  // third click
  await page.getByTestId('idYAxis').getByTestId('SortingButton').click();
  await expect(page.getByTestId('YAxisLabel0')).toHaveText('Unknown');
  await expect(page.getByTestId('YAxisLabel1')).toHaveText('BREAST CONSERVING');
  await expect(page.getByTestId('YAxisLabel2')).toHaveText('MASTECTOMY');
});

test('selection in ranking should be visible in plot', async ({ page }) => {
  await selectHeatmap(page);

  // select lines in ranking
  for (let index = 3; index <= 6; index++) {
    await page.locator('div[class*="lu-renderer-selection"]').nth(index).click();
  }

  await expect(page.locator('rect[class="css-rvf4eq"]').nth(3)).toHaveCSS('stroke', 'rgb(226, 150, 9)');
  await expect(page.locator('rect[class="css-rvf4eq"]').nth(5)).toHaveCSS('stroke', 'rgb(226, 150, 9)');
  await expect(page.locator('rect[class="css-rvf4eq"]').nth(9)).toHaveCSS('stroke', 'rgb(226, 150, 9)');
});
