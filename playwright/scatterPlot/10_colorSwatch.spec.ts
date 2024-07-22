import { test, expect } from '@playwright/test';

test('default regression line color', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('RegressionLineSelect')).toHaveValue('Linear');
  await expect(page.getByTestId('RegressionLineColor')).toBeVisible();
  await page.getByTestId('RegressionLineColor').getByTestId('ColorSwatch').first().click();
  await expect(page.locator('div[class="js-plotly-plot"]')).toHaveScreenshot('scatterPlotInitialState.png');
});

test('red regression line color', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('RegressionLineSelect')).toHaveValue('Linear');
  await expect(page.getByTestId('RegressionLineColor')).toBeVisible();
  await page.getByTestId('RegressionLineColor').getByTestId('ColorSwatch').nth(1).click();
  await expect(page.locator('div[class="js-plotly-plot"]')).toHaveScreenshot('scatterPlotColorRed.png');
});

test('blue regression line color', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('RegressionLineSelect')).toHaveValue('Linear');
  await expect(page.getByTestId('RegressionLineColor')).toBeVisible();
  await page.getByTestId('RegressionLineColor').getByTestId('ColorSwatch').nth(2).click();
  await expect(page.locator('div[class="js-plotly-plot"]')).toHaveScreenshot('scatterPlotColorBlue.png');
});
