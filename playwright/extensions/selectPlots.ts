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
  await page.getByRole('option', { name: 'Breast Surgery Type' }).click();
}