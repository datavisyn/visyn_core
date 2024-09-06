import { test, expect } from '@chromatic-com/playwright';
import { selectCorrelationPlot } from '../extensions/selectPlots';

test('maximum p-value: 0', async ({ page }) => {
  await selectCorrelationPlot(page);
  await page.getByTestId('MaxPValueInput').click();
  for (let index = 0; index < '0.5'.length; index++) {
    await page.keyboard.press('Backspace');
  }
  await page.keyboard.type('0');
  await page.keyboard.press('Enter');
});

test('maximum p-value: 1', async ({ page }) => {
  await selectCorrelationPlot(page);
  await page.getByTestId('MaxPValueInput').click();
  for (let index = 0; index < '0.5'.length; index++) {
    await page.keyboard.press('Backspace');
  }
  await page.keyboard.type('1');
  await page.keyboard.press('Enter');
});
