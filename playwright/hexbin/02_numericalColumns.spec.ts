import { test, expect } from '@chromatic-com/playwright';
import { selectHexbin } from '../extensions/selectPlots';

test('no and one numerical column selected', async ({ page }) => {
  await selectHexbin(page);
  await page.getByTestId('MultiSelectCloseButton').click();

  await expect(page.getByRole('alert')).toBeVisible();

  await page.getByTestId('MultiSelect').click();
  await page.getByRole('option', { name: 'Cohort' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
});
