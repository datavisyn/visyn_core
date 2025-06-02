import { isOptionsGroup } from '@mantine/core';

import { VisynComboboxParsedItem, VisynOptionsFilter } from './interfaces';

export const defaultVisynOptionsFilter = <Data extends VisynComboboxParsedItem>(
  args: Parameters<VisynOptionsFilter<Data>>[0],
): ReturnType<VisynOptionsFilter<Data>> => {
  const { options, search, limit } = args;
  const parsedSearch = search.trim().toLowerCase();
  const result: D[] = [];

  for (let i = 0; i < options.length; i += 1) {
    const item = options[i]!;

    if (result.length === limit) {
      return result;
    }

    if (isOptionsGroup(item)) {
      result.push({
        group: item.group,
        items: defaultVisynOptionsFilter({
          options: item.items,
          search,
          limit: limit - result.length,
        }),
        // We need to cast here because the mantine function is not generic
      } as Data);
    }

    if (!isOptionsGroup(item)) {
      if (item.label.toLowerCase().includes(parsedSearch) || item.description?.toLowerCase().includes(parsedSearch)) {
        result.push(item);
      }
    }
  }
  return result;
};
