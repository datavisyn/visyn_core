import { test, expect } from '@chromatic-com/playwright';
import { selectHexbin } from '../extensions/selectPlots';

test('no and one numerical column selected', async ({ page }) => {
  await selectHexbin(page);
  await page.getByTestId('MultiSelectCloseButton').click();

  await expect(page.getByRole('alert')).toBeVisible();

  await page.getByTestId('MultiSelect').click();
  await page.getByRole('option', { name: 'Cohort' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
});

test('two numerical columns selected', async ({ page }) => {
  await selectHexbin(page);
  await expect(page.getByTestId('YAxisDescription')).toHaveText('STAT2');
  await expect(page.getByTestId('XAxisDescription')).toHaveText('BRCA1');
});

test('three numerical columns selected', async ({ page }) => {
  await selectHexbin(page);
  await page.getByTestId('MultiSelect').click();
  await page.getByRole('option', { name: 'Cohort' }).click();
  await expect((await page.getByTestId('hexbinPlotGrid').locator('svg').all()).length).toEqual(6);
});
