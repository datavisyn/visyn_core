import { test, expect } from '@chromatic-com/playwright';
import { selectViolinPlot } from '../extensions/selectPlots';

test('no numerical column selected', async ({ page }) => {
  await selectViolinPlot(page);

  await page.getByTestId('MultiSelectCloseButton').click();
  await expect(page.getByRole('alert')).toBeVisible();
});

test('one numerical column selected', async ({ page }) => {
  await selectViolinPlot(page);
  await page.getByTestId('MultiSelect').locator('button').first().click();
  await expect(page.getByTestId('ViolinYAxisSegmentedControl').locator('div[class*="SegmentedControl-control"]').first().locator('label')).toBeDisabled();
});

test('two numerical columns selected', async ({ page }) => {
  await selectViolinPlot(page);

  await expect(page.locator('g[class="x2y2"]')).toBeVisible();
  await expect(page.locator('g[class="g-y2title"]').locator('text')).toHaveText('BRCA1: Gene expressi…');
  await expect(page.getByTestId('ViolinYAxisSegmentedControl').locator('div[class*="SegmentedControl-control"]').first().locator('label')).toBeEnabled();
  await expect(page.getByTestId('SingleSelectFacets')).toBeDisabled();
});
