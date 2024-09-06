import { test, expect } from '@chromatic-com/playwright';

test('polynomial regression line: quadratic', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('RegressionLineSelect').click();
  await expect(page.getByTestId('PolynomialRegressionOption')).not.toBeVisible();
  await page.getByRole('option', { name: 'Polynomial' }).click();
  await page
    .getByTestId('PolynomialRegressionOption')
    .locator('div[class*="SegmentedControl-control"]')
    .first()
    .locator('label[class*="SegmentedControl-label"]')
    .click();
});

test('polynomial regression line: cubic', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('RegressionLineSelect').click();
  await expect(page.getByTestId('PolynomialRegressionOption')).not.toBeVisible();
  await page.getByRole('option', { name: 'Polynomial' }).click();
  await page
    .getByTestId('PolynomialRegressionOption')
    .locator('div[class*="SegmentedControl-control"]')
    .nth(1)
    .locator('label[class*="SegmentedControl-label"]')
    .click();
});
