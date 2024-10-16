import { EBarDirection, EBarSortState } from '../../enums';
import { sortSeries } from './sort-series';

describe('sortSeries', () => {
  // TODO: @dv-usama-ansari: Add tests for sortSeries for different combinations of data:
  //  - series: empty array
  //  - series: very large number of elements
  //  - series: null values
  //  - test for all configurations of sortMetadata

  // NOTE: @dv-usama-ansari: This test might be obsolete when the dataset of echarts is used.
  it('should return an array of sorted series', () => {
    const series: Parameters<typeof sortSeries>['0'] = [];
    const sortMetadata: Parameters<typeof sortSeries>['1'] = {
      direction: EBarDirection.HORIZONTAL,
      sortState: { x: EBarSortState.NONE, y: EBarSortState.NONE },
    };
    const sortedSeries = sortSeries(series, sortMetadata);
    expect(sortedSeries).toBeInstanceOf(Array);
    expect(sortedSeries.length).toBe(series.length);
  });

  it('should return an array of sorted series with the same length as the input series', () => {
    const series: Parameters<typeof sortSeries>['0'] = [
      {
        data: [1022, 1017, 1027, 976, 1032, 985, 1022, 985, 957, 977],
        categories: [
          'CATEGORY_0',
          'CATEGORY_1',
          'CATEGORY_2',
          'CATEGORY_3',
          'CATEGORY_4',
          'CATEGORY_5',
          'CATEGORY_6',
          'CATEGORY_7',
          'CATEGORY_8',
          'CATEGORY_9',
        ],
      },
    ];
    const sortMetadata: Parameters<typeof sortSeries>['1'] = {
      direction: EBarDirection.HORIZONTAL,
      sortState: { x: EBarSortState.ASCENDING, y: EBarSortState.NONE },
    };
    const sortedSeries = sortSeries(series, sortMetadata);
    expect(sortedSeries.length).toBe(series.length);
    expect(sortedSeries[0]).toEqual({
      categories: ['CATEGORY_8', 'CATEGORY_3', 'CATEGORY_9', 'CATEGORY_5', 'CATEGORY_7', 'CATEGORY_1', 'CATEGORY_0', 'CATEGORY_6', 'CATEGORY_2', 'CATEGORY_4'],
      data: [957, 976, 977, 985, 985, 1017, 1022, 1022, 1027, 1032],
    });
  });

  it('should sort the series correctly with a large data', () => {
    const series: Parameters<typeof sortSeries>['0'] = [
      {
        data: [104, 106, 111, 99, 117, 105, 93, 95, 96, 104],
        categories: [
          'CATEGORY_0',
          'CATEGORY_1',
          'CATEGORY_2',
          'CATEGORY_3',
          'CATEGORY_4',
          'CATEGORY_5',
          'CATEGORY_6',
          'CATEGORY_7',
          'CATEGORY_8',
          'CATEGORY_9',
        ],
      },
      {
        data: [84, 98, 107, 85, 119, 97, 91, 106, 97, 97],
        categories: [
          'CATEGORY_0',
          'CATEGORY_1',
          'CATEGORY_2',
          'CATEGORY_3',
          'CATEGORY_4',
          'CATEGORY_5',
          'CATEGORY_6',
          'CATEGORY_7',
          'CATEGORY_8',
          'CATEGORY_9',
        ],
      },
      {
        data: [87, 96, 96, 96, 81, 90, 111, 102, 104, 96],
        categories: [
          'CATEGORY_0',
          'CATEGORY_1',
          'CATEGORY_2',
          'CATEGORY_3',
          'CATEGORY_4',
          'CATEGORY_5',
          'CATEGORY_6',
          'CATEGORY_7',
          'CATEGORY_8',
          'CATEGORY_9',
        ],
      },
      {
        data: [97, 107, 109, 110, 110, 98, 86, 96, 98, 103],
        categories: [
          'CATEGORY_0',
          'CATEGORY_1',
          'CATEGORY_2',
          'CATEGORY_3',
          'CATEGORY_4',
          'CATEGORY_5',
          'CATEGORY_6',
          'CATEGORY_7',
          'CATEGORY_8',
          'CATEGORY_9',
        ],
      },
      {
        data: [98, 112, 106, 99, 93, 92, 100, 100, 81, 86],
        categories: [
          'CATEGORY_0',
          'CATEGORY_1',
          'CATEGORY_2',
          'CATEGORY_3',
          'CATEGORY_4',
          'CATEGORY_5',
          'CATEGORY_6',
          'CATEGORY_7',
          'CATEGORY_8',
          'CATEGORY_9',
        ],
      },
      {
        data: [110, 108, 96, 91, 98, 100, 108, 97, 89, 90],
        categories: [
          'CATEGORY_0',
          'CATEGORY_1',
          'CATEGORY_2',
          'CATEGORY_3',
          'CATEGORY_4',
          'CATEGORY_5',
          'CATEGORY_6',
          'CATEGORY_7',
          'CATEGORY_8',
          'CATEGORY_9',
        ],
      },
      {
        data: [116, 100, 115, 85, 102, 104, 99, 93, 111, 114],
        categories: [
          'CATEGORY_0',
          'CATEGORY_1',
          'CATEGORY_2',
          'CATEGORY_3',
          'CATEGORY_4',
          'CATEGORY_5',
          'CATEGORY_6',
          'CATEGORY_7',
          'CATEGORY_8',
          'CATEGORY_9',
        ],
      },
      {
        data: [102, 90, 104, 116, 88, 88, 115, 91, 90, 86],
        categories: [
          'CATEGORY_0',
          'CATEGORY_1',
          'CATEGORY_2',
          'CATEGORY_3',
          'CATEGORY_4',
          'CATEGORY_5',
          'CATEGORY_6',
          'CATEGORY_7',
          'CATEGORY_8',
          'CATEGORY_9',
        ],
      },
      {
        data: [114, 102, 90, 101, 112, 96, 111, 112, 80, 102],
        categories: [
          'CATEGORY_0',
          'CATEGORY_1',
          'CATEGORY_2',
          'CATEGORY_3',
          'CATEGORY_4',
          'CATEGORY_5',
          'CATEGORY_6',
          'CATEGORY_7',
          'CATEGORY_8',
          'CATEGORY_9',
        ],
      },
      {
        data: [110, 98, 93, 94, 112, 115, 108, 93, 111, 99],
        categories: [
          'CATEGORY_0',
          'CATEGORY_1',
          'CATEGORY_2',
          'CATEGORY_3',
          'CATEGORY_4',
          'CATEGORY_5',
          'CATEGORY_6',
          'CATEGORY_7',
          'CATEGORY_8',
          'CATEGORY_9',
        ],
      },
    ];
    const sortMetadata: Parameters<typeof sortSeries>['1'] = {
      direction: EBarDirection.HORIZONTAL,
      sortState: { x: EBarSortState.DESCENDING, y: EBarSortState.NONE },
    };
    const sortedSeries = sortSeries(series, sortMetadata);
    expect(sortedSeries.length).toBe(series.length);
    expect(sortedSeries).toEqual([
      {
        categories: [
          'CATEGORY_4',
          'CATEGORY_2',
          'CATEGORY_0',
          'CATEGORY_6',
          'CATEGORY_1',
          'CATEGORY_5',
          'CATEGORY_7',
          'CATEGORY_9',
          'CATEGORY_3',
          'CATEGORY_8',
        ],
        data: [117, 111, 104, 93, 106, 105, 95, 104, 99, 96],
      },
      {
        categories: [
          'CATEGORY_4',
          'CATEGORY_2',
          'CATEGORY_0',
          'CATEGORY_6',
          'CATEGORY_1',
          'CATEGORY_5',
          'CATEGORY_7',
          'CATEGORY_9',
          'CATEGORY_3',
          'CATEGORY_8',
        ],
        data: [119, 107, 84, 91, 98, 97, 106, 97, 85, 97],
      },
      {
        categories: [
          'CATEGORY_4',
          'CATEGORY_2',
          'CATEGORY_0',
          'CATEGORY_6',
          'CATEGORY_1',
          'CATEGORY_5',
          'CATEGORY_7',
          'CATEGORY_9',
          'CATEGORY_3',
          'CATEGORY_8',
        ],
        data: [81, 96, 87, 111, 96, 90, 102, 96, 96, 104],
      },
      {
        categories: [
          'CATEGORY_4',
          'CATEGORY_2',
          'CATEGORY_0',
          'CATEGORY_6',
          'CATEGORY_1',
          'CATEGORY_5',
          'CATEGORY_7',
          'CATEGORY_9',
          'CATEGORY_3',
          'CATEGORY_8',
        ],
        data: [110, 109, 97, 86, 107, 98, 96, 103, 110, 98],
      },
      {
        categories: [
          'CATEGORY_4',
          'CATEGORY_2',
          'CATEGORY_0',
          'CATEGORY_6',
          'CATEGORY_1',
          'CATEGORY_5',
          'CATEGORY_7',
          'CATEGORY_9',
          'CATEGORY_3',
          'CATEGORY_8',
        ],
        data: [93, 106, 98, 100, 112, 92, 100, 86, 99, 81],
      },
      {
        categories: [
          'CATEGORY_4',
          'CATEGORY_2',
          'CATEGORY_0',
          'CATEGORY_6',
          'CATEGORY_1',
          'CATEGORY_5',
          'CATEGORY_7',
          'CATEGORY_9',
          'CATEGORY_3',
          'CATEGORY_8',
        ],
        data: [98, 96, 110, 108, 108, 100, 97, 90, 91, 89],
      },
      {
        categories: [
          'CATEGORY_4',
          'CATEGORY_2',
          'CATEGORY_0',
          'CATEGORY_6',
          'CATEGORY_1',
          'CATEGORY_5',
          'CATEGORY_7',
          'CATEGORY_9',
          'CATEGORY_3',
          'CATEGORY_8',
        ],
        data: [102, 115, 116, 99, 100, 104, 93, 114, 85, 111],
      },
      {
        categories: [
          'CATEGORY_4',
          'CATEGORY_2',
          'CATEGORY_0',
          'CATEGORY_6',
          'CATEGORY_1',
          'CATEGORY_5',
          'CATEGORY_7',
          'CATEGORY_9',
          'CATEGORY_3',
          'CATEGORY_8',
        ],
        data: [88, 104, 102, 115, 90, 88, 91, 86, 116, 90],
      },
      {
        categories: [
          'CATEGORY_4',
          'CATEGORY_2',
          'CATEGORY_0',
          'CATEGORY_6',
          'CATEGORY_1',
          'CATEGORY_5',
          'CATEGORY_7',
          'CATEGORY_9',
          'CATEGORY_3',
          'CATEGORY_8',
        ],
        data: [112, 90, 114, 111, 102, 96, 112, 102, 101, 80],
      },
      {
        categories: [
          'CATEGORY_4',
          'CATEGORY_2',
          'CATEGORY_0',
          'CATEGORY_6',
          'CATEGORY_1',
          'CATEGORY_5',
          'CATEGORY_7',
          'CATEGORY_9',
          'CATEGORY_3',
          'CATEGORY_8',
        ],
        data: [112, 93, 110, 108, 98, 115, 93, 99, 94, 111],
      },
    ]);
  });
});
