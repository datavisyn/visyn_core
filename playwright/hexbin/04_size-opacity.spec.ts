import { test } from '@chromatic-com/playwright';
import { selectHexbin } from '../extensions/selectPlots';

test('minimum size', async ({ page }) => {
  await selectHexbin(page);
  await page
    .getByTestId('HexSizeSlider')
    .locator('div[class$="Slider-track"]')
    .click({ position: { x: 0, y: 0 } });
});

test('maximum size', async ({ page }) => {
  await selectHexbin(page);
  const hexSizeSlider = await page.getByTestId('HexSizeSlider').locator('div[class$="Slider-track"]');
  const hexSizeSliderWidth = await hexSizeSlider.evaluate((el) => {
    return el.getBoundingClientRect().width;
  });
  const hexSizeSliderHeight = await hexSizeSlider.evaluate((el) => {
    return el.getBoundingClientRect().height;
  });

  await page
    .getByTestId('HexSizeSlider')
    .locator('div[class$="Slider-track"]')
    .click({ position: { x: hexSizeSliderWidth - 1, y: hexSizeSliderHeight - 1 }, force: true });
  await page.waitForTimeout(1000);
});

test('size scale', async ({ page }) => {
  await selectHexbin(page);
  await page.locator('div[class$="Switch-track"]').first().click();
});

test('no opacity', async ({ page }) => {
  await selectHexbin(page);
  await page.locator('label').filter({ hasText: 'Opacity scale' }).locator('span').first().click();
  await page.waitForTimeout(20000);
});
