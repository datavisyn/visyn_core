import { test, expect } from '@playwright/test';
import { selectHexbin } from '../extensions/selectPlots';

test('rectangle brush', async ({ page }) => {
  selectHexbin(page);
  await page.getByTestId;
});
