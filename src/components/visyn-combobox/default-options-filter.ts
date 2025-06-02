import { isOptionsGroup } from '@mantine/core';

import { ComboboxParsedItemWithDescription, VisynOptionsFilter } from './interfaces';

export const defaultOptionsFilterWithDescription = <D extends ComboboxParsedItemWithDescription>(
  args: Parameters<VisynOptionsFilter<D>>[0],
): ReturnType<VisynOptionsFilter<D>> => {
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
        }),
      } as D);
    }

    if (!isOptionsGroup(item)) {
      if (item.label.toLowerCase().includes(parsedSearch) || item.description?.toLowerCase().includes(parsedSearch)) {
        result.push(item);
      }
    }
  }
  return result;
};
