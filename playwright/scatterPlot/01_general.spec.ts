import { test, expect, takeSnapshot } from '@chromatic-com/playwright';

test.only('rectangle brush', async ({ page }, testInfo) => {
  // test.use({ delay: 3000 });
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
  await takeSnapshot(page, 'Scatter Plot: rectangle brush', testInfo);
  // await expect(page.locator('div[class="js-plotly-plot"]')).toHaveScreenshot('ScatterPlotRectangeBrush.png');
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
  await expect(page.locator('div[class="js-plotly-plot"]')).toHaveScreenshot('ScatterPlotLassoBrush.png');
});

test('download plot', async ({ page }) => {
  await page.goto('/');
  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('DownloadPlotButton').click();
  const download = await downloadPromise;
  await download.saveAs(`./download-test-results/01-general/${new Date().toISOString}/${download.suggestedFilename()}`);
});

test('selection in ranking should be visible in plot', async ({ page }) => {
  await page.goto('/');
  for (let index = 1; index <= 50; index++) {
    await page.locator('div[class*="lu-renderer-selection"]').nth(index).click();
  }
  // add some time to wait for plot to render
  await expect(page.locator('div[class="js-plotly-plot"]')).toHaveScreenshot('ScatterPlotSelection.png');
});
