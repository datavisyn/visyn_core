import { test, expect } from '@chromatic-com/playwright';
import { selectBoxPlot } from '../extensions/selectPlots';

test('no numerical columns selected', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('SelectVisualizationType').click();
  await page.getByRole('option', { name: 'Box plot' }).click();
  await page.getByTestId('MultiSelectCloseButton').click();
  await expect(page.getByRole('alert')).toBeVisible();
});

// TODO: test will fail due to line 25
// test('one numerical column selected', async ({ page }) => {
//   await selectBoxPlot(page);
//   await page.getByTestId('MultiSelect').locator('span[class*="Pill-root"]').last().locator('button').click();
//   await page.getByTestId('SingleSelectCloseButton').click();

//   await expect(page.locator('g[class="subplot x2y2"]')).not.toBeVisible();
//   await expect(page.getByTestId('ViolinYAxisSegmentedControl').locator('div[class*="SegmentedControl-control"]').first().locator('input')).toBeDisabled();

//   await expect(page.locator('g[class="g-xtitle"]').locator('foreignObject')).not.toBeVisible();
//   await expect(page.locator('g[class="g-ytitle"]').locator('foreignObject')).not.toBeVisible();
// });

/*
    TODO: test will fail due to line 38 and 40
  */
// test('two numerical columns selected', async ({ page }) => {
//   await selectBoxPlot(page);
//   await page.getByTestId('SingleSelectCloseButton').click();

//   await expect(page.getByTestId('SingleSelectFacets')).toBeDisabled();
//   await expect(page.locator('g[class="g-xtitle"]').locator('foreignObject')).not.toBeVisible();
//   await expect(page.locator('g[class="g-ytitle"]').locator('foreignObject')).not.toBeVisible();
//   await expect(page.locator('g[class="g-x2title"]').locator('foreignObject')).not.toBeVisible();
//   await expect(page.locator('g[class="g-y2title"]').locator('foreignObject')).not.toBeVisible();
// });
