import { test, expect } from '@chromatic-com/playwright';
import { selectHexbin } from '../extensions/selectPlots';

test('no color selected', async ({ page }) => {
  await selectHexbin(page);
  await page.getByTestId('SingleSelectCloseButton').click();
  await expect(page.getByTestId('PlotLegend')).not.toBeVisible();
  await expect(page.getByTestId('HexbinOptionSelect')).not.toBeVisible();
});

test('color selected: option color', async ({ page }) => {
  await selectHexbin(page);
  await expect(page.getByTestId('PlotLegend')).toBeVisible();
  await expect(page.getByTestId('HexbinOptionSelect')).toBeVisible();
});

test('color selected: option bins', async ({ page }) => {
  await selectHexbin(page);
  await expect(page.getByTestId('PlotLegend')).toBeVisible();
  await page.getByTestId('HexbinOptionSelect').click();
  await page.getByRole('option', { name: 'Bins' }).click();
});

test('color selected: option pie', async ({ page }) => {
  await selectHexbin(page);
  await expect(page.getByTestId('PlotLegend')).toBeVisible();
  await page.getByTestId('HexbinOptionSelect').click();
  await page.getByRole('option', { name: 'Pie' }).click();
});
