import { ComboboxLikeRenderOptionInput, ComboboxParsedItem } from '@mantine/core';

export interface ComboboxStringItem {
  value: string;
  disabled?: boolean;
}
export interface ComboboxItem extends ComboboxStringItem {
  label: string;
}

export interface FilterOptionsInput {
  options: ComboboxParsedItem[];
  search: string;
  limit: number;
}

export type OptionsFilter = (input: FilterOptionsInput) => ComboboxParsedItem[];

export interface OptionsGroup {
  group: string;
  items: ComboboxItem[];
}

export type OptionsData = (ComboboxItem | OptionsGroup)[];

export interface OptionProps {
  data: ComboboxItem | OptionsGroup;
  withCheckIcon?: boolean;
  value?: string | string[] | null;
  checkIconPosition?: 'left' | 'right';
  unstyled: boolean | undefined;
  renderOption?: (input: ComboboxLikeRenderOptionInput<any>) => React.ReactNode;
}
