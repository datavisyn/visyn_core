import { test, expect } from '@playwright/test';
import { selectBoxPlot } from '../extensions/selectPlots';

test('unsynced', async ({ page }) => {
  await selectBoxPlot(page);

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
  await selectBoxPlot(page);

  await page.getByTestId('ViolinYAxisSegmentedControl').locator('div[class*="SegmentedControl-control"]').last().click();
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
