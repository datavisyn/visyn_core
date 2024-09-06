import { test, expect } from '@chromatic-com/playwright';

test('default regression line color', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('RegressionLineSelect')).toHaveValue('Linear');
  await expect(page.getByTestId('RegressionLineColor')).toBeVisible();
  await page.getByTestId('RegressionLineColor').getByTestId('ColorSwatch').first().click();
});

test('red regression line color', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('RegressionLineSelect')).toHaveValue('Linear');
  await expect(page.getByTestId('RegressionLineColor')).toBeVisible();
  await page.getByTestId('RegressionLineColor').getByTestId('ColorSwatch').nth(1).click();
});

test('blue regression line color', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('RegressionLineSelect')).toHaveValue('Linear');
  await expect(page.getByTestId('RegressionLineColor')).toBeVisible();
  await page.getByTestId('RegressionLineColor').getByTestId('ColorSwatch').nth(2).click();
});
