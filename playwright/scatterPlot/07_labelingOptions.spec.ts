import { test, expect } from '@playwright/test';

test('never show labels', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('LabelingOptions').locator('div[class*="SegmentedControl-control"]').first().click();

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
  await page.locator('div[class="js-plotly-plot"]').hover({ position: { x: 0, y: 0 } }); // clicking on the left edge of plot to make move mouse and make tooltip disappear
  await expect(page.locator('div[class="js-plotly-plot"]')).toHaveScreenshot('ScatterPlotLabelingNever.png');
});

test('always show labels', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('div[class="js-plotly-plot"]')).toHaveScreenshot('scatterPlotInitialState.png');
  await page.getByTestId('LabelingOptions').locator('div[class*="SegmentedControl-control"]').nth(1).locator('label[class*="SegmentedControl-label"]').click();
  await expect(page.locator('div[class="js-plotly-plot"]')).toHaveScreenshot('scatterPlotLabelsAlways.png');
});

test('initial state: selected show labels', async ({ page }) => {
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
  await expect(page.locator('div[class="js-plotly-plot"]')).toHaveScreenshot('ScatterPlotLabelingSelected.png');
});