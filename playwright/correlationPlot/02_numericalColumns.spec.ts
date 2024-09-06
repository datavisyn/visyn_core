import { test, expect } from '@chromatic-com/playwright';
import { selectCorrelationPlot } from '../extensions/selectPlots';

test('none and one numerical column selected', async ({ page }) => {
  await selectCorrelationPlot(page);
  await page.getByTestId('MultiSelectCloseButton').click();

  // no numerical column selected
  await expect(page.getByRole('alert')).toBeVisible();

  // one numerical column selected
  await page.getByTestId('MultiSelect').click();
  await page.getByRole('option', { name: 'Cohort' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
});

test('two numerical columns selected', async ({ page }) => {
  await selectCorrelationPlot(page);
  await expect((await page.locator('svg > g > g').all()).length).toEqual(3);
});

test('three numerical columns selected', async ({ page }) => {
  await selectCorrelationPlot(page);
  await page.getByTestId('MultiSelect').click();
  await page.getByRole('option', { name: 'Cohort' }).click();
  await expect((await page.locator('svg > g > g').all()).length).toEqual(6);
});
