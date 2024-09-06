import { test, expect } from '@chromatic-com/playwright';
import { selectViolinPlot } from '../extensions/selectPlots';

test('unsynced', async ({ page }) => {
  await selectViolinPlot(page);

  await page.getByTestId('MultiSelect').click();
  await page.getByRole('option', { name: 'Neoplasm Histologic Grade' }).click();
  await page.getByTestId('MultiSelect').click();

  const valueLeftChartTop = await page
    .locator('g[class="subplot xy"]')
    .locator('g[class="yaxislayer-above"]')
    .locator('g[class="ytick"]')
    .last()
    .locator('text')
    .textContent();

  const valueRightChartTop = await page
    .locator('g[class="subplot x2y2"]')
    .locator('g[class="yaxislayer-above"]')
    .locator('g[class="y2tick"]')
    .last()
    .locator('text')
    .textContent();

  const valueLeftChartButton = await page
    .locator('g[class="subplot xy"]')
    .locator('g[class="yaxislayer-above"]')
    .locator('g[class="ytick"]')
    .first()
    .locator('text')
    .textContent();

  const valueRightChartButton = await page
    .locator('g[class="subplot x2y2"]')
    .locator('g[class="yaxislayer-above"]')
    .locator('g[class="y2tick"]')
    .first()
    .locator('text')
    .textContent();

  const buttonMatch = valueRightChartButton != valueLeftChartButton;
  const topMatch = valueRightChartTop != valueLeftChartTop;

  expect(buttonMatch || topMatch).toBeTruthy();
});

test('synced', async ({ page }) => {
  await selectViolinPlot(page);
  await page.getByTestId('MultiSelect').click();
  await page.getByRole('option', { name: 'Neoplasm Histologic Grade' }).click();
  await page.getByTestId('MultiSelect').click();

  await page.getByTestId('ViolinYAxisSegmentedControl').locator('div[class*="SegmentedControl-control"]').nth(1).click();
  const valueLeftChartTop = await page
    .locator('g[class="subplot xy"]')
    .locator('g[class="yaxislayer-above"]')
    .locator('g[class="ytick"]')
    .last()
    .locator('text')
    .textContent();

  const valueRightChartTop = await page
    .locator('g[class="subplot x2y2"]')
    .locator('g[class="yaxislayer-above"]')
    .locator('g[class="y2tick"]')
    .last()
    .locator('text')
    .textContent();

  const valueLeftChartButton = await page
    .locator('g[class="subplot xy"]')
    .locator('g[class="yaxislayer-above"]')
    .locator('g[class="ytick"]')
    .first()
    .locator('text')
    .textContent();

  const valueRightChartButton = await page
    .locator('g[class="subplot x2y2"]')
    .locator('g[class="yaxislayer-above"]')
    .locator('g[class="y2tick"]')
    .first()
    .locator('text')
    .textContent();

  const buttonMatch = valueRightChartButton == valueLeftChartButton;
  const topMatch = valueRightChartTop == valueLeftChartTop;

  expect(buttonMatch && topMatch).toBeTruthy();
});

test('merged', async ({ page }) => {
  await selectViolinPlot(page);
  await page.getByTestId('MultiSelect').click();
  await page.getByRole('option', { name: 'Neoplasm Histologic Grade' }).click();
  await page.getByTestId('MultiSelect').click();

  await page.getByTestId('ViolinYAxisSegmentedControl').locator('div[class*="SegmentedControl-control"]').last().click();

  await expect(page.getByTestId('SingleSelectSubcategory')).toBeDisabled();
  await expect(page.getByTestId('SingleSelectFacets')).toBeDisabled();
  await expect(page.locator('g[class="g-ytitle"]').locator('text')).toHaveText('Merged axis');
});
