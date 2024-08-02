import { test, expect } from '@chromatic-com/playwright';
import { selectViolinPlot } from '../extensions/selectPlots';

test('subcategory selected', async ({ page }) => {
  await selectViolinPlot(page);
  await page.getByTestId('SingleSelectSubcategory').click();
  await page.getByRole('option', { name: 'Cellularity' }).click();

  await expect(page.locator('g[class="legend"]')).toBeVisible();

  await expect(page.locator('g[class="violinlayer mlayer"]').locator('g[class="trace violins"]')).toHaveCount(12);

  await expect(page.locator('g[class="violinlayer mlayer"]').locator('g[class="trace violins"]').first().locator('path')).toHaveCSS(
    'fill',
    'rgb(51, 122, 183)',
  );

  await expect(page.locator('g[class="violinlayer mlayer"]').locator('g[class="trace violins"]').nth(1).locator('path')).toHaveCSS('fill', 'rgb(236, 104, 54)');

  await expect(page.locator('g[class="violinlayer mlayer"]').locator('g[class="trace violins"]').nth(2).locator('path')).toHaveCSS(
    'fill',
    'rgb(117, 196, 194)',
  );

  await expect(page.locator('g[class="violinlayer mlayer"]').locator('g[class="trace violins"]').nth(3).locator('path')).toHaveCSS(
    'fill',
    'rgb(113, 120, 126)',
  );

  await expect(page.locator('g[class="violinlayer mlayer"]').locator('g[class="trace violins"]').nth(4).locator('path')).toHaveCSS('fill', 'rgb(51, 122, 183)');

  await expect(page.locator('g[class="violinlayer mlayer"]').locator('g[class="trace violins"]').nth(5).locator('path')).toHaveCSS('fill', 'rgb(236, 104, 54)');

  await expect(page.locator('g[class="violinlayer mlayer"]').locator('g[class="trace violins"]').nth(6).locator('path')).toHaveCSS(
    'fill',
    'rgb(117, 196, 194)',
  );

  await expect(page.locator('g[class="violinlayer mlayer"]').locator('g[class="trace violins"]').nth(7).locator('path')).toHaveCSS(
    'fill',
    'rgb(113, 120, 126)',
  );

  await expect(page.locator('g[class="violinlayer mlayer"]').locator('g[class="trace violins"]').nth(8).locator('path')).toHaveCSS('fill', 'rgb(51, 122, 183)');

  await expect(page.locator('g[class="violinlayer mlayer"]').locator('g[class="trace violins"]').nth(9).locator('path')).toHaveCSS('fill', 'rgb(236, 104, 54)');

  await expect(page.locator('g[class="violinlayer mlayer"]').locator('g[class="trace violins"]').nth(10).locator('path')).toHaveCSS(
    'fill',
    'rgb(117, 196, 194)',
  );

  await expect(page.locator('g[class="violinlayer mlayer"]').locator('g[class="trace violins"]').nth(11).locator('path')).toHaveCSS(
    'fill',
    'rgb(113, 120, 126)',
  );
});
