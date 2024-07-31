import { test, expect } from '@playwright/test';
import { selectHeatmap } from '../extensions/selectPlots';

test('count', async ({ page }) => {
  await selectHeatmap(page);
  await page.getByTestId('AggregateTypeSelect').click();
  await page.getByRole('option', { name: 'Count' }).click();
  await expect(page.getByTestId('SingleSelectAggregate Column')).not.toBeVisible();

  await expect(page.getByTestId('ColorLegendScale0')).toHaveText('0.00');
  await expect(page.getByTestId('ColorLegendScale4')).toHaveText('544');
  await expect(page.getByTestId('ColorLegendTitle')).toHaveText('Count');
  await expect(page.locator('rect[class="css-rvf4eq"]').first()).toHaveCSS('fill', 'rgb(207, 246, 255)');
});

test('average', async ({ page }) => {
  await selectHeatmap(page);
  await page.getByTestId('AggregateTypeSelect').click();
  await page.getByRole('option', { name: 'Average' }).click();
  await page.getByTestId('SingleSelectAggregate Column').click();
  await page.getByRole('option', { name: 'STAT2' }).click();

  await expect(page.getByTestId('ColorLegendScale0')).toHaveText('−970m');
  await expect(page.getByTestId('ColorLegendScale4')).toHaveText('1.01');
  await expect(page.getByTestId('ColorLegendTitle')).toHaveText('Average STAT2');
  await expect(page.locator('rect[class="css-rvf4eq"]').first()).toHaveCSS('fill', 'rgb(0, 34, 69)');
});

test('minimum', async ({ page }) => {
  await selectHeatmap(page);
  await page.getByTestId('AggregateTypeSelect').click();
  await page.getByRole('option', { name: 'Minimum' }).click();
  await page.getByTestId('SingleSelectAggregate Column').click();
  await page.getByRole('option', { name: 'STAT2' }).click();

  await expect(page.getByTestId('ColorLegendScale0')).toHaveText('−4.49');
  await expect(page.getByTestId('ColorLegendScale4')).toHaveText('1.10');
  await expect(page.getByTestId('ColorLegendTitle')).toHaveText('Minimum STAT2');
  await expect(page.locator('rect[class="css-rvf4eq"]').first()).toHaveCSS('fill', 'rgb(0, 34, 69)');
});

test('maximum', async ({ page }) => {
  await selectHeatmap(page);
  await page.getByTestId('AggregateTypeSelect').click();
  await page.getByRole('option', { name: 'Maximum' }).click();
  await page.getByTestId('SingleSelectAggregate Column').click();
  await page.getByRole('option', { name: 'STAT2' }).click();

  await expect(page.getByTestId('ColorLegendScale0')).toHaveText('−77.2m');
  await expect(page.getByTestId('ColorLegendScale4')).toHaveText('4.21');
  await expect(page.getByTestId('ColorLegendTitle')).toHaveText('Maximum STAT2');
  await expect(page.locator('rect[class="css-rvf4eq"]').first()).toHaveCSS('fill', 'rgb(146, 185, 231)');
});

test('median', async ({ page }) => {
  await selectHeatmap(page);
  await page.getByTestId('AggregateTypeSelect').click();
  await page.getByRole('option', { name: 'Median' }).click();
  await page.getByTestId('SingleSelectAggregate Column').click();
  await page.getByRole('option', { name: 'STAT2' }).click();

  await expect(page.getByTestId('ColorLegendScale0')).toHaveText('−991m');
  await expect(page.getByTestId('ColorLegendScale4')).toHaveText('1.01');
  await expect(page.getByTestId('ColorLegendTitle')).toHaveText('Median STAT2');
  await expect(page.locator('rect[class="css-rvf4eq"]').first()).toHaveCSS('fill', 'rgb(0, 34, 69)');
});
