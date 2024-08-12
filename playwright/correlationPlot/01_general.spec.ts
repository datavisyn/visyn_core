import { test, expect } from '@chromatic-com/playwright';
import { selectCorrelationPlot } from '../extensions/selectPlots';

test('download', async ({ page }) => {
  await selectCorrelationPlot(page);
  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('DownloadPlotButton').click();
  const download = await downloadPromise;
  await download.saveAs(`./download-test-results/01-general/${new Date().toISOString}/${download.suggestedFilename()}`);
});

test('minimum p-value bigger than maximum p-value', async ({ page }) => {
  await selectCorrelationPlot(page);
  await page.getByTestId('MinPValueInput').click();
  for (let index = 0; index < '0.5'.length; index++) {
    await page.keyboard.press('Backspace');
  }
  await page.keyboard.type('1');
  await page.keyboard.press('Enter');

  await page.getByTestId('MaxPValueInput').click();
  for (let index = 0; index < '0.5'.length; index++) {
    await page.keyboard.press('Backspace');
  }
  await page.keyboard.type('0');
  await page.keyboard.press('Enter');
});
