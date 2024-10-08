import { test, expect } from '@chromatic-com/playwright';

test('tooltip labels', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('MultiSelect').last().click();
  await page.getByRole('option', { name: 'Chemotherapy Sparse' }).click();
  const scatterPlot = await page.locator('div[class="js-plotly-plot"]');
  const scatterPlotWidth = await scatterPlot.evaluate((el) => {
    return el.getBoundingClientRect().width;
  });
  const scatterPlotHeight = await scatterPlot.evaluate((el) => {
    return el.getBoundingClientRect().height;
  });

  await scatterPlot.hover({ force: true, position: { x: scatterPlotWidth / 2, y: scatterPlotHeight / 2 } });
});
