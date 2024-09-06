import { test, expect } from '@chromatic-com/playwright';
import { selectViolinPlot } from '../extensions/selectPlots';

test('subcategory selected', async ({ page }) => {
  await selectViolinPlot(page);
  await page.getByTestId('SingleSelectSubcategory').click();
  await page.getByRole('option', { name: 'Cellularity' }).click();

  await expect(page.locator('g[class="legend"]')).toBeVisible();
});
