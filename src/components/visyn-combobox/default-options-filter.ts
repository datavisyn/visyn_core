import { ComboboxItem, ComboboxParsedItem, ComboboxParsedItemGroup, isOptionsGroup } from '@mantine/core';

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
interface ComboboxItemWithDescription extends ComboboxItem {
  description?: string;
}
export interface ComboboxParsedItemWithDescriptionGroup extends ComboboxParsedItemGroup {
  items: ComboboxItemWithDescription[];
}

export type ComboboxParsedItemWithDescription = ComboboxItemWithDescription | ComboboxParsedItemWithDescriptionGroup;

interface FilterOptionsInputWithDescription extends FilterOptionsInput {
  options: (ComboboxParsedItem & { description?: string })[];
}

export function defaultOptionsFilterWithDescription({ options, search, limit }: FilterOptionsInputWithDescription): ComboboxParsedItemWithDescription[] {
  const parsedSearch = search.trim().toLowerCase();
  const result: ComboboxParsedItemWithDescription[] = [];

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
        }) as ComboboxItemWithDescription[],
      });
    }

    if (!isOptionsGroup(item)) {
      if (item.label.toLowerCase().includes(parsedSearch) || item.description?.toLowerCase().includes(parsedSearch)) {
        result.push(item);
      }
    }
  }
  return result;
}
