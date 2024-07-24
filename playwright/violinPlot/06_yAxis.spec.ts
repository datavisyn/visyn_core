import { test, expect } from '@playwright/test';
import { selectViolinPlot } from '../extensions/selectPlots';

test.only('unsynced', async ({ page }) => {
  await selectViolinPlot(page);

  await page.getByTestId('MultiSelect').click();
  await page.getByRole('option', { name: 'Neoplasm Histologic Grade' }).click();
  await page.getByTestId('MultiSelect').click();
  const valueLeftChart = await page
    .locator('g[class="subplot xy"]')
    .locator('g[class="yaxislayer-above"]')
    .locator('g[class="ytick"]')
    .last()
    .locator('text')
    .textContent();

  expect(
    await page.locator('g[class="subplot x2y2"]').locator('g[class="yaxislayer-above"]').locator('g[class="y2tick"]').last().locator('text').textContent(),
  ).not.toEqual(valueLeftChart);
});
