import { test, expect, takeSnapshot } from '@chromatic-com/playwright';

test('rectangle brush', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.getByTestId('BrushOptions').locator('div[class*="SegmentedControl-control"]').first().click();
  const scatterPlot = await page.locator('div[class="js-plotly-plot"]');
  const scatterPlotWidth = await scatterPlot.evaluate((el) => {
    return el.getBoundingClientRect().width;
  });
  const scatterPlotHeight = await scatterPlot.evaluate((el) => {
    return el.getBoundingClientRect().height;
  });

  await scatterPlot.hover({ force: true, position: { x: scatterPlotWidth / 4, y: scatterPlotHeight / 4 } });
  await page.mouse.down();
  await scatterPlot.hover({ force: true, position: { x: scatterPlotWidth / 4 + 150, y: scatterPlotHeight / 4 + 150 } });
  await page.mouse.up();
});

test('lasso brush', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('BrushOptions').locator('div[class*="SegmentedControl-control"]').nth(1).click();
  const scatterPlot = await page.locator('div[class="js-plotly-plot"]');
  const scatterPlotWidth = await scatterPlot.evaluate((el) => {
    return el.getBoundingClientRect().width;
  });
  const scatterPlotHeight = await scatterPlot.evaluate((el) => {
    return el.getBoundingClientRect().height;
  });

  await scatterPlot.hover({ force: true, position: { x: scatterPlotWidth / 4, y: scatterPlotHeight / 4 } });
  await page.mouse.down();
  await scatterPlot.hover({ force: true, position: { x: scatterPlotWidth / 4 + 150, y: scatterPlotHeight / 4 } });
  await scatterPlot.hover({ force: true, position: { x: scatterPlotWidth / 4 + 350, y: scatterPlotHeight / 4 + 350 } });
  await page.mouse.up();
});

// TODO: waitForEvent timeout
// test('download plot', async ({ page }) => {
//   await page.goto('/');
//   const downloadPromise = page.waitForEvent('download', { timeout: 300000 });
//   await page.getByTestId('DownloadPlotButton').click();
//   const download = await downloadPromise;
//   await download.saveAs(`playwright/download-test-results/${download.suggestedFilename()}`);
// });

test('selection in ranking should be visible in plot', async ({ page }) => {
  await page.goto('/');
  await page.locator('div:nth-child(1) > .lu-renderer-selection').click();
  await page.locator('div:nth-child(2) > .lu-renderer-selection').click();
  await page.locator('div:nth-child(3) > .lu-renderer-selection').click();
  await page.locator('div:nth-child(4) > .lu-renderer-selection').click();
  await page.locator('div:nth-child(5) > .lu-renderer-selection').click();
  await page.locator('div:nth-child(6) > .lu-renderer-selection').click();
  await page.locator('div:nth-child(7) > .lu-renderer-selection').click();
  await page.locator('div:nth-child(8) > .lu-renderer-selection').click();
  await page.locator('div:nth-child(9) > .lu-renderer-selection').click();
  await page.locator('div:nth-child(10) > .lu-renderer-selection').click();
});
