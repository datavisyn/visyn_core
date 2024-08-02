import { test, expect } from '@chromatic-com/playwright';
import { selectBoxPlot } from '../extensions/selectPlots';

test('subcategory selected', async ({ page }) => {
  await selectBoxPlot(page);
  await page.getByTestId('SingleSelectSubcategory').click();
  await page.getByRole('option', { name: 'Cellularity' }).click();
  await expect(page.locator('g[class="legend"]')).toBeVisible();
  await expect(page.locator('text[class="legendtext"]').first()).toHaveText('Cellularity');

  await expect(page.locator('g[class="subplot xy"]').locator('g[class="trace boxes"]').first().locator('path[class="box"]')).toHaveCSS(
    'fill',
    'rgb(51, 122, 183)',
  );

  await expect(page.locator('g[class="subplot xy"]').locator('g[class="trace boxes"]').nth(1).locator('path[class="box"]')).toHaveCSS(
    'fill',
    'rgb(236, 104, 54)',
  );

  await expect(page.locator('g[class="subplot xy"]').locator('g[class="trace boxes"]').nth(2).locator('path[class="box"]')).toHaveCSS(
    'fill',
    'rgb(117, 196, 194)',
  );

  await expect(page.locator('g[class="subplot xy"]').locator('g[class="trace boxes"]').nth(3).locator('path[class="box"]')).toHaveCSS(
    'fill',
    'rgb(113, 120, 126)',
  );
});
