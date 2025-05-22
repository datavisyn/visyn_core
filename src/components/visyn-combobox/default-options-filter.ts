import { ComboboxItem, ComboboxParsedItem, isOptionsGroup } from '@mantine/core';

import { ComboboxItemWithDescription, ComboboxParsedItemWithDescription, ComboboxParsedItemWithDescriptionGroup, OptionsFilter } from './interfaces';

export interface FilterOptionsInput {
  options: ComboboxParsedItem[];
  search: string;
  limit: number;
}

export function defaultOptionsFilter({ options, search, limit }: FilterOptionsInput): ComboboxParsedItem[] {
  const parsedSearch = search.trim().toLowerCase();
  const result: ComboboxParsedItem[] = [];

  for (let i = 0; i < options.length; i += 1) {
    const item = options[i]!;

    if (result.length === limit) {
      return result;
    }

    if (isOptionsGroup(item)) {
      result.push({
        group: item.group,
        items: defaultOptionsFilter({
          options: item.items,
          search,
          limit: limit - result.length,
        }) as ComboboxItem[],
      });
    }

    if (!isOptionsGroup(item)) {
      if (item.label.toLowerCase().includes(parsedSearch)) {
        result.push(item);
      }
    }
  }

  return result;
}

export const defaultOptionsFilterWithDescription = <D extends ComboboxParsedItemWithDescription>(
  args: Parameters<OptionsFilter<D>>[0],
): ReturnType<OptionsFilter<D>> => {
  const { options, search, limit } = args;
  const parsedSearch = search.trim().toLowerCase();
  const result: D[] = [];

  for (let i = 0; i < options.length; i += 1) {
    const item = options[i]!;

    if (result.length === limit) {
      return result;
    }

    if (isOptionsGroup(item)) {
      // TODO: Moritz check typing
      result.push({
        group: item.group,
        items: defaultOptionsFilterWithDescription({
          options: item.items,
          search,
          limit: limit - result.length,
        }) as ComboboxItemWithDescription[],
      } as ComboboxParsedItemWithDescriptionGroup as D);
    }

    if (!isOptionsGroup(item)) {
      if (item.label.toLowerCase().includes(parsedSearch) || item.description?.toLowerCase().includes(parsedSearch)) {
        result.push(item);
      }
    }
  }
  return result;
};
