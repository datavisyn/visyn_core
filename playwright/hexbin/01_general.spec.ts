import { test, expect } from '@chromatic-com/playwright';
import { selectHexbin } from '../extensions/selectPlots';

/*
//     TODO: Although test won't fail, it does not work as expected => lasso brush is used instead of rectangle brush
*/
// test('rectangle brush', async ({ page }) => {
//   await selectHexbin(page);
//   await page.getByTestId('BrushOptions').locator('div[class*="SegmentedControl-control"]').first().click();
//   const hexbinPlot = await page.locator('svg[id="HexPlot4"]');
//   const hexbinPlotWidth = await hexbinPlot.evaluate((el) => {
//     return el.getBoundingClientRect().width;
//   });
//   const hexbinPlotHeight = await hexbinPlot.evaluate((el) => {
//     return el.getBoundingClientRect().height;
//   });

//   await hexbinPlot.hover({ force: true, position: { x: hexbinPlotWidth / 4, y: hexbinPlotHeight / 4 } });
//   await page.mouse.down();
//   await hexbinPlot.hover({ force: true, position: { x: hexbinPlotWidth / 4 + 150, y: hexbinPlotHeight / 4 } });
//   await hexbinPlot.hover({ force: true, position: { x: hexbinPlotWidth / 4 + 350, y: hexbinPlotHeight / 4 + 350 } });
//   await page.mouse.up();
// });

test('download', async ({ page }) => {
  await selectHexbin(page);
  const downloadPromise = page.waitForEvent('download', { timeout: 300000 });
  await page.getByTestId('DownloadPlotButton').click();
  const download = await downloadPromise;
  await download.saveAs(`playwright/download-test-results/${download.suggestedFilename()}`);
});

test('selection in ranking should be visible in plot', async ({ page }) => {
  await selectHexbin(page);
  await page.locator('article[class*="le-thead-lu-"]').locator('section[data-id="col2"]').locator('div[data-renderer="selection"]').click();
});
