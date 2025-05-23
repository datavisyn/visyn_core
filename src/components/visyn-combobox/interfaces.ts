import { ComboboxItem, ComboboxParsedItem, ComboboxParsedItemGroup } from '@mantine/core';

export interface FilterOptionsInput<D extends ComboboxParsedItem> {
  options: D[];
  search: string;
  limit: number;
}

export type OptionsFilter<D extends ComboboxParsedItem> = (input: FilterOptionsInput<D>) => D[];

export interface ComboboxItemWithDescription extends ComboboxItem {
  description?: string;
}
export interface ComboboxParsedItemWithDescriptionGroup extends ComboboxParsedItemGroup {
  items: ComboboxItemWithDescription[];
}

export type ComboboxParsedItemWithDescription = ComboboxItemWithDescription | ComboboxParsedItemWithDescriptionGroup;
