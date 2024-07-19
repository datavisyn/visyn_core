import { test, expect } from '@playwright/test';

test('never show labels', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('LabelingOptions').locator('div[class*="SegmentedControl-control"]').first().locator('label[class*="SegmentedControl-label"]').click();
  await page.pause();

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
  // how to check if it was a success??
});

test('always show labels', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('div[class="js-plotly-plot"]')).toHaveScreenshot('scatterPlotInitialState.png');
  await page.getByTestId('LabelingOptions').locator('div[class*="SegmentedControl-control"]').nth(1).locator('label[class*="SegmentedControl-label"]').click();
  await expect(page.locator('div[class="js-plotly-plot"]')).toHaveScreenshot('scatterPlotLabelsAlways.png');
});

test('selected show labels', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('div[class="js-plotly-plot"]')).toHaveScreenshot('scatterPlotInitialState.png');
  await page.getByTestId('LabelingOptions').locator('div[class*="SegmentedControl-control"]').nth(2).locator('label[class*="SegmentedControl-label"]').click();
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
  // how to check if it was a success??
});
