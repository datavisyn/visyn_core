import { ComboboxItem, ComboboxParsedItem } from '@mantine/core';

export type VisynComboboxParsedItem = VisynComboboxItem | VisynComboboxParsedItemGroup;

export interface VisynFilterOptionsInput<D extends VisynComboboxParsedItem> {
  options: D[];
  search: string;
  limit: number;
}
export interface FilterOptionsInput<D extends ComboboxParsedItem> {
  options: D[];
  search: string;
  limit: number;
}

export type OptionsFilter<D extends ComboboxParsedItem> = (input: FilterOptionsInput<D>) => D[];

export type VisynOptionsFilter<Data extends VisynComboboxParsedItem> = (input: VisynFilterOptionsInput<Data>) => Data[];

export interface VisynComboboxItem extends ComboboxItem {
  description?: string;
}

export interface VisynComboboxParsedItemGroup<T = VisynComboboxItem> {
  group: string;
  items: T[];
}

export type ComboboxParsedItemWithDescription = VisynComboboxItem | VisynComboboxParsedItemGroup;
