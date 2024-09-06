import { Page } from '@playwright/test';

export async function selectViolinPlot(page: Page) {
  await page.goto('/');
  await page.getByTestId('SelectVisualizationType').click();
  await page.getByRole('option', { name: 'Violin plot' }).click();
}

export async function selectBoxPlot(page: Page) {
  await page.goto('/');
  await page.getByTestId('SelectVisualizationType').click();
  await page.getByRole('option', { name: 'Box plot' }).click();

  // select columns for plot to make sense
  await page.getByTestId('SingleSelectCategorical column').click();
  await page.getByRole('option', { name: 'Breast Surgery Type Sparse' }).click();
}

export async function selectHeatmap(page: Page) {
  await page.goto('/');
  await page.getByTestId('SelectVisualizationType').click();
  await page.getByRole('option', { name: 'Heatmap plot' }).click();

  await page.getByTestId('MultiSelect').click();
  await page.getByRole('option', { name: 'Breast Surgery Type Sparse' }).click();
  await page.getByRole('option', { name: 'Cellularity' }).click();
  await page.getByTestId('MultiSelect').click();
}

export async function selectHexbin(page: Page) {
  await page.goto('/');
  await page.getByTestId('SelectVisualizationType').click();
  await page.getByRole('option', { name: 'Hexbin plot' }).click();
}

export async function selectCorrelationPlot(page: Page) {
  await page.goto('/');
  await page.getByTestId('SelectVisualizationType').click();
  await page.getByRole('option', { name: 'Correlation plot' }).click();
}
