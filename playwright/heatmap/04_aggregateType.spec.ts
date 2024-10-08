import { test, expect } from '@chromatic-com/playwright';
import { selectHeatmap } from '../extensions/selectPlots';

test('count', async ({ page }) => {
  await selectHeatmap(page);
  await page.getByTestId('AggregateTypeSelect').click();
  await page.getByRole('option', { name: 'Count' }).click();
  await expect(page.getByTestId('SingleSelectAggregate Column')).not.toBeVisible();

  await expect(page.getByTestId('ColorLegendScale0')).toHaveText('0.00');
  await expect(page.getByTestId('ColorLegendScale4')).toHaveText('694');
  await expect(page.getByTestId('ColorLegendTitle')).toHaveText('Count');
  await expect(page.locator('rect[class="css-rvf4eq"]').first()).toHaveCSS('fill', 'rgb(195, 233, 255)');
});

test('average', async ({ page }) => {
  await selectHeatmap(page);
  await page.getByTestId('AggregateTypeSelect').click();
  await page.getByRole('option', { name: 'Average' }).click();
  await page.getByTestId('SingleSelectAggregate Column').click();
  await page.getByRole('option', { name: 'STAT2' }).click();

  await expect(page.getByTestId('ColorLegendScale0')).toHaveText('−339m');
  await expect(page.getByTestId('ColorLegendScale4')).toHaveText('392m');
  await expect(page.getByTestId('ColorLegendTitle')).toHaveText('Average STAT2');
  await expect(page.locator('rect[class="css-rvf4eq"]').first()).toHaveCSS('fill', 'rgb(207, 246, 255)');
});

test('minimum', async ({ page }) => {
  await selectHeatmap(page);
  await page.getByTestId('AggregateTypeSelect').click();
  await page.getByRole('option', { name: 'Minimum' }).click();
  await page.getByTestId('SingleSelectAggregate Column').click();
  await page.getByRole('option', { name: 'STAT2' }).click();

  await expect(page.getByTestId('ColorLegendScale0')).toHaveText('−3.44');
  await expect(page.getByTestId('ColorLegendScale4')).toHaveText('−983m');
  await expect(page.getByTestId('ColorLegendTitle')).toHaveText('Minimum STAT2');
  await expect(page.locator('rect[class="css-rvf4eq"]').first()).toHaveCSS('fill', 'rgb(78, 119, 161)');
});

test('maximum', async ({ page }) => {
  await selectHeatmap(page);
  await page.getByTestId('AggregateTypeSelect').click();
  await page.getByRole('option', { name: 'Maximum' }).click();
  await page.getByTestId('SingleSelectAggregate Column').click();
  await page.getByRole('option', { name: 'STAT2' }).click();

  await expect(page.getByTestId('ColorLegendScale0')).toHaveText('1.15');
  await expect(page.getByTestId('ColorLegendScale4')).toHaveText('4.09');
  await expect(page.getByTestId('ColorLegendTitle')).toHaveText('Maximum STAT2');
  await expect(page.locator('rect[class="css-rvf4eq"]').first()).toHaveCSS('fill', 'rgb(83, 123, 165)');
});

test('median', async ({ page }) => {
  await selectHeatmap(page);
  await page.getByTestId('AggregateTypeSelect').click();
  await page.getByRole('option', { name: 'Median' }).click();
  await page.getByTestId('SingleSelectAggregate Column').click();
  await page.getByRole('option', { name: 'STAT2' }).click();

  await expect(page.getByTestId('ColorLegendScale0')).toHaveText('−501m');
  await expect(page.getByTestId('ColorLegendScale4')).toHaveText('474m');
  await expect(page.getByTestId('ColorLegendTitle')).toHaveText('Median STAT2');
  await expect(page.locator('rect[class="css-rvf4eq"]').first()).toHaveCSS('fill', 'rgb(207, 246, 255)');
});
