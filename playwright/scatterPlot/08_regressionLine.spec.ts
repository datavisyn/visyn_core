import { test, expect } from '@playwright/test';

test('regression line: none', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('RegressionLineSelect').click();
  await page.getByRole('option', { name: 'None' }).click();
  await expect(page.getByTestId('PolynomialRegressionOption')).not.toBeVisible();
  await expect(page.getByTestId('RegressionLineColor')).not.toBeVisible();
  await expect(page.locator('div[class="js-plotly-plot"]')).toHaveScreenshot('ScatterPlotNoRegressionLine.png');
});

test('regression line: polynomial', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('RegressionLineSelect').click();
  await page.getByRole('option', { name: 'Polynomial' }).click();
  await expect(page.getByTestId('PolynomialRegressionOption')).toBeVisible();
  await expect(page.getByTestId('RegressionLineColor')).toBeVisible();
  await expect(page.locator('div[class="js-plotly-plot"]')).toHaveScreenshot('ScatterPlotPolynomialRegressionLine.png');
});

test('initial state: linear regression line', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('RegressionLineSelect')).toHaveValue('Linear');
  await expect(page.getByTestId('PolynomialRegressionOption')).not.toBeVisible();
  await expect(page.getByTestId('RegressionLineColor')).toBeVisible();
  await expect(page.locator('div[class="js-plotly-plot"]')).toHaveScreenshot('scatterPlotInitialState.png');
});

test('should not be searchable', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('RegressionLineSelect').click();
  await expect(page.getByTestId('RegressionLineSelect')).toHaveValue('Linear');
  for (let index = 0; index < 'Linear'.length; index++) {
    await page.keyboard.press('Backspace');
  }
  await expect(page.getByTestId('RegressionLineSelect')).toHaveValue('Linear');
});
