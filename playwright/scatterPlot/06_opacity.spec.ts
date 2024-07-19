import { test, expect } from '@playwright/test';

test('full opacity', async ({ page }) => {
  await page.goto('/');
  const opacitySlider = await page.getByTestId('OpacitySlider').locator('div[class$="Slider-track"]');
  const opacitySliderWidth = await opacitySlider.evaluate((el) => {
    return el.getBoundingClientRect().width;
  });
  const opacitySliderHeight = await opacitySlider.evaluate((el) => {
    return el.getBoundingClientRect().height;
  });

  await page
    .getByTestId('OpacitySlider')
    .locator('div[class$="Slider-track"]')
    .click({ position: { x: opacitySliderWidth, y: opacitySliderHeight } });

  await expect(page.locator('div[class="js-plotly-plot"]')).toHaveScreenshot('ScatterPlotInitialState.png');
});

test('no opacity', async ({ page }) => {
  await page.goto('/');
  await page
    .getByTestId('OpacitySlider')
    .locator('div[class$="Slider-track"]')
    .click({ position: { x: 0, y: 0 } });
  await expect(page.locator('div[class="js-plotly-plot"]')).toHaveScreenshot('ScatterPlotNoOpacity.png');
});
