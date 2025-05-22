import { ComboboxParsedItem } from '@mantine/core';

export interface FilterOptionsInput<D extends ComboboxParsedItem> {
  options: D[];
  search: string;
  limit: number;
}

export type OptionsFilter<D extends ComboboxParsedItem> = (input: FilterOptionsInput<D>) => D[];
