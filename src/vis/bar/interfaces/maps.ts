import { EBarSortState } from './enums';

export const SortDirectionMap: Record<EBarSortState, string> = {
  [EBarSortState.NONE]: 'Unsorted',
  [EBarSortState.ASCENDING]: 'Ascending',
  [EBarSortState.DESCENDING]: 'Descending',
};
