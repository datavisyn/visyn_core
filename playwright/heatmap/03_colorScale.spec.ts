import { test, expect } from '@playwright/test';
import { selectHeatmap } from '../extensions/selectPlots';

test.only('blue color scale', async ({ page }) => {
  await selectHeatmap(page);
});
