import { test, expect } from '@playwright/test';

test('regression line: none', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('RegressionLineSelect').click();
  await page.getByRole('option', { name: 'None' }).click();
  await expect(page.locator('div[class="js-plotly-plot"]')).toHaveScreenshot('ScatterPlotNoRegressionLine.png');
});

test('regression line: polynomial', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('RegressionLineSelect').click();
  for (let index = 0; index <= 'Linear'.length; index++) {
    await page.keyboard.press('Backspace');
  }
  await page.getByTestId('RegressionLineSelect').fill('Polynomial');
  await page.getByRole('option').click();
  // await page.pause();
  await expect(page.locator('div[class="js-plotly-plot"]')).toHaveScreenshot('ScatterPlotPolynomialRegressionLine.png');
});

test('initial state: linear regression line', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('div[class="js-plotly-plot"]')).toHaveScreenshot('scatterPlotInitialState.png');
});
