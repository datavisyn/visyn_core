import { Page } from '@playwright/test';

export async function selectViolinPlot(page: Page) {
  await page.goto('/');
  await page.getByTestId('SelectVisualizationType').click();
  await page.getByRole('option', { name: 'Violin plot' }).click();

  // select columns for plot to make sense
  await page.getByTestId('MultiSelectCloseButton').click();
  await page.getByTestId('MultiSelect').click();
  await page.getByRole('option', { name: 'Cohort' }).click();
  await page.getByTestId('MultiSelect').click();
  await page.getByTestId('SingleSelectCategorical column').click();
  await page.getByRole('option', { name: 'Breast Surgery Type' }).first().click();
}

export async function selectBoxPlot(page: Page) {
  await page.goto('/');
  await page.getByTestId('SelectVisualizationType').click();
  await page.getByRole('option', { name: 'Box plot' }).click();

  // select columns for plot to make sense
  await page.getByTestId('SingleSelectCategorical column').click();
  await page.getByRole('option', { name: 'Breast Surgery Type' }).click();
}

export async function selectHeatmap(page: Page) {
  await page.goto('/');
  await page.getByTestId('SelectVisualizationType').click();
  await page.getByRole('option', { name: 'Heatmap plot' }).click();

  await page.getByTestId('MultiSelect').click();
  await page.getByRole('option', { name: 'Breast Surgery Type' }).click();
  await page.getByRole('option', { name: 'Cellularity' }).click();
  await page.getByTestId('MultiSelect').click();
}

export async function selectHexbin(page: Page) {
  await page.goto('/');
  await page.getByTestId('SelectVisualizationType').click();
  await page.getByRole('option', { name: 'Hexbin plot' }).click();
}
