import { test, expect } from '@chromatic-com/playwright';
import { selectBoxPlot } from '../extensions/selectPlots';

test('one categorical column selected', async ({ page }) => {
  await selectBoxPlot(page);

  await expect(page.getByTestId('SingleSelectFacets')).toBeDisabled();
  await expect(page.locator('g[class="g-xtitle"]').locator('foreignObject')).toBeVisible();
  await expect(page.locator('g[class="g-ytitle"]').locator('foreignObject')).toBeVisible();
  await expect(page.locator('g[class="g-x2title"]').locator('foreignObject')).toBeVisible();
  await expect(page.locator('g[class="g-y2title"]').locator('foreignObject')).toBeVisible();

  await expect(page.locator('g[class="trace boxes"]')).toHaveCount(6);
});
