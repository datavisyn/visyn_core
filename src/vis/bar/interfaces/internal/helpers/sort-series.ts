import type { BarSeriesOption } from 'echarts/charts';

import { NAN_REPLACEMENT } from '../../../../general/constants';
import { EBarDirection, EBarSortState } from '../../enums';

/**
 * Sorts the series data based on the specified order.
 *
 * For input data like below:
 * ```ts
 * const series = [{
 *   categories: ["Unknown", "High", "Moderate", "Low"],
 *   data: [26, 484, 389, 111],
 * },{
 *   categories: ["Unknown", "High", "Moderate", "Low"],
 *   data: [22, 344, 239, 69],
 * },{
 *   categories: ["Unknown", "High", "Moderate", "Low"],
 *   data: [6, 111, 83, 20],
 * }];
 * ```
 *
 * This function would return an output like below:
 * ```ts
 * const sortedSeries = [{ // The total of `Moderate` is the highest, sorted in descending order and `Unknown` is placed last no matter what.
 *   categories: ["Moderate", "Low", "High", "Unknown"],
 *   data: [111, 20, 83, 6],
 * },{
 *   categories: ["Moderate", "Low", "High", "Unknown"],
 *   data: [239, 69, 344, 22],
 * },{
 *   categories: ["Moderate", "Low", "High", "Unknown"],
 *   data: [389, 484, 111, 26],
 * }]
 * ```
 *
 * This function uses `for` loop for maximum performance and readability.
 *
 * @param series
 * @param sortMetadata
 * @returns
 */
export function sortSeries(
  series: ({ categories: string[]; data: BarSeriesOption['data'] } | null)[],
  sortMetadata: { sortState: { x: EBarSortState; y: EBarSortState }; direction: EBarDirection } = {
    sortState: { x: EBarSortState.NONE, y: EBarSortState.NONE },
    direction: EBarDirection.HORIZONTAL,
  },
): ({ categories: string[]; data: BarSeriesOption['data'] } | null)[] {
  if (!series) {
    return [];
  }
  // Step 1: Aggregate the data
  const aggregatedData: { [key: string]: number } = {};
  let unknownCategorySum = 0;
  for (const s of series) {
    for (let i = 0; i < (s?.categories ?? []).length; i++) {
      const category = s?.categories[i] as string;
      const value = (s?.data?.[i] as number) || 0;
      if (category === 'Unknown') {
        unknownCategorySum += value;
      } else {
        if (!aggregatedData[category]) {
          aggregatedData[category] = 0;
        }
        aggregatedData[category] += value;
      }
    }
  }

  // Add the 'Unknown' category at the end
  aggregatedData[NAN_REPLACEMENT] = unknownCategorySum;

  // NOTE: @dv-usama-ansari: filter out keys with 0 values
  for (const key in aggregatedData) {
    if (aggregatedData[key] === 0) {
      delete aggregatedData[key];
    }
  }

  // Step 2: Sort the aggregated data
  // NOTE: @dv-usama-ansari: Code optimized for readability.
  const sortedCategories = Object.keys(aggregatedData).sort((a, b) => {
    if (a === NAN_REPLACEMENT) {
      return 1;
    }
    if (b === NAN_REPLACEMENT) {
      return -1;
    }
    if (sortMetadata.direction === EBarDirection.HORIZONTAL) {
      if (sortMetadata.sortState.x === EBarSortState.ASCENDING) {
        return (aggregatedData[a] as number) - (aggregatedData[b] as number);
      }
      if (sortMetadata.sortState.x === EBarSortState.DESCENDING) {
        return (aggregatedData[b] as number) - (aggregatedData[a] as number);
      }
      if (sortMetadata.sortState.y === EBarSortState.ASCENDING) {
        return a.localeCompare(b);
      }
      if (sortMetadata.sortState.y === EBarSortState.DESCENDING) {
        return b.localeCompare(a);
      }
      if (sortMetadata.sortState.x === EBarSortState.NONE) {
        // NOTE: @dv-usama-ansari: Sort according to the original order
        //  SLOW CODE because of using `indexOf`!
        // return originalOrder.indexOf(a) - originalOrder.indexOf(b);
        return 0;
      }
      if (sortMetadata.sortState.y === EBarSortState.NONE) {
        // NOTE: @dv-usama-ansari: Sort according to the original order
        //  SLOW CODE because of using `indexOf`!
        // return originalOrder.indexOf(a) - originalOrder.indexOf(b);
        return 0;
      }
    }
    if (sortMetadata.direction === EBarDirection.VERTICAL) {
      if (sortMetadata.sortState.x === EBarSortState.ASCENDING) {
        return a.localeCompare(b);
      }
      if (sortMetadata.sortState.x === EBarSortState.DESCENDING) {
        return b.localeCompare(a);
      }
      if (sortMetadata.sortState.y === EBarSortState.ASCENDING) {
        return (aggregatedData[a] as number) - (aggregatedData[b] as number);
      }
      if (sortMetadata.sortState.y === EBarSortState.DESCENDING) {
        return (aggregatedData[b] as number) - (aggregatedData[a] as number);
      }
      if (sortMetadata.sortState.x === EBarSortState.NONE) {
        // NOTE: @dv-usama-ansari: Sort according to the original order
        //  SLOW CODE because of using `indexOf`!
        // return originalOrder.indexOf(a) - originalOrder.indexOf(b);
        return 0;
      }
      if (sortMetadata.sortState.y === EBarSortState.NONE) {
        // NOTE: @dv-usama-ansari: Sort according to the original order
        //  SLOW CODE because of using `indexOf`!
        // return originalOrder.indexOf(a) - originalOrder.indexOf(b);
        return 0;
      }
    }
    return 0;
  });

  // Create a mapping of categories to their sorted indices
  const categoryIndexMap: { [key: string]: number } = {};
  for (let i = 0; i < sortedCategories.length; i++) {
    categoryIndexMap[sortedCategories[i] as string] = i;
  }

  // Step 3: Sort each series according to the sorted categories
  const sortedSeries: typeof series = [];
  for (const s of series) {
    const sortedData = new Array(sortedCategories.length).fill(null);
    for (let i = 0; i < (s?.categories ?? []).length; i++) {
      // NOTE: @dv-usama-ansari: index of the category in the sorted array
      sortedData[categoryIndexMap[s?.categories?.[i] as string] as number] = s?.data?.[i];
    }
    sortedSeries.push({
      ...s,
      categories: sortedCategories,
      data: sortedData,
    });
  }

  return sortedSeries;
}
