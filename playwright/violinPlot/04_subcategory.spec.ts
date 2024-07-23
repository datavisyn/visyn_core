import { test, expect } from '@playwright/test';
import { selectViolinPlot } from '../extensions/selectPlots';

test.only('subcategory selected', async ({ page }) => {
  await selectViolinPlot(page);
  await page.getByTestId('SingleSelectSubcategory').click();
  await page.getByRole('option', { name: 'Cellularity' }).click();
  await expect(page.locator('g[class="violinlayer mlayer"]').locator('g[class="trace violins"]')).toHaveCount(12);

  await expect(page.locator('g[class="violinlayer mlayer"]').locator('g[class="trace violins"]').first().locator('path')).toHaveCSS(
    'fill',
    'rgb(51, 122, 183)',
  );
});
