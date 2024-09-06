import { test, expect } from '@chromatic-com/playwright';

test('regression line: none', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('RegressionLineSelect').click();
  await page.getByRole('option', { name: 'None' }).click();
  await expect(page.getByTestId('PolynomialRegressionOption')).not.toBeVisible();
  await expect(page.getByTestId('RegressionLineColor')).not.toBeVisible();
});

test('regression line: polynomial', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('RegressionLineSelect').click();
  await page.getByRole('option', { name: 'Polynomial' }).click();
  await expect(page.getByTestId('PolynomialRegressionOption')).toBeVisible();
  await expect(page.getByTestId('RegressionLineColor')).toBeVisible();
});

test('initial state: linear regression line', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('RegressionLineSelect')).toHaveValue('Linear');
  await expect(page.getByTestId('PolynomialRegressionOption')).not.toBeVisible();
  await expect(page.getByTestId('RegressionLineColor')).toBeVisible();
});

//   /*
//     TODO: test will fail due to line 39
//   */
// test('should not be searchable', async ({ page }) => {
//   await page.goto('/');
//   await page.getByTestId('RegressionLineSelect').click();
//   await expect(page.getByTestId('RegressionLineSelect')).toHaveValue('Linear');
//   for (let index = 0; index < 'Linear'.length; index++) {
//     page.keyboard.press('Backspace');
//   }
//   await expect(page.getByTestId('RegressionLineSelect')).toHaveValue('Linear');
// });
